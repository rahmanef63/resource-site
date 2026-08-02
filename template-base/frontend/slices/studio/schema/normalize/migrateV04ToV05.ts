/**
 * migrateV04ToV05 — upgrades a v0.4 UI schema to the internal v0.5 shape.
 *
 * v0.4 → v0.5 changes:
 *   - `metadata` block became optional (v0.4 may lack it)
 *   - Node IDs were less strictly validated
 *   - `children` may be missing on some nodes (v0.4 allowed omission)
 *   - `props` may be missing on some nodes
 *
 * This migrator never changes data semantics. It only normalises missing
 * optional fields so the v0.5 validator doesn't error on them.
 */

import type { ValidationIssue } from "../types/validator";

export interface MigrationResult {
  document: Record<string, unknown>;
  warnings: ValidationIssue[];
}

export function migrateV04ToV05(rawDoc: Record<string, unknown>): MigrationResult {
  const warnings: ValidationIssue[] = [];
  const doc = structuredClone(rawDoc) as Record<string, unknown>;

  // 1. Bump version to 0.5 (internally) without changing the external value
  //    We record a warning but don't change the stored version — the caller
  //    decides whether to persist the change.
  if (doc.version === "0.4") {
    warnings.push({
      code: "MIGRATION_V04_TO_V05",
      path: "/version",
      message: "Document is v0.4. Migrated to v0.5 internally for validation. Consider updating the version field.",
      severity: "warning",
      details: { from: "0.4", to: "0.5" },
    });
  }

  // 2. Ensure nodes is an object
  if (typeof doc.nodes !== "object" || doc.nodes === null || Array.isArray(doc.nodes)) {
    doc.nodes = {};
    warnings.push({
      code: "MIGRATION_V04_TO_V05",
      path: "/nodes",
      message: "nodes field was missing or invalid. Replaced with empty object.",
      severity: "warning",
    });
  }

  // 3. Normalise each node: ensure props and children are present
  const nodes = doc.nodes as Record<string, unknown>;
  for (const [id, rawNode] of Object.entries(nodes)) {
    if (typeof rawNode !== "object" || rawNode === null) {
      warnings.push({
        code: "MIGRATION_V04_TO_V05",
        path: `/nodes/${id}`,
        message: `Node "${id}" is not an object. Skipped.`,
        severity: "warning",
        nodeId: id,
      });
      continue;
    }
    const node = rawNode as Record<string, unknown>;

    // Ensure props
    if (typeof node.props !== "object" || node.props === null) {
      node.props = {};
    }

    // Ensure children
    if (!Array.isArray(node.children)) {
      node.children = [];
    }

    // Ensure type is a string
    if (typeof node.type !== "string") {
      warnings.push({
        code: "MIGRATION_V04_TO_V05",
        path: `/nodes/${id}/type`,
        message: `Node "${id}" has non-string type. This node will fail validation.`,
        severity: "warning",
        nodeId: id,
      });
    }
  }

  // 4. Ensure root is an array
  if (!Array.isArray(doc.root)) {
    doc.root = [];
    warnings.push({
      code: "MIGRATION_V04_TO_V05",
      path: "/root",
      message: "root field was missing or not an array. Replaced with empty array.",
      severity: "warning",
    });
  }

  return { document: doc, warnings };
}
