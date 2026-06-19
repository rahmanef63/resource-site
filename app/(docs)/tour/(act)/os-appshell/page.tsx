import { notFound } from "next/navigation";
import { acts, getAct } from "@/lib/content/tour";
import { getSlice } from "@/lib/content/slices";
import { ActHeader } from "@/components/site/tour/act-header";
import {
  SliceShowcase,
  type ShowcaseSlice,
} from "@/components/site/tour/slice-showcase";
import { IframeThumbnail } from "@/components/site/catalog/iframe-thumbnail";
import { CopyButton } from "@/components/site/copy-button";
import { Badge } from "@/components/ui/badge";

const ACT_ID = "os-appshell";

export const metadata = {
  title: "Act II — OS & App Shell | Grand Tour",
  description:
    "An assembled web OS: the manifest-driven window manager + mobile surface mounted live as the centerpiece, then the shells, primitives, and desktop apps that run inside it — each mounted live with its add recipe.",
};

/**
 * The Act II headline is appshell itself — the live windowed OS. It is FEATURED
 * full-width above the sections (not folded into one) by iframing its preview
 * ROUTE (`getSlice("appshell").previewPath` → /preview/slices/appshell), which
 * mounts the real <AppShell> window manager in its own document. We deliberately
 * do NOT LazySliceMount slug="appshell": the PREVIEW_REGISTRY entry for appshell
 * is only a 360px scaled static AppFrame mockup, and inlining <AppShell> would
 * risk a provider/window-store double-mount. The iframe gives provider isolation
 * + a real viewport, so it reads as a live OS. It stays code-split — IframeThumbnail
 * is lazy via its own IntersectionObserver (no eager heavy load).
 *
 * The remaining 18 slugs are grouped into three readable sections (curated
 * order, mirroring the marketing page): the chrome every app lives in, the UI
 * primitives + feedback states, and the heavy desktop apps that run INSIDE the
 * OS. Desktop apps land LAST so the monaco/xterm/telemetry/browser chunks stay
 * below the fold and only load on scroll. A "More shell" catch-all absorbs any
 * future os-appshell slug so nothing silently vanishes (audit:tour enforces a
 * total + disjoint partition against the live catalog).
 */
const FEATURED = "appshell";

const SECTIONS: { heading: string; blurb: string; slugs: string[] }[] = [
  {
    heading: "App shells",
    blurb:
      "The chrome every app lives in: the dashboard shell, the three-column reading layout, and the workspace shell.",
    slugs: ["dashboard-shell", "three-column", "workspace-shell"],
  },
  {
    heading: "UI primitives & states",
    blurb:
      "The building blocks and feedback surfaces: command palette, settings, notifications, dialogs, selection, plus the empty/loading states and quicklinks that finish a screen.",
    slugs: [
      "command-menu",
      "settings-page",
      "shell-settings",
      "notifications-center",
      "responsive-dialog",
      "selection",
      "empty-states",
      "loading-states",
      "quicklinks",
    ],
  },
  {
    heading: "Desktop apps",
    blurb:
      "The apps that run inside the OS — mostly heavy, mostly iframe-isolated so monaco, xterm, live telemetry, and the headless browser only load when you scroll to them.",
    slugs: [
      "file-explorer",
      "code-editor",
      "os-terminal",
      "system-monitor",
      "browser",
      "app-store",
    ],
  },
];

function toShowcase(slug: string, liveMount: boolean): ShowcaseSlice {
  const slice = getSlice(slug);
  return {
    slug,
    title: slice?.title ?? slug,
    recipe: slice?.install ?? `npx rahman-resources add ${slug}`,
    previewPath: slice?.previewPath,
    liveMount,
  };
}

export default function OsAppShellActPage() {
  const act = getAct(ACT_ID);
  if (!act) notFound();

  const i = acts.findIndex((a) => a.id === ACT_ID);
  const prev = i > 0 ? acts[i - 1] : null;
  const next = i < acts.length - 1 ? acts[i + 1] : null;

  // liveMount lookup keyed by slug, so curated order can diverge from catalog.
  const liveBySlug = new Map(act.sliceSlugs.map((s) => [s.slug, s.liveMount]));

  // FEATURED is rendered on its own above the sections — add it to `placed` so
  // the leftover catch-all never double-renders the OS centerpiece.
  const placed = new Set<string>([FEATURED, ...SECTIONS.flatMap((s) => s.slugs)]);
  const leftover = act.sliceSlugs.filter((s) => !placed.has(s.slug));

  const sections = [
    ...SECTIONS,
    ...(leftover.length > 0
      ? [
          {
            heading: "More shell",
            blurb: "Additional OS & app-shell slices in this act.",
            slugs: leftover.map((s) => s.slug),
          },
        ]
      : []),
  ];

  const appshell = getSlice(FEATURED);
  const appshellRecipe = appshell?.install ?? `npx rahman-resources add ${FEATURED}`;

  return (
    <>
      <ActHeader act={act} prev={prev} next={next} />

      {/* The OS centerpiece — a live, full-bleed window manager (iframed route,
          provider-isolated). scale=1 keeps the chrome crisp; the tall surface
          reads as a real desktop. Lazy via IframeThumbnail's own observer. The
          recipe is surfaced inline (NOT via SliceShowcase, whose PREVIEW_REGISTRY
          path for appshell would re-render the 360px static mockup). */}
      {appshell?.previewPath && (
        <section className="space-y-4">
          <div className="flex flex-wrap items-center gap-2">
            <div className="min-w-0 space-y-1">
              <h2 className="text-xl font-bold tracking-tight">
                A whole OS, assembled
              </h2>
              <p className="text-sm text-muted-foreground">
                {appshell.tagline ??
                  "The manifest-driven window manager — drag/snap/maximize, dock, ⌘K Spotlight, and an iOS-style mobile surface, all from one slice."}
              </p>
            </div>
            <Badge variant="outline" className="rounded-full text-[10px]">
              {FEATURED}
            </Badge>
            <code className="rounded bg-muted/50 px-2 py-1 font-mono text-xs text-muted-foreground">
              {appshellRecipe}
            </code>
            <CopyButton value={appshellRecipe} size="icon" className="h-7 w-7 shrink-0" />
          </div>
          <div className="relative h-[70svh] min-h-[560px] w-full overflow-hidden rounded-lg border bg-card">
            <IframeThumbnail
              src={appshell.previewPath}
              liveTitle={appshell.title}
              scale={1}
              aspect="auto"
              className="absolute inset-0 h-full"
            />
          </div>
        </section>
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
