// motion-kit — scroll reveals + carousel + accordion + micro-interactions.
// Zero-dep reveal layer (IntersectionObserver + CSS); carousel = embla.
// Append globals-motion.css to your app/globals.css (see HOST-SETUP.md) for
// the [data-reveal] rules + accordion/marquee/blob keyframes. All motion is
// gated behind prefers-reduced-motion.
export { useInView } from "./motion/use-in-view";
export { Reveal, type RevealVariant } from "./motion/reveal";
export { Stagger } from "./motion/stagger";
export { CountUp } from "./motion/count-up";
export { Marquee } from "./motion/marquee";
export {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselPrevious,
  CarouselNext,
  type CarouselApi,
} from "./ui/carousel";
export {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from "./ui/accordion";
