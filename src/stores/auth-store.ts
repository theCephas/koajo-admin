import { create } from "zustand";
import { persist } from "zustand/middleware";

import type { LoginResponse } from "@/services/api";

interface AuthState {
  accessToken: string | null;
  tokenType: string | null;
  expiresAt: string | null;
  role: string | null;
  isSuperAdmin: boolean;
  isAuthenticated: boolean;
  setAuth: (payload: LoginResponse) => void;
  signOut: () => void;
}

const initialState: Omit<AuthState, "setAuth" | "signOut" | "isAuthenticated"> =
  {
    accessToken: null,
    tokenType: null,
    expiresAt: null,
    role: null,
    isSuperAdmin: false,
  };

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      ...initialState,
      isAuthenticated: false,
      setAuth: (payload) =>
        set(() => ({
          accessToken: payload.accessToken,
          tokenType: payload.tokenType,
          expiresAt: payload.expiresAt,
          role: payload.role,
          isSuperAdmin: payload.isSuperAdmin,
          isAuthenticated: true,
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
        accessToken: state.accessToken,
        tokenType: state.tokenType,
        expiresAt: state.expiresAt,
        role: state.role,
        isSuperAdmin: state.isSuperAdmin,
        isAuthenticated: state.isAuthenticated,
      }),
    },
  ),
);
