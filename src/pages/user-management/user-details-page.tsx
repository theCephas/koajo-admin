import React, { useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import {
  ArrowLeft,
  CalendarIcon,
  CircleDollarSign,
  FlagTriangleRight,
  Link2Off,
  Loader2,
  Mail,
  Medal,
  MoreVertical,
  Phone,
  Send,
  Target,
  Trash2,
  Trophy,
} from "lucide-react";
import { format } from "date-fns";

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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import {
  AccountAvatar,
  getAccountDisplayName,
} from "./components/account-avatar";
import { AccountStatusPill } from "./components/account-status-pill";
import {
  useAccountAchievementsQuery,
  useAccountCurrentPodsQuery,
  useAccountPaymentsQuery,
  useAccountQuery,
  useUpdateAccountNotificationsMutation,
  useToggleAccountStatusMutation,
  useRemoveAccountBankConnectionMutation,
  useDeleteAccountMutation,
  type AccountAchievementsQueryError,
  type AccountCurrentPodsQueryError,
  type AccountPaymentsQueryError,
  type AccountQueryError,
  type UpdateAccountNotificationsError,
  accountQueryKey,
} from "@/hooks/queries/use-accounts";
import {
  useEmailTemplatesQuery,
  useSendManualEmailMutation,
} from "@/hooks/queries/use-email-templates";
import type {
  AccountAchievement,
  AccountCurrentPod,
  AccountPayment,
  AccountDetails,
} from "@/services/api";
import {
  AccountFlagsControls,
  getAccountFlagReasons,
} from "./components/account-flags-controls";
import { queryClient } from "@/lib/query-client";

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
  podsCount,
  isPodsLoading,
  onViewPods,
  paymentsCount,
  isPaymentsLoading,
  onViewPayments,
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
  podsCount: number;
  isPodsLoading: boolean;
  onViewPods: () => void;
  paymentsCount: number;
  isPaymentsLoading: boolean;
  onViewPayments: () => void;
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
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          icon={<Medal className="h-4 w-4 text-blue-600" />}
          label="Achievements earned"
          value={`${earnedAchievements.length}`}
          tone="blue"
        />
        <StatCard
          icon={<Target className="h-4 w-4 text-amber-600" />}
          label="Available achievements"
          value={`${data?.totalAvailable ?? 0}`}
          tone="amber"
        />
        <StatCard
          icon={<CircleDollarSign className="h-4 w-4 text-blue-600" />}
          label="Active Pods"
          value={isPodsLoading ? "..." : `${podsCount}`}
          tone="blue"
          showButton={podsCount > 0}
          buttonText="View Pods"
          btnClick={onViewPods}
        />
        <StatCard
          icon={<CircleDollarSign className="h-4 w-4 text-emerald-600" />}
          label="Payments"
          value={isPaymentsLoading ? "..." : `${paymentsCount}`}
          tone="emerald"
          showButton={paymentsCount > 0}
          buttonText="View"
          btnClick={onViewPayments}
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
  showButton,
  buttonText,
  btnClick,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  tone: "emerald" | "amber" | "blue";
  showButton?: boolean;
  buttonText?: string;
  btnClick?: () => void;
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
      {showButton && (
        <div className="w-full flex justify-end">
          <Button variant="outline" onClick={btnClick}>
            {buttonText}
          </Button>
        </div>
      )}
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
  const [statusConfirmOpen, setStatusConfirmOpen] = useState(false);
  const [bankConfirmOpen, setBankConfirmOpen] = useState(false);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [emailDialogOpen, setEmailDialogOpen] = useState(false);
  const accountName = getAccountDisplayName(account);
  const isActivating = !account.isActive;

  const { mutate: toggleStatus, isPending: isTogglingStatus } =
    useToggleAccountStatusMutation(account.id, {
      onSuccess: (data) => {
        setStatusConfirmOpen(false);
        void queryClient.refetchQueries({
          queryKey: accountQueryKey(account.id),
        });
        toast.success(
          `Account ${data.isActive ? "activated" : "disabled"} successfully`,
        );
      },
      onError: (error) => {
        const message =
          error.response?.data?.message ??
          error.message ??
          "Failed to update account status";
        toast.error(message);
      },
    });

  const { mutate: removeBankConnection, isPending: isRemovingBank } =
    useRemoveAccountBankConnectionMutation(account.id, {
      onSuccess: () => {
        setBankConfirmOpen(false);
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

  const handleToggleStatus = () => {
    toggleStatus({
      isActive: !account.isActive,
    });
  };

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
            disabled={isTogglingStatus || isRemovingBank || isDeleting}
          >
            <MoreVertical className="h-4 w-4 text-[#6B7280]" />
            <span className="sr-only">More actions</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-[260px] space-y-2">
          <div className="px-2 pb-2">
            <AccountFlagsControls account={account} />
          </div>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            className="cursor-pointer"
            onSelect={(event) => {
              event.preventDefault();
              setEmailDialogOpen(true);
            }}
          >
            <Send className="mr-2 h-4 w-4" aria-hidden="true" />
            Send Email
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            className="cursor-pointer"
            onSelect={(event) => {
              event.preventDefault();
              setStatusConfirmOpen(true);
            }}
            disabled={isTogglingStatus}
          >
            {isActivating ? "Activate Account" : "Disable Account"}
          </DropdownMenuItem>
          {account.bankAccountLinked && (
            <>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                className="cursor-pointer text-rose-600 focus:text-rose-600"
                onSelect={(event) => {
                  event.preventDefault();
                  setBankConfirmOpen(true);
                }}
                disabled={isRemovingBank}
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
        open={statusConfirmOpen}
        onOpenChange={(open) => {
          if (!isTogglingStatus) {
            setStatusConfirmOpen(open);
          }
        }}
      >
        <DialogContent className="sm:max-w-[440px] rounded-2xl p-6">
          <DialogHeader>
            <DialogTitle className="text-[18px]">
              {isActivating ? "Activate Account" : "Disable Account"}
            </DialogTitle>
            <DialogDescription>
              {isActivating
                ? `Are you sure you want to activate "${accountName}"? This will restore their access to the platform.`
                : `Are you sure you want to disable "${accountName}"? This will temporarily block their access to the platform.`}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="mt-4">
            <Button
              variant="outline"
              onClick={() => setStatusConfirmOpen(false)}
              disabled={isTogglingStatus}
            >
              Cancel
            </Button>
            <Button
              onClick={handleToggleStatus}
              disabled={isTogglingStatus}
              variant={isActivating ? "default" : "destructive"}
            >
              {isTogglingStatus
                ? isActivating
                  ? "Activating..."
                  : "Disabling..."
                : isActivating
                  ? "Activate"
                  : "Disable"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog
        open={bankConfirmOpen}
        onOpenChange={(open) => {
          if (!isRemovingBank) {
            setBankConfirmOpen(open);
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
              onClick={() => setBankConfirmOpen(false)}
              disabled={isRemovingBank}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={() => removeBankConnection()}
              disabled={isRemovingBank}
            >
              {isRemovingBank ? "Removing…" : "Remove"}
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

      <SendEmailDialog
        open={emailDialogOpen}
        onOpenChange={setEmailDialogOpen}
        account={account}
      />
    </>
  );
};

const SendEmailDialog = ({
  open,
  onOpenChange,
  account,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  account: AccountDetails;
}) => {
  const [selectedTemplate, setSelectedTemplate] = useState<string>("");
  const [variables, setVariables] = useState<Record<string, string>>({});

  const { data: emailTemplates = [], isLoading: isLoadingTemplates } =
    useEmailTemplatesQuery();

  const { mutate: sendEmail, isPending: isSendingEmail } =
    useSendManualEmailMutation({
      onSuccess: () => {
        toast.success("Email sent successfully");
        onOpenChange(false);
        setSelectedTemplate("");
        setVariables({});
      },
      onError: (error) => {
        const message =
          error.response?.data?.message ??
          error.message ??
          "Failed to send email";
        toast.error(message);
      },
    });

  const template = emailTemplates.find((t) => t.code === selectedTemplate);

  const handleTemplateChange = (templateCode: string) => {
    const newTemplate = emailTemplates.find((t) => t.code === templateCode);
    if (!newTemplate) return;

    const initialVars: Record<string, string> = {};
    newTemplate.variables.forEach((variable) => {
      switch (variable.key) {
        case "firstName":
          initialVars[variable.key] = account.firstName ?? "";
          break;
        case "lastName":
          initialVars[variable.key] = account.lastName ?? "";
          break;
        case "email":
          initialVars[variable.key] = account.email;
          break;
        case "phoneNumber":
          initialVars[variable.key] = account.phoneNumber ?? "";
          break;
        default:
          initialVars[variable.key] = "";
          break;
      }
    });

    setSelectedTemplate(templateCode);
    setVariables(initialVars);
  };

  const handleVariableChange = (key: string, value: string) => {
    setVariables((prev) => ({ ...prev, [key]: value }));
  };

  const isAllVariablesFilled = () => {
    if (!template) return false;
    const requiredVars = template.variables.filter((v) => v.required);
    return requiredVars.every((variable) => variables[variable.key]?.trim());
  };

  const handleSendEmail = () => {
    if (!template) return;

    sendEmail({
      templateCode: template.code,
      subject: template.subject,
      recipients: [
        {
          email: account.email,
          variables,
        },
      ],
    });
  };

  const userFieldKeys = ["firstName", "lastName", "email", "phoneNumber"];

  return (
    <Dialog
      open={open}
      onOpenChange={(isOpen) => {
        if (!isSendingEmail) {
          onOpenChange(isOpen);
          if (!isOpen) {
            setSelectedTemplate("");
            setVariables({});
          }
        }
      }}
    >
      <DialogContent className="max-w-2xl rounded-2xl p-6 max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-[18px]">Send Email</DialogTitle>
          <DialogDescription>
            Send a personalized email to {getAccountDisplayName(account)} (
            {account.email})
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 mt-4">
          <div className="space-y-1.5">
            <Label htmlFor="template-select" className="text-sm">
              Email Template <span className="text-rose-500">*</span>
            </Label>
            {isLoadingTemplates ? (
              <div className="flex items-center gap-2 text-sm text-[#6B7280]">
                <Loader2 className="h-4 w-4 animate-spin" />
                Loading templates…
              </div>
            ) : (
              <Select
                value={selectedTemplate}
                onValueChange={handleTemplateChange}
                disabled={isSendingEmail}
              >
                <SelectTrigger id="template-select">
                  <SelectValue placeholder="Select an email template" />
                </SelectTrigger>
                <SelectContent>
                  {emailTemplates.map((template) => (
                    <SelectItem key={template.code} value={template.code}>
                      {template.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          </div>

          {template && (
            <div className="rounded-xl border border-[#E5E7EB] bg-[#F9FAFB] p-4 space-y-2">
              <div>
                <span className="text-xs font-semibold uppercase tracking-wide text-[#9CA3AF]">
                  Subject
                </span>
                <p className="text-sm text-[#111827]">{template.subject}</p>
              </div>
              <div>
                <span className="text-xs font-semibold uppercase tracking-wide text-[#9CA3AF]">
                  Description
                </span>
                <p className="text-sm text-[#6B7280]">
                  {template.description || "No description provided."}
                </p>
              </div>
            </div>
          )}

          {template && template.variables.length > 0 && (
            <div className="space-y-3">
              <div className="text-sm font-semibold text-[#111827]">
                Template Variables
              </div>
              <div className="space-y-3">
                {template.variables.map((variable) => {
                  const isUserField = userFieldKeys.includes(variable.key);
                  const currentValue = variables[variable.key] || "";
                  const isDateField =
                    variable.key.toLowerCase().includes("date") ||
                    variable.label.toLowerCase().includes("date");

                  return (
                    <div key={variable.key} className="space-y-1.5">
                      <Label
                        htmlFor={`var-${variable.key}`}
                        className="text-sm flex items-center gap-2"
                      >
                        <span>
                          {variable.label}
                          {variable.required && (
                            <span className="text-rose-500 ml-1">*</span>
                          )}
                        </span>
                        {isUserField && (
                          <span className="text-xs text-blue-600 font-normal">
                            (auto-filled)
                          </span>
                        )}
                      </Label>
                      {isDateField ? (
                        <Popover>
                          <PopoverTrigger asChild>
                            <Button
                              variant="outline"
                              className={cn(
                                "w-full justify-start text-left font-normal",
                                !currentValue && "text-muted-foreground",
                              )}
                              disabled={isSendingEmail}
                            >
                              <CalendarIcon className="mr-2 h-4 w-4" />
                              {currentValue ? (
                                format(new Date(currentValue), "PPP")
                              ) : (
                                <span>Pick a date</span>
                              )}
                            </Button>
                          </PopoverTrigger>
                          <PopoverContent
                            className="w-[300px] p-0"
                            align="start"
                          >
                            <Calendar
                              className="w-full"
                              mode="single"
                              selected={
                                currentValue
                                  ? new Date(currentValue)
                                  : undefined
                              }
                              onSelect={(date) => {
                                if (date) {
                                  handleVariableChange(
                                    variable.key,
                                    format(date, "yyyy-MM-dd"),
                                  );
                                }
                              }}
                              disabled={isSendingEmail}
                              initialFocus
                            />
                          </PopoverContent>
                        </Popover>
                      ) : (
                        <Input
                          id={`var-${variable.key}`}
                          value={currentValue}
                          onChange={(e) =>
                            handleVariableChange(variable.key, e.target.value)
                          }
                          placeholder={`Enter ${variable.label.toLowerCase()}`}
                          disabled={isSendingEmail}
                          required={variable.required}
                        />
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        <DialogFooter className="mt-6">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isSendingEmail}
          >
            Cancel
          </Button>
          <Button
            onClick={handleSendEmail}
            disabled={
              !selectedTemplate || !isAllVariablesFilled() || isSendingEmail
            }
          >
            {isSendingEmail ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Sending…
              </>
            ) : (
              <>
                <Send className="mr-2 h-4 w-4" />
                Send Email
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
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
  const formatCurrency = (value: number | null | undefined) => {
    if (value === null || value === undefined) return "—";
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 0,
    }).format(value);
  };

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
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-[#9CA3AF]">
                      Payout Position
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-[#9CA3AF]">
                      Payout Date
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
                      <td className="px-4 py-3 text-sm text-[#374151]">
                        {pod.finalOrder
                          ? `#${pod.finalOrder}`
                          : pod.joinOrder !== null
                            ? `#${pod.joinOrder}`
                            : "—"}
                      </td>
                      <td className="px-4 py-3 text-sm text-[#6B7280]">
                        {pod.payoutDate ? formatDate(pod.payoutDate) : "—"}
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

const PaymentsModal = ({
  open,
  onOpenChange,
  payments,
  isLoading,
  error,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  payments: AccountPayment[];
  isLoading: boolean;
  error: AccountPaymentsQueryError | null;
}) => {
  const formatCurrency = (value: string) => {
    const numValue = parseFloat(value);
    if (isNaN(numValue)) return "—";
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 2,
    }).format(numValue);
  };

  const formatDate = (isoString?: string | null) => {
    if (!isoString) return "—";
    const date = new Date(isoString);
    if (Number.isNaN(date.getTime())) return "—";
    return new Intl.DateTimeFormat("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(date);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-5xl rounded-2xl p-6 max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="text-[18px]">Payment History</DialogTitle>
          <DialogDescription>
            All payments recorded for this account.
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto -mx-6 px-6">
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
              <span className="ml-2 text-sm text-[#6B7280]">
                Loading payments…
              </span>
            </div>
          ) : error ? (
            <div className="rounded-xl border border-rose-100 bg-rose-50 px-4 py-3 text-sm text-rose-700">
              {error.response?.data?.message ??
                error.message ??
                "Unable to load payments."}
            </div>
          ) : payments.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-[#E5E7EB] bg-[#F9FAFB] p-8 text-center">
              <div className="text-sm font-medium text-[#111827]">
                No payments found
              </div>
              <div className="text-xs text-[#6B7280]">
                Payment records will appear here once transactions are
                processed.
              </div>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="border-b border-[#E5E7EB]">
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-[#9CA3AF]">
                      Pod Plan
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-[#9CA3AF]">
                      Amount
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-[#9CA3AF]">
                      Status
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-[#9CA3AF]">
                      Stripe Reference
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-[#9CA3AF]">
                      Recorded At
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {payments.map((payment) => (
                    <tr
                      key={payment.id}
                      className="border-b border-[#E5E7EB] hover:bg-[#F9FAFB]"
                    >
                      <td className="px-4 py-3 text-sm font-medium text-[#111827]">
                        {payment.podPlanCode}
                      </td>
                      <td className="px-4 py-3 text-sm text-[#374151]">
                        {formatCurrency(payment.amount)}
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ${
                            payment.status === "succeeded"
                              ? "bg-emerald-50 text-emerald-600"
                              : payment.status === "pending"
                                ? "bg-amber-50 text-amber-700"
                                : "bg-gray-50 text-gray-600"
                          }`}
                        >
                          {payment.status}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-sm text-[#6B7280]">
                        {payment.stripeReference || "—"}
                      </td>
                      <td className="px-4 py-3 text-sm text-[#6B7280]">
                        {formatDate(payment.recordedAt)}
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
  const [paymentsModalOpen, setPaymentsModalOpen] = useState(false);

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
    data: paymentsData,
    isLoading: isPaymentsLoading,
    error: paymentsError,
  } = useAccountPaymentsQuery(accountId);

  const {
    mutate: updateNotificationPreferences,
    isPending: isUpdatingNotifications,
    error: updateNotificationsError,
  } = useUpdateAccountNotificationsMutation(accountId);

  const pendingNotificationError = updateNotificationsError ?? null;
  const podsCount = pods?.length ?? 0;
  const paymentsCount = paymentsData?.total ?? 0;
  const payments = paymentsData?.items ?? [];

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
                <InfoRow
                  label="Bank name"
                  value={
                    account.bankAccount?.bankName ?? "No bank account linked"
                  }
                />
                <InfoRow
                  label="Account number"
                  value={
                    account.bankAccount
                      ? `****${account.bankAccount.accountLast4}`
                      : "—"
                  }
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
                podsCount={podsCount}
                isPodsLoading={isPodsLoading}
                onViewPods={() => setPodsModalOpen(true)}
                paymentsCount={paymentsCount}
                isPaymentsLoading={isPaymentsLoading}
                onViewPayments={() => setPaymentsModalOpen(true)}
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

      <PaymentsModal
        open={paymentsModalOpen}
        onOpenChange={setPaymentsModalOpen}
        payments={payments}
        isLoading={isPaymentsLoading}
        error={paymentsError ?? null}
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
