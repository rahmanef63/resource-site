/**
 * Studio Schema Validator v2 — Full Graph Invariant Enforcement
 *
 * Validates StudioUISchema documents against all normative invariants
 * defined in StudioUISchema.ts §8.
 *
 * This file REPLACES the legacy validateSchema.ts for v0.5 documents.
 * Legacy validateSchema.ts remains in place for pure v0.4 compat.
 *
 * Validation pipeline:
 *   1. Structural validation (top-level shape)
 *   2. Node ID format validation
 *   3. Widget type validation (against WIDGET_REGISTRY)
 *   4. Prop validation (per-widget schema, optional)
 *   5. Graph invariants:
 *      a. Root reachability (all root IDs exist in nodes)
 *      b. Child reachability (all children IDs exist in nodes)
 *      c. Unique children (no duplicates within a children array)
 *      d. Single-parent invariant (each ID in at most one children array)
 *      e. Cycle detection (DFS)
 *      f. Orphan detection (all nodes reachable from root)
 *      g. Leaf node children policy (childPolicy: "none" must have children: [])
 *
 * Severity levels:
 *   "error"   — blocks import/render. Document is invalid.
 *   "warning" — does not block, but indicates degraded correctness.
 *   "info"    — advisory only (e.g. deprecated widget types).
 */

import {
  WIDGET_REGISTRY,
  KNOWN_WIDGET_TYPES,
  DEPRECATED_WIDGET_TYPES,
  NODE_ID_REGEX,
  NODE_ID_MAX_LENGTH,
  PROP_ALIAS_MAP,
  TSHIRT_GAP_MAP,
  type WidgetType,
  type StudioUISchema,
} from "../types/StudioUISchema";

// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────

export interface ValidationIssue {
  /** Scope: "schema" for top-level, node ID for node-level issues. */
  scope: string;
  /** Stable error code for programmatic handling. */
  code: ValidationCode;
  /** Human-readable message. */
  message: string;
  severity: "error" | "warning" | "info";
  /** Additional context. */
  context?: Record<string, unknown>;
}

export type ValidationCode =
  // Structural
  | "INVALID_TOP_LEVEL_SHAPE"
  | "MISSING_FIELD"
  | "INVALID_FIELD_TYPE"
  | "INVALID_VERSION"
  | "EMPTY_ROOT"
  | "EMPTY_NODES"
  | "DUPLICATE_ROOT_ID"
  // Node ID
  | "INVALID_NODE_ID_FORMAT"
  // Widget
  | "UNKNOWN_WIDGET_TYPE"
  | "DEPRECATED_WIDGET_TYPE"
  | "INVALID_PROP_TYPE"
  | "PROP_ALIAS_DETECTED"
  | "INVALID_CSS_LENGTH"
  // Graph
  | "ROOT_ID_NOT_IN_NODES"
  | "CHILD_ID_NOT_IN_NODES"
  | "DUPLICATE_CHILDREN"
  | "SINGLE_PARENT_VIOLATION"
  | "CYCLE_DETECTED"
  | "ORPHAN_NODE"
  | "LEAF_NODE_HAS_CHILDREN"
  // Layout
  | "CONTAINER_MISSING_DISPLAY"
  | "BLOCK_LAYOUT_ON_CONTAINER"
  | "ACTION_ROW_MISSING_GAP"
  | "CARD_COLLECTION_MISSING_GRID";

export interface ValidationResult {
  /** True if there are no "error" severity issues. Warnings/info are allowed. */
  valid: boolean;
  issues: ValidationIssue[];
  /** Total counts by severity. */
  counts: { errors: number; warnings: number; info: number };
  /** Stats about the document. */
  stats: {
    nodeCount: number;
    rootCount: number;
    widgetTypes: string[];
    maxDepth: number;
    orphanCount: number;
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// CSS Length validation
// ─────────────────────────────────────────────────────────────────────────────

const CSS_LENGTH_REGEX = /^(0|auto|[0-9]+(\.[0-9]+)?(px|rem|em|%|vw|vh|vmin|vmax|dvh|dvw|ch|lh|fr))$/;
const TSHIRT_SIZE_REGEX = /^(none|xs|sm|md|lg|xl|2xl)$/;

/**
 * Checks if a string is a valid CSS length OR a known t-shirt size alias.
 * T-shirt sizes are warnings (not errors) since the importer can resolve them.
 */
function cssLengthIssue(value: unknown, propName: string, nodeId: string): ValidationIssue | null {
  if (typeof value !== "string") return null;
  if (CSS_LENGTH_REGEX.test(value)) return null;
  if (TSHIRT_SIZE_REGEX.test(value)) {
    return {
      scope: nodeId,
      code: "INVALID_CSS_LENGTH",
      message: `Prop "${propName}" uses t-shirt size "${value}" which requires importer resolution. Use CSS value instead (e.g. "${TSHIRT_GAP_MAP[value] ?? "1rem"}").`,
      severity: "warning",
      context: { prop: propName, value, resolved: TSHIRT_GAP_MAP[value] },
    };
  }
  // Pure number string without unit
  if (/^\d+(\.\d+)?$/.test(value)) {
    return {
      scope: nodeId,
      code: "INVALID_CSS_LENGTH",
      message: `Prop "${propName}" has value "${value}" without a CSS unit. Append a unit (e.g. "${value}rem" or "${value}px").`,
      severity: "error",
      context: { prop: propName, value },
    };
  }
  return null;
}

// ─────────────────────────────────────────────────────────────────────────────
// Alias detection
// ─────────────────────────────────────────────────────────────────────────────

function detectAliasProps(props: Record<string, unknown>, nodeId: string): ValidationIssue[] {
  const issues: ValidationIssue[] = [];
  for (const [alias, canonical] of Object.entries(PROP_ALIAS_MAP)) {
    if (Object.prototype.hasOwnProperty.call(props, alias)) {
      issues.push({
        scope: nodeId,
        code: "PROP_ALIAS_DETECTED",
        message: `Prop "${alias}" is an alias for "${canonical}". Use the canonical name "${canonical}" instead.`,
        severity: "warning",
        context: { alias, canonical, value: props[alias] },
      });
    }
  }
  return issues;
}

// ─────────────────────────────────────────────────────────────────────────────
// Layout lint
// ─────────────────────────────────────────────────────────────────────────────

const LAYOUT_CONTAINER_TYPES = new Set<WidgetType>([
  "div", "section", "flex", "grid", "twoColumn", "threeColumn",
  "card", "formGroup", "buttonGroup", "navGroup", "scrollArea",
]);

const CSS_LENGTH_PROPS = new Set([
  "gap", "columnGap", "rowGap", "width", "minWidth", "maxWidth",
  "height", "minHeight", "maxHeight", "padding", "paddingX", "paddingY",
  "margin", "marginX", "marginY",
]);

function lintLayout(
  nodeId: string,
  widgetType: string,
  props: Record<string, unknown>
): ValidationIssue[] {
  const issues: ValidationIssue[] = [];

  // Check for block default on layout containers
  if (LAYOUT_CONTAINER_TYPES.has(widgetType as WidgetType)) {
    if (props.display === "block") {
      issues.push({
        scope: nodeId,
        code: "BLOCK_LAYOUT_ON_CONTAINER",
        message: `Layout container "${widgetType}" uses display:"block". Containers should use "flex" or "grid". "block" may cause layout collapse.`,
        severity: "warning",
        context: { widgetType, display: "block" },
      });
    }
    // Absence of display on div/section is warned only if also missing className with flex/grid
    if (
      widgetType === "div" || widgetType === "section" || widgetType === "flex"
    ) {
      const hasDisplayProp = typeof props.display === "string";
      const hasFlexInClass = typeof props.className === "string" && /\bflex\b|\bgrid\b/.test(props.className);
      if (!hasDisplayProp && !hasFlexInClass) {
        issues.push({
          scope: nodeId,
          code: "CONTAINER_MISSING_DISPLAY",
          message: `Container "${widgetType}" has no explicit display prop and no flex/grid in className. The renderer will use its layoutDefault ("flex"). Explicit is preferred.`,
          severity: "info",
          context: { widgetType },
        });
      }
    }
  }

  // Check CSS length props
  for (const prop of CSS_LENGTH_PROPS) {
    if (Object.prototype.hasOwnProperty.call(props, prop)) {
      const issue = cssLengthIssue(props[prop], prop, nodeId);
      if (issue) issues.push(issue);
    }
  }

  return issues;
}

// ─────────────────────────────────────────────────────────────────────────────
// Graph validation helpers
// ─────────────────────────────────────────────────────────────────────────────

function computeDepth(
  nodeId: string,
  nodes: Record<string, { children: string[] }>,
  memo: Map<string, number> = new Map()
): number {
  if (memo.has(nodeId)) return memo.get(nodeId)!;
  const node = nodes[nodeId];
  if (!node || node.children.length === 0) {
    memo.set(nodeId, 1);
    return 1;
  }
  const childDepths = node.children.map((cid) => computeDepth(cid, nodes, memo));
  const depth = 1 + Math.max(...childDepths);
  memo.set(nodeId, depth);
  return depth;
}

// ─────────────────────────────────────────────────────────────────────────────
// Main validator
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Validates a StudioUISchema document and returns a full ValidationResult.
 *
 * @param raw  Unknown input — may be any value. The validator handles all type errors.
 * @param opts Validation options.
 */
export function validateStudioUISchema(
  raw: unknown,
  opts: {
    /** Whether to validate widget props against per-widget schemas. Slower but more thorough. */
    validateProps?: boolean;
    /** Whether to run layout lint checks. */
    lintLayout?: boolean;
    /** Whether to check for orphan nodes (requires full graph traversal). */
    checkOrphans?: boolean;
  } = {}
): ValidationResult {
  const {
    validateProps = true,
    lintLayout: doLintLayout = true,
    checkOrphans = true,
  } = opts;

  const issues: ValidationIssue[] = [];

  function err(scope: string, code: ValidationCode, message: string, context?: Record<string, unknown>) {
    issues.push({ scope, code, message, severity: "error", context });
  }

  function warn(scope: string, code: ValidationCode, message: string, context?: Record<string, unknown>) {
    issues.push({ scope, code, message, severity: "warning", context });
  }

  function info(scope: string, code: ValidationCode, message: string, context?: Record<string, unknown>) {
    issues.push({ scope, code, message, severity: "info", context });
  }

  // ── Step 1: Top-level shape ────────────────────────────────────────────────

  if (!raw || typeof raw !== "object" || Array.isArray(raw)) {
    err("schema", "INVALID_TOP_LEVEL_SHAPE", "Expected a JSON object at the top level");
    return buildResult(issues, {});
  }

  const doc = raw as Record<string, unknown>;

  if (!("version" in doc)) {
    err("schema", "MISSING_FIELD", 'Missing required field "version"');
  } else if (!["0.4", "0.5"].includes(doc.version as string)) {
    err("schema", "INVALID_VERSION", `version must be "0.4" or "0.5", got "${doc.version}"`);
  }

  if (!("root" in doc) || !Array.isArray(doc.root)) {
    err("schema", "MISSING_FIELD", 'Missing required field "root" (must be a string array)');
    return buildResult(issues, {});
  }

  if (!("nodes" in doc) || typeof doc.nodes !== "object" || Array.isArray(doc.nodes) || doc.nodes === null) {
    err("schema", "MISSING_FIELD", 'Missing required field "nodes" (must be an object)');
    return buildResult(issues, {});
  }

  const root = doc.root as unknown[];
  const nodes = doc.nodes as Record<string, unknown>;

  if (root.length === 0) {
    err("schema", "EMPTY_ROOT", '"root" must contain at least one node ID');
  }

  if (Object.keys(nodes).length === 0) {
    err("schema", "EMPTY_NODES", '"nodes" must not be empty');
  }

  // ── Step 2: Node ID format ─────────────────────────────────────────────────

  const nodeIds = new Set<string>();
  for (const rawId of Object.keys(nodes)) {
    if (!NODE_ID_REGEX.test(rawId) || rawId.length > NODE_ID_MAX_LENGTH) {
      err(rawId, "INVALID_NODE_ID_FORMAT",
        `Node ID "${rawId}" is invalid. Must match /^[a-z][a-z0-9]*(-[a-z0-9]+)*$/ and be max ${NODE_ID_MAX_LENGTH} chars.`
      );
    }
    nodeIds.add(rawId);
  }

  // ── Step 3: Root ID validation ─────────────────────────────────────────────

  const rootSeen = new Set<string>();
  for (const rawId of root) {
    if (typeof rawId !== "string") {
      err("root", "INVALID_FIELD_TYPE", `root entry is not a string: ${JSON.stringify(rawId)}`);
      continue;
    }
    if (rootSeen.has(rawId)) {
      err("root", "DUPLICATE_ROOT_ID", `root contains duplicate ID "${rawId}". All root IDs must be unique.`);
    }
    rootSeen.add(rawId);
    if (!nodeIds.has(rawId)) {
      err("root", "ROOT_ID_NOT_IN_NODES", `root references unknown node "${rawId}"`);
    }
  }

  // ── Step 4: Per-node validation ────────────────────────────────────────────

  // Track parent assignments for single-parent invariant
  const childToParent = new Map<string, string>();

  for (const [nodeId, rawNode] of Object.entries(nodes)) {
    if (!rawNode || typeof rawNode !== "object" || Array.isArray(rawNode)) {
      err(nodeId, "INVALID_FIELD_TYPE", `Node "${nodeId}" must be an object`);
      continue;
    }

    const node = rawNode as Record<string, unknown>;

    // Widget type
    if (!node.type || typeof node.type !== "string") {
      err(nodeId, "MISSING_FIELD", `Node "${nodeId}" is missing required "type" field`);
    } else {
      const widgetType = node.type as string;
      if (!KNOWN_WIDGET_TYPES.has(widgetType as WidgetType)) {
        err(nodeId, "UNKNOWN_WIDGET_TYPE",
          `Widget type "${widgetType}" is not in the widget registry. Known types: ${[...KNOWN_WIDGET_TYPES].join(", ")}`
        );
      } else {
        if (DEPRECATED_WIDGET_TYPES.has(widgetType as WidgetType)) {
          info(nodeId, "DEPRECATED_WIDGET_TYPE",
            `Widget type "${widgetType}" is deprecated. Migrate to "div" or another active type.`
          );
        }

        // Props validation
        const props = (node.props ?? {}) as Record<string, unknown>;

        if (node.props !== undefined && (typeof node.props !== "object" || Array.isArray(node.props))) {
          err(nodeId, "INVALID_FIELD_TYPE", `Node "${nodeId}".props must be an object`);
        } else {
          // Alias detection
          issues.push(...detectAliasProps(props, nodeId));

          // Per-widget prop schema validation
          if (validateProps && KNOWN_WIDGET_TYPES.has(widgetType as WidgetType)) {
            const widgetDef = WIDGET_REGISTRY[widgetType as WidgetType];
            if (widgetDef && "schema" in widgetDef) {
              const result = (widgetDef.schema as { safeParse: (data: unknown) => { success: boolean; error?: { issues: Array<{ path: Array<string|number>; message: string }> } } }).safeParse(props);
              if (!result.success) {
                for (const zodIssue of (result.error?.issues ?? [])) {
                  warn(nodeId, "INVALID_PROP_TYPE",
                    `Widget "${widgetType}" prop issue: ${zodIssue.path.join(".")} — ${zodIssue.message}`
                  );
                }
              }
            }
          }

          // Layout lint
          if (doLintLayout) {
            issues.push(...lintLayout(nodeId, widgetType, props));
          }
        }

        // Children policy for leaf nodes
        const widgetDef = WIDGET_REGISTRY[widgetType as WidgetType];
        if (widgetDef?.childPolicy === "none") {
          const children = node.children;
          if (Array.isArray(children) && children.length > 0) {
            warn(nodeId, "LEAF_NODE_HAS_CHILDREN",
              `Widget type "${widgetType}" has childPolicy "none" but has ${children.length} child(ren). Children will be ignored.`
            );
          }
        }
      }
    }

    // Children validation
    if (!Array.isArray(node.children)) {
      warn(nodeId, "INVALID_FIELD_TYPE", `Node "${nodeId}".children should be an array. Use [] if none.`);
    } else {
      const childrenSeen = new Set<string>();
      for (const childId of node.children) {
        if (typeof childId !== "string") {
          err(nodeId, "INVALID_FIELD_TYPE", `Children must be strings, got: ${JSON.stringify(childId)}`);
          continue;
        }
        // Node ID format for child reference
        if (!NODE_ID_REGEX.test(childId) || childId.length > NODE_ID_MAX_LENGTH) {
          warn(nodeId, "INVALID_NODE_ID_FORMAT", `Child ID "${childId}" has invalid format`);
        }
        // Existence check
        if (!nodeIds.has(childId)) {
          err(nodeId, "CHILD_ID_NOT_IN_NODES",
            `Node "${nodeId}" references unknown child "${childId}"`
          );
        }
        // Duplicate children check
        if (childrenSeen.has(childId)) {
          err(nodeId, "DUPLICATE_CHILDREN",
            `Node "${nodeId}" has duplicate child "${childId}" in its children array`
          );
        }
        childrenSeen.add(childId);

        // Single-parent invariant
        if (childToParent.has(childId)) {
          const existingParent = childToParent.get(childId)!;
          err(childId, "SINGLE_PARENT_VIOLATION",
            `Node "${childId}" appears in children of both "${existingParent}" and "${nodeId}". Each node may have at most one parent.`
          );
        } else {
          childToParent.set(childId, nodeId);
        }
      }
    }
  }

  // ── Step 5: Cycle detection (DFS) ─────────────────────────────────────────

  const visited = new Set<string>();
  const inStack = new Set<string>();
  const cycleNodes = new Set<string>();

  function detectCycle(id: string, path: string[]): boolean {
    if (inStack.has(id)) {
      const cycleStart = path.indexOf(id);
      const cyclePath = path.slice(cycleStart).concat(id);
      err(id, "CYCLE_DETECTED",
        `Cycle detected: ${cyclePath.join(" → ")}`
      );
      cycleNodes.add(id);
      return true;
    }
    if (visited.has(id)) return false;
    visited.add(id);
    inStack.add(id);

    const node = nodes[id] as Record<string, unknown> | undefined;
    const children = Array.isArray(node?.children) ? (node!.children as string[]) : [];
    for (const childId of children) {
      if (nodeIds.has(childId)) {
        detectCycle(childId, path.concat(id));
      }
    }
    inStack.delete(id);
    return false;
  }

  for (const rootId of root) {
    if (typeof rootId === "string" && nodeIds.has(rootId)) {
      detectCycle(rootId, []);
    }
  }

  // ── Step 6: Orphan detection ───────────────────────────────────────────────

  let orphanCount = 0;
  if (checkOrphans) {
    // Reachable set = all nodes reachable from root via BFS
    const reachable = new Set<string>();
    const queue: string[] = root.filter((id): id is string => typeof id === "string" && nodeIds.has(id));
    while (queue.length > 0) {
      const id = queue.shift()!;
      if (reachable.has(id)) continue;
      reachable.add(id);
      const node = nodes[id] as Record<string, unknown> | undefined;
      const children = Array.isArray(node?.children) ? (node!.children as string[]) : [];
      for (const childId of children) {
        if (typeof childId === "string" && nodeIds.has(childId) && !reachable.has(childId)) {
          queue.push(childId);
        }
      }
    }

    for (const nodeId of nodeIds) {
      if (!reachable.has(nodeId)) {
        warn(nodeId, "ORPHAN_NODE",
          `Node "${nodeId}" is not reachable from any root node. It is an orphan and will not be rendered.`
        );
        orphanCount++;
      }
    }
  }

  // ── Step 7: Compute stats ──────────────────────────────────────────────────

  const widgetTypes = [...new Set(
    Object.values(nodes)
      .map((n) => (n && typeof n === "object" && !Array.isArray(n)) ? (n as Record<string, unknown>).type : null)
      .filter((t): t is string => typeof t === "string")
  )];

  // Compute max depth from root
  const typedNodes: Record<string, { children: string[] }> = {};
  for (const [id, n] of Object.entries(nodes)) {
    if (n && typeof n === "object" && !Array.isArray(n)) {
      const node = n as Record<string, unknown>;
      typedNodes[id] = { children: Array.isArray(node.children) ? node.children as string[] : [] };
    }
  }

  let maxDepth = 0;
  for (const rootId of root) {
    if (typeof rootId === "string" && typedNodes[rootId]) {
      maxDepth = Math.max(maxDepth, computeDepth(rootId, typedNodes));
    }
  }

  return buildResult(issues, {
    nodeCount: nodeIds.size,
    rootCount: rootSeen.size,
    widgetTypes,
    maxDepth,
    orphanCount,
  });
}

function buildResult(
  issues: ValidationIssue[],
  stats: Partial<ValidationResult["stats"]>
): ValidationResult {
  const errors = issues.filter((i) => i.severity === "error").length;
  const warnings = issues.filter((i) => i.severity === "warning").length;
  const info = issues.filter((i) => i.severity === "info").length;

  return {
    valid: errors === 0,
    issues,
    counts: { errors, warnings, info },
    stats: {
      nodeCount: stats.nodeCount ?? 0,
      rootCount: stats.rootCount ?? 0,
      widgetTypes: stats.widgetTypes ?? [],
      maxDepth: stats.maxDepth ?? 0,
      orphanCount: stats.orphanCount ?? 0,
    },
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// Convenience helpers
// ─────────────────────────────────────────────────────────────────────────────

/** Returns true if the document has no error-level issues. */
export function isValidStudioUISchema(raw: unknown): boolean {
  return validateStudioUISchema(raw).valid;
}

/** Returns only error-level issues. */
export function getSchemaErrors(raw: unknown): ValidationIssue[] {
  return validateStudioUISchema(raw).issues.filter((i) => i.severity === "error");
}

/** Importer alias resolution: normalises alias props before validation/render. */
export function resolveAliasProps(props: Record<string, unknown>): Record<string, unknown> {
  const resolved = { ...props };
  for (const [alias, canonical] of Object.entries(PROP_ALIAS_MAP)) {
    if (Object.prototype.hasOwnProperty.call(resolved, alias) && !Object.prototype.hasOwnProperty.call(resolved, canonical)) {
      resolved[canonical] = resolved[alias];
      delete resolved[alias];
    }
  }
  // Resolve t-shirt gap sizes
  for (const key of ["gap", "columnGap", "rowGap"]) {
    if (typeof resolved[key] === "string" && Object.prototype.hasOwnProperty.call(TSHIRT_GAP_MAP, resolved[key] as string)) {
      resolved[key] = TSHIRT_GAP_MAP[resolved[key] as string];
    }
  }
  return resolved;
}

/**
 * Apply the normative layout defaults to a node's props.
 * Called by the renderer when explicit display props are absent.
 *
 * [N] This function is the enforcement point for:
 *     "Containers MUST NOT default to display:block"
 */
export function applyLayoutDefaults(
  widgetType: string,
  props: Record<string, unknown>
): Record<string, unknown> {
  const widgetDef = WIDGET_REGISTRY[widgetType as WidgetType];
  if (!widgetDef) return props;

  const { layoutDefault } = widgetDef;
  if (!layoutDefault) return props;

  // Only apply if display is not already set (via prop or className)
  const hasExplicitDisplay = typeof props.display === "string";
  const hasDisplayInClass = typeof props.className === "string" && /\bflex\b|\bgrid\b|\binline\b/.test(props.className);

  if (hasExplicitDisplay || hasDisplayInClass) return props;

  return {
    display: layoutDefault,
    // Add flex-direction:column default for flex containers without className
    ...(layoutDefault === "flex" && !hasDisplayInClass ? { flexDirection: "column" } : {}),
    ...props,
  };
}
