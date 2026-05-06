/**
 * validateUiSchema — full validation pipeline for a UI-only schema.
 *
 * Pipeline:
 *   Step 1  Normalise (lenient mode: auto-fix aliases; strict: flag them)
 *   Step 2  AJV structural validation
 *   Step 3  Graph invariants
 *   Step 4  Business rules
 *   Step 5  Aggregate and return
 */

import type { StudioUISchema } from "../types/studio";
import type { StudioValidationResult, ValidateOptions } from "../types/validator";
import { normalizeUiSchema } from "../normalize/normalizeUiSchema";
import { validateUiWithAjv } from "./validateWithAjv";
import { validateGraphRules } from "./validateGraphRules";
import { validateBusinessRules } from "./validateBusinessRules";

export function validateUiSchema(
  input: unknown,
  options: ValidateOptions = {}
): StudioValidationResult<StudioUISchema> {
  const mode = options.mode ?? "strict";
  const doNormalize = options.normalize ?? (mode === "lenient");

  const allErrors: StudioValidationResult["errors"] = [];
  const allWarnings: StudioValidationResult["warnings"] = [];

  // ── Step 1: Normalise ────────────────────────────────────────────────────
  let workingDoc: unknown = input;
  if (doNormalize) {
    const normalised = normalizeUiSchema(input, mode);
    allErrors.push(...normalised.errors.filter(e => e.severity === "error"));
    allWarnings.push(...normalised.errors.filter(e => e.severity === "warning"));
    allWarnings.push(...normalised.warnings);
    if (normalised.document) workingDoc = normalised.document;
    // In strict mode, alias errors block further validation
    if (mode === "strict" && allErrors.length > 0) {
      return {
        valid: false,
        normalizedDocument: null,
        errors: allErrors,
        warnings: allWarnings,
      };
    }
  }

  // ── Step 2: AJV structural ───────────────────────────────────────────────
  const ajvResult = validateUiWithAjv(workingDoc);
  allErrors.push(...ajvResult.errors);
  if (!ajvResult.valid) {
    return {
      valid: false,
      normalizedDocument: doNormalize ? (workingDoc as StudioUISchema) : null,
      errors: allErrors,
      warnings: allWarnings,
    };
  }

  // ── Step 3: Graph invariants ─────────────────────────────────────────────
  const schema = workingDoc as StudioUISchema;
  const graphResult = validateGraphRules(schema, mode);
  allErrors.push(...graphResult.errors);
  allWarnings.push(...graphResult.warnings);

  // ── Step 4: Business rules ───────────────────────────────────────────────
  const businessResult = validateBusinessRules(schema, mode);
  allErrors.push(...businessResult.errors);
  allWarnings.push(...businessResult.warnings);

  return {
    valid: allErrors.length === 0,
    normalizedDocument: doNormalize ? schema : null,
    errors: allErrors,
    warnings: allWarnings,
    stats: {
      ...graphResult.stats,
      widgetTypes: [...new Set(Object.values(schema.nodes).map(n => n.type))],
    },
  };
}
