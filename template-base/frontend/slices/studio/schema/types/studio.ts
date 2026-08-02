/**
 * studio.ts — Document-level TypeScript types for the Studio validation system.
 *
 * These types represent the full shape of documents that flow through the
 * validation pipeline (UI-only and Studio Unified).
 */

import type { StudioUISchema } from "@/frontend/slices/studio/ui/types/StudioUISchema";
import type { StudioProjectMetadata } from "@/frontend/slices/studio/workflow/schema/studio-unified.types";

// ─────────────────────────────────────────────────────────────────────────────
// Re-export base types
// ─────────────────────────────────────────────────────────────────────────────

export type { StudioUISchema } from "@/frontend/slices/studio/ui/types/StudioUISchema";
export type { StudioProjectMetadata } from "@/frontend/slices/studio/workflow/schema/studio-unified.types";

// ─────────────────────────────────────────────────────────────────────────────
// Studio Unified Document
// ─────────────────────────────────────────────────────────────────────────────

/** Document kind discriminator. */
export type StudioDocumentKind = "ui-layout" | "workflow" | "unified";

/**
 * Studio Unified Document v1.0
 *
 * Encompasses UI layout, automation flow, or both.
 * This is the top-level format produced by the export pipeline.
 */
export interface StudioUnifiedDocument {
  $schema?: string;
  studioVersion: "1.0";
  kind: StudioDocumentKind;
  metadata: StudioProjectMetadata;
  /** UI schema section (present for kind: "ui-layout" | "unified"). */
  ui?: StudioUISchema;
  /** Flow section (present for kind: "workflow" | "unified"). */
  flow?: unknown;
}

/**
 * Union type covering both standalone UI schemas and full unified documents.
 */
export type AnyStudioDocument = StudioUISchema | StudioUnifiedDocument;

// ─────────────────────────────────────────────────────────────────────────────
// Type guards
// ─────────────────────────────────────────────────────────────────────────────

export function isUnifiedDocument(doc: unknown): doc is StudioUnifiedDocument {
  return (
    typeof doc === "object" &&
    doc !== null &&
    "studioVersion" in doc &&
    (doc as StudioUnifiedDocument).studioVersion === "1.0"
  );
}

export function isUiSchema(doc: unknown): doc is StudioUISchema {
  return (
    typeof doc === "object" &&
    doc !== null &&
    "version" in doc &&
    "root" in doc &&
    "nodes" in doc &&
    !("studioVersion" in doc)
  );
}
