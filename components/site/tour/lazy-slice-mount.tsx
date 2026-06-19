"use client";

// Tour live-mount — code-split-on-scroll wrapper around the existing
// VariantPreview (which itself renders LazyWidget over PREVIEW_REGISTRY).
//
// We do NOT import VariantPreview eagerly: `next/dynamic(ssr:false)` keeps it
// (and transitively LazyWidget + the per-slug `import()` in PREVIEW_REGISTRY)
// in their own client chunks. `useIframeLazyLoad` (IntersectionObserver, SSR
// safe, self-disconnects after first intersect) gates the mount so exactly one
// slice chunk loads per scroll — the route stays code-split.

import * as React from "react";
import dynamic from "next/dynamic";
import { useIframeLazyLoad } from "@/components/site/preview/hooks/use-iframe-lazy-load";

const VariantPreview = dynamic(
  () => import("@/components/build/variant-preview").then((m) => m.VariantPreview),
  {
    ssr: false,
    loading: () => <div className="h-40 animate-pulse rounded-md bg-muted/40" />,
  },
);

export function LazySliceMount({ slug }: { slug: string }) {
  const { ref, visible } = useIframeLazyLoad<HTMLDivElement>("400px");
  return (
    <div ref={ref}>
      {visible ? (
        <VariantPreview slug={slug} />
      ) : (
        <div className="h-40 animate-pulse rounded-md bg-muted/40" />
      )}
    </div>
  );
}
