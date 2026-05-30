/**
 * files slice contract.
 *
 * Host-pluggable upload + URL resolution. Ships NO backend coupling — the
 * consumer wires a `FilesAdapter` (Convex / S3 / localStorage) via
 * `FilesAdapterProvider`. `localStorageAdapter` is the rr-default; a Convex
 * adapter is host-only (skip-listed in rr-sync.json). See adapter/types.ts.
 */

import { defineSliceContract } from "@/packages/cli/lib/contract";

export const contract = defineSliceContract({
  id: "files",
  version: "0.1.0",
  category: "ui",
  kind: "ui",
  provides: {
    components: ["FileChip", "FileUploadButton", "FilesAdapterProvider"],
    utils: ["parseFileRef", "makeStorageRef"],
    hooks: [
      "useFileUpload",
      "useFileUrl",
      "useFilesAdapter",
      "useLocalStorageFilesAdapter",
    ],
    convex: {
      tables: [],
      rbac: [],
    },
  },
  requires: {
    deps: [
      { npm: "next", range: "^15" },
      { npm: "react", range: "^18" },
      { npm: "lucide-react", range: "^0.400.0" },
    ],
    shadcn: ["button"],
    env: [],
    peers: [],
  },
  conflicts: [],
});
