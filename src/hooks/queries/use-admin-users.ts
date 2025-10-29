import {
  useMutation,
  useQuery,
  useQueryClient,
  type UseMutationOptions,
  type UseQueryOptions,
} from "@tanstack/react-query";
import type { AxiosError } from "axios";

import {
  createAdminUser,
  deleteAdminUser,
  getAdminUserById,
  getAdminUsers,
  updateAdminUser,
  updateAdminUserRoles,
  updateAdminUserPermissions,
  type AdminUserDetails,
  type AdminUserSummary,
  type CreateAdminUserPayload,
  type UpdateAdminUserPayload,
  type UpdateAdminUserRolesPayload,
  type UpdateAdminUserPermissionsPayload,
} from "@/services/api";

export const ADMIN_USERS_QUERY_KEY = ["admin-users"] as const;
export const ADMIN_USER_DETAIL_QUERY_KEY = (adminId: string) =>
  [...ADMIN_USERS_QUERY_KEY, adminId] as const;

export type AdminUsersQueryError = AxiosError<{ message?: string }>;
export type AdminUserQueryError = AxiosError<{ message?: string }>;
export type CreateAdminUserMutationError = AxiosError<{ message?: string }>;
export type UpdateAdminUserMutationError = AxiosError<{ message?: string }>;
export type DeleteAdminUserMutationError = AxiosError<{ message?: string }>;

export const useAdminUsersQuery = (
  options?: UseQueryOptions<
    AdminUserSummary[],
    AdminUsersQueryError,
    AdminUserSummary[],
    typeof ADMIN_USERS_QUERY_KEY
  >,
) =>
  useQuery<
    AdminUserSummary[],
    AdminUsersQueryError,
    AdminUserSummary[],
    typeof ADMIN_USERS_QUERY_KEY
  >({
    queryKey: ADMIN_USERS_QUERY_KEY,
    queryFn: getAdminUsers,
    ...options,
  });

export const useAdminUserQuery = (
  adminId: string | undefined,
  options?: UseQueryOptions<
    AdminUserDetails,
    AdminUserQueryError,
    AdminUserDetails,
    ReturnType<typeof ADMIN_USER_DETAIL_QUERY_KEY>
  >,
) =>
  useQuery<
    AdminUserDetails,
    AdminUserQueryError,
    AdminUserDetails,
    ReturnType<typeof ADMIN_USER_DETAIL_QUERY_KEY>
  >({
    queryKey: ADMIN_USER_DETAIL_QUERY_KEY(adminId ?? ""),
    queryFn: () => {
      if (!adminId) throw new Error("Admin ID is required");
      return getAdminUserById(adminId);
    },
    enabled: Boolean(adminId),
    ...options,
  });

export const useCreateAdminUserMutation = (
  options?: UseMutationOptions<
    AdminUserDetails,
    CreateAdminUserMutationError,
    CreateAdminUserPayload,
    unknown
  >,
) => {
  const queryClient = useQueryClient();

  return useMutation<
    AdminUserDetails,
    CreateAdminUserMutationError,
    CreateAdminUserPayload,
    unknown
  >({
    mutationFn: createAdminUser,
    ...options,
    onSettled: (data, error, variables, onMutateResult, context) => {
      void queryClient.invalidateQueries({ queryKey: ADMIN_USERS_QUERY_KEY });
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

export const useUpdateAdminUserMutation = (
  options?: UseMutationOptions<
    AdminUserDetails,
    UpdateAdminUserMutationError,
    { adminId: string; payload: UpdateAdminUserPayload },
    unknown
  >,
) => {
  const queryClient = useQueryClient();

  return useMutation<
    AdminUserDetails,
    UpdateAdminUserMutationError,
    { adminId: string; payload: UpdateAdminUserPayload },
    unknown
  >({
    mutationFn: ({ adminId, payload }) => updateAdminUser({ adminId, payload }),
    ...options,
    onSettled: (data, error, variables, onMutateResult, context) => {
      void queryClient.invalidateQueries({ queryKey: ADMIN_USERS_QUERY_KEY });
      if (variables?.adminId) {
        void queryClient.invalidateQueries({
          queryKey: ADMIN_USER_DETAIL_QUERY_KEY(variables.adminId),
        });
      }

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

export const useDeleteAdminUserMutation = (
  options?: UseMutationOptions<
    void,
    DeleteAdminUserMutationError,
    { adminId: string },
    unknown
  >,
) => {
  const queryClient = useQueryClient();

  return useMutation<
    void,
    DeleteAdminUserMutationError,
    { adminId: string },
    unknown
  >({
    mutationFn: ({ adminId }) => deleteAdminUser(adminId),
    ...options,
    onSettled: (data, error, variables, onMutateResult, context) => {
      void queryClient.invalidateQueries({ queryKey: ADMIN_USERS_QUERY_KEY });
      if (variables?.adminId) {
        void queryClient.invalidateQueries({
          queryKey: ADMIN_USER_DETAIL_QUERY_KEY(variables.adminId),
        });
      }
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

export const useReplaceAdminRolesMutation = (
  options?: UseMutationOptions<
    AdminUserDetails,
    UpdateAdminUserMutationError,
    { adminId: string; payload: UpdateAdminUserRolesPayload },
    unknown
  >,
) => {
  const queryClient = useQueryClient();
  return useMutation<
    AdminUserDetails,
    UpdateAdminUserMutationError,
    { adminId: string; payload: UpdateAdminUserRolesPayload },
    unknown
  >({
    mutationFn: ({ adminId, payload }) =>
      updateAdminUserRoles({ adminId, payload }),
    ...options,
    onSettled: (data, error, variables, onMutateResult, context) => {
      void queryClient.invalidateQueries({ queryKey: ADMIN_USERS_QUERY_KEY });
      if (variables?.adminId) {
        void queryClient.invalidateQueries({
          queryKey: ADMIN_USER_DETAIL_QUERY_KEY(variables.adminId),
        });
      }
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

export const useAdjustAdminPermissionsMutation = (
  options?: UseMutationOptions<
    AdminUserDetails,
    UpdateAdminUserMutationError,
    { adminId: string; payload: UpdateAdminUserPermissionsPayload },
    unknown
  >,
) => {
  const queryClient = useQueryClient();
  return useMutation<
    AdminUserDetails,
    UpdateAdminUserMutationError,
    { adminId: string; payload: UpdateAdminUserPermissionsPayload },
    unknown
  >({
    mutationFn: ({ adminId, payload }) =>
      updateAdminUserPermissions({ adminId, payload }),
    ...options,
    onSettled: (data, error, variables, onMutateResult, context) => {
      void queryClient.invalidateQueries({ queryKey: ADMIN_USERS_QUERY_KEY });
      if (variables?.adminId) {
        void queryClient.invalidateQueries({
          queryKey: ADMIN_USER_DETAIL_QUERY_KEY(variables.adminId),
        });
      }
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
