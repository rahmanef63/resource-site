"use client";

import type { Id } from "@convex/_generated/dataModel";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle, FileText, Plus } from "lucide-react";
import { DocumentsView } from "@/frontend/shared/documents";
import { FeatureHeader } from "@/frontend/shared/ui/layout/header";
import { FeatureExportImport } from "@/frontend/shared/foundation/utils/data";
import type { DocumentEditorMode } from "@/frontend/shared/documents";
import { useSearchParams } from "next/navigation";

interface DocumentsFeaturePageProps {
  workspaceId?: Id<"workspaces"> | null;
  editorMode?: DocumentEditorMode;
  initialTab?: "workspace" | "database";
  /** Hide header when used inside Knowledge feature */
  hideHeader?: boolean;
}

export default function DocumentsFeaturePage({
  workspaceId,
  editorMode = "block",
  hideHeader = false,
}: DocumentsFeaturePageProps) {
  const searchParams = useSearchParams();
  const docIdParam = searchParams.get("docId");
  const initialDocumentId = (docIdParam && docIdParam.length > 0 ? (docIdParam as Id<"documents">) : null);

  if (!workspaceId) {
    return (
      <div className="flex h-full items-center justify-center p-6">
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            No workspace selected. Please select a workspace to manage documents.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full overflow-hidden">
      {/* Documents View */}
      <div className="flex-1 min-h-0">
        <DocumentsView
          key={initialDocumentId ?? "documents"}
          workspaceId={workspaceId}
          editorMode={editorMode}
          initialDocumentId={initialDocumentId}
        />
      </div>
    </div>
  );
}
