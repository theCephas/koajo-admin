import { Pie, PieChart, ResponsiveContainer, Cell } from "recharts";

import type { DashboardPodContribution } from "@/services/api";

interface PodContributionsProps {
  podContributions: DashboardPodContribution[];
}

const colors = ["#FF8C42", "#7C3AED", "#5B8DEF", "#2DD4BF", "#F97316"];

const currencyFormatter = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  maximumFractionDigits: 2,
});

export function PodContributions({ podContributions }: PodContributionsProps) {
  const data = podContributions.map((contribution, index) => ({
    name: contribution.planCode,
    value: Number(contribution.totalContributed),
    color: colors[index % colors.length],
  }));

  const total = data.reduce((acc, cur) => acc + cur.value, 0);

  if (data.length === 0) {
    return (
      <div className="rounded-[16px] bg-card p-5 text-center">
        <h3 className="text-base font-semibold">Pod contributions</h3>
        <p className="mt-4 text-sm text-muted-foreground">
          No contribution data available yet.
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-[16px] bg-card p-5">
      <div className="flex items-center justify-between">
        <h3 className="text-base font-semibold">Pod contributions</h3>
        <span className="text-xs text-muted-foreground">Monthly</span>
      </div>

      <div className="mt-4 grid gap-4 md:grid-cols-2">
        <div className="relative mx-auto h-56 w-56">
          <ResponsiveContainer>
            <PieChart>
              <Pie
                data={data}
                dataKey="value"
                innerRadius={60}
                outerRadius={85}
                strokeWidth={6}
              >
                {data.map((d, index) => (
                  <Cell key={d.name} fill={colors[index % colors.length]} />
                ))}
              </Pie>
            </PieChart>
          </ResponsiveContainer>
          <div className="pointer-events-none absolute inset-0 grid place-items-center">
            <div className="text-center">
              <p className="text-3xl font-semibold">
                {currencyFormatter.format(total)}
              </p>
              <p className="text-xs text-muted-foreground">
                Total Contributions
              </p>
            </div>
          </div>
        </div>

        <div className="grid gap-3 content-center">
          {data.map((d) => (
            <div key={d.name} className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span
                  className="h-2.5 w-2.5 rounded-full"
                  style={{ backgroundColor: d.color }}
                />
                <span className="text-sm text-muted-foreground">{d.name}</span>
              </div>
              <span className="text-sm font-medium">
                {currencyFormatter.format(d.value)}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
