import {
  useMutation,
  useQuery,
  type UseMutationOptions,
  type UseQueryOptions,
} from "@tanstack/react-query";
import type { AxiosError } from "axios";
import {
  getManualEmailTemplates,
  sendManualEmail,
  type EmailTemplate,
  type SendManualEmailPayload,
  type SendManualEmailResponse,
} from "@/services/api";

export const EMAIL_TEMPLATES_QUERY_KEY = ["email-templates", "manual"] as const;

export type EmailTemplatesQueryError = AxiosError<{
  message?: string;
  error?: string;
}>;

export type SendManualEmailMutationError = AxiosError<{
  message?: string;
  error?: string;
}>;

export const useEmailTemplatesQuery = (
  options?: Omit<
    UseQueryOptions<EmailTemplate[], EmailTemplatesQueryError>,
    "queryKey" | "queryFn"
  >,
) =>
  useQuery<EmailTemplate[], EmailTemplatesQueryError>({
    queryKey: EMAIL_TEMPLATES_QUERY_KEY,
    queryFn: getManualEmailTemplates,
    ...options,
  });

export const useSendManualEmailMutation = (
  options?: UseMutationOptions<
    SendManualEmailResponse,
    SendManualEmailMutationError,
    SendManualEmailPayload
  >,
) =>
  useMutation<
    SendManualEmailResponse,
    SendManualEmailMutationError,
    SendManualEmailPayload
  >({
    mutationFn: sendManualEmail,
    ...options,
  });
