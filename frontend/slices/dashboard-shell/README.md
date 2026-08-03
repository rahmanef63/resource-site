# dashboard-shell

**Dashboard Shell — one responsive shell + mobile dock**

Desktop: collapsible rail + topbar. Mobile: sheet sidebar + bottom dock. Both
faces render from the SAME `nav` prop — the dock derives from it, so there is
no second mobile navigation to keep in sync.

## Install

```bash
npx rr add dashboard-shell
```

## Use

```tsx
import { DashboardShell } from "@/features/dashboard-shell";
import { FileText, Home, Settings } from "lucide-react";

const nav = [
  {
    id: "workspace",
    label: "Workspace",
    items: [
      { id: "home", label: "Home", icon: Home, href: "/app", exact: true, dock: true },
      { id: "posts", label: "Posts", icon: FileText, href: "/app/posts", dock: true },
    ],
  },
  { id: "system", items: [{ id: "settings", label: "Settings", icon: Settings, href: "/app/settings" }] },
];

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <DashboardShell brand={{ name: "Acme" }} nav={nav} actions={<UserMenu />}>
      {children}
    </DashboardShell>
  );
}
```

### Props

| Prop | Default | Notes |
|---|---|---|
| `nav` | — | Groups → items → one level of sub-items. SSOT for rail + dock. |
| `brand` | — | `{ name, logo?, href?, caption? }`. Ignored when `sidebarHeader` is set. |
| `sidebarHeader` | brand block | Workspace switcher slot (e.g. `workspace-shell`). |
| `sidebarFooter` | — | User menu slot. |
| `dock` | derived from `nav` | Explicit items, or `false` to drop the dock. |
| `dockMax` | `4` | Cap when deriving (a "Menu" button is appended). |
| `title` / `actions` | active item's label | Topbar heading + right-hand slot. |
| `topbar` | default header | Full replace; `null` = no topbar. |
| `secondary` | — | Narrow contextual column (desktop only) = three-column archetype. |
| `activePath` | `usePathname()` | Drive the shell from state instead of the router. |
| `collapsible` | `"icon"` | shadcn Sidebar mode. |

Items carry `href` (renders `next/link`) **or** `onSelect` (renders a button),
plus optional `icon`, `badge`, `exact`, `dock`, and one level of `items`.

Helpers are exported too — `isActive`, `deriveDock`, `activeItem`,
`activeTitle`, `flattenNav` — if you build your own chrome on the same nav.

## Constraints (rr conventions)

- shadcn primitives only; needs the `sidebar` primitive installed.
- No Convex, no env, no localStorage. Breakpoints are CSS (`md:hidden`) plus
  shadcn's Sidebar sheet — the slice never measures the viewport itself.

Run `npm run slices:check` before commit.
