import type {
  FileExplorerAdapter,
  FsList,
  FsUsage,
  UploadResult,
} from "./types";

// PREPARED Convex backend. This slice imports NOTHING from `@convex` so the
// build stays green on hosts that don't use Convex (e.g. os-vps). To go live,
// deploy the fs functions below, then wire this factory in lib/backend.ts:
//
//   import { ConvexHttpClient } from "convex/browser";
//   import { api } from "@convex/_generated/api";
//   const client = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!);
//   return createConvexAdapter({ client, api: api.features.fileExplorer });
//
// Expected Convex module `convex/features/file-explorer/index.ts`:
//   list   = query   ({ path:v.string() })                  -> FsList
//   mkdir  = mutation({ path:v.string() })
//   remove = mutation({ path:v.string() })
//   move   = mutation({ from:v.string(), to:v.string() })
//   copy   = mutation({ from:v.string(), to:v.string() })
//   write  = mutation({ path:v.string(), content:v.string() })
//   usage  = query   ({})                                   -> FsUsage
//   upload = action  ({ dest:v.string(), storageIds:v.array(v.id("_storage")) }) -> UploadResult
//   rawUrl = query   ({ path:v.string() })                  -> string

// Structural client — matches ConvexHttpClient / ConvexReactClient WITHOUT
// importing convex, so a non-Convex host never pulls the dependency.
export type ConvexLike = {
  query: (ref: unknown, args?: Record<string, unknown>) => Promise<unknown>;
  mutation: (ref: unknown, args?: Record<string, unknown>) => Promise<unknown>;
  action?: (ref: unknown, args?: Record<string, unknown>) => Promise<unknown>;
};

// The generated `api.features.fileExplorer.*` function references (opaque refs).
export type FsFunctionRefs = {
  list: unknown;
  mkdir: unknown;
  remove: unknown;
  move: unknown;
  copy: unknown;
  write: unknown;
  usage: unknown;
  upload?: unknown;
  rawUrl?: unknown;
};

export function createConvexAdapter({
  client,
  api,
}: {
  client: ConvexLike;
  api: FsFunctionRefs;
}): FileExplorerAdapter {
  return {
    mode: "live",
    list: (path) => client.query(api.list, { path }) as Promise<FsList>,
    mkdir: (path) => client.mutation(api.mkdir, { path }),
    remove: (path) => client.mutation(api.remove, { path }),
    move: (from, to) => client.mutation(api.move, { from, to }),
    copy: (from, to) => client.mutation(api.copy, { from, to }),
    write: (path, content) => client.mutation(api.write, { path, content }),
    usage: () => client.query(api.usage, {}) as Promise<FsUsage>,
    upload: async (dest, files) => {
      if (!client.action || !api.upload)
        throw new Error(
          "[file-explorer] convex upload needs an action + storage flow — see adapter/convex.ts",
        );
      // Real flow: generateUploadUrl → PUT each file.file → collect storageIds →
      // call the upload action. Wire that in the consumer; this is the call shape.
      return client.action(api.upload, {
        dest,
        files: files.map((f) => f.relPath),
      }) as Promise<UploadResult>;
    },
    // Convex storage URLs are async; resolve via api.rawUrl in the consumer if
    // thumbnails are needed. Default "" => icon fallback (no network on render).
    rawUrl: () => "",
  };
}
