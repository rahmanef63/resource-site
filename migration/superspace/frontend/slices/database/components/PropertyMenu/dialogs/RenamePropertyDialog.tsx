"use client";

import { useState } from "react";
import { ResponsiveDialog } from "@/frontend/shared/ui";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export interface RenamePropertyDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  currentName: string;
  onConfirm: (newName: string) => void;
}

export function RenamePropertyDialog({
  open,
  onOpenChange,
  currentName,
  onConfirm,
}: RenamePropertyDialogProps) {
  const [name, setName] = useState(currentName);

  const handleConfirm = () => {
    const trimmed = name.trim();
    if (!trimmed || trimmed === currentName) {
      onOpenChange(false);
      return;
    }
    onConfirm(trimmed);
    onOpenChange(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleConfirm();
    }
  };

  return (
    <ResponsiveDialog open={open} onOpenChange={onOpenChange} variant="modal" size="sm">
      <ResponsiveDialog.Header>
        <ResponsiveDialog.Title>Rename property</ResponsiveDialog.Title>
        <ResponsiveDialog.Description>
          Enter a new name for this property. Press Enter to confirm.
        </ResponsiveDialog.Description>
      </ResponsiveDialog.Header>
      <ResponsiveDialog.Body className="px-4 py-4 sm:px-6">
        <div className="grid gap-2">
          <Label htmlFor="name">Property name</Label>
          <Input
            id="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Enter property name"
            autoFocus
          />
        </div>
      </ResponsiveDialog.Body>
      <ResponsiveDialog.Footer className="flex-col-reverse sm:flex-row">
        <Button
          type="button"
          variant="outline"
          onClick={() => onOpenChange(false)}
        >
          Cancel
        </Button>
        <Button type="button" onClick={handleConfirm}>
          Rename
        </Button>
      </ResponsiveDialog.Footer>
    </ResponsiveDialog>
  );
}
