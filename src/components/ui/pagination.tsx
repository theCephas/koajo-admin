import React from "react";
import {
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
} from "lucide-react";

export interface Props {
  page: number; // 1-based
  totalPages: number;
  onPageChange: (p: number) => void;
  disabled?: boolean;
}

function pageList(current: number, total: number): (number | "...")[] {
  if (total <= 6) return Array.from({ length: total }, (_, i) => i + 1);
  const s = new Set<number>([
    1,
    2,
    total - 1,
    total,
    current - 1,
    current,
    current + 1,
  ]);
  const sorted = [...s]
    .filter((p) => p >= 1 && p <= total)
    .sort((a, b) => a - b);
  const out: (number | "...")[] = [];
  for (let i = 0; i < sorted.length; i++) {
    out.push(sorted[i]);
    if (i < sorted.length - 1 && sorted[i + 1] - sorted[i] > 1) out.push("...");
  }
  return out;
}

export function Pagination({
  page,
  totalPages,
  onPageChange,
  disabled,
}: Props) {
  const items = pageList(page, totalPages);
  const btn =
    "inline-flex h-8 min-w-8 items-center justify-center rounded-lg text-sm transition-colors";

  return (
    <div className="flex items-center gap-2">
      <button
        className={`${btn} ${page === 1 || disabled ? "text-gray-300 bg-gray-100" : "text-gray-600 bg-gray-100 hover:text-gray-800"}`}
        disabled={page === 1 || disabled}
        onClick={() => onPageChange(1)}
        aria-label="First"
      >
        <ChevronsLeft className="h-4 w-4" />
      </button>
      <button
        className={`${btn} ${page === 1 || disabled ? "text-gray-300 bg-gray-100" : "text-gray-600 bg-gray-100 hover:text-gray-800"}`}
        disabled={page === 1 || disabled}
        onClick={() => onPageChange(Math.max(1, page - 1))}
        aria-label="Prev"
      >
        <ChevronLeft className="h-4 w-4" />
      </button>
      {items.map((it, idx) =>
        it === "..." ? (
          <span key={`d-${idx}`} className="px-2 text-gray-400">
            …
          </span>
        ) : (
          <button
            key={it}
            className={
              it === page
                ? "inline-flex h-8 min-w-8 items-center justify-center rounded-lg px-2 text-sm bg-[#FF8C42] text-white"
                : "inline-flex h-8 min-w-8 items-center justify-center rounded-lg px-2 text-sm hover:bg-gray-100"
            }
            onClick={() => onPageChange(it)}
            disabled={disabled}
            aria-current={it === page ? "page" : undefined}
          >
            {it}
          </button>
        ),
      )}
      <button
        className={`${btn} ${page === totalPages || disabled ? "text-gray-300 bg-gray-100" : "text-gray-600 bg-gray-100 hover:text-gray-800"}`}
        disabled={page === totalPages || disabled}
        onClick={() => onPageChange(Math.min(totalPages, page + 1))}
        aria-label="Next"
      >
        <ChevronRight className="h-4 w-4" />
      </button>
      <button
        className={`${btn} ${page === totalPages || disabled ? "text-gray-300 bg-gray-100" : "text-gray-600 bg-gray-100 hover:text-gray-800"}`}
        disabled={page === totalPages || disabled}
        onClick={() => onPageChange(totalPages)}
        aria-label="Last"
      >
        <ChevronsRight className="h-4 w-4" />
      </button>
    </div>
  );
}
