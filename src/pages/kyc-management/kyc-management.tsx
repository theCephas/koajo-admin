import React, { useMemo, useState } from "react";
import DataTable, { type Column } from "@/components/ui/data-table";
import { KycTabs } from "./components/kyc-tabs";
import { StatusBadge } from "./components/status-badge";
import { ToolbarActions, RowKebab } from "./components/actions";
import { Download } from "lucide-react";
import { Button } from "@/components/ui/button";

interface KycRow {
  id: number;
  userId: string;
  customer: string;
  idType: string;
  idNumber: string;
  dateCreated: string; // "MM DD YYYY"
  status: "Verified" | "Attention" | "Rejected" | "Flagged";
}

const MOCK: KycRow[] = Array.from({ length: 100 }).map((_, i) => {
  const statuses: KycRow["status"][] = ["Verified", "Attention", "Rejected"];
  const status = statuses[i % statuses.length];
  return {
    id: i + 1,
    userId: "#790" + String(841 + (i % 100)).padStart(3, "0"),
    customer: ["Claire Warren", "James Cole", "Amara Obi", "Kwame Mensah"][
      i % 4
    ],
    idType: "Drivers License",
    idNumber: "#" + String(905500 + (i % 500)),
    dateCreated: "09 22 2025",
    status,
  };
});

export default function KycManagement() {
  // Tabs
  type TabKey = "All" | "Verified" | "Attention" | "Flagged";
  const [tab, setTab] = useState<TabKey>("All");

  // Page state (client-side now, server-ready later)
  const [page, setPage] = useState<number>(1); // 1-based
  const [pageSize, setPageSize] = useState<number>(10);

  // NEW: selection state
  const [selectedRows, setSelectedRows] = useState<number[]>([]);

  const dataForTab = useMemo(() => {
    if (tab === "All") return MOCK;
    if (tab === "Flagged") return MOCK.filter((r) => r.status === "Rejected"); // treat flagged as rejected in mock
    return MOCK.filter((r) => r.status === tab);
  }, [tab]);

  const counts = useMemo(
    () => ({
      All: MOCK.length,
      Verified: MOCK.filter((r) => r.status === "Verified").length,
      Attention: MOCK.filter((r) => r.status === "Attention").length,
      Flagged: MOCK.filter((r) => r.status === "Rejected").length,
    }),
    [],
  );

  // Clear selection on tab/page/pageSize change so it reflects visible page only
  // (matches the DataTable "select current page" UX)
  React.useEffect(() => {
    setSelectedRows([]);
  }, [tab, page, pageSize]);

  const columns: Column<KycRow>[] = [
    {
      key: "userId",
      label: "USER ID",
      className: "text-sm text-[#6B7280]",
      width: 140,
      render: (v) => <span className="text-[#374151]">{v}</span>,
    },
    { key: "customer", label: "CUSTOMER", className: "text-sm text-[#374151]" },
    {
      key: "idType",
      label: "ID TYPE",
      className: "text-sm text-[#0F172A]",
      render: (v) => (
        <span className="text-[#5B8DEF] hover:underline cursor-pointer">
          {v}
        </span>
      ),
    },
    {
      key: "idNumber",
      label: "ID NUMBER",
      className: "text-sm text-[#374151]",
    },
    {
      key: "dateCreated",
      label: "DATE CREATED",
      className: "text-sm text-[#374151]",
    },
    {
      key: "status",
      label: "STATUS",
      width: 160,
      render: (_, row) => <StatusBadge status={row.status} />,
    },
    {
      key: "action",
      label: "",
      width: 160,
      render: (_, row) => (
        <div className="flex items-center justify-end gap-2">
          {row.status === "Verified" && (
            <span className="inline-flex h-8 items-center rounded-lg bg-emerald-600 px-3 text-xs font-medium text-white">
              View
            </span>
          )}
          {row.status === "Attention" && (
            <span className="inline-flex h-8 items-center rounded-lg bg-[#FF8C42] px-3 text-xs font-medium text-white">
              Review
            </span>
          )}
          {row.status === "Rejected" && (
            <span className="inline-flex h-8 items-center rounded-lg bg-rose-500 px-3 text-xs font-medium text-white">
              Flagged
            </span>
          )}
          <RowKebab />
        </div>
      ),
    },
  ];

  return (
    <section className="space-y-6">
      {/* Page header */}
      <div className="flex items-center justify-between">
        <h1 className="text-[22px] md:text-[24px] font-semibold text-[#111827]">
          kyc Management
        </h1>
        <Button
          variant="outline"
          className="rounded-xl h-9 px-3 inline-flex items-center gap-2"
        >
          <Download className="h-4 w-4" />
          Export
        </Button>
      </div>

      {/* Tabs */}
      <KycTabs
        active={tab}
        counts={counts}
        onChange={(t) => {
          setTab(t);
          setPage(1);
          setSelectedRows([]); // ensure cleared on tab change
        }}
      />

      {/* Table card */}
      <DataTable<KycRow>
        title=""
        data={dataForTab}
        columns={columns}
        showCheckboxes
        searchable
        searchPlaceholder="Search order..."
        filterable={false}
        // Pagination (client-side now, server-ready later)
        page={page}
        pageSize={pageSize}
        onPageChange={setPage}
        onPageSizeChange={setPageSize}
        pageSizeOptions={[10, 20, 50, 100]}
        // Wire selection
        selectedRows={selectedRows}
        onRowSelect={(ids) => setSelectedRows(ids as number[])}
        // Toolbar
        toolbarRight={<ToolbarActions />}
        onRefresh={() => {
          // hook up to API later; mock a short spin
          // Optionally you can set a local loading state and pass 'loading'
        }}
        className="mt-2"
      />
    </section>
  );
}
