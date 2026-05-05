# Layout — Landing — Hero Carousel

> **Portability tier:** S
> **Origin source:** cescadesigns (`/home/rahman/projects/cescadesigns/components/cummon/hero-section.tsx`); Convex-stripped fork vendored at `components/previews/hero-carousel/`

## Tujuan

Full-width image carousel hero with auto-fade + dot indicators. Originally CMS-driven via Convex. Best for visual brands.

## Files (vendored locations on Rahman's box)

components/previews/hero-carousel/HeroCarousel.tsx (vendored, Convex-free)

When this plugin is shipped without the original source repos, the
agent must:
1. Tell the user the source path is missing.
2. Either ask user to mount the source repo, OR scaffold a minimal
   stub from the example code below + agentRecipe instructions.

## Integration example

```tsx
import { HeroCarousel } from "@/components/previews/hero-carousel/HeroCarousel";

const IMAGES = [{ src: "...", alt: "..." }];

export default function HomePage() {
  return <HeroCarousel images={IMAGES} intervalMs={4000} />;
}
```

## Agent recipe

Mount the HeroCarousel from components/previews/hero-carousel as the hero of the marketing route group. Provide image array via props or wire to Convex api.heroImages.list.

## Schema / npm / env

None unless the layout wraps a data slice (see specific recipe docs).

## Common breakage

- Path aliases mismatch (consumer uses `src/` not `frontend/src/`) — fix `tsconfig.json` once.
- Tailwind tokens missing (`bg-brand`, `text-muted-foreground`) — port `theme-preset` first.
- Motion primitives missing — port from rahmanef.com per source map.

## Testing

1. Mount layout in a route.
2. Resize viewport — verify mobile/desktop branches behave per spec.
3. `pnpm typecheck && pnpm build` clean.
