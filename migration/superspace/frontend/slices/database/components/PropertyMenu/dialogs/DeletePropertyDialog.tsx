"use client";

import { ResponsiveDialog } from "@/frontend/shared/ui";
import { Button } from "@/components/ui/button";

export interface DeletePropertyDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  propertyName: string;
  onConfirm: () => void;
}

export function DeletePropertyDialog({
  open,
  onOpenChange,
  propertyName,
  onConfirm,
}: DeletePropertyDialogProps) {
  const handleConfirm = () => {
    onConfirm();
    onOpenChange(false);
  };

  return (
    <ResponsiveDialog open={open} onOpenChange={onOpenChange} variant="alert" size="md">
      <ResponsiveDialog.Header>
        <ResponsiveDialog.Title>Delete property &quot;{propertyName}&quot;?</ResponsiveDialog.Title>
        <ResponsiveDialog.Description>
          This will remove the property and all its data from all items. This
          action cannot be undone.
        </ResponsiveDialog.Description>
      </ResponsiveDialog.Header>
      <ResponsiveDialog.Footer className="flex-col-reverse sm:flex-row">
        <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
        <Button
          variant="destructive"
          onClick={handleConfirm}
        >
          Delete
        </Button>
      </ResponsiveDialog.Footer>
    </ResponsiveDialog>
  );
}
