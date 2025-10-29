import React from "react";
import { Search } from "lucide-react";

import { Input } from "@/components/ui/input";
import type { RoleSummary } from "@/services/api";
import { toDisplayText } from "@/pages/roles-management/utils";
import { useDebouncedValue } from "@/hooks/use-debounce";

interface RoleSelectorProps {
  roles: RoleSummary[];
  selectedRoleIds: string[];
  onSelectionChange: (nextSelected: string[]) => void;
  disabled?: boolean;
}

export function RoleSelector({
  roles,
  selectedRoleIds,
  onSelectionChange,
  disabled = false,
}: RoleSelectorProps) {
  const [search, setSearch] = React.useState("");
  const debouncedSearch = useDebouncedValue(search.trim());

  const selectedSet = React.useMemo(
    () => new Set(selectedRoleIds),
    [selectedRoleIds],
  );

  const filteredRoles = React.useMemo(() => {
    const base = roles ?? [];
    if (!debouncedSearch) return base;
    const query = debouncedSearch.toLowerCase();
    return base.filter((role) => {
      const name = toDisplayText(role.name).toLowerCase();
      const description = toDisplayText(role.description).toLowerCase();
      return name.includes(query) || description.includes(query);
    });
  }, [roles, debouncedSearch]);

  const toggleSelection = (roleId: string) => {
    if (selectedSet.has(roleId)) {
      onSelectionChange(selectedRoleIds.filter((id) => id !== roleId));
    } else {
      onSelectionChange([...selectedRoleIds, roleId]);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="relative w-full max-w-sm">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#9CA3AF]" />
          <Input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Filter roles"
            className="pl-9"
            aria-label="Filter roles"
            disabled={disabled}
          />
        </div>
        <span className="text-xs font-medium uppercase tracking-wide text-[#9CA3AF]">
          Showing {filteredRoles.length} of {roles.length}
        </span>
      </div>

      {filteredRoles.length === 0 ? (
        <div className="flex min-h-[120px] items-center justify-center rounded-2xl border border-dashed border-[#D1D5DB] bg-white px-4 text-center text-sm text-[#6B7280]">
          {roles.length === 0
            ? "No roles available."
            : "No roles match your search."}
        </div>
      ) : (
        <div className="grid gap-3 md:grid-cols-2">
          {filteredRoles.map((role) => {
            const checked = selectedSet.has(role.id);
            const permissionCount = role.permissions?.length ?? 0;

            return (
              <label
                key={role.id}
                className={`flex cursor-pointer flex-col gap-3 rounded-2xl border p-4 transition-colors ${
                  checked
                    ? "border-[#FF8C42] bg-[#FFF5ED]"
                    : "border-[#E5E7EB] bg-white hover:border-[#D1D5DB]"
                } ${disabled ? "cursor-not-allowed opacity-70" : ""}`}
              >
                <div className="flex items-start gap-3">
                  <input
                    type="checkbox"
                    checked={checked}
                    onChange={() => toggleSelection(role.id)}
                    disabled={disabled}
                    className="mt-1 h-4 w-4 rounded border-[#D1D5DB] text-[#FF8C42] focus:ring-[#FF8C42]"
                    aria-label={`Role ${toDisplayText(role.name)}`}
                  />
                  <div className="space-y-1">
                    <div className="text-sm font-semibold text-[#111827]">
                      {toDisplayText(role.name) || "Untitled role"}
                    </div>
                    <div className="text-xs text-[#6B7280]">
                      {toDisplayText(role.description) ||
                        "No description provided."}
                    </div>
                  </div>
                </div>
                <div className="text-xs font-medium uppercase tracking-wide text-[#9CA3AF]">
                  {permissionCount} permission
                  {permissionCount === 1 ? "" : "s"}
                </div>
              </label>
            );
          })}
        </div>
      )}
    </div>
  );
}
