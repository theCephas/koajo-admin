/* eslint-disable @typescript-eslint/no-misused-promises */
import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Loader2, Search } from "lucide-react";

import DataTable, { type Column } from "@/components/ui/data-table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  useAccountsQuery,
  type AccountsQueryError,
} from "@/hooks/queries/use-accounts";
import type { AccountSummary } from "@/services/api";
import {
  AccountAvatar,
  getAccountDisplayName,
} from "./components/account-avatar";
import { AccountStatusPill } from "./components/account-status-pill";
import { useDebouncedValue } from "@/hooks/use-debounce";

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

export default function UserManagement() {
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
    useAccountsQuery(queryParams);

  const totalCount = (data as { total?: number } | undefined)?.total ?? 0;
  const accounts =
    (data as { items: AccountSummary[] } | undefined)?.items ?? [];

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

  const columns = useMemo<Column<AccountSummary>[]>(
    () => [
      {
        key: "account",
        label: "ACCOUNT",
        width: 280,
        render: (_, account) => (
          <div className="flex items-center gap-3">
            <AccountAvatar account={account} />
            <div className="flex flex-col">
              <span className="text-sm font-semibold text-[#111827]">
                {getAccountDisplayName(account)}
              </span>
              <span className="text-xs text-[#6B7280]">{account.email}</span>
            </div>
          </div>
        ),
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
        key: "actions",
        label: "",
        width: 120,
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
        showCheckboxes={false}
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
        emptyStateTitle={isLoading ? "Loading accounts…" : "No accounts found"}
        emptyStateDescription={
          isLoading
            ? "Fetching the latest accounts."
            : "Try adjusting your search query."
        }
        className="mt-2"
      />
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
