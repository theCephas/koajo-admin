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
  updateAccountNotifications,
  type AccountAchievementsResponse,
  type AccountDetails,
  type AccountsQueryParams,
  type AccountsResponse,
  type UpdateAccountNotificationsPayload,
  type UpdateAccountNotificationsResponse,
} from "@/services/api";

export type AccountsQueryError = AxiosError<{ message?: string }>;
export type AccountQueryError = AxiosError<{ message?: string }>;
export type AccountAchievementsQueryError = AxiosError<{ message?: string }>;
export type UpdateAccountNotificationsError = AxiosError<{ message?: string }>;

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
