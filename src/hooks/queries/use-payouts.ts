import { useQuery, type UseQueryOptions } from "@tanstack/react-query";
import type { AxiosError } from "axios";

import {
  getPayouts,
  type PayoutsQueryParams,
  type PayoutsResponse,
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
