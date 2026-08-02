import * as React from "react";
import type { FeatureManifest, Selections } from "./feature-context";
import type { PreviewView, PreviewOrientation } from "@/lib/preview-presets";

export interface ManifestEffectArgs {
  manifest: FeatureManifest | null;
  setActiveTab: React.Dispatch<React.SetStateAction<string | null>>;
  setSelections: (s: Selections) => void;
  setPreviewView: (v: PreviewView) => void;
  setPreviewZoom: (z: number) => void;
  setPreviewOrientation: (o: PreviewOrientation) => void;
  defaultsFromSchema: (cfg: FeatureManifest["config"]) => Selections;
}

/**
 * Manifest-change handler for FeatureProvider. Extracted from
 * feature-context.tsx purely to stay under the 200-LOC modularity cap.
 *
 * Behavior:
 *   • null manifest → clear (page without tabs)
 *   • same id, new manifest reference → preserve tab/view/zoom (only
 *     swap tab if the previously-active id disappeared from new tabs)
 *   • new id → reset to manifest defaults, BUT preserve activeTab when
 *     the new manifest exposes a tab with the same id (so users who
 *     sat on "code" stay on "code" when clicking another slice)
 */
export function useManifestEffect(
  prevIdRef: React.MutableRefObject<string | null>,
  args: ManifestEffectArgs,
) {
  const {
    manifest,
    setActiveTab,
    setSelections,
    setPreviewView,
    setPreviewZoom,
    setPreviewOrientation,
    defaultsFromSchema,
  } = args;

  React.useEffect(() => {
    if (!manifest) {
      prevIdRef.current = null;
      setActiveTab(null);
      setSelections({});
      return;
    }
    const id = manifest.id ?? manifest.title ?? "_unknown";
    const sameId = prevIdRef.current === id;
    prevIdRef.current = id;

    if (sameId) {
      // Same page re-render — keep activeTab / view / zoom intact.
      // Only adopt a new tab if the previously active one disappeared.
      const tabs = manifest.tabs ?? [];
      setActiveTab((cur) => {
        if (cur && tabs.find((t) => t.id === cur)) return cur;
        return tabs.length > 0 ? (manifest.defaultTab ?? tabs[0].id) : null;
      });
      return;
    }

    // New page — reset to manifest defaults, BUT preserve activeTab
    // when the new manifest exposes a tab with the same id.
    if (manifest.tabs && manifest.tabs.length > 0) {
      setActiveTab((cur) => {
        if (cur && manifest.tabs!.find((t) => t.id === cur)) return cur;
        return manifest.defaultTab ?? manifest.tabs![0].id;
      });
    } else {
      setActiveTab(null);
    }
    setSelections(defaultsFromSchema(manifest.config));
    if (manifest.defaultView) setPreviewView(manifest.defaultView);
    if (typeof manifest.defaultZoom === "number") setPreviewZoom(manifest.defaultZoom);
    setPreviewOrientation("portrait");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [manifest]);
}
