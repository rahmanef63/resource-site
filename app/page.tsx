import { Hero } from "@/components/site/hero";
import { ShowcaseGrid } from "@/components/site/showcase-grid";
import { StackStrip } from "@/components/site/stack-strip";
import { FeaturesGrid } from "@/components/site/features-grid";
import { GetStarted } from "@/components/site/get-started";

export default function HomePage() {
  return (
    <>
      <Hero />
      <FeaturesGrid />
      <ShowcaseGrid kind="slices" />
      <StackStrip />
      <GetStarted />
    </>
  );
}
