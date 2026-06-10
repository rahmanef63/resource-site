"use client";

import { useState, useRef, useCallback } from "react";
import { useConvexAuth, useMutation } from "convex/react";
import { api } from "@convex/_generated/api";
import { useAuth } from "@/frontend/shared/foundation/auth";
import { Upload, FileJson, AlertCircle, CheckCircle2, ArrowLeft, Loader2, PenLine } from "lucide-react";
import { OnboardingProgress } from "./OnboardingProgress";
import { OnboardingStep } from "./OnboardingStep";
import { useWorkspaceExportImport } from "@/frontend/shared/foundation/hooks/useWorkspaceExportImport";
import type { OnboardingProgressStep } from "./types";
import type { OnboardingData } from "../types";
import type { OnboardingFlowProps } from "./types";

type Mode = "choose" | "manual" | "import";

export function OnboardingFlow({ onComplete, variant = "page" }: OnboardingFlowProps) {
  const [mode, setMode] = useState<Mode>("choose");
  const [currentStep, setCurrentStep] = useState(0);
  const [workspaceData, setWorkspaceData] = useState<OnboardingData>({
    name: "",
    type: "personal",
    description: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [importName, setImportName] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { isSignedIn } = useAuth();
  const { isAuthenticated: isConvexAuthenticated, isLoading: isConvexLoading } = useConvexAuth();

  const createWorkspace = useMutation(api.workspace.workspaces.createWorkspace);

  const {
    isImporting,
    validationResult,
    error: importError,
    fileName: importFileName,
    readFile,
    validateImportJson,
    importWorkspace: doImport,
    reset: resetImport,
  } = useWorkspaceExportImport();

  const steps = [
    {
      id: "welcome",
      label: "Welcome",
      title: "Welcome to Your Workspace",
      description: "Let's set up your first workspace to get started",
    },
    {
      id: "details",
      label: "Details",
      title: "Workspace Details",
      description: "Tell us about your workspace",
    },
    {
      id: "features",
      label: "Features",
      title: "Choose Features",
      description: "Select the features you want to enable",
    },
  ];
  const progressSteps: OnboardingProgressStep[] = steps.map(({ id, label }) => ({ id, label }));

  // ── Manual flow ────────────────────────────────────────────────────────────

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setSubmitError(null);
      setCurrentStep(currentStep + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 0 && !isSubmitting) {
      setSubmitError(null);
      setCurrentStep(currentStep - 1);
    }
  };

  const handleComplete = async () => {
    if (!isSignedIn) {
      setSubmitError("You need to sign in before creating a workspace.");
      return;
    }
    if (isConvexLoading || !isConvexAuthenticated) {
      setSubmitError("Authentication is still loading. Please wait a moment and try again.");
      return;
    }

    setSubmitError(null);
    setIsSubmitting(true);

    const slugify = (s: string) =>
      String(s || "")
        .trim()
        .toLowerCase()
        .replace(/[^a-z0-9\-\s]/g, "")
        .replace(/\s+/g, "")
        .replace(/-+/g, "")
        .replace(/^-|-$/g, "");

    const base = slugify(workspaceData.name) || "workspace";

    let attempt = 0;
    while (attempt < 10) {
      const candidate = attempt === 0 ? base : `${base}-${attempt + 1}`;
      try {
        const workspaceId = await createWorkspace({
          name: workspaceData.name,
          slug: candidate,
          type: workspaceData.type,
          description: workspaceData.description,
          isPublic: false,
        });
        onComplete(workspaceId);
        setIsSubmitting(false);
        return;
      } catch (error) {
        const msg = error instanceof Error ? error.message : String(error);
        const duplicate = msg.includes("slug already exists") || (msg.includes("slug") && msg.includes("exists"));
        const unauthenticated = msg.toLowerCase().includes("not authenticated");
        if (unauthenticated) {
          setSubmitError("Authentication expired. Please sign in again and retry.");
          break;
        }
        if (!duplicate) {
          setSubmitError("We couldn't create the workspace. Please try again.");
          break;
        }
        attempt += 1;
      }
    }

    setIsSubmitting(false);
  };

  // ── Import flow ────────────────────────────────────────────────────────────

  const handleImportFileChange = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const json = await readFile(file);
    validateImportJson(json);
  }, [readFile, validateImportJson]);

  const handleDoImport = useCallback(async () => {
    try {
      const summary = await doImport({
        overrideName: importName.trim() || undefined,
        importMembers: false,
      });
      onComplete(summary.workspaceId);
    } catch {
      // error shown via importError state
    }
  }, [doImport, importName, onComplete]);

  // ── Render helpers ─────────────────────────────────────────────────────────

  const choosePanel = (
    <div className="space-y-6">
      <div className="text-center">
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
          <div className="h-8 w-8 rounded-full bg-primary" />
        </div>
        <h2 className="mb-2 text-2xl font-bold">Welcome to SuperSpace</h2>
        <p className="text-muted-foreground">How would you like to set up your workspace?</p>
      </div>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <button
          onClick={() => setMode("manual")}
          className="flex flex-col items-start gap-2 rounded-lg border-2 border-border p-4 text-left transition-colors hover:border-primary hover:bg-primary/5"
        >
          <div className="flex h-10 w-10 items-center justify-center rounded-md border bg-background">
            <PenLine className="h-5 w-5 text-muted-foreground" />
          </div>
          <div>
            <p className="font-semibold text-sm">Set up manually</p>
            <p className="text-xs text-muted-foreground mt-0.5">
              Choose a name, type, and features step by step
            </p>
          </div>
        </button>

        <button
          onClick={() => setMode("import")}
          className="flex flex-col items-start gap-2 rounded-lg border-2 border-border p-4 text-left transition-colors hover:border-primary hover:bg-primary/5"
        >
          <div className="flex h-10 w-10 items-center justify-center rounded-md border bg-background">
            <Upload className="h-5 w-5 text-muted-foreground" />
          </div>
          <div>
            <p className="font-semibold text-sm">Import from file</p>
            <p className="text-xs text-muted-foreground mt-0.5">
              Restore or clone from an existing workspace export
            </p>
          </div>
        </button>
      </div>
    </div>
  );

  const importPanel = (
    <div className="space-y-4">
      <button
        onClick={() => { setMode("choose"); resetImport(); setImportName(""); }}
        className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="h-3.5 w-3.5" /> Back
      </button>

      <div>
        <h2 className="text-xl font-bold">Import Workspace</h2>
        <p className="text-sm text-muted-foreground mt-1">
          Upload a workspace export JSON file to restore or clone an existing workspace.
        </p>
      </div>

      {/* File upload */}
      {!importFileName ? (
        <div
          onClick={() => fileInputRef.current?.click()}
          className="flex flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed p-8 cursor-pointer hover:border-primary/50 transition-colors"
        >
          <Upload className="h-8 w-8 text-muted-foreground" />
          <p className="text-sm font-medium">Click to upload workspace JSON</p>
          <p className="text-xs text-muted-foreground">Export file from another workspace</p>
          <input
            ref={fileInputRef}
            type="file"
            accept=".json"
            className="hidden"
            onChange={handleImportFileChange}
          />
        </div>
      ) : (
        <div className="flex items-center gap-2 rounded-lg border bg-muted/30 px-3 py-2">
          <FileJson className="h-4 w-4 text-muted-foreground shrink-0" />
          <span className="text-sm flex-1 truncate">{importFileName}</span>
          <button onClick={() => { resetImport(); setImportName(""); }} className="text-muted-foreground hover:text-foreground text-lg leading-none">×</button>
        </div>
      )}

      {/* Validation */}
      {validationResult && (
        validationResult.errors.length > 0 ? (
          <div className="rounded-lg border border-destructive/50 bg-destructive/10 p-3 text-sm text-destructive">
            <p className="font-medium mb-1">Validation errors:</p>
            {validationResult.errors.map((e, i) => <div key={i}>• {e}</div>)}
          </div>
        ) : (
          <div className="rounded-lg border bg-muted/30 p-3 space-y-1.5">
            <div className="flex items-center gap-1.5 text-sm font-medium text-green-600">
              <CheckCircle2 className="h-4 w-4" />
              {validationResult.preview?.workspaceName} — valid
            </div>
            <div className="flex gap-2 flex-wrap text-xs text-muted-foreground">
              <span className="rounded border px-1.5 py-0.5">{validationResult.preview?.workspaceType}</span>
              <span className="rounded border px-1.5 py-0.5">{validationResult.preview?.rolesCount} roles</span>
              {(validationResult.preview?.enabledFeaturesCount ?? 0) > 0 && (
                <span className="rounded border px-1.5 py-0.5">{validationResult.preview?.enabledFeaturesCount} features</span>
              )}
            </div>
          </div>
        )
      )}

      {/* Optional name override */}
      {validationResult?.valid && (
        <div className="space-y-1">
          <label className="block text-sm font-medium">Workspace name (optional)</label>
          <input
            type="text"
            value={importName}
            onChange={(e) => setImportName(e.target.value)}
            placeholder={validationResult.preview?.workspaceName ?? "Keep original name"}
            className="w-full rounded-lg border border-input px-3 py-2 text-sm focus:border-ring focus:ring-2 focus:ring-ring"
          />
        </div>
      )}

      {importError && (
        <div className="flex items-center gap-2 rounded-lg border border-destructive/50 bg-destructive/10 p-3 text-sm text-destructive">
          <AlertCircle className="h-4 w-4 shrink-0" />
          {importError}
        </div>
      )}

      <button
        onClick={handleDoImport}
        disabled={!validationResult?.valid || isImporting}
        className="w-full rounded-lg bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground disabled:opacity-50 flex items-center justify-center gap-2"
      >
        {isImporting && <Loader2 className="h-4 w-4 animate-spin" />}
        Import Workspace
      </button>
    </div>
  );

  // ── Manual flow wrapper ────────────────────────────────────────────────────

  const manualContent = (
    <>
      <div className="mb-4 flex items-center gap-2">
        <button
          onClick={() => setMode("choose")}
          className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-3.5 w-3.5" /> Back
        </button>
      </div>
      <OnboardingProgress currentStep={currentStep} steps={progressSteps} />
      <div className="mt-6">
        <OnboardingStep
          step={currentStep}
          stepData={steps[currentStep]}
          workspaceData={workspaceData}
          onDataChange={setWorkspaceData}
          onNext={handleNext}
          onBack={handleBack}
          onComplete={handleComplete}
          isLastStep={currentStep === steps.length - 1}
          isFirstStep={currentStep === 0}
          isSubmitting={isSubmitting}
          errorMessage={submitError}
        />
      </div>
    </>
  );

  const content =
    mode === "choose" ? choosePanel :
    mode === "import" ? importPanel :
    manualContent;

  if (variant === "dialog") {
    return (
      <div className="w-full">
        {content}
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 p-4">
      <div className="w-full max-w-2xl">
        <div className="rounded-lg border border-gray-200 bg-background p-8 shadow-sm">
          {content}
        </div>
      </div>
    </div>
  );
}
