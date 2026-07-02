"use client";

import type { Id } from "@convex/_generated/dataModel";
import { PageContainer } from "@/frontend/shared/ui/layout/container";
import { DocumentsView, type DocumentEditorMode } from "@/frontend/shared/documents";

export interface ArticlesPageProps {
  workspaceId?: Id<"workspaces"> | null;
  editorMode?: DocumentEditorMode;
}

/**
 * ArticlesPage - Knowledge Base Articles
 * 
 * Uses DocumentsView with category="article" to filter and create
 * knowledge base articles specifically intended for:
 * - AI consumption and context
 * - Team documentation
 * - Structured guides and tutorials
 */
export default function ArticlesPage({ workspaceId, editorMode = "block" }: ArticlesPageProps) {
  if (!workspaceId) {
    return (
      <PageContainer maxWidth="full" padding={true} className="h-full">
        <div className="flex items-center justify-center h-full">
          <p className="text-muted-foreground">
            Please select a workspace to view knowledge base articles.
          </p>
        </div>
      </PageContainer>
    );
  }

  return (
    <PageContainer maxWidth="full" padding={false} className="h-full">
      <DocumentsView 
        workspaceId={workspaceId} 
        editorMode={editorMode}
        storageKey="knowledge-articles"
        category="article"
      />
    </PageContainer>
  );
}
