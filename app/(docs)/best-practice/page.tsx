import type { Metadata } from "next";
import { BEST_PRACTICES } from "@/lib/content/best-practices";
import { buildBestPracticesPrompt } from "@/lib/content/best-practices-prompt";
import { BestPracticeTabs } from "./tabs";

export const metadata: Metadata = {
  title: "Best Practice",
  description:
    "Rahman Resources doctrine — stack, structure, Convex, Next.js, UI, and delivery rules. Includes a one-paste prompt so any AI agent (Claude / ChatGPT / Cursor) follows the same rules seamlessly.",
};

export default function BestPracticePage() {
  const prompt = buildBestPracticesPrompt();
  return (
    <div className="space-y-6">
      <div>
        <p className="text-sm font-medium text-muted-foreground">Standards</p>
        <h1 className="mt-2 text-3xl font-bold tracking-tight">Best Practice</h1>
        <p className="mt-3 max-w-2xl text-base text-muted-foreground">
          Single source of truth for how rr-based projects are built. Two
          surfaces, one data file — the Docs tab is for humans, the AI Prompt
          tab is for pasting into your AI agent so it follows the same rules.
        </p>
      </div>
      <BestPracticeTabs sections={BEST_PRACTICES} prompt={prompt} />
    </div>
  );
}
