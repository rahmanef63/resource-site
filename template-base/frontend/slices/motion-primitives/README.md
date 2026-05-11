# `motion-primitives` slice — facade

Eight ready-to-style motion components from `frontend/shared/ui/motion/`:

| Component | Use |
|---|---|
| `Marquee` | Logo strips, ticker tape |
| `KineticHeading` | Hero text with split-letter animation |
| `Magnetic` | CTA buttons that pull toward cursor |
| `CursorSpotlight` | Hover-reveal panels |
| `StatCounter` | Animated stat numbers |
| `ReadingProgress` | Blog top progress bar |
| `Grain` | Film grain texture overlay |
| `Lightbox` | Image gallery modal |

Tree-shakeable: only the ones you import end up in your bundle.

```tsx
import { Marquee, KineticHeading } from "@/features/motion-primitives";

<KineticHeading>Membangun masa depan</KineticHeading>
<Marquee items={logos} durationSec={40} />
```

## Deps

- `framer-motion`
