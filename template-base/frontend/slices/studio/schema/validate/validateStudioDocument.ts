/**
 * validateStudioDocument — unified entry point for all Studio document types.
 *
 * Detects document type (UI-only vs Studio Unified) and dispatches
 * to the appropriate pipeline.
 *
 * Usage:
 *   const result = validateStudioDocument(rawInput, { mode: "lenient", normalize: true });
 *   if (!result.valid) console.error(result.errors);
 */

import type { AnyStudioDocument } from "../types/studio";
import type { StudioValidationResult, ValidateOptions } from "../types/validator";
import { isUiSchema, isUnifiedDocument } from "../types/studio";
import { validateUiSchema } from "./validateUiSchema";
import { validateStudioWithAjv } from "./validateWithAjv";
import { normalizeStudioDocument } from "../normalize/normalizeStudioDocument";

export function validateStudioDocument(
  input: unknown,
  options: ValidateOptions = {}
): StudioValidationResult<AnyStudioDocument> {
  const mode = options.mode ?? "strict";
  const doNormalize = options.normalize ?? (mode === "lenient");

  // ── Normalise (optional) ──────────────────────────────────────────────────
  let workingInput = input;
  const normWarnings: StudioValidationResult["warnings"] = [];
  const normErrors: StudioValidationResult["errors"] = [];

  if (doNormalize) {
    const normalised = normalizeStudioDocument(input, mode);
    normErrors.push(...normalised.errors);
    normWarnings.push(...normalised.warnings);
    if (normalised.document) workingInput = normalised.document;
    if (mode === "strict" && normErrors.length > 0) {
      return {
        valid: false,
        normalizedDocument: null,
        errors: normErrors,
        warnings: normWarnings,
      };
    }
  }

  // ── Dispatch by document type ─────────────────────────────────────────────

  // UI-only schema
  if (isUiSchema(workingInput) || (
    typeof workingInput === "object" && workingInput !== null &&
    "root" in workingInput && "nodes" in workingInput &&
    !("studioVersion" in workingInput)
  )) {
    const result = validateUiSchema(workingInput, { ...options, normalize: false });
    return {
      ...result,
      normalizedDocument: doNormalize ? (workingInput as AnyStudioDocument) : result.normalizedDocument,
      errors: [...normErrors, ...result.errors],
      warnings: [...normWarnings, ...result.warnings],
    };
  }

  // Studio Unified document
  if (isUnifiedDocument(workingInput)) {
    const allErrors = [...normErrors];
    const allWarnings = [...normWarnings];

    // AJV structural check on the outer envelope
    const ajvResult = validateStudioWithAjv(workingInput);
    allErrors.push(...ajvResult.errors);
    if (!ajvResult.valid) {
      return {
        valid: false,
        normalizedDocument: doNormalize ? workingInput : null,
        errors: allErrors,
        warnings: allWarnings,
      };
    }

    // Validate the embedded UI section if present
    if (workingInput.ui !== undefined) {
      const uiResult = validateUiSchema(workingInput.ui, { ...options, normalize: false });
      allErrors.push(...uiResult.errors.map(e => ({ ...e, path: `/ui${e.path}` })));
      allWarnings.push(...uiResult.warnings.map(w => ({ ...w, path: `/ui${w.path}` })));
      return {
        valid: allErrors.length === 0,
        normalizedDocument: doNormalize ? workingInput : null,
        errors: allErrors,
        warnings: allWarnings,
        stats: uiResult.stats,
      };
    }

    return {
      valid: allErrors.length === 0,
      normalizedDocument: doNormalize ? workingInput : null,
      errors: allErrors,
      warnings: allWarnings,
    };
  }

  // Unknown format
  return {
    valid: false,
    normalizedDocument: null,
    errors: [
      ...normErrors,
      {
        code: "INVALID_TOP_LEVEL_SHAPE",
        path: "/",
        message: "Input is not a recognised Studio document. Expected: UI schema (root+nodes) or Unified document (studioVersion:'1.0').",
        severity: "error",
      },
    ],
    warnings: normWarnings,
  };
}
