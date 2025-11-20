import { useQuery, type UseQueryOptions } from "@tanstack/react-query";
import type { AxiosError } from "axios";

import { getAdminProfile, type AdminProfile } from "@/services/api";

export type AdminProfileQueryError = AxiosError<{ message?: string }>;

const ADMIN_PROFILE_QUERY_KEY = ["admin", "profile"] as const;

export const useAdminProfileQuery = (
  options?: UseQueryOptions<
    AdminProfile,
    AdminProfileQueryError,
    AdminProfile,
    typeof ADMIN_PROFILE_QUERY_KEY
  >,
) =>
  useQuery<
    AdminProfile,
    AdminProfileQueryError,
    AdminProfile,
    typeof ADMIN_PROFILE_QUERY_KEY
  >({
    queryKey: ADMIN_PROFILE_QUERY_KEY,
    queryFn: () => getAdminProfile(),
    staleTime: 5 * 60 * 1000, // 5 minutes
    ...options,
  });
