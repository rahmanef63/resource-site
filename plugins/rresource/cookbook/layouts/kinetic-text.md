# Layout — Landing — Kinetic Text

> **Portability tier:** M
> **Origin source:** rahmanef.com (motion primitives at `frontend/shared/ui/`)

## Tujuan

Brand-forward landing. Letter-stagger headings + magnetic CTAs + marquee strips. Motion-heavy.

## Files (vendored locations on Rahman's box)

NOT YET VENDORED — port motion primitives (marquee, kinetic-heading, magnetic) from rahmanef.com

When this plugin is shipped without the original source repos, the
agent must:
1. Tell the user the source path is missing.
2. Either ask user to mount the source repo, OR scaffold a minimal
   stub from the example code below + agentRecipe instructions.

## Integration example

```tsx
import { KineticHeading } from "@/components/motion/kinetic-heading";
import { Magnetic } from "@/components/motion/magnetic";
import { Marquee } from "@/components/motion/marquee";

<KineticHeading text="We build things" stagger={36} className="text-7xl font-serif" />
<Magnetic radius={120}><button>Get in touch</button></Magnetic>
<Marquee speed={30}>brands…</Marquee>
```

## Agent recipe

Use motion primitives marquee, kinetic-heading, magnetic from components/motion (already imported into the kitab from rahmanef.com). All respect prefers-reduced-motion automatically.

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
