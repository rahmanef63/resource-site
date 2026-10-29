import { notFound, redirect } from "next/navigation";
import { slices, getSlice } from "@/lib/content/slices";
import { isHidden } from "@/lib/content/hidden-slugs";
import { SLUG_ALIASES, resolveSlugAlias } from "@/lib/content/slice-aliases";
import { readSliceFiles } from "@/lib/slice-files";
import { site } from "@/lib/content/site";
import { getSliceFrameworkSupport } from "@/lib/content/slice-framework-support";
import { buildPageMetadata } from "@/lib/seo";
import { SliceDetailHeader } from "./slice-detail-header";
import { SliceDetailClient } from "./slice-detail-client";

export function generateStaticParams() {
  // Aliases are enumerated so their `redirect()` runs from a prerendered
  // entry instead of a cold dynamic render.
  return [
    ...slices.map((s) => ({ slug: s.slug })),
    ...Object.keys(SLUG_ALIASES).map((slug) => ({ slug })),
  ];
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  // A retired slug still needs a redirect, not a share card.
  const alias = resolveSlugAlias(slug);
  if (alias) redirect(`/slices/${alias}`);
  const slice = getSlice(slug);
  if (!slice) notFound();
  return buildPageMetadata({
    title: `${slice.title} — Slice`,
    description: slice.description,
    path: `/slices/${slice.slug}`,
  });
}

export default async function SliceDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  // Superseded slugs (merged into landing-sections) keep working URLs.
  const alias = resolveSlugAlias(slug);
  if (alias) redirect(`/slices/${alias}`);
  const slice = getSlice(slug);
  if (!slice) notFound();

  // Prev/next across the visible catalog — parity with /layouts/<slug>.
  const visible = slices.filter((s) => !isHidden(s.slug));
  const idx = visible.findIndex((s) => s.slug === slice.slug);
  const prev = idx > 0 ? visible[idx - 1] : null;
  const next = idx >= 0 && idx < visible.length - 1 ? visible[idx + 1] : null;

  const sourceHref = `https://github.com/rahmanef63/resource-site/tree/main/${slice.slicePath}`;
  const installCommand = slice.install ?? `npx rahman-resources add ${slice.slug}`;
  const frameworkSupport = getSliceFrameworkSupport(slice.slug);

  // Pre-read slice source files server-side so the Code tab in the
  // manifest can show contents without an API roundtrip.
  const codeFiles = slice.slicePath ? await readSliceFiles(slice.slicePath) : undefined;

  return (
    <>
      <SliceDetailHeader
        slice={slice}
        siteUrl={site.url}
        installCommand={installCommand}
        prev={prev ? { slug: prev.slug, title: prev.title } : null}
        next={next ? { slug: next.slug, title: next.title } : null}
        frameworkSupport={frameworkSupport}
      />
      <SliceDetailClient
        slice={slice}
        codeFiles={codeFiles}
        sourceHref={sourceHref}
        installCommand={installCommand}
        frameworkSupport={frameworkSupport}
      />
    </>
  );
}
