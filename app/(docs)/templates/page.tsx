import Link from "next/link";
import { ArrowUpRight, Globe } from "lucide-react";
import { layouts } from "@/lib/content/layouts";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export const metadata = {
  title: "Website Templates",
  description: "Full-app templates with public + admin surfaces.",
};

export default function TemplatesPage() {
  const items = layouts.filter((l) => l.category === "website-template");
  return (
    <div className="space-y-10">
      <div>
        <p className="text-sm font-medium text-muted-foreground">Catalog</p>
        <div className="mt-2 flex items-center gap-2">
          <Globe className="size-6 text-muted-foreground" />
          <h1 className="text-3xl font-bold tracking-tight">Website templates</h1>
        </div>
        <p className="mt-3 text-muted-foreground">
          {items.length === 0
            ? "Belum ada template — proposal di docs/templates/."
            : `${items.length} full-app template${items.length > 1 ? "s" : ""} dengan public + admin surface, live cross-iframe sync, dan slice structure.`}
        </p>
      </div>

      {items.length === 0 ? (
        <Card className="border-dashed bg-muted/10 p-10 text-center">
          <p className="text-sm text-muted-foreground">No website templates yet.</p>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {items.map((l) => (
            <Link key={l.slug} href={`/layouts/${l.slug}`}>
              <Card className="group h-full transition hover:border-primary/40 hover:shadow-sm">
                <CardHeader>
                  <div className="flex items-start justify-between gap-3">
                    <CardTitle className="text-base">{l.title}</CardTitle>
                    <ArrowUpRight className="size-4 shrink-0 text-muted-foreground transition group-hover:text-foreground" />
                  </div>
                  <CardDescription className="line-clamp-3">{l.description}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center gap-2 text-[11px] text-muted-foreground">
                    <span>Source:</span>
                    <span className="font-mono">{l.source}</span>
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {l.tags.slice(0, 5).map((t) => (
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
      )}
    </div>
  );
}
