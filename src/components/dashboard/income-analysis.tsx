import {
  Bar,
  BarChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  Line,
  LineChart,
  CartesianGrid,
} from "recharts";

import type {
  DashboardIncomeAnalysis,
  DashboardPayoutAnalysis,
} from "@/services/api";

interface IncomeAnalysisProps {
  incomeAnalysis: DashboardIncomeAnalysis;
  payoutAnalysis: DashboardPayoutAnalysis;
}

const monthFormatter = new Intl.DateTimeFormat("en-US", {
  month: "short",
});

const currencyFormatter = new Intl.NumberFormat("en-NG", {
  style: "currency",
  currency: "NGN",
  maximumFractionDigits: 2,
});

const percentFormatter = (value: number) =>
  `${value > 0 ? "+" : ""}${value.toFixed(1)}%`;

const parseMonthLabel = (month: string) => {
  const [year, monthIndex] = month.split("-");
  const date = new Date(Number(year), Number(monthIndex) - 1);
  return monthFormatter.format(date);
};

export function IncomeAnalysis({
  incomeAnalysis,
  payoutAnalysis,
}: IncomeAnalysisProps) {
  const incomeChartData = incomeAnalysis.monthlyTotals.map((item) => ({
    name: parseMonthLabel(item.month),
    amount: Number(item.total),
  }));

  const payoutChartData = payoutAnalysis.monthlyTotals.map((item) => ({
    name: parseMonthLabel(item.month),
    amount: Number(item.total),
  }));

  return (
    <div className="space-y-4 bg-white rounded-[16px] p-5">
      <div className="">
        <div className="flex items-center justify-between">
          <h3 className="text-base font-semibold">Income Analysis</h3>
          <span className="text-xs text-muted-foreground">Monthly</span>
        </div>
        <div className="mt-3 items-center flex justify-between">
          <div className="space-y-3">
            <div className="flex gap-4 items-center">
              <p className="text-3xl font-bold">
                {currencyFormatter.format(Number(incomeAnalysis.totalIncoming))}
              </p>
              <p
                className={`mt-1 text-xs px-2 py-1 rounded-sm ${
                  incomeAnalysis.percentageChange >= 0
                    ? "bg-emerald-200/30 text-emerald-600"
                    : "bg-rose-200/30 text-rose-600"
                }`}
              >
                {percentFormatter(incomeAnalysis.percentageChange)}
              </p>
            </div>
            <p className="mt-1 text-xs text-muted-foreground">
              Incoming payments across all pods over the selected period.
            </p>
          </div>
          <div className="h-32 w-56">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={incomeChartData}>
                <CartesianGrid vertical={false} stroke="#F1F5F9" />
                <XAxis
                  dataKey="name"
                  axisLine={false}
                  tickLine={false}
                  fontSize={12}
                />
                <YAxis hide />
                <Tooltip cursor={{ fill: "rgba(0,0,0,0.04)" }} />
                <Bar dataKey="amount" radius={[6, 6, 0, 0]} fill="#FF8C42" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
      <div className="border-b border-[#DCE4E8] w-full" />
      <div className="">
        <div className="flex items-center justify-between">
          <h3 className="text-base font-semibold">Payout Analysis</h3>
          <span className="text-xs text-muted-foreground">Monthly</span>
        </div>
        <div className="mt-3 items-center flex justify-between">
          <div className="space-y-3">
            <div className="flex gap-4 items-center">
              <p className="text-3xl font-bold">
                {currencyFormatter.format(Number(payoutAnalysis.totalPayouts))}
              </p>
              <p
                className={`mt-1 text-xs px-2 py-1 rounded-sm ${
                  payoutAnalysis.percentageChange >= 0
                    ? "bg-emerald-200/30 text-emerald-600"
                    : "bg-rose-200/30 text-rose-600"
                }`}
              >
                {percentFormatter(payoutAnalysis.percentageChange)}
              </p>
            </div>
            <p className="mt-1 text-xs text-muted-foreground">
              Outgoing payouts completed for contributors.
            </p>
          </div>
          <div className="h-28 w-56">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={payoutChartData}>
                <XAxis dataKey="name" hide />
                <YAxis hide />
                <Tooltip />
                <Line
                  type="monotone"
                  dataKey="amount"
                  stroke="#5B8DEF"
                  strokeWidth={3}
                  dot={false}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}
