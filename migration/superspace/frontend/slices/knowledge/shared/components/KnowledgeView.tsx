"use client";

import { useState } from "react";
import type { Id } from "@convex/_generated/dataModel";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";
import { KnowledgeSidebar } from "./KnowledgeSidebar";
import type { KnowledgeItemType, DocumentEditorMode } from "../types";

// Import the documents view for document/article sections
import { DocumentsView } from "@/frontend/shared/documents";

// Import profile from knowledge feature
import { ProfileDataForm } from "@/frontend/slices/knowledge/features/profile/components/ProfileDataForm";

// Import workspace context page
import WorkspaceContextPage from "@/frontend/slices/knowledge/features/workspace-context/page";

import { useIsMobile } from "@/hooks/use-mobile";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { KNOWLEDGE_TYPE_CONFIG } from "../types";

interface KnowledgeViewProps {
  workspaceId: Id<"workspaces"> | null;
  editorMode?: DocumentEditorMode;
  initialSection?: KnowledgeItemType;
}

export function KnowledgeView({
  workspaceId,
  editorMode = "block",
  initialSection = "article",
}: KnowledgeViewProps) {
  const [activeSection, setActiveSection] = useState<KnowledgeItemType>(initialSection);
  const isMobile = useIsMobile();


  if (!workspaceId) {
    return (
      <div className="flex h-full items-center justify-center p-6">
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            No workspace selected. Please select a workspace to manage knowledge.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  const renderContent = () => {
    switch (activeSection) {
      case "article":
        // Knowledge base articles - using documents with knowledge base filter
        return (
          <div className="h-full">
            <DocumentsView
              workspaceId={workspaceId}
              editorMode={editorMode}
              storageKey="knowledge-articles"
            />
          </div>
        );

      case "document":
        // Regular documents
        return (
          <div className="h-full">
            <DocumentsView
              workspaceId={workspaceId}
              editorMode={editorMode}
              storageKey="knowledge-documents"
            />
          </div>
        );

      case "profile-data":
        // User profile data for AI context
        return (
          <div className="h-full overflow-auto">
            <ProfileDataForm />
          </div>
        );

      case "workspace-context":
        // Workspace context for AI
        return (
          <div className="h-full overflow-auto">
            <WorkspaceContextPage workspaceId={workspaceId} />
          </div>
        );

      default:
        return null;
    }
  };

  if (isMobile) {
    return (
      <div className="flex flex-col h-full bg-background">
        <div className="flex items-center gap-2 p-2 border-b bg-muted/10 shrink-0">
          <span className="text-xs font-medium text-muted-foreground ml-1">Section:</span>
          <Select
            value={activeSection}
            onValueChange={(v) => setActiveSection(v as KnowledgeItemType)}
          >
            <SelectTrigger className="h-8 text-sm bg-background">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {(Object.keys(KNOWLEDGE_TYPE_CONFIG) as KnowledgeItemType[]).map((type) => (
                <SelectItem key={type} value={type}>
                  <div className="flex items-center gap-2">
                    <span>{KNOWLEDGE_TYPE_CONFIG[type].label}</span>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="flex-1 overflow-hidden">
          {renderContent()}
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-full">
      {/* Secondary Sidebar */}
      <KnowledgeSidebar
        activeSection={activeSection}
        onSectionChange={setActiveSection}
        workspaceId={workspaceId}
      />

      {/* Main Content */}
      <div className="flex-1 overflow-hidden">
        {renderContent()}
      </div>
    </div>
  );
}
