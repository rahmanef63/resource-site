import Link from "next/link";
import { ArrowUpRight, Wand2 } from "lucide-react";
import { features, type FeatureCategory } from "@/lib/content/features";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export const metadata = {
  title: "Features",
  description: "Backend integrations & SDK building blocks.",
};

const CATEGORY_LABEL: Record<FeatureCategory, string> = {
  ai: "AI",
  auth: "Auth",
  data: "Data & Integrations",
  payment: "Payment",
  email: "Email",
  realtime: "Realtime",
  storage: "Storage",
  search: "Search",
  content: "Content",
};

const CATEGORY_ORDER: FeatureCategory[] = [
  "ai",
  "auth",
  "data",
  "realtime",
  "search",
  "content",
  "email",
  "payment",
  "storage",
];

export default function FeaturesPage() {
  const groups = CATEGORY_ORDER.filter((c) => features.some((f) => f.category === c));

  return (
    <div className="space-y-10">
      <div>
        <p className="text-sm font-medium text-muted-foreground">Catalog</p>
        <div className="mt-2 flex items-center gap-2">
          <Wand2 className="size-6 text-muted-foreground" />
          <h1 className="text-3xl font-bold tracking-tight">Features</h1>
        </div>
        <p className="mt-3 text-muted-foreground">
          {features.length} backend integrations and SDK building blocks. Compose into templates.
          Where layouts are page-shapes and recipes are UI patterns, features are the backend wiring.
        </p>
      </div>

      {groups.map((group) => (
        <section key={group} className="mb-12">
          <h2 className="mb-4 text-sm font-medium uppercase tracking-wider text-muted-foreground">
            {CATEGORY_LABEL[group]}
          </h2>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {features
              .filter((f) => f.category === group)
              .map((f) => (
                <Link key={f.slug} href={`/features/${f.slug}`}>
                  <Card className="group h-full transition hover:border-primary/40 hover:shadow-sm">
                    <CardHeader>
                      <div className="flex items-start justify-between gap-3">
                        <CardTitle className="text-base">{f.title}</CardTitle>
                        <ArrowUpRight className="size-4 shrink-0 text-muted-foreground transition group-hover:text-foreground" />
                      </div>
                      <CardDescription className="line-clamp-3">{f.description}</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <p className="font-mono text-[11px] text-muted-foreground">{f.source}</p>
                      <div className="flex flex-wrap gap-1.5">
                        {f.tags.slice(0, 4).map((t) => (
                          <Badge key={t} variant="secondary" className="rounded-full text-xs">
                            {t}
                          </Badge>
                        ))}
                      </div>
                      {f.usedBy && f.usedBy.length > 0 && (
                        <p className="text-[10px] text-muted-foreground">
                          Used by: {f.usedBy.join(" · ")}
                        </p>
                      )}
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
