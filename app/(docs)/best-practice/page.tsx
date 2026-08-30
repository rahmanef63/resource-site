import type { Metadata } from "next";
import { BEST_PRACTICES } from "@/lib/content/best-practices";
import { buildBestPracticesPrompt } from "@/lib/content/best-practices-prompt";
import type { BestPracticeSelection } from "@/lib/content/best-practice-techs";
import { bestPracticeSelectionKey } from "@/lib/content/best-practice-techs";
import { PageHeader } from "@/components/site/page-header";
import { BestPracticeTabs } from "./tabs";

export const metadata: Metadata = {
  title: "Best Practice",
  description: "Dynamic rr best-practice profiles for current Next.js, Svelte 5, and Convex stacks, generated from one SSOT doctrine.",
};

const PROFILES: BestPracticeSelection[] = [
  { frontend: "nextjs", convex: false },
  { frontend: "nextjs", convex: true },
  { frontend: "svelte", convex: false },
  { frontend: "svelte", convex: true },
];

export default function BestPracticePage() {
  const prompts = Object.fromEntries(PROFILES.map((profile) => [
    bestPracticeSelectionKey(profile),
    buildBestPracticesPrompt(profile),
  ]));
  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow="Standards"
        title="Best Practice"
        description="One doctrine, selectable stack profiles. Activate Next.js or Svelte, add Convex when needed, then copy a prompt generated from the exact same SSOT rules shown in Docs."
      />
      <BestPracticeTabs sections={BEST_PRACTICES} prompts={prompts} />
    </div>
  );
}
