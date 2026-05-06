# landing-hero-carousel

Marketing landing with full-width image carousel hero. Lifted from cescadesigns.

## Source

- `src/HeroSection.tsx` — copied from `cescadesigns/components/cummon/hero-section.tsx`
- Originally fetches images from Convex `api.heroImages.list` — adapt to your schema or use static array.

## Composition

```tsx
// app/(marketing)/page.tsx
import { HeroSection } from "@/cookbook/landing-hero-carousel/HeroSection";

export default function HomePage() {
  return (
    <main>
      <HeroSection />
      {/* + features, testimonials, footer */}
    </main>
  );
}
```

## When to use

- Visual brand-forward (interior design, photography, hospitality)
- Multiple hero shots to rotate
- Want auto-play + manual dots/arrows

## Dependencies

shadcn primitives only + Convex if using CMS-driven slides.
