/**
 * normalizeStudioDocument — top-level normaliser.
 *
 * Detects whether the input is a UI-only schema or a Studio Unified document
 * and dispatches to the appropriate normaliser.
 */

import type { NormaliseResult, ValidationMode } from "../types/validator";
import type { AnyStudioDocument } from "../types/studio";
import { isUiSchema, isUnifiedDocument } from "../types/studio";
import { normalizeUiSchema } from "./normalizeUiSchema";

export function normalizeStudioDocument(
  input: unknown,
  mode: ValidationMode = "lenient"
): NormaliseResult<AnyStudioDocument> {
  const nodeMode = mode;

  if (isUiSchema(input) || (typeof input === "object" && input !== null && "root" in input && "nodes" in input)) {
    const result = normalizeUiSchema(input, nodeMode);
    return {
      document: result.document as AnyStudioDocument | null,
      errors: result.errors,
      warnings: result.warnings,
    };
  }

  if (isUnifiedDocument(input)) {
    const errors: NormaliseResult["errors"] = [];
    const warnings: NormaliseResult["warnings"] = [];

    // Normalise the embedded ui section if present
    if (typeof input.ui !== "undefined") {
      const uiResult = normalizeUiSchema(input.ui, nodeMode);
      errors.push(...uiResult.errors);
      warnings.push(...uiResult.warnings);
      return {
        document: { ...input, ui: uiResult.document } as AnyStudioDocument,
        errors,
        warnings,
      };
    }

    return { document: input, errors, warnings };
  }

  return {
    document: null,
    errors: [{
      code: "INVALID_TOP_LEVEL_SHAPE",
      path: "/",
      message: "Input is not a recognised Studio document. Expected a UI schema (root/nodes) or unified document (studioVersion).",
      severity: "error",
    }],
    warnings: [],
  };
}
