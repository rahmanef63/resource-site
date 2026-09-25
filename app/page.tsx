import type { Metadata } from "next";
import { site } from "@/lib/content/site";

// Homepage-only canonical; nested documentation must not inherit a homepage canonical.
export const metadata: Metadata = {
  alternates: { canonical: site.url },
  authors: [{ name: site.author, url: site.authorUrl }],
};

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
