"use client";
/** Variant preview (VP wave) — rr-internal, stripped on `rr add`. */
import type { SlicePreviewModule } from "@/shared/preview/types";
import { TestimonialsGridSection, type Testimonial } from "./views/TestimonialsGridSection";

const ITEMS: Testimonial[] = [
  {
    id: "1",
    quote: "Shipped a marketing site in an afternoon.",
    author: "Dina",
    role: "Founder",
    company: "Cesca",
    rating: 5,
    featured: true,
  },
  {
    id: "2",
    quote: "The copy-first flow just clicks.",
    author: "Arman",
    role: "Engineer",
    company: "Samata",
    rating: 5,
  },
  {
    id: "3",
    quote: "No lock-in, full ownership of the code.",
    author: "Lia",
    role: "Designer",
    company: "Studio",
    rating: 4,
  },
];

const preview: SlicePreviewModule = {
  TestimonialsGridSection: ({ variant }) => (
    <div className="p-4">
      <TestimonialsGridSection
        title="Loved by builders"
        items={ITEMS}
        layout={(variant.layout as "cards" | "quote-stack" | "masonry") ?? "cards"}
        columns={(Number(variant.columns) as 1 | 2 | 3) || 2}
        align={(variant.align as "left" | "center") ?? "left"}
        className="px-0 py-0"
      />
    </div>
  ),
};
export default preview;
