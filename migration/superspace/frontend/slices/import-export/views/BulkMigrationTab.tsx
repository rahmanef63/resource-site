"use client";

import React, { useState, useRef, useCallback } from "react";
import {
  Upload,
  FileJson,
  LayoutTemplate,
  ChevronRight,
  AlertCircle,
  CheckCircle2,
  Loader2,
  X,
  Building2,
  Network,
  Briefcase,
  Layers,
  GitBranch,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useBulkMigration } from "../hooks/useBulkMigration";
import { WorkspaceHierarchyPreview } from "../components/WorkspaceHierarchyPreview";
import { MigrationProgressLog } from "../components/MigrationProgressLog";
import {
  MIGRATION_TEMPLATES,
  getTemplateById,
  type MigrationTemplateId,
} from "../templates";
import type { MigrationOptions } from "../types";

type Step = "source" | "validate" | "options" | "execute" | "results";

const TEMPLATE_ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  Building2,
  GitBranch,
  Network,
  Briefcase,
  Layers,
};

export function BulkMigrationTab() {
  const [step, setStep] = useState<Step>("source");
  const [manifestJson, setManifestJson] = useState<string>("");
  const [selectedTemplateId, setSelectedTemplateId] =
    useState<MigrationTemplateId | null>(null);
  const [options, setOptions] = useState<MigrationOptions>({
    autoResolveSlugConflicts: true,
    importMembers: false,
    dryRun: false,
  });

  const fileInputRef = useRef<HTMLInputElement>(null);

  const {
    isValidating,
    isExecuting,
    isRollingBack,
    validationResult,
    executionResult,
    error,
    validateManifest,
    executeMigration,
    rollbackMigration,
    reset,
  } = useBulkMigration();

  const handleFileUpload = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = (ev) => {
        const text = ev.target?.result as string;
        setManifestJson(text);
        setSelectedTemplateId(null);
      };
      reader.readAsText(file);
    },
    []
  );

  const handleSelectTemplate = useCallback((id: MigrationTemplateId) => {
    const data = getTemplateById(id);
    if (!data) return;
    setManifestJson(JSON.stringify(data, null, 2));
    setSelectedTemplateId(id);
  }, []);

  const handleValidate = useCallback(async () => {
    if (!manifestJson) return;
    const result = await validateManifest(manifestJson);
    if (result.valid) {
      setStep("validate");
    } else {
      setStep("validate");
    }
  }, [manifestJson, validateManifest]);

  const handleExecute = useCallback(async () => {
    if (!manifestJson) return;
    setStep("execute");
    try {
      await executeMigration(manifestJson, options);
      setStep("results");
    } catch {
      setStep("results");
    }
  }, [manifestJson, options, executeMigration]);

  const handleReset = useCallback(() => {
    reset();
    setStep("source");
    setManifestJson("");
    setSelectedTemplateId(null);
  }, [reset]);

  return (
    <div className="space-y-6 p-4">
      {/* Step indicators */}
      <div className="flex items-center gap-1 text-sm">
        {(["source", "validate", "options", "execute", "results"] as Step[]).map(
          (s, i) => {
            const stepIndex = [
              "source",
              "validate",
              "options",
              "execute",
              "results",
            ].indexOf(step);
            const thisIndex = i;
            const isDone = thisIndex < stepIndex;
            const isCurrent = s === step;
            return (
              <React.Fragment key={s}>
                {i > 0 && (
                  <ChevronRight className="h-3.5 w-3.5 text-muted-foreground" />
                )}
                <span
                  className={
                    isCurrent
                      ? "font-semibold text-foreground capitalize"
                      : isDone
                      ? "text-muted-foreground capitalize line-through"
                      : "text-muted-foreground capitalize"
                  }
                >
                  {s}
                </span>
              </React.Fragment>
            );
          }
        )}
      </div>

      {/* Step: Source */}
      {step === "source" && (
        <div className="space-y-4">
          <div>
            <h3 className="font-semibold text-base">Select Migration Source</h3>
            <p className="text-sm text-muted-foreground mt-0.5">
              Upload a manifest JSON file or choose from pre-built templates to
              create multiple workspaces at once.
            </p>
          </div>

          {/* Upload */}
          <Card
            className="border-dashed cursor-pointer hover:border-primary/60 transition-colors"
            onClick={() => fileInputRef.current?.click()}
          >
            <CardContent className="flex flex-col items-center justify-center py-8 gap-2">
              <Upload className="h-8 w-8 text-muted-foreground" />
              <p className="text-sm font-medium">Upload manifest JSON</p>
              <p className="text-xs text-muted-foreground">
                Version 2.0 migration manifest
              </p>
              {/* @dod:skip-primitive reason="bulk migration manifest JSON is parsed client-side to validate v2.0 schema before invoking migrate action; not a fileAttachments upload" */}
              <input
                ref={fileInputRef}
                type="file"
                accept=".json"
                className="hidden"
                onChange={handleFileUpload}
              />
            </CardContent>
          </Card>

          {/* Templates */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <LayoutTemplate className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-medium">Or use a template</span>
            </div>
            <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-3">
              {MIGRATION_TEMPLATES.map((tpl) => {
                const Icon = TEMPLATE_ICONS[tpl.icon] ?? Building2;
                const isSelected = selectedTemplateId === tpl.id;
                return (
                  <button
                    key={tpl.id}
                    onClick={() => handleSelectTemplate(tpl.id)}
                    className={`flex items-start gap-3 rounded-lg border p-3 text-left transition-colors hover:bg-accent ${
                      isSelected
                        ? "border-primary bg-primary/5"
                        : "border-border"
                    }`}
                  >
                    <div className="shrink-0 rounded-md border bg-background p-1.5">
                      <Icon className="h-4 w-4 text-muted-foreground" />
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <p className="text-sm font-medium">{tpl.name}</p>
                        <Badge
                          variant="secondary"
                          className="text-xs px-1.5 py-0"
                        >
                          {tpl.workspaceCount}{" "}
                          {tpl.workspaceCount === 1 ? "ws" : "ws"}
                        </Badge>
                      </div>
                      <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">
                        {tpl.description}
                      </p>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Loaded manifest indicator */}
          {manifestJson && (
            <div className="flex items-center gap-2 rounded-lg border border-green-200 bg-green-50 dark:bg-green-950/20 dark:border-green-900 px-3 py-2">
              <FileJson className="h-4 w-4 text-green-600 shrink-0" />
              <span className="text-sm text-green-700 dark:text-green-400 flex-1">
                {selectedTemplateId
                  ? `Template loaded: ${
                      MIGRATION_TEMPLATES.find(
                        (t) => t.id === selectedTemplateId
                      )?.name ?? selectedTemplateId
                    }`
                  : "Manifest file loaded"}
              </span>
              <button aria-label="Close"
                onClick={(e) => {
                  e.stopPropagation();
                  setManifestJson("");
                  setSelectedTemplateId(null);
                }}
                className="text-green-600 hover:text-green-800"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </div>
          )}

          <div className="flex justify-end">
            <Button
              onClick={handleValidate}
              disabled={!manifestJson || isValidating}
              className="gap-1.5"
            >
              {isValidating && (
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
              )}
              Validate Manifest
              <ChevronRight className="h-3.5 w-3.5" />
            </Button>
          </div>
        </div>
      )}

      {/* Step: Validate */}
      {step === "validate" && validationResult && (
        <div className="space-y-4">
          <div>
            <h3 className="font-semibold text-base">Validation Result</h3>
            <p className="text-sm text-muted-foreground mt-0.5">
              Review what will be created before proceeding.
            </p>
          </div>

          {validationResult.errors.length > 0 && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                <p className="font-medium mb-1">
                  {validationResult.errors.length} error
                  {validationResult.errors.length !== 1 ? "s" : ""} found:
                </p>
                <ul className="list-disc list-inside space-y-0.5 text-sm">
                  {validationResult.errors.map((e, i) => (
                    <li key={i}>{e}</li>
                  ))}
                </ul>
              </AlertDescription>
            </Alert>
          )}

          {validationResult.warnings.length > 0 && (
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                <p className="font-medium mb-1">
                  {validationResult.warnings.length} warning
                  {validationResult.warnings.length !== 1 ? "s" : ""}:
                </p>
                <ul className="list-disc list-inside space-y-0.5 text-sm">
                  {validationResult.warnings.map((w, i) => (
                    <li key={i}>{w}</li>
                  ))}
                </ul>
              </AlertDescription>
            </Alert>
          )}

          {validationResult.preview && (
            <WorkspaceHierarchyPreview preview={validationResult.preview} />
          )}

          <div className="flex justify-between">
            <Button variant="outline" onClick={() => setStep("source")}>
              Back
            </Button>
            {validationResult.valid && (
              <Button
                onClick={() => setStep("options")}
                className="gap-1.5"
              >
                Continue
                <ChevronRight className="h-3.5 w-3.5" />
              </Button>
            )}
          </div>
        </div>
      )}

      {/* Step: Options */}
      {step === "options" && (
        <div className="space-y-4">
          <div>
            <h3 className="font-semibold text-base">Migration Options</h3>
            <p className="text-sm text-muted-foreground mt-0.5">
              Configure how the migration should handle edge cases.
            </p>
          </div>

          <Card>
            <CardContent className="pt-4 space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label className="text-sm font-medium">
                    Auto-resolve slug conflicts
                  </Label>
                  <p className="text-xs text-muted-foreground">
                    Append a timestamp suffix if a workspace slug already exists
                  </p>
                </div>
                <Switch
                  checked={options.autoResolveSlugConflicts ?? true}
                  onCheckedChange={(v) =>
                    setOptions((o) => ({ ...o, autoResolveSlugConflicts: v }))
                  }
                />
              </div>

              <Separator />

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label className="text-sm font-medium">Import members</Label>
                  <p className="text-xs text-muted-foreground">
                    Create memberships and invitations for listed members
                  </p>
                </div>
                <Switch
                  checked={options.importMembers ?? false}
                  onCheckedChange={(v) =>
                    setOptions((o) => ({ ...o, importMembers: v }))
                  }
                />
              </div>

              <Separator />

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label className="text-sm font-medium">Dry run</Label>
                  <p className="text-xs text-muted-foreground">
                    Simulate the migration without creating any workspaces
                  </p>
                </div>
                <Switch
                  checked={options.dryRun ?? false}
                  onCheckedChange={(v) =>
                    setOptions((o) => ({ ...o, dryRun: v }))
                  }
                />
              </div>
            </CardContent>
          </Card>

          <div className="flex justify-between">
            <Button variant="outline" onClick={() => setStep("validate")}>
              Back
            </Button>
            <Button onClick={handleExecute} className="gap-1.5">
              {options.dryRun ? "Run Dry Run" : "Execute Migration"}
              <ChevronRight className="h-3.5 w-3.5" />
            </Button>
          </div>
        </div>
      )}

      {/* Step: Execute (loading) */}
      {step === "execute" && (
        <div className="flex flex-col items-center justify-center py-16 gap-4">
          <Loader2 className="h-10 w-10 animate-spin text-primary" />
          <div className="text-center">
            <p className="font-semibold">
              {options.dryRun ? "Simulating migration..." : "Creating workspaces..."}
            </p>
            <p className="text-sm text-muted-foreground mt-1">
              This may take a few seconds
            </p>
          </div>
        </div>
      )}

      {/* Step: Results */}
      {step === "results" && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-semibold text-base">Migration Results</h3>
              <p className="text-sm text-muted-foreground mt-0.5">
                {options.dryRun
                  ? "Dry run complete — no workspaces were created."
                  : "Migration complete."}
              </p>
            </div>
            <Button variant="outline" size="sm" onClick={handleReset}>
              New Migration
            </Button>
          </div>

          {error && !executionResult && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {executionResult && (
            <MigrationProgressLog
              result={executionResult}
              onRollback={
                !options.dryRun
                  ? (id) =>
                      rollbackMigration(id as any).then(() => handleReset())
                  : undefined
              }
              isRollingBack={isRollingBack}
            />
          )}
        </div>
      )}
    </div>
  );
}
