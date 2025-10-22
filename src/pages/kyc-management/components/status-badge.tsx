import React from "react";

export function StatusBadge({
  status,
}: {
  status: "Verified" | "Attention" | "Rejected" | "Flagged";
}) {
  const map: Record<string, string> = {
    Verified: "bg-emerald-50 text-emerald-600",
    Attention: "bg-orange-50 text-orange-600",
    Rejected: "bg-rose-50 text-rose-600",
    Flagged: "bg-rose-50 text-rose-600",
  };
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium ${map[status]}`}
    >
      {status}
    </span>
  );
}
