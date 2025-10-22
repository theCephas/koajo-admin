import React from "react";
import { MoreVertical, SlidersHorizontal } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";

export function UMToolbarActions() {
  return (
    <div className="flex items-center gap-2">
      <Button
        variant="outline"
        className="rounded-xl h-9 px-3 text-sm inline-flex items-center gap-2"
      >
        <SlidersHorizontal className="h-4 w-4" />
        Actions
      </Button>
    </div>
  );
}

export function UMRowKebab({
  onView,
  onDelete,
}: {
  onView: () => void;
  onDelete: () => void;
}) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button className="h-8 w-8 inline-grid place-items-center rounded-lg hover:bg-gray-100">
          <MoreVertical className="h-4 w-4 text-gray-500" />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="min-w-40">
        <DropdownMenuItem
          onSelect={(e) => {
            e.preventDefault();
            onView();
          }}
        >
          View details
        </DropdownMenuItem>
        <DropdownMenuItem
          className="text-rose-600 focus:text-rose-700"
          onSelect={(e) => {
            e.preventDefault();
            onDelete();
          }}
        >
          Delete user
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
