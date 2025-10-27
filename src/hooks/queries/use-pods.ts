import { useQuery, type UseQueryOptions } from "@tanstack/react-query";
import type { AxiosError } from "axios";

import {
  getPodById,
  getPods,
  type PodDetails,
  type PodsQueryParams,
  type PodsResponse,
} from "@/services/api";

export type PodsQueryError = AxiosError<{ message?: string }>;
export type PodQueryError = AxiosError<{ message?: string }>;

const PODS_QUERY_KEY = ["pods"];

export const podsQueryKey = (params: PodsQueryParams = {}) =>
  [
    ...PODS_QUERY_KEY,
    {
      search: params.search ?? "",
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
