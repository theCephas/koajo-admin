import React, { useEffect, useMemo, useState } from "react";
import { Loader2, CheckCircle2, MoreVertical, Edit2 } from "lucide-react";
import { toast } from "sonner";

import DataTable, { type Column } from "@/components/ui/data-table";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
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
  usePayoutsQuery,
  useMarkPayoutAsPaidMutation,
  useUpdatePayoutStatusMutation,
  type PayoutsQueryError,
} from "@/hooks/queries/use-payouts";
import type { PayoutSummary } from "@/services/api";

const PAGE_SIZE_OPTIONS = [10, 20, 50];

const formatCurrency = (value: string) => {
  const numValue = parseFloat(value);
  if (isNaN(numValue)) return "—";
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
  }).format(numValue);
};

const formatDate = (isoString: string) => {
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

const getStatusColor = (status: string) => {
  const normalized = status.toLowerCase();
  if (
    normalized === "paid" ||
    normalized === "succeeded" ||
    normalized === "success"
  ) {
    return "bg-emerald-50 text-emerald-600";
  }
  if (normalized === "scheduled") {
    return "bg-blue-50 text-blue-600";
  }
  if (normalized === "pending" || normalized === "processing") {
    return "bg-amber-50 text-amber-700";
  }
  if (normalized === "failed" || normalized === "rejected") {
    return "bg-rose-50 text-rose-600";
  }
  // Default - gray
  return "bg-gray-50 text-gray-600";
};

const ErrorBanner = ({
  error,
  onRetry,
}: {
  error: PayoutsQueryError;
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

export default function PayoutManagementPage() {
  const [timeframe, setTimeframe] = useState("all");
  const [status, setStatus] = useState("all");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);
  const [updateStatusDialogOpen, setUpdateStatusDialogOpen] = useState(false);
  const [selectedPayout, setSelectedPayout] = useState<PayoutSummary | null>(
    null,
  );
  const [newStatus, setNewStatus] = useState("success");
  const [customStatus, setCustomStatus] = useState("");

  const queryParams = useMemo(
    () => ({
      timeframe: timeframe && timeframe !== "all" ? timeframe : undefined,
      status: status && status !== "all" ? status : undefined,
      limit: pageSize,
      offset: (page - 1) * pageSize,
    }),
    [timeframe, status, page, pageSize],
  );

  const { data, isLoading, isFetching, isError, error, refetch } =
    usePayoutsQuery(queryParams);

  const markAsPaidMutation = useMarkPayoutAsPaidMutation();
  const updateStatusMutation = useUpdatePayoutStatusMutation();

  const totalCount = data?.total ?? 0;
  const payouts = data?.items ?? [];

  const handleMarkAsPaidClick = React.useCallback((payout: PayoutSummary) => {
    setSelectedPayout(payout);
    setConfirmDialogOpen(true);
  }, []);

  const handleConfirmMarkAsPaid = async () => {
    if (!selectedPayout) return;

    try {
      await markAsPaidMutation.mutateAsync({
        podId: selectedPayout.podId,
        payload: {
          membershipId: selectedPayout.membershipId,
          amount: parseFloat(selectedPayout.amount),
          description: "Manual payout marked as paid",
        },
      });
      toast.success("Payout marked as paid successfully");
      setConfirmDialogOpen(false);
      setSelectedPayout(null);
    } catch {
      toast.error("Failed to mark payout as paid");
    }
  };

  const handleUpdateStatusClick = React.useCallback((payout: PayoutSummary) => {
    setSelectedPayout(payout);
    setNewStatus("success");
    setCustomStatus("");
    setUpdateStatusDialogOpen(true);
  }, []);

  const handleConfirmUpdateStatus = async () => {
    if (!selectedPayout) return;

    if (newStatus === "others" && !customStatus.trim()) {
      toast.error("Please enter a custom status");
      return;
    }

    try {
      await updateStatusMutation.mutateAsync({
        podId: selectedPayout.podId,
        payoutId: selectedPayout.id,
        payload: {
          status: newStatus === "others" ? customStatus : newStatus,
        },
      });
      toast.success("Payout status updated successfully");
      setUpdateStatusDialogOpen(false);
      setSelectedPayout(null);
      setCustomStatus("");
    } catch {
      toast.error("Failed to update payout status");
    }
  };

  useEffect(() => {
    if (!data) return;
    const maxPage = Math.max(1, Math.ceil(data.total / pageSize));
    if (page > maxPage) {
      setPage(maxPage);
    }
  }, [data, page, pageSize]);

  useEffect(() => {
    setPage(1);
  }, [pageSize]);

  useEffect(() => {
    setPage(1);
  }, [timeframe, status]);

  const columns = useMemo<Column<PayoutSummary>[]>(
    () => [
      {
        key: "podPlanCode",
        label: "POD PLAN",
        width: 120,
        render: (value: string) => (
          <span className="text-sm font-semibold text-[#111827]">{value}</span>
        ),
      },
      {
        key: "userEmail",
        label: "USER",
        width: 200,
        render: (_, payout) => (
          <div className="flex flex-col">
            {payout.userFirstName || payout.userLastName ? (
              <>
                <span className="text-sm font-medium text-[#111827]">
                  {[payout.userFirstName, payout.userLastName]
                    .filter(Boolean)
                    .join(" ")}
                </span>
                <span className="text-xs text-[#6B7280]">
                  {payout.userEmail}
                </span>
              </>
            ) : (
              <span className="text-sm text-[#374151]">{payout.userEmail}</span>
            )}
          </div>
        ),
      },
      {
        key: "bankName",
        label: "BANK DETAILS",
        width: 180,
        render: (_, payout) => (
          <div className="flex flex-col">
            {payout.bankName ? (
              <>
                <span className="text-sm font-medium text-[#111827]">
                  {payout.bankName}
                </span>
                {payout.bankAccountLast4 && (
                  <span className="text-xs text-[#6B7280]">
                    ****{payout.bankAccountLast4}
                  </span>
                )}
              </>
            ) : (
              <span className="text-sm text-[#6B7280]">—</span>
            )}
          </div>
        ),
      },
      {
        key: "amount",
        label: "POD VALUE",
        width: 120,
        render: (value: string) => (
          <span className="text-sm text-[#374151]">
            {formatCurrency(value)}
          </span>
        ),
      },
      {
        key: "totalPayout",
        label: "TOTAL PAYOUT",
        width: 120,
        render: (value: string) => (
          <span className="text-sm font-medium text-[#111827]">
            {formatCurrency(value)}
          </span>
        ),
      },
      {
        key: "status",
        label: "STATUS",
        width: 120,
        render: (value: string) => (
          <span
            className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium ${getStatusColor(value)}`}
          >
            {value}
          </span>
        ),
      },
      {
        key: "payoutDate",
        label: "PAYOUT DATE",
        width: 180,
        render: (value: string) => (
          <span className="text-sm text-[#6B7280]">{formatDate(value)}</span>
        ),
      },
      {
        key: "description",
        label: "DESCRIPTION",
        render: (value: string) => (
          <span className="text-sm text-[#6B7280]">{value || "—"}</span>
        ),
      },
      {
        key: "actions",
        label: "ACTIONS",
        width: 80,
        render: (_, payout) => {
          const isScheduled = payout.status.toLowerCase() === "scheduled";

          return (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 w-8 p-0"
                  aria-label="Actions"
                >
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                {isScheduled ? (
                  <DropdownMenuItem
                    onClick={() => handleMarkAsPaidClick(payout)}
                    className="cursor-pointer"
                  >
                    <CheckCircle2 className="mr-2 h-4 w-4" />
                    Mark as Paid
                  </DropdownMenuItem>
                ) : (
                  <DropdownMenuItem
                    onClick={() => handleUpdateStatusClick(payout)}
                    className="cursor-pointer"
                  >
                    <Edit2 className="mr-2 h-4 w-4" />
                    Update Status
                  </DropdownMenuItem>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          );
        },
      },
    ],
    [handleMarkAsPaidClick, handleUpdateStatusClick],
  );

  return (
    <section className="space-y-6">
      <header className="space-y-4">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h1 className="text-[22px] font-semibold text-[#111827] md:text-[24px]">
              Payout Management
            </h1>
            <p className="text-sm text-[#6B7280]">
              View ledger of past and future payouts with timeframe filters.
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <Select value={timeframe} onValueChange={setTimeframe}>
            <SelectTrigger
              className="w-[180px]"
              aria-label="Filter by timeframe"
            >
              <SelectValue placeholder="All timeframes" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All timeframes</SelectItem>
              <SelectItem value="past">Past</SelectItem>
              <SelectItem value="upcoming">Upcoming</SelectItem>
            </SelectContent>
          </Select>

          <Select value={status} onValueChange={setStatus}>
            <SelectTrigger className="w-[180px]" aria-label="Filter by status">
              <SelectValue placeholder="All statuses" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All statuses</SelectItem>
              <SelectItem value="paid">Paid</SelectItem>
            </SelectContent>
          </Select>

          <div className="text-xs font-medium uppercase tracking-wide text-[#9CA3AF]">
            Total payouts: <span className="text-[#111827]">{totalCount}</span>
          </div>
          {isFetching && !isLoading && (
            <div className="inline-flex items-center gap-2 text-xs text-[#6B7280]">
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
              Updating results…
            </div>
          )}
        </div>

        {isError && error && (
          <ErrorBanner
            error={error}
            onRetry={() => {
              void refetch();
            }}
          />
        )}
      </header>

      <DataTable<PayoutSummary>
        title=""
        data={payouts}
        columns={columns}
        showCheckboxes={false}
        searchable={false}
        filterable={false}
        page={page}
        pageSize={pageSize}
        totalCount={totalCount}
        onPageChange={setPage}
        onPageSizeChange={setPageSize}
        pageSizeOptions={PAGE_SIZE_OPTIONS}
        loading={isFetching}
        onRefresh={() => {
          void refetch();
        }}
        emptyStateTitle={isLoading ? "Loading payouts…" : "No payouts found"}
        emptyStateDescription={
          isLoading
            ? "Fetching payout records."
            : "Try adjusting your filters to find different payouts."
        }
        className="mt-2"
      />

      {/* Confirm Mark as Paid Dialog */}
      <Dialog open={confirmDialogOpen} onOpenChange={setConfirmDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Mark as Paid</DialogTitle>
            <DialogDescription>
              Are you sure you want to mark this payout as paid?
            </DialogDescription>
          </DialogHeader>
          {selectedPayout && (
            <div className="space-y-2 py-4">
              <div className="flex justify-between text-sm">
                <span className="text-[#6B7280]">User:</span>
                <span className="font-medium text-[#111827]">
                  {selectedPayout.userFirstName || selectedPayout.userLastName
                    ? `${selectedPayout.userFirstName ?? ""} ${selectedPayout.userLastName ?? ""}`.trim()
                    : selectedPayout.userEmail}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-[#6B7280]">Amount:</span>
                <span className="font-medium text-[#111827]">
                  {formatCurrency(selectedPayout.amount)}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-[#6B7280]">Pod Plan:</span>
                <span className="font-medium text-[#111827]">
                  {selectedPayout.podPlanCode}
                </span>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setConfirmDialogOpen(false)}
              disabled={markAsPaidMutation.isPending}
            >
              Cancel
            </Button>
            <Button
              onClick={() => void handleConfirmMarkAsPaid()}
              disabled={markAsPaidMutation.isPending}
              className="bg-emerald-600 hover:bg-emerald-700"
            >
              {markAsPaidMutation.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Marking as Paid...
                </>
              ) : (
                <>
                  <CheckCircle2 className="mr-2 h-4 w-4" />
                  Mark as Paid
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Update Payout Status Dialog */}
      <Dialog
        open={updateStatusDialogOpen}
        onOpenChange={setUpdateStatusDialogOpen}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Update Payout Status</DialogTitle>
            <DialogDescription>
              Select a new status for this payout or enter a custom status.
            </DialogDescription>
          </DialogHeader>
          {selectedPayout && (
            <div className="space-y-4 py-4">
              <div className="space-y-2 rounded-lg border border-gray-200 p-3">
                <div className="flex justify-between text-sm">
                  <span className="text-[#6B7280]">User:</span>
                  <span className="font-medium text-[#111827]">
                    {selectedPayout.userFirstName || selectedPayout.userLastName
                      ? `${selectedPayout.userFirstName ?? ""} ${selectedPayout.userLastName ?? ""}`.trim()
                      : selectedPayout.userEmail}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-[#6B7280]">Amount:</span>
                  <span className="font-medium text-[#111827]">
                    {formatCurrency(selectedPayout.amount)}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-[#6B7280]">Current Status:</span>
                  <span
                    className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium ${getStatusColor(selectedPayout.status)}`}
                  >
                    {selectedPayout.status}
                  </span>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="status-select">New Status</Label>
                <Select value={newStatus} onValueChange={setNewStatus}>
                  <SelectTrigger id="status-select">
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="failed">Failed</SelectItem>
                    <SelectItem value="success">Success</SelectItem>
                    <SelectItem value="others">Others (Custom)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {newStatus === "others" && (
                <div className="space-y-2">
                  <Label htmlFor="custom-status">Custom Status</Label>
                  <Input
                    id="custom-status"
                    placeholder="Enter custom status"
                    value={customStatus}
                    onChange={(e) => setCustomStatus(e.target.value)}
                  />
                </div>
              )}
            </div>
          )}
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setUpdateStatusDialogOpen(false)}
              disabled={updateStatusMutation.isPending}
            >
              Cancel
            </Button>
            <Button
              onClick={() => void handleConfirmUpdateStatus()}
              disabled={updateStatusMutation.isPending}
            >
              {updateStatusMutation.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Updating...
                </>
              ) : (
                <>
                  <Edit2 className="mr-2 h-4 w-4" />
                  Update Status
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </section>
  );
}
