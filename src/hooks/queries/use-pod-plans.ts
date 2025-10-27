import {
  useMutation,
  useQuery,
  useQueryClient,
  type UseMutationOptions,
  type UseQueryOptions,
} from "@tanstack/react-query";
import type { AxiosError } from "axios";

import {
  createPodPlan,
  deletePodPlan,
  getPodPlans,
  updatePodPlan,
  type PodPlanPayload,
  type PodPlanSummary,
  type PodPlansQueryParams,
  type PodPlansResponse,
} from "@/services/api";

export type PodPlansQueryError = AxiosError<{ message?: string }>;
export type PodPlanMutationError = AxiosError<{ message?: string }>;

const POD_PLANS_QUERY_KEY = ["pod-plans"] as const;

export const podPlansQueryKey = (params: PodPlansQueryParams = {}) =>
  [
    ...POD_PLANS_QUERY_KEY,
    {
      search: params.search ?? "",
      limit: params.limit ?? 20,
      offset: params.offset ?? 0,
    },
  ] as const;

export const usePodPlansQuery = (
  params: PodPlansQueryParams,
  options?: UseQueryOptions<
    PodPlansResponse,
    PodPlansQueryError,
    PodPlansResponse,
    ReturnType<typeof podPlansQueryKey>
  >,
) =>
  useQuery<
    PodPlansResponse,
    PodPlansQueryError,
    PodPlansResponse,
    ReturnType<typeof podPlansQueryKey>
  >({
    queryKey: podPlansQueryKey(params),
    queryFn: () => getPodPlans(params),
    ...options,
  });

export const useCreatePodPlanMutation = (
  options?: UseMutationOptions<
    PodPlanSummary,
    PodPlanMutationError,
    PodPlanPayload,
    unknown
  >,
) => {
  const queryClient = useQueryClient();

  return useMutation<
    PodPlanSummary,
    PodPlanMutationError,
    PodPlanPayload,
    unknown
  >({
    mutationFn: createPodPlan,
    ...options,
    onSettled: (data, error, variables, onMutateResult, context) => {
      void queryClient.invalidateQueries({ queryKey: POD_PLANS_QUERY_KEY });

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

export const useUpdatePodPlanMutation = (
  options?: UseMutationOptions<
    PodPlanSummary,
    PodPlanMutationError,
    { planId: string; payload: PodPlanPayload },
    unknown
  >,
) => {
  const queryClient = useQueryClient();

  return useMutation<
    PodPlanSummary,
    PodPlanMutationError,
    { planId: string; payload: PodPlanPayload },
    unknown
  >({
    mutationFn: updatePodPlan,
    ...options,
    onSettled: (data, error, variables, onMutateResult, context) => {
      void queryClient.invalidateQueries({ queryKey: POD_PLANS_QUERY_KEY });
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

export const useDeletePodPlanMutation = (
  options?: UseMutationOptions<
    void,
    PodPlanMutationError,
    { planId: string },
    unknown
  >,
) => {
  const queryClient = useQueryClient();

  return useMutation<void, PodPlanMutationError, { planId: string }, unknown>({
    mutationFn: ({ planId }) => deletePodPlan(planId),
    ...options,
    onSettled: (data, error, variables, onMutateResult, context) => {
      void queryClient.invalidateQueries({ queryKey: POD_PLANS_QUERY_KEY });
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
