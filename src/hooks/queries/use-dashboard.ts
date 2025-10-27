import { useQuery, type UseQueryOptions } from "@tanstack/react-query";
import type { AxiosError } from "axios";

import { getDashboard, type DashboardResponse } from "@/services/api";

export type DashboardQueryError = AxiosError<{ message?: string }>;

const DASHBOARD_QUERY_KEY = ["dashboard"];

export const useDashboardQuery = (
  options?: UseQueryOptions<
    DashboardResponse,
    DashboardQueryError,
    DashboardResponse
  >,
) =>
  useQuery<DashboardResponse, DashboardQueryError>({
    queryKey: DASHBOARD_QUERY_KEY,
    queryFn: getDashboard,
    ...options,
  });

export const dashboardQueryKey = DASHBOARD_QUERY_KEY;
