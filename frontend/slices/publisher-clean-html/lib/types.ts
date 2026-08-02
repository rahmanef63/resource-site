// Publisher — generic, host-agnostic types.
//
// Instatic's engine is coupled to @core/page-tree + @core/module-engine. Here
// those become minimal generic shapes the consumer fills with their own node
// tree + module set, so the slice walks ANY tree and renders ANY module.

/** A control in a module's PropertySchema. `type` drives escapeProps dispatch. */
export interface PropertyControl {
  /** 'url' | 'image' | 'media' | 'richtext' | 'svg' | 'group' | (anything else). */
  type: string;
  /** For `type: 'group'` — nested controls (group is visual-only; keys stay flat). */
  children?: PropertySchema;
}

/** Per-module prop schema: key -> control. escapeProps escapes each prop by control.type. */
export type PropertySchema = Record<string, PropertyControl>;

/** Output of a module's pure render(). */
export interface ModuleRenderOutput {
  html: string;
  /** Emitted once per moduleId (deduped across all instances). */
  css?: string;
}

/**
 * A module: a pure render() + the schema escapeProps uses to escape its props.
 * `render` MUST be pure (no DOM, no React, no side effects) — given already-
 * escaped props + already-rendered children HTML, it returns an HTML string.
 */
export interface ModuleDefinition {
  id: string;
  schema?: PropertySchema;
  render(props: Record<string, unknown>, children: string[]): ModuleRenderOutput;
}

/** Module lookup by id. Build one with createModuleRegistry(defs). */
export interface ModuleRegistry {
  get(moduleId: string): ModuleDefinition | undefined;
}

/** One node in the tree. */
export interface PublishNode {
  id: string;
  moduleId: string;
  props?: Record<string, unknown>;
  /** Child node ids, in render order. */
  children?: string[];
  /** Author class names spliced onto the rendered root element. */
  classIds?: string[];
  /** Author inline styles merged onto the rendered root element (sanitised). */
  inlineStyles?: Record<string, unknown>;
  /** Hidden nodes (and their subtree) are pruned before render. */
  hidden?: boolean;
}

/** Flat node map + root id — the single tree primitive (pages, fragments). */
export interface NodeTree {
  nodes: Record<string, PublishNode>;
  rootNodeId: string;
}
