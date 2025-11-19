import React, { useState } from "react";
import { Link, useParams } from "react-router-dom";
import {
  ArrowLeft,
  Loader2,
  Mail,
  Phone,
  Users,
  ArrowLeftRight,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  usePodQuery,
  useSwapPodPayoutsMutation,
  type PodQueryError,
} from "@/hooks/queries/use-pods";
import { PodStatusBadge } from "./components/pod-status-badge";
import {
  AccountAvatar,
  getAccountDisplayName,
} from "@/pages/user-management/components/account-avatar";
import { toast } from "sonner";

const formatCurrency = (value: number) =>
  new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 0,
  }).format(value);

const formatLifecycle = (weeks: number) =>
  `${weeks} week${weeks === 1 ? "" : "s"}`;

const formatDateTime = (isoString?: string | null) => {
  if (!isoString) return "—";
  const date = new Date(isoString);
  if (Number.isNaN(date.getTime())) return "—";
  return new Intl.DateTimeFormat("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(date);
};

const StatTile = ({
  label,
  value,
  tone,
}: {
  label: string;
  value: React.ReactNode;
  tone: "emerald" | "blue" | "amber";
}) => {
  const toneClasses: Record<typeof tone, string> = {
    emerald: "bg-emerald-50 text-emerald-700",
    blue: "bg-blue-50 text-blue-700",
    amber: "bg-amber-50 text-amber-700",
  };

  return (
    <div className="rounded-2xl border border-[#E5E7EB] bg-white p-5 shadow-sm">
      <div
        className={`mb-3 inline-flex h-9 w-9 items-center justify-center rounded-full ${toneClasses[tone]}`}
      >
        <Users className="h-4 w-4" />
      </div>
      <div className="text-xs font-semibold uppercase tracking-wide text-[#9CA3AF]">
        {label}
      </div>
      <div className="text-xl font-semibold text-[#111827]">{value}</div>
    </div>
  );
};

const PodLoadingState = () => (
  <div className="rounded-2xl border border-[#E5E7EB] bg-white p-6 shadow-sm">
    <div className="flex items-center gap-2 text-sm text-[#6B7280]">
      <Loader2 className="h-4 w-4 animate-spin" />
      Loading pod details…
    </div>
  </div>
);

const PodErrorState = ({ error }: { error: PodQueryError }) => {
  const message =
    error.response?.data?.message ?? error.message ?? "Unable to load pod.";
  return (
    <div className="rounded-2xl border border-rose-100 bg-rose-50 p-6 text-sm text-rose-700 shadow-sm">
      {message}
    </div>
  );
};

const EmptyState = ({
  title,
  description,
}: {
  title: string;
  description: string;
}) => (
  <div className="rounded-2xl border border-dashed border-[#E5E7EB] bg-[#F9FAFB] p-6 text-center">
    <div className="text-sm font-medium text-[#111827]">{title}</div>
    <div className="text-xs text-[#6B7280]">{description}</div>
  </div>
);

export default function PodDetailsPage() {
  const { id } = useParams<{ id: string }>();
  const podId = id ?? "";

  const [selectedMembers, setSelectedMembers] = useState<string[]>([]);

  const { data: pod, isLoading, isError, error } = usePodQuery(podId);

  const swapMutation = useSwapPodPayoutsMutation(podId, {
    onSuccess: () => {
      toast.success("Payout positions swapped", {
        description: "The payout positions have been successfully swapped.",
      });
      setSelectedMembers([]);
    },
    onError: (error) => {
      toast.error("Failed to swap positions", {
        description:
          error.response?.data?.message ??
          error.message ??
          "Unable to swap payout positions.",
      });
    },
  });

  const handleMemberSelect = (membershipId: string) => {
    setSelectedMembers((prev) => {
      if (prev.includes(membershipId)) {
        return prev.filter((id) => id !== membershipId);
      }
      if (prev.length >= 2) {
        return [prev[1], membershipId];
      }
      return [...prev, membershipId];
    });
  };

  const handleSwap = () => {
    if (selectedMembers.length === 2) {
      swapMutation.mutate({
        firstMembershipId: selectedMembers[0],
        secondMembershipId: selectedMembers[1],
      });
    }
  };

  const isCustomPod = pod?.type.toLowerCase() === "custom";
  const canShowSwapButton = isCustomPod && selectedMembers.length === 2;

  return (
    <section className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <nav className="text-sm text-[#6B7280]">
          <Link
            to="/pods-management"
            className="text-[#374151] hover:underline"
          >
            Pods Management
          </Link>
          <span className="mx-2 text-[#9CA3AF]">/</span>
          <span className="text-[#9CA3AF]">
            {pod
              ? `${pod.type.toUpperCase()} • ${formatCurrency(pod.amount)}`
              : "Pod details"}
          </span>
        </nav>

        <Button
          variant="ghost"
          className="inline-flex items-center gap-2 text-sm text-[#6B7280]"
          asChild
        >
          <Link to="/pods-management">
            <ArrowLeft className="h-4 w-4" />
            Back to pods
          </Link>
        </Button>
      </div>

      {isLoading && <PodLoadingState />}
      {isError && error && <PodErrorState error={error} />}

      {pod && (
        <div className="space-y-6">
          <div className="space-y-4 rounded-2xl border border-[#E5E7EB] bg-white p-6 shadow-sm">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <div className="flex flex-wrap items-center gap-3">
                  <h1 className="text-[22px] font-semibold text-[#111827]">
                    {pod.type.toUpperCase()} Pod
                  </h1>
                  <PodStatusBadge status={pod.status} />
                </div>
                <p className="mt-1 text-sm text-[#6B7280]">
                  {formatCurrency(pod.amount)} •{" "}
                  {formatLifecycle(pod.lifecycleWeeks)} • Max {pod.maxMembers}{" "}
                  members
                </p>
              </div>
              <div className="text-sm text-[#6B7280]">
                <div>Pod ID: {pod.id}</div>
                <div>Created: {formatDateTime(pod.createdAt)}</div>
                <div>Creator: {pod.creatorId ?? "System generated"}</div>
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-3">
              <StatTile
                label="Contribution amount"
                value={formatCurrency(pod.amount)}
                tone="emerald"
              />
              <StatTile
                label="Lifecycle duration"
                value={formatLifecycle(pod.lifecycleWeeks)}
                tone="blue"
              />
              <StatTile
                label="Members enrolled"
                value={`${pod.currentMembers} / ${pod.maxMembers}`}
                tone="amber"
              />
            </div>
          </div>

          <div className="space-y-4 rounded-2xl border border-[#E5E7EB] bg-white p-6 shadow-sm">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <h2 className="text-base font-semibold text-[#111827]">
                  Pod memberships
                </h2>
                <p className="text-xs text-[#6B7280]">
                  {isCustomPod
                    ? "Select two members to swap their payout positions."
                    : "Keep track of users that have joined this pod."}
                </p>
              </div>
              {canShowSwapButton && (
                <Button
                  onClick={handleSwap}
                  disabled={swapMutation.isPending}
                  className="inline-flex items-center gap-2"
                >
                  {swapMutation.isPending ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Swapping...
                    </>
                  ) : (
                    <>
                      <ArrowLeftRight className="h-4 w-4" />
                      Swap Positions
                    </>
                  )}
                </Button>
              )}
            </div>

            {pod.memberships.length === 0 ? (
              <EmptyState
                title="No memberships yet"
                description="This pod currently has no members. Once participants join, you'll see them here."
              />
            ) : (
              <div className="space-y-3">
                {pod.memberships.map((membership, index) => {
                  const account = membership.account;
                  const displayName = account
                    ? getAccountDisplayName(account)
                    : (membership.accountEmail ?? "Unknown member");
                  const membershipId = membership.id ?? "";
                  const isSelected = selectedMembers.includes(membershipId);
                  const canSelect = isCustomPod && membershipId;

                  return (
                    <div
                      key={membership.id ?? membership.accountId ?? index}
                      onClick={
                        canSelect
                          ? () => handleMemberSelect(membershipId)
                          : undefined
                      }
                      className={`flex flex-wrap items-center justify-between gap-4 rounded-xl border px-4 py-3 transition-all ${
                        isSelected
                          ? "border-blue-500 bg-blue-50 ring-2 ring-blue-200"
                          : "border-[#E5E7EB] bg-white hover:border-[#D1D5DB]"
                      } ${canSelect ? "cursor-pointer" : ""}`}
                    >
                      <div className="flex items-center gap-3">
                        {account ? (
                          <AccountAvatar account={account} />
                        ) : (
                          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gray-100 text-gray-500">
                            <Users className="h-5 w-5" />
                          </div>
                        )}
                        <div className="flex flex-col">
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-semibold text-[#111827]">
                              {displayName}
                            </span>
                          </div>
                          <div className="flex flex-wrap items-center gap-3 text-xs text-[#6B7280]">
                            {account && (
                              <>
                                <span className="inline-flex items-center gap-1">
                                  <Mail className="h-3 w-3" />
                                  {account.email}
                                </span>
                                {account.phoneNumber && (
                                  <span className="inline-flex items-center gap-1">
                                    <Phone className="h-3 w-3" />
                                    {account.phoneNumber}
                                  </span>
                                )}
                              </>
                            )}
                            {!account && membership.accountEmail && (
                              <span className="inline-flex items-center gap-1">
                                <Mail className="h-3 w-3" />
                                {membership.accountEmail}
                              </span>
                            )}
                            <span>•</span>
                            <span>
                              Joined {formatDateTime(membership.joinedAt)}
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="flex flex-col items-end gap-1 text-sm">
                        <div className="font-medium text-[#111827]">
                          Position:{" "}
                          {membership.finalOrder
                            ? `#${membership.finalOrder}`
                            : membership.joinOrder !== null
                              ? `#${membership.joinOrder}`
                              : "—"}
                        </div>
                        <div className="text-xs text-[#6B7280]">
                          Payout: {formatDateTime(membership.payoutDate)}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}
    </section>
  );
}
