import { Hero } from "@/components/site/hero";
import { ComponentShowcase } from "@/components/site/component-showcase";
import { ShowcaseGrid } from "@/components/site/showcase-grid";
import { StackStrip } from "@/components/site/stack-strip";
import { FeaturesGrid } from "@/components/site/features-grid";
import { InstallSection } from "@/components/site/install-section";

export default function HomePage() {
  return (
    <>
      <Hero />
      <FeaturesGrid />
      <ComponentShowcase />
      <ShowcaseGrid kind="layouts" />
      <ShowcaseGrid kind="recipes" />
      <StackStrip />
      <InstallSection />
    </>
  );
}
