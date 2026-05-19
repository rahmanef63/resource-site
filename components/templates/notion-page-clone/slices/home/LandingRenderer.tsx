"use client";

import {
  HeroBlock,
  CtaBand,
} from "@/components/templates/_shared";
import { LandingSectionShell } from "@/components/templates/_shared/landing/LandingSectionShell";
import {
  FeatureGridSection,
  type FeatureItem as SliceFeatureItem,
} from "@/features/feature-grid";
import {
  EquationBlock,
  CodeBlock,
  NotifyMePopover,
} from "@/features/notion-blocks";
import { DEFAULT_SITE_CONFIG } from "../../shared/site-config";
import { PUBLIC_BASE } from "../../shared/nav-config";
import type { LandingSection } from "../../shared/types";
import { useSnippets } from "../../shared/store";

const SHARED_CLS = "border-b border-border/60 !py-12 sm:!py-16";

const PRIMITIVE_FEATURES: SliceFeatureItem[] = [
  { id: "f-eq",   icon: "Sigma",      title: "KaTeX equation block",   body: "LaTeX renders in display mode. Click pencil to edit. Pure-UI, no convex." },
  { id: "f-code", icon: "Code2",      title: "highlight.js code",       body: "Language picker + copy. github-dark theme bundled. Streaming-friendly." },
  { id: "f-bell", icon: "Bell",       title: "Per-page subscriptions",  body: "Drop a NotifyMePopover on any page. State persists in localStorage." },
  { id: "f-grid", icon: "TableProperties", title: "Drag-fill grid",     body: "useDragFill hook + SelectableCell wrapper. Host owns data + rowIds." },
];

/** Maps a LandingSection.kind to a renderer. notion-page-clone-os
 *  shows hero / cta / features at top, then snippets gallery below. */
export function renderLanding(section: LandingSection) {
  switch (section.kind) {
    case "hero":
      return (
        <LandingSectionShell section={section}>
          <HeroBlock
            badge={DEFAULT_SITE_CONFIG.tagline}
            title={section.title}
            subtitle={section.subtitle ?? DEFAULT_SITE_CONFIG.description}
            primaryCta={DEFAULT_SITE_CONFIG.ctaPrimary}
            secondaryCta={{ label: "Browse snippets", href: `${PUBLIC_BASE}/snippets` }}
            image={section.imageUrl ? { url: section.imageUrl, ratio: section.imageRatio } : undefined}
          />
        </LandingSectionShell>
      );
    case "features":
      return (
        <LandingSectionShell section={section}>
          <FeatureGridSection
            eyebrow={section.subtitle ?? "What ships in notion-blocks"}
            title={section.title}
            items={PRIMITIVE_FEATURES}
            layout="cards"
            className={SHARED_CLS}
          />
        </LandingSectionShell>
      );
    case "cta":
      return (
        <LandingSectionShell section={section}>
          <CtaBand
            title={section.title}
            subtitle={section.subtitle ?? "One install. Four primitives. Zero shared-state coupling."}
            cta={DEFAULT_SITE_CONFIG.ctaPrimary}
            secondaryCta={{ label: "View slice", href: "/slices/notion-blocks" }}
          />
        </LandingSectionShell>
      );
    case "custom":
      return (
        <LandingSectionShell section={section}>
          <SnippetsGallery title={section.title} subtitle={section.subtitle} />
        </LandingSectionShell>
      );
    default:
      return null;
  }
}

function SnippetsGallery({ title, subtitle }: { title: string; subtitle?: string }) {
  const snippets = useSnippets()
    .filter((s) => s.published)
    .sort((a, b) => a.order - b.order);
  const equations = snippets.filter((s) => s.kind === "equation");
  const codes = snippets.filter((s) => s.kind === "code");
  return (
    <section className="mx-auto max-w-4xl px-6 py-12">
      <div className="mb-8 flex items-start justify-between gap-4">
        <div>
          <h2 className="text-2xl font-semibold tracking-tight">{title}</h2>
          {subtitle && <p className="mt-1 text-sm text-muted-foreground">{subtitle}</p>}
        </div>
        <NotifyMePopover pageId="nosion-home" />
      </div>

      {equations.length > 0 && (
        <div className="mb-8">
          <h3 className="mb-3 text-xs font-medium uppercase tracking-wide text-muted-foreground">
            Equations
          </h3>
          <div className="grid gap-4 rounded-lg border border-border bg-card p-5">
            {equations.map((s) => (
              <div key={s.id}>
                <p className="mb-1 text-xs text-muted-foreground">{s.title}</p>
                <EquationBlock text={s.body} onText={() => {}} registerRef={() => {}} />
              </div>
            ))}
          </div>
        </div>
      )}

      {codes.length > 0 && (
        <div className="mb-4">
          <h3 className="mb-3 text-xs font-medium uppercase tracking-wide text-muted-foreground">
            Code snippets
          </h3>
          <div className="grid gap-4">
            {codes.map((s) => (
              <div key={s.id}>
                <p className="mb-1 text-xs text-muted-foreground">{s.title}</p>
                <CodeBlock
                  text={s.body}
                  lang={s.lang ?? "plaintext"}
                  registerRef={() => {}}
                  onText={() => {}}
                  onLang={() => {}}
                  onKeyDown={() => {}}
                />
              </div>
            ))}
          </div>
        </div>
      )}
    </section>
  );
}
