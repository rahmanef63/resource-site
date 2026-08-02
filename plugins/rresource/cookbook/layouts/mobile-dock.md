# Layout — Dashboard — Mobile Dock

> **Portability tier:** M
> **Origin source:** kitab-core (private — `shared/ui/layout/dashboard/MobileDashboardShell.tsx`)

## Tujuan

Mobile-first auth app. MobileTopBar + content + MobileDashboardDock bottom nav. Native-app feel on mobile, sidebar on desktop.

## Files (vendored locations on Rahman's box)

NOT YET VENDORED — port from kitab-core per CLAUDE.md source map

When this plugin is shipped without the original source repos, the
agent must:
1. Tell the user the source path is missing.
2. Either ask user to mount the source repo, OR scaffold a minimal
   stub from the example code below + agentRecipe instructions.

## Integration example

```tsx
// app/dashboard/layout.tsx
import { ResponsiveDashboardShell } from "@/frontend/shared/ui/layout/dashboard/ResponsiveDashboardShell";

export default function Layout({ children }: { children: React.ReactNode }) {
  return <ResponsiveDashboardShell>{children}</ResponsiveDashboardShell>;
}
```

## Agent recipe

Use ResponsiveDashboardShell which branches desktop (sidebar) vs mobile (dock). Customize MobileDashboardDock items and MobileTopBar workspace switcher to your domain.

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
