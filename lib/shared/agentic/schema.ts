/**
 * Agentic kit — tiny JSON-Schema builders.
 *
 * Keep `*.tools.ts` files readable: each helper returns a property node;
 * {@link obj} assembles them and tracks required keys. Mark a key required by
 * suffixing its name with `!` (e.g. `obj({ "id!": str("…") })`).
 *
 * @module lib/shared/agentic/schema
 */

import type { JsonSchema } from "./types";

export const str = (description: string, opts: { enum?: readonly string[] } = {}) => ({
  type: "string" as const,
  description,
  ...(opts.enum ? { enum: opts.enum as string[] } : {}),
});

export const num = (
  description: string,
  opts: { min?: number; max?: number } = {},
) => ({
  type: "number" as const,
  description,
  ...(opts.min !== undefined ? { minimum: opts.min } : {}),
  ...(opts.max !== undefined ? { maximum: opts.max } : {}),
});

export const bool = (description: string) => ({ type: "boolean" as const, description });

export const arr = (description: string, items: unknown) => ({
  type: "array" as const,
  description,
  items,
});

/** Build an object schema. Suffix a key with `!` to mark it required. */
export function obj(props: Record<string, unknown>): JsonSchema {
  const properties: Record<string, unknown> = {};
  const required: string[] = [];
  for (const [k, v] of Object.entries(props)) {
    const key = k.endsWith("!") ? k.slice(0, -1) : k;
    if (k.endsWith("!")) required.push(key);
    properties[key] = v;
  }
  return { type: "object", properties, required, additionalProperties: false };
}

/** The empty-args schema, for tools that take no input. */
export const noArgs: JsonSchema = {
  type: "object",
  properties: {},
  required: [],
  additionalProperties: false,
};
