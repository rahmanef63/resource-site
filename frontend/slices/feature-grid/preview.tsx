"use client";
/** Variant preview (VP wave) — rr-internal, stripped on `rr add`. */
import type { SlicePreviewModule } from "@/shared/preview/types";
import { Rocket, Shield, Zap } from "lucide-react";
import { FeatureGridSection, type FeatureItem } from "./views/FeatureGridSection";

const ITEMS: FeatureItem[] = [
  { id: "1", title: "Fast by default", body: "Code-split slices keep bundles lean.", icon: Zap },
  { id: "2", title: "Secure", body: "Auth + audit gates baked into every slice.", icon: Shield },
  { id: "3", title: "Ship-ready", body: "Copy, tweak tokens, deploy.", icon: Rocket },
];

const preview: SlicePreviewModule = {
  FeatureGridSection: ({ variant }) => (
    <div className="p-4">
      <FeatureGridSection
        title="Why slices"
        items={ITEMS}
        layout={(variant.layout as "cards" | "minimal" | "alternating" | "grouped") ?? "cards"}
        columns={(Number(variant.columns) as 1 | 2 | 3 | 4) || 3}
        align={(variant.align as "left" | "center") ?? "left"}
        className="px-0 py-0"
      />
    </div>
  ),
};
export default preview;
