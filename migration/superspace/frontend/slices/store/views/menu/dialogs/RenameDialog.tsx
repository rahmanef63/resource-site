import { ResponsiveDialog } from "@/frontend/shared/ui";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import type { RenameDialogState } from "../types";

interface RenameDialogProps {
  state: RenameDialogState;
  onClose: () => void;
  onNameChange: (name: string) => void;
  onConfirm: () => void;
}

export function RenameDialog({
  state,
  onClose,
  onNameChange,
  onConfirm,
}: RenameDialogProps) {
  return (
    <ResponsiveDialog
      open={state.isOpen}
      onOpenChange={(open) => !open && onClose()}
      variant="modal"
      size="sm"
    >
      <ResponsiveDialog.Header>
        <ResponsiveDialog.Title>Rename Menu Item</ResponsiveDialog.Title>
        <ResponsiveDialog.Description>
          Enter a new name for &quot;{state.item?.name}&quot;
        </ResponsiveDialog.Description>
      </ResponsiveDialog.Header>
      <ResponsiveDialog.Body className="px-4 py-4 sm:px-6">
        <div className="space-y-2">
          <Label htmlFor="newName">New Name</Label>
          <Input
            id="newName"
            value={state.newName}
            onChange={(e) => onNameChange(e.target.value)}
            placeholder="Enter new name..."
            onKeyDown={(e) => {
              if (e.key === "Enter" && state.newName.trim()) {
                onConfirm();
              }
            }}
          />
        </div>
      </ResponsiveDialog.Body>
      <ResponsiveDialog.Footer className="flex-col-reverse sm:flex-row">
        <Button variant="outline" onClick={onClose}>
          Cancel
        </Button>
        <Button onClick={onConfirm} disabled={!state.newName.trim()}>
          Rename
        </Button>
      </ResponsiveDialog.Footer>
    </ResponsiveDialog>
  );
}
