/* eslint-disable @typescript-eslint/no-misused-promises */
import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  CalendarIcon,
  FlagTriangleRight,
  Loader2,
  Mail,
  MoreVertical,
  Search,
  Trash2,
} from "lucide-react";
import { format } from "date-fns";
import { toast } from "sonner";

import DataTable, { type Column } from "@/components/ui/data-table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
import { Label } from "@/components/ui/label";
import {
  useAccountsQuery,
  useToggleAccountStatusMutation,
  useDeleteAccountMutation,
  type AccountsQueryError,
  accountsQueryKey,
} from "@/hooks/queries/use-accounts";
import type { AccountSummary } from "@/services/api";
import {
  AccountAvatar,
  getAccountDisplayName,
} from "./components/account-avatar";
import { AccountStatusPill } from "./components/account-status-pill";
import {
  AccountFlagsControls,
  getAccountFlagReasons,
} from "./components/account-flags-controls";
import { useDebouncedValue } from "@/hooks/use-debounce";
import { queryClient } from "@/lib/query-client";
import {
  useEmailTemplatesQuery,
  useSendManualEmailMutation,
} from "@/hooks/queries/use-email-templates";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";

const PAGE_SIZE_OPTIONS = [10, 20, 50];

const formatDate = (isoString: string) => {
  if (!isoString) return "—";
  const date = new Date(isoString);
  if (Number.isNaN(date.getTime())) return "—";

  return new Intl.DateTimeFormat("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  }).format(date);
};

const NotificationPill = ({
  enabled,
  label,
}: {
  enabled: boolean;
  label: string;
}) => (
  <span
    className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${enabled ? "bg-blue-50 text-blue-600" : "bg-gray-100 text-gray-500"}`}
  >
    {label}
  </span>
);

const NotificationsSummary = ({ account }: { account: AccountSummary }) => (
  <div className="flex flex-wrap items-center gap-2">
    <NotificationPill
      enabled={account.emailNotificationsEnabled}
      label="Email"
    />
    <NotificationPill
      enabled={account.transactionNotificationsEnabled}
      label="Transactions"
    />
  </div>
);

const ErrorBanner = ({
  error,
  onRetry,
}: {
  error: AccountsQueryError;
  onRetry: () => void;
}) => {
  const message =
    error.response?.data?.message ?? error.message ?? "Something went wrong.";

  return (
    <div className="rounded-xl border border-rose-100 bg-rose-50 px-4 py-3 text-sm text-rose-700">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <span>{message}</span>
        <Button variant="outline" size="sm" onClick={onRetry}>
          Try again
        </Button>
      </div>
    </div>
  );
};

const AccountActions = ({ account }: { account: AccountSummary }) => {
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const accountName = getAccountDisplayName(account);
  const isActivating = !account.isActive;

  const { mutate: toggleStatus, isPending } = useToggleAccountStatusMutation(
    account.id,
    {
      onSuccess: (data) => {
        setConfirmOpen(false);
        void queryClient.refetchQueries({ queryKey: accountsQueryKey({}) });
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
    },
  );

  const { mutate: deleteAccount, isPending: isDeleting } =
    useDeleteAccountMutation(account.id, {
      onSuccess: () => {
        setDeleteConfirmOpen(false);
        void queryClient.refetchQueries({ queryKey: accountsQueryKey({}) });
        toast.success("User deleted successfully");
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
          <DropdownMenuSeparator />
          <DropdownMenuItem
            className="cursor-pointer"
            onSelect={(event) => {
              event.preventDefault();
              setConfirmOpen(true);
            }}
            disabled={isPending}
          >
            {isActivating ? "Activate Account" : "Disable Account"}
          </DropdownMenuItem>
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
              onClick={() => setConfirmOpen(false)}
              disabled={isPending}
            >
              Cancel
            </Button>
            <Button
              onClick={handleToggleStatus}
              disabled={isPending}
              variant={isActivating ? "default" : "destructive"}
            >
              {isPending
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

export default function UserManagement() {
  const navigate = useNavigate();

  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [selectedAccountIds, setSelectedAccountIds] = useState<string[]>([]);
  const [bulkEmailDialogOpen, setBulkEmailDialogOpen] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<string>("");
  const [currentRecipientIndex, setCurrentRecipientIndex] = useState(0);
  const [recipientVariables, setRecipientVariables] = useState<
    Record<string, Record<string, string>>
  >({});

  const debouncedSearch = useDebouncedValue(search.trim());

  const queryParams = useMemo(
    () => ({
      search: debouncedSearch || undefined,
      limit: pageSize,
      offset: (page - 1) * pageSize,
    }),
    [debouncedSearch, page, pageSize],
  );

  const { data, isLoading, isFetching, isError, error, refetch } =
    useAccountsQuery(queryParams);

  const totalCount = (data as { total?: number } | undefined)?.total ?? 0;
  const accounts =
    (data as { items: AccountSummary[] } | undefined)?.items ?? [];

  const { data: emailTemplates = [], isLoading: templatesLoading } =
    useEmailTemplatesQuery();

  const { mutate: sendBulkEmail, isPending: isSendingEmail } =
    useSendManualEmailMutation({
      onSuccess: () => {
        toast.success("Emails sent successfully");
        setBulkEmailDialogOpen(false);
        setSelectedAccountIds([]);
        setSelectedTemplate("");
        setCurrentRecipientIndex(0);
        setRecipientVariables({});
      },
      onError: (error) => {
        const message =
          error.response?.data?.message ??
          error.message ??
          "Failed to send emails";
        toast.error(message);
      },
    });

  useEffect(() => {
    if (!data) return;
    const maxPage = Math.max(
      1,
      Math.ceil(
        ((data as { total?: number } | undefined)?.total ?? 0) / pageSize,
      ),
    );
    if (page > maxPage) {
      setPage(maxPage);
    }
  }, [data, page, pageSize]);

  useEffect(() => {
    setPage(1);
  }, [debouncedSearch]);

  useEffect(() => {
    setPage(1);
  }, [pageSize]);

  useEffect(() => {
    setSelectedAccountIds([]);
  }, [page, pageSize, debouncedSearch]);

  const isAllVariablesFilled = () => {
    if (!selectedTemplate) return false;

    const template = emailTemplates.find((t) => t.code === selectedTemplate);
    if (!template) return false;

    const selectedAccounts = accounts.filter((account) =>
      selectedAccountIds.includes(account.id),
    );

    const requiredVars = template.variables.filter((v) => v.required);

    for (const account of selectedAccounts) {
      const recipientVars = recipientVariables[account.id] || {};

      for (const variable of requiredVars) {
        if (!recipientVars[variable.key]?.trim()) {
          return false;
        }
      }
    }

    return true;
  };

  const handleSendBulkEmail = () => {
    if (!selectedTemplate) {
      toast.error("Please select an email template");
      return;
    }

    if (selectedAccountIds.length === 0) {
      toast.error("Please select at least one user");
      return;
    }

    const selectedAccounts = accounts.filter((account) =>
      selectedAccountIds.includes(account.id),
    );

    const template = emailTemplates.find((t) => t.code === selectedTemplate);

    if (!template) {
      toast.error("Invalid template selected");
      return;
    }

    sendBulkEmail({
      templateCode: selectedTemplate,
      subject: template.subject,
      recipients: selectedAccounts.map((account) => ({
        email: account.email,
        variables: recipientVariables[account.id] || {},
      })),
    });
  };

  const handleOpenBulkEmailDialog = () => {
    if (selectedAccountIds.length === 0) {
      toast.error("Please select at least one user to send emails");
      return;
    }
    setBulkEmailDialogOpen(true);
  };

  const handleTemplateChange = (templateCode: string) => {
    const template = emailTemplates.find((t) => t.code === templateCode);
    if (!template) return;

    const selectedAccounts = accounts.filter((account) =>
      selectedAccountIds.includes(account.id),
    );

    const initialRecipientVars: Record<string, Record<string, string>> = {};
    selectedAccounts.forEach((account) => {
      const vars: Record<string, string> = {};
      template.variables.forEach((variable) => {
        switch (variable.key) {
          case "firstName":
            vars[variable.key] = account.firstName ?? "";
            break;
          case "lastName":
            vars[variable.key] = account.lastName ?? "";
            break;
          case "email":
            vars[variable.key] = account.email;
            break;
          case "phoneNumber":
            vars[variable.key] = account.phoneNumber ?? "";
            break;
          default:
            vars[variable.key] = "";
            break;
        }
      });
      initialRecipientVars[account.id] = vars;
    });

    // Update all states together
    setSelectedTemplate(templateCode);
    setCurrentRecipientIndex(0);
    setRecipientVariables(initialRecipientVars);
  };

  const handleRecipientVariableChange = (key: string, value: string) => {
    const selectedAccounts = accounts.filter((account) =>
      selectedAccountIds.includes(account.id),
    );
    const currentAccount = selectedAccounts[currentRecipientIndex];
    if (!currentAccount) return;

    setRecipientVariables((prev) => ({
      ...prev,
      [currentAccount.id]: {
        ...prev[currentAccount.id],
        [key]: value,
      },
    }));
  };

  const handlePreviousRecipient = () => {
    if (currentRecipientIndex > 0) {
      setCurrentRecipientIndex(currentRecipientIndex - 1);
    }
  };

  const handleNextRecipient = () => {
    const selectedAccounts = accounts.filter((account) =>
      selectedAccountIds.includes(account.id),
    );
    if (currentRecipientIndex < selectedAccounts.length - 1) {
      setCurrentRecipientIndex(currentRecipientIndex + 1);
    }
  };

  const columns = useMemo<Column<AccountSummary>[]>(
    () => [
      {
        key: "account",
        label: "ACCOUNT",
        width: 280,
        render: (_, account) => {
          const flagReasons = getAccountFlagReasons(account);

          return (
            <div className="flex items-center gap-3">
              <AccountAvatar account={account} />
              <div className="flex flex-col">
                <div className="flex items-center gap-1">
                  <span className="text-sm font-semibold text-[#111827]">
                    {getAccountDisplayName(account)}
                  </span>
                  {flagReasons.length > 0 && (
                    <span
                      className="flex items-center"
                      title={`Flagged: ${flagReasons.join(", ")}`}
                    >
                      <FlagTriangleRight
                        className="h-3.5 w-3.5 text-amber-500"
                        aria-hidden="true"
                      />
                      <span className="sr-only">
                        Flagged: {flagReasons.join(", ")}
                      </span>
                    </span>
                  )}
                </div>
                <span className="text-xs text-[#6B7280]">{account.email}</span>
              </div>
            </div>
          );
        },
      },
      {
        key: "phoneNumber",
        label: "CONTACT",
        render: (_, account) => (
          <div className="flex flex-col text-sm text-[#374151]">
            <span>{account.phoneNumber ?? "—"}</span>
            <span className="text-xs text-[#9CA3AF]">
              Created {formatDate(account.createdAt)}
            </span>
          </div>
        ),
      },
      {
        key: "isActive",
        label: "STATUS",
        width: 120,
        render: (value) => <AccountStatusPill isActive={Boolean(value)} />,
      },
      {
        key: "notifications",
        label: "NOTIFICATIONS",
        width: 180,
        render: (_, account) => <NotificationsSummary account={account} />,
      },
      {
        key: "viewDetails",
        label: "",
        width: 140,
        render: (_, account) => (
          <div className="flex justify-end">
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate(`/users-management/${account.id}`)}
            >
              View details
            </Button>
          </div>
        ),
      },
      {
        key: "rowActions",
        label: "",
        width: 64,
        render: (_, account) => (
          <div className="flex justify-end">
            <AccountActions account={account} />
          </div>
        ),
      },
    ],
    [navigate],
  );

  return (
    <section className="space-y-6">
      <header className="space-y-4">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h1 className="text-[22px] font-semibold text-[#111827] md:text-[24px]">
              User Management
            </h1>
            <p className="text-sm text-[#6B7280]">
              Search, review, and manage all customer accounts from one place.
            </p>
          </div>
          <Button
            variant="default"
            className="rounded-xl"
            onClick={handleOpenBulkEmailDialog}
            disabled={selectedAccountIds.length === 0}
          >
            <Mail className="mr-2 h-4 w-4" />
            Send Bulk Email ({selectedAccountIds.length})
          </Button>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div className="relative w-full max-w-md">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#9CA3AF]" />
            <Input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search by name or email"
              className="pl-9"
              aria-label="Search accounts"
            />
          </div>
          <div className="text-xs font-medium uppercase tracking-wide text-[#9CA3AF]">
            Total accounts: <span className="text-[#111827]">{totalCount}</span>
          </div>
          {isFetching && !isLoading && (
            <div className="inline-flex items-center gap-2 text-xs text-[#6B7280]">
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
              Updating results…
            </div>
          )}
        </div>

        {isError && error && <ErrorBanner error={error} onRetry={refetch} />}
      </header>

      <DataTable<AccountSummary>
        title=""
        data={Array.isArray(accounts) ? accounts : []}
        columns={columns}
        showCheckboxes={true}
        searchable={false}
        filterable={false}
        page={page}
        pageSize={pageSize}
        totalCount={typeof totalCount === "number" ? totalCount : 0}
        onPageChange={setPage}
        onPageSizeChange={setPageSize}
        pageSizeOptions={PAGE_SIZE_OPTIONS}
        loading={isFetching}
        onRefresh={refetch}
        selectedRows={selectedAccountIds}
        onRowSelect={(ids) => setSelectedAccountIds(ids as string[])}
        emptyStateTitle={isLoading ? "Loading accounts…" : "No accounts found"}
        emptyStateDescription={
          isLoading
            ? "Fetching the latest accounts."
            : "Try adjusting your search query."
        }
        className="mt-2"
      />

      <Dialog
        open={bulkEmailDialogOpen}
        onOpenChange={(open) => {
          if (!isSendingEmail) {
            setBulkEmailDialogOpen(open);
            if (!open) {
              setSelectedTemplate("");
              setCurrentRecipientIndex(0);
              setRecipientVariables({});
            }
          }
        }}
      >
        <DialogContent className="sm:max-w-[600px] max-h-[85vh] overflow-y-auto rounded-2xl p-6">
          <DialogHeader>
            <DialogTitle className="text-[18px]">Send Bulk Email</DialogTitle>
            <DialogDescription>
              Send an email template to {selectedAccountIds.length} selected{" "}
              {selectedAccountIds.length === 1 ? "user" : "users"}.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="email-template">Email Template</Label>
              <Select
                value={selectedTemplate}
                onValueChange={handleTemplateChange}
                disabled={isSendingEmail || templatesLoading}
              >
                <SelectTrigger id="email-template">
                  <SelectValue
                    placeholder={
                      templatesLoading
                        ? "Loading templates..."
                        : "Select a template"
                    }
                  />
                </SelectTrigger>
                <SelectContent>
                  {emailTemplates.map((template) => (
                    <SelectItem key={template.code} value={template.code}>
                      <div className="flex flex-col items-start">
                        <span className="font-medium">{template.name}</span>
                        <span className="text-xs text-[#6B7280]">
                          {template.subject}
                        </span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {selectedTemplate &&
              (() => {
                const template = emailTemplates.find(
                  (t) => t.code === selectedTemplate,
                );
                const selectedAccounts = accounts.filter((account) =>
                  selectedAccountIds.includes(account.id),
                );
                const currentAccount = selectedAccounts[currentRecipientIndex];

                return template && currentAccount ? (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between rounded-lg border border-[#E5E7EB] bg-[#F9FAFB] p-3">
                      <div className="flex-1">
                        <p className="text-xs font-semibold uppercase tracking-wide text-[#9CA3AF]">
                          Editing Recipient
                        </p>
                        <p className="text-sm font-medium text-[#111827] mt-1">
                          {currentAccount.email}
                        </p>
                        <p className="text-xs text-[#6B7280]">
                          {currentAccount.firstName} {currentAccount.lastName}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={handlePreviousRecipient}
                          disabled={
                            currentRecipientIndex === 0 || isSendingEmail
                          }
                        >
                          Previous
                        </Button>
                        <span className="text-xs font-medium text-[#6B7280] whitespace-nowrap">
                          {currentRecipientIndex + 1} of{" "}
                          {selectedAccounts.length}
                        </span>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={handleNextRecipient}
                          disabled={
                            currentRecipientIndex ===
                              selectedAccounts.length - 1 || isSendingEmail
                          }
                        >
                          Next
                        </Button>
                      </div>
                    </div>

                    <div className="space-y-3">
                      <Label className="text-sm font-medium">
                        Template Variables
                      </Label>
                      <p className="text-xs text-[#6B7280]">
                        Customize the variables for this recipient. Auto-filled
                        fields can be edited.
                      </p>
                      <div className="space-y-3 rounded-lg border border-[#E5E7EB] bg-[#F9FAFB] p-4">
                        {template.variables.map((variable) => {
                          const userFields = [
                            "firstName",
                            "lastName",
                            "email",
                            "phoneNumber",
                          ];
                          const isUserField = userFields.includes(variable.key);
                          const currentValue =
                            recipientVariables[currentAccount.id]?.[
                              variable.key
                            ] ?? "";
                          const isDateField =
                            variable.key.toLowerCase().includes("date") ||
                            variable.label.toLowerCase().includes("date");

                          return (
                            <div key={variable.key} className="space-y-1.5">
                              <Label
                                htmlFor={`recipient-var-${variable.key}`}
                                className="text-sm flex items-center gap-2"
                              >
                                <span>
                                  {variable.label}
                                  {variable.required && (
                                    <span className="text-rose-500 ml-1">
                                      *
                                    </span>
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
                                        !currentValue &&
                                          "text-muted-foreground",
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
                                          handleRecipientVariableChange(
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
                                  id={`recipient-var-${variable.key}`}
                                  value={currentValue}
                                  onChange={(e) =>
                                    handleRecipientVariableChange(
                                      variable.key,
                                      e.target.value,
                                    )
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
                  </div>
                ) : null;
              })()}

            {selectedTemplate && (
              <>
                <div className="rounded-lg border border-[#E5E7EB] bg-[#F9FAFB] p-3">
                  <p className="text-xs font-semibold uppercase tracking-wide text-[#9CA3AF] mb-2">
                    Template Details
                  </p>
                  {(() => {
                    const template = emailTemplates.find(
                      (t) => t.code === selectedTemplate,
                    );
                    return template ? (
                      <div className="space-y-2 text-sm">
                        <div>
                          <span className="font-medium text-[#111827]">
                            {template.name}
                          </span>
                        </div>
                        <div className="text-[#6B7280]">
                          <strong>Subject:</strong> {template.subject}
                        </div>
                        {template.description && (
                          <div className="text-[#6B7280]">
                            {template.description}
                          </div>
                        )}
                        {template.variables.length > 0 && (
                          <div className="mt-2 pt-2 border-t border-[#E5E7EB]">
                            <p className="text-xs font-medium text-[#6B7280] mb-1">
                              Template variables:
                            </p>
                            <ul className="text-xs text-[#9CA3AF] space-y-0.5">
                              {template.variables.map((v) => {
                                const userFields = [
                                  "firstName",
                                  "lastName",
                                  "email",
                                  "phoneNumber",
                                ];
                                const isUserField = userFields.includes(v.key);
                                return (
                                  <li key={v.key}>
                                    • {v.label}
                                    {isUserField ? (
                                      <span className="text-blue-600">
                                        {" "}
                                        (auto-filled from user data)
                                      </span>
                                    ) : v.required ? (
                                      <span className="text-amber-600">
                                        {" "}
                                        (required)
                                      </span>
                                    ) : null}
                                  </li>
                                );
                              })}
                            </ul>
                          </div>
                        )}
                      </div>
                    ) : null;
                  })()}
                </div>

                <div className="rounded-lg border border-[#E5E7EB] bg-[#F9FAFB] p-3">
                  <p className="text-xs font-semibold uppercase tracking-wide text-[#9CA3AF] mb-2">
                    Recipients ({selectedAccountIds.length})
                  </p>
                  <div className="max-h-32 overflow-y-auto">
                    <ul className="space-y-1 text-sm">
                      {accounts
                        .filter((account) =>
                          selectedAccountIds.includes(account.id),
                        )
                        .map((account) => (
                          <li key={account.id} className="text-[#374151]">
                            {account.email}
                          </li>
                        ))}
                    </ul>
                  </div>
                </div>
              </>
            )}
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setBulkEmailDialogOpen(false);
                setSelectedTemplate("");
              }}
              disabled={isSendingEmail}
            >
              Cancel
            </Button>
            <Button
              onClick={handleSendBulkEmail}
              disabled={
                isSendingEmail || !selectedTemplate || !isAllVariablesFilled()
              }
            >
              {isSendingEmail ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Sending...
                </>
              ) : (
                <>
                  <Mail className="mr-2 h-4 w-4" />
                  Send Email
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </section>
  );
}

/*
Legacy implementation retained for reference.

import React, { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import DataTable, { type Column } from "@/components/ui/data-table";
import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";
import { UserTabs } from "./components/user-tabs";
import { StatusBadge } from "./components/status-badge";
import { UMRowKebab, UMToolbarActions } from "./components/user-actions";
import { ConfirmDeleteDialog } from "@/components/ui/confirm-delete-dialog";
import { AddContactModal } from "@/components/modals/add-contact-modal";

type UMStatus = "Verified" | "Pending" | "Active" | "Flagged";

export interface UserRow {
  id: number;
  userId: string;
  customer: string;
  createdAt: string;
  podId: string;
  groupId: string;
  payment: string;
  kycStatus: UMStatus;
}

const MOCK: UserRow[] = Array.from({ length: 100 }).map((_, i) => {
  const statuses: UMStatus[] = ["Verified", "Pending", "Active", "Flagged"];
  return {
    id: i + 1,
    userId: "#790" + String(841 + (i % 100)).padStart(3, "0"),
    customer: ["Claire Warren", "James Cole", "Amara Obi", "Kwame Mensah"][
      i % 4
    ],
    createdAt: "12.09.20",
    podId: "#905505",
    groupId: "#905505",
    payment: "PayPal",
    kycStatus: statuses[i % statuses.length],
  };
});

export default function UserManagement() {
  const navigate = useNavigate();

  type TabKey = "All" | "KYC status" | "Pod" | "Group";
  const [tab, setTab] = useState<TabKey>("All");
  const [users, setUsers] = useState<UserRow[]>(() => MOCK);
  const [page, setPage] = useState<number>(1);
  const [pageSize, setPageSize] = useState<number>(10);
  const [selectedRows, setSelectedRows] = useState<number[]>([]);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [pendingUser, setPendingUser] = useState<UserRow | null>(null);
  const [contactOpen, setContactOpen] = useState(false);

  const dataForTab = useMemo(() => {
    const src = users;
    switch (tab) {
      case "KYC status":
        return src.filter((r) => r.kycStatus !== "Active");
      case "Pod":
        return src.filter((_, i) => i % 2 === 0);
      case "Group":
        return src.filter((_, i) => i % 3 === 0);
      default:
        return src;
    }
  }, [tab, users]);

  const counts = useMemo(
    () => ({
      All: users.length,
      "KYC status": users.filter((r) => r.kycStatus !== "Active").length,
      Pod: Math.floor(users.length / 2),
      Group: Math.floor(users.length / 3),
    }),
    [users],
  );

  React.useEffect(() => {
    setSelectedRows([]);
  }, [tab, page, pageSize]);

  const columns: Column<UserRow>[] = [
    {
      key: "userId",
      label: "USER ID",
      width: 120,
      render: (v, row) => (
        <button
          className="text-[#374151] hover:underline"
          onClick={() => navigate(`/users-management/${row.id}`)}
        >
          {v}
        </button>
      ),
    },
    { key: "customer", label: "CUSTOMER", className: "text-[#374151]" },
    { key: "createdAt", label: "CREATED AT", className: "text-[#374151]" },
    { key: "podId", label: "POD ID", className: "text-[#374151]" },
    { key: "groupId", label: "GROUP ID", className: "text-[#374151]" },
    { key: "payment", label: "PAYMENT", className: "text-[#374151]" },
    {
      key: "kycStatus",
      label: "KYC STATUS",
      width: 140,
      render: (v) => <StatusBadge status={v as UMStatus} />,
    },
    {
      key: "actions",
      label: "",
      width: 80,
      render: (_, row) => (
        <div className="flex items-center justify-end">
          <UMRowKebab
            onView={() => navigate(`/users-management/${row.id}`)}
            onDelete={() => {
              setPendingUser(row);
              setDeleteOpen(true);
            }}
          />
        </div>
      ),
    },
  ];

  return (
    <section className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-[22px] md:text-[24px] font-semibold text-[#111827]">
          User Management
        </h1>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            className="rounded-xl h-9 px-3 inline-flex items-center gap-2"
          >
            <Download className="h-4 w-4" />
            Export
          </Button>
          <Button
            className="rounded-xl bg-[#FF8C42] hover:bg-[#f77f2f]"
            onClick={() => setContactOpen(true)}
          >
            + Add Contact
          </Button>
        </div>
      </div>

      <UserTabs
        active={tab}
        counts={counts}
        onChange={(t) => {
          setTab(t);
          setPage(1);
        }}
      />

      <DataTable<UserRow>
        title=""
        data={dataForTab}
        columns={columns}
        showCheckboxes
        searchable
        searchPlaceholder="Search order..."
        filterable={false}
        page={page}
        pageSize={pageSize}
        onPageChange={setPage}
        onPageSizeChange={setPageSize}
        pageSizeOptions={[10, 20, 50, 100]}
        selectedRows={selectedRows}
        onRowSelect={(ids) => setSelectedRows(ids as number[])}
        toolbarRight={<UMToolbarActions />}
        className="mt-2"
      />

      <ConfirmDeleteDialog
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        title="Delete user"
        itemName={pendingUser?.customer}
        onConfirm={() => {
          if (!pendingUser) return;
          setUsers((prev) => prev.filter((u) => u.id !== pendingUser.id));
          setSelectedRows((prev) => prev.filter((id) => id !== pendingUser.id));
          setPendingUser(null);
        }}
      />

      <AddContactModal
        open={contactOpen}
        onOpenChange={setContactOpen}
        onSubmit={() => setContactOpen(false)}
      />
    </section>
  );
}
*/
