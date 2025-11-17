import {
  useMutation,
  useQuery,
  useQueryClient,
  type UseMutationOptions,
  type UseQueryOptions,
} from "@tanstack/react-query";
import type { AxiosError } from "axios";

import {
  getAccountAchievements,
  getAccountById,
  getAccounts,
  getAccountCurrentPods,
  updateAccountNotifications,
  updateAccountStatus,
  toggleAccountStatus,
  updateAccountFlags,
  removeAccountBankConnection,
  deleteAccount,
  type AccountAchievementsResponse,
  type AccountCurrentPodsResponse,
  type AccountDetails,
  type AccountsQueryParams,
  type AccountsResponse,
  type UpdateAccountNotificationsPayload,
  type UpdateAccountNotificationsResponse,
  type UpdateAccountStatusPayload,
  type UpdateAccountStatusResponse,
  type ToggleAccountStatusPayload,
  type ToggleAccountStatusResponse,
  type UpdateAccountFlagsPayload,
  type UpdateAccountFlagsResponse,
} from "@/services/api";

export type AccountsQueryError = AxiosError<{ message?: string }>;
export type AccountQueryError = AxiosError<{ message?: string }>;
export type AccountAchievementsQueryError = AxiosError<{ message?: string }>;
export type AccountCurrentPodsQueryError = AxiosError<{ message?: string }>;
export type UpdateAccountNotificationsError = AxiosError<{ message?: string }>;
export type UpdateAccountStatusError = AxiosError<{ message?: string }>;
export type ToggleAccountStatusError = AxiosError<{ message?: string }>;
export type UpdateAccountFlagsError = AxiosError<{ message?: string }>;
export type RemoveAccountBankConnectionError = AxiosError<{ message?: string }>;
export type DeleteAccountError = AxiosError<{ message?: string }>;

const ACCOUNTS_QUERY_KEY = ["accounts"] as const;

export const accountsQueryKey = (params: AccountsQueryParams = {}) =>
  [
    ...ACCOUNTS_QUERY_KEY,
    {
      search: params.search ?? "",
      limit: params.limit ?? 20,
      offset: params.offset ?? 0,
    },
  ] as const;

export const useAccountsQuery = (
  params: AccountsQueryParams,
  options?: UseQueryOptions<
    AccountsResponse,
    AccountsQueryError,
    AccountsResponse,
    ReturnType<typeof accountsQueryKey>
  >,
) =>
  useQuery<
    AccountsResponse,
    AccountsQueryError,
    AccountsResponse,
    ReturnType<typeof accountsQueryKey>
  >({
    queryKey: accountsQueryKey(params),
    queryFn: () => getAccounts(params),
    ...options,
  });

export const accountQueryKey = (accountId: string) =>
  ["account", accountId] as const;

export const useAccountQuery = (
  accountId: string,
  options?: UseQueryOptions<
    AccountDetails,
    AccountQueryError,
    AccountDetails,
    ReturnType<typeof accountQueryKey>
  >,
) =>
  useQuery<
    AccountDetails,
    AccountQueryError,
    AccountDetails,
    ReturnType<typeof accountQueryKey>
  >({
    queryKey: accountQueryKey(accountId),
    queryFn: () => getAccountById(accountId),
    enabled: Boolean(accountId),
    ...options,
  });

export const accountAchievementsQueryKey = (accountId: string) =>
  ["account-achievements", accountId] as const;

export const useAccountAchievementsQuery = (
  accountId: string,
  options?: UseQueryOptions<
    AccountAchievementsResponse,
    AccountAchievementsQueryError,
    AccountAchievementsResponse,
    ReturnType<typeof accountAchievementsQueryKey>
  >,
) =>
  useQuery<
    AccountAchievementsResponse,
    AccountAchievementsQueryError,
    AccountAchievementsResponse,
    ReturnType<typeof accountAchievementsQueryKey>
  >({
    queryKey: accountAchievementsQueryKey(accountId),
    queryFn: () => getAccountAchievements(accountId),
    enabled: Boolean(accountId),
    staleTime: 5 * 60 * 1000,
    ...options,
  });

export const accountCurrentPodsQueryKey = (accountId: string) =>
  ["account-current-pods", accountId] as const;

export const useAccountCurrentPodsQuery = (
  accountId: string,
  options?: UseQueryOptions<
    AccountCurrentPodsResponse,
    AccountCurrentPodsQueryError,
    AccountCurrentPodsResponse,
    ReturnType<typeof accountCurrentPodsQueryKey>
  >,
) =>
  useQuery<
    AccountCurrentPodsResponse,
    AccountCurrentPodsQueryError,
    AccountCurrentPodsResponse,
    ReturnType<typeof accountCurrentPodsQueryKey>
  >({
    queryKey: accountCurrentPodsQueryKey(accountId),
    queryFn: () => getAccountCurrentPods(accountId),
    enabled: Boolean(accountId),
    ...options,
  });

export const useUpdateAccountNotificationsMutation = (
  accountId: string,
  options?: UseMutationOptions<
    UpdateAccountNotificationsResponse,
    UpdateAccountNotificationsError,
    UpdateAccountNotificationsPayload,
    unknown
  >,
) => {
  const queryClient = useQueryClient();

  return useMutation<
    UpdateAccountNotificationsResponse,
    UpdateAccountNotificationsError,
    UpdateAccountNotificationsPayload,
    unknown
  >({
    mutationFn: (payload) =>
      updateAccountNotifications({
        accountId,
        payload,
      }),
    onSuccess: (data, variables, onMutateResult, context) => {
      queryClient.setQueryData<AccountDetails | undefined>(
        accountQueryKey(accountId),
        (prev) =>
          prev
            ? {
                ...prev,
                emailNotificationsEnabled: data.emailNotificationsEnabled,
                transactionNotificationsEnabled:
                  data.transactionNotificationsEnabled,
              }
            : prev,
      );

      void queryClient.invalidateQueries({ queryKey: ACCOUNTS_QUERY_KEY });

      return options?.onSuccess?.(data, variables, onMutateResult, context);
    },

    ...options,
  });
};

export const useUpdateAccountStatusMutation = (
  accountId: string,
  options?: UseMutationOptions<
    UpdateAccountStatusResponse,
    UpdateAccountStatusError,
    UpdateAccountStatusPayload,
    unknown
  >,
) => {
  const queryClient = useQueryClient();

  return useMutation<
    UpdateAccountStatusResponse,
    UpdateAccountStatusError,
    UpdateAccountStatusPayload,
    unknown
  >({
    mutationFn: (payload) =>
      updateAccountStatus({
        accountId,
        payload,
      }),
    onSuccess: (data, variables, onMutateResult, context) => {
      // Invalidate and refetch
      void queryClient.invalidateQueries({
        queryKey: accountQueryKey(accountId),
      });
      void queryClient.invalidateQueries({ queryKey: ACCOUNTS_QUERY_KEY });

      // Force immediate refetch
      void queryClient.refetchQueries({
        queryKey: accountQueryKey(accountId),
      });
      void queryClient.refetchQueries({ queryKey: ACCOUNTS_QUERY_KEY });

      return options?.onSuccess?.(data, variables, onMutateResult, context);
    },

    ...options,
  });
};

export const useToggleAccountStatusMutation = (
  accountId: string,
  options?: UseMutationOptions<
    ToggleAccountStatusResponse,
    ToggleAccountStatusError,
    ToggleAccountStatusPayload,
    unknown
  >,
) => {
  const queryClient = useQueryClient();

  return useMutation<
    ToggleAccountStatusResponse,
    ToggleAccountStatusError,
    ToggleAccountStatusPayload,
    unknown
  >({
    mutationFn: (payload) =>
      toggleAccountStatus({
        accountId,
        payload,
      }),
    onSuccess: (data, variables, onMutateResult, context) => {
      // Invalidate and refetch
      void queryClient.invalidateQueries({
        queryKey: accountQueryKey(accountId),
      });
      void queryClient.invalidateQueries({ queryKey: ACCOUNTS_QUERY_KEY });

      // Force immediate refetch
      void queryClient.refetchQueries({
        queryKey: accountQueryKey(accountId),
      });
      void queryClient.refetchQueries({ queryKey: ACCOUNTS_QUERY_KEY });

      return options?.onSuccess?.(data, variables, onMutateResult, context);
    },

    ...options,
  });
};

export const useUpdateAccountFlagsMutation = (
  accountId: string,
  options?: UseMutationOptions<
    UpdateAccountFlagsResponse,
    UpdateAccountFlagsError,
    UpdateAccountFlagsPayload,
    unknown
  >,
) => {
  const queryClient = useQueryClient();

  return useMutation<
    UpdateAccountFlagsResponse,
    UpdateAccountFlagsError,
    UpdateAccountFlagsPayload,
    unknown
  >({
    mutationFn: (payload) =>
      updateAccountFlags({
        accountId,
        payload,
      }),
    onSuccess: (data, variables, onMutateResult, context) => {
      // Invalidate and refetch
      void queryClient.invalidateQueries({
        queryKey: accountQueryKey(accountId),
      });
      void queryClient.invalidateQueries({ queryKey: ACCOUNTS_QUERY_KEY });

      // Force immediate refetch
      void queryClient.refetchQueries({
        queryKey: accountQueryKey(accountId),
      });
      void queryClient.refetchQueries({ queryKey: ACCOUNTS_QUERY_KEY });

      return options?.onSuccess?.(data, variables, onMutateResult, context);
    },

    ...options,
  });
};

export const useRemoveAccountBankConnectionMutation = (
  accountId: string,
  options?: UseMutationOptions<
    void,
    RemoveAccountBankConnectionError,
    void,
    unknown
  >,
) => {
  const queryClient = useQueryClient();

  return useMutation<void, RemoveAccountBankConnectionError, void, unknown>({
    mutationFn: () => removeAccountBankConnection(accountId),
    onSuccess: (data, variables, onMutateResult, context) => {
      void queryClient.invalidateQueries({
        queryKey: accountQueryKey(accountId),
      });
      void queryClient.invalidateQueries({ queryKey: ACCOUNTS_QUERY_KEY });

      return options?.onSuccess?.(data, variables, onMutateResult, context);
    },
    ...options,
  });
};

export const useDeleteAccountMutation = (
  accountId: string,
  options?: UseMutationOptions<void, DeleteAccountError, void, unknown>,
) => {
  const queryClient = useQueryClient();

  return useMutation<void, DeleteAccountError, void, unknown>({
    mutationFn: () => deleteAccount(accountId),
    onSuccess: (data, variables, onMutateResult, context) => {
      // Invalidate and refetch
      void queryClient.invalidateQueries({ queryKey: ACCOUNTS_QUERY_KEY });

      // Force immediate refetch
      void queryClient.refetchQueries({ queryKey: ACCOUNTS_QUERY_KEY });

      return options?.onSuccess?.(data, variables, onMutateResult, context);
    },
    ...options,
  });
};
