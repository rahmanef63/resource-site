/**
 * motion-kit — scroll-motion layer + carousel + accordion.
 *
 * Zero-dep reveal primitives (IntersectionObserver + CSS, gated behind
 * prefers-reduced-motion) plus an embla Carousel and a radix Accordion.
 * Consumers append globals-motion.css to their app/globals.css for the
 * [data-reveal] transitions + accordion/marquee/blob keyframes.
 *
 * Lifted 2026-06-10 from the fleet `_shared/motion` copy (8 rr website
 * templates already ship a byte-identical copy; this is the rr SSOT so
 * future scaffolds get it via `npx rr add motion-kit`).
 */

import { defineSliceContract } from "@/packages/cli/lib/contract";

export const contract = defineSliceContract({
  id: "motion-kit",
  version: "0.1.0",
  category: "ui",
  kind: "ui",
  provides: {
    components: [
      "Reveal", "Stagger", "CountUp", "Marquee",
      "Carousel", "CarouselContent", "CarouselItem",
      "CarouselPrevious", "CarouselNext",
      "Accordion", "AccordionItem", "AccordionTrigger", "AccordionContent",
    ],
    utils: [],
    hooks: ["useInView"],
    types: ["RevealVariant", "CarouselApi"],
  },
  requires: {
    npm: ["embla-carousel-react", "embla-carousel-autoplay", "radix-ui", "lucide-react"],
    shadcn: ["button"],
    env: [],
    peers: [],
    routes: [],
    tables: [],
  },
});
