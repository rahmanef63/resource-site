"use client";

import { useCallback, useEffect, useState } from "react";
import type { ReactNode } from "react";
import { usePathname } from "next/navigation";
import { useMutation } from "convex/react";
import type { Id } from "@convex/_generated/dataModel";
import { api } from "@convex/_generated/api";
import { useToast } from "@/hooks/use-toast";
import { ResponsiveDialog, IconPicker } from "@/frontend/shared/ui";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { useDatabaseMutations } from "../hooks/useDatabase";
import {
  DATABASE_STARTER_TEMPLATES,
  getDatabaseStarterTemplate,
  type DatabaseStarterTemplateId,
} from "../constants/templates";

export interface CreateDatabaseDialogProps {
  workspaceId: Id<"workspaces">;
  trigger?: ReactNode;
  onCreated?: (tableId: Id<"dbTables">) => void;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  initialTemplateId?: DatabaseStarterTemplateId;
}

export function CreateDatabaseDialog({
  workspaceId,
  trigger,
  onCreated,
  open,
  onOpenChange,
  initialTemplateId,
}: CreateDatabaseDialogProps) {
  const { toast } = useToast();
  const pathname = usePathname();
  const trackEvent = useMutation(api.features.analytics.mutations.trackEvent as any);
  const [internalOpen, setInternalOpen] = useState(false);
  const [templateId, setTemplateId] = useState<DatabaseStarterTemplateId>(
    initialTemplateId ?? "blank"
  );
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [icon, setIcon] = useState("Database");
  const [color, setColor] = useState("default");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { createTable, createField } = useDatabaseMutations();

  const resolvedOpen = open ?? internalOpen;

  const updateOpenState = (next: boolean) => {
    if (onOpenChange) {
      onOpenChange(next);
    } else {
      setInternalOpen(next);
    }
  };

  const resetForm = () => {
    setName("");
    setDescription("");
    setIcon("Database");
    setColor("default");
    setTemplateId(initialTemplateId ?? "blank");
    setError(null);
  };

  const applyTemplate = useCallback((nextTemplateId: DatabaseStarterTemplateId) => {
    const template = getDatabaseStarterTemplate(nextTemplateId);
    setTemplateId(template.id);
    setName(template.defaultTableName);
    setDescription(template.defaultDescription ?? "");
    setIcon(template.defaultIcon);
    setColor(template.defaultIconColor);
  }, []);

  useEffect(() => {
    if (!resolvedOpen) return;
    applyTemplate(initialTemplateId ?? "blank");
  }, [applyTemplate, resolvedOpen, initialTemplateId]);

  const handleSubmit = async () => {
    if (!name.trim()) {
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const template = getDatabaseStarterTemplate(templateId);
      // Store icon as JSON string to preserve both icon name and color
      const iconData = JSON.stringify({ name: icon, color });

      const tableId = await createTable({
        workspaceId,
        name: name.trim(),
        description: description.trim() || undefined,
        icon: iconData,
      });

      void trackEvent({
        workspaceId,
        eventType: "database",
        eventName: "database.created",
        properties: {
          tableId,
          templateId: template.id,
          templateName: template.name,
        },
        metadata: {
          userAgent: typeof navigator !== "undefined" ? navigator.userAgent : undefined,
          referrer: typeof document !== "undefined" ? document.referrer : undefined,
          path: pathname ?? undefined,
        },
      }).catch((trackError: any) => {
        if (process.env.NODE_ENV !== "production") {
          console.warn("[Database] analytics trackEvent failed", trackError);
        }
      });

      const fields = template.fields ?? [];
      let fieldFailures = 0;
      for (const field of fields) {
        try {
          await createField({
            tableId,
            name: field.name,
            type: field.type as any,
            options: field.options as any,
            isRequired: field.isRequired ?? false,
          });
        } catch (fieldError) {
          fieldFailures += 1;
          console.error("Failed to create template field:", fieldError);
        }
      }

      resetForm();
      updateOpenState(false);

      if (onCreated && tableId) {
        onCreated(tableId as Id<"dbTables">);
      }

      if (template.id !== "blank") {
        if (fieldFailures > 0) {
          toast({
            title: "Database created",
            description: `Created "${template.name}" template, but ${fieldFailures} field(s) failed to apply.`,
            variant: "destructive",
          });
        } else {
          toast({
            title: "Database created",
            description: `Started from "${template.name}" template.`,
          });
        }
      }
    } catch (err) {
      let message =
        err instanceof Error ? err.message : "Failed to create database";
      if (message.toLowerCase().includes("unauthorized")) {
        message =
          "You don't have permission to create databases in this workspace. Ask a workspace admin to grant access.";
      } else if (message.toLowerCase().includes("not authenticated")) {
        message = "You need to be signed in to create a database.";
      }
      setError(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      {trigger ? (
        <span onClick={() => updateOpenState(true)}>{trigger}</span>
      ) : null}
      <ResponsiveDialog open={resolvedOpen} onOpenChange={updateOpenState} variant="modal" size="md">
        <ResponsiveDialog.Header>
          <ResponsiveDialog.Title>Create database</ResponsiveDialog.Title>
          <ResponsiveDialog.Description>
            Spin up a new workspace database for teams, projects, or
            experiments.
          </ResponsiveDialog.Description>
        </ResponsiveDialog.Header>

        <ResponsiveDialog.Body className="px-4 py-4 sm:px-6">
          <div className="flex flex-col gap-4">
            <div>
              <label className="text-sm font-medium text-muted-foreground">
                Template
              </label>
              <div className="mt-2 grid grid-cols-2 gap-2">
                {DATABASE_STARTER_TEMPLATES.map((template) => (
                  <button
                    key={template.id}
                    type="button"
                    className={cn(
                      "rounded-md border px-3 py-2 text-left transition",
                      "hover:bg-muted",
                      template.id === templateId
                        ? "border-primary bg-primary/5"
                        : "border-border"
                    )}
                    onClick={() => applyTemplate(template.id)}
                  >
                    <div className="text-sm font-medium">{template.name}</div>
                    <div className="text-xs text-muted-foreground">
                      {template.description}
                    </div>
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="text-sm font-medium text-muted-foreground">
                Name
              </label>
              <Input
                autoFocus
                placeholder="Product roadmap"
                value={name}
                onChange={(event) => setName(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === "Enter" && name.trim()) {
                    event.preventDefault();
                    void handleSubmit();
                  }
                }}
              />
            </div>

            <div>
              <label className="text-sm font-medium text-muted-foreground">
                Icon & Color
              </label>
              <div className="mt-2">
                <IconPicker
                  icon={icon}
                  color={color}
                  onIconChange={setIcon}
                  onColorChange={setColor}
                  showColor={true}
                  showBackground={false}
                  className="w-full"
                />
              </div>
            </div>

            <div>
              <label className="text-sm font-medium text-muted-foreground">
                Description{" "}
                <span className="text-xs text-muted-foreground">(optional)</span>
              </label>
              <Textarea
                rows={3}
                placeholder="How will this database help your team?"
                value={description}
                onChange={(event) => setDescription(event.target.value)}
              />
            </div>

            {error ? (
              <p className="text-sm text-destructive" role="alert">
                {error}
              </p>
            ) : null}
          </div>
        </ResponsiveDialog.Body>

        <ResponsiveDialog.Footer className="flex-col-reverse sm:flex-row">
          <Button
            variant="ghost"
            onClick={() => {
              resetForm();
              updateOpenState(false);
            }}
          >
            Cancel
          </Button>
          <Button
            onClick={() => void handleSubmit()}
            disabled={!name.trim() || isSubmitting}
          >
            {isSubmitting ? "Creating…" : "Create"}
          </Button>
        </ResponsiveDialog.Footer>
      </ResponsiveDialog>
    </>
  );
}
