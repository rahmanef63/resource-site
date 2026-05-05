import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { layouts } from "@/lib/content/layouts";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const categoryLabel: Record<string, string> = {
  marketing: "Marketing",
  dashboard: "Dashboard",
  cms: "CMS",
};

export const metadata = { title: "Layouts" };

export default function LayoutsPage() {
  const items = layouts.filter((l) => l.category !== "website-template");
  const groups = Array.from(new Set(items.map((l) => l.category)));
  return (
    <div className="space-y-10">
      <div>
        <p className="text-sm font-medium text-muted-foreground">Catalog</p>
        <h1 className="mt-2 text-3xl font-bold tracking-tight">Layouts</h1>
        <p className="mt-3 text-muted-foreground">
          {items.length} cookbook layouts — marketing, dashboard, and CMS shapes.
          For full apps, see <Link href="/templates" className="underline hover:text-foreground">website templates</Link>.
        </p>
      </div>
      {groups.map((group) => (
        <section key={group} className="mb-12">
          <h2 className="mb-4 text-sm font-medium uppercase tracking-wider text-muted-foreground">
            {categoryLabel[group] ?? group}
          </h2>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {items
              .filter((l) => l.category === group)
              .map((l) => (
                <Link key={l.slug} href={`/layouts/${l.slug}`}>
                  <Card className="group h-full transition hover:border-primary/40 hover:shadow-sm">
                    <CardHeader>
                      <div className="flex items-start justify-between gap-3">
                        <CardTitle className="text-base">{l.title}</CardTitle>
                        <ArrowUpRight className="size-4 shrink-0 text-muted-foreground transition group-hover:text-foreground" />
                      </div>
                      <CardDescription className="line-clamp-3">
                        {l.description}
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="flex flex-wrap gap-1.5">
                        {l.tags.slice(0, 4).map((t) => (
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
        </section>
      ))}
    </div>
  );
}
