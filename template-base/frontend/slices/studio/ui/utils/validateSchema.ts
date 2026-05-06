/**
 * Studio import validator and normalizer.
 *
 * This utility is intentionally aligned with the runtime widget registry and the
 * schema normalizer so raw AI JSON is cleaned up before it reaches the canvas.
 */

import {
  CSS_LENGTH_PROPS,
  CSS_LENGTH_REGEX,
  normalizeNodeProps,
} from "@/frontend/slices/studio/schema";
import { getAvailableWidgetKeys } from "@/frontend/slices/studio/ui/registry";

export interface SchemaError {
  id: string;
  message: string;
  severity: "error" | "warning";
}

export interface SchemaValidationResult {
  errors: SchemaError[];
  normalizedSchema: Record<string, any> | null;
}

function pushIssue(
  errors: SchemaError[],
  id: string,
  message: string,
  severity: "error" | "warning",
) {
  errors.push({ id, message, severity });
}

function cloneSchema(raw: Record<string, any>) {
  return JSON.parse(JSON.stringify(raw)) as Record<string, any>;
}

function hasCssUnit(value: unknown): boolean {
  return typeof value === "string" && CSS_LENGTH_REGEX.test(value);
}

function validateCssLengthProps(
  nodeId: string,
  props: Record<string, unknown>,
  errors: SchemaError[],
) {
  for (const key of CSS_LENGTH_PROPS) {
    const value = props[key];
    if (value === undefined || value === null || value === "") continue;
    if (hasCssUnit(value)) continue;

    if (typeof value === "string" && /^\d+(\.\d+)?$/.test(value)) {
      pushIssue(
        errors,
        nodeId,
        `Prop "${key}" has value "${value}" without a CSS unit. Use values like "1rem" or "16px".`,
        "error",
      );
      continue;
    }

    pushIssue(
      errors,
      nodeId,
      `Prop "${key}" has value "${String(value)}" which is not a valid CSS length.`,
      "warning",
    );
  }
}

export function validateAndNormalizeSchema(raw: unknown): SchemaValidationResult {
  const errors: SchemaError[] = [];

  if (!raw || typeof raw !== "object" || Array.isArray(raw)) {
    return {
      errors: [{ id: "schema", message: "Expected a JSON object at the top level", severity: "error" }],
      normalizedSchema: null,
    };
  }

  const schema = cloneSchema(raw as Record<string, any>);

  if (!schema.nodes || typeof schema.nodes !== "object" || Array.isArray(schema.nodes)) {
    pushIssue(errors, "schema", 'Missing required field "nodes" (must be an object)', "error");
    return { errors, normalizedSchema: null };
  }

  if (!schema.root || !Array.isArray(schema.root)) {
    pushIssue(errors, "schema", 'Missing required field "root" (must be a string array)', "error");
  }

  const runtimeWidgetTypes = new Set(getAvailableWidgetKeys());
  const nodeIds = new Set(Object.keys(schema.nodes));

  for (const id of schema.root ?? []) {
    if (typeof id !== "string") {
      pushIssue(errors, "root", `Root entry is not a string: ${JSON.stringify(id)}`, "error");
    } else if (!nodeIds.has(id)) {
      pushIssue(errors, "root", `Root references unknown node: "${id}"`, "error");
    }
  }

  for (const [id, node] of Object.entries(schema.nodes) as Array<[string, any]>) {
    if (!node || typeof node !== "object" || Array.isArray(node)) {
      pushIssue(errors, id, "Node value must be an object", "error");
      continue;
    }

    if (!node.type || typeof node.type !== "string") {
      pushIssue(errors, id, 'Missing "type" field', "error");
    } else if (!runtimeWidgetTypes.has(node.type)) {
      pushIssue(errors, id, `Unknown widget type: "${node.type}" — it may not render correctly`, "warning");
    }

    if (!Array.isArray(node.children)) {
      pushIssue(errors, id, '"children" should be an array (use [] if none)', "warning");
      node.children = [];
    } else {
      for (const childId of node.children) {
        if (typeof childId !== "string") {
          pushIssue(errors, id, `Children must be strings, got: ${JSON.stringify(childId)}`, "error");
        } else if (!nodeIds.has(childId)) {
          pushIssue(errors, id, `References unknown child node: "${childId}"`, "error");
        }
      }
    }

    if (node.props !== undefined && (typeof node.props !== "object" || Array.isArray(node.props))) {
      pushIssue(errors, id, '"props" must be an object', "error");
      node.props = {};
      continue;
    }

    const rawProps = (node.props ?? {}) as Record<string, unknown>;
    const { props: normalizedProps, issues } = normalizeNodeProps(id, rawProps, "lenient", node.type);
    node.props = normalizedProps;

    for (const issue of issues) {
      pushIssue(errors, issue.nodeId ?? id, issue.message, issue.severity);
    }

    validateCssLengthProps(id, normalizedProps, errors);

    if (node.type === "text") {
      if (
        typeof rawProps.backgroundColor === "string" &&
        rawProps.backgroundColor.trim() &&
        rawProps.color === undefined
      ) {
        pushIssue(
          errors,
          id,
          'Text widgets should use "color" for text color. Importer normalized "backgroundColor" to "color".',
          "warning",
        );
      }

      if (typeof normalizedProps.content !== "string" || normalizedProps.content.trim().length === 0) {
        pushIssue(
          errors,
          id,
          'Text widget is missing "content". Preview will fall back to placeholder text.',
          "warning",
        );
      }
    }

    if (node.type === "section") {
      const hasPath = typeof normalizedProps.path === "string" && normalizedProps.path.trim().length > 0;
      const hasTitle = typeof normalizedProps.title === "string" && normalizedProps.title.trim().length > 0;
      if (!hasPath && !hasTitle) {
        pushIssue(
          errors,
          id,
          'Layout sections should use type "div" with props.tag="section". Keep type "section" only for routable pages.',
          "warning",
        );
      }
    }
  }

  const visited = new Set<string>();
  const inStack = new Set<string>();

  const hasCycle = (id: string, path: string[]): boolean => {
    if (inStack.has(id)) {
      pushIssue(errors, id, `Circular reference: ${path.concat(id).join(" -> ")}`, "error");
      return true;
    }
    if (visited.has(id)) return false;
    visited.add(id);
    inStack.add(id);

    const node = schema.nodes[id];
    for (const childId of node?.children ?? []) {
      if (nodeIds.has(childId) && hasCycle(childId, path.concat(id))) return true;
    }

    inStack.delete(id);
    return false;
  };

  for (const rootId of schema.root ?? []) {
    if (nodeIds.has(rootId)) hasCycle(rootId, []);
  }

  return { errors, normalizedSchema: schema };
}

export function validateSchema(raw: unknown): SchemaError[] {
  return validateAndNormalizeSchema(raw).errors;
}

export function isSchemaValid(errors: SchemaError[]): boolean {
  return !errors.some((error) => error.severity === "error");
}
