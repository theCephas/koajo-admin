import { useMutation, type UseMutationOptions } from "@tanstack/react-query";
import type { AxiosError } from "axios";

import { login, type LoginPayload, type LoginResponse } from "@/services/api";

export type LoginMutationError = AxiosError<{ message?: string }>;

export const useLoginMutation = (
  options?: UseMutationOptions<LoginResponse, LoginMutationError, LoginPayload>,
) =>
  useMutation<LoginResponse, LoginMutationError, LoginPayload>({
    mutationFn: login,
    ...options,
  });
