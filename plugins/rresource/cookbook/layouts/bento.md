# Layout — Landing — Bento Grid

> **Portability tier:** S
> **Origin source:** synthesized (compose Card + Magnetic + KineticHeading from rahmanef.com motion primitives)

## Tujuan

Feature-grid marketing landing. Compose Card + Magnetic + KineticHeading. Modern SaaS feel.

## Files (vendored locations on Rahman's box)

NOT YET VENDORED — depends on motion primitives from rahmanef.com

When this plugin is shipped without the original source repos, the
agent must:
1. Tell the user the source path is missing.
2. Either ask user to mount the source repo, OR scaffold a minimal
   stub from the example code below + agentRecipe instructions.

## Integration example

```tsx
<section className="grid grid-cols-3 gap-4">
  <Card className="col-span-2 row-span-2">Feature 1</Card>
  <Card>Feature 2</Card>
  <Card>Feature 3</Card>
  <Card className="col-span-2">Feature 4</Card>
  <Card>Feature 5</Card>
</section>
```

## Agent recipe

Compose a 3-column CSS grid with explicit area assignments per feature. Mix Card sizes (1x1, 1x2, 2x1, 2x2) for visual rhythm.

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
