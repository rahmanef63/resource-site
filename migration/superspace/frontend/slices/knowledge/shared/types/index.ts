import type { Id } from "@convex/_generated/dataModel";

// ============================================
// Knowledge Item Types
// ============================================

/**
 * Type of knowledge item - determines how it's displayed and used
 */
export type KnowledgeItemType = 
  | 'article'          // Knowledge base article (AI-consumable)
  | 'document'         // Regular document
  | 'profile-data'     // User profile information
  | 'workspace-context' // Workspace/team context

/**
 * Visual configuration for each knowledge item type
 */
export const KNOWLEDGE_TYPE_CONFIG = {
  article: {
    icon: 'Brain',
    color: 'purple',
    label: 'Knowledge Base',
    description: 'Structured articles and guides for AI and team consumption',
    aiDefault: true,
  },
  document: {
    icon: 'FileText',
    color: 'blue',
    label: 'Documents',
    description: 'Personal notes, drafts, and meeting notes',
    aiDefault: false,
  },
  'profile-data': {
    icon: 'User',
    color: 'green',
    label: 'Profile',
    description: 'User context, skills, and preferences',
    aiDefault: true,
  },
  'workspace-context': {
    icon: 'Building2',
    color: 'orange',
    label: 'Workspace',
    description: 'Team/project context for AI understanding',
    aiDefault: true,
  },
} as const

// ============================================
// Document Types (from documents feature)
// ============================================

export interface DocumentAuthor {
  name?: string | null;
  image?: string | null;
}

export interface DocumentRecord {
  _id: Id<"documents">;
  title: string;
  content?: string | null;
  isPublic: boolean;
  parentId?: Id<"documents"> | null;
  workspaceId: Id<"workspaces">;
  createdBy: Id<"users">;
  _creationTime: number;
  lastModified?: number | null;
  author?: DocumentAuthor | null;
  isPinned?: boolean;
  isStarred?: boolean;
  tags?: string[];
}

export type DocumentEditorMode = "block" | "tiptap";

export type DocumentSortField = "created" | "modified" | "name";
export type DocumentSortOrder = "asc" | "desc";

export interface DocumentSortOptions {
  field: DocumentSortField;
  order: DocumentSortOrder;
}

export interface DocumentBrowserFilters {
  query?: string;
  visibility?: "all" | "private" | "public";
}

export interface DocumentStats {
  total: number;
  publicCount: number;
  privateCount: number;
  lastUpdated?: number;
}

export interface DocumentManagerOptions {
  workspaceId?: Id<"workspaces"> | null;
  initialDocumentId?: Id<"documents"> | null;
  editorMode?: DocumentEditorMode;
}

export interface DocumentManagerState {
  selectedDocumentId: Id<"documents"> | null;
  createOpen: boolean;
}

export type DocumentListItem = DocumentRecord;

// ============================================
// Knowledge View Types
// ============================================

export interface KnowledgeViewProps {
  workspaceId: Id<"workspaces"> | null;
  editorMode?: DocumentEditorMode;
  initialTab?: KnowledgeItemType;
}

export interface KnowledgeSidebarItem {
  id: string;
  type: KnowledgeItemType;
  title: string;
  icon?: string;
  children?: KnowledgeSidebarItem[];
  isAIAccessible?: boolean;
}

export interface KnowledgeSidebarSection {
  type: KnowledgeItemType;
  label: string;
  icon: string;
  color: string;
  items: KnowledgeSidebarItem[];
  isExpanded: boolean;
}
