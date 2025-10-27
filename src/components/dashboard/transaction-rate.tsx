import { useEffect, useMemo, useState } from "react";
import { Area, AreaChart, ResponsiveContainer, Tooltip, XAxis } from "recharts";
import { Button } from "@/components/ui/button";
import { Calendar as CalendarIcon, ChevronDown } from "lucide-react";
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from "@/components/ui/popover";
import type { Range, RangeKeyDict } from "react-date-range";
import { DateRange as RDRDateRange } from "react-date-range";
import "react-date-range/dist/styles.css";
import "react-date-range/dist/theme/default.css";

import type { DashboardKycSummary, DashboardTransaction } from "@/services/api";

interface TransactionRateProps {
  transactions: DashboardTransaction[];
  kycSummary: DashboardKycSummary;
}

const dateFormatter = new Intl.DateTimeFormat("en-GB", {
  day: "2-digit",
  month: "short",
});

const percentLabel = (value: number, label: string) =>
  `${value.toFixed(1)}% ${label}`;

const subDays = (base: Date, days: number) => {
  const d = new Date(base);
  d.setDate(d.getDate() - days);
  return d;
};

const startOfDay = (date: Date) => {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d;
};

const endOfDay = (date: Date) => {
  const d = new Date(date);
  d.setHours(23, 59, 59, 999);
  return d;
};

const parseDate = (value: string) => {
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? undefined : date;
};

type NormalizedTransaction = DashboardTransaction & {
  recordedAtDate: Date;
  amountNumber: number;
};

export function TransactionRate({
  transactions,
  kycSummary,
}: TransactionRateProps) {
  const normalizedTransactions = useMemo(() => {
    const mapped = transactions
      .map((transaction) => {
        const recordedAtDate = parseDate(transaction.recordedAt);
        const amountNumber = Number(transaction.amount);

        if (!recordedAtDate || Number.isNaN(amountNumber)) {
          return null;
        }

        return {
          ...transaction,
          recordedAtDate,
          amountNumber,
        } satisfies NormalizedTransaction;
      })
      .filter(Boolean) as NormalizedTransaction[];

    return mapped;
  }, [transactions]);

  const defaultBounds = useMemo(() => {
    if (normalizedTransactions.length === 0) {
      const end = endOfDay(new Date());
      const start = startOfDay(subDays(end, 6));
      return { start, end };
    }

    const sorted = [...normalizedTransactions].sort(
      (a, b) => a.recordedAtDate.getTime() - b.recordedAtDate.getTime(),
    );

    return {
      start: startOfDay(sorted[0].recordedAtDate),
      end: endOfDay(sorted[sorted.length - 1].recordedAtDate),
    };
  }, [normalizedTransactions]);

  const [range, setRange] = useState<Range>({
    startDate: defaultBounds.start,
    endDate: defaultBounds.end,
    key: "selection",
  });

  useEffect(() => {
    setRange((prev) => ({
      ...prev,
      startDate: defaultBounds.start,
      endDate: defaultBounds.end,
    }));
  }, [defaultBounds.end, defaultBounds.start]);

  const headerLabel =
    range.startDate && range.endDate
      ? `${dateFormatter.format(range.startDate)} - ${dateFormatter.format(
          range.endDate,
        )}`
      : "Select range";

  const filteredTransactions = useMemo(() => {
    if (!range.startDate || !range.endDate) {
      return normalizedTransactions;
    }

    const from = startOfDay(range.startDate);
    const to = endOfDay(range.endDate);

    return normalizedTransactions.filter((transaction) => {
      const recordedAt = transaction.recordedAtDate;
      return recordedAt >= from && recordedAt <= to;
    });
  }, [normalizedTransactions, range.endDate, range.startDate]);

  const chartData = useMemo(() => {
    if (filteredTransactions.length === 0) {
      return [];
    }

    const map = new Map<
      string,
      { name: string; amount: number; sortKey: number }
    >();

    filteredTransactions.forEach((transaction) => {
      const day = startOfDay(transaction.recordedAtDate);
      const key = day.toISOString();
      const existing = map.get(key);

      if (existing) {
        existing.amount += transaction.amountNumber;
        return;
      }

      map.set(key, {
        name: dateFormatter.format(day),
        amount: transaction.amountNumber,
        sortKey: day.getTime(),
      });
    });

    return Array.from(map.values()).sort((a, b) => a.sortKey - b.sortKey);
  }, [filteredTransactions]);

  return (
    <div className="rounded-[16px] bg-card p-5">
      <div className="flex flex-wrap items-center gap-4">
        <Chip
          label={percentLabel(kycSummary.successPercentage, "Success")}
          tone="text-emerald-600 bg-emerald-100"
        />
        <Chip
          label={percentLabel(kycSummary.rejectedPercentage, "Rejected")}
          tone="text-rose-600 bg-rose-100"
        />
        <Chip
          label={percentLabel(kycSummary.pendingPercentage, "Pending")}
          tone="text-amber-600 bg-amber-100"
        />

        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              size="sm"
              className="ml-auto inline-flex items-center gap-2 rounded-xl border px-3 py-2 text-xs bg-white"
              disabled={
                normalizedTransactions.length === 0 ||
                !range.startDate ||
                !range.endDate
              }
            >
              <CalendarIcon className="h-4 w-4" />
              <span className="whitespace-nowrap">{headerLabel}</span>
              <ChevronDown className="h-4 w-4 opacity-70" />
            </Button>
          </PopoverTrigger>
          <PopoverContent align="end" className="w-auto p-0">
            <div className="rdr-theme rounded-xl border bg-white">
              <RDRDateRange
                onChange={(ranges: RangeKeyDict) => setRange(ranges.selection)}
                moveRangeOnFirstSelection={false}
                months={2}
                direction="horizontal"
                rangeColors={["#ff8c42"]}
                ranges={[range]}
                showMonthAndYearPickers={false}
                disabledDay={(date) =>
                  date < defaultBounds.start || date > defaultBounds.end
                }
              />
            </div>
          </PopoverContent>
        </Popover>
      </div>

      <div className="mt-4 h-56 w-full">
        {chartData.length > 0 ? (
          <ResponsiveContainer>
            <AreaChart data={chartData}>
              <defs>
                <linearGradient id="o" x1="0" x2="0" y1="0" y2="1">
                  <stop offset="0%" stopColor="#FF8C42" stopOpacity={0.4} />
                  <stop offset="100%" stopColor="#FF8C42" stopOpacity={0.05} />
                </linearGradient>
              </defs>
              <XAxis dataKey="name" axisLine={false} tickLine={false} />
              <Tooltip
                formatter={(value: number) =>
                  new Intl.NumberFormat("en-NG", {
                    style: "currency",
                    currency: "NGN",
                    maximumFractionDigits: 2,
                  }).format(value)
                }
              />
              <Area
                type="monotone"
                dataKey="amount"
                stroke="#FF8C42"
                strokeWidth={2}
                fill="url(#o)"
              />
            </AreaChart>
          </ResponsiveContainer>
        ) : (
          <div className="grid h-full place-items-center rounded-xl border border-dashed border-muted bg-muted/20 text-center text-sm text-muted-foreground">
            No transactions recorded for this range.
          </div>
        )}
      </div>
    </div>
  );
}

function Chip({ label, tone }: { label: string; tone: string }) {
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium ${tone}`}
    >
      {label}
    </span>
  );
}
