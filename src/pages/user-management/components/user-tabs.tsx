import React from "react";

type TabKey = "All" | "KYC status" | "Pod" | "Group";
interface Props {
  active: TabKey;
  counts: Record<TabKey, number>;
  onChange: (t: TabKey) => void;
}

const tabs: TabKey[] = ["All", "KYC status", "Pod", "Group"];

export function UserTabs({ active, counts, onChange }: Props) {
  return (
    <div className="flex items-center gap-6 border-b px-2">
      {tabs.map((t) => {
        const isActive = active === t;
        return (
          <button
            key={t}
            onClick={() => onChange(t)}
            className={`relative pb-3 text-sm transition-colors ${
              isActive
                ? "text-[#1F2937]"
                : "text-[#8A9099] hover:text-[#1F2937]"
            }`}
          >
            <span className="inline-flex items-center gap-2">
              {t}
              <span
                className={`inline-flex h-5 min-w-[22px] items-center justify-center rounded-full px-1.5 text-xs ${isActive ? "bg-gray-900 text-white" : "bg-gray-100 text-gray-600"}`}
              >
                {counts[t]}
              </span>
            </span>
            {isActive && (
              <span className="absolute -bottom-[1px] left-0 right-0 h-[2px] rounded-full bg-[#FF8C42]" />
            )}
          </button>
        );
      })}
    </div>
  );
}
