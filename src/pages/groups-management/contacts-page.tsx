import React, { useMemo, useState } from "react";
import { Link, useLocation, useParams } from "react-router-dom";
import DataTable, { type Column } from "@/components/ui/data-table";
import { Button } from "@/components/ui/button";
import { Download, MoreVertical, SlidersHorizontal } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AddContactModal,
  type ContactPayload,
} from "@/components/modals/add-contact-modal";

export interface Contact {
  id: number;
  name: string;
  code: string; // e.g. #984048484844
  email: string;
  location: string;
  phone: string;
  avatarColor: string;
  initial: string;
}

function makeMock(): Contact[] {
  const names = Array.from({ length: 100 }).map((_, _i) => "Regina Cooper");
  const base = 984048484844;
  return names.map((n, i) => {
    const id = i + 1;
    return {
      id,
      name: n,
      code: `#${base + i}`,
      email: "cooper@example.com",
      location: "Sochi, Russia",
      phone: "+1 (070) 123–4567",
      avatarColor: "bg-orange-100 text-orange-600",
      initial: n.slice(0, 1),
    };
  });
}

export default function ContactsPage() {
  const { groupId } = useParams<{ groupId: string }>();
  const location = useLocation() as {
    state?: { breadcrumbs?: { label: string; to?: string }[] };
  };

  // Data
  const [contacts, setContacts] = useState<Contact[]>(() => makeMock());

  // Current profile on the right
  const [currentId, setCurrentId] = useState<number>(contacts[0]?.id ?? 1);
  const current = useMemo(
    () => contacts.find((c) => c.id === currentId) ?? contacts[0],
    [contacts, currentId],
  );

  // Keep sidebar in sync if current item disappears (e.g. after list changes)
  React.useEffect(() => {
    if (!contacts.some((c) => c.id === currentId)) {
      setCurrentId(contacts[0]?.id ?? 0);
    }
  }, [contacts, currentId]);

  // Table state
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [selectedRows, setSelectedRows] = useState<number[]>([]);

  // Add Contact modal
  const [addOpen, setAddOpen] = useState(false);

  const breadcrumbs = location.state?.breadcrumbs ?? [
    { label: "Group Management", to: "/groups-management" },
    { label: "Projects", to: "/groups-management/projects" },
    {
      label: `Project ${groupId}`,
      to: `/groups-management/projects/${groupId}`,
    },
    { label: "Contacts" },
  ];

  const columns: Column<Contact>[] = [
    {
      key: "name",
      label: "NAME",
      render: (_v, row) => (
        <button
          className="flex items-center gap-3 text-left w-full"
          onClick={() => setCurrentId(row.id)}
        >
          <span
            className={`grid h-9 w-9 place-items-center rounded-full ${row.avatarColor} font-semibold`}
          >
            {row.initial}
          </span>
          <div className="leading-tight">
            <div className="text-sm text-[#111827] font-medium">{row.name}</div>
            <div className="text-xs text-[#9CA3AF]">{row.code}</div>
          </div>
        </button>
      ),
    },
    {
      key: "email",
      label: "EMAIL",
      className: "text-[#374151]",
      render: (v, row) => (
        <button
          className="w-full text-left"
          onClick={() => setCurrentId(row.id)}
        >
          {v}
        </button>
      ),
    },
    {
      key: "location",
      label: "LOCATION",
      className: "text-[#374151]",
      render: (v, row) => (
        <button
          className="w-full text-left"
          onClick={() => setCurrentId(row.id)}
        >
          {v}
        </button>
      ),
    },
    {
      key: "phone",
      label: "PHONE",
      className: "text-[#374151]",
      render: (v, row) => (
        <button
          className="w-full text-left"
          onClick={() => setCurrentId(row.id)}
        >
          {v}
        </button>
      ),
    },
    {
      key: "actions",
      label: "",
      width: 56,
      render: (_v, row) => (
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
                setCurrentId(row.id);
              }}
            >
              View
            </DropdownMenuItem>
            <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
              Edit
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      ),
    },
  ];

  const toolbarRight = (
    <div className="flex items-center gap-2">
      <Button
        variant="outline"
        className="rounded-xl h-9 px-3 inline-flex items-center gap-2"
      >
        <SlidersHorizontal className="h-4 w-4" />
        Actions
      </Button>
      <Button
        className="rounded-xl bg-[#FF8C42] hover:bg-[#f77f2f]"
        onClick={() => setAddOpen(true)}
      >
        + Add Contact
      </Button>
    </div>
  );

  return (
    <section className="space-y-4">
      {/* Breadcrumb */}
      <nav className="text-sm text-[#6B7280]">
        {breadcrumbs.map((c, i) => (
          <span key={i}>
            {c.to ? (
              <Link to={c.to} className="hover:underline text-[#374151]">
                {c.label}
              </Link>
            ) : (
              <span className="text-[#9CA3AF]">{c.label}</span>
            )}
            {i < breadcrumbs.length - 1 && (
              <span className="mx-2 text-[#9CA3AF]">/</span>
            )}
          </span>
        ))}
      </nav>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_360px] gap-4">
        {/* Left: table card */}
        <div className="rounded-2xl border bg-white shadow-sm">
          <DataTable<Contact>
            title=""
            data={contacts}
            columns={columns}
            showCheckboxes
            searchable
            searchPlaceholder="Search contact..."
            filterable={false}
            page={page}
            pageSize={pageSize}
            onPageChange={setPage}
            onPageSizeChange={setPageSize}
            pageSizeOptions={[10, 20, 50, 100]}
            selectedRows={selectedRows}
            onRowSelect={(ids) => setSelectedRows(ids as number[])}
            toolbarRight={toolbarRight}
            className="border-0"
          />
        </div>

        {/* Right: profile panel */}
        <aside className="rounded-2xl border bg-white shadow-sm p-5">
          {current ? (
            <div className="space-y-6">
              <div className="flex items-center gap-3">
                <div className="relative">
                  <div
                    className={`h-16 w-16 rounded-full flex items-center justify-center ${current.avatarColor} text-xl font-semibold`}
                  >
                    {current.initial}
                  </div>
                  <span className="absolute -right-1 bottom-1 h-2.5 w-2.5 rounded-full bg-emerald-500 ring-2 ring-white" />
                </div>
                <div>
                  <div className="text-lg font-semibold text-[#111827]">
                    {current.name}
                  </div>
                  <div className="text-sm text-[#9CA3AF]">{current.code}</div>
                </div>
              </div>

              <div className="space-y-5">
                <div>
                  <div className="text-xs text-[#9CA3AF]">EMAIL</div>
                  <div className="text-sm text-[#111827]">
                    black@example.com
                  </div>
                </div>
                <div>
                  <div className="text-xs text-[#9CA3AF]">PHONE</div>
                  <div className="text-sm text-[#111827]">
                    +1 (070) 123–8459
                  </div>
                </div>
                <div>
                  <div className="text-xs text-[#9CA3AF]">BIRTHDAY</div>
                  <div className="text-sm text-[#111827]">17 March, 1995</div>
                </div>
                <div>
                  <div className="text-xs text-[#9CA3AF]">LOCATION</div>
                  <div className="text-sm text-[#111827]">New York, NY</div>
                </div>
              </div>

              <div className="pt-2">
                <div className="text-xs text-[#9CA3AF]">FAVORITES</div>
                <ul className="mt-3 space-y-3">
                  <li className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className="grid h-7 w-7 place-items-center rounded-full bg-orange-100 text-orange-600 font-semibold">
                        T
                      </span>
                      <div className="leading-tight">
                        <div className="text-sm text-[#111827]">Pod</div>
                        <div className="text-xs text-[#6B7280]">
                          100 usd Pod
                        </div>
                      </div>
                    </div>
                    <button className="text-xs text-[#6B7280] hover:text-[#111827]">
                      Edit
                    </button>
                  </li>
                  <li className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className="grid h-7 w-7 place-items-center rounded-full bg-orange-100 text-orange-600 font-semibold">
                        T
                      </span>
                      <div className="leading-tight">
                        <div className="text-sm text-[#111827]">Group</div>
                        <div className="text-xs text-[#6B7280]">
                          #{(93848498).toString()}
                        </div>
                      </div>
                    </div>
                    <button className="text-xs text-[#6B7280] hover:text-[#111827]">
                      Edit
                    </button>
                  </li>
                </ul>
              </div>

              <div className="flex items-center justify-end gap-2">
                <Button
                  variant="outline"
                  className="rounded-xl h-9 px-3 inline-flex items-center gap-2"
                >
                  <Download className="h-4 w-4" />
                  Export
                </Button>
              </div>
            </div>
          ) : (
            <div className="text-sm text-[#6B7280]">
              Select a contact to view details
            </div>
          )}
        </aside>
      </div>

      {/* Add Contact modal */}
      <AddContactModal
        open={addOpen}
        onOpenChange={setAddOpen}
        title="New Contact"
        submitLabel="Add Contact"
        onSubmit={(payload: ContactPayload) => {
          const name =
            `${payload.firstName} ${payload.lastName}`.trim() || "New Contact";
          const next: Contact = {
            id: Math.max(0, ...contacts.map((c) => c.id)) + 1,
            name,
            code: `#${Math.floor(900000000000 + Math.random() * 9999999)}`,
            email: payload.email || "cooper@example.com",
            location: payload.address || "Sochi, Russia",
            phone: `${payload.countryCode} ${payload.phone}`,
            avatarColor: "bg-sky-100 text-sky-700",
            initial: name.slice(0, 1).toUpperCase(),
          };
          setContacts((prev) => [next, ...prev]);
          setCurrentId(next.id);
        }}
      />
    </section>
  );
}
