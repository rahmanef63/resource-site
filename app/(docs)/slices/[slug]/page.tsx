import { notFound } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  Bot,
  Eye,
  ExternalLink,
  Layers,
  Link2,
  Package,
  Plug,
  Server,
  Settings2,
  Terminal,
} from "lucide-react";
import { slices, getSlice } from "@/lib/content/slices";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { PreviewFrame } from "@/components/site/preview-frame";
import { ShowcaseCard } from "@/components/site/catalog/showcase-card";
import { SlicePreviewSection } from "@/components/site/slice-preview-section";
import { UseWideLayout } from "@/components/site/use-wide-layout";

export function generateStaticParams() {
  return slices.map((s) => ({ slug: s.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const slice = getSlice(slug);
  if (!slice) return { title: "Slice not found" };
  return {
    title: `${slice.title} — Slice`,
    description: slice.description,
  };
}

export default async function SliceDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const slice = getSlice(slug);
  if (!slice) notFound();

  const peerSlices = (slice.peers ?? [])
    .map((p) => ({ peer: p, target: getSlice(p.slug) }))
    .filter((x): x is { peer: typeof x.peer; target: NonNullable<typeof x.target> } => !!x.target);

  const sourceHref = `https://github.com/rahmanef63/resource-site/tree/main/${slice.slicePath}`;

  return (
    <div className="space-y-6">
      <UseWideLayout />
      <div>
        <Link
          href="/slices"
          className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="size-3" /> All slices
        </Link>
        <div className="mt-3 flex flex-wrap items-center gap-2">
          <Layers className="size-5 text-muted-foreground" />
          <h1 className="text-3xl font-bold tracking-tight">{slice.title}</h1>
          <Badge variant="secondary" className="text-[10px]">v{slice.version}</Badge>
          <Badge variant="outline" className="text-[10px] capitalize">{slice.category}</Badge>
          {slice.kind && (
            <Badge
              className={
                "text-[10px] uppercase " +
                (slice.kind === "ui"
                  ? "bg-emerald-500/10 text-emerald-700 dark:text-emerald-300"
                  : slice.kind === "backend"
                    ? "bg-blue-500/10 text-blue-700 dark:text-blue-300"
                    : "bg-purple-500/10 text-purple-700 dark:text-purple-300")
              }
            >
              {slice.kind}
            </Badge>
          )}
        </div>
        <p className="mt-3 max-w-2xl text-muted-foreground">{slice.description}</p>
      </div>

      {slice.previewPath && (
        <SlicePreviewSection
          publicPath={slice.previewPath}
          adminPath={slice.adminPreviewPath}
          defaultSurface={slice.defaultSurface}
          defaultView={slice.defaultView ?? "desktop"}
          defaultZoom={slice.defaultZoom ?? 1}
          sourceHref={sourceHref}
        />
      )}

      <ShowcaseCard icon={Terminal} label="Install" variant="static">
        <pre className="overflow-x-auto rounded-md bg-muted px-4 py-3 text-sm">
          <code>{`npx rahman-resources add ${slice.slug}`}</code>
        </pre>
        <p className="mt-3 text-xs text-muted-foreground">
          Or pull just the source:{" "}
          <code className="rounded bg-muted px-1 py-0.5 text-[11px]">
            npx rahman-resources lift rahman:{slice.slug}
          </code>
        </p>
      </ShowcaseCard>

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

      {peerSlices.length > 0 && (
        <ShowcaseCard icon={Link2} label="Peer slices">
          <div className="grid gap-3 sm:grid-cols-2">
            {peerSlices.map(({ peer, target }) => (
              <Link
                key={peer.slug}
                href={`/slices/${peer.slug}`}
                className="group flex items-start justify-between gap-3 rounded-lg border border-border/60 p-3 transition hover:border-primary/40"
              >
                <div>
                  <p className="text-sm font-medium group-hover:underline">{target.title}</p>
                  <p className="text-xs text-muted-foreground">{peer.range}</p>
                  {peer.reason && (
                    <p className="mt-1 text-xs text-muted-foreground">{peer.reason}</p>
                  )}
                </div>
                <ExternalLink className="size-4 text-muted-foreground" />
              </Link>
            ))}
          </div>
        </ShowcaseCard>
      )}

      {slice.providers && slice.providers.length > 0 && (
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
      )}

      {slice.agentRecipe && (
        <ShowcaseCard icon={Bot} label="Agent recipe">
          <p className="text-sm text-muted-foreground">{slice.agentRecipe}</p>
        </ShowcaseCard>
      )}

      <div className="flex flex-wrap items-center gap-2">
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
