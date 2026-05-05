# Layout — Three-Column Dashboard

> **Portability tier:** M
> **Origin source:** kitab-core (private — components vendored at `components/previews/three-column/`)

## Tujuan

Kitab flagship dashboard layout. Left tree / main / right inspector. Resizable, collapsible, mobile drawer fallback. Used by Database, Tasks, Contacts.

## Files (vendored locations on Rahman's box)

components/previews/three-column/ThreeColumnLayout.tsx (vendored in resource-site repo)

When this plugin is shipped without the original source repos, the
agent must:
1. Tell the user the source path is missing.
2. Either ask user to mount the source repo, OR scaffold a minimal
   stub from the example code below + agentRecipe instructions.

## Integration example

```tsx
"use client";
import { ThreeColumnLayoutAdvanced } from "@/components/previews/three-column/ThreeColumnLayout";

export default function FeaturePage() {
  return (
    <ThreeColumnLayoutAdvanced
      left={<FeatureSidebar />}
      center={<MainContent />}
      right={<InspectorPanel />}
      leftWidth={280}
      rightWidth={400}
      resizable
      showCollapseButtons
      className="h-screen"
    />
  );
}
```

## Agent recipe

Mount inside app/dashboard/<slice>/page.tsx. Wrap with the kitab's <ThreeColumnLayoutAdvanced>. Slot in slice-specific sidebars and inspectors. Mobile auto-collapses to drawers.

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
