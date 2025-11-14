import React, { useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import {
  ArrowLeft,
  CircleDollarSign,
  FlagTriangleRight,
  Link2Off,
  Loader2,
  Mail,
  Medal,
  MoreVertical,
  Phone,
  Target,
  Trash2,
  Trophy,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import {
  AccountAvatar,
  getAccountDisplayName,
} from "./components/account-avatar";
import { AccountStatusPill } from "./components/account-status-pill";
import {
  useAccountAchievementsQuery,
  useAccountCurrentPodsQuery,
  useAccountQuery,
  useUpdateAccountNotificationsMutation,
  useRemoveAccountBankConnectionMutation,
  useDeleteAccountMutation,
  type AccountAchievementsQueryError,
  type AccountCurrentPodsQueryError,
  type AccountQueryError,
  type UpdateAccountNotificationsError,
} from "@/hooks/queries/use-accounts";
import type {
  AccountAchievement,
  AccountCurrentPod,
  AccountDetails,
} from "@/services/api";
import {
  AccountFlagsControls,
  getAccountFlagReasons,
} from "./components/account-flags-controls";

const formatFullDateTime = (isoString?: string | null) => {
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

const formatShortDate = (isoString?: string | null) => {
  if (!isoString) return "—";
  const date = new Date(isoString);
  if (Number.isNaN(date.getTime())) return "—";
  return new Intl.DateTimeFormat("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  }).format(date);
};

const InfoRow = ({
  label,
  value,
}: {
  label: string;
  value: React.ReactNode;
}) => (
  <div className="flex flex-col gap-1 rounded-xl border border-[#F0F2F7] bg-[#FCFCFD] p-4">
    <span className="text-xs font-semibold uppercase tracking-wide text-[#9CA3AF]">
      {label}
    </span>
    <span className="text-sm text-[#111827]">{value ?? "—"}</span>
  </div>
);

const NotificationRow = ({
  id,
  label,
  description,
  checked,
  disabled,
  onChange,
}: {
  id: string;
  label: string;
  description: string;
  checked: boolean;
  disabled: boolean;
  onChange: (nextValue: boolean) => void;
}) => (
  <div className="flex items-center justify-between gap-4 rounded-2xl border border-[#E5E7EB] p-4 transition-colors hover:border-[#D1D5DB]">
    <div className="space-y-1">
      <label
        htmlFor={id}
        className="text-sm font-semibold text-[#111827] leading-none"
      >
        {label}
      </label>
      <p className="text-xs text-[#6B7280]">{description}</p>
    </div>
    <Switch
      id={id}
      checked={checked}
      onCheckedChange={onChange}
      disabled={disabled}
    />
  </div>
);

const NotificationError = ({
  error,
}: {
  error: UpdateAccountNotificationsError;
}) => {
  const message =
    error.response?.data?.message ??
    error.message ??
    "Unable to update notifications.";

  return (
    <div className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-xs text-rose-700">
      {message}
    </div>
  );
};

const AchievementCard = ({
  achievement,
  status,
}: {
  achievement: AccountAchievement;
  status: "earned" | "pending";
}) => {
  const metaLabel =
    status === "earned"
      ? "Earned"
      : typeof achievement.remaining === "number"
        ? `${achievement.remaining} remaining`
        : "Pending";

  return (
    <div className="flex flex-col gap-3 rounded-2xl border border-[#E5E7EB] p-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h4 className="text-sm font-semibold text-[#111827]">
            {achievement.name}
          </h4>
          <p className="text-xs text-[#6B7280]">{achievement.description}</p>
        </div>
        <span
          className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium ${status === "earned" ? "bg-emerald-50 text-emerald-600" : "bg-amber-50 text-amber-700"}`}
        >
          {metaLabel}
        </span>
      </div>

      <div className="flex flex-wrap items-center gap-3 text-xs text-[#6B7280]">
        {typeof achievement.progress === "number" && (
          <span className="inline-flex items-center gap-1 rounded-full bg-[#F3F4F6] px-2 py-0.5">
            <Target className="h-3.5 w-3.5 text-[#6B7280]" />
            Progress: {achievement.progress ?? 0}
          </span>
        )}
        {achievement.earnedAt && (
          <span className="inline-flex items-center gap-1 rounded-full bg-[#F3F4F6] px-2 py-0.5">
            <Trophy className="h-3.5 w-3.5 text-[#6B7280]" />
            Earned: {formatShortDate(achievement.earnedAt)}
          </span>
        )}
      </div>
    </div>
  );
};

const AchievementsSection = ({
  data,
  isLoading,
  error,
}: {
  data:
    | {
        totalEarned: number;
        totalAvailable: number;
        earned: AccountAchievement[];
        pending: AccountAchievement[];
      }
    | undefined;
  isLoading: boolean;
  error: AccountAchievementsQueryError | null;
}) => {
  if (isLoading) {
    return (
      <div className="rounded-2xl border border-[#E5E7EB] bg-white p-6 shadow-sm">
        <div className="flex items-center gap-2 text-sm text-[#6B7280]">
          <Loader2 className="h-4 w-4 animate-spin" />
          Loading achievements…
        </div>
      </div>
    );
  }

  if (error) {
    const message =
      error.response?.data?.message ??
      error.message ??
      "Unable to load achievements right now.";

    return (
      <div className="rounded-2xl border border-rose-100 bg-rose-50 p-6 text-sm text-rose-700 shadow-sm">
        {message}
      </div>
    );
  }

  const earnedAchievements = data?.earned ?? [];
  const pendingAchievements = data?.pending ?? [];

  return (
    <div className="space-y-5">
      <div className="grid gap-4 md:grid-cols-3">
        <StatCard
          icon={<Trophy className="h-4 w-4 text-emerald-600" />}
          label="Total earned"
          value={`${data?.totalEarned ?? 0}`}
          tone="emerald"
        />
        <StatCard
          icon={<Target className="h-4 w-4 text-amber-600" />}
          label="Available achievements"
          value={`${data?.totalAvailable ?? 0}`}
          tone="amber"
        />
        <StatCard
          icon={<Medal className="h-4 w-4 text-blue-600" />}
          label="Achievements earned"
          value={`${earnedAchievements.length}`}
          tone="blue"
        />
      </div>

      <div className="grid gap-5 lg:grid-cols-2">
        {/* Earned: compact grid */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-[#111827]">
              Earned achievements
            </h3>
            <span className="text-xs text-[#6B7280]">
              {earnedAchievements.length} total
            </span>
          </div>

          {earnedAchievements.length === 0 ? (
            <EmptyState
              title="No achievements earned yet"
              description="You’ll see finished achievements here once the user unlocks them."
            />
          ) : (
            <div className="grid gap-3 sm:grid-cols-2">
              {earnedAchievements.map((achievement) => (
                <div key={achievement.code} className="h-full">
                  <AchievementCard achievement={achievement} status="earned" />
                </div>
              ))}
            </div>
          )}
        </div>

        {/* In-progress: scrollable grid */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-[#111827]">
              In-progress achievements
            </h3>
            <span className="text-xs text-[#6B7280]">
              {pendingAchievements.length} total
            </span>
          </div>

          {pendingAchievements.length === 0 ? (
            <EmptyState
              title="No achievements in progress"
              description="When new goals are available, they will show up here."
            />
          ) : (
            <div className="rounded-2xl border border-[#E5E7EB]">
              {/* Constrain height on larger screens; allow normal flow on small screens */}
              <div className="max-h-[520px] overflow-y-auto p-3 sm:p-4">
                <div className="grid gap-3 sm:grid-cols-2">
                  {pendingAchievements.map((achievement) => (
                    <div key={achievement.code} className="h-full">
                      <AchievementCard
                        achievement={achievement}
                        status="pending"
                      />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
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

const toneClasses: Record<"emerald" | "amber" | "blue", string> = {
  emerald: "bg-emerald-50 text-emerald-700",
  amber: "bg-amber-50 text-amber-700",
  blue: "bg-blue-50 text-blue-700",
};

const StatCard = ({
  icon,
  label,
  value,
  tone,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  tone: "emerald" | "amber" | "blue";
}) => {
  return (
    <div className="rounded-2xl border border-[#E5E7EB] bg-white p-5 shadow-sm">
      <div
        className={`mb-3 inline-flex h-9 w-9 items-center justify-center rounded-full ${toneClasses[tone]}`}
      >
        {icon}
      </div>
      <div className="text-xs font-semibold uppercase tracking-wide text-[#9CA3AF]">
        {label}
      </div>
      <div className="text-xl font-semibold text-[#111827]">{value}</div>
    </div>
  );
};

const AccountLoadingState = () => (
  <div className="rounded-2xl border border-[#E5E7EB] bg-white p-6 shadow-sm">
    <div className="flex items-center gap-2 text-sm text-[#6B7280]">
      <Loader2 className="h-4 w-4 animate-spin" />
      Loading user details…
    </div>
  </div>
);

const AccountErrorState = ({ error }: { error: AccountQueryError }) => {
  const message =
    error.response?.data?.message ?? error.message ?? "Unable to load user.";
  return (
    <div className="rounded-2xl border border-rose-100 bg-rose-50 p-6 text-sm text-rose-700 shadow-sm">
      {message}
    </div>
  );
};

const AccountOverview = ({ account }: { account: AccountDetails }) => {
  const displayName = getAccountDisplayName(account);
  const flagReasons = getAccountFlagReasons(account);

  return (
    <div className="space-y-6 rounded-2xl border border-[#E5E7EB] bg-white p-6 shadow-sm">
      <div className="flex flex-wrap items-start justify-between gap-6">
        <div className="flex items-center gap-4">
          <AccountAvatar account={account} size="lg" />
          <div className="space-y-1">
            <div className="flex items-center gap-1 text-lg font-semibold text-[#111827]">
              <span>{displayName}</span>
              {flagReasons.length > 0 && (
                <span
                  className="flex items-center"
                  title={`Flagged: ${flagReasons.join(", ")}`}
                >
                  <FlagTriangleRight
                    className="h-4 w-4 text-amber-500"
                    aria-hidden="true"
                  />
                  <span className="sr-only">
                    Flagged: {flagReasons.join(", ")}
                  </span>
                </span>
              )}
            </div>
            <div className="flex flex-wrap items-center gap-3 text-sm text-[#6B7280]">
              <span className="inline-flex items-center gap-1">
                <Mail className="h-4 w-4" />
                {account.email}
              </span>
              <span className="inline-flex items-center gap-1">
                <Phone className="h-4 w-4" />
                {account.phoneNumber ?? "No phone number on record"}
              </span>
            </div>
          </div>
        </div>
        <div className="space-y-2 text-right text-sm text-[#6B7280]">
          <div className="flex items-center justify-end gap-2">
            <AccountStatusPill isActive={account.isActive} />
            <AccountActionsMenu account={account} />
          </div>
          <div>Account ID: {account.id}</div>
          <div>Joined {formatFullDateTime(account.createdAt)}</div>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <InfoRow
          label="Email notifications"
          value={account.emailNotificationsEnabled ? "Enabled" : "Disabled"}
        />
        <InfoRow
          label="Transaction notifications"
          value={
            account.transactionNotificationsEnabled ? "Enabled" : "Disabled"
          }
        />
        <InfoRow
          label="Joined platform"
          value={formatShortDate(account.createdAt)}
        />
      </div>
    </div>
  );
};

const AccountActionsMenu = ({ account }: { account: AccountDetails }) => {
  const navigate = useNavigate();
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const accountName = getAccountDisplayName(account);

  const { mutate: removeBankConnection, isPending } =
    useRemoveAccountBankConnectionMutation(account.id, {
      onSuccess: () => {
        setConfirmOpen(false);
        toast.success("Bank connection removed");
      },
      onError: (error) => {
        const message =
          error.response?.data?.message ??
          error.message ??
          "Failed to remove bank connection";
        toast.error(message);
      },
    });

  const { mutate: deleteAccount, isPending: isDeleting } =
    useDeleteAccountMutation(account.id, {
      onSuccess: () => {
        setDeleteConfirmOpen(false);
        toast.success("User deleted successfully");
        // Navigate after a short delay to allow the toast to be visible
        setTimeout(() => {
          void navigate("/users-management");
        }, 100);
      },
      onError: (error) => {
        const message =
          error.response?.data?.message ??
          error.message ??
          "Failed to delete user";
        toast.error(message);
      },
    });

  const handleDeleteUser = () => {
    deleteAccount();
  };

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 focus-visible:ring-0 focus-visible:ring-offset-0"
            disabled={isPending || isDeleting}
          >
            <MoreVertical className="h-4 w-4 text-[#6B7280]" />
            <span className="sr-only">More actions</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-[260px] space-y-2">
          <div className="px-2 pb-2">
            <AccountFlagsControls account={account} />
          </div>
          {account.bankAccountLinked && (
            <>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                className="cursor-pointer text-rose-600 focus:text-rose-600"
                onSelect={(event) => {
                  event.preventDefault();
                  setConfirmOpen(true);
                }}
              >
                <Link2Off className="mr-2 h-4 w-4" aria-hidden="true" />
                Remove bank connection
              </DropdownMenuItem>
            </>
          )}
          <DropdownMenuSeparator />
          <DropdownMenuItem
            className="cursor-pointer text-rose-600 focus:text-rose-600"
            onSelect={(event) => {
              event.preventDefault();
              setDeleteConfirmOpen(true);
            }}
            disabled={isDeleting}
          >
            <Trash2 className="mr-2 h-4 w-4" aria-hidden="true" />
            Delete User
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <Dialog
        open={confirmOpen}
        onOpenChange={(open) => {
          if (!isPending) {
            setConfirmOpen(open);
          }
        }}
      >
        <DialogContent className="max-w-md rounded-2xl">
          <DialogHeader>
            <DialogTitle className="text-lg">
              Remove bank connection
            </DialogTitle>
            <DialogDescription>
              This will disconnect the user's linked bank account. They will
              need to reconnect before making future transfers. Are you sure you
              want to continue?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="mt-4 flex gap-2 sm:justify-end">
            <Button
              variant="outline"
              onClick={() => setConfirmOpen(false)}
              disabled={isPending}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={() => removeBankConnection()}
              disabled={isPending}
            >
              {isPending ? "Removing…" : "Remove"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog
        open={deleteConfirmOpen}
        onOpenChange={(open) => {
          if (!isDeleting) {
            setDeleteConfirmOpen(open);
          }
        }}
      >
        <DialogContent className="sm:max-w-[440px] rounded-2xl p-6">
          <DialogHeader>
            <DialogTitle className="text-[18px]">Delete User</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete "{accountName}"? This action
              cannot be undone and will permanently remove the user and all
              their associated data from the platform.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="mt-4">
            <Button
              variant="outline"
              onClick={() => setDeleteConfirmOpen(false)}
              disabled={isDeleting}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDeleteUser}
              disabled={isDeleting}
            >
              {isDeleting ? "Deleting..." : "Delete"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

const UserPodsModal = ({
  open,
  onOpenChange,
  pods,
  isLoading,
  error,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  pods: AccountCurrentPod[];
  isLoading: boolean;
  error: AccountCurrentPodsQueryError | null;
}) => {
  const formatCurrency = (value: number) =>
    new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 0,
    }).format(value);

  const formatDate = (isoString?: string | null) => {
    if (!isoString) return "—";
    const date = new Date(isoString);
    if (Number.isNaN(date.getTime())) return "—";
    return new Intl.DateTimeFormat("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    }).format(date);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl rounded-2xl p-6">
        <DialogHeader>
          <DialogTitle className="text-[18px]">User Pods</DialogTitle>
          <DialogDescription>
            View all pods this user is currently participating in.
          </DialogDescription>
        </DialogHeader>

        <div className="mt-4 max-h-[500px] overflow-y-auto">
          {isLoading && (
            <div className="flex items-center justify-center gap-2 py-8 text-sm text-[#6B7280]">
              <Loader2 className="h-4 w-4 animate-spin" />
              Loading pods…
            </div>
          )}

          {error && (
            <div className="rounded-xl border border-rose-100 bg-rose-50 p-4 text-sm text-rose-700">
              {error.response?.data?.message ??
                error.message ??
                "Failed to load pods"}
            </div>
          )}

          {!isLoading && !error && pods.length === 0 && (
            <div className="rounded-2xl border border-dashed border-[#E5E7EB] bg-[#F9FAFB] p-8 text-center">
              <div className="text-sm font-medium text-[#111827]">
                No active pods
              </div>
              <div className="text-xs text-[#6B7280]">
                This user is not currently participating in any pods.
              </div>
            </div>
          )}

          {!isLoading && !error && pods.length > 0 && (
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="border-b border-[#E5E7EB]">
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-[#9CA3AF]">
                      Pod
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-[#9CA3AF]">
                      Amount
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-[#9CA3AF]">
                      Status
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-[#9CA3AF]">
                      Joined
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-[#9CA3AF]">
                      Contributed
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {pods.map((pod) => (
                    <tr
                      key={pod.membershipId}
                      className="border-b border-[#E5E7EB] hover:bg-[#F9FAFB]"
                    >
                      <td className="px-4 py-3">
                        <div className="flex flex-col">
                          <Link
                            to={`/pods-management/${pod.podId}`}
                            className="text-sm font-semibold text-[#111827] hover:underline"
                          >
                            {pod.name ?? pod.planCode}
                          </Link>
                          <span className="text-xs text-[#6B7280]">
                            {pod.lifecycleWeeks} weeks • {pod.maxMembers}{" "}
                            members
                          </span>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-sm text-[#374151]">
                        {formatCurrency(pod.amount)}
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ${
                            pod.status === "active"
                              ? "bg-emerald-50 text-emerald-600"
                              : pod.status === "pending"
                                ? "bg-amber-50 text-amber-700"
                                : "bg-gray-50 text-gray-600"
                          }`}
                        >
                          {pod.status}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-sm text-[#6B7280]">
                        {formatDate(pod.joinedAt)}
                      </td>
                      <td className="px-4 py-3 text-sm font-medium text-[#111827]">
                        ${pod.totalContributed}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        <DialogFooter className="mt-4">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default function UserManagementDetailsPage() {
  const { id } = useParams<{ id: string }>();
  const accountId = id ?? "";
  const [podsModalOpen, setPodsModalOpen] = useState(false);

  const {
    data: account,
    isLoading: isAccountLoading,
    isError: isAccountError,
    error: accountError,
  } = useAccountQuery(accountId);

  const {
    data: achievements,
    isLoading: isAchievementsLoading,
    error: achievementsError,
  } = useAccountAchievementsQuery(accountId);

  const {
    data: pods,
    isLoading: isPodsLoading,
    error: podsError,
  } = useAccountCurrentPodsQuery(accountId);

  const {
    mutate: updateNotificationPreferences,
    isPending: isUpdatingNotifications,
    error: updateNotificationsError,
  } = useUpdateAccountNotificationsMutation(accountId);

  const pendingNotificationError = updateNotificationsError ?? null;
  const podsCount = pods?.length ?? 0;

  const breadcrumbLabel = useMemo(() => {
    if (account) return getAccountDisplayName(account);
    if (!accountId) return "Unknown user";
    return `User #${accountId.slice(0, 6)}`;
  }, [account, accountId]);

  const handleNotificationChange = (
    key: "emailNotificationsEnabled" | "transactionNotificationsEnabled",
    nextValue: boolean,
  ) => {
    if (!account) return;

    updateNotificationPreferences({
      emailNotificationsEnabled:
        key === "emailNotificationsEnabled"
          ? nextValue
          : account.emailNotificationsEnabled,
      transactionNotificationsEnabled:
        key === "transactionNotificationsEnabled"
          ? nextValue
          : account.transactionNotificationsEnabled,
    });
  };

  return (
    <section className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <nav className="text-sm text-[#6B7280]">
          <Link
            to="/users-management"
            className="text-[#374151] hover:underline"
          >
            Users Management
          </Link>
          <span className="mx-2 text-[#9CA3AF]">/</span>
          <span className="text-[#9CA3AF]">{breadcrumbLabel}</span>
        </nav>

        <Button
          variant="ghost"
          className="inline-flex items-center gap-2 text-sm text-[#6B7280]"
          asChild
        >
          <Link to="/users-management">
            <ArrowLeft className="h-4 w-4" />
            Back to list
          </Link>
        </Button>
      </div>

      {isAccountLoading && <AccountLoadingState />}
      {isAccountError && accountError && (
        <AccountErrorState error={accountError} />
      )}

      {account && (
        <div className="space-y-6">
          <AccountOverview account={account} />

          <div className="grid gap-6 lg:grid-cols-[1.25fr_1fr]">
            <div className="space-y-4 rounded-2xl border border-[#E5E7EB] bg-white p-6 shadow-sm">
              <h3 className="text-base font-semibold text-[#111827]">
                Contact details
              </h3>
              <div className="grid gap-4 sm:grid-cols-2">
                <InfoRow label="Email address" value={account.email} />
                <InfoRow
                  label="Phone number"
                  value={account.phoneNumber ?? "No phone number on record"}
                />
              </div>
            </div>

            <div className="space-y-4 rounded-2xl border border-[#E5E7EB] bg-white p-6 shadow-sm">
              <h3 className="text-base font-semibold text-[#111827]">
                Notification preferences
              </h3>
              <p className="text-xs text-[#6B7280]">
                Toggle individual notification channels for this user. Changes
                are applied immediately.
              </p>

              <div className="space-y-3">
                <NotificationRow
                  id="email-notifications"
                  label="Email notifications"
                  description="Send account and platform updates to this user’s email."
                  checked={account.emailNotificationsEnabled}
                  disabled={isUpdatingNotifications}
                  onChange={(next) =>
                    handleNotificationChange("emailNotificationsEnabled", next)
                  }
                />
                <NotificationRow
                  id="transaction-notifications"
                  label="Transaction notifications"
                  description="Inform the user about new transactions and pod activity."
                  checked={account.transactionNotificationsEnabled}
                  disabled={isUpdatingNotifications}
                  onChange={(next) =>
                    handleNotificationChange(
                      "transactionNotificationsEnabled",
                      next,
                    )
                  }
                />
              </div>

              {isUpdatingNotifications && (
                <div className="inline-flex items-center gap-2 text-xs text-[#6B7280]">
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  Saving notification preferences…
                </div>
              )}
              {pendingNotificationError && (
                <NotificationError error={pendingNotificationError} />
              )}
            </div>
          </div>

          <div className="rounded-2xl border border-[#E5E7EB] bg-white p-6 shadow-sm">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <h3 className="text-base font-semibold text-[#111827]">
                  User Pods
                </h3>
                <p className="text-xs text-[#6B7280]">
                  Pods this user is currently participating in.
                </p>
              </div>
            </div>

            <div className="mt-5 grid gap-4 md:grid-cols-3">
              <StatCard
                icon={<CircleDollarSign className="h-4 w-4 text-blue-600" />}
                label="Active Pods"
                value={isPodsLoading ? "..." : `${podsCount}`}
                tone="blue"
              />
              {podsCount > 0 && (
                <div className="flex items-center md:col-span-2">
                  <Button
                    variant="outline"
                    onClick={() => setPodsModalOpen(true)}
                    className="w-full md:w-auto"
                  >
                    View Pods
                  </Button>
                </div>
              )}
            </div>

            {podsError && (
              <div className="mt-4 rounded-xl border border-rose-100 bg-rose-50 p-4 text-sm text-rose-700">
                {podsError.response?.data?.message ??
                  podsError.message ??
                  "Failed to load pods"}
              </div>
            )}
          </div>

          <div className="rounded-2xl border border-[#E5E7EB] bg-white p-6 shadow-sm">
            <h3 className="text-base font-semibold text-[#111827]">
              Achievements
            </h3>
            <p className="text-xs text-[#6B7280]">
              Track the progress of this user across the Koajo achievement
              system.
            </p>

            <div className="mt-5">
              <AchievementsSection
                data={achievements}
                isLoading={isAchievementsLoading}
                error={achievementsError ?? null}
              />
            </div>
          </div>
        </div>
      )}

      <UserPodsModal
        open={podsModalOpen}
        onOpenChange={setPodsModalOpen}
        pods={pods ?? []}
        isLoading={isPodsLoading}
        error={podsError ?? null}
      />
    </section>
  );
}

/*
Legacy user details implementation retained for reference.

import React, { useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import { ChevronDown, Download, Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
import DataTable, { type Column } from "@/components/ui/data-table";
import { Pagination } from "@/components/ui/pagination";
import { GroupCard, type GroupCardData } from "./components/group-card";
import { GroupDetailsDialog } from "./components/group-details-dialog";
import { ConfirmDeleteDialog } from "@/components/ui/confirm-delete-dialog";
import { Link } from "react-router-dom";
import { AddNewMembersDialog } from "@/components/modals/add-new-members-dialog";

type TabKey =
  | "Users Details"
  | "Contribution History"
  | "Group History"
  | "Activity Logs";

function TopTabs({
  active,
  onChange,
}: {
  active: TabKey;
  onChange: (t: TabKey) => void;
}) {
  const tabs: TabKey[] = [
    "Users Details",
    "Contribution History",
    "Group History",
    "Activity Logs",
  ];
  return (
    <div className="flex items-center gap-6 border-b px-2">
      {tabs.map((t) => {
        const isActive = t === active;
        return (
          <button
            key={t}
            onClick={() => onChange(t)}
            className={`relative pb-3 text-sm ${
              isActive ? "text-[#1F2937]" : "text-[#8A9099] hover:text-[#1F2937]"
            }`}
          >
            {t}
            {isActive && (
              <span className="absolute -bottom-[1px] left-0 right-0 h-[2px] bg-[#FF8C42] rounded-full" />
            )}
          </button>
        );
      })}
    </div>
  );
}

export default function UserManagementDetailsPage() {
  const { id } = useParams();
  const [tab, setTab] = useState<TabKey>("Users Details");

  return (
    <section className="space-y-6">
      <nav className="text-sm text-[#6B7280]">
        <Link to="/users-management" className="hover:underline text-[#374151]">
          Users Management
        </Link>
        <span className="mx-2 text-[#9CA3AF]">/</span>
        <span className="text-[#9CA3AF]">
          User #{String(id).padStart(6, "0")}
        </span>
      </nav>

      <div className="rounded-2xl border bg-white shadow-sm">
        <div className="flex items-center justify-between px-6 pt-4">
          <TopTabs active={tab} onChange={setTab} />
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              className="rounded-xl h-9 px-3 inline-flex items-center gap-2"
            >
              <Download className="h-4 w-4" />
              Export <ChevronDown className="h-4 w-4" />
            </Button>
          </div>
        </div>

        <div className="px-6 pb-6">
          {tab === "Users Details" && <UsersDetailsCard userId={String(id)} />}
          {tab === "Contribution History" && <ContributionHistoryTable />}
          {tab === "Group History" && <GroupHistoryTable />}
          {tab === "Activity Logs" && <ActivityLogs />}
        </div>
      </div>
    </section>
  );
}

function UsersDetailsCard({ userId }: { userId: string }) {
  return (
    <div className="pt-4 space-y-6">
      <div className="flex items-center gap-3">
        <h2 className="text-[22px] font-semibold">
          User ID #{userId.padStart(6, "0")}
        </h2>
        <span className="inline-flex items-center rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-medium text-emerald-600">
          Verified
        </span>
      </div>

      <div>
        <h3 className="text-sm font-semibold text-[#1F2937] mb-2">Customer</h3>
        <div className="grid grid-cols-[1fr_1fr_1fr_2fr] items-center border-y py-3">
          <div className="flex items-center gap-3">
            <span className="grid h-9 w-9 place-items-center rounded-full bg-orange-100 text-orange-600 font-semibold">
              R
            </span>
            <span className="text-sm font-medium">Regina Cooper</span>
          </div>
          <span className="text-sm text-[#6B7280]">example@mail.com</span>
          <span className="text-sm text-[#6B7280]">+1(070) 4567–8800</span>
          <span className="text-sm text-[#6B7280]">
            993 E. Brewer St. Holtsville, NY 11742
          </span>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-4">
        <div className="space-y-3">
          <h4 className="text-sm font-semibold">verified KYC documents</h4>
          <div className="rounded-xl border p-3 inline-flex items-center gap-3">
            <span className="grid h-9 w-9 place-items-center rounded-lg bg-rose-50 text-rose-600">
              PDF
            </span>
            <div className="text-sm">
              <div>Resume.pdf</div>
              <div className="text-xs text-[#6B7280]">570 KB</div>
            </div>
            <button
              className="ml-auto rounded-lg border p-2 text-[#6B7280] hover:bg-gray-50"
              title="Download"
            >
              <Download className="h-4 w-4" />
            </button>
          </div>
        </div>

        <div className="space-y-3">
          <h4 className="text-sm font-semibold">Pod Type</h4>
          <div className="inline-flex items-center rounded-full bg-emerald-100 px-3 py-1 text-sm font-medium text-emerald-700">
            $ 100 Pod
          </div>
        </div>

        <div className="space-y-3 md:col-span-1">
          <h4 className="text-sm font-semibold">Address Details</h4>
          <dl className="space-y-1 text-sm text-[#6B7280]">
            <div>
              <dt className="inline text-[#9CA3AF]">Address Line 1:</dt>{" "}
              <dd className="inline">993 E. Brewer St. Holtsville</dd>
            </div>
            <div>
              <dt className="inline text-[#9CA3AF]">City:</dt>{" "}
              <dd className="inline">New York</dd>
            </div>
            <div>
              <dt className="inline text-[#9CA3AF]">Country:</dt>{" "}
              <dd className="inline">United States</dd>
            </div>
            <div>
              <dt className="inline text-[#9CA3AF]">State/Region:</dt>{" "}
              <dd className="inline">New York</dd>
            </div>
            <div>
              <dt className="inline text-[#9CA3AF]">Postcode:</dt>{" "}
              <dd className="inline">11742</dd>
            </div>
          </dl>
        </div>

        <div className="space-y-3 md:col-span-1">
          <h4 className="text-sm font-semibold">Payment Details</h4>
          <dl className="space-y-1 text-sm text-[#6B7280]">
            <div>
              <dt className="inline text-[#9CA3AF]">Card Number:</dt>{" "}
              <dd className="inline">5890 – 6858 – 6332 – 9843</dd>
            </div>
            <div>
              <dt className="inline text-[#9CA3AF]">Card Name:</dt>{" "}
              <dd className="inline">Regina Cooper</dd>
            </div>
            <div>
              <dt className="inline text-[#9CA3AF]">Card Expiry:</dt>{" "}
              <dd className="inline">12/2023</dd>
            </div>
          </dl>
        </div>
      </div>
    </div>
  );
}

interface TxRow {
  id: number;
  invoice: string;
  date: string;
  time: string;
  amount: number;
  status: "Success" | "pending";
}

function ContributionHistoryTable() {
  const rows: TxRow[] = Array.from({ length: 50 }).map((_, i) => ({
    id: i + 1,
    invoice: ["BUBU2928999", "01-MMND9JXN", "129092N2K9OO", "93N F03NMF3K"][
      i % 4
    ],
    date: [
      "October 20, 2025",
      "October 24, 2022",
      "November 01, 2022",
      "November 08, 2022",
    ][i % 4],
    time: "01:32 PM",
    amount: [-32, -64, 100, -32][i % 4],
    status: (["Success", "Success", "Success", "pending"] as const)[i % 4],
  }));

  const columns: Column<TxRow>[] = [
    { key: "invoice", label: "Invoice", className: "text-[#374151]" },
    {
      key: "date",
      label: "Date & Time",
      render: (_, r) => (
        <div className="text-[#374151]">
          <div>{r.date}</div>
          <div className="text-xs text-[#6B7280]">{r.time}</div>
        </div>
      ),
    },
    {
      key: "amount",
      label: "Amount",
      render: (v: number) => (
        <span className={`${v >= 0 ? "text-emerald-600" : "text-[#111827]"}`}>
          {v >= 0 ? \`+$\${v.toFixed(2)}\` : \`-$\${Math.abs(v).toFixed(2)}\`}
        </span>
      ),
    },
    {
      key: "status",
      label: "Status",
      render: (v: TxRow["status"]) => (
        <span
          className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ${
            v === "Success"
              ? "bg-emerald-50 text-emerald-600"
              : "bg-amber-50 text-amber-700"
          }`}
        >
          {v}
        </span>
      ),
    },
    {
      key: "action",
      label: "Action",
      width: 80,
      render: () => (
        <button
          className="h-8 w-8 inline-grid place-items-center rounded-lg hover:bg-gray-100"
          title="View"
        >
          <Eye className="h-4 w-4 text-gray-500" />
        </button>
      ),
    },
  ];

  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [selected, setSelected] = useState<number[]>([]);

  return (
    <div className="pt-4">
      <DataTable<TxRow>
        title=""
        data={rows}
        columns={columns}
        showCheckboxes
        searchable
        searchPlaceholder="Search for transaction here"
        filterable={false}
        page={page}
        pageSize={pageSize}
        onPageChange={setPage}
        onPageSizeChange={setPageSize}
        pageSizeOptions={[10, 20, 50, 100]}
        selectedRows={selected}
        onRowSelect={(ids) => setSelected(ids as number[])}
      />
    </div>
  );
}

function GroupHistoryTable() {
  const allGroups: GroupCardData[] = useMemo(
    () =>
      Array.from({ length: 24 }).map((_, i) => ({
        id: i + 1,
        groupId: \`#9044\${4904 + i}\`,
        podLabel: i % 3 === 1 ? "$ 200 Pod" : "$ 100 Pod",
        podTone:
          i % 3 === 1
            ? "bg-rose-100 text-rose-700"
            : "bg-emerald-100 text-emerald-700",
        progress: i % 3 === 1 ? 50 : 100,
        updatedLabel: "1 week ago",
        members: [
          { initials: "A", color: "bg-sky-200 text-sky-700" },
          { initials: "B", color: "bg-amber-200 text-amber-700" },
          { initials: "C", color: "bg-purple-200 text-purple-700" },
          { initials: "D", color: "bg-pink-200 text-pink-700" },
          { initials: "E", color: "bg-indigo-200 text-indigo-700" },
        ],
      })),
    [],
  );

  const [items, setItems] = useState<GroupCardData[]>(allGroups);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(6);
  const [addOpen, setAddOpen] = useState(false);

  const totalCount = items.length;
  const totalPages = Math.max(1, Math.ceil(totalCount / pageSize));
  const clampedPage = Math.min(page, totalPages);
  const start = (clampedPage - 1) * pageSize;
  const end = start + pageSize;
  const slice = items.slice(start, end);

  const [open, setOpen] = useState(false);
  const [activeGroupId, setActiveGroupId] = useState<string>("");

  const [deleteOpen, setDeleteOpen] = useState(false);
  const [pendingGroup, setPendingGroup] = useState<GroupCardData | null>(null);

  const onView = (g: GroupCardData) => {
    setActiveGroupId(g.groupId);
    setOpen(true);
  };
  const onDeleteAsk = (g: GroupCardData) => {
    setPendingGroup(g);
    setDeleteOpen(true);
  };

  return (
    <div className="pt-4">
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {slice.map((g) => (
          <GroupCard
            key={g.id}
            data={g}
            onView={() => onView(g)}
            onDelete={() => onDeleteAsk(g)}
          />
        ))}
        {slice.length === 0 && (
          <div className="col-span-full rounded-2xl border border-dashed bg-gray-50/50 px-6 py-12 text-center">
            <div className="text-sm font-medium text-[#111827]">
              No groups on this page
            </div>
            <div className="text-xs text-[#6B7280]">
              Try a different page or page size.
            </div>
          </div>
        )}
      </div>

      <div className="mt-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="relative">
            <select
              value={pageSize}
              onChange={(e) => {
                setPageSize(Number(e.target.value));
                setPage(1);
              }}
              className="appearance-none rounded-xl border bg-white px-3 py-1.5 text-sm pr-7"
              aria-label="Cards per page"
            >
              {[6, 12, 18].map((n) => (
                <option key={n} value={n}>
                  {n}
                </option>
              ))}
            </select>
            <span className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 text-gray-400">
              ▾
            </span>
          </div>
          <span className="text-sm text-[#6B7280]">
            Showing {slice.length} of {totalCount} groups
          </span>
        </div>
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            className="rounded-xl h-9 px-3 text-sm inline-flex items-center gap-2"
            onClick={() => setAddOpen(true)}
          >
            + Add New Member
          </Button>
          <Pagination
            page={clampedPage}
            totalPages={totalPages}
            onPageChange={setPage}
          />
        </div>
      </div>

      <GroupDetailsDialog
        open={open}
        onOpenChange={setOpen}
        groupId={activeGroupId}
      />

      <ConfirmDeleteDialog
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        title="Remove group"
        itemName={pendingGroup?.groupId}
        onConfirm={() => {
          if (!pendingGroup) return;
          setItems((prev) => prev.filter((g) => g.id !== pendingGroup.id));
        }}
      />

      <AddNewMembersDialog open={addOpen} onOpenChange={setAddOpen} />
    </div>
  );
}

function ActivityLogs() {
  return (
    <div className="pt-4 text-sm text-[#6B7280]">
      Activity logs content will be available soon.
    </div>
  );
}
*/
