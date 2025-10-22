/* eslint-disable @typescript-eslint/no-misused-promises */
import * as React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export interface ContactPayload {
  firstName: string;
  lastName: string;
  email: string;
  countryCode: string;
  phone: string;
  address: string;
  pod: string;
  group: string;
  avatarFile?: File | null;
}

export interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (payload: ContactPayload) => void | Promise<void>;
  defaultValues?: Partial<ContactPayload>;
  title?: string;
  submitLabel?: string;
}

export function AddContactModal({
  open,
  onOpenChange,
  onSubmit,
  defaultValues,
  title = "New Contact",
  submitLabel = "Add Contact",
}: Props) {
  const [values, setValues] = React.useState<ContactPayload>({
    firstName: defaultValues?.firstName ?? "",
    lastName: defaultValues?.lastName ?? "",
    email: defaultValues?.email ?? "",
    countryCode: defaultValues?.countryCode ?? "+1",
    phone: defaultValues?.phone ?? "",
    address: defaultValues?.address ?? "",
    pod: defaultValues?.pod ?? "",
    group: defaultValues?.group ?? "",
    avatarFile: null,
  });

  // Preview URL for avatar
  const [previewUrl, setPreviewUrl] = React.useState<string | null>(null);
  const fileInputRef = React.useRef<HTMLInputElement | null>(null);

  React.useEffect(() => {
    if (!values.avatarFile) {
      setPreviewUrl(null);
      return;
    }
    const url = URL.createObjectURL(values.avatarFile);
    setPreviewUrl(url);
    return () => URL.revokeObjectURL(url);
  }, [values.avatarFile]);

  React.useEffect(() => {
    if (open) {
      setValues(
        (v) =>
          ({
            ...v,
            ...defaultValues,
            countryCode: defaultValues?.countryCode ?? v.countryCode ?? "+1",
          }) as ContactPayload,
      );
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] ?? null;
    setValues((v) => ({ ...v, avatarFile: file }));
    // Allow re-selecting the same file
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSubmit(values);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-xl p-0 overflow-hidden">
        <DialogHeader className="px-6 pt-6">
          <DialogTitle className="text-xl">{title}</DialogTitle>
        </DialogHeader>

        <form onSubmit={submit} className="px-6 pb-6 space-y-5">
          {/* Avatar */}
          <div className="flex items-center justify-center">
            <div className="relative h-20 w-20">
              <label className="absolute inset-0 rounded-2xl border-2 border-dashed flex items-center justify-center text-gray-400 cursor-pointer overflow-hidden">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleFile}
                />
                {previewUrl ? (
                  <img
                    src={previewUrl}
                    alt="Avatar preview"
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <span className="text-2xl">+</span>
                )}
              </label>
              {previewUrl && (
                <button
                  type="button"
                  className="absolute -right-2 -top-2 h-6 w-6 rounded-full bg-white text-gray-600 shadow ring-1 ring-gray-200"
                  onClick={() => setValues((v) => ({ ...v, avatarFile: null }))}
                  aria-label="Remove image"
                  title="Remove image"
                >
                  ×
                </button>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <Label className="text-xs text-gray-500">First Name</Label>
              <Input
                value={values.firstName}
                onChange={(e) =>
                  setValues((v) => ({ ...v, firstName: e.target.value }))
                }
                placeholder="First name"
                className="rounded-xl"
              />
            </div>
            <div>
              <Label className="text-xs text-gray-500">Last Name</Label>
              <Input
                value={values.lastName}
                onChange={(e) =>
                  setValues((v) => ({ ...v, lastName: e.target.value }))
                }
                placeholder="Last name"
                className="rounded-xl"
              />
            </div>
          </div>

          <div>
            <Label className="text-xs text-gray-500">Email</Label>
            <Input
              type="email"
              value={values.email}
              onChange={(e) =>
                setValues((v) => ({ ...v, email: e.target.value }))
              }
              placeholder="name@example.com"
              className="rounded-xl"
            />
          </div>

          <div>
            <Label className="text-xs text-gray-500">Phone</Label>
            <div className="flex gap-2">
              <select
                value={values.countryCode}
                onChange={(e) =>
                  setValues((v) => ({ ...v, countryCode: e.target.value }))
                }
                className="rounded-xl border bg-white px-2 text-sm"
              >
                <option value="+1">+1</option>
                <option value="+44">+44</option>
                <option value="+234">+234</option>
                <option value="+61">+61</option>
              </select>
              <Input
                value={values.phone}
                onChange={(e) =>
                  setValues((v) => ({ ...v, phone: e.target.value }))
                }
                placeholder="(000) 000–0000"
                className="rounded-xl"
              />
            </div>
          </div>

          <div>
            <Label className="text-xs text-gray-500">Address</Label>
            <Input
              value={values.address}
              onChange={(e) =>
                setValues((v) => ({ ...v, address: e.target.value }))
              }
              placeholder="City, Country"
              className="rounded-xl"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <Label className="text-xs text-gray-500">Pod</Label>
              <Input
                value={values.pod}
                onChange={(e) =>
                  setValues((v) => ({ ...v, pod: e.target.value }))
                }
                placeholder="100 usd"
                className="rounded-xl"
              />
            </div>
            <div>
              <Label className="text-xs text-gray-500">Group</Label>
              <Input
                value={values.group}
                onChange={(e) =>
                  setValues((v) => ({ ...v, group: e.target.value }))
                }
                placeholder="#4448494"
                className="rounded-xl"
              />
            </div>
          </div>

          <div className="pt-2">
            <Button
              type="submit"
              className="w-full rounded-xl bg-[#FF8C42] hover:bg-[#f77f2f]"
            >
              {submitLabel}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
