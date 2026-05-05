import { notFound } from "next/navigation";
import { getLayout, layouts } from "@/lib/content/layouts";
import { TemplateDetail } from "@/components/site/template-detail";
import { buildAgentPrompt } from "@/lib/agent-prompt";
import { site } from "@/lib/content/site";

export function generateStaticParams() {
  return layouts.map((l) => ({ slug: l.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const l = getLayout(slug);
  return l ? { title: l.title, description: l.description } : { title: "Not found" };
}

export default async function LayoutDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const l = getLayout(slug);
  if (!l) return notFound();

  const idx = layouts.findIndex((x) => x.slug === l.slug);
  const prev = idx > 0 ? { slug: layouts[idx - 1].slug, title: layouts[idx - 1].title } : null;
  const next = idx < layouts.length - 1 ? { slug: layouts[idx + 1].slug, title: layouts[idx + 1].title } : null;
  const prompt = buildAgentPrompt({
    layoutSlug: l.slug,
    layoutTitle: l.title,
    pullPaths: l.pullPaths,
    files: l.files,
    dependencies: l.dependencies,
    agentRecipe: l.agentRecipe,
  });

  return (
    <TemplateDetail
      kind="layout"
      basePath="/layouts"
      data={{
        slug: l.slug,
        title: l.title,
        description: l.description,
        source: l.source,
        repoPath: l.repoPath,
        primaryFile: l.primaryFile,
        files: l.files,
        pullPaths: l.pullPaths,
        dependencies: l.dependencies,
        exampleCode: l.exampleCode,
        agentRecipe: l.agentRecipe,
        tags: l.tags,
        previewPath: l.previewPath,
        adminPreviewPath: l.adminPreviewPath,
        defaultSurface: l.defaultSurface,
        defaultView: l.defaultView,
        badge: l.category,
      }}
      prev={prev}
      next={next}
      prompt={prompt}
      siteUrl={site.url}
    />
  );
}
