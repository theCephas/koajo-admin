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

const people = [
  {
    name: "Devon Williamson",
    date: "2023-10-01",
    status: "Approved",
    color: "bg-emerald-100 text-emerald-700",
  },
  {
    name: "Debra Wilson",
    date: "2023-10-02",
    status: "Pending",
    color: "bg-amber-100 text-amber-700",
  },
  {
    name: "Debra Wilson",
    date: "2023-10-03",
    status: "Approved",
    color: "bg-emerald-100 text-emerald-700",
  },
  {
    name: "Debra Wilson",
    date: "2023-10-04",
    status: "Pending",
    color: "bg-amber-100 text-amber-700",
  },
  {
    name: "Debra Wilson",
    date: "2023-10-01",
    status: "Approved",
    color: "bg-emerald-100 text-emerald-700",
  },
];

function parseISO(s: string) {
  const [y, m, d] = s.split("-").map(Number);
  return new Date(y, (m || 1) - 1, d || 1);
}
function fmtDate(d: Date) {
  return new Intl.DateTimeFormat("en-GB", {
    day: "2-digit",
    month: "short",
  }).format(d);
}

// derive default range from mock data
const DEFAULT_FROM = new Date(
  Math.min(...people.map((p) => +parseISO(p.date))),
);
const DEFAULT_TO = new Date(Math.max(...people.map((p) => +parseISO(p.date))));

export function KycStatus() {
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
    if (!range.startDate || !range.endDate) return people;
    const from = new Date(range.startDate);
    from.setHours(0, 0, 0, 0);
    const to = new Date(range.endDate);
    to.setHours(23, 59, 59, 999);
    return people.filter((p) => {
      const d = parseISO(p.date);
      return d >= from && d <= to;
    });
  }, [range]);

  const hasData = filtered.length > 0;

  return (
    <div className="rounded-[16px] border bg-card p-5">
      <div className="flex items-center justify-between">
        <h3 className="text-base font-semibold">KYC Submission Status</h3>

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
              />
            </div>
          </PopoverContent>
        </Popover>
      </div>

      {hasData ? (
        <div className="mt-4 space-y-2 max-h-[320px] overflow-y-auto pr-1">
          {filtered.map((p, i) => (
            <div
              key={`${p.name}-${p.date}-${i}`}
              className="flex items-center justify-between rounded-xl px-2 py-2 hover:bg-muted/30"
            >
              <div className="flex items-center gap-3">
                <div className="grid h-9 w-9 place-items-center rounded-full bg-indigo-100 text-indigo-600 font-semibold">
                  {p.name.slice(0, 1)}
                </div>
                <div>
                  <p className="text-sm text-[#3F434A] font-medium">{p.name}</p>
                  <p className="text-xs text-muted-foreground">{p.date}</p>
                </div>
              </div>
              <span
                className={`rounded-full px-3 py-1 text-xs font-medium ${p.color}`}
              >
                {p.status}
              </span>
            </div>
          ))}
        </div>
      ) : (
        <div className="mt-8 flex flex-col items-center justify-center rounded-2xl border border-dashed bg-muted/20 px-6 py-10 text-center">
          <div className="grid h-12 w-12 place-items-center rounded-full bg-amber-50 text-amber-600">
            <Inbox className="h-6 w-6" />
          </div>
          <p className="mt-3 text-sm font-medium">
            No submissions for this range
          </p>
          <p className="mt-1 text-xs text-muted-foreground">
            Try adjusting the date range to see more results.
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
