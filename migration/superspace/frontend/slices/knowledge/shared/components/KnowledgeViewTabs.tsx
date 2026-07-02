"use client";

import { useState } from "react";
import type { Id } from "@convex/_generated/dataModel";
import { cn } from "@/lib/utils";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { 
  AlertCircle, 
  BookOpen, 
  FileText, 
  User, 
  Building2,
  Brain,
  Sparkles
} from "lucide-react";
import { useQuery } from "convex/react";
import { api } from "@/frontend/shared/foundation/utils/convex/any-api";
import type { DocumentEditorMode } from "../types";

// Shared UI imports
import { FeatureHeader } from "@/frontend/shared/ui/layout/header";

// Import the documents view for document/article sections
import { DocumentsView } from "@/frontend/shared/documents";

// Import profile from knowledge feature
import { ProfileDataForm } from "@/frontend/slices/knowledge/features/profile/components/ProfileDataForm";

// Import workspace context page
import WorkspaceContextPage from "@/frontend/slices/knowledge/features/workspace-context/page";

type KnowledgeTab = "articles" | "documents" | "profile" | "workspace";

interface KnowledgeViewProps {
  workspaceId: Id<"workspaces"> | null;
  editorMode?: DocumentEditorMode;
  initialTab?: KnowledgeTab;
}

export function KnowledgeViewTabs({
  workspaceId,
  editorMode = "block",
  initialTab = "articles",
}: KnowledgeViewProps) {
  const [activeTab, setActiveTab] = useState<KnowledgeTab>(initialTab);

  // Get document counts for badges
  const documentCounts = useQuery(
    api["features/knowledge/api/knowledgeForAI"].getDocumentCounts,
    workspaceId ? { workspaceId } : undefined
  );

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

  return (
    <div className="flex flex-col h-full overflow-hidden">
      {/* Feature Header - Using shared UI */}
      <div className="flex-shrink-0 border-b">
        <FeatureHeader
          icon={Brain}
          title="Knowledge Base"
          subtitle="Manage documents, articles, and AI context"
          badge={{
            text: "AI Context",
            variant: "secondary",
            icon: Sparkles,
          }}
          meta={[
            { 
              label: "Items", 
              value: String(documentCounts?.total ?? 0),
            },
          ]}
        />
      </div>

      {/* Tabs Navigation */}
      <Tabs 
        value={activeTab} 
        onValueChange={(v) => setActiveTab(v as KnowledgeTab)}
        className="flex-1 flex flex-col min-h-0"
      >
        <div className="flex-shrink-0 border-b bg-muted/30 w-full">
          <TabsList className="w-full justify-evenly h-auto p-0 bg-transparent rounded-none px-4">
            <TabsTrigger
              value="articles"
              className={cn(
                "relative px-4 py-3 rounded-none border-b-2 border-transparent",
                "data-[state=active]:border-primary data-[state=active]:bg-background",
                "flex items-center gap-2"
              )}
            >
              <BookOpen className="h-4 w-4" />
              <span>Articles</span>
              {documentCounts?.articles !== undefined && documentCounts.articles > 0 && (
                <Badge variant="secondary" className="h-5 px-1.5 text-xs">
                  {documentCounts.articles}
                </Badge>
              )}
            </TabsTrigger>
            
            <TabsTrigger
              value="documents"
              className={cn(
                "relative px-4 py-3 rounded-none border-b-2 border-transparent",
                "data-[state=active]:border-primary data-[state=active]:bg-background",
                "flex items-center gap-2"
              )}
            >
              <FileText className="h-4 w-4" />
              <span>Documents</span>
              {documentCounts?.documents !== undefined && documentCounts.documents > 0 && (
                <Badge variant="secondary" className="h-5 px-1.5 text-xs">
                  {documentCounts.documents}
                </Badge>
              )}
            </TabsTrigger>
            
            <TabsTrigger
              value="profile"
              className={cn(
                "relative px-4 py-3 rounded-none border-b-2 border-transparent",
                "data-[state=active]:border-primary data-[state=active]:bg-background",
                "flex items-center gap-2"
              )}
            >
              <User className="h-4 w-4" />
              <span>My Profile</span>
            </TabsTrigger>
            
            <TabsTrigger
              value="workspace"
              className={cn(
                "relative px-4 py-3 rounded-none border-b-2 border-transparent",
                "data-[state=active]:border-primary data-[state=active]:bg-background",
                "flex items-center gap-2"
              )}
            >
              <Building2 className="h-4 w-4" />
              <span>Workspace</span>
            </TabsTrigger>
          </TabsList>
        </div>

        {/* Tab Contents */}
        <TabsContent value="articles" className="flex-1 m-0 min-h-0">
          <DocumentsView 
            workspaceId={workspaceId} 
            editorMode={editorMode}
            storageKey="knowledge-articles"
            category="article"
          />
        </TabsContent>

        <TabsContent value="documents" className="flex-1 m-0 min-h-0">
          <DocumentsView 
            workspaceId={workspaceId} 
            editorMode={editorMode}
            storageKey="knowledge-documents"
            category="document"
          />
        </TabsContent>

        <TabsContent value="profile" className="flex-1 m-0 overflow-auto">
          <ProfileDataForm />
        </TabsContent>

        <TabsContent value="workspace" className="flex-1 m-0 overflow-auto">
          <WorkspaceContextPage workspaceId={workspaceId} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
