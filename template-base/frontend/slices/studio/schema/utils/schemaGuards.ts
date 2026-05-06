/**
 * schemaGuards — runtime type guards and shape checks for schema documents.
 * Re-exports from types/studio.ts plus adds utility helpers.
 */

export { isUiSchema, isUnifiedDocument } from "../types/studio";
import type { StudioUISchema } from "../types/studio";

/** Checks if the document has a recognisable Studio shape (either format). */
export function isAnyStudioDocument(doc: unknown): boolean {
  if (typeof doc !== "object" || doc === null) return false;
  // UI-only
  if ("root" in doc && "nodes" in doc && "version" in doc) return true;
  // Unified
  if ("studioVersion" in doc && "kind" in doc && "metadata" in doc) return true;
  return false;
}

/** Returns the embedded UI schema from a document, or null if absent. */
export function extractUiSchema(doc: unknown): StudioUISchema | null {
  if (typeof doc !== "object" || doc === null) return null;
  const d = doc as Record<string, unknown>;
  // UI-only
  if ("root" in d && "nodes" in d) return d as unknown as StudioUISchema;
  // Unified with embedded ui section
  if ("studioVersion" in d && typeof d.ui === "object" && d.ui !== null) {
    return d.ui as StudioUISchema;
  }
  return null;
}
