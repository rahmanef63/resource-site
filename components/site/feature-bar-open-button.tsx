"use client";

import { ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { FeatureManifest } from "./feature-context";

/** Right-cluster "open full page" button. Renders when:
 *   • active tab is a single-surface preview (preview-public /
 *     preview-admin / preview), AND
 *   • the manifest has a URL for that surface.
 *  Returns null on split or when no URL — caller can drop it in
 *  unconditionally. */
export function FeatureBarOpenButton({
  activeTab,
  manifest,
}: {
  activeTab: string | null;
  manifest: FeatureManifest;
}) {
  if (!activeTab) return null;
  if (activeTab === "preview-split") return null;
  const isPreviewTab =
    activeTab === "preview" ||
    activeTab === "preview-public" ||
    activeTab === "preview-admin";
  if (!isPreviewTab) return null;

  const surface: "admin" | "public" =
    activeTab === "preview-admin" ? "admin" : "public";
  const href = manifest.previewUrls?.[surface];
  if (!href) return null;

  return (
    <Button
      asChild
      variant="ghost"
      size="icon"
      className="size-6"
      title="Open full page in new tab"
    >
      <a href={href} target="_blank" rel="noreferrer" aria-label="Open full page">
        <ExternalLink className="size-3" />
      </a>
    </Button>
  );
}
