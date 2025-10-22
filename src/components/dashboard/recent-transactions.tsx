import { useMemo, useState } from "react";
import { Calendar as CalendarIcon, ChevronDown, Inbox } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from "@/components/ui/popover";
import type { Range, RangeKeyDict } from "react-date-range";
import { DateRange as RDRDateRange } from "react-date-range";
import "react-date-range/dist/styles.css";
import "react-date-range/dist/theme/default.css";

const rows = [
  {
    name: "Regina Cooper",
    order: "#790841",
    amount: "$2,500",
    type: "Credit Card",
    date: "12.09.2019",
  },
  {
    name: "Robert Edwards",
    order: "#799894",
    amount: "$1,500",
    type: "PayPal",
    date: "12.09.2019",
  },
  {
    name: "Gloria Mckinney",
    order: "#790857",
    amount: "$5,600",
    type: "Credit Card",
    date: "12.09.2019",
  },
  {
    name: "Randall Fisher",
    order: "#790687",
    amount: "$2,850",
    type: "PayPal",
    date: "12.09.2019",
  },
];

function parseDMY(s: string) {
  // dd.mm.yyyy
  const [dd, mm, yyyy] = s.split(".").map(Number);
  return new Date(yyyy || 1970, (mm || 1) - 1, dd || 1);
}
function fmtDate(d: Date) {
  return new Intl.DateTimeFormat("en-GB", {
    day: "2-digit",
    month: "short",
  }).format(d);
}
function startOfDay(d: Date) {
  const c = new Date(d);
  c.setHours(0, 0, 0, 0);
  return c;
}
function endOfDay(d: Date) {
  const c = new Date(d);
  c.setHours(23, 59, 59, 999);
  return c;
}

// derive default range from mock data
const DEFAULT_FROM = new Date(Math.min(...rows.map((r) => +parseDMY(r.date))));
const DEFAULT_TO = new Date(Math.max(...rows.map((r) => +parseDMY(r.date))));

export function RecentTransactions() {
  const [range, setRange] = useState<Range>({
    startDate: DEFAULT_FROM,
    endDate: DEFAULT_TO,
    key: "selection",
  });

  const headerLabel =
    range.startDate && range.endDate
      ? `${fmtDate(range.startDate)} - ${fmtDate(range.endDate)}`
      : "Select range";

  const filtered = useMemo(() => {
    if (!range.startDate || !range.endDate) return rows;
    const from = startOfDay(range.startDate);
    const to = endOfDay(range.endDate);
    return rows.filter((r) => {
      const d = parseDMY(r.date);
      return d >= from && d <= to;
    });
  }, [range]);

  const hasData = filtered.length > 0;

  return (
    <div className="rounded-[20px] border bg-card p-5 shadow-sm h-[380px]">
      <div className="flex items-center justify-between">
        <h3 className="text-base font-semibold">Recent transactions</h3>

        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              size="sm"
              className="inline-flex items-center gap-2 rounded-xl border px-3 py-2 text-xs bg-white"
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
                // initialFocus
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
                <th className="py-3">Customer Name</th>
                <th>Order No.</th>
                <th>Amount</th>
                <th>Payment Type</th>
                <th>Date</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {filtered.map((r) => (
                <tr key={r.order} className="hover:bg-muted/30">
                  <td className="py-3">
                    <div className="flex items-center gap-3">
                      <div className="grid h-8 w-8 place-items-center rounded-full bg-orange-100 text-orange-600 font-semibold">
                        {r.name.slice(0, 1)}
                      </div>
                      <span className="font-medium">{r.name}</span>
                    </div>
                  </td>
                  <td>{r.order}</td>
                  <td>{r.amount}</td>
                  <td className="text-muted-foreground">{r.type}</td>
                  <td>{r.date}</td>
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
            Try adjusting the date range to see results.
          </p>
          <Button
            size="sm"
            className="mt-4"
            onClick={() =>
              setRange({
                startDate: DEFAULT_FROM,
                endDate: DEFAULT_TO,
                key: "selection",
              })
            }
          >
            Reset to mock data
          </Button>
        </div>
      )}
    </div>
  );
}
