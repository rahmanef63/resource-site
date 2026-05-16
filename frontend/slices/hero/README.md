# hero

Editorial split-grid hero. Props-driven — no consumer-side `SITE_CONFIG`
hardcode. Pairs visually with `cta` (same brutalist border + serif scale).

## Install

```bash
npx rr add hero
```

## Use

```tsx
import { HeroView } from "@/features/hero";

<HeroView
  eyebrow="Independent Designer"
  title="Rahman Ef"
  quote="Quiet systems, loud results."
  ctas={[
    { href: "/work", label: "View Work" },
    { href: "/contact", label: "Get in Touch", variant: "outline" },
  ]}
  image={{ src: "/portrait.webp", alt: "Portrait" }}
  imageCaption="FIG. 01 — Rahman Ef"
/>
```

Pass `image={undefined}` for a text-only hero (single-column 12-span).

## Tailwind utilities used

Uses only stock Tailwind utilities (no custom `tracking-brutal*` presets);
relies on theme tokens `foreground`, `background`, `muted`, `muted-foreground`
which shadcn ships by default. `font-serif` resolves to the consumer's
configured serif stack.
