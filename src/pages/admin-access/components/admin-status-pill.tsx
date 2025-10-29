import React from "react";

const STATUS_STYLES: Record<"active" | "inactive", string> = {
  active: "bg-emerald-50 text-emerald-600",
  inactive: "bg-rose-50 text-rose-600",
};

export function AdminStatusPill({ isActive }: { isActive: boolean }) {
  const key = isActive ? "active" : "inactive";
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold uppercase tracking-wide ${STATUS_STYLES[key]}`}
    >
      {isActive ? "Active" : "Inactive"}
    </span>
  );
}
