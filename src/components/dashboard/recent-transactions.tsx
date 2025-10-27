import { useEffect, useMemo, useState } from "react";
import { Calendar as CalendarIcon, ChevronDown, Inbox } from "lucide-react";
import type { Range, RangeKeyDict } from "react-date-range";
import { DateRange as RDRDateRange } from "react-date-range";

import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import type { DashboardTransaction } from "@/services/api";

import "react-date-range/dist/styles.css";
import "react-date-range/dist/theme/default.css";

interface RecentTransactionsProps {
  transactions: DashboardTransaction[];
}

const dateFormatter = new Intl.DateTimeFormat("en-GB", {
  day: "2-digit",
  month: "short",
  year: "numeric",
});

const currencyFormatter = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  maximumFractionDigits: 2,
});

const parseDate = (value: string) => {
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
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

type NormalizedTransaction = DashboardTransaction & {
  recordedAtDate: Date;
  amountNumber: number;
};

export function RecentTransactions({ transactions }: RecentTransactionsProps) {
  const normalized = useMemo(() => {
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
    if (normalized.length === 0) {
      const end = endOfDay(new Date());
      const start = startOfDay(new Date(end.getTime() - 6 * 86400000));
      return { start, end };
    }

    const sorted = [...normalized].sort(
      (a, b) => a.recordedAtDate.getTime() - b.recordedAtDate.getTime(),
    );

    return {
      start: startOfDay(sorted[0].recordedAtDate),
      end: endOfDay(sorted[sorted.length - 1].recordedAtDate),
    };
  }, [normalized]);

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
      ? `${dateFormatter.format(range.startDate)} - ${dateFormatter.format(range.endDate)}`
      : "Select range";

  const filtered = useMemo(() => {
    if (!range.startDate || !range.endDate) return normalized;
    const from = startOfDay(range.startDate);
    const to = endOfDay(range.endDate);
    return normalized.filter(
      (transaction) =>
        transaction.recordedAtDate >= from && transaction.recordedAtDate <= to,
    );
  }, [normalized, range.endDate, range.startDate]);

  const hasData = filtered.length > 0;

  return (
    <div className="h-[380px] rounded-[20px] border bg-card p-5 shadow-sm">
      <div className="flex items-center justify-between">
        <h3 className="text-base font-semibold">Recent transactions</h3>

        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              size="sm"
              className="inline-flex items-center gap-2 rounded-xl border px-3 py-2 text-xs bg-white"
              disabled={!range.startDate || !range.endDate}
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

      {hasData ? (
        <div className="mt-4 overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-muted-foreground">
                <th className="py-3">Customer Email</th>
                <th>Reference</th>
                <th>Amount</th>
                <th>Status</th>
                <th>Date</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {filtered.map((transaction) => (
                <tr
                  key={`${transaction.id}-${transaction.recordedAt}`}
                  className="hover:bg-muted/30"
                >
                  <td className="py-3">
                    <div className="flex items-center gap-3">
                      <div className="grid h-8 w-8 place-items-center rounded-full bg-orange-100 text-orange-600 font-semibold">
                        {(transaction.accountEmail ?? "U")
                          .slice(0, 1)
                          .toUpperCase()}
                      </div>
                      <span className="font-medium">
                        {transaction.accountEmail ?? "Unknown"}
                      </span>
                    </div>
                  </td>
                  <td className="text-muted-foreground">
                    {transaction.stripeReference || transaction.podId || "—"}
                  </td>
                  <td>{currencyFormatter.format(transaction.amountNumber)}</td>
                  <td className="text-muted-foreground">
                    {transaction.status}
                  </td>
                  <td>{dateFormatter.format(transaction.recordedAtDate)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="mt-8 flex h-[230px] flex-col items-center justify-center rounded-2xl border border-dashed bg-muted/20 px-6 py-10 text-center">
          <div className="grid h-12 w-12 place-items-center rounded-full bg-amber-50 text-amber-600">
            <Inbox className="h-6 w-6" />
          </div>
          <p className="mt-3 text-sm font-medium">
            No transactions for this range
          </p>
          <p className="mt-1 text-xs text-muted-foreground">
            Adjust the date range to review other periods.
          </p>
          <Button
            size="sm"
            className="mt-4"
            onClick={() =>
              setRange({
                startDate: defaultBounds.start,
                endDate: defaultBounds.end,
                key: "selection",
              })
            }
          >
            Reset range
          </Button>
        </div>
      )}
    </div>
  );
}
