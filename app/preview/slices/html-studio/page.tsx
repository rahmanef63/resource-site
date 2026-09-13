"use client";

import preview from "@/features/html-studio/preview";
import { PreviewSection, SlicePreviewLayout } from "@/components/slice-previews/preview-layout";

const HtmlStudioPreview = preview.HtmlStudio;

export default function Page() {
  return (
    <SlicePreviewLayout
      title="HTML Studio"
      kind="ui"
      description="Sandboxed HTML/CSS/JS editor with opaque-origin live preview and an injected document store."
      sourceUrl="https://github.com/rahmanef63/resource-site/tree/main/frontend/slices/html-studio"
    >
      <PreviewSection title="Mock studio" hint="Code · Split · Preview · Save · Saved pages">
        <HtmlStudioPreview variant={{ scenario: "mock-studio" }} />
      </PreviewSection>
    </SlicePreviewLayout>
  );
}
