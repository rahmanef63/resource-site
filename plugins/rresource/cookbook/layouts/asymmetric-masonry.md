# Layout — Landing — Asymmetric Masonry

> **Portability tier:** S
> **Origin source:** rahmanef.com (`frontend/slices/portfolio/components/PortfolioGrid.tsx`)

## Tujuan

8-slot repeating asymmetric grid with IntersectionObserver staggered scroll-reveal. Lifted from rahmanef.com portfolio.

## Files (vendored locations on Rahman's box)

NOT YET VENDORED — copy from rahmanef.com source repo per CLAUDE.md source map

When this plugin is shipped without the original source repos, the
agent must:
1. Tell the user the source path is missing.
2. Either ask user to mount the source repo, OR scaffold a minimal
   stub from the example code below + agentRecipe instructions.

## Integration example

```tsx
import { PortfolioGrid } from "@/cookbook/landing-asymmetric-masonry/PortfolioGrid";

export default function PortfolioPage() {
  return <PortfolioGrid items={items} />;
}
```

## Agent recipe

Use PortfolioGrid for case-study or portfolio pages. Items array shape: { id, title, cover, href, category }. The 8-slot pattern repeats; supply at least 8 items for the layout to bloom.

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
