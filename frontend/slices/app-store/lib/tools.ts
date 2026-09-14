import { setInstalled, type AppRow } from "./apps-core";
import { CATALOG } from "./store-catalog";

export type AppStoreCtx = { apps: AppRow[] };

type ToolParams = {
  type: "object";
  properties: Record<string, unknown>;
  required: string[];
  additionalProperties: false;
};

const noArgs: ToolParams = { type: "object", properties: {}, required: [], additionalProperties: false };
const textArgs = (name: string, description: string): ToolParams => ({
  type: "object",
  properties: { [name]: { type: "string", description } },
  required: [name],
  additionalProperties: false,
});

const catalogEntry = (appId: string) => CATALOG.find((c) => c.appId === appId);

export const appStoreTools = {
  namespace: "app-store",
  instructions: "Browse and manage installable apps. Search/list before install or uninstall.",
  describe: (ctx: AppStoreCtx) => `${ctx.apps.filter((a) => a.installed).length} apps installed`,
  tools: [
    {
      name: "list",
      description: "List the store catalog with installed state.",
      parameters: noArgs,
      run: (ctx: AppStoreCtx) => {
        const state = new Map(ctx.apps.map((a) => [a.appId, a.installed]));
        return CATALOG.map((c) => `${c.appId} "${c.title}" [${c.category}] ${state.get(c.appId) ?? c.installed ? "installed" : "available"}`).join("\n");
      },
    },
    {
      name: "search",
      description: "Search the catalog by title or description.",
      parameters: textArgs("query", "search text"),
      run: (_ctx: AppStoreCtx, args: Record<string, unknown>) => {
        const q = String(args.query ?? "").toLowerCase();
        const hits = CATALOG.filter((c) => c.title.toLowerCase().includes(q) || c.desc.toLowerCase().includes(q));
        return hits.map((c) => `${c.appId} "${c.title}" — ${c.desc}`).join("\n") || "no matches";
      },
    },
    {
      name: "install",
      description: "Install a catalog app by appId.",
      parameters: textArgs("appId", "catalog app id"),
      run: (_ctx: AppStoreCtx, args: Record<string, unknown>) => {
        const entry = catalogEntry(String(args.appId ?? ""));
        if (!entry) return `unknown app "${args.appId}"`;
        setInstalled({ ...entry, installed: true });
        return `installed ${entry.title}`;
      },
    },
    {
      name: "uninstall",
      description: "Uninstall an app by appId.",
      parameters: textArgs("appId", "app id"),
      dangerous: true,
      run: (ctx: AppStoreCtx, args: Record<string, unknown>) => {
        const appId = String(args.appId ?? "");
        const row = ctx.apps.find((x) => x.appId === appId) ?? catalogEntry(appId);
        if (!row) return `unknown app "${appId}"`;
        setInstalled({ appId: row.appId, installed: false, title: row.title, glyph: row.glyph, gradient: row.gradient, runtime: row.runtime, entry: row.entry });
        return `uninstalled ${row.title}`;
      },
    },
  ],
};
