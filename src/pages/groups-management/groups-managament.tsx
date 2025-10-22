import React, { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import DataTable, { type Column } from "@/components/ui/data-table";
import { Button } from "@/components/ui/button";
import { Download, MoreVertical, Search } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { StatCard } from "@/components/dashboard/stat-card";

export interface GroupRow {
  id: number;
  group: string; // "Group ID #..."
  members: number; // count
  progress: number; // 0-100
  status: string; // "1 week left"
}

const MOCK: GroupRow[] = Array.from({ length: 100 }).map((_, i) => ({
  id: i + 1,
  group: `Group ID #${590000000 + i}`,
  members: 6 - (i % 3),
  progress: 50,
  status: "1 week left",
}));

export default function GroupsManagament() {
  const navigate = useNavigate();

  // Dialog state for Add members
  //   const [openAdd, setOpenAdd] = useState(false);

  // Data and paging
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [selectedRows, setSelectedRows] = useState<number[]>([]);
  const [rows, _setRows] = useState<GroupRow[]>(MOCK);

  // Search (local)
  const [q, setQ] = useState("");
  const filtered = useMemo(() => {
    if (!q) return rows;
    const s = q.toLowerCase();
    return rows.filter((r) => r.group.toLowerCase().includes(s));
  }, [q, rows]);

  // Columns per design
  const columns: Column<GroupRow>[] = [
    {
      key: "group",
      label: "GROUP ID",
      render: (v, row) => (
        <div className="flex items-center gap-3">
          <span className="grid h-9 w-9 place-items-center rounded-xl bg-blue-50 text-blue-600 font-semibold">
            DB
          </span>
          <div className="leading-tight">
            <div className="text-sm font-medium text-[#111827]">
              {row.group.split(" ")[0]}
            </div>
            <div className="text-xs text-[#6B7280]">
              {row.group.split(" ").slice(1).join(" ")}
            </div>
          </div>
        </div>
      ),
    },
    {
      key: "members",
      label: "MEMBERS",
      width: 180,
      render: (v: number) => (
        <div className="flex items-center -space-x-2">
          {Array.from({ length: 6 }).map((_, idx) => (
            <span
              key={idx}
              className={`grid h-7 w-7 place-items-center rounded-full ring-2 ring-white ${idx < v ? "bg-orange-100 text-orange-600" : "bg-gray-100 text-gray-500"}`}
            >
              {(idx + 10).toString(36).toUpperCase()}
            </span>
          ))}
        </div>
      ),
    },
    {
      key: "progress",
      label: "CYCLE PROGRESS",
      width: 240,
      render: (v: number) => (
        <div className="w-full">
          <div className="h-2 w-full rounded-full bg-gray-200 overflow-hidden">
            <div
              className="h-full rounded-full bg-[#22C55E]"
              style={{ width: `${v}%` }}
            />
          </div>
          <div className="mt-1 text-xs text-[#6B7280]">{v}%</div>
        </div>
      ),
    },
    {
      key: "status",
      label: "STATUS",
      width: 160,
      render: (v: string) => (
        <div className="inline-flex items-center gap-2 rounded-full bg-gray-100 px-3 py-1 text-xs text-[#111827]">
          <span className="h-2 w-2 rounded-full bg-[#FF8C42]" />
          {v}
        </div>
      ),
    },
    {
      key: "action",
      label: "",
      width: 80,
      render: (_) => (
        <div className="flex items-center justify-end">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="h-8 w-8 inline-grid place-items-center rounded-lg hover:bg-gray-100">
                <MoreVertical className="h-4 w-4 text-gray-500" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="min-w-40">
              <DropdownMenuItem
                onSelect={(e) => {
                  e.preventDefault();
                  void navigate("/groups-management/projects");
                }}
              >
                View projects
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      ),
    },
  ];

  return (
    <section className="space-y-6">
      {/* Header + actions */}
      <div className="flex items-center justify-between">
        <h1 className="text-[22px] md:text-[24px] font-semibold text-[#111827]">
          Group Management
        </h1>
        <div className="flex items-center gap-2">
          {/* <Button
            variant="outline"
            className="rounded-xl h-9 px-3 inline-flex items-center gap-2"
            onClick={() => setOpenAdd(true)}
          >
            + Add Member
          </Button> */}
          <Button
            variant="outline"
            className="rounded-xl h-9 px-3 inline-flex items-center gap-2"
          >
            <Download className="h-4 w-4" />
            Export
          </Button>
          {/* <Button
            className="rounded-xl bg-[#FF8C42] hover:bg-[#f77f2f]"
            onClick={() => {
              void navigate("/groups-management/projects");
            }}
          >
            + Add Project
          </Button> */}
        </div>
      </div>

      {/* KPIs */}
      <div className="grid gap-4 md:grid-cols-4">
        <StatCard title="Active Groups" value="24" delta="+4.85%" />
        <StatCard
          title="Total Members"
          value="142"
          delta="-5.25%"
          trend="down"
        />
        <StatCard title="Pending Invites" value="7" delta="+3.55%" />
        <StatCard
          title="Incomplete Groups"
          value="3"
          delta="-10.30%"
          trend="down"
        />
      </div>

      {/* Transactions + Tasks (compact to match tone) */}
      <div className="grid gap-4 lg:grid-cols-2">
        <div className="rounded-2xl border bg-white p-4 shadow-sm">
          <div className="mb-3 flex items-center justify-between">
            <div className="font-medium">Transactions</div>
            <button
              className="h-8 w-8 grid place-items-center rounded-lg hover:bg-gray-100"
              title="More"
            >
              <MoreVertical className="h-4 w-4 text-gray-500" />
            </button>
          </div>
          <ul className="space-y-3">
            {[
              "Devon Williamson",
              "Debra Wilson",
              "Judith Black",
              "Phillip Henry",
              "Mitchell Cooper",
            ].map((n, i) => (
              <li key={i} className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="grid h-9 w-9 place-items-center rounded-full bg-orange-100 text-orange-600 font-semibold">
                    {n.slice(0, 1)}
                  </span>
                  <div className="leading-tight">
                    <div className="text-sm text-[#111827]">{n}</div>
                    <div className="text-xs text-[#6B7280]">
                      {
                        [
                          "08:00 AM — 19 August",
                          "09:45 AM — 10 August",
                          "10:15 AM — 20 August",
                          "10:50 AM — 23 August",
                          "12:45 AM — 25 August",
                        ][i]
                      }
                    </div>
                  </div>
                </div>
                <div
                  className={`text-sm font-medium ${[1400, -850, 2050, 650, 900][i] >= 0 ? "text-emerald-600" : "text-rose-600"}`}
                >
                  {[1400, -850, 2050, 650, 900][i] >= 0 ? "+" : ""}$
                  {Math.abs([1400, -850, 2050, 650, 900][i]).toLocaleString()}
                </div>
              </li>
            ))}
          </ul>
        </div>
        <div className="rounded-2xl border bg-white p-4 shadow-sm">
          <div className="mb-3 flex items-center justify-between">
            <div className="font-medium">Active Tasks</div>
            <div className="inline-flex rounded-xl border px-1 py-1 text-xs">
              <button className="rounded-lg px-2 py-1 bg-[#FF8C42] text-white">
                Day
              </button>
              <button className="rounded-lg px-2 py-1 text-[#6B7280]">
                Week
              </button>
              <button className="rounded-lg px-2 py-1 text-[#6B7280]">
                Month
              </button>
            </div>
          </div>
          <ul className="space-y-3">
            {Array.from({ length: 4 }).map((_, i) => (
              <li
                key={i}
                className="flex items-center justify-between rounded-xl border px-3 py-2"
              >
                <div className="flex items-center gap-3">
                  <span
                    className={`h-2 w-2 rounded-full ${i === 1 ? "bg-orange-500" : "bg-emerald-500"}`}
                  />
                  <div className="text-sm text-[#111827]">
                    Regina Cooper{" "}
                    <span className="text-xs text-[#6B7280]">
                      Sending project #{700 + i} for revision to ...
                    </span>
                  </div>
                </div>
                <button className="h-8 w-8 grid place-items-center rounded-lg hover:bg-gray-100">
                  <MoreVertical className="h-4 w-4 text-gray-500" />
                </button>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Table card with search and actions */}
      <div className="rounded-2xl border bg-white shadow-sm">
        <div className="flex items-center justify-between border-b px-4 py-3">
          <div className="relative w-full max-w-md">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <input
              placeholder="Search group..."
              value={q}
              onChange={(e) => setQ(e.target.value)}
              className="w-full rounded-lg border bg-white px-9 py-2 text-sm"
            />
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" className="rounded-xl h-9 px-3">
              Actions
            </Button>
          </div>
        </div>

        <DataTable<GroupRow>
          title=""
          data={filtered}
          columns={columns}
          showCheckboxes
          searchable={false}
          filterable={false}
          page={page}
          pageSize={pageSize}
          onPageChange={setPage}
          onPageSizeChange={setPageSize}
          pageSizeOptions={[10, 20, 50, 100]}
          selectedRows={selectedRows}
          onRowSelect={(ids) => setSelectedRows(ids as number[])}
          className="border-0"
        />
      </div>
    </section>
  );
}
