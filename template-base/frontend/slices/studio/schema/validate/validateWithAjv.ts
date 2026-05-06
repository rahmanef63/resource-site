/**
 * validateWithAjv — runs AJV structural validation and maps errors to
 * the internal ValidationIssue format.
 */

import type { ErrorObject } from "ajv";
import { getUiValidator, getStudioValidator } from "./createAjv";
import type { ValidationIssue } from "../types/validator";

// ─────────────────────────────────────────────────────────────────────────────
// Error mapping
// ─────────────────────────────────────────────────────────────────────────────

function mapAjvError(err: ErrorObject): ValidationIssue {
  const path = err.instancePath || "/";
  const keyword = err.keyword;

  // Map AJV keyword → stable code
  const code: ValidationIssue["code"] = (() => {
    if (keyword === "required") return "SCHEMA_REQUIRED";
    if (keyword === "type") return "SCHEMA_TYPE";
    if (keyword === "enum" || keyword === "const") return "INVALID_PROP_VALUE";
    return "AJV_ERROR";
  })();

  // Build actionable message
  let message = `${path || "/"}: ${err.message ?? "validation error"}`;
  if (keyword === "required") {
    const missing = (err.params as { missingProperty?: string }).missingProperty ?? "";
    message = `Missing required field "${missing}" at ${path || "document root"}.`;
  } else if (keyword === "enum") {
    const allowed = ((err.params as { allowedValues?: unknown[] }).allowedValues ?? [])
      .map(String)
      .join(", ");
    message = `${path}: value must be one of [${allowed}]. Got: ${JSON.stringify(err.data)}.`;
  } else if (keyword === "type") {
    const expected = (err.params as { type?: string }).type ?? "unknown";
    message = `${path}: expected type "${expected}", got ${typeof err.data}.`;
  } else if (keyword === "pattern") {
    message = `${path}: value "${err.data}" does not match pattern. ${err.message}.`;
  } else if (keyword === "minLength" || keyword === "maxLength") {
    message = `${path}: string length constraint violated. ${err.message}.`;
  } else if (keyword === "minItems") {
    message = `${path}: array must have at least ${(err.params as { limit?: number }).limit ?? 1} item(s).`;
  }

  return { code, path, message, severity: "error" };
}

// ─────────────────────────────────────────────────────────────────────────────
// Public API
// ─────────────────────────────────────────────────────────────────────────────

export interface AjvResult {
  valid: boolean;
  errors: ValidationIssue[];
}

/**
 * Validate a raw unknown value against the UI Schema JSON Schema.
 * Returns structural errors only — graph and business rules are handled separately.
 */
export function validateUiWithAjv(input: unknown): AjvResult {
  const validate = getUiValidator();
  const valid = validate(input) as boolean;
  return {
    valid,
    errors: valid ? [] : (validate.errors ?? []).map(mapAjvError),
  };
}

/**
 * Validate a raw unknown value against the Studio Unified JSON Schema.
 */
export function validateStudioWithAjv(input: unknown): AjvResult {
  const validate = getStudioValidator();
  const valid = validate(input) as boolean;
  return {
    valid,
    errors: valid ? [] : (validate.errors ?? []).map(mapAjvError),
  };
}
