import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, ExternalLink, Layers, Eye } from "lucide-react";
import { slices, getSlice } from "@/lib/content/slices";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { PreviewFrame } from "@/components/site/preview-frame";
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

  return (
    <div className="space-y-8">
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
        <Card>
          <CardContent className="space-y-3 p-4">
            <div className="flex items-baseline justify-between">
              <h2 className="flex items-center gap-1.5 text-sm font-semibold uppercase tracking-wider text-muted-foreground">
                <Eye className="size-3.5" /> Live preview
              </h2>
              <a
                href={slice.previewPath}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground"
              >
                Open standalone <ExternalLink className="size-3" />
              </a>
            </div>
            <PreviewFrame src={slice.previewPath} defaultView="desktop" defaultZoom={1} />
          </CardContent>
        </Card>
      )}

      <Card>
        <CardContent className="space-y-4 p-6">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">Install</h2>
          <pre className="overflow-x-auto rounded-md bg-muted px-4 py-3 text-sm">
            <code>{`npx rahman-resources add ${slice.slug}`}</code>
          </pre>
          <p className="text-xs text-muted-foreground">
            Or pull just the source: <code className="rounded bg-muted px-1 py-0.5 text-[11px]">npx rahman-resources lift rahman:{slice.slug}</code>
          </p>
        </CardContent>
      </Card>

      <div className="grid gap-4 md:grid-cols-2">
        <DetailCard title="Frontend">
          <Row label="Slice path">
            <code className="text-xs">{slice.slicePath}</code>
          </Row>
          {slice.shadcn && slice.shadcn.length > 0 && (
            <Row label="shadcn">
              <div className="flex flex-wrap gap-1">
                {slice.shadcn.map((c) => (
                  <Badge key={c} variant="outline" className="text-[10px]">{c}</Badge>
                ))}
              </div>
            </Row>
          )}
        </DetailCard>

        <DetailCard title="Backend (Convex)">
          {slice.convexPaths && slice.convexPaths.length > 0 ? (
            slice.convexPaths.map((p) => (
              <Row key={p} label="Path">
                <code className="text-xs">{p}</code>
              </Row>
            ))
          ) : (
            <p className="text-xs text-muted-foreground">No Convex backend (frontend-only slice).</p>
          )}
        </DetailCard>

        <DetailCard title="npm packages">
          {slice.npm && slice.npm.length > 0 ? (
            <div className="flex flex-wrap gap-1.5">
              {slice.npm.map((p) => (
                <code key={p} className="rounded bg-muted px-2 py-0.5 text-[11px]">{p}</code>
              ))}
            </div>
          ) : (
            <p className="text-xs text-muted-foreground">No external npm deps.</p>
          )}
        </DetailCard>

        <DetailCard title="Environment">
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
        </DetailCard>
      </div>

      {peerSlices.length > 0 && (
        <Card>
          <CardContent className="space-y-3 p-6">
            <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">Peer slices</h2>
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
          </CardContent>
        </Card>
      )}

      {slice.providers && slice.providers.length > 0 && (
        <Card>
          <CardContent className="space-y-3 p-6">
            <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">Providers</h2>
            <div className="flex flex-wrap gap-1.5">
              {slice.providers.map((p) => (
                <Badge key={p} variant="secondary" className="capitalize">{p}</Badge>
              ))}
            </div>
            <p className="text-xs text-muted-foreground">
              Sub-providers live as siblings under{" "}
              <code className="rounded bg-muted px-1 py-0.5 text-[11px]">components/providers/</code> and{" "}
              <code className="rounded bg-muted px-1 py-0.5 text-[11px]">actions/</code>. Add a sibling to plug in another vendor without API churn.
            </p>
          </CardContent>
        </Card>
      )}

      {slice.agentRecipe && (
        <Card>
          <CardContent className="space-y-2 p-6">
            <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">Agent recipe</h2>
            <p className="text-sm text-muted-foreground">{slice.agentRecipe}</p>
          </CardContent>
        </Card>
      )}

      <div className="flex flex-wrap items-center gap-2">
        <Button asChild variant="outline" size="sm">
          <Link href={`https://github.com/rahmanef63/resource-site/tree/main/${slice.slicePath}`} target="_blank" rel="noreferrer">
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

function DetailCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <Card>
      <CardContent className="space-y-3 p-5">
        <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">{title}</h3>
        {children}
      </CardContent>
    </Card>
  );
}

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <div className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">{label}</div>
      <div className="mt-1">{children}</div>
    </div>
  );
}
