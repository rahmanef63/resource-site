// Slice "Details" tab — consolidates metadata that USED to live as a
// tall pile above the FeatureBar. Now it's a proper tab content,
// scrollable, matching the Code/Public/Split/Admin tab layout chrome.
//
// BS-fix (2026-05-20).

import Link from "next/link";
import { Bot, ExternalLink, Layers, Package, Plug, Server, Settings2, Terminal } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ShowcaseCard } from "@/components/site/catalog/showcase-card";
import { CodeBlock } from "@/components/site/code-block";
import { RelatedFeatures, type RelatedGroup } from "@/components/site/related-features";
import type { SliceEntry } from "@/lib/content/slices";

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="mb-2 last:mb-0">
      <div className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
        {label}
      </div>
      <div className="mt-1">{children}</div>
    </div>
  );
}

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
  return (
    <div className="h-full space-y-4 overflow-auto p-4">
      <ShowcaseCard
        icon={Terminal}
        label="Install"
        variant="code"
        actions={
          <Button asChild variant="ghost" size="sm" className="h-7 gap-1 px-2 text-xs">
            <a href={sourceHref} target="_blank" rel="noreferrer">
              View source <ExternalLink className="size-3" />
            </a>
          </Button>
        }
      >
        <CodeBlock code={installCommand} language="bash" filename="install.sh" />
      </ShowcaseCard>

      <p className="text-sm text-muted-foreground">{slice.description}</p>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <ShowcaseCard icon={Layers} label="Frontend">
          <Row label="Slice path">
            <code className="text-xs">{slice.slicePath}</code>
          </Row>
          {slice.shadcn && slice.shadcn.length > 0 && (
            <Row label="shadcn">
              <div className="mt-1 flex flex-wrap gap-1">
                {slice.shadcn.map((c) => (
                  <Badge key={c} variant="outline" className="text-[10px]">{c}</Badge>
                ))}
              </div>
            </Row>
          )}
        </ShowcaseCard>

        <ShowcaseCard icon={Server} label="Backend (Convex)">
          {slice.convexPaths && slice.convexPaths.length > 0 ? (
            slice.convexPaths.map((p) => (
              <Row key={p} label="Path">
                <code className="text-xs">{p}</code>
              </Row>
            ))
          ) : (
            <p className="text-xs text-muted-foreground">No Convex backend (frontend-only slice).</p>
          )}
        </ShowcaseCard>

        <ShowcaseCard icon={Package} label="npm packages">
          {slice.npm && slice.npm.length > 0 ? (
            <div className="flex flex-wrap gap-1.5">
              {slice.npm.map((p) => (
                <code key={p} className="rounded bg-muted px-2 py-0.5 text-[11px]">{p}</code>
              ))}
            </div>
          ) : (
            <p className="text-xs text-muted-foreground">No external npm deps.</p>
          )}
        </ShowcaseCard>

        <ShowcaseCard icon={Settings2} label="Environment">
          {slice.env && slice.env.length > 0 ? (
            <ul className="space-y-1.5">
              {slice.env.map((e) => (
                <li key={e.name} className="flex items-start gap-2">
                  <code className="rounded bg-muted px-1.5 py-0.5 text-[11px]">{e.name}</code>
                  <Badge variant="outline" className="shrink-0 text-[10px]">{e.scope}</Badge>
                  {e.description && (
                    <span className="text-xs text-muted-foreground">{e.description}</span>
                  )}
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-xs text-muted-foreground">No env vars required.</p>
          )}
        </ShowcaseCard>
      </div>

      {slice.providers && slice.providers.length > 0 && (
        <ShowcaseCard icon={Plug} label="Providers">
          <div className="flex flex-wrap gap-1.5">
            {slice.providers.map((p) => (
              <Badge key={p} variant="secondary" className="capitalize">{p}</Badge>
            ))}
          </div>
          <p className="mt-3 text-xs text-muted-foreground">
            Sub-providers live as siblings under{" "}
            <code className="rounded bg-muted px-1 py-0.5 text-[11px]">components/providers/</code>{" "}
            and{" "}
            <code className="rounded bg-muted px-1 py-0.5 text-[11px]">actions/</code>. Add a sibling
            to plug another vendor without API churn.
          </p>
        </ShowcaseCard>
      )}

      {slice.agentRecipe && (
        <ShowcaseCard icon={Bot} label="Agent recipe">
          <p className="text-sm text-muted-foreground">{slice.agentRecipe}</p>
        </ShowcaseCard>
      )}

      <RelatedFeatures groups={relatedGroups} />

      <div className="flex flex-wrap items-center gap-2 pt-2">
        <Button asChild variant="outline" size="sm">
          <Link href={sourceHref} target="_blank" rel="noreferrer">
            View source <ExternalLink className="size-3" />
          </Link>
        </Button>
        <Button asChild size="sm">
          <Link href="/slices">Back to catalog</Link>
        </Button>
      </div>
    </div>
  );
}
