/* eslint-disable @typescript-eslint/no-misused-promises */
import React from "react";
import { Loader2, Plus, Search, MoreVertical } from "lucide-react";
import { useNavigate } from "react-router-dom";

import DataTable, { type Column } from "@/components/ui/data-table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useDebouncedValue } from "@/hooks/use-debounce";
import {
  useAdminUsersQuery,
  type AdminUsersQueryError,
  useReplaceAdminRolesMutation,
  useAdjustAdminPermissionsMutation,
} from "@/hooks/queries/use-admin-users";
import { useRolesQuery, usePermissionsQuery } from "@/hooks/queries/use-roles";
import type { AdminUserSummary } from "@/services/api";
import { AdminStatusPill } from "./components/admin-status-pill";
import { toDisplayText } from "@/pages/roles-management/utils";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogClose,
} from "@/components/ui/dialog";

import { PermissionsSelector } from "@/pages/roles-management/components/permissions-selector";
import { RoleSelector } from "./components/role-selector";
import {
  DropdownMenu,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuContent,
} from "@/components/ui/dropdown-menu";

const PAGE_SIZE_OPTIONS = [10, 20, 50];

const formatDateTime = (isoString: string | null) => {
  if (!isoString) return "Never";
  const date = new Date(isoString);
  if (Number.isNaN(date.getTime())) return "Never";
  return new Intl.DateTimeFormat("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(date);
};

const getDisplayName = (
  firstName: string | null,
  lastName: string | null,
  fallback: string,
) => {
  const parts = [firstName, lastName].filter((part): part is string =>
    Boolean(part?.trim()),
  );
  if (parts.length === 0) return fallback;
  return parts.join(" ");
};

const ErrorBanner = ({
  error,
  onRetry,
}: {
  error: AdminUsersQueryError;
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

const RolesCell = ({ roles }: { roles: AdminUserSummary["roles"] }) => {
  if (!roles || roles.length === 0) {
    return (
      <span className="text-xs font-medium uppercase tracking-wide text-[#9CA3AF]">
        No roles
      </span>
    );
  }
  const visible = roles.slice(0, 2);
  const remaining = roles.length - visible.length;

  return (
    <div className="flex flex-wrap gap-1.5">
      {visible.map((role) => (
        <span
          key={role.id}
          className="inline-flex items-center rounded-full bg-[#EEF2FF] px-2 py-0.5 text-xs font-medium text-[#4C51BF]"
        >
          {toDisplayText(role.name) || "Unnamed role"}
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

const PermissionsSummary = ({
  allow,
  deny,
}: {
  allow: number;
  deny: number;
}) => (
  <div className="flex flex-col gap-1 text-xs text-[#4B5563]">
    <span>
      <span className="font-semibold text-[#111827]">{allow}</span> allowed
    </span>
    <span>
      <span className="font-semibold text-[#111827]">{deny}</span> denied
    </span>
  </div>
);

export default function AdminAccessPage() {
  const navigate = useNavigate();

  const [search, setSearch] = React.useState("");
  const [page, setPage] = React.useState(1);
  const [pageSize, setPageSize] = React.useState(20);

  const debouncedSearch = useDebouncedValue(search.trim());

  const {
    data: adminUsers = [],
    isLoading,
    isFetching,
    isError,
    error,
    refetch,
  } = useAdminUsersQuery();

  const filteredAdmins = React.useMemo(() => {
    if (!debouncedSearch) return adminUsers;
    const query = debouncedSearch.toLowerCase();

    return adminUsers.filter((admin) => {
      const name = getDisplayName(
        admin.firstName,
        admin.lastName,
        admin.email,
      ).toLowerCase();
      const email = admin.email.toLowerCase();
      const phone = (admin.phoneNumber ?? "").toLowerCase();
      const roleNames = (admin.roles ?? [])
        .map((role) => toDisplayText(role.name).toLowerCase())
        .join(" ");
      const permissionCodes = [
        ...(admin.explicitPermissions ?? []).map((permission) =>
          permission.code.toLowerCase(),
        ),
        ...(admin.deniedPermissions ?? []).map((permission) =>
          permission.code.toLowerCase(),
        ),
      ].join(" ");

      return (
        name.includes(query) ||
        email.includes(query) ||
        phone.includes(query) ||
        roleNames.includes(query) ||
        permissionCodes.includes(query)
      );
    });
  }, [adminUsers, debouncedSearch]);

  React.useEffect(() => {
    const maxPage = Math.max(
      1,
      Math.ceil(filteredAdmins.length / Math.max(pageSize, 1)),
    );
    if (page > maxPage) {
      setPage(maxPage);
    }
  }, [filteredAdmins, page, pageSize]);

  React.useEffect(() => {
    setPage(1);
  }, [debouncedSearch]);

  React.useEffect(() => {
    setPage(1);
  }, [pageSize]);

  const { data: roles = [], isLoading: rolesLoading } = useRolesQuery();
  const { data: permissions = [], isLoading: permissionsLoading } =
    usePermissionsQuery();

  const [rolesOpen, setRolesOpen] = React.useState(false);
  const [permsOpen, setPermsOpen] = React.useState(false);
  const [activeAdminId, setActiveAdminId] = React.useState<string | null>(null);
  const [activeAdminEmail, setActiveAdminEmail] = React.useState<string>("");

  const [selectedRoleIds, setSelectedRoleIds] = React.useState<string[]>([]);
  const [allowCodes, setAllowCodes] = React.useState<string[]>([]);
  const [denyCodes, setDenyCodes] = React.useState<string[]>([]);

  const { mutate: replaceRoles, isPending: savingRoles } =
    useReplaceAdminRolesMutation({
      onSuccess: () => {
        toast.success("Roles updated");
        setRolesOpen(false);
      },
      onError: (e) =>
        toast.error(
          e.response?.data?.message ?? e.message ?? "Unable to update roles",
        ),
    });

  const { mutate: adjustPerms, isPending: savingPerms } =
    useAdjustAdminPermissionsMutation({
      onSuccess: () => {
        toast.success("Permissions updated");
        setPermsOpen(false);
      },
      onError: (e) =>
        toast.error(
          e.response?.data?.message ??
            e.message ??
            "Unable to update permissions",
        ),
    });

  const onAllowChange = (codes: string[]) => {
    const unique = Array.from(new Set(codes));
    setAllowCodes(unique);
    setDenyCodes((prev) => prev.filter((c) => !unique.includes(c)));
  };
  const onDenyChange = (codes: string[]) => {
    const unique = Array.from(new Set(codes));
    setDenyCodes(unique);
    setAllowCodes((prev) => prev.filter((c) => !unique.includes(c)));
  };

  const openRolesDialog = React.useCallback(
    (row: { id: string; email: string; roles: { id: string }[] }) => {
      setActiveAdminId(row.id);
      setActiveAdminEmail(row.email);
      setSelectedRoleIds(row.roles?.map((r) => r.id) ?? []);
      setRolesOpen(true);
    },
    [],
  );

  const openPermissionsDialog = React.useCallback(
    (row: {
      id: string;
      email: string;
      explicitPermissions: { code: string }[];
      deniedPermissions: { code: string }[];
    }) => {
      setActiveAdminId(row.id);
      setActiveAdminEmail(row.email);
      setAllowCodes(row.explicitPermissions?.map((p) => p.code) ?? []);
      setDenyCodes(row.deniedPermissions?.map((p) => p.code) ?? []);
      setPermsOpen(true);
    },
    [],
  );

  const columns = React.useMemo<Column<AdminUserSummary>[]>(
    () => [
      {
        key: "account",
        label: "ADMIN",
        width: 300,
        render: (_, admin) => (
          <div className="flex flex-col">
            <span className="text-sm font-semibold text-[#111827]">
              {getDisplayName(admin.firstName, admin.lastName, admin.email)}
            </span>
            <span className="text-xs text-[#6B7280]">{admin.email}</span>
            {admin.phoneNumber && (
              <span className="text-xs text-[#9CA3AF]">
                {admin.phoneNumber}
              </span>
            )}
          </div>
        ),
      },
      {
        key: "roles",
        label: "ROLES",
        width: 220,
        render: (_, admin) => <RolesCell roles={admin.roles} />,
      },
      {
        key: "permissions",
        label: "DIRECT PERMISSIONS",
        width: 160,
        render: (_, admin) => (
          <PermissionsSummary
            allow={admin.explicitPermissions?.length ?? 0}
            deny={admin.deniedPermissions?.length ?? 0}
          />
        ),
      },
      {
        key: "status",
        label: "STATUS",
        width: 200,
        render: (_, admin) => (
          <div className="flex flex-col gap-1">
            <AdminStatusPill isActive={admin.isActive} />
            <span className="text-xs text-[#6B7280]">
              Last login: {formatDateTime(admin.lastLoginAt ?? null)}
            </span>
          </div>
        ),
      },
      {
        key: "actions",
        label: "",
        width: 140,
        render: (_, admin) => (
          <div className="flex justify-end">
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate(`/admin-access/${admin.id}`)}
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
        render: (_, row) => (
          <div className="flex justify-end">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8">
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="min-w-44">
                <DropdownMenuItem onSelect={() => openRolesDialog(row)}>
                  Replace roles
                </DropdownMenuItem>
                <DropdownMenuItem onSelect={() => openPermissionsDialog(row)}>
                  Adjust permissions
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        ),
      },
    ],
    [navigate, openRolesDialog, openPermissionsDialog],
  );

  const totalAdmins = filteredAdmins.length;

  return (
    <section className="space-y-6">
      <header className="space-y-4">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h1 className="text-[22px] font-semibold text-[#111827] md:text-[24px]">
              Admin Access
            </h1>
            <p className="text-sm text-[#6B7280]">
              Review administrator accounts, their roles, and direct
              permissions.
            </p>
          </div>
          <Button
            className="rounded-xl"
            onClick={() => navigate("/admin-access/new")}
          >
            <Plus className="mr-2 h-4 w-4" />
            Invite administrator
          </Button>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div className="relative w-full max-w-md">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#9CA3AF]" />
            <Input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search by name, email, or role"
              className="pl-9"
              aria-label="Search administrators"
            />
          </div>
          <div className="text-xs font-medium uppercase tracking-wide text-[#9CA3AF]">
            Total admins: <span className="text-[#111827]">{totalAdmins}</span>
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

      <DataTable<AdminUserSummary>
        title=""
        data={filteredAdmins}
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
          isLoading ? "Loading administrators…" : "No administrators found"
        }
        emptyStateDescription={
          isLoading
            ? "Fetching the latest administrator list."
            : "Try updating your search terms."
        }
        className="mt-2"
      />

      <Dialog
        open={rolesOpen}
        onOpenChange={(v) => !savingRoles && setRolesOpen(v)}
      >
        <DialogContent className="sm:max-w-[640px] rounded-2xl p-6">
          <DialogHeader>
            <DialogTitle className="text-[18px]">
              Replace roles {activeAdminEmail ? `for ${activeAdminEmail}` : ""}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <RoleSelector
              roles={roles}
              selectedRoleIds={selectedRoleIds}
              onSelectionChange={setSelectedRoleIds}
              disabled={savingRoles || rolesLoading}
            />
            <div className="flex items-center justify-end gap-2">
              <DialogClose asChild>
                <Button variant="outline" disabled={savingRoles}>
                  Cancel
                </Button>
              </DialogClose>
              <Button
                className="rounded-xl"
                disabled={!activeAdminId || savingRoles}
                onClick={() =>
                  activeAdminId &&
                  replaceRoles({
                    adminId: activeAdminId,
                    payload: { roleIds: selectedRoleIds },
                  })
                }
              >
                {savingRoles ? "Saving..." : "Save changes"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog
        open={permsOpen}
        onOpenChange={(v) => !savingPerms && setPermsOpen(v)}
      >
        <DialogContent className="sm:max-w-[820px] rounded-2xl p-6">
          <DialogHeader>
            <DialogTitle className="text-[18px]">
              Adjust permissions{" "}
              {activeAdminEmail ? `for ${activeAdminEmail}` : ""}
            </DialogTitle>
          </DialogHeader>

          <div className="grid gap-6 lg:grid-cols-2">
            <div className="space-y-3">
              <div className="text-xs font-semibold uppercase tracking-wide text-[#9CA3AF]">
                Explicitly allow
              </div>
              <PermissionsSelector
                permissions={permissions}
                selectedCodes={allowCodes}
                onSelectionChange={onAllowChange}
                loading={permissionsLoading}
                disabled={savingPerms}
              />
            </div>
            <div className="space-y-3">
              <div className="text-xs font-semibold uppercase tracking-wide text-[#9CA3AF]">
                Explicitly deny
              </div>
              <PermissionsSelector
                permissions={permissions}
                selectedCodes={denyCodes}
                onSelectionChange={onDenyChange}
                loading={permissionsLoading}
                disabled={savingPerms}
              />
            </div>
          </div>

          <div className="mt-4 flex items-center justify-end gap-2">
            <DialogClose asChild>
              <Button variant="outline" disabled={savingPerms}>
                Cancel
              </Button>
            </DialogClose>
            <Button
              className="rounded-xl"
              disabled={!activeAdminId || savingPerms}
              onClick={() =>
                activeAdminId &&
                adjustPerms({
                  adminId: activeAdminId,
                  payload: { allow: allowCodes, deny: denyCodes },
                })
              }
            >
              {savingPerms ? "Saving..." : "Save changes"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </section>
  );
}
