import { notFound } from "next/navigation";
import { acts, getAct } from "@/lib/content/tour";
import { getSlice } from "@/lib/content/slices";
import { ActHeader } from "@/components/site/tour/act-header";
import {
  SliceShowcase,
  type ShowcaseSlice,
} from "@/components/site/tour/slice-showcase";
import { LazySliceMount } from "@/components/site/tour/lazy-slice-mount";
import { CopyButton } from "@/components/site/copy-button";
import { Badge } from "@/components/ui/badge";

const ACT_ID = "content";

export const metadata = {
  title: "Act V — Content | Grand Tour",
  description:
    "Document-grade editorial surfaces: the full Notion block editor featured live as the centerpiece, then its shell/sidebar/database, threaded comments, the markdown container with diagrams, the resource library, the TanStack data table, the icon picker, and the public activity log — each mounted live with its add recipe.",
};

/**
 * The Act V headline is `notion` — the live block editor. It is FEATURED
 * full-width above the sections (mirroring os-appshell's FEATURED=appshell
 * pattern), but via <LazySliceMount slug="notion"> rather than an iframe:
 * notion is registry-only (in PREVIEW_REGISTRY, no previewPath), so the live
 * widget IS the only mount path. LazySliceMount keeps the heavy blocknote/
 * tiptap/dnd-kit chunk code-split (next/dynamic ssr:false + IntersectionObserver)
 * so it only loads when scrolled into view — no eager heavy load even though it
 * sits near the top.
 *
 * The remaining 9 slugs are grouped into three readable sections (curated order,
 * mirroring marketing/os-appshell): the Notion stack chrome, the write-and-
 * collaborate surfaces, and the supporting data/polish surfaces. The heavy
 * slugs (markdown = mermaid/recharts/katex, data-table = tanstack) land LAST in
 * their sections so those chunks stay below the fold and only load on scroll
 * (LazySliceMount). Every slug in this Act is registry-inline, so SliceShowcase
 * routes each to LazySliceMount; any future key-gated Act V slug would auto-
 * render as an honest CapabilityCard (delegated by SliceShowcase on
 * liveMount:false — no per-page branch). A "More content" catch-all absorbs any
 * future Act V slug so nothing silently vanishes (audit:tour enforces a total +
 * disjoint partition against the live catalog).
 */
const FEATURED = "notion";

const SECTIONS: { heading: string; blurb: string; slugs: string[] }[] = [
  {
    heading: "The Notion stack",
    blurb:
      "A document workspace in slices: the page shell, the tree-nav sidebar, and the 11-view database that wrap the featured block editor above.",
    slugs: ["notion-shell", "notion-sidebar", "notion-database"],
  },
  {
    heading: "Write & collaborate",
    blurb:
      "Author and discuss: the markdown container with mermaid/recharts/katex and threaded comments.",
    slugs: ["comments", "markdown"],
  },
  {
    heading: "Data & polish",
    blurb:
      "The supporting surfaces: the resource library, the emoji/lucide/phosphor icon picker, the public activity log, and the TanStack data table.",
    slugs: ["library", "icon-picker", "activity", "data-table"],
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
    // Copy for the static fallback + delegated CapabilityCard static variant.
    description: slice?.description,
    tagline: slice?.tagline,
  };
}

export default function ContentActPage() {
  const act = getAct(ACT_ID);
  if (!act) notFound();

  const i = acts.findIndex((a) => a.id === ACT_ID);
  const prev = i > 0 ? acts[i - 1] : null;
  const next = i < acts.length - 1 ? acts[i + 1] : null;

  // liveMount lookup keyed by slug, so curated order can diverge from catalog.
  const liveBySlug = new Map(act.sliceSlugs.map((s) => [s.slug, s.liveMount]));

  // FEATURED is rendered on its own above the sections — add it to `placed` so
  // the leftover catch-all never double-renders the editor centerpiece.
  const placed = new Set<string>([FEATURED, ...SECTIONS.flatMap((s) => s.slugs)]);
  const leftover = act.sliceSlugs.filter((s) => !placed.has(s.slug));

  const sections = [
    ...SECTIONS,
    ...(leftover.length > 0
      ? [
          {
            heading: "More content",
            blurb: "Additional content & editorial slices in this act.",
            slugs: leftover.map((s) => s.slug),
          },
        ]
      : []),
  ];

  const notion = getSlice(FEATURED);
  const notionRecipe = `npx rahman-resources add ${FEATURED}`;
  const notionLive = liveBySlug.get(FEATURED) ?? true;

  return (
    <>
      <ActHeader act={act} prev={prev} next={next} />

      {/* The editorial centerpiece — the live block editor, full-width. notion
          is registry-only (no previewPath), so it mounts via LazySliceMount; the
          heavy blocknote/tiptap/dnd-kit chunk stays code-split and only loads on
          scroll. The recipe is surfaced inline (NOT via SliceShowcase) so the
          centerpiece reads full-bleed. Future-proofed: if notion were ever
          key-gated, fall through to SliceShowcase (→ CapabilityCard). */}
      {notionLive ? (
        <section className="space-y-4">
          <div className="flex flex-wrap items-center gap-2">
            <div className="min-w-0 space-y-1">
              <h2 className="text-xl font-bold tracking-tight">
                A Notion-grade block editor
              </h2>
              <p className="text-sm text-muted-foreground">
                {notion?.tagline ??
                  "Slash menu, drag-to-reorder blocks, nested pages, and rich text — the document editor that anchors the whole content stack."}
              </p>
            </div>
            <Badge variant="outline" className="rounded-full text-[10px]">
              {FEATURED}
            </Badge>
            <code className="rounded bg-muted/50 px-2 py-1 font-mono text-xs text-muted-foreground">
              {notionRecipe}
            </code>
            <CopyButton value={notionRecipe} size="icon" className="h-7 w-7 shrink-0" />
          </div>
          <div className="overflow-hidden rounded-lg border bg-card">
            <LazySliceMount slug={FEATURED} />
          </div>
        </section>
      ) : (
        <SliceShowcase {...toShowcase(FEATURED, notionLive)} />
      )}

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
