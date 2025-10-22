import * as React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogClose,
} from "@/components/ui/dialog";
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { ConfirmDeleteDialog } from "@/components/ui/confirm-delete-dialog";
import { Calendar, Pencil, PlusIcon, Trash2 } from "lucide-react";

export interface Announcement {
  id: number;
  title: string;
  description: string;
  category: "Maintenance" | "Reminders" | "Updates";
  start: Date;
  end: Date;
}

function fmtLong(d: Date) {
  return new Intl.DateTimeFormat("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  }).format(d);
}

function toDateInput(d: Date) {
  // yyyy-MM-dd
  return new Date(d.getTime() - d.getTimezoneOffset() * 60000)
    .toISOString()
    .slice(0, 10);
}
function toTimeInput(d: Date) {
  // HH:mm
  const hh = String(d.getHours()).padStart(2, "0");
  const mm = String(d.getMinutes()).padStart(2, "0");
  return `${hh}:${mm}`;
}

export default function Notifications() {
  // Platform announcements
  const [items, setItems] = React.useState<Announcement[]>(() => {
    const d = new Date();
    d.setMonth(2); // March (0-based)
    d.setDate(15);
    d.setHours(0, 0, 0, 0);
    return [
      {
        id: 1,
        title: "System Maintenance Notice",
        description: "Scheduled maintenance on March 15, 2025",
        category: "Maintenance",
        start: new Date(d),
        end: new Date(d),
      },
    ];
  });

  // Automated notification toggles
  const [welcomeOn, setWelcomeOn] = React.useState(false);
  const [remindersOn, setRemindersOn] = React.useState(true);

  // Modal state (create/edit)
  const [open, setOpen] = React.useState(false);
  const [editingId, setEditingId] = React.useState<number | null>(null);

  //   const editing = items.find((i) => i.id === editingId) ?? null;

  // Form state
  const [title, setTitle] = React.useState("");
  const [category, setCategory] =
    React.useState<Announcement["category"]>("Reminders");
  const [desc, setDesc] = React.useState("");
  const [startDate, setStartDate] = React.useState<string>("");
  const [startTime, setStartTime] = React.useState<string>("00:00");
  const [endDate, setEndDate] = React.useState<string>("");
  const [endTime, setEndTime] = React.useState<string>("00:00");

  const resetForm = () => {
    const now = new Date();
    setTitle("");
    setCategory("Reminders");
    setDesc("");
    setStartDate(toDateInput(now));
    setEndDate(toDateInput(now));
    setStartTime("00:00");
    setEndTime("00:00");
  };

  const openCreate = (prefillCategory?: Announcement["category"]) => {
    setEditingId(null);
    resetForm();
    if (prefillCategory) setCategory(prefillCategory);
    setOpen(true);
  };

  const openEdit = (it: Announcement) => {
    setEditingId(it.id);
    setTitle(it.title);
    setCategory(it.category);
    setDesc(it.description);
    setStartDate(toDateInput(it.start));
    setEndDate(toDateInput(it.end));
    setStartTime(toTimeInput(it.start));
    setEndTime(toTimeInput(it.end));
    setOpen(true);
  };

  // Confirm delete
  const [delOpen, setDelOpen] = React.useState(false);
  const [pendingDel, setPendingDel] = React.useState<Announcement | null>(null);

  const previewSubtitle = (it: Announcement) => {
    if (it.category === "Maintenance" && it.start) {
      return `Scheduled maintenance on ${fmtLong(it.start)}`;
    }
    return (
      it.description ||
      `${it.category} scheduled from ${fmtLong(it.start)} to ${fmtLong(it.end)}`
    );
  };

  const upsertAnnouncement = (e: React.FormEvent) => {
    e.preventDefault();
    const [sh, sm] = startTime.split(":").map(Number);
    const [eh, em] = endTime.split(":").map(Number);
    const s = new Date(startDate || new Date());
    s.setHours(sh || 0, sm || 0, 0, 0);
    const en = new Date(endDate || startDate || new Date());
    en.setHours(eh || 0, em || 0, 0, 0);

    if (editingId) {
      setItems((prev) =>
        prev.map((it) =>
          it.id === editingId
            ? {
                ...it,
                title,
                description: desc,
                category,
                start: s,
                end: en,
              }
            : it,
        ),
      );
    } else {
      setItems((prev) => [
        {
          id: Math.max(0, ...prev.map((p) => p.id)) + 1,
          title,
          description: desc,
          category,
          start: s,
          end: en,
        },
        ...prev,
      ]);
    }
    setOpen(false);
  };

  return (
    <div className="flex flex-col gap-6 w-full">
      {/* Platform Announcements */}
      <section className="w-full bg-white rounded-[16px] p-4 space-y-4 shadow-sm border">
        <div className="flex justify-between items-center">
          <p className="text-[24px] font-semibold">Platform Announcements</p>
          <Button
            className="flex items-center gap-2 rounded-xl bg-[#2B6CB0] hover:bg-[#255fa0]"
            onClick={() => openCreate("Maintenance")}
          >
            <span>New Announcement</span>
            <PlusIcon className="w-4 h-4" />
          </Button>
        </div>

        <div className="space-y-3">
          {items.map((it) => (
            <div
              key={it.id}
              className="rounded-[10px] border border-[#DCE4E8] p-3 flex items-start justify-between"
            >
              <div className="space-y-1">
                <div className="font-medium text-[15px] text-[#111827]">
                  {it.title}
                </div>
                <div className="text-sm text-[#6B7280]">
                  {previewSubtitle(it)}
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  className="h-8 w-8 grid place-items-center rounded-lg hover:bg-gray-100"
                  title="Edit"
                  onClick={() => openEdit(it)}
                >
                  <Pencil className="h-4 w-4 text-gray-600" />
                </button>
                <button
                  className="h-8 w-8 grid place-items-center rounded-lg hover:bg-gray-100"
                  title="Delete"
                  onClick={() => {
                    setPendingDel(it);
                    setDelOpen(true);
                  }}
                >
                  <Trash2 className="h-4 w-4 text-rose-600" />
                </button>
              </div>
            </div>
          ))}
          {items.length === 0 && (
            <div className="rounded-[10px] border border-dashed p-6 text-sm text-center text-muted-foreground">
              No announcements yet. Create your first one.
            </div>
          )}
        </div>
      </section>

      {/* Automated notification */}
      <section className="w-full bg-white rounded-[16px] p-4 space-y-4 shadow-sm border">
        <div className="flex justify-between items-center">
          <p className="text-[24px] font-semibold">Automated notification</p>
          <Button
            className="flex items-center gap-2 rounded-xl bg-emerald-600 hover:bg-emerald-700"
            onClick={() => openCreate("Reminders")}
          >
            <span>New Announcement</span>
            <PlusIcon className="w-4 h-4" />
          </Button>
        </div>

        <div className="rounded-[10px] w-full space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <div className="font-medium">Welcome Email</div>
              <div className="text-sm text-[#6B7280]">
                let me know if there is a new product update
              </div>
            </div>
            <Switch
              checked={welcomeOn}
              onCheckedChange={setWelcomeOn}
              aria-label="Toggle Welcome Email"
            />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <div className="font-medium">Reminders</div>
              <div className="text-sm text-[#6B7280]">
                tell me about the information after making the transaction
              </div>
            </div>
            <Switch
              checked={remindersOn}
              onCheckedChange={setRemindersOn}
              aria-label="Toggle Reminders"
            />
          </div>
        </div>
      </section>

      {/* Add/Edit modal */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-[560px] rounded-[20px] p-0 overflow-hidden">
          <DialogHeader className="px-6 pt-6">
            <DialogTitle className="text-[22px] font-semibold">
              {editingId ? "Edit Note" : "Add Note"}
            </DialogTitle>
          </DialogHeader>

          <form onSubmit={upsertAnnouncement} className="px-6 pb-6 space-y-5">
            {/* Title */}
            <div className="space-y-2">
              <label className="text-[13px] text-[#6B7280]">Title</label>
              <Input
                placeholder="The title of a note"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="rounded-[12px]"
                required
              />
            </div>

            {/* Category */}
            <div className="space-y-2">
              <label className="text-[13px] text-[#6B7280]">Category</label>
              <Select
                value={category}
                onValueChange={(v: string) =>
                  setCategory(v as Announcement["category"])
                }
              >
                <SelectTrigger className="rounded-[12px]">
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Reminders">Reminders</SelectItem>
                  <SelectItem value="Maintenance">Maintenance</SelectItem>
                  <SelectItem value="Updates">Updates</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Date range */}
            <div className="space-y-3">
              <div className="space-y-2">
                <label className="text-[13px] text-[#6B7280]">Start Date</label>
                <div className="grid grid-cols-[1fr_auto_1fr] gap-2">
                  <Input
                    type="time"
                    value={startTime}
                    onChange={(e) => setStartTime(e.target.value)}
                    className="rounded-[12px]"
                  />
                  <span className="self-center text-[#9CA3AF]">—</span>
                  <div className="relative">
                    <Calendar className="pointer-events-none absolute left-2 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                      type="date"
                      value={startDate}
                      onChange={(e) => setStartDate(e.target.value)}
                      className="pl-8 rounded-[12px]"
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[13px] text-[#6B7280]">End Date</label>
                <div className="grid grid-cols-[1fr_auto_1fr] gap-2">
                  <Input
                    type="time"
                    value={endTime}
                    onChange={(e) => setEndTime(e.target.value)}
                    className="rounded-[12px]"
                  />
                  <span className="self-center text-[#9CA3AF]">—</span>
                  <div className="relative">
                    <Calendar className="pointer-events-none absolute left-2 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                      type="date"
                      value={endDate}
                      onChange={(e) => setEndDate(e.target.value)}
                      className="pl-8 rounded-[12px]"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Description */}
            <div className="space-y-2">
              <label className="text-[13px] text-[#6B7280]">Description</label>
              <Textarea
                placeholder="Type something"
                value={desc}
                onChange={(e: {
                  target: { value: React.SetStateAction<string> };
                }) => setDesc(e.target.value)}
                className="rounded-[12px] min-h-[120px]"
              />
            </div>

            <div className="flex items-center justify-end gap-2">
              <DialogClose asChild>
                <Button variant="outline" className="rounded-xl">
                  Cancel
                </Button>
              </DialogClose>
              <Button className="rounded-xl bg-[#FF8C42] hover:bg-[#f77f2f]">
                {editingId ? "Save Changes" : "Create"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete confirmation */}
      <ConfirmDeleteDialog
        open={delOpen}
        onOpenChange={setDelOpen}
        title="Delete announcement"
        itemName={pendingDel?.title}
        onConfirm={() => {
          if (!pendingDel) return;
          setItems((prev) => prev.filter((i) => i.id !== pendingDel.id));
          setPendingDel(null);
        }}
      />
    </div>
  );
}
