import { FeatureGridSection } from "@/features/feature-grid";
import { features } from "@/lib/content/sections";

/**
 * Dogfood — uses the canonical `feature-grid` slice that templates ship via
 * `npx rr add feature-grid`. Single SSOT so the rr site shows the same
 * primitive consumers install.
 */
export function FeaturesGrid() {
  return (
    <div id="features" className="border-b">
      <FeatureGridSection
        title="What's in the box"
        subtitle="Every artifact has been battle-tested in production. Pick what you need, strip what you don't."
        align="center"
        columns={4}
        items={features.map((f, i) => ({
          id: String(i),
          title: f.title,
          body: f.description,
          icon: f.icon,
        }))}
      />
    </div>
  );
}
