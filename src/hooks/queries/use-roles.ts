import {
  useMutation,
  useQuery,
  useQueryClient,
  type UseMutationOptions,
  type UseQueryOptions,
} from "@tanstack/react-query";
import type { AxiosError } from "axios";

import {
  createRole,
  getPermissions,
  getRoles,
  updateRolePermissions,
  type CreateRolePayload,
  type PermissionDefinition,
  type RoleSummary,
  type UpdateRolePermissionsPayload,
} from "@/services/api";

export const ROLES_QUERY_KEY = ["roles"] as const;
export const PERMISSIONS_QUERY_KEY = ["permissions"] as const;

export type RolesQueryError = AxiosError<{ message?: string }>;
export type PermissionsQueryError = AxiosError<{ message?: string }>;
export type CreateRoleMutationError = AxiosError<{ message?: string }>;
export type UpdateRolePermissionsMutationError = AxiosError<{
  message?: string;
}>;

export const useRolesQuery = (
  options?: UseQueryOptions<
    RoleSummary[],
    RolesQueryError,
    RoleSummary[],
    typeof ROLES_QUERY_KEY
  >,
) =>
  useQuery<
    RoleSummary[],
    RolesQueryError,
    RoleSummary[],
    typeof ROLES_QUERY_KEY
  >({
    queryKey: ROLES_QUERY_KEY,
    queryFn: getRoles,
    ...options,
  });

export const usePermissionsQuery = (
  options?: UseQueryOptions<
    PermissionDefinition[],
    PermissionsQueryError,
    PermissionDefinition[],
    typeof PERMISSIONS_QUERY_KEY
  >,
) =>
  useQuery<
    PermissionDefinition[],
    PermissionsQueryError,
    PermissionDefinition[],
    typeof PERMISSIONS_QUERY_KEY
  >({
    queryKey: PERMISSIONS_QUERY_KEY,
    queryFn: getPermissions,
    ...options,
  });

export const useCreateRoleMutation = (
  options?: UseMutationOptions<
    RoleSummary,
    CreateRoleMutationError,
    CreateRolePayload,
    unknown
  >,
) => {
  const queryClient = useQueryClient();

  return useMutation<
    RoleSummary,
    CreateRoleMutationError,
    CreateRolePayload,
    unknown
  >({
    mutationFn: createRole,
    ...options,
    onSettled: (data, error, variables, onMutateResult, context) => {
      void queryClient.invalidateQueries({ queryKey: ROLES_QUERY_KEY });
      return options?.onSettled?.(
        data,
        error,
        variables,
        onMutateResult,
        context,
      );
    },
  });
};

export const useUpdateRolePermissionsMutation = (
  options?: UseMutationOptions<
    RoleSummary,
    UpdateRolePermissionsMutationError,
    { roleId: string; payload: UpdateRolePermissionsPayload },
    unknown
  >,
) => {
  const queryClient = useQueryClient();

  return useMutation<
    RoleSummary,
    UpdateRolePermissionsMutationError,
    { roleId: string; payload: UpdateRolePermissionsPayload },
    unknown
  >({
    mutationFn: ({ roleId, payload }) =>
      updateRolePermissions({ roleId, payload }),
    ...options,
    onSettled: (data, error, variables, onMutateResult, context) => {
      void queryClient.invalidateQueries({ queryKey: ROLES_QUERY_KEY });
      return options?.onSettled?.(
        data,
        error,
        variables,
        onMutateResult,
        context,
      );
    },
  });
};
