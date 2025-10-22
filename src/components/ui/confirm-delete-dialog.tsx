/* eslint-disable @typescript-eslint/no-misused-promises */
import React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogClose,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

interface ConfirmDeleteDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title?: string;
  description?: string;
  itemName?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  onConfirm: () => Promise<void> | void;
}

export function ConfirmDeleteDialog({
  open,
  onOpenChange,
  title = "Delete item",
  description,
  itemName,
  confirmLabel = "Delete",
  cancelLabel = "Cancel",
  onConfirm,
}: ConfirmDeleteDialogProps) {
  const [submitting, setSubmitting] = React.useState(false);

  const handleConfirm = async () => {
    try {
      setSubmitting(true);
      await onConfirm();
      onOpenChange(false);
    } finally {
      setSubmitting(false);
    }
  };

  const finalDescription =
    description ??
    `This action cannot be undone. This will permanently delete${itemName ? ` "${itemName}"` : " this item"}.`;

  return (
    <Dialog open={open} onOpenChange={(v) => !submitting && onOpenChange(v)}>
      <DialogContent className="sm:max-w-[440px] rounded-2xl p-6">
        <DialogHeader>
          <DialogTitle className="text-[18px]">{title}</DialogTitle>
          <DialogDescription>{finalDescription}</DialogDescription>
        </DialogHeader>

        <div className="mt-4 flex items-center justify-end gap-2">
          <DialogClose asChild>
            <Button variant="outline" disabled={submitting}>
              {cancelLabel}
            </Button>
          </DialogClose>
          <Button
            variant="destructive"
            onClick={handleConfirm}
            disabled={submitting}
          >
            {submitting ? "Deleting..." : confirmLabel}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
