import { notFound } from "next/navigation";
import { getLayout, layouts } from "@/lib/content/layouts";
import { TemplateDetail } from "@/components/site/template-detail";
import { buildAgentPrompt } from "@/lib/agent-prompt";
import { readPathsFiles } from "@/lib/slice-files";
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

  // Pre-read the template's source files server-side so the in-browser
  // Code tab can show contents + zip download without an API roundtrip.
  const codeRoots = l.pullPaths && l.pullPaths.length > 0 ? l.pullPaths : [l.repoPath];
  const codeFiles = await readPathsFiles(codeRoots);
  const codeRootPath = codeRoots.length === 1 ? codeRoots[0] : `${codeRoots.length} folders`;

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
        codeFiles,
        codeRootPath,
        dependencies: l.dependencies,
        exampleCode: l.exampleCode,
        agentRecipe: l.agentRecipe,
        tags: l.tags,
        previewPath: l.previewPath,
        adminPreviewPath: l.adminPreviewPath,
        demoUrl: l.demoUrl,
        defaultSurface: l.defaultSurface,
        defaultView: l.defaultView,
        defaultZoom: l.defaultZoom,
        badge: l.category,
        status: l.status,
      }}
      prev={prev}
      next={next}
      prompt={prompt}
      siteUrl={site.url}
    />
  );
}
