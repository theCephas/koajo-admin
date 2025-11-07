 
 

import axios, {
  type AxiosInstance,
  type AxiosRequestConfig,
  type AxiosError,
} from "axios";
import { toast } from "sonner";
import type { LoginResponse } from "@/services/api";

import { useAuthStore } from "@/stores/auth-store";

const API_BASE_URL = "https://api.koajo.com/v1/admin";

const REFRESH_ENDPOINT = "/auth/refresh";

interface PendingRequest {
  resolve: (value?: unknown) => void;
  reject: (reason?: unknown) => void;
}

type RetriableRequestConfig = AxiosRequestConfig & { _retry?: boolean };

class TokenRefresher {
  private isRefreshing = false;
  private queue: PendingRequest[] = [];

  enqueue(cb: PendingRequest) {
    this.queue.push(cb);
  }

  resolveQueue(value: unknown) {
    this.queue.forEach(({ resolve }) => resolve(value));
    this.queue = [];
  }

  rejectQueue(error: unknown) {
    this.queue.forEach(({ reject }) => reject(error));
    this.queue = [];
  }

  async refresh(instance: AxiosInstance) {
    if (this.isRefreshing) return;

    this.isRefreshing = true;
    const { refreshToken } = useAuthStore.getState();

    if (!refreshToken) {
      this.rejectQueue(new Error("No refresh token available"));
      toast.error("Session expired. Please sign in again.");
      this.isRefreshing = false;
      useAuthStore.getState().signOut();
      return;
    }

    try {
      const { data } = await instance.post<LoginResponse>(REFRESH_ENDPOINT, {
        refreshToken: refreshToken,
      });

      useAuthStore.getState().updateTokens({
        accessToken: data.accessToken,
        tokenType: data.tokenType,
        expiresAt: data.expiresAt,
        refreshToken: data.refreshToken ?? refreshToken,
      });

      this.resolveQueue(data.accessToken);
    } catch (error) {
      this.rejectQueue(error);
      toast.error("Session expired. Please sign in again.");
      useAuthStore.getState().signOut();
    } finally {
      this.isRefreshing = false;
    }
  }
}

const tokenRefresher = new TokenRefresher();

export const createApiClient = (
  config: AxiosRequestConfig = {},
): AxiosInstance => {
  const instance = axios.create({
    baseURL: API_BASE_URL,
    headers: {
      "Content-Type": "application/json",
    },
    ...config,
  });

  instance.interceptors.request.use((request) => {
    const { accessToken, tokenType } = useAuthStore.getState();

    if (accessToken && tokenType) {
      request.headers = request.headers ?? {};
      request.headers.Authorization = `${tokenType} ${accessToken}`;
    }

    return request;
  });

  instance.interceptors.response.use(
    (response) => response,
    async (error: AxiosError) => {
      if (error.response?.status !== 401) {
        return Promise.reject(error);
      }

      const originalRequest = error.config as
        | RetriableRequestConfig
        | undefined;

      if (!originalRequest || originalRequest._retry) {
        useAuthStore.getState().signOut();
        return Promise.reject(error);
      }

      originalRequest._retry = true;

      const refreshPromise = new Promise((resolve, reject) => {
        tokenRefresher.enqueue({ resolve, reject });
      });

      await tokenRefresher.refresh(instance);

      return refreshPromise
        .then(() => instance(originalRequest))
        .catch((refreshError) =>
          Promise.reject(
            refreshError instanceof Error
              ? refreshError
              : new Error(String(refreshError)),
          ),
        );
    },
  );

  return instance;
};

export const apiClient = createApiClient();
