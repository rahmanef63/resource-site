/**
 * validateBusinessRules — semantic/business-level validation rules.
 *
 * Rules checked:
 *   A. type:"section" without routing intent → suggest type:"div"
 *   B. gap without CSS unit → error (strict) or warning (lenient)
 *   C. flexDirection:"col" → must be "column"
 *   D. Smart block nesting: block inside block → error
 *   E. Duplicate route paths → warning
 *   F. Block display:block override → warning
 */

import type { StudioUISchema } from "../types/studio";
import type { ValidationIssue, ValidationMode } from "../types/validator";
import { isSmartBlock } from "../constants/smartBlocks";
import { CSS_LENGTH_PROPS, CSS_LENGTH_REGEX, BARE_NUMBER_REGEX } from "../constants/aliases";
import { LAYOUT_CONTAINER_TYPES } from "../constants/propEnums";
import { KNOWN_WIDGET_TYPES } from "../constants/widgetTypes";

export interface BusinessRulesResult {
  errors: ValidationIssue[];
  warnings: ValidationIssue[];
}

export function validateBusinessRules(
  schema: StudioUISchema,
  mode: ValidationMode = "strict"
): BusinessRulesResult {
  const errors: ValidationIssue[] = [];
  const warnings: ValidationIssue[] = [];
  const { nodes } = schema;

  // Build parent→children and child→parent maps for nesting checks
  const childToParent = new Map<string, string>();
  for (const [parentId, node] of Object.entries(nodes)) {
    for (const childId of (node.children ?? [])) {
      childToParent.set(childId, parentId);
    }
  }

  const routePaths = new Map<string, string>(); // path → first nodeId

  for (const [nodeId, node] of Object.entries(nodes)) {
    const { type, props = {} } = node;

    // ── A. Unknown widget types ─────────────────────────────────────────────
    if (!KNOWN_WIDGET_TYPES.has(type as never)) {
      errors.push({
        code: "UNKNOWN_WIDGET_TYPE",
        path: `/nodes/${nodeId}/type`,
        message: `Node "${nodeId}" uses unregistered widget type "${type}". It will be silently dropped by the renderer.`,
        severity: "error",
        nodeId,
        details: { type },
      });
    }

    // ── B. type:"section" without routing intent ────────────────────────────
    if (type === "section") {
      const hasPath = typeof (props as Record<string, unknown>).path === "string";
      const hasTitle = typeof (props as Record<string, unknown>).title === "string";
      if (!hasPath && !hasTitle) {
        warnings.push({
          code: "INVALID_SECTION_USAGE",
          path: `/nodes/${nodeId}`,
          message: `Node "${nodeId}" uses type "section" without a path or title prop. Consider using type "div" with tag="section" for generic layout containers.`,
          severity: "warning",
          nodeId,
          details: { suggestion: 'Use type:"div" with props.tag:"section" for non-routing containers' },
        });
      }
    }

    // ── B1. text widget must use content + color, not text + backgroundColor ─
    if (type === "text") {
      if (typeof (props as Record<string, unknown>).text === "string") {
        const issue: ValidationIssue = {
          code: "INVALID_PROP_VALUE",
          path: `/nodes/${nodeId}/props/text`,
          message: `Text widget "${nodeId}" uses "text". Use "content" for text nodes.`,
          severity: mode === "strict" ? "error" : "warning",
          nodeId,
          details: { alias: "text", canonical: "content" },
        };
        if (mode === "strict") errors.push(issue);
        else warnings.push(issue);
      }

      if (
        typeof (props as Record<string, unknown>).backgroundColor === "string" &&
        typeof (props as Record<string, unknown>).color !== "string"
      ) {
        const issue: ValidationIssue = {
          code: "INVALID_PROP_VALUE",
          path: `/nodes/${nodeId}/props/backgroundColor`,
          message: `Text widget "${nodeId}" uses "backgroundColor" without "color". Use "color" for text styling.`,
          severity: mode === "strict" ? "error" : "warning",
          nodeId,
          details: { alias: "backgroundColor", canonical: "color" },
        };
        if (mode === "strict") errors.push(issue);
        else warnings.push(issue);
      }
    }

    // ── C. gap without CSS unit ─────────────────────────────────────────────
    for (const key of CSS_LENGTH_PROPS) {
      const val = (props as Record<string, unknown>)[key];
      if (typeof val !== "string") continue;
      if (CSS_LENGTH_REGEX.test(val)) continue;
      if (BARE_NUMBER_REGEX.test(val)) {
        const issue: ValidationIssue = {
          code: "INVALID_GAP_UNIT",
          path: `/nodes/${nodeId}/props/${key}`,
          message: `Node "${nodeId}": prop "${key}" has value "${val}" without a CSS unit. Append a unit (e.g. "${val}rem" or "${val}px").`,
          severity: mode === "strict" ? "error" : "warning",
          nodeId,
          details: { key, value: val, suggestion: `${val}rem` },
        };
        if (mode === "strict") errors.push(issue);
        else warnings.push(issue);
      }
    }

    // ── D. flexDirection:"col" must be "column" ─────────────────────────────
    const flexDir = (props as Record<string, unknown>).flexDirection;
    if (flexDir === "col" || flexDir === "row-wrap") {
      errors.push({
        code: "INVALID_FLEX_DIRECTION",
        path: `/nodes/${nodeId}/props/flexDirection`,
        message: `Node "${nodeId}" uses flexDirection:"${flexDir}". Use "column" instead of "col".`,
        severity: "error",
        nodeId,
        details: { value: flexDir, suggestion: flexDir === "col" ? "column" : "row" },
      });
    }

    // ── E. Smart block nesting: smart block inside smart block ───────────────
    if (isSmartBlock(type)) {
      const parentId = childToParent.get(nodeId);
      if (parentId) {
        const parentType = nodes[parentId]?.type ?? "";
        if (isSmartBlock(parentType)) {
          errors.push({
            code: "SMART_BLOCK_NESTING",
            path: `/nodes/${nodeId}`,
            message: `Smart block "${nodeId}" (type: "${type}") is nested inside smart block "${parentId}" (type: "${parentType}"). Smart blocks cannot contain other smart blocks.`,
            severity: "error",
            nodeId,
            details: { nodeId, type, parentId, parentType },
          });
        }
      }
    }

    // ── F. Duplicate route paths ────────────────────────────────────────────
    const routePath = (props as Record<string, unknown>).path;
    if (typeof routePath === "string" && routePath.trim()) {
      if (routePaths.has(routePath)) {
        warnings.push({
          code: "DUPLICATE_ROUTE_PATH",
          path: `/nodes/${nodeId}/props/path`,
          message: `Duplicate route path "${routePath}" in nodes "${routePaths.get(routePath)}" and "${nodeId}".`,
          severity: "warning",
          nodeId,
          details: { path: routePath, conflictingNodeId: routePaths.get(routePath) },
        });
      } else {
        routePaths.set(routePath, nodeId);
      }
    }

    // ── G. display:"block" on layout containers ─────────────────────────────
    if (
      LAYOUT_CONTAINER_TYPES.has(type) &&
      (props as Record<string, unknown>).display === "block"
    ) {
      warnings.push({
        code: "BLOCK_LAYOUT_ON_CONTAINER",
        path: `/nodes/${nodeId}/props/display`,
        message: `Layout container "${nodeId}" (type: "${type}") uses display:"block". This may cause layout collapse. Use "flex" or "grid".`,
        severity: "warning",
        nodeId,
        details: { type, display: "block" },
      });
    }
  }

  return { errors, warnings };
}
