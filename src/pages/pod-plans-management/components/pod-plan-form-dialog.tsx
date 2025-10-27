import React from "react";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";

export interface PodPlanFormValues {
  code: string;
  amount: number;
  lifecycleWeeks: number;
  maxMembers: number;
  active: boolean;
}

interface PodPlanFormDialogProps {
  open: boolean;
  title: string;
  submitLabel: string;
  defaultValues?: PodPlanFormValues;
  loading?: boolean;
  errorMessage?: string | null;
  onOpenChange: (open: boolean) => void;
  onSubmit: (values: PodPlanFormValues) => void;
}

const EMPTY_VALUES: PodPlanFormValues = {
  code: "",
  amount: 0,
  lifecycleWeeks: 12,
  maxMembers: 6,
  active: true,
};

export function PodPlanFormDialog({
  open,
  title,
  submitLabel,
  defaultValues,
  loading = false,
  errorMessage = null,
  onOpenChange,
  onSubmit,
}: PodPlanFormDialogProps) {
  const [values, setValues] = React.useState<PodPlanFormValues>(
    defaultValues ?? EMPTY_VALUES,
  );

  React.useEffect(() => {
    if (open) {
      setValues(defaultValues ?? EMPTY_VALUES);
    }
  }, [open, defaultValues]);

  const handleChange = (key: keyof PodPlanFormValues, value: unknown) => {
    setValues((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    onSubmit(values);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg p-0 overflow-hidden">
        <DialogHeader className="px-6 pt-6">
          <DialogTitle className="text-xl">{title}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-5 px-6 pb-6">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <Label className="text-xs uppercase tracking-wide text-[#9CA3AF]">
                Plan code
              </Label>
              <Input
                required
                value={values.code}
                onChange={(event) => handleChange("code", event.target.value)}
                placeholder="STANDARD-12"
                className="rounded-xl"
              />
            </div>
            <div>
              <Label className="text-xs uppercase tracking-wide text-[#9CA3AF]">
                Amount
              </Label>
              <Input
                required
                type="number"
                min={0}
                value={values.amount}
                onChange={(event) =>
                  handleChange("amount", Number(event.target.value))
                }
                className="rounded-xl"
              />
            </div>
            <div>
              <Label className="text-xs uppercase tracking-wide text-[#9CA3AF]">
                Lifecycle (weeks)
              </Label>
              <Input
                required
                type="number"
                min={1}
                value={values.lifecycleWeeks}
                onChange={(event) =>
                  handleChange("lifecycleWeeks", Number(event.target.value))
                }
                className="rounded-xl"
              />
            </div>
            <div>
              <Label className="text-xs uppercase tracking-wide text-[#9CA3AF]">
                Max members
              </Label>
              <Input
                required
                type="number"
                min={1}
                value={values.maxMembers}
                onChange={(event) =>
                  handleChange("maxMembers", Number(event.target.value))
                }
                className="rounded-xl"
              />
            </div>
            <div className="flex items-center justify-between rounded-xl border border-[#E5E7EB] px-4 py-3">
              <div>
                <div className="text-sm font-medium text-[#111827]">
                  Active plan
                </div>
                <div className="text-xs text-[#6B7280]">
                  Control whether this plan can be used to create pods.
                </div>
              </div>
              <Switch
                checked={values.active}
                onCheckedChange={(checked) => handleChange("active", checked)}
              />
            </div>
          </div>

          {errorMessage && (
            <div className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-xs text-rose-700">
              {errorMessage}
            </div>
          )}

          <div className="flex items-center justify-end gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button type="submit" className="rounded-xl" disabled={loading}>
              {loading ? "Saving…" : submitLabel}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
