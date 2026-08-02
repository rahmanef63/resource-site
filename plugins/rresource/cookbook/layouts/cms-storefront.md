# Layout — CMS — Public Storefront

> **Portability tier:** L
> **Origin source:** kitab-core cms-lite (private — `slices/cms-lite/`)

## Tujuan

E-commerce / blog public storefront. Convex read-only. Cart context + currency selector + i18n.

## Files (vendored locations on Rahman's box)

NOT YET VENDORED — port from kitab-core per CLAUDE.md source map

When this plugin is shipped without the original source repos, the
agent must:
1. Tell the user the source path is missing.
2. Either ask user to mount the source repo, OR scaffold a minimal
   stub from the example code below + agentRecipe instructions.

## Integration example

```tsx
// app/(cms)/layout.tsx
import { ConvexClientProvider } from "@/components/ConvexClientProvider";
import { LanguageProvider } from "@/components/LanguageContext";
import { CartContext } from "@/components/CartContext";

export default function Layout({ children }) {
  return (
    <ConvexClientProvider mode="public">
      <LanguageProvider>
        <CartContext>{children}</CartContext>
      </LanguageProvider>
    </ConvexClientProvider>
  );
}
```

## Agent recipe

Port kitab-core slices/cms-lite/ into your project's app/(cms)/ route group. Fetch products/pages from Convex via api.cmsLite.* queries.

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
