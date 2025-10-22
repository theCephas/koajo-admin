import { StatCard } from "./stat-card";

export function StatsRow() {
  return (
    <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
      <StatCard title="Total Active Users" value="20,500" delta="+4.85%" />
      <StatCard title="New Sign-Ups" value="290" delta="-5.25%" trend="down" />
      <StatCard title="Daily User Growth" value="30,400" delta="+3.55%" />
      <StatCard
        title="Monthly User Growth"
        value="14,800"
        delta="-10.30%"
        trend="down"
      />
    </div>
  );
}
