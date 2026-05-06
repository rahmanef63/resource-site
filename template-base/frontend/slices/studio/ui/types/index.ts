import type React from 'react';

export interface Position {
  x: number;
  y: number;
}

export interface NodeData {
  comp: string;
  props: Record<string, any>;
}

export interface CMSNode {
  id: string;
  type: string;
  position: Position;
  data: NodeData;
}

export interface CMSEdge {
  id: string;
  source: string;
  target: string;
  data?: {
    order?: number;
  };
  animated?: boolean;
}

export interface SchemaNode {
  type: string;
  props: Record<string, any>;
  children: string[];
}

/**
 * UI JSON Schema
 *
 * v0.4 → v0.5: added optional `metadata` block for name/description/author/tags.
 * All v0.4 documents (without metadata) remain valid — metadata is optional.
 */
export interface Schema {
  /** Schema version. "0.5" adds metadata; "0.4" is still accepted. */
  version: string;
  /** Top-level node IDs (page roots) */
  root: string[];
  /** All nodes keyed by stable ID */
  nodes: Record<string, SchemaNode>;
  /**
   * Optional project metadata.
   * Consistent with StudioProjectMetadata in workflow/schema/studio-unified.types.ts.
   */
  metadata?: {
    id?: string;
    name?: string;
    description?: string;
    author?: string;
    tags?: string[];
    version?: string;
    createdAt?: string;
    updatedAt?: string;
    /** Dynamic styles and links extracted from imported HTML */
    externalAssets?: {
      links?: string[]; // Stylesheet URLs
      styles?: string[]; // Raw CSS blocks
    };
  };
}

/** Widget category/key pair used by the Studio canvas renderer. Not to be confused with the workspace DB entity. */
export interface WorkspaceWidgetCategory {
  category: string;
  key: string;
}

/** @deprecated Use WorkspaceWidgetCategory. Kept for backward compatibility. */
export type Workspace = WorkspaceWidgetCategory;

export interface WidgetConfig {
  label: string;
  category: string;
  description?: string;
  icon?: React.ComponentType<any> | string;
  defaults: Record<string, any>;
  render: (props: Record<string, any>, children?: React.ReactNode, helpers?: any) => React.ReactNode;
  inspector?: {
    fields: InspectorField[];
  };
  autoConnect?: {
    [key: string]: {
      type: string;
      props?: Record<string, any>;
    };
  };
  previewImage?: string;
  tags?: string[];
  /** Hide from the Library panel (still renderable from saved schemas). */
  hidden?: boolean;
  /**
   * Named connection slots for widgets that accept children in specific panels.
   * e.g. twoColumn → [{id:'left',label:'Left'},{id:'right',label:'Right'}]
   * When defined, ShadcnNode renders one source handle per slot instead of
   * a single generic bottom handle.
   */
  slots?: { id: string; label: string }[];
  /**
   * "Explode" decomposition: converts this block/component into a tree of
   * primitive layout nodes so the user can customize individual parts.
   * Return a WidgetNode tree — the canvas will flatten it into nodes + edges.
   */
  explode?: (props: Record<string, any>) => WidgetNode;
}

/**
 * Recursive tree node used by `WidgetConfig.explode`.
 * Represents a single canvas node with optional children.
 */
export interface WidgetNode {
  type: string;
  props: Record<string, any>;
  children?: WidgetNode[];
}

export interface InspectorField {
  key: string;
  label: string;
  type:
    | 'text'
    | 'number'
    | 'select'
    | 'switch'
    | 'textarea'
    | 'custom'
    | 'nodeSelector'
    | 'slider'
    | 'color'
    | 'checkbox'
    | 'button'
    | 'buttonGroup'
    | 'range'
    | 'json';
  options?: string[];
  placeholder?: string;
  component?: React.ComponentType<any>;
  min?: number;
  max?: number;
  step?: number;
  buttonLabel?: string;
  buttonVariant?: 'default' | 'outline' | 'ghost' | 'destructive';
  onButtonClick?: () => void;
  buttons?: Array<{ value: string; label: string; icon?: React.ComponentType<any> }>;
  required?: boolean;
}

export interface ChildInfo {
  id: string;
  label: string;
  edgeId: string;
}

export interface LibraryTab {
  id: string;
  label: string;
  categories?: string[];
}
