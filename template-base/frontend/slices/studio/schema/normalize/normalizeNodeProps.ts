/**
 * normalizeNodeProps — cleans up individual node props before validation.
 *
 * Operations:
 *   1. Resolve prop aliases (direction → flexDirection, align → alignItems, …)
 *   2. Resolve t-shirt gap sizes (sm → "0.5rem", lg → "1.5rem", …)
 *   3. Ensure children is always an array
 *   4. Ensure props is always an object
 */

import { PROP_ALIAS_MAP, TSHIRT_GAP_MAP } from "../constants/aliases";
import { CSS_LENGTH_PROPS, CSS_LENGTH_REGEX } from "../constants/aliases";
import type { ValidationIssue } from "../types/validator";

export interface NormalizePropsResult {
  props: Record<string, unknown>;
  issues: ValidationIssue[];
}

/**
 * Normalise a single node's props.
 *
 * @param nodeId  - The node's ID (used in issue messages).
 * @param rawProps - The raw props from the document.
 * @param mode    - "lenient" resolves aliases; "strict" flags them as errors.
 */
export function normalizeNodeProps(
  nodeId: string,
  rawProps: Record<string, unknown>,
  mode: "strict" | "lenient" = "lenient",
  nodeType?: string
): NormalizePropsResult {
  const props = { ...rawProps };
  const issues: ValidationIssue[] = [];

  // 1. Resolve prop aliases
  for (const [alias, canonical] of Object.entries(PROP_ALIAS_MAP)) {
    if (Object.prototype.hasOwnProperty.call(props, alias)) {
      if (mode === "lenient") {
        // Auto-fix: move value to canonical key
        if (!Object.prototype.hasOwnProperty.call(props, canonical)) {
          props[canonical] = props[alias];
        }
        delete props[alias];
        issues.push({
          code: "PROP_ALIAS_NORMALISED",
          path: `nodes.${nodeId}.props.${alias}`,
          message: `Alias prop "${alias}" → normalised to "${canonical}".`,
          severity: "warning",
          nodeId,
          details: { alias, canonical },
        });
      } else {
        // Strict: flag as error, don't fix
        issues.push({
          code: "PROP_ALIAS_DETECTED",
          path: `nodes.${nodeId}.props.${alias}`,
          message: `Prop "${alias}" is an alias for "${canonical}". Use the canonical name in strict mode.`,
          severity: "error",
          nodeId,
          details: { alias, canonical },
        });
      }
    }
  }

  // 2. Resolve t-shirt gap sizes (always, even in strict — these are valid inputs)
  for (const key of CSS_LENGTH_PROPS) {
    const val = props[key];
    if (typeof val === "string" && Object.prototype.hasOwnProperty.call(TSHIRT_GAP_MAP, val)) {
      const resolved = TSHIRT_GAP_MAP[val];
      issues.push({
        code: "PROP_ALIAS_NORMALISED",
        path: `nodes.${nodeId}.props.${key}`,
        message: `T-shirt size "${val}" resolved to "${resolved}" for prop "${key}".`,
        severity: "warning",
        nodeId,
        details: { key, original: val, resolved },
      });
      props[key] = resolved;
    }
  }

  // 3. Validate CSS length props in strict mode
  if (mode === "strict") {
    for (const key of CSS_LENGTH_PROPS) {
      const val = props[key];
      if (typeof val === "string" && !CSS_LENGTH_REGEX.test(val)) {
        issues.push({
          code: "INVALID_CSS_LENGTH",
          path: `nodes.${nodeId}.props.${key}`,
          message: `Prop "${key}" value "${val}" is not a valid CSS length. Use a unit (e.g. "1rem", "16px").`,
          severity: "error",
          nodeId,
          details: { key, value: val },
        });
      }
    }
  }

  // 4. Validate flexDirection
  if (props.flexDirection !== undefined) {
    const validDirs = new Set(["row", "column", "row-reverse", "column-reverse"]);
    if (!validDirs.has(String(props.flexDirection))) {
      issues.push({
        code: "INVALID_FLEX_DIRECTION",
        path: `nodes.${nodeId}.props.flexDirection`,
        message: `flexDirection "${props.flexDirection}" is invalid. Use "row", "column", "row-reverse", or "column-reverse".`,
        severity: "error",
        nodeId,
        details: { value: props.flexDirection },
      });
    }
  }

  // 5. Widget-specific normalization for legacy AI output
  if (nodeType === "button") {
    // AI often emits `content` instead of `text` for buttons
    if (typeof props.content === "string" && props.content.trim()) {
      const hasCanonical = Object.prototype.hasOwnProperty.call(props, "text");
      if (!hasCanonical) {
        if (mode === "lenient") {
          props.text = props.content;
          delete props.content;
          issues.push({
            code: "PROP_ALIAS_NORMALISED",
            path: `nodes.${nodeId}.props.content`,
            message: `Button widget label was normalised from "content" to "text".`,
            severity: "warning",
            nodeId,
            details: { alias: "content", canonical: "text" },
          });
        } else {
          issues.push({
            code: "PROP_ALIAS_DETECTED",
            path: `nodes.${nodeId}.props.content`,
            message: `Button widgets must use "text" instead of "content" in strict mode.`,
            severity: "error",
            nodeId,
            details: { alias: "content", canonical: "text" },
          });
        }
      } else if (mode === "lenient") {
        // canonical "text" already present — just remove the stale alias
        delete props.content;
      }
    }
  }

  if (nodeType === "badge") {
    // AI often emits `content` instead of `label` for badges
    if (typeof props.content === "string" && props.content.trim()) {
      const hasCanonical = Object.prototype.hasOwnProperty.call(props, "label");
      if (!hasCanonical) {
        if (mode === "lenient") {
          props.label = props.content;
          delete props.content;
          issues.push({
            code: "PROP_ALIAS_NORMALISED",
            path: `nodes.${nodeId}.props.content`,
            message: `Badge widget label was normalised from "content" to "label".`,
            severity: "warning",
            nodeId,
            details: { alias: "content", canonical: "label" },
          });
        } else {
          issues.push({
            code: "PROP_ALIAS_DETECTED",
            path: `nodes.${nodeId}.props.content`,
            message: `Badge widgets must use "label" instead of "content" in strict mode.`,
            severity: "error",
            nodeId,
            details: { alias: "content", canonical: "label" },
          });
        }
      } else if (mode === "lenient") {
        // canonical "label" already present — just remove the stale alias
        delete props.content;
      }
    }
  }

  if (nodeType === "text") {
    if (
      typeof props.text === "string" &&
      props.text.trim() &&
      !Object.prototype.hasOwnProperty.call(props, "content")
    ) {
      if (mode === "lenient") {
        props.content = props.text;
        delete props.text;
        issues.push({
          code: "PROP_ALIAS_NORMALISED",
          path: `nodes.${nodeId}.props.text`,
          message: `Text widget content was normalised from "text" to "content".`,
          severity: "warning",
          nodeId,
          details: { alias: "text", canonical: "content" },
        });
      } else {
        issues.push({
          code: "PROP_ALIAS_DETECTED",
          path: `nodes.${nodeId}.props.text`,
          message: `Text widgets must use "content" instead of "text" in strict mode.`,
          severity: "error",
          nodeId,
          details: { alias: "text", canonical: "content" },
        });
      }
    }

    if (
      typeof props.backgroundColor === "string" &&
      props.backgroundColor.trim() &&
      !Object.prototype.hasOwnProperty.call(props, "color")
    ) {
      if (mode === "lenient") {
        props.color = props.backgroundColor;
        delete props.backgroundColor;
        issues.push({
          code: "PROP_ALIAS_NORMALISED",
          path: `nodes.${nodeId}.props.backgroundColor`,
          message: `Text widget color was normalised from "backgroundColor" to "color".`,
          severity: "warning",
          nodeId,
          details: { alias: "backgroundColor", canonical: "color" },
        });
      } else {
        issues.push({
          code: "PROP_ALIAS_DETECTED",
          path: `nodes.${nodeId}.props.backgroundColor`,
          message: `Text widgets must use "color" instead of "backgroundColor" in strict mode.`,
          severity: "error",
          nodeId,
          details: { alias: "backgroundColor", canonical: "color" },
        });
      }
    }
  }

  return { props, issues };
}
