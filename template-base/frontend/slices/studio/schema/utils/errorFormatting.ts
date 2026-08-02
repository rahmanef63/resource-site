/**
 * errorFormatting — helpers for displaying ValidationIssues in UI and logs.
 */

import type { ValidationIssue, StudioValidationResult } from "../types/validator";

/** Format a single issue for console/log output. */
export function formatIssue(issue: ValidationIssue): string {
  const prefix = issue.severity === "error" ? "ERROR" : "WARN ";
  const nodeHint = issue.nodeId ? ` [${issue.nodeId}]` : "";
  return `[${prefix}][${issue.code}]${nodeHint} ${issue.message}`;
}

/** Format all issues from a result for console/log. */
export function formatResult(result: StudioValidationResult): string {
  const lines: string[] = [];
  lines.push(`Valid: ${result.valid}`);
  lines.push(`Errors: ${result.errors.length}  Warnings: ${result.warnings.length}`);
  for (const e of result.errors) lines.push(formatIssue(e));
  for (const w of result.warnings) lines.push(formatIssue(w));
  return lines.join("\n");
}

/** Return only error-severity issues. */
export function getErrors(result: StudioValidationResult): ValidationIssue[] {
  return result.errors;
}

/** Return only warning-severity issues. */
export function getWarnings(result: StudioValidationResult): ValidationIssue[] {
  return result.warnings;
}

/** Group issues by nodeId for UI display (e.g. inspector error badges). */
export function groupByNode(
  issues: ValidationIssue[]
): Map<string, ValidationIssue[]> {
  const map = new Map<string, ValidationIssue[]>();
  for (const issue of issues) {
    const key = issue.nodeId ?? "__document__";
    if (!map.has(key)) map.set(key, []);
    map.get(key)!.push(issue);
  }
  return map;
}
