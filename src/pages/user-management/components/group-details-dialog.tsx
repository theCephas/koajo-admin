import React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

export function GroupDetailsDialog({
  open,
  onAdd,
  onOpenChange,
  groupId,
}: {
  open: boolean;
  onAdd?: () => void;
  onOpenChange: (v: boolean) => void;
  groupId: string;
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[720px] rounded-3xl p-6">
        <DialogHeader>
          <DialogTitle className="text-[22px] font-semibold">
            Group Details
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Group ID */}
          <div className="space-y-2">
            <label className="text-sm text-[#6B7280]">Group ID</label>
            <input
              value={groupId}
              readOnly
              className="w-full rounded-xl border px-3 py-2 bg-gray-50 text-[#111827]"
            />
          </div>

          {/* Range */}
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <label className="text-sm text-[#6B7280]">Start Date</label>
              <div className="grid grid-cols-[1fr_auto_1fr] gap-2">
                <input
                  type="time"
                  defaultValue="00:00"
                  className="rounded-xl border px-3 py-2"
                />
                <span className="self-center text-[#9CA3AF]">—</span>
                <input
                  type="date"
                  defaultValue="2020-07-12"
                  className="rounded-xl border px-3 py-2"
                />
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-sm text-[#6B7280]">End Date</label>
              <div className="grid grid-cols-[1fr_auto_1fr] gap-2">
                <input
                  type="time"
                  defaultValue="00:00"
                  className="rounded-xl border px-3 py-2"
                />
                <span className="self-center text-[#9CA3AF]">—</span>
                <input
                  type="date"
                  defaultValue="2020-07-12"
                  className="rounded-xl border px-3 py-2"
                />
              </div>
            </div>
          </div>

          {/* Members */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="text-sm font-medium">Members</div>
              <button
                onClick={onAdd}
                className="h-9 rounded-xl border px-3 text-sm hover:bg-gray-50"
              >
                +
              </button>
            </div>

            <ul className="grid gap-3 sm:grid-cols-2">
              {[
                "Jacob Hawkins",
                "Ronald Robertson",
                "Regina Cooper",
                "Dustin Williamson",
                "Jane Wilson",
              ].map((name, i) => (
                <li key={i} className="flex items-center gap-3">
                  <span className="grid h-9 w-9 place-items-center rounded-full bg-orange-100 text-orange-600 font-semibold">
                    {name.charAt(0)}
                  </span>
                  <div className="leading-tight">
                    <div className="text-sm text-[#111827]">{name}</div>
                    <div className="text-xs text-[#9CA3AF]">
                      {
                        [
                          "UI/UX Designer",
                          "Product Designer",
                          "Back-End Developer",
                          "Web Developer",
                          "Project Manager",
                        ][i % 5]
                      }
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
