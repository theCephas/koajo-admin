import { useMemo, useState } from "react";
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

function subDays(base: Date, days: number) {
  const d = new Date(base);
  d.setDate(d.getDate() - days);
  return d;
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
function fmtDate(d: Date) {
  return new Intl.DateTimeFormat("en-GB", {
    day: "2-digit",
    month: "short",
  }).format(d);
}
function eachDay(from: Date, to: Date) {
  const out: Date[] = [];
  const cur = startOfDay(from);
  const end = endOfDay(to);
  while (cur <= end) {
    out.push(new Date(cur));
    cur.setDate(cur.getDate() + 1);
  }
  return out;
}

// default = last 7 days
const DEFAULT_FROM = subDays(new Date(), 6);
const DEFAULT_TO = new Date();

export function TransactionRate() {
  const [range, setRange] = useState<Range>({
    startDate: DEFAULT_FROM,
    endDate: DEFAULT_TO,
    key: "selection",
  });

  const headerLabel =
    range.startDate && range.endDate
      ? `${fmtDate(range.startDate)} - ${fmtDate(range.endDate)}`
      : "Select range";

  const chartData = useMemo(() => {
    if (!range.startDate || !range.endDate) return [];
    const days = eachDay(range.startDate, range.endDate);
    // deterministic values for demo
    return days.map((d, i) => {
      const dayKey =
        d.getFullYear() * 10000 + (d.getMonth() + 1) * 100 + d.getDate();
      const base = 1500 + (dayKey % 7) * 220;
      const v = Math.round(
        base + Math.sin(i / 2) * 300 + ((dayKey % 13) - 6) * 15,
      );
      return {
        name: new Intl.DateTimeFormat("en-GB", {
          day: "2-digit",
          month: "short",
        }).format(d),
        v: Math.max(200, v),
      };
    });
  }, [range]);

  return (
    <div className="rounded-[16px] bg-card p-5">
      <div className="flex flex-wrap items-center gap-4">
        <Chip label="70% Success" tone="text-emerald-600 bg-emerald-100" />
        <Chip label="10% Rejection" tone="text-rose-600 bg-rose-100" />
        <Chip label="0.5% Pending" tone="text-emerald-600 bg-emerald-100" />

        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              size="sm"
              className="ml-auto inline-flex items-center gap-2 rounded-xl border px-3 py-2 text-xs bg-white"
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

      <div className="mt-4 h-56 w-full">
        <ResponsiveContainer>
          <AreaChart data={chartData}>
            <defs>
              <linearGradient id="o" x1="0" x2="0" y1="0" y2="1">
                <stop offset="0%" stopColor="#FF8C42" stopOpacity={0.4} />
                <stop offset="100%" stopColor="#FF8C42" stopOpacity={0.05} />
              </linearGradient>
            </defs>
            <XAxis dataKey="name" axisLine={false} tickLine={false} />
            <Tooltip />
            <Area
              type="monotone"
              dataKey="v"
              stroke="#FF8C42"
              strokeWidth={2}
              fill="url(#o)"
            />
          </AreaChart>
        </ResponsiveContainer>
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
