/**
 * normalizeUiSchema — full normalisation pipeline for a UI-only schema.
 *
 * Pipeline:
 *   1. Migrate v0.4 documents (if needed)
 *   2. Normalise each node's props (aliases, t-shirt sizes)
 */

import type { NormaliseResult } from "../types/validator";
import type { StudioUISchema } from "../types/studio";
import { migrateV04ToV05 } from "./migrateV04ToV05";
import { normalizeNodeProps } from "./normalizeNodeProps";

export function normalizeUiSchema(
  raw: unknown,
  mode: "strict" | "lenient" = "lenient"
): NormaliseResult<StudioUISchema> {
  const allErrors: NormaliseResult["errors"] = [];
  const allWarnings: NormaliseResult["warnings"] = [];

  if (typeof raw !== "object" || raw === null) {
    return {
      document: null,
      errors: [{
        code: "INVALID_TOP_LEVEL_SHAPE",
        path: "/",
        message: "Document must be a JSON object.",
        severity: "error",
      }],
      warnings: [],
    };
  }

  let doc = JSON.parse(JSON.stringify(raw)) as Record<string, unknown>;

  // Step 1: v0.4 migration
  if (doc.version === "0.4") {
    const { document: migrated, warnings } = migrateV04ToV05(doc);
    doc = migrated;
    allWarnings.push(...warnings);
  }

  // Step 2: node prop normalisation
  const nodes = doc.nodes;
  if (typeof nodes === "object" && nodes !== null && !Array.isArray(nodes)) {
    for (const [id, rawNode] of Object.entries(nodes as Record<string, unknown>)) {
      if (typeof rawNode !== "object" || rawNode === null) continue;
      const node = rawNode as Record<string, unknown>;
      const rawProps = (typeof node.props === "object" && node.props !== null)
        ? (node.props as Record<string, unknown>)
        : {};
      const nodeType = typeof node.type === "string" ? node.type : undefined;
      const { props, issues } = normalizeNodeProps(id, rawProps, mode, nodeType);
      node.props = props;
      for (const issue of issues) {
        if (issue.severity === "error") allErrors.push(issue);
        else allWarnings.push(issue);
      }
    }
  }

  return {
    document: doc as unknown as StudioUISchema,
    errors: allErrors,
    warnings: allWarnings,
  };
}
