import React from "react";

export function PodPlanStatusBadge({ active }: { active: boolean }) {
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium ${active ? "bg-emerald-50 text-emerald-600" : "bg-gray-100 text-gray-500"}`}
    >
      {active ? "Active" : "Inactive"}
    </span>
  );
}
