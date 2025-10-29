/* eslint-disable @typescript-eslint/no-misused-promises */
import React from "react";
import { Loader2, Plus, Search } from "lucide-react";
import { useNavigate } from "react-router-dom";

import DataTable, { type Column } from "@/components/ui/data-table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useDebouncedValue } from "@/hooks/use-debounce";
import { useRolesQuery, type RolesQueryError } from "@/hooks/queries/use-roles";
import type { PermissionDefinition, RoleSummary } from "@/services/api";
import { toDisplayText } from "./utils";

const PAGE_SIZE_OPTIONS = [10, 20, 50];

const ErrorBanner = ({
  error,
  onRetry,
}: {
  error: RolesQueryError;
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

const PermissionsCell = ({
  permissions,
}: {
  permissions: PermissionDefinition[] | undefined;
}) => {
  if (!permissions || permissions.length === 0) {
    return (
      <span className="text-xs font-medium uppercase tracking-wide text-[#9CA3AF]">
        None
      </span>
    );
  }

  const maxVisible = 3;
  const visible = permissions.slice(0, maxVisible);
  const remaining = permissions.length - visible.length;

  return (
    <div className="flex flex-wrap gap-1.5">
      {visible.map((permission) => (
        <span
          key={permission.id}
          className="inline-flex items-center rounded-full bg-[#F3F4F6] px-2 py-0.5 text-xs font-medium text-[#374151]"
        >
          {permission.code}
        </span>
      ))}
      {remaining > 0 && (
        <span className="text-xs font-medium text-[#6B7280]">
          +{remaining} more
        </span>
      )}
    </div>
  );
};

export default function RolesManagementPage() {
  const navigate = useNavigate();

  const [search, setSearch] = React.useState("");
  const [page, setPage] = React.useState(1);
  const [pageSize, setPageSize] = React.useState(20);

  const debouncedSearch = useDebouncedValue(search.trim());

  const {
    data: roles = [],
    isLoading,
    isFetching,
    isError,
    error,
    refetch,
  } = useRolesQuery();

  const filteredRoles = React.useMemo(() => {
    if (!debouncedSearch) return roles;
    const query = debouncedSearch.toLowerCase();

    return roles.filter((role) => {
      const name = toDisplayText(role.name).toLowerCase();
      const description = toDisplayText(role.description).toLowerCase();
      const permissionCodes = (role.permissions ?? [])
        .map((permission) => permission.code.toLowerCase())
        .join(" ");

      return (
        name.includes(query) ||
        description.includes(query) ||
        permissionCodes.includes(query)
      );
    });
  }, [roles, debouncedSearch]);

  React.useEffect(() => {
    const maxPage = Math.max(
      1,
      Math.ceil(filteredRoles.length / Math.max(pageSize, 1)),
    );
    if (page > maxPage) {
      setPage(maxPage);
    }
  }, [filteredRoles, page, pageSize]);

  React.useEffect(() => {
    setPage(1);
  }, [debouncedSearch]);

  React.useEffect(() => {
    setPage(1);
  }, [pageSize]);

  const columns = React.useMemo<Column<RoleSummary>[]>(
    () => [
      {
        key: "name",
        label: "ROLE",
        width: 320,
        render: (_, role) => (
          <div className="flex flex-col">
            <span className="text-sm font-semibold text-[#111827]">
              {toDisplayText(role.name) || "Untitled role"}
            </span>
            <span className="text-xs text-[#6B7280]">
              {toDisplayText(role.description) || "No description provided"}
            </span>
          </div>
        ),
      },
      {
        key: "permissions",
        label: "PERMISSIONS",
        className: "text-sm text-[#374151]",
        render: (_, role) => <PermissionsCell permissions={role.permissions} />,
      },
      {
        key: "actions",
        label: "",
        width: 180,
        render: (_, role) => (
          <div className="flex justify-end">
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate(`/roles-management/${role.id}`)}
            >
              Manage permissions
            </Button>
          </div>
        ),
      },
    ],
    [navigate],
  );

  const totalRoles = filteredRoles.length;

  return (
    <section className="space-y-6">
      <header className="space-y-4">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h1 className="text-[22px] font-semibold text-[#111827] md:text-[24px]">
              Roles &amp; Permissions
            </h1>
            <p className="text-sm text-[#6B7280]">
              Review existing roles, audit their permissions, and keep access in
              sync.
            </p>
          </div>
          <Button
            className="rounded-xl"
            onClick={() => navigate("/roles-management/new")}
          >
            <Plus className="mr-2 h-4 w-4" />
            Add new role
          </Button>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div className="relative w-full max-w-md">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#9CA3AF]" />
            <Input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search roles or permissions"
              className="pl-9"
              aria-label="Search roles"
            />
          </div>
          <div className="text-xs font-medium uppercase tracking-wide text-[#9CA3AF]">
            Total roles: <span className="text-[#111827]">{totalRoles}</span>
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

      <DataTable<RoleSummary>
        title=""
        data={filteredRoles}
        columns={columns}
        showCheckboxes={false}
        searchable={false}
        filterable={false}
        page={page}
        pageSize={pageSize}
        onPageChange={setPage}
        onPageSizeChange={setPageSize}
        pageSizeOptions={PAGE_SIZE_OPTIONS}
        loading={isFetching}
        onRefresh={refetch}
        emptyStateTitle={
          isLoading ? "Loading roles…" : "No roles match your filters"
        }
        emptyStateDescription={
          isLoading
            ? "Fetching the latest role data."
            : "Try adjusting your search keywords."
        }
        className="mt-2"
      />
    </section>
  );
}
