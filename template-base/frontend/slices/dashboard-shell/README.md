# `dashboard-shell` slice — facade

Responsive dashboard shell. Wraps your authenticated routes:

- **Desktop** — persistent sidebar + topbar
- **Mobile** — collapsible Sheet sidebar + bottom dock

```tsx
import { ResponsiveDashboardShell } from "@/features/dashboard-shell";
import { AppSidebar } from "@/frontend/shared/ui/layout/sidebar/primary/AppSidebar";
import { FullWidthToggle } from "@/features/full-width-toggle";

<ResponsiveDashboardShell
  mode="authenticated"
  sidebar={<AppSidebar />}
  topbar={<><BreadcrumbSlot /><FullWidthToggle /></>}
>
  {children}
</ResponsiveDashboardShell>
```

Pair with `full-width-toggle` for instant container resize from the topbar.

## Components

| Export | Use |
|---|---|
| `ResponsiveDashboardShell` | Default — auto-switches desktop/mobile |
| `DesktopDashboardShell` | Force desktop layout (e.g. inside iframe) |
| `MobileDashboardShell` | Force mobile layout (e.g. testing) |

## Deps

- shadcn `sheet`, `scroll-area`, `separator`, `tooltip`
- (peer) `full-width-toggle` — recommended in the topbar
