/* eslint-disable react-refresh/only-export-components */
import React, { useState } from "react";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

import { Switch } from "@/components/ui/switch";
import type { AccountSummary, UpdateAccountFlagsPayload } from "@/services/api";
import { useUpdateAccountFlagsMutation } from "@/hooks/queries/use-accounts";

export type AccountFlagKey = "fraudReview" | "missedPayment";

const FLAG_LABELS: Record<
  AccountFlagKey,
  { label: string; description: string }
> = {
  fraudReview: {
    label: "Fraud review",
    description: "Flagged for fraud review",
  },
  missedPayment: {
    label: "Missed payment",
    description: "Flagged for missed payment",
  },
};

const formatReason = (reason?: string | null) => {
  if (!reason || reason.length === 0) return null;
  return reason
    .split("_")
    .map((segment) => segment.charAt(0).toUpperCase() + segment.slice(1))
    .join(" ");
};

const FlagToggleRow = ({
  flagKey,
  checked,
  onCheckedChange,
  disabled,
  loading,
  reason,
}: {
  flagKey: AccountFlagKey;
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
  disabled: boolean;
  loading: boolean;
  reason?: string | null;
}) => {
  const { label, description } = FLAG_LABELS[flagKey];
  const formattedReason = formatReason(reason);

  return (
    <div className="flex items-center justify-between gap-3 rounded-lg border border-[#E5E7EB] bg-white px-3 py-2">
      <div className="flex flex-col">
        <span className="text-sm font-medium text-[#111827]">{label}</span>
        <span className="text-xs text-[#6B7280]">
          {checked
            ? formattedReason
              ? `${description} • ${formattedReason}`
              : description
            : "Flag disabled"}
        </span>
      </div>
      <div className="relative flex items-center">
        <Switch
          checked={checked}
          onCheckedChange={onCheckedChange}
          disabled={disabled}
          aria-label={label}
        />
        {loading && (
          <Loader2 className="absolute -right-6 h-4 w-4 animate-spin text-[#6B7280]" />
        )}
      </div>
    </div>
  );
};

export const AccountFlagsControls = ({
  account,
}: {
  account: AccountSummary;
}) => {
  const [pendingFlag, setPendingFlag] = useState<AccountFlagKey | null>(null);

  const { mutate: updateFlags, isPending } = useUpdateAccountFlagsMutation(
    account.id,
  );

  const handleToggle = (flagKey: AccountFlagKey) => (checked: boolean) => {
    setPendingFlag(flagKey);

    // Only send the flag that's being toggled
    const payload: UpdateAccountFlagsPayload = {};
    if (flagKey === "fraudReview") {
      payload.fraudReview = checked;
    } else if (flagKey === "missedPayment") {
      payload.missedPayment = checked;
    }

    updateFlags(payload, {
      onSuccess: (data) => {
        const label = FLAG_LABELS[flagKey].label;
        toast.success(`${label} flag ${checked ? "enabled" : "disabled"}`);
        return data;
      },
      onError: (error) => {
        const message =
          error.response?.data?.message ??
          error.message ??
          "Failed to update account flags";
        toast.error(message);
      },
      onSettled: () => {
        setPendingFlag(null);
      },
    });
  };

  return (
    <div className="flex flex-col gap-2">
      <FlagToggleRow
        flagKey="fraudReview"
        checked={Boolean(account.requiresFraudReview)}
        onCheckedChange={handleToggle("fraudReview")}
        disabled={isPending}
        loading={isPending && pendingFlag === "fraudReview"}
        reason={account.fraudReviewReason ?? undefined}
      />
      <FlagToggleRow
        flagKey="missedPayment"
        checked={Boolean(account.missedPaymentFlag)}
        onCheckedChange={handleToggle("missedPayment")}
        disabled={isPending}
        loading={isPending && pendingFlag === "missedPayment"}
        reason={account.missedPaymentReason ?? undefined}
      />
    </div>
  );
};

export const getAccountFlagReasons = (account: AccountSummary) => {
  const reasons: string[] = [];

  if (account.requiresFraudReview) {
    const reason = formatReason(account.fraudReviewReason);
    reasons.push(
      reason
        ? `${FLAG_LABELS.fraudReview.label} • ${reason}`
        : FLAG_LABELS.fraudReview.label,
    );
  }

  if (account.missedPaymentFlag) {
    const reason = formatReason(account.missedPaymentReason);
    reasons.push(
      reason
        ? `${FLAG_LABELS.missedPayment.label} • ${reason}`
        : FLAG_LABELS.missedPayment.label,
    );
  }

  return reasons;
};
