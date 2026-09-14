# motion-kit — Svelte 5 / SvelteKit

Native Svelte distribution of the RR motion layer. It preserves the canonical motion vocabulary while avoiding React, Lucide, Radix React, and React shadcn runtime dependencies.

```bash
npx rr add motion-kit --framework sveltekit
```

## Exports

- `Reveal`, `Stagger`, `CountUp`, `Marquee` — native Svelte 5 primitives over the shared observer/easing/CSS core.
- `useInView` — Svelte action + readonly store helper backed by the same `observeInView` core.
- `Carousel*` — Embla core initialized in `onMount` and destroyed on unmount; previous/next controls expose native button a11y.
- `Accordion*` — native Svelte context/state, button semantics, `aria-expanded`/`aria-controls`, no Radix React dependency.

Append the copied canonical `frontend/slices/motion-kit/globals-motion.css` rules to the host global stylesheet. Reveal, marquee, accordion entrance, and count-up behavior all respect `prefers-reduced-motion`. Optional Embla autoplay remains available through the installed `embla-carousel-autoplay` package.
