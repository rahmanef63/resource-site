# feature-grid

Reusable, prop-driven feature grid section. Two components — fully
composable from any template marketing page.

## Surface

| Component | Props | Notes |
|---|---|---|
| `FeatureGridSection` | `eyebrow?, title?, subtitle?, items, columns?, layout?, align?, className?` | Header + responsive grid (1-4 columns) of feature cards. |
| `FeatureCard` | `title, body, icon?, image?, link?, variant?, align?, className?` | Single card; usable standalone outside the grid. |

### `FeatureItem` shape

```ts
type FeatureItem = {
  id: string;
  title: string;
  body: string;
  icon?: LucideIcon | string;          // component or first-letter fallback
  image?: { src: string; alt: string }; // rendered above title via next/image
  link?: { label: string; href: string };
};
```

### Layout variants

- `cards` (default) — shadcn `Card` wrapper, bordered surface
- `minimal` — borderless, dense vertical stack
- `alternating` — image-left / image-right rows, `columns` ignored

### Icon handling

- Pass a `LucideIcon` component → renders inline at 5×5 in a bordered tile.
- Pass a `string` → renders a bordered square with the first letter as
  fallback (no dynamic-import gymnastics).

## Usage

```tsx
import { FeatureGridSection } from "@/features/feature-grid";
import { Zap, Shield, Sparkles } from "lucide-react";

<FeatureGridSection
  eyebrow="Platform"
  title="Built for speed"
  subtitle="Everything you need to ship, nothing you don't."
  columns={3}
  layout="cards"
  items={[
    { id: "1", title: "Fast", body: "Sub-50ms cold starts.", icon: Zap },
    { id: "2", title: "Secure", body: "End-to-end encryption.", icon: Shield },
    { id: "3", title: "Magic", body: "Just works.", icon: "S" },
  ]}
/>
```

## Convex tables

None — pure component slice.

## Permissions

None.

## Dependencies

- npm: `lucide-react`, `next` (peer for `next/image` + `next/link`)
- shadcn primitives: `button`, `card`
- env vars: none

## Notes

- All copy is consumer-supplied. The slice ships no English strings.
- Uses neutral shadcn tokens (`bg-muted`, `text-muted-foreground`,
  `border`) — works with any theme preset.
- `next/image` requires images to be allowlisted in `next.config.ts`
  `images.remotePatterns` if using remote `src`.
