// Agentic tool collection. Ctx = the slice's injectable FilesAdapter (the
// same seam the components use). Upload takes a browser File so it has no
// agent surface; remove must be bound to a server-checked implementation.

import { defineToolCollection, obj, str } from "@/shared/agentic";
import { parseFileRef } from "./parse";

export type FilesToolsCtx = {
  /** Server-checked delete of a stored file. */
  remove: (ref: string) => Promise<string>;
};

export const filesTools = defineToolCollection<FilesToolsCtx>({
  namespace: "files",
  tools: [
    {
      name: "parse_ref",
      description: "Parse a FileRef string into { storageId, name }.",
      parameters: obj({ "ref!": str("file ref string") }),
      run: (_ctx, a) => JSON.stringify(parseFileRef(a.ref as string)),
    },
    {
      name: "remove",
      dangerous: true,
      description: "Delete a stored file by ref (server-checked). Irreversible — confirm with the user first.",
      parameters: obj({ "ref!": str("file ref string") }),
      run: (ctx, a) => ctx.remove(a.ref as string),
    },
  ],
});
