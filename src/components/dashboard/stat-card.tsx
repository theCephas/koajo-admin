import { cn } from "@/lib/utils";
import { MoveDown, MoveUp } from "lucide-react";

export interface StatCardProps {
  title: string;
  value: string;
  delta?: string;
  trend?: "up" | "down";
  tone?: string; // bg color for icon chip
}

export function StatCard({
  title,
  value,
  delta,
  trend = "up",
  // tone = "bg-orange-100 text-orange-500",
}: StatCardProps) {
  const TrendIcon = trend === "up" ? MoveUp : MoveDown;
  const trendColor = trend === "up" ? "text-emerald-500" : "text-rose-500";

  return (
    <div className="rounded-[16px] gap-6 px-5 flex w-full h-[100px] bg-card items-center justify-center ">
      {delta && (
        <div
          className={cn(
            "inline-flex h-9 w-12 items-center justify-center rounded-xl",
            "bg-orange-200/30 text-orange-400",
          )}
        >
          <TrendIcon size={14} />
        </div>
      )}

      <div className="space-y-1.5 w-full">
        <p className="text-sm text-[#6C6C6C]">{title}</p>
        <div className="flex justify-between items-center">
          <p className="text-2xl text-[#3F434A] font-semibold">{value}</p>
          {delta && (
            <span
              className={cn(
                "inline-flex items-center gap-1 text-xs font-medium",
                trendColor,
              )}
            >
              <TrendIcon className="h-2.5 w-2.5" />
              {delta}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
