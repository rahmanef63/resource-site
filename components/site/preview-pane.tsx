"use client";

import * as React from "react";
import { selectionsToQuery, useFeatureContext } from "./feature-context";
import { PREVIEW_PRESETS, applyRotation } from "@/lib/preview-presets";
import { PreviewIframeShell } from "@/components/site/preview-shell";

/**
 * Context-driven preview: state (view, orientation, zoom) lives in
 * `feature-context`, chrome rendered globally by `feature-bar`. Used by
 * `template-detail.tsx` where chrome sits in the page-level toolbar.
 *
 * For self-chromed preview (standalone, with its own toolbar), use
 * `<PreviewFrame />` instead.
 */
export function PreviewPane({ src }: { src: string }) {
  const { previewView, previewOrientation, previewZoom, manifest, selections } = useFeatureContext();
  const [iframeKey, setIframeKey] = React.useState(0);

  React.useEffect(() => {
    function refresh() {
      setIframeKey((k) => k + 1);
    }
    window.addEventListener("rresource:refresh-preview", refresh);
    return () => window.removeEventListener("rresource:refresh-preview", refresh);
  }, []);

  const finalSrc = React.useMemo(() => {
    if (manifest?.composePreviewSrc) return manifest.composePreviewSrc(selections, src);
    const q = selectionsToQuery(selections);
    return q ? `${src}${q}` : src;
  }, [src, manifest, selections]);

  const basePreset = PREVIEW_PRESETS[previewView];
  const preset = applyRotation(basePreset, previewOrientation);

  return (
    <PreviewIframeShell
      src={finalSrc}
      preset={preset}
      zoom={previewZoom}
      iframeKey={finalSrc + ":" + iframeKey}
      className="h-full"
    />
  );
}
