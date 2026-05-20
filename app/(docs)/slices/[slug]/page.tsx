import { notFound } from "next/navigation";
import { slices, getSlice } from "@/lib/content/slices";
import { readSliceFiles } from "@/lib/slice-files";
import { site } from "@/lib/content/site";
import { SliceDetailHeader } from "./slice-detail-header";
import { SliceDetailClient } from "./slice-detail-client";

export function generateStaticParams() {
  return slices.map((s) => ({ slug: s.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const slice = getSlice(slug);
  if (!slice) return { title: "Slice not found" };
  return {
    title: `${slice.title} — Module`,
    description: slice.description,
  };
}

export default async function SliceDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const slice = getSlice(slug);
  if (!slice) notFound();

  const sourceHref = `https://github.com/rahmanef63/resource-site/tree/main/${slice.slicePath}`;
  const installCommand = slice.install ?? `npx rahman-resources add ${slice.slug}`;

  // Pre-read slice source files server-side so the Code tab in the
  // manifest can show contents without an API roundtrip.
  const codeFiles = slice.slicePath ? await readSliceFiles(slice.slicePath) : undefined;

  return (
    <>
      <SliceDetailHeader slice={slice} siteUrl={site.url} installCommand={installCommand} />
      <SliceDetailClient
        slice={slice}
        codeFiles={codeFiles}
        sourceHref={sourceHref}
        installCommand={installCommand}
      />
    </>
  );
}
