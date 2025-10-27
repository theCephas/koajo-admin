/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-argument */
import axios, { type AxiosInstance, type AxiosRequestConfig } from "axios";

import { useAuthStore } from "@/stores/auth-store";

const API_BASE_URL = "https://api.koajo.com/v1/admin";

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
    (error) => {
      if (error.response?.status === 401) {
        useAuthStore.getState().signOut();
      }

      return Promise.reject(error instanceof Error ? error : new Error(error));
    },
  );

  return instance;
};

export const apiClient = createApiClient();
