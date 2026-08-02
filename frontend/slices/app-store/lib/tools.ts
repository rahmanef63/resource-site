// Agentic tool collection. The slice is NOT an agent — it exports this
// collection of function-calling tools and ONE shared agent (e.g. the
// assistant host) drives it alongside other slices' collections via
// @/shared/agentic. State is the slice's module-level persisted registry,
// so the ctx only supplies the reactive rows snapshot (useApps()).

import { defineToolCollection, noArgs, obj, str } from "@/shared/agentic";
import { setInstalled, type AppRow } from "./apps-store";
import { CATALOG } from "./store-catalog";

export type AppStoreCtx = { apps: AppRow[] };

const catalogEntry = (appId: string) => CATALOG.find((c) => c.appId === appId);

export const appStoreTools = defineToolCollection<AppStoreCtx>({
  namespace: "app-store",
  instructions: "Browse and manage installable apps. Search or list before install/uninstall; uninstall removes an app from the workspace.",
  describe: (ctx) => `${ctx.apps.filter((a) => a.installed).length} apps installed`,
  tools: [
    {
      name: "list",
      description: "List the store catalog with each app's installed state.",
      parameters: noArgs,
      run: (ctx) => {
        const state = new Map(ctx.apps.map((a) => [a.appId, a.installed]));
        return CATALOG.map(
          (c) =>
            `${c.appId} "${c.title}" [${c.category}] ${state.get(c.appId) ?? c.installed ? "installed" : "available"}`,
        ).join("\n");
      },
    },
    {
      name: "search",
      description: "Search the catalog by title/description.",
      parameters: obj({ "query!": str("search text") }),
      run: (_ctx, a) => {
        const q = (a.query as string).toLowerCase();
        const hits = CATALOG.filter(
          (c) => c.title.toLowerCase().includes(q) || c.desc.toLowerCase().includes(q),
        );
        return hits.map((c) => `${c.appId} "${c.title}" — ${c.desc}`).join("\n") || "no matches";
      },
    },
    {
      name: "install",
      description: "Install a catalog app by its appId.",
      parameters: obj({ "appId!": str("catalog app id") }),
      run: (_ctx, a) => {
        const c = catalogEntry(a.appId as string);
        if (!c) return `unknown app "${a.appId}"`;
        setInstalled({ ...c, installed: true });
        return `installed ${c.title}`;
      },
    },
    {
      name: "uninstall",
      description: "Uninstall an app by its appId.",
      parameters: obj({ "appId!": str("app id") }),
      run: (ctx, a) => {
        const row = ctx.apps.find((x) => x.appId === a.appId) ?? catalogEntry(a.appId as string);
        if (!row) return `unknown app "${a.appId}"`;
        setInstalled({
          appId: row.appId,
          installed: false,
          title: row.title,
          glyph: row.glyph,
          gradient: row.gradient,
          runtime: row.runtime,
          entry: row.entry,
        });
        return `uninstalled ${row.title}`;
      },
    },
  ],
});
