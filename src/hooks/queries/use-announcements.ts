import {
  useMutation,
  useQuery,
  useQueryClient,
  type UseMutationOptions,
  type UseQueryOptions,
} from "@tanstack/react-query";
import type { AxiosError } from "axios";

import {
  createAnnouncement,
  getAnnouncements,
  type AnnouncementsQueryParams,
  type AnnouncementsResponse,
  type AnnouncementResponse,
  type CreateAnnouncementPayload,
} from "@/services/api";

export type CreateAnnouncementError = AxiosError<{ message?: string }>;
export type AnnouncementsQueryError = AxiosError<{ message?: string }>;

const ANNOUNCEMENTS_QUERY_KEY = ["announcements"] as const;

export const announcementsQueryKey = (params: AnnouncementsQueryParams = {}) =>
  [
    ...ANNOUNCEMENTS_QUERY_KEY,
    {
      search: params.search ?? "",
      limit: params.limit ?? 50,
      offset: params.offset ?? 0,
    },
  ] as const;

export const useAnnouncementsQuery = (
  params: AnnouncementsQueryParams,
  options?: UseQueryOptions<
    AnnouncementsResponse,
    AnnouncementsQueryError,
    AnnouncementsResponse,
    ReturnType<typeof announcementsQueryKey>
  >,
) =>
  useQuery<
    AnnouncementsResponse,
    AnnouncementsQueryError,
    AnnouncementsResponse,
    ReturnType<typeof announcementsQueryKey>
  >({
    queryKey: announcementsQueryKey(params),
    queryFn: () => getAnnouncements(params),
    staleTime: 2 * 60 * 1000,
    ...options,
  });

export const useCreateAnnouncementMutation = (
  options?: UseMutationOptions<
    AnnouncementResponse,
    CreateAnnouncementError,
    CreateAnnouncementPayload
  >,
) => {
  const queryClient = useQueryClient();

  return useMutation<
    AnnouncementResponse,
    CreateAnnouncementError,
    CreateAnnouncementPayload
  >({
    mutationFn: createAnnouncement,
    onSuccess: (data, variables, context) => {
      void queryClient.invalidateQueries({
        queryKey: ANNOUNCEMENTS_QUERY_KEY,
      });

      return options?.onSuccess?.(data, variables, context);
    },
    ...options,
  });
};
