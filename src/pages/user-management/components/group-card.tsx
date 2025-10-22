import React from "react";
import { MoreVertical, Clock } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";

export interface GroupCardData {
  id: number;
  groupId: string;
  podLabel: string;
  podTone?: string;
  progress: number;
  updatedLabel: string;
  members: { initials: string; color: string }[];
}

export function GroupCard({
  data,
  onView,
  onDelete,
}: {
  data: GroupCardData;
  onView: () => void;
  onDelete: () => void;
}) {
  return (
    <div className="rounded-2xl border bg-white p-4 shadow-sm">
      {/* Header */}
      <div className="flex items-start justify-between gap-2">
        <div className="space-y-1">
          <div className="text-sm text-[#6B7280]">Group ID</div>
          <div className="text-[17px] font-semibold text-[#111827]">
            {data.groupId}
          </div>
          <div className="mt-2 text-sm text-[#111827]">Pod Type</div>
        </div>

        <div className="flex items-start gap-2">
          <span
            className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium ${
              data.podTone ?? "bg-emerald-100 text-emerald-700"
            }`}
          >
            {data.podLabel}
          </span>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button
                className="h-8 w-8 inline-grid place-items-center rounded-lg hover:bg-gray-100"
                aria-label="Actions"
              >
                <MoreVertical className="h-4 w-4 text-gray-500" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="min-w-40">
              <DropdownMenuItem
                onSelect={(e) => {
                  e.preventDefault();
                  onView();
                }}
              >
                View
              </DropdownMenuItem>
              <DropdownMenuItem
                className="text-rose-600 focus:text-rose-700"
                onSelect={(e) => {
                  e.preventDefault();
                  onDelete();
                }}
              >
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Progress */}
      <div className="mt-3">
        <div className="text-sm text-[#6B7280] mb-1">Progress</div>
        <div className="h-2 w-full rounded-full bg-gray-200 overflow-hidden">
          <div
            className="h-full rounded-full bg-emerald-500"
            style={{ width: `${Math.min(100, Math.max(0, data.progress))}%` }}
          />
        </div>
      </div>

      {/* Footer */}
      <div className="mt-3 flex items-center justify-between">
        <div className="inline-flex items-center gap-1.5 text-xs text-[#6B7280]">
          <Clock className="h-4 w-4 text-[#9CA3AF]" />
          {data.updatedLabel}
        </div>

        <div className="flex -space-x-2">
          {data.members.slice(0, 5).map((m, i) => (
            <span
              key={`${m.initials}-${i}`}
              className={`grid h-7 w-7 place-items-center rounded-full ring-2 ring-white text-xs font-semibold ${m.color}`}
              title={m.initials}
            >
              {m.initials}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
