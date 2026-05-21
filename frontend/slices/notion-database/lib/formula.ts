/** Formula engine — `{{title}}` / `{{Property Name}}` interpolation +
 *  fn(arg, ...) syntax. Pure function, no backend.
 *
 *  Supported tokens: title / name (row.title), now / today (timestamps),
 *  any property name or id.
 *  Supported fns: concat, lower, upper, length, if, and, or, not, empty,
 *  contains, replace, round, floor, ceil, abs, min, max, now, today.
 *  Supported math: `=` prefix followed by `+ - * / ( ) digits .`
 *
 *  Relation / rollup lookups are NOT supported here (they need cross-DB
 *  context) — those property types are deferred to the upstream mega-
 *  bundle adapter. */

import type { Database, Page, Property, PropertyValue } from "../types";

export function evaluateFormula(
  expression: string,
  row: Page,
  db: Database,
): string {
  const rendered = expression.replace(/\{\{([^}]+)\}\}/g, (_, token: string) => {
    const trimmed = token.trim();
    if (trimmed.toLowerCase() === "title" || trimmed.toLowerCase() === "name") {
      return row.title || "Untitled";
    }
    if (trimmed.toLowerCase() === "now") return new Date().toISOString();
    if (trimmed.toLowerCase() === "today") return new Date().toISOString().slice(0, 10);
    const prop = db.properties.find(
      (p) => p.id === trimmed || p.name.toLowerCase() === trimmed.toLowerCase(),
    );
    return prop ? formatPropertyValue(row.rowProps?.[prop.id], prop) : "";
  });

  const trimmed = rendered.trim();
  const fnMatch = trimmed.match(/^([a-zA-Z_]+)\s*\((.*)\)$/s);
  if (fnMatch) {
    const fn = fnMatch[1].toLowerCase();
    const args = splitArgs(fnMatch[2]).map((a) => unquote(a.trim()));
    try {
      switch (fn) {
        case "concat": return args.join("");
        case "lower": return (args[0] ?? "").toLowerCase();
        case "upper": return (args[0] ?? "").toUpperCase();
        case "length": return String((args[0] ?? "").length);
        case "if": return truthy(args[0]) ? (args[1] ?? "") : (args[2] ?? "");
        case "and": return args.every(truthy) ? "true" : "false";
        case "or": return args.some(truthy) ? "true" : "false";
        case "not": return truthy(args[0]) ? "false" : "true";
        case "empty": return args[0] ? "false" : "true";
        case "contains": return (args[0] ?? "").includes(args[1] ?? "") ? "true" : "false";
        case "replace": return (args[0] ?? "").split(args[1] ?? "").join(args[2] ?? "");
        case "round": return String(Math.round(Number(args[0])));
        case "floor": return String(Math.floor(Number(args[0])));
        case "ceil": return String(Math.ceil(Number(args[0])));
        case "abs": return String(Math.abs(Number(args[0])));
        case "min": return String(Math.min(...args.map(Number).filter(Number.isFinite)));
        case "max": return String(Math.max(...args.map(Number).filter(Number.isFinite)));
        case "now": return new Date().toISOString();
        case "today": return new Date().toISOString().slice(0, 10);
      }
    } catch {
      return "Invalid formula";
    }
  }

  if (trimmed.startsWith("=")) {
    const math = trimmed.slice(1);
    if (!/^[\d+\-*/().\s]+$/.test(math)) return "Invalid formula";
    try {
      const result = Function(`"use strict"; return (${math});`)();
      return Number.isFinite(result) ? String(result) : "Invalid formula";
    } catch {
      return "Invalid formula";
    }
  }

  return rendered;
}

function splitArgs(s: string): string[] {
  const out: string[] = [];
  let depth = 0;
  let inQuote: '"' | "'" | null = null;
  let cur = "";
  for (let i = 0; i < s.length; i++) {
    const ch = s[i];
    if (inQuote) {
      if (ch === inQuote && s[i - 1] !== "\\") inQuote = null;
      cur += ch;
      continue;
    }
    if (ch === '"' || ch === "'") { inQuote = ch; cur += ch; continue; }
    if (ch === "(") { depth++; cur += ch; continue; }
    if (ch === ")") { depth--; cur += ch; continue; }
    if (ch === "," && depth === 0) { out.push(cur); cur = ""; continue; }
    cur += ch;
  }
  if (cur.trim() || out.length) out.push(cur);
  return out;
}

function unquote(s: string): string {
  if ((s.startsWith('"') && s.endsWith('"')) || (s.startsWith("'") && s.endsWith("'"))) {
    return s.slice(1, -1);
  }
  return s;
}

function truthy(v: unknown): boolean {
  if (typeof v === "string") {
    const t = v.trim().toLowerCase();
    return t !== "" && t !== "false" && t !== "0" && t !== "no" && t !== "unchecked";
  }
  return !!v;
}

export function formatPropertyValue(value: PropertyValue | undefined, prop: Property): string {
  if (value === undefined || value === null || value === "") return "";
  if (prop.type === "checkbox") return value === true ? "Checked" : "Unchecked";
  if (prop.type === "date") return typeof value === "object" && "date" in value ? value.date ?? "" : "";
  if (prop.type === "select" || prop.type === "status") {
    return prop.options?.find((o) => o.id === value)?.name ?? String(value);
  }
  if (prop.type === "multi_select") {
    const ids = Array.isArray(value) ? value : [];
    return ids.map((id) => prop.options?.find((o) => o.id === id)?.name ?? id).join(", ");
  }
  if (prop.type === "files") {
    const files = Array.isArray(value) ? value : [];
    return files.map((url) => url.split("/").pop() ?? url).join(", ");
  }
  if (prop.type === "person") {
    const ids = Array.isArray(value) ? value : [];
    return ids.join(", ");
  }
  if (prop.type === "created_time" || prop.type === "last_edited_time") return "";
  return String(value);
}
