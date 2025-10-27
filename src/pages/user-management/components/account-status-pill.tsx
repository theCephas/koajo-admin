import React from "react";

export const AccountStatusPill = ({ isActive }: { isActive: boolean }) => (
  <span
    className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium ${isActive ? "bg-emerald-50 text-emerald-600" : "bg-gray-100 text-gray-500"}`}
  >
    {isActive ? "Active" : "Disabled"}
  </span>
);
