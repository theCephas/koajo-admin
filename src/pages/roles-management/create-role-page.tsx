/* eslint-disable @typescript-eslint/no-misused-promises */
/* eslint-disable @typescript-eslint/no-floating-promises */
import React from "react";
import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  useCreateRoleMutation,
  usePermissionsQuery,
  type CreateRoleMutationError,
  type PermissionsQueryError,
} from "@/hooks/queries/use-roles";
import { PermissionsSelector } from "./components/permissions-selector";

const mutationErrorMessage = (error: CreateRoleMutationError) =>
  error.response?.data?.message ?? error.message ?? "Unable to create role.";

const permissionsErrorMessage = (error: PermissionsQueryError) =>
  error.response?.data?.message ??
  error.message ??
  "Unable to load permissions at the moment.";

export default function CreateRolePage() {
  const navigate = useNavigate();

  const {
    data: permissions = [],
    isLoading: permissionsLoading,
    isError: permissionsError,
    error: permissionsErrorDetails,
    refetch: refetchPermissions,
  } = usePermissionsQuery();

  const [name, setName] = React.useState("");
  const [description, setDescription] = React.useState("");
  const [selectedCodes, setSelectedCodes] = React.useState<string[]>([]);
  const [formError, setFormError] = React.useState<string | null>(null);

  const { mutate: submit, isPending } = useCreateRoleMutation({
    onSuccess: () => {
      toast.success("Role created");
      navigate("/roles-management");
    },
    onError: (error) => {
      setFormError(mutationErrorMessage(error));
    },
  });

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const trimmedName = name.trim();
    if (!trimmedName) {
      setFormError("Please provide a role name.");
      return;
    }

    setFormError(null);

    submit({
      name: trimmedName,
      description: description.trim(),
      permissionCodes: selectedCodes,
    });
  };

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
              Create role
            </h1>
            <p className="text-sm text-[#6B7280]">
              Define how this role should be identified and choose the
              permissions it grants.
            </p>
          </div>
        </div>
      </header>

      <form onSubmit={handleSubmit} className="space-y-8">
        <div className="grid gap-5 rounded-2xl border border-[#E5E7EB] bg-white p-6 shadow-sm">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label className="text-xs font-semibold uppercase tracking-wide text-[#9CA3AF]">
                Role name
              </Label>
              <Input
                value={name}
                onChange={(event) => setName(event.target.value)}
                placeholder="Operations Manager"
                required
                disabled={isPending}
              />
            </div>
            <div className="sm:col-span-2 space-y-2">
              <Label className="text-xs font-semibold uppercase tracking-wide text-[#9CA3AF]">
                Description
              </Label>
              <Textarea
                value={description}
                onChange={(event) => setDescription(event.target.value)}
                placeholder="Describe what this role is responsible for."
                rows={4}
                disabled={isPending}
              />
              <p className="text-xs text-[#6B7280]">
                Let other admins know when to assign this role.
              </p>
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div>
                <h2 className="text-sm font-semibold text-[#111827]">
                  Assign permissions
                </h2>
                <p className="text-xs text-[#6B7280]">
                  Choose the capabilities granted to this role. You can adjust
                  them any time.
                </p>
              </div>
              <span className="text-xs font-medium uppercase tracking-wide text-[#9CA3AF]">
                Selected:{" "}
                <span className="text-[#111827]">{selectedCodes.length}</span>
              </span>
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
              <PermissionsSelector
                permissions={permissions}
                selectedCodes={selectedCodes}
                onSelectionChange={setSelectedCodes}
                loading={permissionsLoading}
                disabled={isPending}
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
            disabled={isPending}
          >
            Cancel
          </Button>
          <Button type="submit" className="rounded-xl" disabled={isPending}>
            {isPending ? "Creating…" : "Create role"}
          </Button>
        </div>
      </form>
    </section>
  );
}
