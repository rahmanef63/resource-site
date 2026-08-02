// ════════════════════════════════════════════════════════════════════════
//  THE BACKEND SWITCH — change ONE line to move the WHOLE File Explorer
//  between data sources. Every component/hook is backend-agnostic, so nothing
//  else changes when you flip this.
//
//    "mock"   → bundled in-memory tree. Zero backend, fully writable. Default.
//    "live"   → REST host filesystem at NEXT_PUBLIC_FILES_API_URL
//               (os-vps /api/v1/fs shape). See ../adapter/live.ts.
//    "convex" → self-hosted Convex fs functions. PREPARED but inert until you
//               wire your client in the `convex` case below (os-vps does not
//               use Convex, so the slice stays Convex-free out of the box).
//               See ../adapter/convex.ts.
//
//  Per-environment override (no code edit): set
//    NEXT_PUBLIC_FILE_EXPLORER_BACKEND=live|convex
//  The default constant below wins when that env var is unset.
// ════════════════════════════════════════════════════════════════════════

import type { FileExplorerAdapter } from "../adapter/types";
import { createMockAdapter } from "../adapter/mock";
import { createLiveAdapter } from "../adapter/live";
// import { createConvexAdapter } from "../adapter/convex"; // ← uncomment for convex

export type BackendKind = "mock" | "live" | "convex";

/** ← EDIT THIS to set the default data source for the whole explorer. */
export const FILE_EXPLORER_BACKEND: BackendKind =
  (process.env.NEXT_PUBLIC_FILE_EXPLORER_BACKEND as BackendKind) || "mock";

/** Base URL for the "live" REST backend (host fs / S3 gateway). */
const LIVE_BASE_URL = process.env.NEXT_PUBLIC_FILES_API_URL || "/api/v1/fs";

// One adapter per process — a re-render must NOT spin up a fresh mock (resets
// the tree) or a fresh live client. Memoized lazily on first use.
let cached: FileExplorerAdapter | null = null;

export function getFileExplorerAdapter(): FileExplorerAdapter {
  return (cached ??= createAdapter(FILE_EXPLORER_BACKEND));
}

function createAdapter(kind: BackendKind): FileExplorerAdapter {
  switch (kind) {
    case "live":
      return createLiveAdapter({ baseUrl: LIVE_BASE_URL });
    case "convex":
      // PREPARED — wire your generated client + api here, e.g.:
      //   import { ConvexHttpClient } from "convex/browser";
      //   import { api } from "@convex/_generated/api";
      //   return createConvexAdapter({
      //     client: new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!),
      //     api: api.features.fileExplorer,
      //   });
      throw new Error(
        "[file-explorer] backend=convex but not wired — see lib/backend.ts + adapter/convex.ts",
      );
    case "mock":
    default:
      return createMockAdapter();
  }
}
