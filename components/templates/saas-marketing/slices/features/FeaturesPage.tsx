import { FeatureGridClient } from "./FeatureGridClient";

/**
 * Server chrome for the public Features page. Live grid is delegated to the
 * canonical feature-grid slice (frontend/slices/feature-grid) via the client
 * wrap FeatureGridClient — admin edits propagate live across tabs.
 */
export function FeaturesPage() {
  return (
    <section>
      <div className="mx-auto max-w-6xl px-6 pt-12 pb-20">
        <FeatureGridClient
          eyebrow="Features"
          title="Everything you need to ship a signed PDF"
          subtitle="One opinionated API, audit-ready by default."
        />
      </div>
    </section>
  );
}
