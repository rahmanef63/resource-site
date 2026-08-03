# dashboard-shell

**Dashboard Shell — one responsive shell + mobile dock**

Desktop: collapsible rail + topbar. Mobile: **no sidebar at all** — a bottom
dock plus a `MobileMenuDrawer` of thumbnail tiles (the Menu tile / topbar
button opens it; items with sub-items drill down one level). Every face renders
from the SAME `nav` prop, so there is no second mobile navigation to keep in
sync and a phone never gets a sheet-shaped copy of the desktop list.

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
| `dock` | derived from `nav` | Explicit items, or `false` to drop the dock (the topbar button still opens the drawer). |
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

- shadcn primitives only; needs the `sidebar` + `drawer` primitives installed.
- No Convex, no env, no localStorage. The dock is CSS (`md:hidden`); the rail
  and the trigger read `isMobile` from shadcn's own `useSidebar()` — one source
  for the breakpoint, no second media query of our own.

Run `npm run slices:check` before commit.
