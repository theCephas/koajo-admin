/* eslint-disable @typescript-eslint/no-floating-promises */
/* eslint-disable @typescript-eslint/no-misused-promises */
import React from "react";
import { ArrowLeft, Loader2, Trash2 } from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { ConfirmDeleteDialog } from "@/components/ui/confirm-delete-dialog";
import {
  useAdminUserQuery,
  useDeleteAdminUserMutation,
  useUpdateAdminUserMutation,
  type AdminUserQueryError,
  type DeleteAdminUserMutationError,
  type UpdateAdminUserMutationError,
} from "@/hooks/queries/use-admin-users";
import { toDisplayText } from "@/pages/roles-management/utils";

const formatDateTime = (isoString: string | null) => {
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

const queryErrorMessage = (error: AdminUserQueryError) =>
  error.response?.data?.message ??
  error.message ??
  "Unable to load administrator details.";

const updateErrorMessage = (error: UpdateAdminUserMutationError) =>
  error.response?.data?.message ??
  error.message ??
  "Unable to update administrator.";

const deleteErrorMessage = (error: DeleteAdminUserMutationError) =>
  error.response?.data?.message ??
  error.message ??
  "Unable to delete administrator.";

const EmptyPill = ({ label }: { label: string }) => (
  <span className="inline-flex items-center rounded-full bg-[#F3F4F6] px-2.5 py-0.5 text-xs font-medium text-[#6B7280]">
    {label}
  </span>
);

export default function AdminDetailsPage() {
  const navigate = useNavigate();
  const { adminId } = useParams<{ adminId: string }>();

  const {
    data: admin,
    // isLoading,
    isFetching,
    isError,
    error,
    refetch,
  } = useAdminUserQuery(adminId);

  const [email, setEmail] = React.useState("");
  const [firstName, setFirstName] = React.useState("");
  const [lastName, setLastName] = React.useState("");
  const [phoneNumber, setPhoneNumber] = React.useState("");
  const [isActive, setIsActive] = React.useState(true);
  const [formError, setFormError] = React.useState<string | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = React.useState(false);

  React.useEffect(() => {
    if (!admin) return;
    setEmail(admin.email ?? "");
    setFirstName(admin.firstName ?? "");
    setLastName(admin.lastName ?? "");
    setPhoneNumber(admin.phoneNumber ?? "");
    setIsActive(Boolean(admin.isActive));
  }, [admin]);

  const { mutate: updateAdmin, isPending: isSaving } =
    useUpdateAdminUserMutation({
      onSuccess: () => {
        toast.success("Administrator updated");
        setFormError(null);
      },
      onError: (mutationError) => {
        setFormError(updateErrorMessage(mutationError));
      },
    });

  const { mutateAsync: deleteAdmin, isPending: isDeleting } =
    useDeleteAdminUserMutation({
      onSuccess: () => {
        toast.success("Administrator removed");
      },
      onError: (mutationError) => {
        toast.error(deleteErrorMessage(mutationError));
      },
    });

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!adminId) return;

    const trimmedEmail = email.trim();
    const trimmedFirst = firstName.trim();
    const trimmedLast = lastName.trim();

    if (!trimmedEmail) {
      setFormError("Email is required.");
      return;
    }
    if (!trimmedFirst) {
      setFormError("First name is required.");
      return;
    }
    if (!trimmedLast) {
      setFormError("Last name is required.");
      return;
    }

    setFormError(null);

    updateAdmin({
      adminId,
      payload: {
        email: trimmedEmail,
        firstName: trimmedFirst,
        lastName: trimmedLast,
        phoneNumber: phoneNumber.trim(),
        isActive,
      },
    });
  };

  const handleDelete = async () => {
    if (!adminId) return;
    try {
      await deleteAdmin({ adminId });
      navigate("/admin-access");
    } catch {
      // error toast handled in mutation onError
    }
  };

  if (!adminId) {
    return (
      <section className="space-y-4">
        <Button
          type="button"
          variant="outline"
          onClick={() => navigate("/admin-access")}
        >
          Back to admin access
        </Button>
        <div className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
          Administrator identifier is missing. Please try again.
        </div>
      </section>
    );
  }

  if (!admin) {
    if (isError && error) {
      return (
        <section className="space-y-4">
          <div className="flex items-center gap-3">
            <Button
              type="button"
              variant="outline"
              size="icon"
              className="h-9 w-9 rounded-full"
              onClick={() => navigate("/admin-access")}
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <h1 className="text-[22px] font-semibold text-[#111827] md:text-[24px]">
              Unable to load administrator
            </h1>
          </div>
          <div className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
            {queryErrorMessage(error)}
          </div>
          <div className="flex gap-3">
            <Button variant="outline" onClick={() => refetch()}>
              Retry
            </Button>
            <Button onClick={() => navigate("/admin-access")}>
              Back to admin list
            </Button>
          </div>
        </section>
      );
    }

    return (
      <section className="flex min-h-[200px] items-center justify-center rounded-2xl border border-[#E5E7EB] bg-white">
        <div className="flex items-center gap-2 text-sm text-[#6B7280]">
          <Loader2 className="h-4 w-4 animate-spin" />
          Loading administrator details…
        </div>
      </section>
    );
  }

  const roleCount = admin.roles?.length ?? 0;
  const allowCount = admin.explicitPermissions?.length ?? 0;
  const denyCount = admin.deniedPermissions?.length ?? 0;
  const effectiveCount = admin.effectivePermissions?.length ?? 0;

  return (
    <section className="space-y-6">
      <header className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <Button
            type="button"
            variant="outline"
            size="icon"
            className="h-9 w-9 rounded-full"
            onClick={() => navigate("/admin-access")}
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-[22px] font-semibold text-[#111827] md:text-[24px]">
              {`${admin.firstName ?? ""} ${admin.lastName ?? ""}`.trim() ||
                admin.email}
            </h1>
            <p className="text-sm text-[#6B7280]">{admin.email}</p>
          </div>
          {isFetching && (
            <div className="hidden items-center gap-2 text-xs text-[#6B7280] sm:flex">
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
              Refreshing…
            </div>
          )}
        </div>
        <Button
          variant="destructive"
          className="rounded-xl"
          onClick={() => setDeleteDialogOpen(true)}
        >
          <Trash2 className="mr-2 h-4 w-4" />
          Delete administrator
        </Button>
      </header>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid gap-6 rounded-2xl border border-[#E5E7EB] bg-white p-6 shadow-sm">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label className="text-xs font-semibold uppercase tracking-wide text-[#9CA3AF]">
                Email *
              </Label>
              <Input
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                required
                disabled={isSaving}
              />
            </div>
            <div className="space-y-2">
              <Label className="text-xs font-semibold uppercase tracking-wide text-[#9CA3AF]">
                Phone number
              </Label>
              <Input
                value={phoneNumber}
                onChange={(event) => setPhoneNumber(event.target.value)}
                disabled={isSaving}
              />
            </div>
            <div className="space-y-2">
              <Label className="text-xs font-semibold uppercase tracking-wide text-[#9CA3AF]">
                First name *
              </Label>
              <Input
                value={firstName}
                onChange={(event) => setFirstName(event.target.value)}
                required
                disabled={isSaving}
              />
            </div>
            <div className="space-y-2">
              <Label className="text-xs font-semibold uppercase tracking-wide text-[#9CA3AF]">
                Last name *
              </Label>
              <Input
                value={lastName}
                onChange={(event) => setLastName(event.target.value)}
                required
                disabled={isSaving}
              />
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-[#E5E7EB] bg-[#FBFBFB] px-4 py-3">
            <div>
              <div className="text-sm font-semibold text-[#111827]">
                Account status
              </div>
              <div className="text-xs text-[#6B7280]">
                Deactivate to temporarily block access.
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold uppercase tracking-wide text-[#9CA3AF]">
                {isActive ? "Active" : "Inactive"}
              </span>
              <Switch
                checked={isActive}
                onCheckedChange={(checked) => setIsActive(checked)}
                disabled={isSaving}
              />
            </div>
          </div>
        </div>

        <div className="grid gap-4 rounded-2xl border border-[#E5E7EB] bg-white p-6 shadow-sm md:grid-cols-2">
          <div className="space-y-2">
            <div className="text-xs font-semibold uppercase tracking-wide text-[#9CA3AF]">
              Roles ({roleCount})
            </div>
            {roleCount === 0 ? (
              <EmptyPill label="No roles assigned" />
            ) : (
              <div className="grid gap-3">
                {admin.roles?.map((role) => (
                  <div
                    key={role.id}
                    className="space-y-1 rounded-2xl border border-[#E5E7EB] p-4"
                  >
                    <div className="text-sm font-semibold text-[#111827]">
                      {toDisplayText(role.name) || "Untitled role"}
                    </div>
                    <div className="text-xs text-[#6B7280]">
                      {toDisplayText(role.description) ||
                        "No description provided."}
                    </div>
                    <div className="text-xs font-medium uppercase tracking-wide text-[#9CA3AF]">
                      {role.permissions?.length ?? 0} permission
                      {(role.permissions?.length ?? 0) === 1 ? "" : "s"}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
          <div className="space-y-4">
            <div>
              <div className="text-xs font-semibold uppercase tracking-wide text-[#9CA3AF]">
                Direct permissions
              </div>
              <p className="text-xs text-[#6B7280]">
                Overrides applied in addition to role assignments.
              </p>
            </div>

            <div className="space-y-2">
              <div className="text-xs font-semibold uppercase tracking-wide text-[#9CA3AF]">
                Explicitly allowed ({allowCount})
              </div>
              {allowCount === 0 ? (
                <EmptyPill label="No explicit allowances" />
              ) : (
                <div className="flex flex-wrap gap-1.5">
                  {admin.explicitPermissions?.map((permission) => (
                    <span
                      key={permission.id}
                      className="inline-flex items-center rounded-full bg-[#ECFDF5] px-2.5 py-0.5 text-xs font-medium text-[#059669]"
                    >
                      {permission.code}
                    </span>
                  ))}
                </div>
              )}
            </div>

            <div className="space-y-2">
              <div className="text-xs font-semibold uppercase tracking-wide text-[#9CA3AF]">
                Explicitly denied ({denyCount})
              </div>
              {denyCount === 0 ? (
                <EmptyPill label="No explicit denials" />
              ) : (
                <div className="flex flex-wrap gap-1.5">
                  {admin.deniedPermissions?.map((permission) => (
                    <span
                      key={permission.id}
                      className="inline-flex items-center rounded-full bg-[#FEF2F2] px-2.5 py-0.5 text-xs font-medium text-[#DC2626]"
                    >
                      {permission.code}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="grid gap-4 rounded-2xl border border-[#E5E7EB] bg-white p-6 shadow-sm md:grid-cols-3">
          <div className="space-y-1">
            <div className="text-xs font-semibold uppercase tracking-wide text-[#9CA3AF]">
              Requires password change
            </div>
            <div className="text-sm text-[#111827]">
              {admin.requiresPasswordChange ? "Yes" : "No"}
            </div>
          </div>
          <div className="space-y-1">
            <div className="text-xs font-semibold uppercase tracking-wide text-[#9CA3AF]">
              Effective permissions
            </div>
            <div className="text-sm text-[#111827]">
              {effectiveCount} permission{effectiveCount === 1 ? "" : "s"}
            </div>
          </div>
          <div className="space-y-1">
            <div className="text-xs font-semibold uppercase tracking-wide text-[#9CA3AF]">
              Last login
            </div>
            <div className="text-sm text-[#111827]">
              {formatDateTime(admin.lastLoginAt ?? null)}
            </div>
          </div>
        </div>

        <div className="grid gap-4 rounded-2xl border border-[#E5E7EB] bg-white p-6 shadow-sm md:grid-cols-2">
          <div className="space-y-1">
            <div className="text-xs font-semibold uppercase tracking-wide text-[#9CA3AF]">
              Created
            </div>
            <div className="text-sm text-[#111827]">
              {formatDateTime(admin.createdAt ?? null)}
            </div>
          </div>
          <div className="space-y-1">
            <div className="text-xs font-semibold uppercase tracking-wide text-[#9CA3AF]">
              Updated
            </div>
            <div className="text-sm text-[#111827]">
              {formatDateTime(admin.updatedAt ?? null)}
            </div>
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
            onClick={() => navigate("/admin-access")}
            disabled={isSaving}
          >
            Cancel
          </Button>
          <Button type="submit" className="rounded-xl" disabled={isSaving}>
            {isSaving ? "Saving…" : "Save changes"}
          </Button>
        </div>
      </form>

      <ConfirmDeleteDialog
        open={deleteDialogOpen}
        onOpenChange={(open) => {
          if (!isDeleting) setDeleteDialogOpen(open);
        }}
        title="Delete administrator"
        description="This administrator will immediately lose access to the dashboard. This action cannot be undone."
        itemName={admin.email}
        confirmLabel="Delete admin"
        onConfirm={handleDelete}
      />
    </section>
  );
}
