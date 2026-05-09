import Link from "next/link";
import { ArrowUpRight, Layers } from "lucide-react";
import { slices } from "@/lib/content/slices";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export const metadata = {
  title: "Slices — portable feature units",
  description: "Tier-3 portable vertical slices: lift one folder, drop it into any project.",
};

const CATEGORY_ORDER = ["auth", "payment", "ai", "email", "data", "search", "realtime", "content", "storage", "ui", "infra"] as const;

export default function SlicesPage() {
  const grouped = new Map<string, typeof slices>();
  for (const s of slices) {
    if (!grouped.has(s.category)) grouped.set(s.category, []);
    grouped.get(s.category)!.push(s);
  }
  const orderedGroups = CATEGORY_ORDER.filter((c) => grouped.has(c));

  return (
    <div className="space-y-10">
      <div>
        <p className="text-sm font-medium text-muted-foreground">Catalog</p>
        <div className="mt-2 flex items-center gap-2">
          <Layers className="size-6 text-muted-foreground" />
          <h1 className="text-3xl font-bold tracking-tight">Feature slices</h1>
        </div>
        <p className="mt-3 max-w-2xl text-muted-foreground">
          Tier-3 portable vertical slices. Each slice ships a frontend half (
          <code className="rounded bg-muted px-1 py-0.5 text-xs">frontend/slices/&lt;slug&gt;/</code>) +
          a Convex backend half (
          <code className="rounded bg-muted px-1 py-0.5 text-xs">convex/features/&lt;slug&gt;/</code>).
          Lift one folder, drop it into any compatible project. See{" "}
          <Link href="/docs" className="underline">slice architecture</Link> for the full plan.
        </p>
        <div className="mt-4 flex flex-wrap gap-2">
          <code className="rounded bg-muted px-2 py-1 text-xs">npx rahman-resources add &lt;slug&gt;</code>
          <code className="rounded bg-muted px-2 py-1 text-xs">npx rahman-resources lift rahman:&lt;slug&gt;</code>
        </div>
      </div>

      {orderedGroups.map((cat) => {
        const items = grouped.get(cat)!;
        return (
          <section key={cat} className="space-y-3">
            <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
              {cat} <span className="font-normal text-muted-foreground/60">({items.length})</span>
            </h2>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {items.map((s) => (
                <Link key={s.slug} href={`/slices/${s.slug}`}>
                  <Card className="group h-full transition hover:border-primary/40 hover:shadow-sm">
                    <CardHeader>
                      <div className="flex items-start justify-between gap-3">
                        <CardTitle className="text-base">{s.title}</CardTitle>
                        <ArrowUpRight className="size-4 shrink-0 text-muted-foreground transition group-hover:text-foreground" />
                      </div>
                      <CardDescription className="line-clamp-3">{s.description}</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-2">
                      <div className="flex flex-wrap gap-1.5">
                        <Badge variant="secondary" className="text-[10px]">v{s.version}</Badge>
                        {s.peers && s.peers.length > 0 && (
                          <Badge variant="outline" className="text-[10px]">
                            peers: {s.peers.map((p) => p.slug).join(", ")}
                          </Badge>
                        )}
                        {s.providers && s.providers.length > 0 && (
                          <Badge variant="outline" className="text-[10px]">
                            providers: {s.providers.join(", ")}
                          </Badge>
                        )}
                      </div>
                      <code className="block truncate rounded bg-muted px-2 py-1 text-[11px] text-muted-foreground">
                        {s.slicePath}
                      </code>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          </section>
        );
      })}
    </div>
  );
}
