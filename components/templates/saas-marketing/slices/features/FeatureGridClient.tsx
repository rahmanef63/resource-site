"use client";

import {
  FeatureGridSection,
  type FeatureItem,
} from "@/features/feature-grid";
import { useFeatures } from "../../shared/store";

/**
 * Hybrid wrapper: server chrome (FeaturesPage) renders this client wrap which
 * reads live items via useFeatures() and feeds the canonical FeatureGridSection
 * slice (DRY+SSOT). Admin edits propagate via the createTemplateStore
 * BroadcastChannel.
 */
export function FeatureGridClient({
  eyebrow,
  title,
  subtitle,
}: {
  eyebrow?: string;
  title?: string;
  subtitle?: string;
}) {
  const features = useFeatures();
  const items: FeatureItem[] = features.map((f) => ({
    id: f.id,
    title: f.title,
    body: f.blurb,
    icon: f.icon,
  }));
  return (
    <FeatureGridSection
      eyebrow={eyebrow}
      title={title}
      subtitle={subtitle}
      items={items}
      columns={3}
      layout="cards"
      className="!p-0"
    />
  );
}
