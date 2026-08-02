# Motion Primitives

Lightweight motion components, no framer-motion dep where avoidable. All from rahmanef.com.

| Component | File | Tech |
|---|---|---|
| `<Marquee>` | `frontend/shared/ui/motion/marquee.tsx` | CSS `translate3d`, infinite scroll, `prefers-reduced-motion` |
| `<KineticHeading>` | `kinetic-heading.tsx` | letter-by-letter stagger via `animation-delay` |
| `<Magnetic>` | `magnetic.tsx` | rAF cursor tracking, `(hover: none)` + `prefers-reduced-motion` aware |
| `<CursorSpotlight>` | `cursor-spotlight.tsx` | radial gradient pointer follow |
| `<StatCounter>` | `stat-counter.tsx` | requestAnimationFrame number increment |
| `<ReadingProgress>` | `reading-progress.tsx` | scroll-driven progress bar |
| `<Grain>` | `grain.tsx` | noise texture overlay |
| `<Lightbox>` | `lightbox.tsx` | image modal viewer |

## Usage

```tsx
import { Marquee } from "@/frontend/shared/ui/motion/marquee";
import { KineticHeading } from "@/frontend/shared/ui/motion/kinetic-heading";
import { Magnetic } from "@/frontend/shared/ui/motion/magnetic";

<Marquee speed={40}>
  <span>Item one</span><span>Item two</span><span>Item three</span>
</Marquee>

<KineticHeading text="Welcome" stagger={36} />

<Magnetic radius={80}>
  <button className="...">Hover me</button>
</Magnetic>
```

## Accessibility

All primitives respect `prefers-reduced-motion: reduce` automatically. Magnetic + CursorSpotlight also disabled on `(hover: none)` (touch devices).

## When NOT to use

- Heavy state transitions → use `framer-motion` directly
- Page transitions → Next 16 view-transitions API
- Scroll-driven animations → CSS scroll-driven animations or IntersectionObserver
