# Notion Port Checklist

Notion sources copied from `/home/rahman/projects/notion-page-clone/` (Vite + React Router) into nested vertical slice:

```
frontend/slices/notion/
├── slices/                # 27 inner slices (editor, databases, comments, etc)
├── shared/                # notion-private shared (components, hooks, lib, types, ui)
└── app-fragments/         # original notion app/ (BrowserRouter routes — port to Next App Router)

convex/features/notion/    # notion convex code (flat, not nested)
```

## Done

- [x] Files copied verbatim
- [x] Internal `@/` imports rewritten → `@notion/`
- [x] Relative `../../convex/_generated/api` → `@/convex/features/notion/_generated/api`

## Pending (Vite→Next port)

### 1. tsconfig path alias
Add to `template-base/tsconfig.json`:
```json
"@notion/*": ["./frontend/slices/notion/*"]
```

### 2. Convex API surface rename
Originally `api.pages.list`, `api.databases.get`, etc. After move to `convex/features/notion/`, callers must rewrite:
```bash
# Sed pattern (verify each before running):
grep -rln 'api\.pages\.\|api\.databases\.\|api\.recents\.\|api\.preferences\.\|api\.snapshots\.\|api\.workspaces\.' frontend/slices/notion
# → rewrite to api.features.notion.pages.* etc
```

### 3. Routing port
- `app-fragments/App.tsx` (`<BrowserRouter>`) → delete (Next.js native routing)
- `app-fragments/routes/{route}.tsx` → `app/dashboard/notion/{route}/page.tsx`
- `useNavigate()` → `useRouter()` from `next/navigation`
- `useParams()` → from `next/navigation`
- `<Link to="...">` → `<Link href="...">` from `next/link`
- `<Outlet>` → Next.js layout children prop

### 4. Add `"use client"` directive
All editor blocks, sidebar, command palette, selection — anything using DOM APIs (contenteditable, document listeners, ResizeObserver). Bash one-liner candidates:
```bash
grep -rL '"use client"' frontend/slices/notion/slices --include="*.tsx" | head
```

### 5. Drop Vite-specific
- `app-fragments/main.tsx` (Vite entry) → delete
- `app-fragments/App.css`, `index.css` → fold into globals.css or delete
- Any `import.meta.env.*` → `process.env.NEXT_PUBLIC_*`

### 6. Zustand SSR hydration
`shared/lib/store.tsx` uses Zustand. Add hydration guard or use `next-zustand` pattern. Initial state must be deterministic SSR↔CSR.

### 7. Outer slice wrapper
Create `frontend/slices/notion/config.ts`:
```ts
import { defineFeature } from '@/frontend/shared/lib/features/defineFeature';

export default defineFeature({
  id: 'notion',
  name: 'Notion',
  description: 'Block editor + databases + comments (nested vertical slice)',
  icon: 'IconNotebook',
  path: '/dashboard/notion',
  component: 'NotionPage',
  status: { state: 'beta' },
  permissions: ['notion.read', 'notion.write'],
  hasConvex: true,
});
```

Create `frontend/slices/notion/page.tsx` mounting one of the notion routes (e.g. workspace shell).

### 8. Mount inside ThreeColumnLayout
Wrap `<NotionPage>` with superspace `<ThreeColumnLayout>`:
- left: workspace-sidebar
- center: editor
- right: comments / inspector

### 9. Auth integration
Notion source uses `@convex-dev/auth` already (confirmed). Just wire to the kitab's auth provider. No Clerk migration needed for notion code.

### 10. Validate
```bash
npm run validate:slice-structure -- frontend/slices/notion
npm run audit:bp -- --slice frontend/slices/notion
npm run typecheck
```

## Caveat

This port is real engineering work, est. 2-3 weeks. Treat as separate project once kitab base is stable. The copy-first foundation is now done — incremental port can proceed file-by-file from here.
