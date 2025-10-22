import React from "react";

type Status = "Verified" | "Pending" | "Active" | "Flagged";
const styles: Record<Status, string> = {
  Verified: "bg-emerald-50 text-emerald-600",
  Pending: "bg-amber-50 text-amber-600",
  Active: "bg-emerald-50 text-emerald-600",
  Flagged: "bg-rose-50 text-rose-600",
};

export function StatusBadge({ status }: { status: Status }) {
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium ${styles[status]}`}
    >
      {status}
    </span>
  );
}
