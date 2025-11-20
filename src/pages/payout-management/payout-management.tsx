import React, { useEffect, useMemo, useState } from "react";
import { Loader2 } from "lucide-react";

import DataTable, { type Column } from "@/components/ui/data-table";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  usePayoutsQuery,
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
  if (normalized === "paid") {
    return "bg-emerald-50 text-emerald-600";
  }
  if (normalized === "scheduled") {
    return "bg-blue-50 text-blue-600";
  }
  if (normalized === "pending") {
    return "bg-amber-50 text-amber-700";
  }
  if (normalized === "failed") {
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

  const totalCount = data?.total ?? 0;
  const payouts = data?.items ?? [];

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
        label: "AMOUNT",
        width: 120,
        render: (value: string) => (
          <span className="text-sm text-[#374151]">
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
    ],
    [],
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
    </section>
  );
}
