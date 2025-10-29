/* eslint-disable @typescript-eslint/no-misused-promises */
/* eslint-disable @typescript-eslint/no-floating-promises */
import React from "react";
import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  useCreateAdminUserMutation,
  type CreateAdminUserMutationError,
} from "@/hooks/queries/use-admin-users";
import {
  usePermissionsQuery,
  useRolesQuery,
  type PermissionsQueryError,
  type RolesQueryError,
} from "@/hooks/queries/use-roles";
import { PermissionsSelector } from "@/pages/roles-management/components/permissions-selector";
import { RoleSelector } from "./components/role-selector";

const mutationErrorMessage = (error: CreateAdminUserMutationError) =>
  error.response?.data?.message ??
  error.message ??
  "Unable to create administrator.";

const permissionsErrorMessage = (error: PermissionsQueryError) =>
  error.response?.data?.message ??
  error.message ??
  "Unable to load permissions at the moment.";

const rolesErrorMessage = (error: RolesQueryError) =>
  error.response?.data?.message ??
  error.message ??
  "Unable to load roles at the moment.";

export default function CreateAdminPage() {
  const navigate = useNavigate();

  const {
    data: roles = [],
    isLoading: rolesLoading,
    isError: rolesError,
    error: rolesErrorDetails,
    refetch: refetchRoles,
  } = useRolesQuery();

  const {
    data: permissions = [],
    isLoading: permissionsLoading,
    isError: permissionsError,
    error: permissionsErrorDetails,
    refetch: refetchPermissions,
  } = usePermissionsQuery();

  const [email, setEmail] = React.useState("");
  const [firstName, setFirstName] = React.useState("");
  const [lastName, setLastName] = React.useState("");
  const [phoneNumber, setPhoneNumber] = React.useState("");
  const [roleIds, setRoleIds] = React.useState<string[]>([]);
  const [allowPermissions, setAllowPermissions] = React.useState<string[]>([]);
  const [denyPermissions, setDenyPermissions] = React.useState<string[]>([]);
  const [generatePassword, setGeneratePassword] = React.useState(true);
  const [password, setPassword] = React.useState("");
  const [inviteTemplateCode, setInviteTemplateCode] =
    React.useState("admin_invite");
  const [formError, setFormError] = React.useState<string | null>(null);

  const { mutate: createAdmin, isPending } = useCreateAdminUserMutation({
    onSuccess: () => {
      toast.success("Administrator invited");
      navigate("/admin-access");
    },
    onError: (error) => {
      setFormError(mutationErrorMessage(error));
    },
  });

  const handleAllowChange = (codes: string[]) => {
    const uniqueCodes = Array.from(new Set(codes));
    setAllowPermissions(uniqueCodes);
    setDenyPermissions((prev) =>
      prev.filter((code) => !uniqueCodes.includes(code)),
    );
  };

  const handleDenyChange = (codes: string[]) => {
    const uniqueCodes = Array.from(new Set(codes));
    setDenyPermissions(uniqueCodes);
    setAllowPermissions((prev) =>
      prev.filter((code) => !uniqueCodes.includes(code)),
    );
  };

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setFormError(null);

    const trimmedEmail = email.trim();
    const trimmedFirst = firstName.trim();
    const trimmedLast = lastName.trim();
    const trimmedPhone = phoneNumber.trim();
    const trimmedTemplate = inviteTemplateCode.trim() || "admin_invite";
    const trimmedPassword = password.trim();

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
    if (!generatePassword && trimmedPassword.length === 0) {
      setFormError(
        "Provide a password or enable automatic password generation.",
      );
      return;
    }

    const codeToId = new Map(
      permissions.map((permission) => [permission.code, permission.id]),
    );
    const resolvePermissionIds = (codes: string[]) =>
      codes
        .map((code) => codeToId.get(code))
        .filter((id): id is string => Boolean(id));

    const payload = {
      email: trimmedEmail,
      firstName: trimmedFirst,
      lastName: trimmedLast,
      phoneNumber: trimmedPhone,
      roleIds,
      allowPermissions: resolvePermissionIds(allowPermissions),
      denyPermissions: resolvePermissionIds(denyPermissions),
      generatePassword,
      inviteTemplateCode: trimmedTemplate,
      ...(generatePassword ? {} : { password: trimmedPassword }),
    };

    createAdmin(payload);
  };

  const isLoadingLookup = rolesLoading || permissionsLoading;

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
              Invite administrator
            </h1>
            <p className="text-sm text-[#6B7280]">
              Define account details, assign roles, and choose any direct
              permissions.
            </p>
          </div>
        </div>
      </header>

      <form onSubmit={handleSubmit} className="space-y-8">
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
                placeholder="admin@example.com"
                required
                disabled={isPending}
              />
            </div>
            <div className="space-y-2">
              <Label className="text-xs font-semibold uppercase tracking-wide text-[#9CA3AF]">
                Phone number
              </Label>
              <Input
                value={phoneNumber}
                onChange={(event) => setPhoneNumber(event.target.value)}
                placeholder="+1 (555) 123-4567"
                disabled={isPending}
              />
            </div>
            <div className="space-y-2">
              <Label className="text-xs font-semibold uppercase tracking-wide text-[#9CA3AF]">
                First name *
              </Label>
              <Input
                value={firstName}
                onChange={(event) => setFirstName(event.target.value)}
                placeholder="Ada"
                required
                disabled={isPending}
              />
            </div>
            <div className="space-y-2">
              <Label className="text-xs font-semibold uppercase tracking-wide text-[#9CA3AF]">
                Last name *
              </Label>
              <Input
                value={lastName}
                onChange={(event) => setLastName(event.target.value)}
                placeholder="Lovelace"
                required
                disabled={isPending}
              />
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label className="text-xs font-semibold uppercase tracking-wide text-[#9CA3AF]">
                Invite template code
              </Label>
              <Input
                value={inviteTemplateCode}
                onChange={(event) => setInviteTemplateCode(event.target.value)}
                placeholder="admin_invite"
                disabled={isPending}
              />
            </div>
          </div>
        </div>

        <div className="space-y-4 rounded-2xl border border-[#E5E7EB] bg-white p-6 shadow-sm">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="text-sm font-semibold text-[#111827]">
                Password delivery
              </h2>
              <p className="text-xs text-[#6B7280]">
                Automatically generate a secure password or set one manually.
              </p>
            </div>
            <div className="flex items-center gap-3">
              <div className="text-xs font-semibold uppercase tracking-wide text-[#9CA3AF]">
                Auto-generate password
              </div>
              <Switch
                checked={generatePassword}
                onCheckedChange={(checked) => {
                  setGeneratePassword(checked);
                  if (checked) setPassword("");
                }}
                disabled={isPending}
              />
            </div>
          </div>
          <div className="grid gap-4 sm:max-w-md">
            <div className="space-y-2">
              <Label className="text-xs font-semibold uppercase tracking-wide text-[#9CA3AF]">
                Manual password
              </Label>
              <Input
                type="text"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                placeholder="Enter a secure password"
                disabled={generatePassword || isPending}
              />
              <p className="text-xs text-[#6B7280]">
                {generatePassword
                  ? "Password will be generated and shared via email."
                  : "Share this password with the admin securely."}
              </p>
            </div>
          </div>
        </div>

        <div className="space-y-5 rounded-2xl border border-[#E5E7EB] bg-white p-6 shadow-sm">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="text-sm font-semibold text-[#111827]">
                Assign roles
              </h2>
              <p className="text-xs text-[#6B7280]">
                Roles bundle common permission sets for administrators.
              </p>
            </div>
            <span className="text-xs font-medium uppercase tracking-wide text-[#9CA3AF]">
              Selected: <span className="text-[#111827]">{roleIds.length}</span>
            </span>
          </div>

          {rolesError && rolesErrorDetails ? (
            <div className="flex flex-col gap-3 rounded-2xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700">
              <span>{rolesErrorMessage(rolesErrorDetails)}</span>
              <div>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => refetchRoles()}
                  disabled={isPending}
                >
                  Try again
                </Button>
              </div>
            </div>
          ) : (
            <RoleSelector
              roles={roles}
              selectedRoleIds={roleIds}
              onSelectionChange={setRoleIds}
              disabled={isPending || rolesLoading}
            />
          )}
        </div>

        <div className="space-y-6 rounded-2xl border border-[#E5E7EB] bg-white p-6 shadow-sm">
          <div>
            <h2 className="text-sm font-semibold text-[#111827]">
              Direct permission overrides
            </h2>
            <p className="text-xs text-[#6B7280]">
              Allow or deny individual permissions beyond role grants.
            </p>
          </div>

          {permissionsError && permissionsErrorDetails ? (
            <div className="flex flex-col gap-3 rounded-2xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700">
              <span>{permissionsErrorMessage(permissionsErrorDetails)}</span>
              <div>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => refetchPermissions()}
                  disabled={isPending}
                >
                  Try again
                </Button>
              </div>
            </div>
          ) : (
            <div className="grid gap-8 lg:grid-cols-2">
              <div className="space-y-4">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <h3 className="text-xs font-semibold uppercase tracking-wide text-[#9CA3AF]">
                    Explicitly allow
                  </h3>
                  <span className="text-xs font-medium text-[#6B7280]">
                    {allowPermissions.length} selected
                  </span>
                </div>
                <PermissionsSelector
                  permissions={permissions}
                  selectedCodes={allowPermissions}
                  onSelectionChange={handleAllowChange}
                  loading={permissionsLoading}
                  disabled={isPending}
                />
              </div>
              <div className="space-y-4">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <h3 className="text-xs font-semibold uppercase tracking-wide text-[#9CA3AF]">
                    Explicitly deny
                  </h3>
                  <span className="text-xs font-medium text-[#6B7280]">
                    {denyPermissions.length} selected
                  </span>
                </div>
                <PermissionsSelector
                  permissions={permissions}
                  selectedCodes={denyPermissions}
                  onSelectionChange={handleDenyChange}
                  loading={permissionsLoading}
                  disabled={isPending}
                />
              </div>
            </div>
          )}
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
            disabled={isPending}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            className="rounded-xl"
            disabled={isPending || isLoadingLookup}
          >
            {isPending ? "Sending invite…" : "Send invite"}
          </Button>
        </div>
      </form>
    </section>
  );
}
