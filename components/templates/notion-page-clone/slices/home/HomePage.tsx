"use client";

import { useLandingSections } from "../../shared/store";
import { renderLanding } from "./LandingRenderer";

/** Public landing for Nosion-OS. Reads admin-editable landingSections
 *  + renders each via canonical rr slices (HeroBlock, FeatureGridSection,
 *  CtaBand) plus a custom snippets gallery for the notion-blocks demo. */
export function HomePage() {
  const sections = useLandingSections()
    .filter((s) => s.enabled)
    .sort((a, b) => a.order - b.order);
  return (
    <main>
      {sections.map((section) => (
        <div key={section.id}>{renderLanding(section)}</div>
      ))}
    </main>
  );
}
