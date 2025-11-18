import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Loader2, Search } from "lucide-react";

import DataTable, { type Column } from "@/components/ui/data-table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useDebouncedValue } from "@/hooks/use-debounce";
import {
  usePodStatsQuery,
  usePodsQuery,
  type PodsQueryError,
} from "@/hooks/queries/use-pods";
import type { PodSummary, PodsStatsResponse } from "@/services/api";
import { PodStatusBadge } from "./components/pod-status-badge";

const PAGE_SIZE_OPTIONS = [10, 20, 50];

const formatCurrency = (value: number) =>
  new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 0,
  }).format(value);

const formatLifecycle = (weeks: number) =>
  `${weeks} week${weeks === 1 ? "" : "s"}`;

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

const statNumberFormatter = new Intl.NumberFormat("en-US", {
  maximumFractionDigits: 0,
});

const formatStatValue = (
  stats: PodsStatsResponse | undefined,
  key: keyof PodsStatsResponse,
) => {
  const value = stats?.[key];
  if (typeof value !== "number") {
    return "—";
  }
  return statNumberFormatter.format(value);
};

const PodStatCard = ({
  label,
  value,
  accent,
  isLoading,
}: {
  label: string;
  value: string;
  accent: string;
  isLoading: boolean;
}) => (
  <div className="rounded-2xl border border-[#E5E7EB] bg-white p-4 shadow-sm">
    <p className="text-sm text-[#6B7280]">{label}</p>
    <div className="mt-3 flex items-center gap-3">
      <div className={`h-9 w-9 rounded-xl ${accent}`} />
      <div className="text-2xl font-semibold text-[#111827]">
        {isLoading ? (
          <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
        ) : (
          value
        )}
      </div>
    </div>
  </div>
);

const ErrorBanner = ({
  error,
  onRetry,
}: {
  error: PodsQueryError;
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

export default function PodsManagementPage() {
  const navigate = useNavigate();

  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);

  const debouncedSearch = useDebouncedValue(search.trim());

  const queryParams = useMemo(
    () => ({
      search: debouncedSearch || undefined,
      status: status || undefined,
      limit: pageSize,
      offset: (page - 1) * pageSize,
    }),
    [debouncedSearch, status, page, pageSize],
  );

  const { data, isLoading, isFetching, isError, error, refetch } =
    usePodsQuery(queryParams);

  const {
    data: statsData,
    isLoading: isStatsLoading,
    isError: isStatsError,
    error: statsError,
    refetch: refetchStats,
  } = usePodStatsQuery();

  const totalCount = data?.total ?? 0;
  const pods = data?.items ?? [];

  useEffect(() => {
    if (!data) return;
    const maxPage = Math.max(1, Math.ceil(data.total / pageSize));
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
    setPage(1);
  }, [status]);

  const columns = useMemo<Column<PodSummary>[]>(
    () => [
      {
        key: "code",
        label: "POD",
        width: 180,
        render: (_, pod) => (
          <button
            type="button"
            className="text-sm font-semibold text-[#111827] underline-offset-2 hover:underline"
            onClick={() => void navigate(`/pods-management/${pod.id}`)}
          >
            {pod.type.toUpperCase()} • {formatCurrency(pod.amount)}
          </button>
        ),
      },
      {
        key: "amount",
        label: "AMOUNT",
        width: 140,
        render: (value: number) => (
          <span className="text-sm text-[#374151]">
            {formatCurrency(value)}
          </span>
        ),
      },
      {
        key: "lifecycleWeeks",
        label: "LIFECYCLE",
        width: 120,
        render: (value: number) => (
          <span className="text-sm text-[#374151]">
            {formatLifecycle(value)}
          </span>
        ),
      },
      {
        key: "currentMembers",
        label: "MEMBERS",
        render: (_, pod) => (
          <div className="flex flex-col text-sm text-[#374151]">
            <span>
              {pod.currentMembers} / {pod.maxMembers}
            </span>
            <span className="text-xs text-[#9CA3AF]">
              Created {formatDate(pod.createdAt)}
            </span>
          </div>
        ),
      },
      {
        key: "status",
        label: "STATUS",
        width: 140,
        render: (value: string) => <PodStatusBadge status={value} />,
      },
      {
        key: "actions",
        label: "",
        width: 120,
        render: (_, pod) => (
          <div className="flex justify-end">
            <Button
              variant="outline"
              size="sm"
              onClick={() => void navigate(`/pods-management/${pod.id}`)}
            >
              View details
            </Button>
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
              Pod Management
            </h1>
            <p className="text-sm text-[#6B7280]">
              Monitor pod availability, status, and engagement in real time.
            </p>
          </div>
          {/* <Button
            variant="outline"
            className="rounded-xl h-9 px-3 inline-flex items-center gap-2"
          >
            <Download className="h-4 w-4" />
            Export CSV
          </Button> */}
        </div>

        <div className="space-y-4">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <h2 className="text-lg font-semibold text-[#111827]">
                Pods overview
              </h2>
              <p className="text-sm text-[#6B7280]">
                Quick insight into pod activity and membership.
              </p>
            </div>
            {isStatsError && (
              <Button
                variant="outline"
                size="sm"
                className="rounded-xl"
                onClick={() => void refetchStats()}
              >
                Retry stats
              </Button>
            )}
          </div>

          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            {(
              [
                {
                  key: "totalOpenPods",
                  label: "Open Pods",
                  accent: "bg-indigo-100",
                },
                {
                  key: "totalMembers",
                  label: "Members",
                  accent: "bg-emerald-100",
                },
                {
                  key: "totalPendingInvites",
                  label: "Pending Invites",
                  accent: "bg-amber-100",
                },
                {
                  key: "totalIncompletePods",
                  label: "Incomplete Pods",
                  accent: "bg-rose-100",
                },
              ] as const
            ).map((stat) => (
              <PodStatCard
                key={stat.key}
                label={stat.label}
                accent={stat.accent}
                isLoading={isStatsLoading && !statsData}
                value={formatStatValue(statsData, stat.key)}
              />
            ))}
          </div>
          {isStatsError && statsError && (
            <p className="text-sm text-rose-600">
              {statsError.response?.data?.message ??
                statsError.message ??
                "Unable to load pod stats."}
            </p>
          )}
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div className="relative w-full max-w-md">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#9CA3AF]" />
            <Input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search by type or amount"
              className="pl-9"
              aria-label="Search pods"
            />
          </div>
          <Select value={status} onValueChange={setStatus}>
            <SelectTrigger className="w-[180px]" aria-label="Filter by status">
              <SelectValue placeholder="All statuses" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">All statuses</SelectItem>
              <SelectItem value="open">Open</SelectItem>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="filled">Filled</SelectItem>
              <SelectItem value="closed">Closed</SelectItem>
              <SelectItem value="archived">Archived</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
            </SelectContent>
          </Select>
          <div className="text-xs font-medium uppercase tracking-wide text-[#9CA3AF]">
            Total pods: <span className="text-[#111827]">{totalCount}</span>
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

      <DataTable<PodSummary>
        title=""
        data={pods}
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
        emptyStateTitle={isLoading ? "Loading pods…" : "No pods found"}
        emptyStateDescription={
          isLoading
            ? "Fetching pod records."
            : "Try adjusting your search or status filter to find different pods."
        }
        className="mt-2"
      />
    </section>
  );
}
