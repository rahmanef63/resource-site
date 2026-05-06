# landing-kinetic-text

Brand-forward, motion-heavy landing. Big headlines with letter-stagger reveals + magnetic CTAs + marquee strips.

## Composition

```tsx
import { KineticHeading } from "@/frontend/shared/ui/motion/kinetic-heading";
import { Magnetic } from "@/frontend/shared/ui/motion/magnetic";
import { Marquee } from "@/frontend/shared/ui/motion/marquee";

export default function HomePage() {
  return (
    <main>
      <section className="min-h-screen flex flex-col justify-center px-8">
        <KineticHeading text="We build things" stagger={36} className="text-7xl font-serif" />
        <p className="mt-6 max-w-xl text-lg text-muted-foreground">Tagline.</p>
        <div className="mt-12">
          <Magnetic radius={120}>
            <button className="px-8 py-4 bg-primary text-primary-foreground rounded-full text-lg">
              Get in touch →
            </button>
          </Magnetic>
        </div>
      </section>
      <Marquee speed={30} className="border-y py-8">
        <span className="text-2xl mx-8">Brand A</span>
        <span className="text-2xl mx-8">Brand B</span>
        <span className="text-2xl mx-8">Brand C</span>
      </Marquee>
    </main>
  );
}
```

## When to use

- Personal site, agency, design studio
- Want maximum brand personality
- Performance OK (motion-heavy)

## Accessibility

All motion primitives respect `prefers-reduced-motion`. No special handling needed.
