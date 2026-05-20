import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { layouts } from "@/lib/content/layouts";
import { slices } from "@/lib/content/slices";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

/** M5-BP — "recipes" surface retired. Homepage now showcases
 *  Tier-3 slices ("Modules") instead. URL slug stays /slices for
 *  back-compat with bookmarks. */
export function ShowcaseGrid({ kind }: { kind: "layouts" | "slices" }) {
  const items = kind === "layouts" ? layouts : slices;
  const heading = kind === "layouts" ? "Cookbook layouts" : "Modules";
  const sub =
    kind === "layouts"
      ? "Production-grade layouts. Marketing, dashboard, and CMS shapes."
      : "Tier-3 vertical slices. Auth, AI, payments, editor primitives — ported and audited.";

  return (
    <section className="border-b py-20">
      <div className="mx-auto max-w-6xl px-6">
        <div className="mb-10 flex items-end justify-between">
          <div>
            <h2 className="text-3xl font-bold tracking-tight">{heading}</h2>
            <p className="mt-2 text-muted-foreground">{sub}</p>
          </div>
          <Link
            href={`/${kind}`}
            className="hidden items-center gap-1 text-sm text-muted-foreground hover:text-foreground sm:inline-flex"
          >
            View all
            <ArrowUpRight className="size-4" />
          </Link>
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {items.slice(0, 6).map((item) => (
            <Link key={item.slug} href={`/${kind}/${item.slug}`}>
              <Card className="group h-full transition hover:border-primary/40 hover:shadow-sm">
                <CardHeader>
                  <div className="flex items-start justify-between gap-3">
                    <CardTitle className="text-base">{item.title}</CardTitle>
                    <ArrowUpRight className="size-4 shrink-0 text-muted-foreground transition group-hover:text-foreground" />
                  </div>
                  <CardDescription className="line-clamp-3">
                    {item.description}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-1.5">
                    {(item.tags ?? []).slice(0, 3).map((t) => (
                      <Badge key={t} variant="secondary" className="rounded-full text-xs">
                        {t}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
