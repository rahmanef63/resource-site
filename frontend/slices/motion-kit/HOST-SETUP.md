# motion-kit — host setup

```bash
npx rr add motion-kit
```

## 1. Append the CSS

The reveal transitions + accordion/marquee/blob keyframes live in
`globals-motion.css`. Append its contents to your `app/globals.css` (after the
`@import "tailwindcss";` line). Without it, `data-reveal` elements stay visible
but don't animate, and the accordion snaps instead of sliding.

```css
/* app/globals.css — paste the contents of globals-motion.css here */
```

> The block is wrapped in `@media (prefers-reduced-motion: no-preference)` so
> reduced-motion users see content instantly. The `@theme inline` accordion
> vars require Tailwind v4.

## 2. Deps

`npx rr add` installs `embla-carousel-react`, `embla-carousel-autoplay`,
`radix-ui`, `lucide-react`. Shadcn `button` is required by the carousel arrows.

## 3. Use

```tsx
import { Reveal, Stagger, CountUp, Marquee } from "@/features/motion-kit";

<Reveal variant="fade-up">…</Reveal>
<Stagger itemClassName="h-full">{cards}</Stagger>   {/* grid children */}
<CountUp value={4800} suffix="+" />                  {/* integers only */}
<Marquee speed={32}>{logos}</Marquee>
```

Carousel (autoplay optional):

```tsx
import Autoplay from "embla-carousel-autoplay";
import { Carousel, CarouselContent, CarouselItem, CarouselPrevious, CarouselNext } from "@/features/motion-kit";

<Carousel opts={{ align: "start", loop: items.length > 3 }}
          plugins={[Autoplay({ delay: 4500, stopOnInteraction: true })]}>
  <div className="mb-4 flex justify-end gap-2"><CarouselPrevious /><CarouselNext /></div>
  <CarouselContent>
    {items.map((x) => <CarouselItem key={x.id} className="basis-full sm:basis-1/2 lg:basis-1/3">…</CarouselItem>)}
  </CarouselContent>
</Carousel>
```

## Gotchas

- A bare `data-reveal` attribute stays invisible unless it sits inside an
  `.is-inview` scope. Always use the `<Reveal>` / `<Stagger>` components in app
  code — they self-observe.
- Any component that consumes a passed icon/render function AND uses these
  hooks must be a Client Component (`"use client"`).
- Hover-lift convention: `transition-[translate,box-shadow] duration-300
  hover:-translate-y-1 hover:shadow-lg` (TW4 `translate` utility — doesn't clash
  with the reveal transform).
- Pairs with `landing-sections` (its renderers consume Reveal/Stagger/CountUp/
  Marquee + Carousel/Accordion).
