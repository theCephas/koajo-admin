/* eslint-disable react-refresh/only-export-components */
import React from "react";

import type { AccountSummary } from "@/services/api";

const SIZE_MAP = {
  sm: "h-8 w-8 text-xs",
  md: "h-10 w-10 text-sm",
  lg: "h-16 w-16 text-base",
} as const;

export const getAccountDisplayName = (account: AccountSummary) => {
  const parts = [account.firstName ?? "", account.lastName ?? ""]
    .map((value) => value?.trim())
    .filter(Boolean);

  if (parts.length > 0) return parts.join(" ");
  if (account.email) return account.email.split("@")[0] ?? account.email;
  return "Unknown user";
};

export const getAccountInitials = (account: AccountSummary) => {
  const initialsSource = [account.firstName, account.lastName].filter(Boolean);
  if (initialsSource.length > 0) {
    return initialsSource
      .map((segment) => segment![0]?.toUpperCase() ?? "")
      .join("")
      .slice(0, 2)
      .padEnd(2, "•");
  }
  if (account.email) return account.email.slice(0, 2).toUpperCase();
  return "??";
};

interface AccountAvatarProps {
  account: AccountSummary;
  size?: keyof typeof SIZE_MAP;
  className?: string;
}

export function AccountAvatar({
  account,
  size = "md",
  className = "",
}: AccountAvatarProps) {
  const sizeClasses = SIZE_MAP[size] ?? SIZE_MAP.md;

  return account.avatarUrl ? (
    <img
      src={account.avatarUrl}
      alt={getAccountDisplayName(account)}
      className={`rounded-full object-cover ${sizeClasses} ${className}`}
      loading="lazy"
      referrerPolicy="no-referrer"
    />
  ) : (
    <div
      className={`grid place-items-center rounded-full bg-[#FFF4EC] font-semibold uppercase text-[#FF8C42] ${sizeClasses} ${className}`}
    >
      {getAccountInitials(account)}
    </div>
  );
}
