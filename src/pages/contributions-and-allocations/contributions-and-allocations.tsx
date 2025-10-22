import React from "react";
import { useMemo, useState } from "react";
import DataTable, { type Column } from "@/components/ui/data-table";
import { Button } from "@/components/ui/button";
import { Download, EllipsisVertical } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { StatCard } from "@/components/dashboard/stat-card";
import { ConfirmDeleteDialog } from "@/components/ui/confirm-delete-dialog";
import { useNavigate } from "react-router-dom";

type Status = "Shipped" | "Processing" | "Failed";
type Payment = "PayPal" | "Credit Card" | "Payoneer";

export interface CArow {
  id: number;
  orderNo: string; // "#790841"
  customer: string; // "Claire Warren"
  date: string; // "12.09.20"
  total: string; // "$145.85"
  payment: Payment;
  status: Status;
}

const MOCK: CArow[] = Array.from({ length: 36 }).map((_, i) => {
  const names = [
    "Claire Warren",
    "Theresa Robertson",
    "Nathan Hawkins",
    "Lily Williamson",
    "Brooklyn Steward",
    "Leslie Mckinney",
    "Gregory Black",
    "Norma Flores",
  ];
  const pays: Payment[] = ["PayPal", "Credit Card", "Payoneer"];
  const sts: Status[] = ["Shipped", "Processing", "Failed"];
  const amount = (105 + ((i * 23) % 400) + (i % 3) * 0.55).toFixed(2);
  return {
    id: i + 1,
    orderNo: `#${790000 + (i % 900)}`,
    customer: names[i % names.length],
    date: "12.09.20",
    total: `$${amount}`,
    payment: pays[i % pays.length],
    status: sts[i % sts.length],
  };
});

type TabKey = "All" | "Payment" | "Pending" | "Failed";

export default function ContributionsAndAllocations() {
  const navigate = useNavigate();

  const [tab, setTab] = useState<TabKey>("All");
  const [rows, setRows] = useState<CArow[]>(() => MOCK);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [selectedRows, setSelectedRows] = useState<number[]>([]);
  const [range, setRange] = useState<"7" | "30" | "90">("7");

  // Delete dialog
  const [delOpen, setDelOpen] = useState(false);
  const [pending, setPending] = useState<CArow | null>(null);

  const filtered = useMemo(() => {
    switch (tab) {
      case "Payment":
        return rows.filter((r) => r.status === "Shipped");
      case "Pending":
        return rows.filter((r) => r.status === "Processing");
      case "Failed":
        return rows.filter((r) => r.status === "Failed");
      default:
        return rows;
    }
  }, [rows, tab]);

  const counts = useMemo(
    () => ({
      All: rows.length,
      Payment: rows.filter((r) => r.status === "Shipped").length,
      Pending: rows.filter((r) => r.status === "Processing").length,
      Failed: rows.filter((r) => r.status === "Failed").length,
    }),
    [rows],
  );

  const columns: Column<CArow>[] = [
    {
      key: "orderNo",
      label: "ORDER NO.",
      width: 120,
      render: (v, row) => (
        <button
          className="text-[#374151] hover:underline"
          onClick={() =>
            void navigate(`/contributions-and-allocations/${row.id}`)
          }
        >
          {v}
        </button>
      ),
    },
    { key: "customer", label: "CUSTOMER", className: "text-[#374151]" },
    { key: "date", label: "DATE", className: "text-[#374151]" },
    { key: "total", label: "TOTAL", className: "text-[#374151]" },
    { key: "payment", label: "PAYMENT", className: "text-[#374151]" },
    {
      key: "status",
      label: "STATUS",
      width: 140,
      render: (v: Status) => {
        const tone =
          v === "Shipped"
            ? "bg-emerald-50 text-emerald-700"
            : v === "Processing"
              ? "bg-amber-50 text-amber-700"
              : "bg-rose-50 text-rose-700";
        return (
          <span
            className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium ${tone}`}
          >
            {v}
          </span>
        );
      },
    },
    {
      key: "actions",
      label: "",
      width: 56,
      render: (_v, row) => (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="h-8 w-8 inline-grid place-items-center rounded-lg hover:bg-gray-100">
              <EllipsisVertical className="h-4 w-4 text-gray-500" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="min-w-40">
            <DropdownMenuItem
              onSelect={(e) => {
                e.preventDefault();
                void navigate(`/contributions-and-allocations/${row.id}`);
              }}
            >
              View details
            </DropdownMenuItem>
            <DropdownMenuItem
              className="text-rose-600 focus:text-rose-700"
              onSelect={(e) => {
                e.preventDefault();
                setPending(row);
                setDelOpen(true);
              }}
            >
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      ),
    },
  ];

  return (
    <section className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-[22px] md:text-[24px] font-semibold text-[#111827]">
            Contributions & Allocations Management
          </h1>
          <div className="mt-2 flex items-center gap-2">
            <div className="flex -space-x-2">
              {Array.from({ length: 5 }).map((_, i) => (
                <span
                  key={i}
                  className="grid h-7 w-7 place-items-center rounded-full bg-orange-100 text-orange-600 text-xs font-semibold ring-2 ring-white"
                >
                  {String.fromCharCode(65 + i)}
                </span>
              ))}
            </div>
            <span className="text-xs text-[#6B7280]">
              Ava, Liam, Noah +12 others
            </span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            className="rounded-xl h-9 px-3 inline-flex items-center gap-2"
          >
            <Download className="h-4 w-4" />
          </Button>
          <Select
            value={range}
            onValueChange={(v) => setRange(v as typeof range)}
          >
            <SelectTrigger className="rounded-xl h-9 w-[140px]">
              <SelectValue placeholder="Last 7 days" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7">Last 7 days</SelectItem>
              <SelectItem value="30">Last 30 days</SelectItem>
              <SelectItem value="90">Last 90 days</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <StatCard
          title="Pending payment"
          value="24"
          delta="+4.85%"
          trend="up"
        />
        <StatCard
          title="Failed Transactions"
          value="142"
          delta="5.25%"
          trend="down"
        />
        <StatCard
          title="Complete Transactions"
          value="7"
          delta="+3.55%"
          trend="up"
        />
        <StatCard
          title="Payment Allocation"
          value="3"
          delta="10.30%"
          trend="down"
        />
      </div>

      {/* Tabs */}
      <div className="flex items-center justify-between py-3">
        <div className="flex items-center gap-6">
          {(["All", "Payment", "Pending", "Failed"] as TabKey[]).map((t) => {
            const isActive = tab === t;
            return (
              <button
                key={t}
                onClick={() => {
                  setTab(t);
                  setPage(1);
                  setSelectedRows([]);
                }}
                className={`relative pb-3 text-sm transition-colors ${
                  isActive
                    ? "text-[#1F2937]"
                    : "text-[#8A9099] hover:text-[#1F2937]"
                }`}
              >
                <span className="inline-flex items-center gap-2">
                  {t}
                  <span
                    className={`inline-flex h-5 min-w-[22px] items-center justify-center rounded-full px-1.5 text-xs ${
                      isActive
                        ? "bg-gray-900 text-white"
                        : "bg-gray-100 text-gray-600"
                    }`}
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
      </div>

      {/* Table */}
      <div className="rounded-2xl border bg-white shadow-sm">
        <DataTable<CArow>
          title=""
          data={filtered}
          columns={columns}
          showCheckboxes
          searchable
          searchPlaceholder="Search order..."
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

      {/* Confirm delete */}
      <ConfirmDeleteDialog
        open={delOpen}
        onOpenChange={setDelOpen}
        title="Delete transaction"
        itemName={pending?.orderNo}
        onConfirm={() => {
          if (!pending) return;
          setRows((prev) => prev.filter((r) => r.id !== pending.id));
          setSelectedRows((prev) => prev.filter((id) => id !== pending.id));
          setPending(null);
        }}
      />
    </section>
  );
}
