"use client";

import { useQuery, useMutation } from "convex/react";
import { api } from "@/frontend/shared/foundation/utils/convex/any-api";
import { useState } from "react";
import { Trash2, RefreshCw, Loader2, AlertCircle } from "lucide-react";
import type { Id } from "@convex/_generated/dataModel";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { ResponsiveDialog } from "@/frontend/shared/ui";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useToast } from "@/hooks/use-toast";
import { usePostWorkspaceDeleteNavigation } from "@/frontend/shared/foundation/workspaces/hooks/usePostWorkspaceDeleteNavigation";

export interface DangerZoneSettingsProps {
  workspaceId: Id<"workspaces">;
}

export function DangerZoneSettings({ workspaceId }: DangerZoneSettingsProps) {
  const workspace = useQuery(api.workspace.workspaces.getWorkspace, { workspaceId });
  const deleteWorkspace = useMutation(api.workspace.workspaces.deleteWorkspace as any);
  const resetWorkspace = useMutation(api.workspace.workspaces.resetWorkspace as any);
  const { toast } = useToast();
  const navigateAfterWorkspaceDelete = usePostWorkspaceDeleteNavigation();

  const [showResetDialog, setShowResetDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [resetMode, setResetMode] = useState<'replaceMenus'|'clean'>('replaceMenus');
  const [isDeleting, setIsDeleting] = useState(false);
  const [isResetting, setIsResetting] = useState(false);

  const handleDelete = async () => {
    if (!workspace) return;

    setIsDeleting(true);
    try {
      await deleteWorkspace({ workspaceId });
      navigateAfterWorkspaceDelete(workspaceId);
      toast({
        title: "Workspace deleted",
        description: "Your workspace has been permanently deleted",
      });
    } catch (error) {
      toast({
        title: "Error deleting workspace",
        description: "Failed to delete workspace. Please try again.",
        variant: "destructive",
      });
      setIsDeleting(false);
    }
  };

  const handleResetConfirm = async () => {
    setIsResetting(true);
    try {
      await resetWorkspace({ workspaceId, mode: resetMode });
      setShowResetDialog(false);
      toast({
        title: "Workspace reset",
        description: "Your workspace has been reset successfully",
      });
    } catch (error) {
      toast({
        title: "Error resetting workspace",
        description: "Failed to reset workspace. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsResetting(false);
    }
  }

  if (!workspace) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
          <p className="text-sm text-muted-foreground">Loading settings...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Card className="border-destructive/50">
        <CardHeader>
          <CardTitle className="text-destructive">Danger Zone</CardTitle>
          <CardDescription>
            Irreversible actions that affect your workspace
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between rounded-lg border border-muted p-4">
            <div className="space-y-0.5">
              <h3 className="font-medium">Reset Workspace</h3>
              <p className="text-sm text-muted-foreground">
                Re-initialize workspace menus to default settings
              </p>
            </div>
            <Button
              type="button"
              variant="outline"
              className="gap-2"
              onClick={() => setShowResetDialog(true)}
              disabled={isDeleting || isResetting}
            >
              <RefreshCw className="w-4 h-4" />
              Reset
            </Button>
          </div>

          <div className="flex items-center justify-between rounded-lg border border-destructive/50 bg-destructive/5 p-4">
            <div className="space-y-0.5">
              <h3 className="font-medium text-destructive">Delete Workspace</h3>
              <p className="text-sm text-muted-foreground">
                Permanently delete this workspace and all its data
              </p>
            </div>
            <Button
              type="button"
              variant="destructive"
              className="gap-2"
              onClick={() => setShowDeleteDialog(true)}
              disabled={isDeleting || isResetting}
            >
              {isDeleting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Deleting...
                </>
              ) : (
                <>
                  <Trash2 className="w-4 h-4" />
                  Delete
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Reset Dialog */}
      <ResponsiveDialog open={showResetDialog} onOpenChange={setShowResetDialog} variant="modal" size="md">
        <ResponsiveDialog.Header>
          <ResponsiveDialog.Title className="flex items-center gap-2">
            <RefreshCw className="w-5 h-5" />
            Reset Workspace
          </ResponsiveDialog.Title>
          <ResponsiveDialog.Description>
            Choose how you want to re-initialize this workspace&apos;s menus. This action cannot be undone.
          </ResponsiveDialog.Description>
        </ResponsiveDialog.Header>
        <ResponsiveDialog.Body className="px-4 py-4 sm:px-6">
          <RadioGroup value={resetMode} onValueChange={(v) => setResetMode(v as any)} disabled={isResetting}>
            <div className="flex items-start gap-3 rounded-lg border p-4 cursor-pointer hover:bg-accent/50 transition-colors">
              <RadioGroupItem value="replaceMenus" id="replaceMenus" className="mt-1" />
              <div className="flex-1">
                <Label htmlFor="replaceMenus" className="font-medium cursor-pointer">
                  Replace menus
                </Label>
                <p className="text-sm text-muted-foreground mt-1">
                  Delete current default set items and reinstall default menus.
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3 rounded-lg border p-4 cursor-pointer hover:bg-accent/50 transition-colors">
              <RadioGroupItem value="clean" id="clean" className="mt-1" />
              <div className="flex-1">
                <Label htmlFor="clean" className="font-medium cursor-pointer">
                  Clean reinit
                </Label>
                <p className="text-sm text-muted-foreground mt-1">
                  Remove all workspace-owned menu sets and items, then reinstall defaults in a fresh set.
                </p>
              </div>
            </div>
          </RadioGroup>
        </ResponsiveDialog.Body>
        <ResponsiveDialog.Footer className="flex-col-reverse sm:flex-row">
          <Button
            type="button"
            variant="outline"
            onClick={() => setShowResetDialog(false)}
            disabled={isResetting}
          >
            Cancel
          </Button>
          <Button
            type="button"
            onClick={handleResetConfirm}
            disabled={isResetting}
            className="gap-2"
          >
            {isResetting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Resetting...
              </>
            ) : (
              <>
                <RefreshCw className="w-4 h-4" />
                Confirm Reset
              </>
            )}
          </Button>
        </ResponsiveDialog.Footer>
      </ResponsiveDialog>

      {/* Delete Confirmation Dialog */}
      <ResponsiveDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog} variant="alert" size="md">
        <ResponsiveDialog.Header>
          <ResponsiveDialog.Title className="flex items-center gap-2 text-destructive">
            <AlertCircle className="w-5 h-5" />
            Are you absolutely sure?
          </ResponsiveDialog.Title>
          <ResponsiveDialog.Description>
            This action cannot be undone. This will permanently delete the workspace{" "}
            <span className="font-semibold text-foreground">&quot;{workspace.name}&quot;</span> and remove all associated data.
            <span className="mt-2 block text-destructive font-medium">
              All pages, documents, and settings will be lost forever.
            </span>
          </ResponsiveDialog.Description>
        </ResponsiveDialog.Header>
        <ResponsiveDialog.Footer className="flex-col-reverse sm:flex-row">
          <Button variant="outline" onClick={() => setShowDeleteDialog(false)} disabled={isDeleting}>
            Cancel
          </Button>
          <Button
            variant="destructive"
            onClick={handleDelete}
            disabled={isDeleting}
            className="gap-2"
          >
            {isDeleting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Deleting...
              </>
            ) : (
              <>
                <Trash2 className="w-4 h-4" />
                Delete Workspace
              </>
            )}
          </Button>
        </ResponsiveDialog.Footer>
      </ResponsiveDialog>
    </div>
  );
}
