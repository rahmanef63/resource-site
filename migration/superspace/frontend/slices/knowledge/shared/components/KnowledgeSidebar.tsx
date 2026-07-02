"use client";

import { useState } from "react";
import type { Id } from "@convex/_generated/dataModel";
import { 
  BookOpen, FileText, User, Building2, Brain, 
  ChevronDown, ChevronRight, Plus, Loader2,
  File, FolderOpen
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import type { KnowledgeItemType } from "../types";
import { KNOWLEDGE_TYPE_CONFIG } from "../types";
import { useWorkspaceDocuments, type DocumentRecord } from "@/frontend/shared/documents";

const ICON_MAP = {
  Brain,
  FileText,
  User,
  Building2,
  BookOpen,
} as const;

interface KnowledgeSidebarProps {
  activeSection: KnowledgeItemType;
  onSectionChange: (section: KnowledgeItemType) => void;
  workspaceId: Id<"workspaces">;
  onDocumentSelect?: (documentId: Id<"documents">) => void;
  selectedDocumentId?: Id<"documents"> | null;
}

interface SidebarSection {
  type: KnowledgeItemType;
  config: typeof KNOWLEDGE_TYPE_CONFIG[KnowledgeItemType];
  isExpanded: boolean;
}

export function KnowledgeSidebar({
  activeSection,
  onSectionChange,
  workspaceId,
  onDocumentSelect,
  selectedDocumentId,
}: KnowledgeSidebarProps) {
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    article: true,
    document: true,
    'profile-data': false,
    'workspace-context': false,
  });

  // Fetch documents for the workspace
  const documents = useWorkspaceDocuments(workspaceId);
  const isLoading = documents === undefined;

  // Count documents (in a real app, you'd filter by document type/category)
  const documentCount = documents?.length ?? 0;

  const sections: SidebarSection[] = (Object.keys(KNOWLEDGE_TYPE_CONFIG) as KnowledgeItemType[]).map(type => ({
    type,
    config: KNOWLEDGE_TYPE_CONFIG[type],
    isExpanded: expandedSections[type] ?? false,
  }));

  const toggleSection = (type: KnowledgeItemType) => {
    setExpandedSections(prev => ({
      ...prev,
      [type]: !prev[type],
    }));
  };

  const handleSectionClick = (type: KnowledgeItemType) => {
    onSectionChange(type);
    if (!expandedSections[type]) {
      toggleSection(type);
    }
  };

  const getIcon = (iconName: string) => {
    const IconComponent = ICON_MAP[iconName as keyof typeof ICON_MAP];
    return IconComponent ? <IconComponent className="h-4 w-4" /> : <FileText className="h-4 w-4" />;
  };

  const getColorClass = (color: string) => {
    const colorMap: Record<string, string> = {
      purple: "text-purple-500",
      blue: "text-blue-500",
      green: "text-green-500",
      orange: "text-orange-500",
    };
    return colorMap[color] || "text-muted-foreground";
  };

  const getBgColorClass = (color: string) => {
    const colorMap: Record<string, string> = {
      purple: "bg-purple-500/10",
      blue: "bg-blue-500/10",
      green: "bg-green-500/10",
      orange: "bg-orange-500/10",
    };
    return colorMap[color] || "bg-muted";
  };

  // Get count for each section type
  const getSectionCount = (type: KnowledgeItemType): number => {
    switch (type) {
      case 'article':
      case 'document':
        // For now, show total documents in both sections
        // In future, filter by document category/type
        return documentCount;
      case 'profile-data':
        return 1; // Single profile
      case 'workspace-context':
        return 1; // Single workspace context
      default:
        return 0;
    }
  };

  // Render document items for article/document sections
  const renderDocumentItems = (type: KnowledgeItemType) => {
    if (type !== 'article' && type !== 'document') return null;
    
    if (isLoading) {
      return (
        <div className="flex items-center justify-center py-4">
          <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
        </div>
      );
    }

    if (!documents || documents.length === 0) {
      return (
        <div className="px-2 py-3 text-xs text-muted-foreground text-center">
          No documents yet.
          <br />
          <span className="text-primary cursor-pointer hover:underline">
            Create your first document
          </span>
        </div>
      );
    }

    // Show first 5 documents as preview
    const previewDocs: DocumentRecord[] = documents.slice(0, 5);
    const remainingCount = documents.length - 5;

    return (
      <div className="space-y-0.5">
        {previewDocs.map((doc: DocumentRecord) => (
          <Button
            key={doc._id}
            variant="ghost"
            size="sm"
            className={cn(
              "w-full justify-start gap-2 h-7 px-2 text-xs",
              selectedDocumentId === doc._id && "bg-accent"
            )}
            onClick={() => onDocumentSelect?.(doc._id)}
          >
            <File className="h-3 w-3 text-muted-foreground flex-shrink-0" />
            <span className="truncate flex-1 text-left">{doc.title}</span>
            {doc.isPublic && (
              <Badge variant="outline" className="h-4 px-1 text-[9px]">
                Public
              </Badge>
            )}
          </Button>
        ))}
        {remainingCount > 0 && (
          <p className="text-[10px] text-muted-foreground px-2 py-1">
            +{remainingCount} more documents
          </p>
        )}
      </div>
    );
  };

  return (
    <div className="flex h-full w-64 flex-col border-r bg-muted/30">
      {/* Header */}
      <div className="flex items-center justify-between border-b px-4 py-3">
        <div className="flex items-center gap-2">
          <BookOpen className="h-5 w-5" />
          <h2 className="font-semibold">Knowledge</h2>
        </div>
        <Button aria-label="Add" variant="ghost" size="icon" className="h-7 w-7">
          <Plus className="h-4 w-4" />
        </Button>
      </div>

      {/* Sections */}
      <ScrollArea className="flex-1">
        <div className="p-2 space-y-1">
          {sections.map(({ type, config, isExpanded }) => {
            const count = getSectionCount(type);
            
            return (
              <div key={type}>
                {/* Section Header */}
                <Button
                  variant="ghost"
                  size="sm"
                  className={cn(
                    "w-full justify-start gap-2 h-9",
                    activeSection === type && "bg-accent"
                  )}
                  onClick={() => handleSectionClick(type)}
                >
                  <span className={cn(
                    "h-6 w-6 rounded flex items-center justify-center",
                    getBgColorClass(config.color),
                    getColorClass(config.color)
                  )}>
                    {getIcon(config.icon)}
                  </span>
                  <span className="flex-1 text-left text-sm font-medium">{config.label}</span>
                  {count > 0 && (
                    <Badge variant="secondary" className="h-5 px-1.5 text-[10px]">
                      {count}
                    </Badge>
                  )}
                  <button aria-label="Expand"
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleSection(type);
                    }}
                    className="p-0.5 hover:bg-accent rounded"
                  >
                    {isExpanded ? (
                      <ChevronDown className="h-3 w-3 text-muted-foreground" />
                    ) : (
                      <ChevronRight className="h-3 w-3 text-muted-foreground" />
                    )}
                  </button>
                </Button>

                {/* Section Content */}
                {isExpanded && (
                  <div className="ml-4 mt-1 border-l pl-2">
                    {/* Description */}
                    <p className="text-[10px] text-muted-foreground px-2 py-1 mb-1">
                      {config.description}
                    </p>
                    
                    {/* AI Badge for AI-accessible sections */}
                    {config.aiDefault && (
                      <div className="flex items-center gap-1 px-2 py-1 mb-2">
                        <Brain className="h-3 w-3 text-purple-500" />
                        <span className="text-[10px] text-purple-500 font-medium">
                          AI can access this data
                        </span>
                      </div>
                    )}

                    {/* Document items for article/document sections */}
                    {(type === 'article' || type === 'document') && renderDocumentItems(type)}
                    
                    {/* Profile section content */}
                    {type === 'profile-data' && (
                      <Button
                        variant="ghost"
                        size="sm"
                        className="w-full justify-start gap-2 h-7 px-2 text-xs"
                        onClick={() => onSectionChange(type)}
                      >
                        <User className="h-3 w-3 text-muted-foreground" />
                        <span>Edit Profile Data</span>
                      </Button>
                    )}
                    
                    {/* Workspace context content */}
                    {type === 'workspace-context' && (
                      <Button
                        variant="ghost"
                        size="sm"
                        className="w-full justify-start gap-2 h-7 px-2 text-xs"
                        onClick={() => onSectionChange(type)}
                      >
                        <Building2 className="h-3 w-3 text-muted-foreground" />
                        <span>Edit Workspace Context</span>
                      </Button>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </ScrollArea>

      {/* Footer */}
      <div className="border-t p-3">
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <span>Total: {documentCount} documents</span>
          {isLoading && <Loader2 className="h-3 w-3 animate-spin" />}
        </div>
      </div>
    </div>
  );
}
