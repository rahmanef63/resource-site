import { ResponsiveDialog } from "@/frontend/shared/ui";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Copy } from "lucide-react";
import { toast } from "sonner";
import type { ShareDialogState } from "../types";

interface ShareDialogProps {
  state: ShareDialogState;
  onClose: () => void;
}

export function ShareDialog({ state, onClose }: ShareDialogProps) {
  const handleCopy = () => {
    if (state.shareableId) {
      navigator.clipboard.writeText(state.shareableId);
      toast.success("Shareable ID copied to clipboard");
    }
  };

  return (
    <ResponsiveDialog
      open={state.isOpen}
      onOpenChange={(open) => !open && onClose()}
      variant="modal"
      size="sm"
    >
      <ResponsiveDialog.Header>
        <ResponsiveDialog.Title>Share Menu Item</ResponsiveDialog.Title>
        <ResponsiveDialog.Description>
          Share this menu item with other workspaces using the ID below.
        </ResponsiveDialog.Description>
      </ResponsiveDialog.Header>
      <ResponsiveDialog.Body className="px-4 py-4 sm:px-6">
        <div className="space-y-2">
          <Label>Shareable Menu ID</Label>
          <div className="flex gap-2">
            <Input
              value={state.shareableId || ""}
              readOnly
              className="font-mono text-sm"
            />
            <Button aria-label="Copy" onClick={handleCopy} size="sm">
              <Copy className="h-4 w-4" />
            </Button>
          </div>
          <p className="text-sm text-muted-foreground">
            Anyone with this ID can import this menu item into their workspace.
          </p>
        </div>
      </ResponsiveDialog.Body>
      <ResponsiveDialog.Footer>
        <Button onClick={onClose}>Close</Button>
      </ResponsiveDialog.Footer>
    </ResponsiveDialog>
  );
}
