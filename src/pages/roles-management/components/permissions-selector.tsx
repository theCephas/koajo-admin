import React from "react";
import { Loader2, Search } from "lucide-react";

import { Input } from "@/components/ui/input";
import { useDebouncedValue } from "@/hooks/use-debounce";
import { toDisplayText } from "../utils";
import type { PermissionDefinition } from "@/services/api";

interface PermissionsSelectorProps {
  permissions: PermissionDefinition[];
  selectedCodes: string[];
  onSelectionChange: (nextSelected: string[]) => void;
  disabled?: boolean;
  loading?: boolean;
  className?: string;
  isEdit?: boolean;
}

export function PermissionsSelector({
  permissions,
  selectedCodes,
  onSelectionChange,
  disabled = false,
  loading = false,
  className = "",
  isEdit = false,
}: PermissionsSelectorProps) {
  const [search, setSearch] = React.useState("");
  const debouncedSearch = useDebouncedValue(search.trim());

  const selectedSet = React.useMemo(
    () => new Set(selectedCodes),
    [selectedCodes],
  );

  const filteredPermissions = React.useMemo(() => {
    const base = permissions ?? [];
    if (!debouncedSearch) return base;
    const query = debouncedSearch.toLowerCase();
    return base.filter((permission) => {
      const code = permission.id;
      const name = toDisplayText(permission.name).toLowerCase();
      const description = toDisplayText(permission.description).toLowerCase();
      return (
        code.includes(query) ||
        name.includes(query) ||
        description.includes(query)
      );
    });
  }, [permissions, debouncedSearch]);

  const toggleSelection = (id: string) => {
    if (selectedSet.has(id)) {
      onSelectionChange(selectedCodes.filter((item) => item !== id));
    } else {
      onSelectionChange([...selectedCodes, id]);
    }
  };

  const allFilteredSelected =
    filteredPermissions.length > 0 &&
    filteredPermissions.every((permission) => selectedSet.has(permission.id));

  const handleToggleAllFiltered = () => {
    if (allFilteredSelected) {
      const filteredCodes = new Set(
        filteredPermissions.map((permission) => permission.id),
      );
      onSelectionChange(selectedCodes.filter((id) => !filteredCodes.has(id)));
      return;
    }

    const merged = new Set(selectedCodes);
    filteredPermissions.forEach((permission) => {
      merged.add(permission.id);
    });
    onSelectionChange(Array.from(merged));
  };

  return (
    <div className={`space-y-4 ${className}`}>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="relative w-full max-w-sm">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#9CA3AF]" />
          <Input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Filter permissions"
            className="pl-9"
            aria-label="Filter permissions"
            disabled={disabled || loading}
          />
        </div>
        <button
          type="button"
          onClick={handleToggleAllFiltered}
          className="text-xs font-medium uppercase tracking-wide text-[#FF8C42] hover:text-[#E67836] cursor-pointer"
          disabled={filteredPermissions.length === 0 || disabled || loading}
        >
          {allFilteredSelected ? "Clear filtered" : "Select filtered"}
        </button>
      </div>

      {loading ? (
        <div className="flex min-h-[120px] items-center justify-center rounded-2xl border border-dashed border-[#D1D5DB] bg-white">
          <div className="flex items-center gap-2 text-sm text-[#6B7280]">
            <Loader2 className="h-4 w-4 animate-spin" />
            Loading permissions…
          </div>
        </div>
      ) : filteredPermissions.length === 0 ? (
        <div className="flex min-h-[120px] items-center justify-center rounded-2xl border border-dashed border-[#D1D5DB] bg-white px-4 text-center text-sm text-[#6B7280]">
          {permissions.length === 0
            ? "No permissions available."
            : "No permissions match your search."}
        </div>
      ) : (
        //
        <div
          className={`grid gap-3  ${isEdit ? "md:grid-cols-2" : "lg:grid-cols-3"}`}
        >
          {filteredPermissions.map((permission) => {
            const checked = selectedSet.has(permission.id);

            return (
              <label
                key={permission.id ?? permission.code}
                className={`flex cursor-pointer flex-col gap-2 rounded-2xl border p-4 transition-colors overflow-hidden ${
                  checked
                    ? "border-[#FF8C42] bg-[#FFF5ED]"
                    : "border-[#E5E7EB] bg-white hover:border-[#D1D5DB]"
                } ${disabled ? "opacity-70 cursor-not-allowed" : ""}`}
              >
                <div className="flex items-start gap-2">
                  <input
                    type="checkbox"
                    checked={checked}
                    onChange={() => toggleSelection(permission.id)}
                    disabled={disabled}
                    className="mt-1 h-4 w-4 rounded border-[#D1D5DB] text-[#FF8C42] focus:ring-[#FF8C42]"
                    aria-label={`Permission ${permission.id}`}
                  />
                  <div className="space-y-1">
                    <div className="text-xs font-semibold uppercase tracking-wide text-[#FF8C42] whitespace-normal break-all">
                      {permission.code}
                    </div>
                    <div className="text-sm font-semibold text-[#111827]">
                      {toDisplayText(permission.name) || "Untitled permission"}
                    </div>
                    <div className="text-xs text-[#6B7280]">
                      {toDisplayText(permission.description) ||
                        "No description provided."}
                    </div>
                  </div>
                </div>
              </label>
            );
          })}
        </div>
      )}
    </div>
  );
}
