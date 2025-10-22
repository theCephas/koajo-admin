import React, { useMemo, useState } from "react";
import { Link, useLocation, useNavigate, useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Filter, Plus, MoreVertical, CheckCircle2, Circle } from "lucide-react";
import { AddNewMembersDialog } from "@/components/modals/add-new-members-dialog";

export interface Crumb {
  label: string;
  to?: string;
}

export default function ProjectDetailsPage() {
  const { groupId } = useParams<{ groupId: string }>();
  const navigate = useNavigate();
  const location = useLocation() as { state?: { breadcrumbs?: Crumb[] } };
  const [addOpen, setAddOpen] = useState<boolean>(false);

  const breadcrumbs: Crumb[] = location.state?.breadcrumbs ?? [
    { label: "Group Management", to: "/groups-management" },
    { label: "Projects", to: "/groups-management/projects" },
    { label: `Project ${groupId}` },
  ];

  // Mock data to render the layout; replace with API data as needed
  const members = useMemo(
    () => [
      {
        name: "Jacob Hawkins",
        role: "UI/UX Designer",
        color: "bg-amber-100 text-amber-700",
      },
      {
        name: "Regina Cooper",
        role: "Back-End Developer",
        color: "bg-rose-100 text-rose-700",
      },
      {
        name: "Jane Wilson",
        role: "Project Manager",
        color: "bg-indigo-100 text-indigo-700",
      },
      {
        name: "Ronald Robertson",
        role: "Product Designer",
        color: "bg-emerald-100 text-emerald-700",
      },
      {
        name: "Dustin Williamson",
        role: "Web Developer",
        color: "bg-cyan-100 text-cyan-700",
      },
      {
        name: "Robert Edwards",
        role: "Project Manager",
        color: "bg-purple-100 text-purple-700",
      },
    ],
    [],
  );

  const activity = useMemo(
    () => [
      {
        id: 443,
        who: "Priscilla Russell",
        action: "Added new project",
        ago: "2 min ago",
        color: "text-rose-500",
      },
      {
        id: 488,
        who: "Regina Cooper",
        action: "Updated project",
        ago: "4 min ago",
        color: "text-orange-500",
      },
      {
        id: 389,
        who: "Ricardo Black",
        action: "Completed project",
        ago: "5 min ago",
        color: "text-amber-500",
      },
      {
        id: 442,
        who: "Ronald Watson",
        action: "Added new project",
        ago: "8 min ago",
        color: "text-cyan-500",
      },
    ],
    [],
  );

  return (
    <section className="space-y-6">
      {/* Breadcrumbs */}
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

      {/* Header */}
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

          {/* CTA: View Contacts */}
          <Button
            className="rounded-xl bg-[#FF8C42] hover:bg-[#f77f2f] inline-flex items-center gap-2"
            onClick={() =>
              void navigate(`/groups-management/projects/${groupId}/contacts`, {
                state: {
                  breadcrumbs: [
                    { label: "Group Management", to: "/groups-management" },
                    { label: "Projects", to: "/groups-management/projects" },
                    {
                      label: `Project ${groupId}`,
                      to: `/groups-management/projects/${groupId}`,
                    },
                    { label: "Contacts" },
                  ],
                },
              })
            }
          >
            View Contacts
          </Button>
        </div>
      </div>

      <div className="flex flex-col md:flex-row gap-6 w-full">
        {/* Left: main card */}
        <div className="rounded-2xl border bg-white w-[70%]">
          <div className="p-5 border-b flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-blue-100 flex items-center justify-center text-blue-600 font-semibold">
                D
              </div>
              <div>
                <div className="text-xs text-gray-500">GROUP ID</div>
                <div className="text-gray-900 font-medium">{groupId}</div>
              </div>
            </div>
          </div>

          <div className="grid gap-6 p-5">
            {/* Details */}
            <div>
              <div className="text-xs text-gray-500 mb-4">DETAILS</div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="rounded-xl border p-4">
                  <div className="text-xs text-gray-500 mb-1">Amount</div>
                  <div className="font-semibold text-gray-900">$ 2,500,000</div>
                </div>
                <div className="rounded-xl border p-4">
                  <div className="text-xs text-gray-500 mb-1">Start Date</div>
                  <div className="font-semibold text-gray-900">
                    17 Jun, 2025
                  </div>
                </div>
                <div className="rounded-xl border p-4">
                  <div className="text-xs text-gray-500 mb-1">End Date</div>
                  <div className="font-semibold text-gray-900">
                    04 Jul, 2025
                  </div>
                </div>
              </div>
            </div>

            {/* Progress */}
            <div>
              <div className="text-xs text-gray-500 mb-2">PROGRESS (50%)</div>
              <div className="h-1.5 rounded-full bg-gray-100 overflow-hidden">
                <div className="h-full w-1/2 bg-orange-400" />
              </div>
            </div>

            {/* Checklist */}
            <div>
              <div className="text-xs text-gray-500 mb-3">CHECKLIST</div>
              <ul className="space-y-2">
                {[
                  { label: "Jacob Hawkins", done: true },
                  { label: "Regina Cooper", done: true },
                  { label: "Jane Wilson", done: true },
                  { label: "Ronald Robertson", done: false },
                  { label: "Dustin Williamson", done: false },
                  { label: "Robert Edwards", done: false },
                ].map((item, idx) => (
                  <li
                    key={idx}
                    className="flex items-center gap-3 rounded-xl border px-3 py-2"
                  >
                    {item.done ? (
                      <CheckCircle2 className="h-4 w-4 text-orange-500" />
                    ) : (
                      <Circle className="h-4 w-4 text-gray-300" />
                    )}
                    <span
                      className={`text-sm ${item.done ? "line-through text-gray-400" : "text-gray-700"}`}
                    >
                      {item.label}
                    </span>
                    <div className="ml-auto flex items-center gap-2">
                      <button className="h-8 w-8 inline-flex items-center justify-center rounded-lg hover:bg-gray-100">
                        <MoreVertical className="h-4 w-4 text-gray-500" />
                      </button>
                      <button className="h-8 w-8 inline-flex items-center justify-center rounded-lg hover:bg-gray-100">
                        {/* trash icon placeholder using + rotated could be replaced with an actual Trash icon */}
                        <span className="text-gray-500">🗑️</span>
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
              <button className="mt-4 inline-flex items-center gap-2 text-orange-500 hover:text-orange-600 text-sm">
                <Plus className="h-4 w-4" />
                Add Checklist Item
              </button>
            </div>
          </div>
        </div>

        {/* Right: members + activity */}
        <aside className="space-y-6 w-[30%]">
          <div className="rounded-2xl border bg-white">
            <div className="p-5 border-b flex items-center justify-between">
              <h3 className="font-medium text-gray-900">Members</h3>
              <button
                onClick={() => setAddOpen(true)}
                className="h-8 w-8 inline-flex items-center justify-center rounded-lg bg-[#D8D8D8] text-black cursor-pointer"
              >
                <Plus className="h-4 w-4" />
              </button>
            </div>
            <ul className="p-5 space-y-4">
              {members.map((m, i) => (
                <li key={i} className="flex items-center gap-3">
                  <div
                    className={`h-9 w-9 rounded-full flex items-center justify-center ${m.color}`}
                  >
                    {m.name.charAt(0)}
                  </div>
                  <div className="min-w-0">
                    <div className="text-sm font-medium text-gray-900 truncate">
                      {m.name}
                    </div>
                    <div className="text-xs text-gray-500 truncate">
                      {m.role}
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          </div>

          <div className="rounded-2xl border bg-white">
            <div className="p-5 border-b">
              <h3 className="font-medium text-gray-900">Recent Activity</h3>
            </div>
            <div className="p-5 space-y-6">
              <div className="text-xs text-gray-500">12 September</div>
              <ul className="space-y-5">
                {activity.map((a) => (
                  <li key={a.id} className="flex items-start gap-3">
                    <div className="h-9 w-9 rounded-full bg-gray-50 flex items-center justify-center">
                      <span className="text-sm font-semibold text-gray-600">
                        {a.who.charAt(0)}
                      </span>
                    </div>
                    <div className="text-sm">
                      <div className="text-gray-900">
                        <span className="font-medium">{a.who}</span>{" "}
                        <span>{a.action}</span>{" "}
                        <Link to="#" className={a.color}>
                          #{a.id}
                        </Link>
                      </div>
                      <div className="text-xs text-gray-500">{a.ago}</div>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </aside>
      </div>

      <AddNewMembersDialog
        open={addOpen}
        onOpenChange={setAddOpen}
        onAdd={(members) => {
          // integrate with API later

          console.log(
            "Added members:",
            members.map((m) => m.name),
          );
        }}
      />
    </section>
  );
}
