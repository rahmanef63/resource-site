"use client";

import preview from "@/features/resources-launcher-admin/preview";
import { PreviewSection, SlicePreviewLayout } from "@/components/slice-previews/preview-layout";

const ResourcesAdminPreview = preview.ResourcesAdmin;

export default function Page() {
  return (
    <SlicePreviewLayout
      title="Resources Admin"
      kind="ui"
      description="Curated launcher CRUD over the canonical injected resource adapter and mock store."
      sourceUrl="https://github.com/rahmanef63/resource-site/tree/main/frontend/slices/resources-launcher-admin"
    >
      <PreviewSection title="Mock CRUD" hint="add · edit · delete · reorder">
        <ResourcesAdminPreview variant={{ scenario: "mock-crud" }} />
      </PreviewSection>
    </SlicePreviewLayout>
  );
}
