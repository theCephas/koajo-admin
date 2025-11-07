import * as React from "react";
import { Loader2, PlusIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAnnouncementsQuery } from "@/hooks/queries/use-announcements";
import { useDebouncedValue } from "@/hooks/use-debounce";
import type { AnnouncementListItem } from "@/services/api";
import { AnnouncementComposerDialog } from "./components/announcement-composer-dialog";

const numberFormatter = new Intl.NumberFormat("en-US", {
  maximumFractionDigits: 0,
});

const severityStyles = {
  success: {
    bg: "bg-emerald-50",
    text: "text-emerald-700",
    label: "Success",
  },
  info: { bg: "bg-blue-50", text: "text-blue-700", label: "Info" },
  warning: { bg: "bg-amber-50", text: "text-amber-700", label: "Warning" },
  critical: { bg: "bg-rose-50", text: "text-rose-700", label: "Critical" },
  error: { bg: "bg-red-50", text: "text-red-700", label: "Error" },
} as const;

const channelStyles = {
  email: { bg: "bg-indigo-50", text: "text-indigo-700", label: "Email" },
  "in-app": { bg: "bg-purple-50", text: "text-purple-700", label: "In-app" },
} as const;

const formatTimestamp = (iso: string) =>
  new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "numeric",
  }).format(new Date(iso));

export default function Notifications() {
  const [search, setSearch] = React.useState("");
  const [isComposerOpen, setIsComposerOpen] = React.useState(false);
  const debouncedSearch = useDebouncedValue(search.trim(), 400);

  const queryParams = React.useMemo(
    () => ({
      search: debouncedSearch || undefined,
      limit: 50,
      offset: 0,
    }),
    [debouncedSearch],
  );

  const { data, isLoading, isFetching, isError, error, refetch } =
    useAnnouncementsQuery(queryParams);

  const announcements = data?.items ?? [];
  const totalCount = data?.total ?? 0;

  return (
    <div className="flex w-full flex-col gap-6">
      <section className="space-y-4 rounded-[16px] border bg-white p-4 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-[24px] font-semibold">Platform Announcements</p>
            <p className="text-sm text-muted-foreground">
              Broadcast release notes, nudges, and reminders to your admins.
            </p>
          </div>
          <Button
            // className="flex items-center gap-2 rounded-xl bg-[#2B6CB0] hover:bg-[#255fa0]"
            onClick={() => setIsComposerOpen(true)}
          >
            <span>New Announcement</span>
            <PlusIcon className="h-4 w-4" />
          </Button>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div className="w-full max-w-sm">
            <Input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search announcements"
              aria-label="Search announcements"
            />
          </div>
          <div className="text-xs font-medium uppercase tracking-wide text-[#9CA3AF]">
            Total: <span className="text-[#111827]">{totalCount}</span>
          </div>
          {isFetching && !isLoading && (
            <div className="inline-flex items-center gap-2 text-xs text-[#6B7280]">
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
              Refreshing…
            </div>
          )}
        </div>

        {isError && error && (
          <div className="rounded-xl border border-rose-100 bg-rose-50 px-4 py-3 text-sm text-rose-700">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <span>
                {error.response?.data?.message ??
                  error.message ??
                  "Unable to load announcements."}
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => void refetch()}
              >
                Retry
              </Button>
            </div>
          </div>
        )}

        <div className="min-h-[200px]">
          {isLoading ? (
            <AnnouncementsSkeleton />
          ) : announcements.length > 0 ? (
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              {announcements.map((announcement) => (
                <AnnouncementCard
                  key={announcement.id}
                  announcement={announcement}
                />
              ))}
            </div>
          ) : (
            <div className="rounded-[10px] border border-dashed p-6 text-center text-sm text-muted-foreground">
              No announcements match your search yet. Try a different keyword.
            </div>
          )}
        </div>
      </section>

      <AnnouncementComposerDialog
        open={isComposerOpen}
        onOpenChange={setIsComposerOpen}
        onCreated={() => {
          void refetch();
        }}
      />
    </div>
  );
}

const AnnouncementsSkeleton = () => (
  <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
    {Array.from({ length: 6 }).map((_, index) => (
      <div
        key={`announcement-skeleton-${index}`}
        className="animate-pulse rounded-2xl border border-[#E5E7EB] p-4"
      >
        <div className="mb-4 h-5 w-3/4 rounded bg-slate-200" />
        <div className="mb-2 h-4 w-1/2 rounded bg-slate-200" />
        <div className="h-4 w-full rounded bg-slate-100" />
        <div className="mt-6 flex gap-2">
          <div className="h-5 w-16 rounded-full bg-slate-100" />
          <div className="h-5 w-16 rounded-full bg-slate-100" />
        </div>
      </div>
    ))}
  </div>
);

const AnnouncementCard = ({
  announcement,
}: {
  announcement: AnnouncementListItem;
}) => (
  <article className="flex h-full flex-col rounded-2xl border border-[#E5E7EB] p-4">
    <div className="space-y-2">
      <div className="flex flex-wrap items-center gap-2">
        <h3 className="text-base font-semibold text-[#111827]">
          {announcement.notificationTitle}
        </h3>
        <Badge
          config={severityStyles[announcement.severity]}
          label={severityStyles[announcement.severity].label}
        />
        <Badge
          config={channelStyles[announcement.channel]}
          label={channelStyles[announcement.channel].label}
        />
      </div>
      <p className="text-sm text-[#6B7280]">{announcement.name}</p>
    </div>

    <div className="mt-4 flex flex-wrap items-center gap-3 text-xs text-[#6B7280]">
      <span>
        Audience: {announcement.sendToAll ? "All users" : "Targeted segment"}
      </span>
      <span>
        Recipients: {numberFormatter.format(announcement.totalRecipients ?? 0)}
      </span>
      <span>{formatTimestamp(announcement.createdAt)}</span>
    </div>

    {announcement.actionUrl && (
      <a
        href={announcement.actionUrl}
        target="_blank"
        rel="noreferrer"
        className="mt-4 text-sm font-medium text-[#2B6CB0] hover:underline"
      >
        View action link
      </a>
    )}
  </article>
);

const Badge = ({
  config,
  label,
}: {
  config: { bg: string; text: string };
  label: string;
}) => (
  <span
    className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${config.bg} ${config.text}`}
  >
    {label}
  </span>
);
