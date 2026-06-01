"use client";

import { SlicePreviewLayout, PreviewSection } from "@/components/slice-previews/preview-layout";
import { PageDemo } from "./page-demo";

/** Live demo for the notion-shell PAGE EDITOR — fully props-driven. The
 *  tree-nav sidebar is now its own slice (notion-sidebar, /preview/slices/
 *  notion-sidebar); embedded databases are notion-database (/preview/slices/
 *  notion-database). This preview focuses on the page + block editor; the
 *  notion-page-clone-os layout composes all three. */
export default function Page() {
  return (
    <SlicePreviewLayout title="Notion Shell — page editor" kind="ui" maxWidth="none">
      <PreviewSection
        title="NotionPage + NotionBlock — blocks, slash menu, inline toolbar, colour, layout"
        hint='"/" picker · select text → format toolbar · hover "⋯" → colour · toggle nests blocks · page "⋯" → font / full-width / small-text / lock'
      >
        <PageDemo />
      </PreviewSection>
    </SlicePreviewLayout>
  );
}
