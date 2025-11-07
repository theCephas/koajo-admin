import * as React from "react";
import MDEditor from "@uiw/react-md-editor";
import "@uiw/react-md-editor/markdown-editor.css";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, Search } from "lucide-react";
import { toast } from "sonner";
import type { Resolver } from "react-hook-form";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { useAccountsQuery } from "@/hooks/queries/use-accounts";
import { useDebouncedValue } from "@/hooks/use-debounce";
import { useCreateAnnouncementMutation } from "@/hooks/queries/use-announcements";
import type {
  AnnouncementChannel,
  AnnouncementResponse,
  AnnouncementSeverity,
  CreateAnnouncementPayload,
} from "@/services/api";

export interface AnnouncementSnapshot {
  id: string;
  name: string;
  notificationTitle: string;
  message: string;
  channel: AnnouncementChannel;
  severity: AnnouncementSeverity;
  sendToAll: boolean;
  accountIds: string[];
  createdAt: string;
}

const announcementSchema = z
  .object({
    name: z.string().min(1, "Campaign name is required"),
    notificationTitle: z
      .string()
      .min(1, "Notification title is required")
      .max(120, "Keep the title short."),
    channel: z.enum(["email", "in-app"]),
    severity: z.enum(["success", "info", "warning", "critical", "error"]),
    message: z.string().min(1, "Message is required"),
    actionUrl: z.string().url("Enter a valid URL").optional().or(z.literal("")),
    imageUrl: z
      .string()
      .url("Enter a valid image URL")
      .optional()
      .or(z.literal("")),
    sendToAll: z.boolean().default(true),
    accountIds: z.array(z.string()).default([]),
  })
  .refine((value) => value.sendToAll || value.accountIds.length > 0, {
    message: "Select at least one user or send to all.",
    path: ["accountIds"],
  });

type AnnouncementFormValues = z.infer<typeof announcementSchema>;

const defaultValues: AnnouncementFormValues = {
  name: "",
  notificationTitle: "",
  message: "",
  channel: "email",
  severity: "info",
  actionUrl: "",
  imageUrl: "",
  sendToAll: true,
  accountIds: [],
};

interface AnnouncementComposerDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCreated?: (announcement: AnnouncementSnapshot) => void;
}

export function AnnouncementComposerDialog({
  open,
  onOpenChange,
  onCreated,
}: AnnouncementComposerDialogProps) {
  const form = useForm<AnnouncementFormValues>({
    resolver: zodResolver(
      announcementSchema,
    ) as Resolver<AnnouncementFormValues>,
    defaultValues,
  });

  const [userSearch, setUserSearch] = React.useState("");
  const debouncedSearch = useDebouncedValue(userSearch, 400);
  const sendToAll = form.watch("sendToAll");

  const { data: accountsData, isFetching: isAccountsLoading } =
    useAccountsQuery(
      { search: debouncedSearch || undefined, limit: 50, offset: 0 },
      {
        enabled: !sendToAll,
        queryKey: [
          "accounts",
          { search: debouncedSearch || "", limit: 50, offset: 0 },
        ],
      },
    );

  const accounts = accountsData?.items ?? [];

  const { mutateAsync, isPending } = useCreateAnnouncementMutation();

  React.useEffect(() => {
    if (!open) {
      form.reset(defaultValues);
      setUserSearch("");
    }
  }, [open, form]);

  const toggleAccount = (accountId: string, checked: boolean) => {
    const current = form.getValues("accountIds");
    if (checked) {
      form.setValue("accountIds", [...current, accountId], {
        shouldValidate: true,
      });
    } else {
      form.setValue(
        "accountIds",
        current.filter((id) => id !== accountId),
        {
          shouldValidate: true,
        },
      );
    }
  };

  const onValid = async (values: AnnouncementFormValues) => {
    const payload: CreateAnnouncementPayload = {
      ...values,
      actionUrl: values.actionUrl?.trim() ? values.actionUrl.trim() : undefined,
      imageUrl: values.imageUrl?.trim() ? values.imageUrl.trim() : undefined,
      accountIds: values.sendToAll ? [] : values.accountIds,
    };

    const toastId = toast.loading("Creating announcement...");
    try {
      const response = await mutateAsync(payload);
      toast.success("Announcement created successfully", { id: toastId });
      onCreated?.(toSnapshot(response, values));
      onOpenChange(false);
      form.reset(defaultValues);
      setUserSearch("");
    } catch (error) {
      const message =
        (error as { response?: { data?: { message?: string } } })?.response
          ?.data?.message ?? "Unable to create announcement. Please try again.";
      toast.error(message, { id: toastId });
    }
  };

  const handleFormSubmit: React.FormEventHandler<HTMLFormElement> = (e) => {
    void form.handleSubmit(onValid)(e);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto rounded-2xl sm:max-w-3xl">
        <DialogHeader>
          <DialogTitle>Create announcement</DialogTitle>
          <DialogDescription>
            Craft announcements and optionally target specific users.
          </DialogDescription>
        </DialogHeader>

        <Form<AnnouncementFormValues> {...form}>
          <form className="space-y-5" onSubmit={handleFormSubmit}>
            <div className="grid gap-4 md:grid-cols-2">
              <FormField<AnnouncementFormValues>
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Campaign name</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="E.g. Pod launch reminder"
                        {...field}
                        value={
                          typeof field.value === "string" ? field.value : ""
                        }
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField<AnnouncementFormValues>
                control={form.control}
                name="notificationTitle"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Notification title</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="E.g. Complete your pod setup"
                        {...field}
                        value={
                          typeof field.value === "string" ? field.value : ""
                        }
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              <FormField<AnnouncementFormValues>
                control={form.control}
                name="channel"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Channel</FormLabel>
                    <Select
                      value={typeof field.value === "string" ? field.value : ""}
                      onValueChange={(value) => field.onChange(value)}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select channel" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="email">Email</SelectItem>
                        <SelectItem value="in-app">In-app</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField<AnnouncementFormValues>
                control={form.control}
                name="severity"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Severity</FormLabel>
                    <Select
                      value={typeof field.value === "string" ? field.value : ""}
                      onValueChange={(value) => field.onChange(value)}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select severity" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="success">Success</SelectItem>
                        <SelectItem value="info">Info</SelectItem>
                        <SelectItem value="warning">Warning</SelectItem>
                        <SelectItem value="critical">Critical</SelectItem>
                        <SelectItem value="error">Error</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <FormField<AnnouncementFormValues>
              control={form.control}
              name="message"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Message</FormLabel>
                  <FormControl>
                    <div data-color-mode="light">
                      <MDEditor
                        value={
                          typeof field.value === "string" ? field.value : ""
                        }
                        onChange={(value) => field.onChange(value ?? "")}
                        height={220}
                      />
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="grid gap-4 md:grid-cols-2">
              <FormField<AnnouncementFormValues>
                control={form.control}
                name="actionUrl"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Action URL (optional)</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="https://"
                        value={
                          typeof field.value === "string" ? field.value : ""
                        }
                        onChange={(e) => field.onChange(e.target.value)}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField<AnnouncementFormValues>
                control={form.control}
                name="imageUrl"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Image URL (optional)</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="https://"
                        value={
                          typeof field.value === "string" ? field.value : ""
                        }
                        onChange={(e) => field.onChange(e.target.value)}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <FormField<AnnouncementFormValues>
              control={form.control}
              name="sendToAll"
              render={({ field }) => (
                <FormItem className="flex items-center justify-between rounded-2xl border border-dashed px-4 py-3">
                  <div>
                    <FormLabel className="text-base">Target audience</FormLabel>
                    <p className="text-sm text-muted-foreground">
                      Send to every user or pick a subset.
                    </p>
                  </div>
                  <FormControl>
                    <Switch
                      value={typeof field.value === "string" ? field.value : ""}
                      onCheckedChange={(checked) => {
                        field.onChange(checked);
                        if (checked) {
                          form.setValue("accountIds", [], {
                            shouldValidate: true,
                          });
                        }
                      }}
                    />
                  </FormControl>
                </FormItem>
              )}
            />
            {!sendToAll && (
              <FormField<AnnouncementFormValues>
                control={form.control}
                name="accountIds"
                render={({ field }) => {
                  const selected = field.value ?? [];
                  return (
                    <FormItem className="space-y-3">
                      <div className="flex items-center justify-between">
                        <FormLabel>Choose recipients</FormLabel>
                        <span className="text-xs text-muted-foreground">
                          {Array.isArray(selected) ? selected.length : 0}{" "}
                          selected
                        </span>
                      </div>
                      <FormControl>
                        <div className="space-y-3 rounded-2xl border border-[#E5E7EB] bg-white p-3">
                          <div className="relative">
                            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#9CA3AF]" />
                            <Input
                              placeholder="Search by name or email"
                              value={userSearch}
                              onChange={(e) => setUserSearch(e.target.value)}
                              className="pl-9"
                            />
                          </div>
                          <div className="max-h-64 space-y-2 overflow-y-auto pr-2">
                            {isAccountsLoading ? (
                              <div className="flex items-center justify-center py-6 text-sm text-muted-foreground">
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Loading accounts...
                              </div>
                            ) : accounts.length > 0 ? (
                              accounts.map((account) => {
                                const checked =
                                  Array.isArray(selected) &&
                                  selected.includes(account.id);
                                const fullName = [
                                  account.firstName,
                                  account.lastName,
                                ]
                                  .filter(Boolean)
                                  .join(" ")
                                  .trim();
                                return (
                                  <label
                                    key={account.id}
                                    className="flex cursor-pointer items-center gap-3 rounded-xl border border-[#E5E7EB] px-3 py-2 text-sm"
                                  >
                                    <input
                                      type="checkbox"
                                      checked={checked}
                                      onChange={(e) =>
                                        toggleAccount(
                                          account.id,
                                          e.target.checked,
                                        )
                                      }
                                      className="h-4 w-4 rounded border border-input text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2"
                                    />
                                    <div className="flex flex-col">
                                      <span className="font-medium text-[#111827]">
                                        {fullName || account.email}
                                      </span>
                                      <span className="text-xs text-[#6B7280]">
                                        {account.email}
                                      </span>
                                    </div>
                                  </label>
                                );
                              })
                            ) : (
                              <p className="py-4 text-center text-sm text-muted-foreground">
                                No accounts match “{userSearch}”.
                              </p>
                            )}
                          </div>
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  );
                }}
              />
            )}
            <div className="flex items-center justify-end gap-3">
              <Button
                type="button"
                variant="outline"
                className="rounded-xl"
                onClick={() => onOpenChange(false)}
                disabled={isPending}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                className="rounded-xl bg-[#FF8C42] hover:bg-[#f77f2f]"
                disabled={isPending}
              >
                {isPending ? (
                  <span className="flex items-center gap-2">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Sending...
                  </span>
                ) : (
                  "Send announcement"
                )}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}

const toSnapshot = (
  response: AnnouncementResponse | undefined,
  fallback: AnnouncementFormValues,
): AnnouncementSnapshot => {
  const createdAt = response?.createdAt ?? new Date().toISOString();
  const id =
    response?.id ??
    (typeof globalThis.crypto !== "undefined" &&
    "randomUUID" in globalThis.crypto
      ? globalThis.crypto.randomUUID()
      : `announcement-${Date.now()}`);

  return {
    id,
    name: response?.name ?? fallback.name,
    notificationTitle:
      response?.notificationTitle ?? fallback.notificationTitle,
    message: response?.message ?? fallback.message,
    channel: response?.channel ?? fallback.channel,
    severity: response?.severity ?? fallback.severity,
    sendToAll: response?.sendToAll ?? fallback.sendToAll,
    accountIds: response?.accountIds ?? fallback.accountIds,
    createdAt,
  };
};
