/* eslint-disable @typescript-eslint/no-misused-promises */
import React, { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import DataTable, { type Column } from "@/components/ui/data-table";
import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";
import { UserTabs } from "./components/user-tabs";
import { StatusBadge } from "./components/status-badge";
import { UMRowKebab, UMToolbarActions } from "./components/user-actions";
import { ConfirmDeleteDialog } from "@/components/ui/confirm-delete-dialog";
import { AddContactModal } from "@/components/modals/add-contact-modal";

type UMStatus = "Verified" | "Pending" | "Active" | "Flagged";

export interface UserRow {
  id: number;
  userId: string;
  customer: string;
  createdAt: string; // "MM.DD.YY"
  podId: string;
  groupId: string;
  payment: string;
  kycStatus: UMStatus;
}

const MOCK: UserRow[] = Array.from({ length: 100 }).map((_, i) => {
  const statuses: UMStatus[] = ["Verified", "Pending", "Active", "Flagged"];
  return {
    id: i + 1,
    userId: "#790" + String(841 + (i % 100)).padStart(3, "0"),
    customer: ["Claire Warren", "James Cole", "Amara Obi", "Kwame Mensah"][
      i % 4
    ],
    createdAt: "12.09.20",
    podId: "#905505",
    groupId: "#905505",
    payment: "PayPal",
    kycStatus: statuses[i % statuses.length],
  };
});

export default function UserManagement() {
  const navigate = useNavigate();

  type TabKey = "All" | "KYC status" | "Pod" | "Group";
  const [tab, setTab] = useState<TabKey>("All");

  // Data in state so we can delete rows
  const [users, setUsers] = useState<UserRow[]>(() => MOCK);

  // Pagination + selection state
  const [page, setPage] = useState<number>(1);
  const [pageSize, setPageSize] = useState<number>(10);
  const [selectedRows, setSelectedRows] = useState<number[]>([]);

  // Delete confirm dialog state
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [pendingUser, setPendingUser] = useState<UserRow | null>(null);

  // Add new members dialog state
  const [contactOpen, setContactOpen] = useState(false);

  const dataForTab = useMemo(() => {
    const src = users;
    switch (tab) {
      case "KYC status":
        return src.filter((r) => r.kycStatus !== "Active");
      case "Pod":
        return src.filter((_, i) => i % 2 === 0);
      case "Group":
        return src.filter((_, i) => i % 3 === 0);
      default:
        return src;
    }
  }, [tab, users]);

  const counts = useMemo(
    () => ({
      All: users.length,
      "KYC status": users.filter((r) => r.kycStatus !== "Active").length,
      Pod: Math.floor(users.length / 2),
      Group: Math.floor(users.length / 3),
    }),
    [users],
  );

  React.useEffect(() => {
    setSelectedRows([]);
  }, [tab, page, pageSize]);

  const columns: Column<UserRow>[] = [
    {
      key: "userId",
      label: "USER ID",
      width: 120,
      render: (v, row) => (
        <button
          className="text-[#374151] hover:underline"
          onClick={() => navigate(`/users-management/${row.id}`)}
        >
          {v}
        </button>
      ),
    },
    { key: "customer", label: "CUSTOMER", className: "text-[#374151]" },
    { key: "createdAt", label: "CREATED AT", className: "text-[#374151]" },
    { key: "podId", label: "POD ID", className: "text-[#374151]" },
    { key: "groupId", label: "GROUP ID", className: "text-[#374151]" },
    { key: "payment", label: "PAYMENT", className: "text-[#374151]" },
    {
      key: "kycStatus",
      label: "KYC STATUS",
      width: 140,
      render: (v) => <StatusBadge status={v as UMStatus} />,
    },
    {
      key: "actions",
      label: "",
      width: 80,
      render: (_, row) => (
        <div className="flex items-center justify-end">
          <UMRowKebab
            onView={() => navigate(`/users-management/${row.id}`)}
            onDelete={() => {
              setPendingUser(row);
              setDeleteOpen(true);
            }}
          />
        </div>
      ),
    },
  ];

  return (
    <section className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-[22px] md:text-[24px] font-semibold text-[#111827]">
          User Management
        </h1>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            className="rounded-xl h-9 px-3 inline-flex items-center gap-2"
          >
            <Download className="h-4 w-4" />
            Export
          </Button>
          <Button
            className="rounded-xl bg-[#FF8C42] hover:bg-[#f77f2f]"
            onClick={() => setContactOpen(true)}
          >
            + Add Contact
          </Button>
        </div>
      </div>

      <UserTabs
        active={tab}
        counts={counts}
        onChange={(t) => {
          setTab(t);
          setPage(1);
        }}
      />

      <DataTable<UserRow>
        title=""
        data={dataForTab}
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
        toolbarRight={<UMToolbarActions />}
        className="mt-2"
      />

      {/* Delete user confirmation */}
      <ConfirmDeleteDialog
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        title="Delete user"
        itemName={pendingUser?.customer}
        onConfirm={() => {
          if (!pendingUser) return;
          setUsers((prev) => prev.filter((u) => u.id !== pendingUser.id));
          setSelectedRows((prev) => prev.filter((id) => id !== pendingUser.id));
          setPendingUser(null);
        }}
      />

      <AddContactModal
        open={contactOpen}
        onOpenChange={setContactOpen}
        onSubmit={() => setContactOpen(false)}
      />
    </section>
  );
}
