import { Inbox } from "lucide-react";

import type { DashboardKycSummary } from "@/services/api";

interface KycStatusProps {
  summary: DashboardKycSummary;
}

const dateFormatter = new Intl.DateTimeFormat("en-GB", {
  day: "2-digit",
  month: "short",
  year: "numeric",
});

const percentageFormatter = (value: number) => `${value.toFixed(1)}%`;

const statusTone = (status: string) => {
  const normalized = status.toLowerCase();
  if (normalized.includes("verify") || normalized.includes("approved")) {
    return "bg-emerald-100 text-emerald-700";
  }
  if (normalized.includes("pending")) {
    return "bg-amber-100 text-amber-700";
  }
  if (normalized.includes("reject") || normalized.includes("failed")) {
    return "bg-rose-100 text-rose-700";
  }
  return "bg-slate-100 text-slate-600";
};

const parseDate = (value: string) => {
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
};

export function KycStatus({ summary }: KycStatusProps) {
  const attempts = summary.lastAttempts ?? [];

  const indicators = [
    {
      label: "Success",
      value: summary.successPercentage,
      tone: "bg-emerald-500",
    },
    {
      label: "Rejected",
      value: summary.rejectedPercentage,
      tone: "bg-rose-500",
    },
    {
      label: "Pending",
      value: summary.pendingPercentage,
      tone: "bg-amber-500",
    },
  ];

  return (
    <div className="rounded-[16px] border bg-card p-5">
      <div className="flex items-center justify-between">
        <h3 className="text-base font-semibold">KYC Submission Status</h3>
        <span className="text-xs text-muted-foreground">Latest updates</span>
      </div>

      <div className="mt-4 grid gap-3 md:grid-cols-3">
        {indicators.map((indicator) => (
          <div key={indicator.label} className="space-y-2">
            <div className="flex items-center justify-between text-xs font-medium text-muted-foreground">
              <span>{indicator.label}</span>
              <span className="text-foreground">
                {percentageFormatter(indicator.value)}
              </span>
            </div>
            <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
              <div
                className={`${indicator.tone} h-full transition-all`}
                style={{ width: `${Math.min(indicator.value, 100)}%` }}
              />
            </div>
          </div>
        ))}
      </div>

      <div className="mt-6">
        <h4 className="text-sm font-semibold text-foreground">
          Recent verification attempts
        </h4>

        {attempts.length > 0 ? (
          <div className="mt-3 space-y-2 max-h-[280px] overflow-y-auto pr-1">
            {attempts.map((attempt, index) => {
              const recordedAt = parseDate(attempt.recordedAt);
              const displayDate = recordedAt
                ? dateFormatter.format(recordedAt)
                : "Date unavailable";

              return (
                <div
                  key={`${attempt.id}-${index}`}
                  className="flex items-center justify-between rounded-xl px-3 py-2 hover:bg-muted/30"
                >
                  <div className="flex items-center gap-3">
                    <div className="grid h-9 w-9 place-items-center rounded-full bg-indigo-100 text-indigo-600 font-semibold">
                      {attempt.accountEmail
                        ? attempt.accountEmail.slice(0, 1).toUpperCase()
                        : "K"}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-[#3F434A]">
                        {attempt.accountEmail || "Unknown account"}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {displayDate}
                      </p>
                    </div>
                  </div>
                  <span
                    className={`rounded-full px-3 py-1 text-xs font-medium ${statusTone(attempt.status)}`}
                  >
                    {attempt.status}
                  </span>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="mt-6 flex flex-col items-center justify-center rounded-2xl border border-dashed bg-muted/20 px-6 py-10 text-center">
            <div className="grid h-12 w-12 place-items-center rounded-full bg-amber-50 text-amber-600">
              <Inbox className="h-6 w-6" />
            </div>
            <p className="mt-3 text-sm font-medium">
              No verification attempts recorded
            </p>
            <p className="mt-1 text-xs text-muted-foreground">
              New submissions will appear here as they are processed.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
