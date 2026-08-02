# motion-kit

Scroll-motion layer + carousel + accordion for rr website templates. Tasteful
entrance animations with **no motion library** — IntersectionObserver + CSS for
reveals, embla for the carousel, radix for the accordion.

## What ships

| Export | What |
|---|---|
| `Reveal` | scroll-reveal wrapper — `variant` fade-up/fade/fade-left/fade-right/zoom, `delay`, `scope` |
| `Stagger` | wraps grid/list children, each revealing with an incremental delay (`step`, `cap`, `itemClassName`) |
| `CountUp` | animates 0 → value on scroll-in (rAF ease-out); `locale` formatting; integers only |
| `Marquee` | infinite horizontal logo/brand strip; hover-pause; edge fade |
| `useInView` | the IntersectionObserver hook behind the above |
| `Carousel*` | embla carousel (Carousel/Content/Item/Previous/Next); pass `Autoplay` plugin for autoplay |
| `Accordion*` | radix accordion (Accordion/Item/Trigger/Content) |

All reveal + keyframe motion is gated behind `prefers-reduced-motion`.

## Setup

See `HOST-SETUP.md` — the one non-obvious step is appending `globals-motion.css`
to your `app/globals.css`.

## Relationship to the fleet

Lifted 2026-06-10 from the `_templates` fleet `_shared/motion` copy. The 8
standalone website templates already ship a byte-identical copy; this rr slice
is the SSOT so future scaffolds get it via `npx rr add motion-kit`. When the
fleet copy changes, update here first, then re-sync the fleet.

Pairs with **landing-sections** (its renderer set consumes these primitives).
