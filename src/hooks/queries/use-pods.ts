import {
  useMutation,
  useQuery,
  useQueryClient,
  type UseMutationOptions,
  type UseQueryOptions,
} from "@tanstack/react-query";
import type { AxiosError } from "axios";

import {
  getPodById,
  getPods,
  getPodStats,
  swapPodPayouts,
  type PodDetails,
  type PodsQueryParams,
  type PodsResponse,
  type PodsStatsResponse,
  type SwapPayoutPayload,
  type SwapPayoutResponse,
} from "@/services/api";

export type PodsQueryError = AxiosError<{ message?: string }>;
export type PodQueryError = AxiosError<{ message?: string }>;
export type PodStatsQueryError = AxiosError<{ message?: string }>;

const PODS_QUERY_KEY = ["pods"];
const PODS_STATS_QUERY_KEY = ["pods", "stats"] as const;

export const podsQueryKey = (params: PodsQueryParams = {}) =>
  [
    ...PODS_QUERY_KEY,
    {
      search: params.search ?? "",
      status: params.status ?? "",
      limit: params.limit ?? 20,
      offset: params.offset ?? 0,
    },
  ] as const;

export const usePodsQuery = (
  params: PodsQueryParams,
  options?: UseQueryOptions<PodsResponse, PodsQueryError, PodsResponse>,
) =>
  useQuery<PodsResponse, PodsQueryError>({
    queryKey: podsQueryKey(params),
    queryFn: () => getPods(params),
    ...options,
  });

export const podQueryKey = (podId: string) => ["pod", podId] as const;

export const usePodQuery = (
  podId: string,
  options?: UseQueryOptions<PodDetails, PodQueryError, PodDetails>,
) =>
  useQuery<PodDetails, PodQueryError>({
    queryKey: podQueryKey(podId),
    queryFn: () => getPodById(podId),
    enabled: Boolean(podId),
    ...options,
  });

export const usePodStatsQuery = (
  options?: UseQueryOptions<
    PodsStatsResponse,
    PodStatsQueryError,
    PodsStatsResponse,
    typeof PODS_STATS_QUERY_KEY
  >,
) =>
  useQuery<
    PodsStatsResponse,
    PodStatsQueryError,
    PodsStatsResponse,
    typeof PODS_STATS_QUERY_KEY
  >({
    queryKey: PODS_STATS_QUERY_KEY,
    queryFn: () => getPodStats(),
    staleTime: 5 * 60 * 1000,
    ...options,
  });

export type SwapPayoutMutationError = AxiosError<{ message?: string }>;

export const useSwapPodPayoutsMutation = (
  podId: string,
  options?: UseMutationOptions<
    SwapPayoutResponse,
    SwapPayoutMutationError,
    SwapPayoutPayload
  >,
) => {
  const queryClient = useQueryClient();

  return useMutation<
    SwapPayoutResponse,
    SwapPayoutMutationError,
    SwapPayoutPayload
  >({
    mutationFn: (payload) => swapPodPayouts(podId, payload),
    onSuccess: async (data, variables, context) => {
      await queryClient.invalidateQueries({ queryKey: podQueryKey(podId) });
      if (options?.onSuccess) {
        await options.onSuccess(data, variables, context);
      }
    },
    ...options,
  });
};
