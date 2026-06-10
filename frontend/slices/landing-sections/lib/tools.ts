// Agentic tool collection — the page-builder surface. Ctx is the slice's own
// LandingStore adapter (landing-context.tsx): templates already supply
// items/create/update/remove from their dispatch, so ONE agent can compose
// the landing page exactly like the admin LandingView does.

import { defineToolCollection, obj, str, num, bool } from "@/shared/agentic";
import type { LandingStore } from "../landing-context";
import type { LandingSection, LandingSectionKind, AspectRatio } from "../types";

export type LandingToolsCtx = { store: LandingStore };

const KINDS = [
  "hero", "features", "testimonials", "pricing", "blog", "changelog",
  "faq", "portfolio", "services", "stats", "newsletter", "cta", "custom",
] as const;

const RATIOS = ["16:9", "4:3", "1:1", "3:2", "21:9", "auto"] as const;

const PATCH_PROPS = {
  title: str("section heading (also the admin label)"),
  subtitle: str("subtitle / lead paragraph"),
  kind: str("section type — picks which canonical slice renders", { enum: KINDS }),
  order: num("render order; lower renders first"),
  enabled: bool("hide on the page without deleting"),
  imageUrl: str("foreground image url (hero illustration, feature graphic)"),
  imageRatio: str("foreground image aspect ratio", { enum: RATIOS }),
  bgImageUrl: str("decorative full-bleed background image url"),
  className: str("extra Tailwind classes on the section wrapper"),
  config: str("free-form JSON string for kind-specific extras, e.g. {\"badge\":\"New\"}"),
};

function brief(s: LandingSection): string {
  return `${s.id} #${s.order} [${s.kind}] "${s.title}"${s.enabled ? "" : " (disabled)"}`;
}

export const landingSectionsTools = defineToolCollection<LandingToolsCtx>({
  namespace: "landing-sections",
  instructions:
    "Page-builder for the landing page: list shows current sections, add/update " +
    "compose it, remove deletes (destructive — confirm first). Prefer " +
    "enabled:false over remove when the user might want a section back.",
  describe: (ctx) => `${ctx.store.items.length} landing section(s)`,
  tools: [
    {
      name: "list",
      description: "List landing sections in render order (id, kind, order, title, enabled).",
      parameters: obj({}),
      run: (ctx) => {
        const items = [...ctx.store.items].sort((a, b) => a.order - b.order);
        return items.length ? items.map(brief).join("\n") : "no sections yet";
      },
    },
    {
      name: "add",
      description: "Add a landing section. Appends to the end unless `order` is given.",
      parameters: obj({
        "kind!": str("section type", { enum: KINDS }),
        "title!": str("section heading"),
        ...{ subtitle: PATCH_PROPS.subtitle, order: PATCH_PROPS.order, enabled: PATCH_PROPS.enabled },
      }),
      run: (ctx, a) => {
        const maxOrder = Math.max(0, ...ctx.store.items.map((s) => s.order));
        const section: LandingSection = {
          id: `s-${crypto.randomUUID().slice(0, 8)}`,
          kind: a.kind as LandingSectionKind,
          title: a.title as string,
          subtitle: a.subtitle as string | undefined,
          order: typeof a.order === "number" ? a.order : maxOrder + 1,
          enabled: a.enabled !== false,
        };
        ctx.store.create(section);
        return `added ${brief(section)}`;
      },
    },
    {
      name: "update",
      description: "Merge-patch a landing section by id (copy, kind, order, enabled, images, className, config).",
      parameters: obj({ "id!": str("section id (see list)"), ...PATCH_PROPS }),
      run: (ctx, a) => {
        const { id, ...patch } = a as { id: string } & Partial<Omit<LandingSection, "id">>;
        if (!ctx.store.items.some((s) => s.id === id)) throw new Error(`no section "${id}"`);
        ctx.store.update(id, { ...(patch as Partial<Omit<LandingSection, "id">>), imageRatio: patch.imageRatio as AspectRatio | undefined });
        return `updated ${id}: ${Object.keys(patch).join(", ") || "(nothing)"}`;
      },
    },
    {
      name: "remove",
      dangerous: true,
      description: "Delete a landing section permanently. Prefer update {enabled:false} to just hide it.",
      parameters: obj({ "id!": str("section id (see list)") }),
      run: (ctx, a) => {
        const id = a.id as string;
        if (!ctx.store.items.some((s) => s.id === id)) throw new Error(`no section "${id}"`);
        ctx.store.remove(id);
        return `removed ${id}`;
      },
    },
  ],
});
