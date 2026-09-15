"use client";

import preview from "@/features/notion-app/preview";

const NotionAppPreview = preview.PageEditor;

export default function NotionAppPreviewPage() {
  return (
    <div className="min-h-dvh w-full bg-background">
      <NotionAppPreview variant={{ scenario: "starter" }} />
    </div>
  );
}
