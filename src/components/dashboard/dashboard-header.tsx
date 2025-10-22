import { useState } from "react";
import { Download, ChevronDown } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export function DashboardHeader() {
  const [range, setRange] = useState<"7d" | "6m" | "12m">("7d");
  const rangeLabel =
    range === "7d" ? "Last 7 days" : range === "6m" ? "6 months" : "12 months";

  return (
    <div className="">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex flex-col gap-2">
          <h2 className="text-[24px] font-[500]">Admin Dashboard Overview</h2>
          <div className="flex items-center gap-3">
            <div className="flex -space-x-2">
              {Array.from({ length: 4 }).map((_, i) => (
                <span
                  key={i}
                  className="h-7 w-7 rounded-full ring-2 ring-white bg-indigo-200"
                />
              ))}
            </div>
            <span className="text-sm text-[#8A9099]">+12 others</span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            className="inline-flex items-center gap-2 rounded-xl border px-3 py-2 text-sm bg-white"
            aria-label="Export"
          >
            <Download className="h-4 w-4" />
          </button>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="inline-flex items-center gap-2 rounded-xl border px-3 py-2 text-sm bg-white">
                {rangeLabel}
                <ChevronDown className="h-4 w-4" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="min-w-40">
              <DropdownMenuRadioGroup
                value={range}
                onValueChange={(v) => setRange(v as "7d" | "6m" | "12m")}
              >
                <DropdownMenuRadioItem value="7d">
                  Last 7 days
                </DropdownMenuRadioItem>
                <DropdownMenuRadioItem value="6m">
                  6 months
                </DropdownMenuRadioItem>
                <DropdownMenuRadioItem value="12m">
                  12 months
                </DropdownMenuRadioItem>
              </DropdownMenuRadioGroup>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </div>
  );
}
