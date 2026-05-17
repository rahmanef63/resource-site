import { Layers, Package, Plug, Server, Settings2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { ShowcaseCard } from "@/components/site/catalog/showcase-card";
import type { SliceEntry } from "@/lib/content/slices";

export function MetaCardsGrid({ slice }: { slice: SliceEntry }) {
  return (
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
  );
}

export function ProvidersCard({ slice }: { slice: SliceEntry }) {
  if (!slice.providers || slice.providers.length === 0) return null;
  return (
    <ShowcaseCard icon={Plug} label="Providers">
      <div className="flex flex-wrap gap-1.5">
        {slice.providers.map((p) => (
          <Badge key={p} variant="secondary" className="capitalize">{p}</Badge>
        ))}
      </div>
      <p className="mt-3 text-xs text-muted-foreground">
        Sub-providers live as siblings under{" "}
        <code className="rounded bg-muted px-1 py-0.5 text-[11px]">components/providers/</code> and{" "}
        <code className="rounded bg-muted px-1 py-0.5 text-[11px]">actions/</code>. Add a sibling
        to plug in another vendor without API churn.
      </p>
    </ShowcaseCard>
  );
}

export function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="mb-2 last:mb-0">
      <div className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
        {label}
      </div>
      <div className="mt-1">{children}</div>
    </div>
  );
}
