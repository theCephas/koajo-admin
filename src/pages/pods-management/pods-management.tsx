import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Loader2, Search } from "lucide-react";

import DataTable, { type Column } from "@/components/ui/data-table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useDebouncedValue } from "@/hooks/use-debounce";
import { usePodsQuery, type PodsQueryError } from "@/hooks/queries/use-pods";
import type { PodSummary } from "@/services/api";
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
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);

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
    usePodsQuery(queryParams);

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
            : "Try adjusting your search to find different pods."
        }
        className="mt-2"
      />
    </section>
  );
}
