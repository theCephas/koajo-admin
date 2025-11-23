import {
  useQuery,
  useMutation,
  useQueryClient,
  type UseQueryOptions,
} from "@tanstack/react-query";
import type { AxiosError } from "axios";

import {
  getPayouts,
  markPayoutAsPaid,
  updatePayoutStatus,
  type PayoutsQueryParams,
  type PayoutsResponse,
  type MarkPayoutAsPaidPayload,
  type MarkPayoutAsPaidResponse,
  type UpdatePayoutStatusPayload,
  type UpdatePayoutStatusResponse,
} from "@/services/api";

export type PayoutsQueryError = AxiosError<{ message?: string }>;

const PAYOUTS_QUERY_KEY = ["payouts"];

export const payoutsQueryKey = (params: PayoutsQueryParams = {}) =>
  [
    ...PAYOUTS_QUERY_KEY,
    {
      limit: params.limit ?? 50,
      offset: params.offset ?? 0,
      timeframe: params.timeframe ?? "",
      status: params.status ?? "",
    },
  ] as const;

export const usePayoutsQuery = (
  params: PayoutsQueryParams = {},
  options?: UseQueryOptions<
    PayoutsResponse,
    PayoutsQueryError,
    PayoutsResponse,
    ReturnType<typeof payoutsQueryKey>
  >,
) =>
  useQuery<
    PayoutsResponse,
    PayoutsQueryError,
    PayoutsResponse,
    ReturnType<typeof payoutsQueryKey>
  >({
    queryKey: payoutsQueryKey(params),
    queryFn: () => getPayouts(params),
    ...options,
  });

export type MarkPayoutAsPaidError = AxiosError<{ message?: string }>;

export interface MarkPayoutAsPaidVariables {
  podId: string;
  payload: MarkPayoutAsPaidPayload;
}

export const useMarkPayoutAsPaidMutation = () => {
  const queryClient = useQueryClient();

  return useMutation<
    MarkPayoutAsPaidResponse,
    MarkPayoutAsPaidError,
    MarkPayoutAsPaidVariables
  >({
    mutationFn: ({ podId, payload }) => markPayoutAsPaid(podId, payload),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: PAYOUTS_QUERY_KEY });
    },
  });
};

export type UpdatePayoutStatusError = AxiosError<{ message?: string }>;

export interface UpdatePayoutStatusVariables {
  podId: string;
  payoutId: string;
  payload: UpdatePayoutStatusPayload;
}

export const useUpdatePayoutStatusMutation = () => {
  const queryClient = useQueryClient();

  return useMutation<
    UpdatePayoutStatusResponse,
    UpdatePayoutStatusError,
    UpdatePayoutStatusVariables
  >({
    mutationFn: ({ podId, payoutId, payload }) =>
      updatePayoutStatus(podId, payoutId, payload),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: PAYOUTS_QUERY_KEY });
    },
  });
};
