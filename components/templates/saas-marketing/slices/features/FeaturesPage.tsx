import { SectionHead } from "@/components/templates/_shared/ui/section-head";
import { FeatureGridClient } from "./FeatureGridClient";

/**
 * Server chrome for the public Features page. The live feature grid is
 * wrapped in a "use client" component (FeatureGridClient) that reads from
 * the template store so admin edits propagate live across tabs.
 */
export function FeaturesPage() {
  return (
    <section>
      <div className="mx-auto max-w-6xl px-6 py-20">
        <SectionHead
          eyebrow="Features"
          title="Everything you need to ship a signed PDF"
          subtitle="One opinionated API, audit-ready by default."
        />
        <FeatureGridClient />
      </div>
    </section>
  );
}
