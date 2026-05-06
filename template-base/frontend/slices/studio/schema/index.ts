/**
 * Studio Schema Validation System — Public API
 *
 * Primary entry point:
 *
 *   import { validateStudioDocument } from "@/frontend/slices/studio/schema";
 *
 *   const result = validateStudioDocument(rawInput, { mode: "lenient", normalize: true });
 *   if (!result.valid) console.error(result.errors);
 *
 * See IMPLEMENTATION_NOTES.md for architecture overview.
 */

// ── Main validator ────────────────────────────────────────────────────────────
export { validateStudioDocument } from "./validate/validateStudioDocument";
export { validateUiSchema } from "./validate/validateUiSchema";

// ── AJV validators (low-level) ────────────────────────────────────────────────
export { validateUiWithAjv, validateStudioWithAjv } from "./validate/validateWithAjv";

// ── Normaliser ────────────────────────────────────────────────────────────────
export { normalizeStudioDocument } from "./normalize/normalizeStudioDocument";
export { normalizeUiSchema } from "./normalize/normalizeUiSchema";
export { normalizeNodeProps } from "./normalize/normalizeNodeProps";

// ── Graph & business validators (low-level) ───────────────────────────────────
export { validateGraphRules } from "./validate/validateGraphRules";
export { validateBusinessRules } from "./validate/validateBusinessRules";

// ── Types ─────────────────────────────────────────────────────────────────────
export type {
  ValidationMode,
  ValidationIssue,
  ValidationIssueCode,
  StudioValidationResult,
  NormaliseResult,
  ValidateOptions,
} from "./types/validator";

export type {
  AnyStudioDocument,
  StudioUnifiedDocument,
  StudioDocumentKind,
} from "./types/studio";

// ── Utils ─────────────────────────────────────────────────────────────────────
export { formatIssue, formatResult, groupByNode } from "./utils/errorFormatting";
export { isAnyStudioDocument, extractUiSchema, isUiSchema, isUnifiedDocument } from "./utils/schemaGuards";

// ── Constants ─────────────────────────────────────────────────────────────────
export { SMART_BLOCK_TYPES, isSmartBlock, isBlock } from "./constants/smartBlocks";
export { CSS_LENGTH_REGEX, CSS_LENGTH_PROPS, BARE_NUMBER_REGEX } from "./constants/aliases";
