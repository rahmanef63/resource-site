import type { Metadata } from "next";
import { BEST_PRACTICES } from "@/lib/content/best-practices";
import { buildBestPracticesPrompt } from "@/lib/content/best-practices-prompt";
import { PageHeader } from "@/components/site/page-header";
import { BestPracticeTabs } from "./tabs";

export const metadata: Metadata = {
  title: "Best Practice",
  description:
    "Rahman Resources doctrine — stack, structure, Convex, Next.js, UI, and delivery rules. Includes a one-paste prompt so any AI agent (Claude / ChatGPT / Cursor) follows the same rules seamlessly.",
};

export default function BestPracticePage() {
  const prompt = buildBestPracticesPrompt();
  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow="Standards"
        title="Best Practice"
        description="Single source of truth for how rr-based projects are built. Two surfaces, one data file — the Docs tab is for humans, the AI Prompt tab is for pasting into your AI agent so it follows the same rules."
      />
      <BestPracticeTabs sections={BEST_PRACTICES} prompt={prompt} />
    </div>
  );
}
