import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { recipes } from "@/lib/content/recipes";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export const metadata = { title: "Recipes" };

export default function RecipesPage() {
  return (
    <div className="space-y-10">
      <div>
        <p className="text-sm font-medium text-muted-foreground">Catalog</p>
        <h1 className="mt-2 text-3xl font-bold tracking-tight">Recipes</h1>
        <p className="mt-3 text-muted-foreground">
          {recipes.length} feature drop-ins. Real code from production apps.
        </p>
      </div>
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {recipes.map((r) => (
          <Link key={r.slug} href={`/recipes/${r.slug}`}>
            <Card className="group h-full transition hover:border-primary/40 hover:shadow-sm">
              <CardHeader>
                <div className="flex items-start justify-between gap-3">
                  <CardTitle className="text-base">{r.title}</CardTitle>
                  <ArrowUpRight className="size-4 shrink-0 text-muted-foreground transition group-hover:text-foreground" />
                </div>
                <CardDescription className="line-clamp-3">
                  {r.description}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-1.5">
                  {r.tags.slice(0, 4).map((t) => (
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
  );
}
