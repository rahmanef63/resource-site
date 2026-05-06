"use client";

import { useQuery, useMutation } from "convex/react";
import { api } from "@convex/_generated/api";
import { useState, useEffect } from "react";
import { Save, Loader2, AlertCircle } from "lucide-react";
import type { Id } from "@convex/_generated/dataModel";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";

export interface GeneralSettingsProps {
  workspaceId: Id<"workspaces">;
}

export function GeneralSettings({ workspaceId }: GeneralSettingsProps) {
  const workspace = useQuery(api.workspace.workspaces.getWorkspace, { workspaceId });
  const updateWorkspace = useMutation(api.workspace.workspaces.updateWorkspace);
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    name: workspace?.name || "",
    description: workspace?.description || "",
    isPublic: workspace?.isPublic || false,
  });
  const [isSaving, setIsSaving] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  // Sync form data when workspace loads
  useEffect(() => {
    if (workspace) {
      setFormData({
        name: workspace.name || "",
        description: workspace.description || "",
        isPublic: workspace.isPublic || false,
      });
    }
  }, [workspace]);

  // Track unsaved changes
  useEffect(() => {
    if (!workspace) return;
    const hasChanges =
      formData.name !== workspace.name ||
      formData.description !== (workspace.description || "") ||
      formData.isPublic !== workspace.isPublic;
    setHasUnsavedChanges(hasChanges);
  }, [formData, workspace]);

  const handleSave = async () => {
    if (!workspace || !formData.name.trim()) {
      toast({
        title: "Validation Error",
        description: "Workspace name is required",
        variant: "destructive",
      });
      return;
    }

    setIsSaving(true);
    try {
      await updateWorkspace({
        workspaceId,
        name: formData.name.trim(),
        description: formData.description?.trim() || "",
        isPublic: formData.isPublic,
      });

      toast({
        title: "Settings saved",
        description: "Your workspace settings have been updated successfully",
      });
      setHasUnsavedChanges(false);
    } catch (error) {
      toast({
        title: "Error saving settings",
        description: "Failed to update workspace settings. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

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
      {/* Basic Information Card */}
      <Card>
        <CardHeader>
          <CardTitle>Basic Information</CardTitle>
          <CardDescription>
            Update your workspace name and description
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="ws-name" className="text-sm font-medium">
              Workspace Name <span className="text-destructive">*</span>
            </Label>
            <Input
              id="ws-name"
              placeholder="Enter workspace name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              disabled={isSaving}
              className="max-w-md"
            />
            <p className="text-xs text-muted-foreground">
              This is the display name for your workspace
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="ws-desc" className="text-sm font-medium">
              Description
            </Label>
            <Textarea
              id="ws-desc"
              placeholder="Describe what this workspace is for..."
              rows={4}
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              disabled={isSaving}
            />
            <p className="text-xs text-muted-foreground">
              Help your team understand the purpose of this workspace
            </p>
          </div>

          <Separator />

          <div className="flex items-center justify-between rounded-lg border p-4">
            <div className="space-y-0.5 flex-1">
              <Label htmlFor="ws-public" className="text-sm font-medium cursor-pointer">
                Public Workspace
              </Label>
              <p className="text-sm text-muted-foreground">
                Allow anyone with the link to view this workspace
              </p>
            </div>
            <Switch
              id="ws-public"
              checked={formData.isPublic}
              onCheckedChange={(checked) => setFormData({ ...formData, isPublic: checked })}
              disabled={isSaving}
            />
          </div>

          {/* Save Button */}
          <div className="flex items-center justify-between pt-2">
            <div className="flex items-center gap-2">
              {hasUnsavedChanges && (
                <div className="flex items-center gap-1.5 text-sm text-amber-600 dark:text-amber-500">
                  <AlertCircle className="w-4 h-4" />
                  <span>Unsaved changes</span>
                </div>
              )}
            </div>
            <Button
              onClick={handleSave}
              disabled={isSaving || !hasUnsavedChanges || !formData.name.trim()}
              className="gap-2"
            >
              {isSaving ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  Save Changes
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
