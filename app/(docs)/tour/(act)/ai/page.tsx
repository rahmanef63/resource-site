import { notFound } from "next/navigation";
import { acts, getAct } from "@/lib/content/tour";
import { getSlice } from "@/lib/content/slices";
import { ActHeader } from "@/components/site/tour/act-header";
import {
  SliceShowcase,
  type ShowcaseSlice,
} from "@/components/site/tour/slice-showcase";

const ACT_ID = "ai";

export const metadata = {
  title: "Act IV — AI | Grand Tour",
  description:
    "A model-driven product end to end: the ChatGPT-style chat workbench, the generation studio, and the local-first assistant; autonomous agents + the AI admin console; and the backend that powers it — the tiered model router, semantic vector search, and the MCP token scaffolding — each previewing env-free with its add recipe.",
};

/**
 * Curated AI STORY over Act IV's slices, read top-to-bottom as the product comes
 * together: the user-facing chat surfaces (all env-free in the demo) → the
 * orchestration + operator console → the backend infra that goes live once you
 * bring your own keys. Authored by hand because the catalog carries no
 * sub-grouping signal at this granularity.
 *
 * Mounting is delegated entirely to SliceShowcase (no per-page liveMount branch):
 *   • key-gated (liveMount:false) → <CapabilityCard> (env-free demo iframe + a
 *     "needs <KEY>" badge — honest, never a dead live button)
 *   • PREVIEW_REGISTRY[slug]      → <LazySliceMount> (code-split, on-scroll)
 *   • else previewPath            → lazy <IframeThumbnail> of that route
 *   • else                        → static info card
 *
 * Heavy slugs ride to the END of their section / the last section so their
 * chunks (model SDKs, agent runtimes) stay below the fold and only load on
 * scroll. The 3 key-gated backend slices (ai-router, vector-search,
 * create-your-mcp) land LAST as the "bring your keys" section — they preview
 * env-free but their REAL action needs a provider key, so they render as
 * capability cards.
 *
 * Coverage: every slug in act.sliceSlugs lands in exactly one section; any
 * future Act IV slug not listed here falls through to the "More AI" catch-all
 * so it never silently vanishes (audit:tour enforces a total + disjoint
 * partition against the live catalog).
 */
const SECTIONS: { heading: string; blurb: string; slugs: string[] }[] = [
  {
    heading: "The chat product",
    blurb:
      "A model-driven app surface, env-free in the demo: the ChatGPT-style chat workbench, the generation studio, and the local-first assistant with user-built agents & skills.",
    slugs: ["ai-workspace", "assistant"],
  },
  {
    heading: "Agents & control",
    blurb:
      "Orchestration and the operator console: autonomous multi-step agents and the AI admin (providers, skills, models, moderation).",
    slugs: ["ai-admin"],
  },
  {
    heading: "The backend that powers it (bring your keys)",
    blurb:
      "The infra behind the surfaces — each previews env-free but needs a key to go live: the tiered model router, semantic vector search, and the MCP token scaffolding that exposes your tools to ChatGPT/Claude.",
    slugs: ["ai-router", "vector-search", "create-your-mcp"],
  },
];

function toShowcase(slug: string, liveMount: boolean): ShowcaseSlice {
  const slice = getSlice(slug);
  return {
    slug,
    title: slice?.title ?? slug,
    recipe: `npx rahman-resources add ${slug}`,
    previewPath: slice?.previewPath,
    liveMount,
    // Copy for the CapabilityCard static variant + the no-preview info card.
    description: slice?.description,
    tagline: slice?.tagline,
  };
}

export default function AiActPage() {
  const act = getAct(ACT_ID);
  if (!act) notFound();

  const i = acts.findIndex((a) => a.id === ACT_ID);
  const prev = i > 0 ? acts[i - 1] : null;
  const next = i < acts.length - 1 ? acts[i + 1] : null;

  // liveMount lookup keyed by slug, so curated order can diverge from catalog.
  const liveBySlug = new Map(act.sliceSlugs.map((s) => [s.slug, s.liveMount]));
  const placed = new Set(SECTIONS.flatMap((sec) => sec.slugs));
  const leftover = act.sliceSlugs.filter((s) => !placed.has(s.slug));

  const sections = [
    ...SECTIONS,
    ...(leftover.length > 0
      ? [
          {
            heading: "More AI",
            blurb: "Additional AI slices in this act.",
            slugs: leftover.map((s) => s.slug),
          },
        ]
      : []),
  ];

  return (
    <>
      <ActHeader act={act} prev={prev} next={next} />

      {sections.map((section) => (
        <section key={section.heading} className="space-y-4">
          <div className="space-y-1">
            <h2 className="text-xl font-bold tracking-tight">{section.heading}</h2>
            <p className="text-sm text-muted-foreground">{section.blurb}</p>
          </div>
          <div className="space-y-4">
            {section.slugs
              .filter((slug) => liveBySlug.has(slug))
              .map((slug) => (
                <SliceShowcase
                  key={slug}
                  {...toShowcase(slug, liveBySlug.get(slug) ?? true)}
                />
              ))}
          </div>
        </section>
      ))}
    </>
  );
}
