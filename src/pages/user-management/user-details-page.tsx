import React, { useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import { ChevronDown, Download, Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
import DataTable, { type Column } from "@/components/ui/data-table";
import { Pagination } from "@/components/ui/pagination";
import { GroupCard, type GroupCardData } from "./components/group-card";
import { GroupDetailsDialog } from "./components/group-details-dialog";
import { ConfirmDeleteDialog } from "@/components/ui/confirm-delete-dialog";
import { Link } from "react-router-dom";
import { AddNewMembersDialog } from "@/components/modals/add-new-members-dialog";

type TabKey =
  | "Users Details"
  | "Contribution History"
  | "Group History"
  | "Activity Logs";

function TopTabs({
  active,
  onChange,
}: {
  active: TabKey;
  onChange: (t: TabKey) => void;
}) {
  const tabs: TabKey[] = [
    "Users Details",
    "Contribution History",
    "Group History",
    "Activity Logs",
  ];
  return (
    <div className="flex items-center gap-6 border-b px-2">
      {tabs.map((t) => {
        const isActive = t === active;
        return (
          <button
            key={t}
            onClick={() => onChange(t)}
            className={`relative pb-3 text-sm ${isActive ? "text-[#1F2937]" : "text-[#8A9099] hover:text-[#1F2937]"}`}
          >
            {t}
            {isActive && (
              <span className="absolute -bottom-[1px] left-0 right-0 h-[2px] bg-[#FF8C42] rounded-full" />
            )}
          </button>
        );
      })}
    </div>
  );
}

export default function UserManagementDetailsPage() {
  const { id } = useParams();
  const [tab, setTab] = useState<TabKey>("Users Details");

  return (
    <section className="space-y-6">
      {/* Breadcrumb */}
      <nav className="text-sm text-[#6B7280]">
        <Link to="/users-management" className="hover:underline text-[#374151]">
          Users Management
        </Link>
        <span className="mx-2 text-[#9CA3AF]">/</span>
        <span className="text-[#9CA3AF]">
          User #{String(id).padStart(6, "0")}
        </span>
      </nav>

      <div className="rounded-2xl border bg-white shadow-sm">
        {/* Header row with tabs + export */}
        <div className="flex items-center justify-between px-6 pt-4">
          <TopTabs active={tab} onChange={setTab} />
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              className="rounded-xl h-9 px-3 inline-flex items-center gap-2"
            >
              <Download className="h-4 w-4" />
              Export <ChevronDown className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Content */}
        <div className="px-6 pb-6">
          {tab === "Users Details" && <UsersDetailsCard userId={String(id)} />}
          {tab === "Contribution History" && <ContributionHistoryTable />}
          {tab === "Group History" && <GroupHistoryTable />}
          {tab === "Activity Logs" && <ActivityLogs />}
        </div>
      </div>
    </section>
  );
}

function UsersDetailsCard({ userId }: { userId: string }) {
  return (
    <div className="pt-4 space-y-6">
      <div className="flex items-center gap-3">
        <h2 className="text-[22px] font-semibold">
          User ID #{userId.padStart(6, "0")}
        </h2>
        <span className="inline-flex items-center rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-medium text-emerald-600">
          Verified
        </span>
      </div>

      <div>
        <h3 className="text-sm font-semibold text-[#1F2937] mb-2">Customer</h3>
        <div className="grid grid-cols-[1fr_1fr_1fr_2fr] items-center border-y py-3">
          <div className="flex items-center gap-3">
            <span className="grid h-9 w-9 place-items-center rounded-full bg-orange-100 text-orange-600 font-semibold">
              R
            </span>
            <span className="text-sm font-medium">Regina Cooper</span>
          </div>
          <span className="text-sm text-[#6B7280]">example@mail.com</span>
          <span className="text-sm text-[#6B7280]">+1(070) 4567–8800</span>
          <span className="text-sm text-[#6B7280]">
            993 E. Brewer St. Holtsville, NY 11742
          </span>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-4">
        <div className="space-y-3">
          <h4 className="text-sm font-semibold">verified KYC documents</h4>
          <div className="rounded-xl border p-3 inline-flex items-center gap-3">
            <span className="grid h-9 w-9 place-items-center rounded-lg bg-rose-50 text-rose-600">
              PDF
            </span>
            <div className="text-sm">
              <div>Resume.pdf</div>
              <div className="text-xs text-[#6B7280]">570 KB</div>
            </div>
            <button
              className="ml-auto rounded-lg border p-2 text-[#6B7280] hover:bg-gray-50"
              title="Download"
            >
              <Download className="h-4 w-4" />
            </button>
          </div>
        </div>

        <div className="space-y-3">
          <h4 className="text-sm font-semibold">Pod Type</h4>
          <div className="inline-flex items-center rounded-full bg-emerald-100 px-3 py-1 text-sm font-medium text-emerald-700">
            $ 100 Pod
          </div>
        </div>

        <div className="space-y-3 md:col-span-1">
          <h4 className="text-sm font-semibold">Address Details</h4>
          <dl className="space-y-1 text-sm text-[#6B7280]">
            <div>
              <dt className="inline text-[#9CA3AF]">Address Line 1:</dt>{" "}
              <dd className="inline">993 E. Brewer St. Holtsville</dd>
            </div>
            <div>
              <dt className="inline text-[#9CA3AF]">City:</dt>{" "}
              <dd className="inline">New York</dd>
            </div>
            <div>
              <dt className="inline text-[#9CA3AF]">Country:</dt>{" "}
              <dd className="inline">United States</dd>
            </div>
            <div>
              <dt className="inline text-[#9CA3AF]">State/Region:</dt>{" "}
              <dd className="inline">New York</dd>
            </div>
            <div>
              <dt className="inline text-[#9CA3AF]">Postcode:</dt>{" "}
              <dd className="inline">11742</dd>
            </div>
          </dl>
        </div>

        <div className="space-y-3 md:col-span-1">
          <h4 className="text-sm font-semibold">Payment Details</h4>
          <dl className="space-y-1 text-sm text-[#6B7280]">
            <div>
              <dt className="inline text-[#9CA3AF]">Card Number:</dt>{" "}
              <dd className="inline">5890 – 6858 – 6332 – 9843</dd>
            </div>
            <div>
              <dt className="inline text-[#9CA3AF]">Card Name:</dt>{" "}
              <dd className="inline">Regina Cooper</dd>
            </div>
            <div>
              <dt className="inline text-[#9CA3AF]">Card Expiry:</dt>{" "}
              <dd className="inline">12/2023</dd>
            </div>
          </dl>
        </div>
      </div>
    </div>
  );
}

interface TxRow {
  id: number;
  invoice: string;
  date: string;
  time: string;
  amount: number;
  status: "Success" | "pending";
}

function ContributionHistoryTable() {
  const rows: TxRow[] = Array.from({ length: 50 }).map((_, i) => ({
    id: i + 1,
    invoice: ["BUBU2928999", "01-MMND9JXN", "129092N2K9OO", "93N F03NMF3K"][
      i % 4
    ],
    date: [
      "October 20, 2025",
      "October 24, 2022",
      "November 01, 2022",
      "November 08, 2022",
    ][i % 4],
    time: "01:32 PM",
    amount: [-32, -64, 100, -32][i % 4],
    status: (["Success", "Success", "Success", "pending"] as const)[i % 4],
  }));

  const columns: Column<TxRow>[] = [
    { key: "invoice", label: "Invoice", className: "text-[#374151]" },
    {
      key: "date",
      label: "Date & Time",
      render: (_, r) => (
        <div className="text-[#374151]">
          <div>{r.date}</div>
          <div className="text-xs text-[#6B7280]">{r.time}</div>
        </div>
      ),
    },
    {
      key: "amount",
      label: "Amount",
      render: (v: number) => (
        <span className={`${v >= 0 ? "text-emerald-600" : "text-[#111827]"}`}>
          {v >= 0 ? `+$${v.toFixed(2)}` : `-$${Math.abs(v).toFixed(2)}`}
        </span>
      ),
    },
    {
      key: "status",
      label: "Status",
      render: (v: TxRow["status"]) => (
        <span
          className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ${
            v === "Success"
              ? "bg-emerald-50 text-emerald-600"
              : "bg-amber-50 text-amber-700"
          }`}
        >
          {v}
        </span>
      ),
    },
    {
      key: "action",
      label: "Action",
      width: 80,
      render: () => (
        <button
          className="h-8 w-8 inline-grid place-items-center rounded-lg hover:bg-gray-100"
          title="View"
        >
          <Eye className="h-4 w-4 text-gray-500" />
        </button>
      ),
    },
  ];

  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [selected, setSelected] = useState<number[]>([]);

  return (
    <div className="pt-4">
      <DataTable<TxRow>
        title=""
        data={rows}
        columns={columns}
        showCheckboxes
        searchable
        searchPlaceholder="Search for transaction here"
        filterable={false}
        page={page}
        pageSize={pageSize}
        onPageChange={setPage}
        onPageSizeChange={setPageSize}
        pageSizeOptions={[10, 20, 50, 100]}
        selectedRows={selected}
        onRowSelect={(ids) => setSelected(ids as number[])}
      />
    </div>
  );
}

function GroupHistoryTable() {
  const allGroups: GroupCardData[] = useMemo(
    () =>
      Array.from({ length: 24 }).map((_, i) => ({
        id: i + 1,
        groupId: `#9044${4904 + i}`,
        podLabel: i % 3 === 1 ? "$ 200 Pod" : "$ 100 Pod",
        podTone:
          i % 3 === 1
            ? "bg-rose-100 text-rose-700"
            : "bg-emerald-100 text-emerald-700",
        progress: i % 3 === 1 ? 50 : 100,
        updatedLabel: "1 week ago",
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

  const [items, setItems] = useState<GroupCardData[]>(allGroups);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(6);
  const [addOpen, setAddOpen] = useState(false);

  const totalCount = items.length;
  const totalPages = Math.max(1, Math.ceil(totalCount / pageSize));
  const clampedPage = Math.min(page, totalPages);
  const start = (clampedPage - 1) * pageSize;
  const end = start + pageSize;
  const slice = items.slice(start, end);

  const [open, setOpen] = useState(false);
  const [activeGroupId, setActiveGroupId] = useState<string>("");

  const [deleteOpen, setDeleteOpen] = useState(false);
  const [pendingGroup, setPendingGroup] = useState<GroupCardData | null>(null);

  const onView = (g: GroupCardData) => {
    setActiveGroupId(g.groupId);
    setOpen(true);
  };
  const onDeleteAsk = (g: GroupCardData) => {
    setPendingGroup(g);
    setDeleteOpen(true);
  };

  return (
    <div className="pt-4">
      {/* Grid */}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {slice.map((g) => (
          <GroupCard
            key={g.id}
            data={g}
            onView={() => onView(g)}
            onDelete={() => onDeleteAsk(g)}
          />
        ))}
        {slice.length === 0 && (
          <div className="col-span-full rounded-2xl border border-dashed bg-gray-50/50 px-6 py-12 text-center">
            <div className="text-sm font-medium text-[#111827]">
              No groups on this page
            </div>
            <div className="text-xs text-[#6B7280]">
              Try a different page or page size.
            </div>
          </div>
        )}
      </div>

      {/* Footer controls */}
      <div className="mt-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
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
              {[6, 12, 18].map((n) => (
                <option key={n} value={n}>
                  {n}
                </option>
              ))}
            </select>
            <span className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 text-gray-400">
              ▾
            </span>
          </div>
          <span className="text-sm text-gray-500">
            Showing {totalCount === 0 ? 0 : start + 1} -{" "}
            {Math.min(end, totalCount)} of {totalCount}
          </span>
        </div>

        <Pagination
          page={clampedPage}
          totalPages={totalPages}
          onPageChange={setPage}
        />
      </div>

      {/* View dialog */}
      <GroupDetailsDialog
        open={open}
        onOpenChange={setOpen}
        groupId={activeGroupId}
        onAdd={() => {
          setAddOpen(true);
          setOpen(false);
        }}
      />

      {/* Confirm delete dialog */}
      <ConfirmDeleteDialog
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        title="Delete group"
        itemName={pendingGroup?.groupId}
        onConfirm={() => {
          if (!pendingGroup) return;
          setItems((prev) => prev.filter((x) => x.id !== pendingGroup.id));
          setPendingGroup(null);
        }}
      />

      <AddNewMembersDialog
        open={addOpen}
        onOpenChange={setAddOpen}
        teamName="Groups"
        onAdd={(_members) => {
          // integrate later
          // console.log("Added to users:", members.map((m) => m.name));
        }}
      />
    </div>
  );
}

function ActivityLogs() {
  const items = Array.from({ length: 12 }).map((_, i) => ({
    id: i + 1,
    ts: "2025-10-02 12:3" + (i % 10),
    text: [
      "Updated profile",
      "Submitted KYC",
      "Joined Group 2",
      "Made a payment",
    ][i % 4],
  }));
  return (
    <div className="pt-6">
      <ul className="space-y-3">
        {items.map((it) => (
          <li key={it.id} className="flex items-start gap-3">
            <span className="mt-1 h-2 w-2 rounded-full bg-[#FF8C42]" />
            <div>
              <div className="text-sm text-[#374151]">{it.text}</div>
              <div className="text-xs text-[#9CA3AF]">{it.ts}</div>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
