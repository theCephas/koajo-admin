import React, { useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Plus, Filter } from "lucide-react";
import {
  GroupCard,
  type GroupCardData,
} from "@/pages/user-management/components/group-card";
import { ConfirmDeleteDialog } from "@/components/ui/confirm-delete-dialog";
import { Pagination } from "@/components/ui/pagination";

type TabKey = "All" | "Started" | "In progress" | "Completed";
const tabs: TabKey[] = ["All", "Started", "In progress", "Completed"];

export default function ProjectsPage() {
  const all: GroupCardData[] = useMemo(
    () =>
      Array.from({ length: 18 }).map((_, i) => ({
        id: i + 1,
        groupId: `292029${2022 + i}`,
        podLabel: "Progress",
        podTone: "bg-emerald-100 text-emerald-700",
        progress: 50,
        updatedLabel: "1 week left",
        members: [
          { initials: "A", color: "bg-sky-200 text-sky-700" },
          { initials: "B", color: "bg-amber-200 text-amber-700" },
          { initials: "C", color: "bg-purple-200 text-purple-700" },
          { initials: "D", color: "bg-pink-200 text-pink-700" },
          { initials: "E", color: "bg-indigo-200 text-indigo-700" },
        ],
      })),
    [],
  );

  const [tab, setTab] = useState<TabKey>("All");
  const data = all; // mock: same for all tabs
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(9);
  const totalPages = Math.max(1, Math.ceil(data.length / pageSize));
  const start = (page - 1) * pageSize;
  const slice = data.slice(start, start + pageSize);

  const navigate = useNavigate();
  const [delOpen, setDelOpen] = useState(false);
  const [pending, setPending] = useState<number | null>(null);

  return (
    <section className="space-y-6">
      {/* Breadcrumb */}
      <nav className="text-sm text-[#6B7280]">
        <Link
          to="/groups-management"
          className="hover:underline text-[#374151]"
        >
          Group Management
        </Link>
        <span className="mx-2 text-[#9CA3AF]">/</span>
        <span className="text-[#9CA3AF]">Projects</span>
      </nav>

      <div className="flex items-center justify-between">
        <h1 className="text-[22px] md:text-[24px] font-semibold text-[#111827]">
          Projects
        </h1>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            className="rounded-xl h-9 px-3 inline-flex items-center gap-2"
          >
            <Filter className="h-4 w-4" /> Filter
          </Button>
          <Button className="rounded-xl bg-[#FF8C42] hover:bg-[#f77f2f] inline-flex items-center gap-2">
            <Plus className="h-4 w-4" /> Add Project
          </Button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-6">
        {tabs.map((t) => {
          const activeTab = t === tab;
          return (
            <button
              key={t}
              onClick={() => {
                setTab(t);
                setPage(1);
              }}
              className={`relative pb-3 text-sm ${activeTab ? "text-[#1F2937]" : "text-[#8A9099] hover:text-[#1F2937]"}`}
            >
              {t}{" "}
              <span
                className={`ml-2 inline-flex h-5 min-w-[22px] items-center justify-center rounded-full px-1.5 text-xs ${activeTab ? "bg-gray-900 text-white" : "bg-gray-100 text-gray-600"}`}
              >
                {data.length}
              </span>
              {activeTab && (
                <span className="absolute -bottom-[1px] left-0 right-0 h-[2px] rounded-full bg-[#FF8C42]" />
              )}
            </button>
          );
        })}
      </div>

      {/* Grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {slice.map((g) => (
          <GroupCard
            key={g.id}
            data={g}
            onView={() => {
              void navigate(`/groups-management/projects/${g.groupId}`, {
                state: {
                  breadcrumbs: [
                    { label: "Group Management", to: "/groups-management" },
                    { label: "Projects", to: "/groups-management/projects" },
                    { label: `Project ${g.groupId}` },
                  ],
                },
              });
            }}
            onDelete={() => {
              setPending(g.id);
              setDelOpen(true);
            }}
          />
        ))}
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between">
        <div className="relative">
          <select
            value={pageSize}
            onChange={(e) => {
              setPageSize(Number(e.target.value));
              setPage(1);
            }}
            className="appearance-none rounded-xl border bg-white px-3 py-1.5 text-sm pr-7"
            aria-label="Cards per page"
          >
            {[6, 9, 12, 18].map((n) => (
              <option key={n} value={n}>
                {n}
              </option>
            ))}
          </select>
          <span className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 text-gray-400">
            ▾
          </span>
        </div>
        <Pagination
          page={page}
          totalPages={totalPages}
          onPageChange={setPage}
        />
      </div>

      {/* Modals */}
      <ConfirmDeleteDialog
        open={delOpen}
        onOpenChange={setDelOpen}
        title="Delete project"
        itemName={pending != null ? `Project ${pending}` : undefined}
        onConfirm={() => {
          // replace with API; for demo we just close
          void setPending(null);
        }}
      />
    </section>
  );
}
