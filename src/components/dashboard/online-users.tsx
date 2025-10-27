import { Pie, PieChart, ResponsiveContainer, Cell } from "recharts";

import type { DashboardTransaction } from "@/services/api";

interface OnlineUsersProps {
  transactions: DashboardTransaction[];
}

const colors = ["#FF8C42", "#5B8DEF", "#2DD4BF", "#F97316", "#8B5CF6"];

const formatPercent = (value: number) => `${value.toFixed(1)}%`;

export function OnlineUsers({ transactions }: OnlineUsersProps) {
  const distributionMap = transactions.reduce(
    (acc, transaction) => {
      const key = transaction.status.toLowerCase();
      acc[key] = (acc[key] ?? 0) + 1;
      return acc;
    },
    {} as Record<string, number>,
  );

  const entries = Object.entries(distributionMap);

  const data =
    entries.length > 0
      ? entries.map(([status, count], index) => ({
          name: status,
          value: count,
          color: colors[index % colors.length],
        }))
      : [];

  const total = data.reduce((acc, item) => acc + item.value, 0);

  if (data.length === 0) {
    return (
      <div className="flex h-[380px] flex-col items-center justify-center rounded-[16px] border bg-card p-5 text-center">
        <h3 className="text-base font-semibold">Transaction distribution</h3>
        <p className="mt-4 text-sm text-muted-foreground">
          No transaction activity recorded for the selected range.
        </p>
      </div>
    );
  }

  return (
    <div className="h-[380px] rounded-[16px] bg-card p-5">
      <div className="flex items-center justify-between">
        <h3 className="text-base font-semibold">Transaction distribution</h3>
        <div className="h-2 w-2 rounded-full bg-emerald-400" />
      </div>

      <div className="mt-4 flex items-center justify-between gap-6">
        <div className="relative mx-auto h-48 w-48">
          <ResponsiveContainer>
            <PieChart>
              <Pie
                data={data}
                dataKey="value"
                innerRadius={58}
                outerRadius={78}
                strokeWidth={6}
              >
                {data.map((entry, index) => (
                  <Cell key={entry.name} fill={colors[index % colors.length]} />
                ))}
              </Pie>
            </PieChart>
          </ResponsiveContainer>
          <div className="pointer-events-none absolute inset-0 grid place-items-center">
            <div className="text-center">
              <p className="text-2xl font-semibold">{total}</p>
              <p className="text-xs text-muted-foreground">Transactions</p>
            </div>
          </div>
        </div>

        <div className="space-y-3">
          {data.map((entry, index) => (
            <div key={entry.name} className="flex flex-col gap-1">
              <div className="flex items-center gap-2">
                <span
                  className="h-2.5 w-2.5 rounded-full"
                  style={{ backgroundColor: colors[index % colors.length] }}
                />
                <span className="text-sm capitalize text-[#8A9099]">
                  {entry.name}
                </span>
              </div>
              <span className="text-sm font-medium">
                {formatPercent((entry.value / total) * 100)}
              </span>
            </div>
          ))}
        </div>
      </div>

      <div className="mt-3 grid grid-cols-3 gap-2 text-center">
        {data.slice(0, 3).map((entry, _index) => (
          <div
            key={`${entry.name}-metric`}
            className="flex flex-col-reverse rounded-xl border bg-muted/20 px-3 py-2"
          >
            <p className="text-xs capitalize text-[#8A9099]">{entry.name}</p>
            <p className="text-sm font-semibold">
              {formatPercent((entry.value / total) * 100)}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
