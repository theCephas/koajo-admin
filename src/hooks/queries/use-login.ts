import { useMutation, type UseMutationOptions } from "@tanstack/react-query";
import type { AxiosError } from "axios";

import {
  login,
  type LoginPayload,
  type LoginResponse,
  changePassword,
  type ChangePasswordPayload,
  type ChangePasswordResponse,
} from "@/services/api";

export type LoginMutationError = AxiosError<{ message?: string }>;
export type ChangePasswordMutationError = AxiosError<{ message?: string }>;

export const useLoginMutation = (
  options?: UseMutationOptions<LoginResponse, LoginMutationError, LoginPayload>,
) =>
  useMutation<LoginResponse, LoginMutationError, LoginPayload>({
    mutationFn: login,
    ...options,
  });

export const useChangePasswordMutation = (
  options?: UseMutationOptions<
    ChangePasswordResponse,
    ChangePasswordMutationError,
    ChangePasswordPayload
  >,
) =>
  useMutation<
    ChangePasswordResponse,
    ChangePasswordMutationError,
    ChangePasswordPayload
  >({
    mutationFn: changePassword,
    ...options,
  });
