// convex-fallback.mjs — write types-only stubs for convex/_generated when
// `convex codegen` cannot run (no deployment, 401, offline CI, fresh init).
//
// Everything is emitted as `.d.ts` so nothing can ever be bundled: `tsc
// --noEmit` and `next build` typecheck cleanly with zero credentials. Real
// `convex codegen` output always wins because we never overwrite existing
// files and the CLI only calls this after codegen failed to emit anything.

import { existsSync, mkdirSync, writeFileSync } from "node:fs";
import path from "node:path";

const SERVER_DTS = `// AUTO-GENERATED (rr fallback) — types only. Run \`npx convex dev\` for the real file.
export type DataModel = any;
export type QueryCtx = { db: any; auth: any; storage: any };
export type MutationCtx = QueryCtx & { scheduler: any };
export type ActionCtx = QueryCtx & { runQuery: any; runMutation: any; runAction: any };

type Handler<C> = (ctx: C, args: any) => any;
type Def<C> = { args?: any; returns?: any; handler: Handler<C> };

export declare function query(def: Def<QueryCtx>): any;
export declare function mutation(def: Def<MutationCtx>): any;
export declare function action(def: Def<ActionCtx>): any;
export declare function internalQuery(def: Def<QueryCtx>): any;
export declare function internalMutation(def: Def<MutationCtx>): any;
export declare function internalAction(def: Def<ActionCtx>): any;
export declare function httpAction(def: (ctx: any, request: Request) => any): any;
`;

const API_DTS = `// AUTO-GENERATED (rr fallback) — types only. Run \`npx convex dev\` for the real file.
export declare const api: any;
export declare const internal: any;
export declare const components: any;
`;

const DATA_MODEL_DTS = `// AUTO-GENERATED (rr fallback) — types only. Run \`npx convex dev\` for the real file.
export type DataModel = any;
export type Id<TableName extends string = string> = string & { __tableName: TableName };
export type Doc<TableName extends string = string> = Record<string, any> & { _id: Id<TableName>; _creationTime: number };
export type TableNames = string;
`;

const FILES = {
  "server.d.ts": SERVER_DTS,
  "api.d.ts": API_DTS,
  "dataModel.d.ts": DATA_MODEL_DTS,
};

/**
 * Write convex/_generated stubs under `convexDir` (the project's convex/ dir).
 * Existing files are never overwritten. Returns the relative paths written.
 */
export function writeConvexFallback(convexDir) {
  const generated = path.join(convexDir, "_generated");
  mkdirSync(generated, { recursive: true });
  const written = [];
  for (const [name, body] of Object.entries(FILES)) {
    const dest = path.join(generated, name);
    if (existsSync(dest)) continue;
    writeFileSync(dest, body);
    written.push(path.join("_generated", name).split(path.sep).join("/"));
  }
  return written;
}

/** True when convex/_generated has the server module the starter imports. */
export function hasConvexGenerated(convexDir) {
  return existsSync(path.join(convexDir, "_generated", "server.d.ts")) ||
    existsSync(path.join(convexDir, "_generated", "server.js")) ||
    existsSync(path.join(convexDir, "_generated", "server.ts"));
}
