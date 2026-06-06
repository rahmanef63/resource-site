"use client";
/** Variant preview (VP wave) — rr-internal, stripped on `rr add`. */
import type { SlicePreviewModule } from "@/shared/preview/types";
import { FAQSection, type FAQItem } from "./views/FAQSection";

const ITEMS: FAQItem[] = [
  {
    id: "1",
    q: "Is there a runtime dependency?",
    a: "No. Files are copied into your repo; you own and edit them freely.",
    category: "Basics",
  },
  {
    id: "2",
    q: "Which auth does it use?",
    a: "@convex-dev/auth — never Clerk.",
    category: "Basics",
  },
  {
    id: "3",
    q: "Can I change the styling?",
    a: "Yes, every component is plain Tailwind + theme tokens.",
    category: "Styling",
  },
  {
    id: "4",
    q: "How do updates work?",
    a: "Re-pull upstream with `npx rr update <slug>`.",
    category: "Maintenance",
  },
];

const preview: SlicePreviewModule = {
  FAQSection: ({ variant }) => (
    <div className="p-4">
      <FAQSection
        title="Frequently asked"
        items={ITEMS}
        layout={(variant.layout as "single" | "two-column" | "grouped") ?? "single"}
        align={(variant.align as "left" | "center") ?? "left"}
        className="px-0 py-0"
      />
    </div>
  ),
};
export default preview;
