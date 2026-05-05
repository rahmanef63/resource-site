# Layout — Dashboard — IDE

> **Portability tier:** M
> **Origin source:** synthesized

## Tujuan

Activity bar + tabs + editor + bottom panel. Editor-first apps (notion, code, doc tools).

## Files (vendored locations on Rahman's box)

NOT YET VENDORED — scaffold from example below

When this plugin is shipped without the original source repos, the
agent must:
1. Tell the user the source path is missing.
2. Either ask user to mount the source repo, OR scaffold a minimal
   stub from the example code below + agentRecipe instructions.

## Integration example

```tsx
<div className="grid h-screen grid-cols-[48px_1fr] grid-rows-[auto_1fr_200px]">
  <ActivityBar className="row-span-3" />
  <TabsBar className="border-b" />
  <main className="flex">
    <EditorArea className="flex-1" />
    <Inspector className="w-80 border-l" />
  </main>
  <Console className="border-t" />
</div>
```

## Agent recipe

Compose grid: 48px activity bar + tabs row + editor/inspector flex row + bottom console. Wire activity bar items to dispatch into tabs/inspector store.

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
