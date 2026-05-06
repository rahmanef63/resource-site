# dashboard-mobile-dock

Mobile-first auth app with bottom dock nav. Lifted from superspace `MobileDashboardShell`.

## Source

`template-base/frontend/shared/ui/layout/dashboard/MobileDashboardShell.tsx` + `mobile/` subdir (dock, profile sheet, launcher).

## Anatomy

```
+----------------------+
|  MobileTopBar        |
+----------------------+
|                      |
|     Content          |
|                      |
+----------------------+
|  MobileDashboardDock |
+----------------------+
```

- `MobileTopBar` — workspace switcher button + search/settings icons
- `MobileDashboardDock` — bottom tab bar (Home / Search / Notifications / Profile)
- `MobileProfileSheet` — slides up bottom sheet for profile actions

## Composition

```tsx
// app/dashboard/layout.tsx
import { ResponsiveDashboardShell } from "@/frontend/shared/ui/layout/dashboard/ResponsiveDashboardShell";

export default function Layout({ children }: { children: React.ReactNode }) {
  return <ResponsiveDashboardShell>{children}</ResponsiveDashboardShell>;
}
```

`ResponsiveDashboardShell` branches: desktop (sidebar) vs mobile (dock).

## When to use

- Mobile-primary apps (PWA, field tools, consumer apps)
- Want native-app feel on mobile while preserving desktop power
