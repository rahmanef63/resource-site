// Slice "Details" tab — bento layout, scroll-confined.
//
// Earlier version stacked everything vertically and let the AI prompt's
// 30+ line markdown block dominate the viewport. CK-2A redesign:
//   - Hero strip = install command + action chips (no full card)
//   - 4-card bento grid scrolls inside each card (no page bleed)
//   - AI prompt is a COLLAPSIBLE; default closed, ScrollArea wraps the
//     code so opening it doesn't push everything off-screen
//   - Related features + footer actions sit below in their own rows
//
// Sub-pieces extracted to sibling files to honour 200-LOC gate:
//   hero-strip.tsx · bento-metadata.tsx · agent-prompt-collapsible.tsx

"use client";

import Link from "next/link";
import { ExternalLink, Plug } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { RelatedFeatures, type RelatedGroup } from "@/components/site/related-features";
import { DocCard } from "@/components/site/doc-primitives";
import type { SliceEntry } from "@/lib/content/slices";
import { buildSliceAgentPrompt } from "@/lib/slice-agent-prompt";
import { HeroStrip } from "./hero-strip";
import { BentoMetadata } from "./bento-metadata";
import { AgentPromptCollapsible } from "./agent-prompt-collapsible";

export function DetailsTab({
  slice,
  relatedGroups,
  sourceHref,
  installCommand,
}: {
  slice: SliceEntry;
  relatedGroups: RelatedGroup[];
  sourceHref: string;
  installCommand: string;
}) {
  const agentPrompt = slice.agentRecipe ? buildSliceAgentPrompt(slice) : "";

  return (
    <div className="h-full overflow-auto">
      <div className="mx-auto max-w-5xl space-y-4 p-4">
        <HeroStrip
          installCommand={installCommand}
          updateCommand={`npx rahman-resources update ${slice.slug}`}
          sourceHref={sourceHref}
          description={slice.description}
          agentPrompt={agentPrompt}
        />

        <BentoMetadata slice={slice} />

        {slice.providers && slice.providers.length > 0 && (
          <ProvidersStrip providers={slice.providers} />
        )}

        {slice.agentRecipe && (
          <AgentPromptCollapsible
            slug={slice.slug}
            recipe={slice.agentRecipe}
            prompt={agentPrompt}
          />
        )}

        <RelatedFeatures groups={relatedGroups} />

        <div className="flex flex-wrap items-center justify-end gap-2 pt-2">
          <Button asChild variant="ghost" size="sm">
            <Link href={sourceHref} target="_blank" rel="noreferrer">
              View source <ExternalLink className="size-3" />
            </Link>
          </Button>
          <Button asChild variant="outline" size="sm">
            <Link href="/slices">Back to catalog</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}

function ProvidersStrip({ providers }: { providers: string[] }) {
  return (
    <DocCard className="flex flex-wrap items-center gap-2 px-3 py-2">
      <Plug className="size-3.5 shrink-0 text-muted-foreground" />
      <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
        Providers
      </span>
      {providers.map((p) => (
        <Badge key={p} variant="secondary" className="capitalize text-[10px]">{p}</Badge>
      ))}
    </DocCard>
  );
}
