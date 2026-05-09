import {
  BookOpen,
  Command,
  Edit3,
  GitFork,
  Mail,
  MessageSquare,
  MousePointer2,
  Palette,
  Table,
  type LucideIcon,
} from "lucide-react";
import { recipes } from "@/lib/content/recipes";
import { CatalogCard } from "@/components/site/catalog/catalog-card";
import { CatalogSearch, type CatalogSearchItem } from "@/components/site/catalog/catalog-search";
import { MockThumbnail } from "@/components/site/catalog/mock-thumbnail";

export const metadata = { title: "Recipes" };

const RECIPE_ICON: Record<string, LucideIcon> = {
  "block-editor": Edit3,
  "page-tree-sidebar": GitFork,
  "multi-block-selection": MousePointer2,
  "database-views": Table,
  "command-palette": Command,
  "comments-threaded": MessageSquare,
  "theme-preset-switcher": Palette,
  "contact-form-resend": Mail,
};

export default function RecipesPage() {
  const tagFreq = new Map<string, number>();
  for (const r of recipes) for (const t of r.tags ?? []) tagFreq.set(t, (tagFreq.get(t) ?? 0) + 1);
  const topTags = [...tagFreq.entries()].sort((a, b) => b[1] - a[1]).slice(0, 12).map(([t]) => t);

  const items: CatalogSearchItem[] = recipes.map((r) => {
    const Icon = RECIPE_ICON[r.slug] ?? BookOpen;
    return {
      key: r.slug,
      search: `${r.title} ${r.description} ${(r.tags ?? []).join(" ")}`.toLowerCase(),
      tags: r.tags,
      node: (
        <CatalogCard
          href={`/recipes/${r.slug}`}
          title={r.title}
          description={r.description}
          tags={r.tags}
          meta={<span className="font-mono">{r.source}</span>}
          thumbnail={
            <MockThumbnail kind="recipe" category="content" icon={Icon} label={r.slug} />
          }
        />
      ),
    };
  });

  return (
    <div className="space-y-8">
      <div>
        <p className="text-sm font-medium text-muted-foreground">Catalog</p>
        <div className="mt-2 flex items-center gap-2">
          <BookOpen className="size-6 text-muted-foreground" />
          <h1 className="text-3xl font-bold tracking-tight">Recipes</h1>
        </div>
        <p className="mt-3 max-w-2xl text-muted-foreground">
          {recipes.length} feature drop-ins. Real code patterns from production apps.
        </p>
      </div>

      <CatalogSearch items={items} allTags={topTags} placeholder="Cari recipe…" />
    </div>
  );
}
