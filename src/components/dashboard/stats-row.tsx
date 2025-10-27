import type { DashboardMetrics } from "@/services/api";

import { StatCard } from "./stat-card";

interface StatsRowProps {
  metrics: DashboardMetrics;
}

const numberFormatter = new Intl.NumberFormat("en-US", {
  maximumFractionDigits: 0,
});

// Make percentage formatting null/NaN-safe
const percentFormatter = (value?: number | null) =>
  value == null || Number.isNaN(value)
    ? undefined
    : `${value > 0 ? "+" : ""}${value.toFixed(1)}%`;

const trendFrom = (value?: number | null): "up" | "down" | undefined =>
  value == null || Number.isNaN(value) ? undefined : value >= 0 ? "up" : "down";

export function StatsRow({ metrics }: StatsRowProps) {
  const {
    totalActiveUsers,
    newSignupsToday,
    averageDailyUserGrowth,
    averageMonthlyUserGrowth,
  } = metrics;

  const tau = totalActiveUsers.percentageChange;
  const nst = newSignupsToday.percentageChange;
  const adg = averageDailyUserGrowth.percentageChange;
  const amg = averageMonthlyUserGrowth.percentageChange;

  return (
    <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
      <StatCard
        title="Total Active Users"
        value={numberFormatter.format(totalActiveUsers.value)}
        delta={percentFormatter(tau)}
        trend={trendFrom(tau)}
      />
      <StatCard
        title="New Sign-Ups"
        value={numberFormatter.format(newSignupsToday.value)}
        delta={percentFormatter(nst)}
        trend={trendFrom(nst)}
      />
      <StatCard
        title="Daily User Growth"
        value={numberFormatter.format(averageDailyUserGrowth.value)}
        delta={percentFormatter(adg)}
        trend={trendFrom(adg)}
      />
      <StatCard
        title="Monthly User Growth"
        value={numberFormatter.format(averageMonthlyUserGrowth.value)}
        delta={percentFormatter(amg)}
        trend={trendFrom(amg)}
      />
    </div>
  );
}
