import React, { useMemo, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogClose,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Search } from "lucide-react";

export interface Member {
  id: number;
  name: string;
  role: string;
  avatarColor: string; // e.g. "bg-orange-100 text-orange-600"
  initials: string;
}

const MOCK_MEMBERS: Member[] = [
  {
    id: 1,
    name: "Regina Cooper",
    role: "Back-End Developer",
    avatarColor: "bg-orange-100 text-orange-600",
    initials: "R",
  },
  {
    id: 2,
    name: "Jane Wilson",
    role: "Project Manager",
    avatarColor: "bg-sky-100 text-sky-600",
    initials: "J",
  },
  {
    id: 3,
    name: "Dustin Williamson",
    role: "Web Developer",
    avatarColor: "bg-purple-100 text-purple-600",
    initials: "D",
  },
  {
    id: 4,
    name: "Robert Edwards",
    role: "Project Manager",
    avatarColor: "bg-emerald-100 text-emerald-600",
    initials: "R",
  },
  {
    id: 5,
    name: "Brandon Pena",
    role: "UI/UX Designer",
    avatarColor: "bg-amber-100 text-amber-600",
    initials: "B",
  },
  {
    id: 6,
    name: "Shane Black",
    role: "Product Designer",
    avatarColor: "bg-pink-100 text-pink-600",
    initials: "S",
  },
];

export function AddNewMembersDialog({
  open,
  onOpenChange,
  title = "Add New Members",
  teamName = "Designers Team",
  onAdd,
  defaultSelected = [6], // Shane Black in pill as in screenshot
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title?: string;
  teamName?: string;
  onAdd?: (selected: Member[]) => void;
  defaultSelected?: number[];
}) {
  const [query, setQuery] = useState("");
  const [selectedIds, setSelectedIds] = useState<number[]>(defaultSelected);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return MOCK_MEMBERS;
    return MOCK_MEMBERS.filter(
      (m) =>
        m.name.toLowerCase().includes(q) || m.role.toLowerCase().includes(q),
    );
  }, [query]);

  const selected = useMemo(
    () => MOCK_MEMBERS.filter((m) => selectedIds.includes(m.id)),
    [selectedIds],
  );

  const toggle = (id: number) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[480px] rounded-3xl p-6">
        <DialogHeader>
          <DialogTitle className="text-[20px] font-semibold">
            {title}
          </DialogTitle>
        </DialogHeader>

        <div className="mt-2 space-y-5">
          <div>
            <div className="text-sm text-muted-foreground">
              Invite Members to {teamName}
            </div>
            <div className="mt-2 flex flex-wrap gap-2">
              {selected.map((m) => (
                <span
                  key={m.id}
                  className="inline-flex items-center gap-2 rounded-full bg-sky-50 px-2.5 py-1 text-xs text-sky-700"
                >
                  <span className="grid h-5 w-5 place-items-center rounded-full bg-sky-100 text-sky-700 text-[10px]">
                    {m.initials}
                  </span>
                  {m.name}
                  <button
                    className="ml-1 text-sky-600 hover:opacity-80"
                    onClick={() => toggle(m.id)}
                    aria-label={`Remove ${m.name}`}
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>

            <div className="relative mt-3">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="w-full rounded-xl border bg-white px-9 py-2 text-sm"
                placeholder="Search members"
              />
            </div>
          </div>

          <div>
            <div className="mb-2 text-sm">Invited({selected.length})</div>
            <ul className="space-y-2">
              {filtered.map((m) => {
                const checked = selectedIds.includes(m.id);
                return (
                  <li
                    key={m.id}
                    className="flex items-center justify-between rounded-xl border bg-white px-3 py-2"
                  >
                    <div className="flex items-center gap-3">
                      <span
                        className={`grid h-8 w-8 place-items-center rounded-full ${m.avatarColor} font-semibold`}
                      >
                        {m.initials}
                      </span>
                      <div className="leading-tight">
                        <div className="text-sm text-foreground">{m.name}</div>
                        <div className="text-xs text-muted-foreground">
                          {m.role}
                        </div>
                      </div>
                    </div>
                    <button
                      className={`h-6 w-6 rounded-full ${checked ? "bg-orange-100 text-orange-600" : "bg-gray-100 text-gray-400"} grid place-items-center`}
                      onClick={() => toggle(m.id)}
                      aria-label={checked ? "Remove" : "Add"}
                    >
                      {checked ? "✓" : "+"}
                    </button>
                  </li>
                );
              })}
            </ul>
          </div>

          <div className="flex items-center justify-end gap-2">
            <DialogClose asChild>
              <Button variant="outline" className="rounded-xl">
                Cancel
              </Button>
            </DialogClose>
            <Button
              className="rounded-xl bg-[#FF8C42] hover:bg-[#f77f2f]"
              onClick={() => {
                onAdd?.(selected);
                onOpenChange(false);
              }}
            >
              Add
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
