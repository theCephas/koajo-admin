/* eslint-disable @typescript-eslint/no-misused-promises */
import React from "react";
import { ArrowLeft, Loader2 } from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  usePermissionsQuery,
  useRolesQuery,
  useUpdateRolePermissionsMutation,
  type PermissionsQueryError,
  type RolesQueryError,
  type UpdateRolePermissionsMutationError,
} from "@/hooks/queries/use-roles";
import { PermissionsSelector } from "./components/permissions-selector";
import { toDisplayText } from "./utils";

const permissionsErrorMessage = (error: PermissionsQueryError) =>
  error.response?.data?.message ??
  error.message ??
  "Unable to load permissions.";

const rolesErrorMessage = (error: RolesQueryError) =>
  error.response?.data?.message ?? error.message ?? "Unable to load role.";

const updateErrorMessage = (error: UpdateRolePermissionsMutationError) =>
  error.response?.data?.message ?? error.message ?? "Unable to save changes.";

const sortAndDeduplicate = (codes: string[]) =>
  Array.from(new Set(codes)).sort((a, b) => a.localeCompare(b));

const arraysEqual = (a: string[], b: string[]) =>
  a.length === b.length && a.every((value, index) => value === b[index]);

export default function RoleDetailsPage() {
  const navigate = useNavigate();
  const { roleId } = useParams<{ roleId: string }>();

  const {
    data: roles = [],
    isLoading: rolesLoading,
    isFetching: rolesFetching,
    isError: rolesError,
    error: rolesErrorDetails,
    refetch: refetchRoles,
  } = useRolesQuery();

  const {
    data: permissions = [],
    isLoading: permissionsLoading,
    isFetching: permissionsFetching,
    isError: permissionsError,
    error: permissionsErrorDetails,
    refetch: refetchPermissions,
  } = usePermissionsQuery();

  const currentRole = React.useMemo(
    () => roles.find((role) => role.id === roleId),
    [roles, roleId],
  );

  const initialCodes = React.useMemo(
    () => currentRole?.permissions?.map((permission) => permission.code) ?? [],
    [currentRole],
  );

  const initialCodesSorted = React.useMemo(
    () => sortAndDeduplicate(initialCodes),
    [initialCodes],
  );

  const [selectedCodes, setSelectedCodes] =
    React.useState<string[]>(initialCodesSorted);
  const [formError, setFormError] = React.useState<string | null>(null);

  React.useEffect(() => {
    setSelectedCodes((prev) => {
      const next = sortAndDeduplicate(initialCodes);
      return arraysEqual(prev, next) ? prev : next;
    });
  }, [initialCodes]);

  const { mutate: updatePermissions, isPending } =
    useUpdateRolePermissionsMutation({
      onSuccess: () => {
        toast.success("Permissions updated");
        setFormError(null);
      },
      onError: (error) => {
        setFormError(updateErrorMessage(error));
      },
    });

  const selectedCodesSorted = React.useMemo(
    () => sortAndDeduplicate(selectedCodes),
    [selectedCodes],
  );

  const hasChanges = !arraysEqual(initialCodesSorted, selectedCodesSorted);
  const isBusy =
    rolesLoading ||
    permissionsLoading ||
    rolesFetching ||
    permissionsFetching ||
    isPending;

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!roleId) return;

    if (!hasChanges) {
      toast("No updates to save");
      return;
    }

    setFormError(null);

    updatePermissions({
      roleId,
      payload: { permissionCodes: selectedCodesSorted },
    });
  };

  if (!roleId) {
    return (
      <section className="space-y-6">
        <Button
          type="button"
          variant="outline"
          onClick={() => navigate("/roles-management")}
          className="mt-2"
        >
          Return to roles
        </Button>
        <div className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
          The role identifier is missing. Please try again.
        </div>
      </section>
    );
  }

  if (!currentRole && (rolesLoading || rolesFetching)) {
    return (
      <section className="flex min-h-[200px] items-center justify-center rounded-2xl border border-[#E5E7EB] bg-white">
        <div className="flex items-center gap-2 text-sm text-[#6B7280]">
          <Loader2 className="h-4 w-4 animate-spin" />
          Loading role details…
        </div>
      </section>
    );
  }

  if (!currentRole) {
    return (
      <section className="space-y-4">
        <div className="flex items-center gap-3">
          <Button
            type="button"
            variant="outline"
            size="icon"
            className="h-9 w-9 rounded-full"
            onClick={() => navigate("/roles-management")}
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <h1 className="text-[22px] font-semibold text-[#111827] md:text-[24px]">
            Role not found
          </h1>
        </div>

        <div className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
          We could not locate that role. It may have been removed or you might
          not have access.
        </div>

        <div className="flex gap-3">
          <Button
            type="button"
            variant="outline"
            onClick={() => refetchRoles()}
          >
            Refresh
          </Button>
          <Button
            type="button"
            className="rounded-xl"
            onClick={() => navigate("/roles-management")}
          >
            Back to roles
          </Button>
        </div>
      </section>
    );
  }

  const roleName = toDisplayText(currentRole.name) || "Untitled role";
  const roleDescription =
    toDisplayText(currentRole.description) || "No description provided.";

  return (
    <section className="space-y-6">
      <header className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <Button
            type="button"
            variant="outline"
            size="icon"
            className="h-9 w-9 rounded-full"
            onClick={() => navigate("/roles-management")}
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-[22px] font-semibold text-[#111827] md:text-[24px]">
              Manage permissions
            </h1>
            <p className="text-sm text-[#6B7280]">
              Adjust which capabilities the <strong>{roleName}</strong> role
              grants to its members.
            </p>
          </div>
        </div>
      </header>

      {rolesError && rolesErrorDetails && (
        <div className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
          {rolesErrorMessage(rolesErrorDetails)}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-4 rounded-2xl border border-[#E5E7EB] bg-white p-6 shadow-sm">
          <div className="space-y-2">
            <div className="text-xs font-semibold uppercase tracking-wide text-[#9CA3AF]">
              Role
            </div>
            <div>
              <div className="text-lg font-semibold text-[#111827]">
                {roleName}
              </div>
              <div className="text-sm text-[#6B7280]">{roleDescription}</div>
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div>
                <h2 className="text-sm font-semibold text-[#111827]">
                  Assigned permissions
                </h2>
                <p className="text-xs text-[#6B7280]">
                  Toggle permissions to instantly adjust what this role can do.
                </p>
              </div>
              <div className="flex items-center gap-3 text-xs font-medium uppercase tracking-wide text-[#9CA3AF]">
                <span>
                  Selected:{" "}
                  <span className="text-[#111827]">
                    {selectedCodesSorted.length}
                  </span>
                </span>
                <button
                  type="button"
                  onClick={() => setSelectedCodes(initialCodesSorted)}
                  className="text-[#FF8C42] hover:text-[#E67836]"
                  disabled={!hasChanges || isBusy}
                >
                  Reset
                </button>
              </div>
            </div>

            {permissionsError && permissionsErrorDetails ? (
              <div className="flex flex-col gap-3 rounded-2xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700">
                <span>{permissionsErrorMessage(permissionsErrorDetails)}</span>
                <div className="flex flex-wrap gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => refetchPermissions()}
                    disabled={isBusy}
                  >
                    Reload permissions
                  </Button>
                </div>
              </div>
            ) : (
              <PermissionsSelector
                permissions={permissions}
                selectedCodes={selectedCodesSorted}
                onSelectionChange={setSelectedCodes}
                loading={permissionsLoading}
                disabled={isBusy}
              />
            )}
          </div>
        </div>

        {formError && (
          <div className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-xs text-rose-700">
            {formError}
          </div>
        )}

        <div className="flex justify-end gap-3">
          <Button
            type="button"
            variant="outline"
            onClick={() => navigate("/roles-management")}
            disabled={isBusy}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            className="rounded-xl"
            disabled={isBusy || !hasChanges}
          >
            {isPending ? "Saving…" : "Save changes"}
          </Button>
        </div>
      </form>
    </section>
  );
}
