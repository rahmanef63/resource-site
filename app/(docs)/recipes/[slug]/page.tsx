import { notFound } from "next/navigation";
import { getRecipe, recipes } from "@/lib/content/recipes";
import { TemplateDetail } from "@/components/site/template-detail";
import { buildAgentPrompt } from "@/lib/agent-prompt";
import { site } from "@/lib/content/site";

export function generateStaticParams() {
  return recipes.map((r) => ({ slug: r.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const r = getRecipe(slug);
  return r ? { title: r.title, description: r.description } : { title: "Not found" };
}

export default async function RecipePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const r = getRecipe(slug);
  if (!r) return notFound();

  const idx = recipes.findIndex((x) => x.slug === r.slug);
  const prev = idx > 0 ? { slug: recipes[idx - 1].slug, title: recipes[idx - 1].title } : null;
  const next = idx < recipes.length - 1 ? { slug: recipes[idx + 1].slug, title: recipes[idx + 1].title } : null;
  const prompt = buildAgentPrompt({ recipeSlugs: [r.slug], recipeTitles: [r.title] });

  return (
    <TemplateDetail
      kind="recipe"
      basePath="/recipes"
      data={{
        slug: r.slug,
        title: r.title,
        description: r.description,
        source: r.source,
        repoPath: r.repoPath,
        files: r.files,
        exampleCode: r.exampleCode,
        agentRecipe: r.agentRecipe,
        tags: r.tags,
      }}
      prev={prev}
      next={next}
      prompt={prompt}
      siteUrl={site.url}
    />
  );
}
