import { defineToolCollection, obj, str } from "@/shared/agentic";
import { parseFileRef } from "./parse";

export type FilesToolsCtx = {
  remove: (ref: string) => Promise<string>;
};

export const filesTools = defineToolCollection<FilesToolsCtx>({
  namespace: "files",
  instructions: "Lightweight file ops. parse_ref resolves a reference before remove; remove is permanent.",
  tools: [
    {
      name: "parse_ref",
      description: "Parse a FileRef string into its storage/url/name representation.",
      parameters: obj({ "ref!": str("file ref string") }),
      run: (_ctx, args) => JSON.stringify(parseFileRef(args.ref as string)),
    },
    {
      name: "remove",
      dangerous: true,
      description: "Delete a stored file by ref (server-checked). Irreversible — confirm with the user first.",
      parameters: obj({ "ref!": str("file ref string") }),
      run: (ctx, args) => ctx.remove(args.ref as string),
    },
  ],
});
