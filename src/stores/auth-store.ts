import { create } from "zustand";
import { persist } from "zustand/middleware";

import type { LoginResponse } from "@/services/api";

interface AuthState {
  accessToken: string | null;
  tokenType: string | null;
  expiresAt: string | null;
  refreshToken: string | null;
  role: string | null;
  isSuperAdmin: boolean;
  rememberMe: boolean;
  isAuthenticated: boolean;
  setAuth: (payload: LoginResponse, options?: { rememberMe?: boolean }) => void;
  updateTokens: (tokens: {
    accessToken: string;
    tokenType?: string;
    expiresAt?: string;
    refreshToken?: string | null;
  }) => void;
  signOut: () => void;
}

const initialState: Omit<
  AuthState,
  "setAuth" | "updateTokens" | "signOut" | "isAuthenticated"
> = {
  accessToken: null,
  tokenType: null,
  expiresAt: null,
  refreshToken: null,
  role: null,
  isSuperAdmin: false,
  rememberMe: false,
};

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      ...initialState,
      isAuthenticated: false,
      setAuth: (payload, options) =>
        set(() => ({
          accessToken: payload.accessToken,
          tokenType: payload.tokenType,
          expiresAt: payload.expiresAt,
          refreshToken: payload.refreshToken ?? null,
          role: payload.role,
          isSuperAdmin: payload.isSuperAdmin,
          rememberMe: options?.rememberMe ?? false,
          isAuthenticated: true,
        })),
      updateTokens: ({ accessToken, tokenType, expiresAt, refreshToken }) =>
        set((state) => ({
          ...state,
          accessToken,
          tokenType: tokenType ?? state.tokenType,
          expiresAt: expiresAt ?? state.expiresAt,
          refreshToken:
            refreshToken === undefined ? state.refreshToken : refreshToken,
          isAuthenticated: Boolean(accessToken),
        })),
      signOut: () =>
        set(() => ({
          ...initialState,
          isAuthenticated: false,
        })),
    }),
    {
      name: "koajo-auth",
      partialize: (state) => ({
        rememberMe: state.rememberMe,
        ...(state.rememberMe
          ? {
              accessToken: state.accessToken,
              tokenType: state.tokenType,
              expiresAt: state.expiresAt,
              refreshToken: state.refreshToken,
              role: state.role,
              isSuperAdmin: state.isSuperAdmin,
              isAuthenticated: state.isAuthenticated,
            }
          : {
              accessToken: null,
              tokenType: null,
              expiresAt: null,
              refreshToken: null,
              role: null,
              isSuperAdmin: false,
              isAuthenticated: false,
            }),
      }),
    },
  ),
);
