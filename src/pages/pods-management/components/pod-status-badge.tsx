import React from "react";

const STATUS_STYLES: Record<string, string> = {
  pending: "bg-amber-50 text-amber-700",
  open: "bg-blue-50 text-blue-600",
  grace: "bg-purple-50 text-purple-600",
  active: "bg-emerald-50 text-emerald-600",
  completed: "bg-gray-100 text-gray-600",
  // Legacy statuses (keeping for backward compatibility)
  filled: "bg-blue-50 text-blue-600",
  closed: "bg-gray-100 text-gray-600",
  archived: "bg-gray-100 text-gray-500",
};

const formatStatus = (status: string) =>
  status.replace(/[_-]/g, " ").replace(/\b\w/g, (match) => match.toUpperCase());

export function PodStatusBadge({ status }: { status: string }) {
  const normalized = status.toLowerCase();
  const classes = STATUS_STYLES[normalized] ?? "bg-gray-100 text-gray-600";

  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium ${classes}`}
    >
      {formatStatus(status)}
    </span>
  );
}
