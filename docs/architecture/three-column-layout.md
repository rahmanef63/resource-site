# Three-Column Layout

> Last updated 2026-05-18. Adapted from `superspace/docs/architecture/three-column-layout.md`.

Canonical layout primitive for feature pages with a sidebar / center / inspector pattern (CMS-lite, content, sales, support, admin etc).

Rahman Resources ships TWO copies kept in sync:

| Copy | Path | Purpose |
|---|---|---|
| **Canonical (distributed via CLI)** | `template-base/frontend/shared/ui/layout/container/three-column/` | Source consumers pull from when running `npx rr add` / `npx rr init`. |
| **Site previews** | `components/previews/three-column/` | Used by the resource.rahmanef.com site itself for layout previews. Adds a `tone` prop (`"layout"` blue accent vs `"feature"` muted) and a local `_ResizeHandle` import. |

Both copies expose the same surface; the site copy is a strict superset.

```
three-column/
├── ThreeColumnLayout.tsx           # low-level — manual left/center/right children
├── FeatureThreeColumnLayout.tsx    # wrapper — preset + content props (template-base only)
├── PanelSection.tsx                # Root / Header / Items / Footer compound + Group/Menu primitives
├── PanelHeader.tsx                 # collapse trigger button (icon-only chrome)
├── CollapsedPanel.tsx              # vertical rail rendered when a side panel is collapsed
├── CollapseButton.tsx              # standalone trigger atom
├── Panels.tsx                      # LeftPanel / CenterPanel / RightPanel wrappers
├── context.tsx                     # ThreeColumnContext + useThreeColumnLayout hook
├── hooks.ts                        # usePersistedState / useResponsiveCollapse / useStackedLayout
├── presets.ts                      # feature | store | admin | ide width sets
├── types.ts
├── index.ts                        # barrel
├── components/                     # EmptyState + RightPanelTabs
└── mobile/                         # MobileHeader + MobileInspectorDrawer + MobilePanelWrapper
```

## API at a glance

```tsx
import {
  ThreeColumnLayoutAdvanced,
  PanelSection,
  PanelMenu,
  PanelMenuButton,
} from "@/frontend/shared/ui/layout/container/three-column";

<ThreeColumnLayoutAdvanced
  preset="feature"
  storageKey="content-layout"
  persistState
  // Optional CHROME headers (layout-managed, rendered below the collapse
  // trigger). Most slices instead put PanelSection.Header inside the
  // `left` / `center` / `right` content itself.
  leftHeader={<MyToolbar />}
  // Optional FOOTERS — pinned to the bottom of each panel via flex-shrink-0
  // + border-top + sidebar-token chrome.
  leftFooter={<BulkActionBar />}
  centerFooter={<SaveBar />}
  rightFooter={<InspectorActions />}
  left={
    <PanelSection>
      <PanelSection.Header>Folders</PanelSection.Header>
      <PanelSection.Items>
        <PanelMenu>
          <PanelMenuButton isActive>Inbox</PanelMenuButton>
          <PanelMenuButton>Drafts</PanelMenuButton>
        </PanelMenu>
      </PanelSection.Items>
      <PanelSection.Footer>{footerActions}</PanelSection.Footer>
    </PanelSection>
  }
  center={<MyMainArea />}
  right={<MyInspector />}
/>;
```

`FeatureThreeColumnLayout` (template-base) wraps the same primitives with `sidebarContent` / `mainContent` / `inspector` props and named footer slots (`sidebarFooter`, `mainFooter`, `inspectorFooter`, `inspectorHeader`).

## Trigger vs. Header — keep them separate

`PanelHeader` is the trigger-button atom (icon-only collapse button, panel chrome). `PanelSection.Header` is the chrome wrapper for the panel's own content. They look similar but compose differently — never put one inside the other.

- Trigger lives at the top of the column, ABOVE the slice content.
- Header lives at the top of a `PanelSection`, INSIDE the slice content.

Before 2026-05-18, passing `leftHeader` would REPLACE the trigger. After the V-wave port, the trigger is always rendered (when `showCollapseButtons` is on) and `leftHeader` renders BELOW it as an additional chrome row.

## Header / Items / Footer trio

```tsx
<PanelSection label="Customers">
  <PanelSection.Header>…toolbar…</PanelSection.Header>
  <PanelSection.Items>
    <PanelGroup>
      <PanelGroupLabel>Main</PanelGroupLabel>
      <PanelMenu>
        <PanelMenuItem><PanelMenuButton isActive>Item</PanelMenuButton></PanelMenuItem>
      </PanelMenu>
    </PanelGroup>
  </PanelSection.Items>
  <PanelSection.Footer>…actions…</PanelSection.Footer>
</PanelSection>
```

Layout invariants:
- Root: `flex flex-col h-full min-h-0` + sidebar tokens (`bg-sidebar text-sidebar-foreground`). Set `unstyled` to drop the tokens.
- Header: `flex-shrink-0 border-b border-sidebar-border bg-sidebar/95 backdrop-blur px-3 py-2`.
- Items: `flex-1 min-h-0 overflow-auto`. **Always pair `flex-1` with `min-h-0`** — without it, the scroll area overflows its parent on Firefox.
- Footer: `flex-shrink-0 border-t …` (mirrors Header).

## Theme tokens

Use these tokens **for chrome only** — Header / Footer wrappers, dividers, trigger buttons. Slice content inside `PanelSection.Items` should style itself with the regular `bg-card` / `bg-background` tokens (else the inner content disappears against the sidebar fill).

| Surface | Class |
|---|---|
| Panel root fill | `bg-sidebar text-sidebar-foreground` |
| Header wrapper | `border-b border-sidebar-border bg-sidebar/95 backdrop-blur` |
| Footer wrapper | `border-t border-sidebar-border bg-sidebar/95 backdrop-blur` |
| Collapse trigger | `border-b border-sidebar-border bg-sidebar-accent/40 hover:bg-sidebar-accent text-sidebar-foreground` |
| Focus ring | `ring-sidebar-ring` |
| Active row | `data-[active=true]:bg-sidebar-accent data-[active=true]:text-sidebar-accent-foreground` |
| Divider | `bg-sidebar-border` |
| Right-panel tab bar | `border-b border-sidebar-border bg-sidebar/95` |
| Main column header | `border-b border-border bg-background` (NOT sidebar — center column is content, not chrome) |

These are CSS variables defined in `app/globals.css` with light + dark variants per theme preset. Any preset (existing or future) automatically re-themes the layout — no slice changes needed. The site copy adds a `tone="layout"` blue override for the outermost shell so users can tell which 3-col they're inside (nested 3-col is the default `tone="feature"`).

### Don'ts

- **Don't** hardcode chrome colors in slices (`bg-violet-500/30`, `border-red-400`, etc).
- **Don't** override `bg-sidebar` to a generic `bg-card` on chrome wrappers. Theme presets re-skin sidebar surfaces independently of card surfaces.
- **Don't** put `bg-sidebar` on the center column's content area. Center column body is content surface, not chrome.
- **Don't** nest `PanelHeader` (the trigger atom) inside `PanelSection.Header` (the chrome wrapper). They're orthogonal pieces.

## Presets

| Preset | Use case | Left | Right | Notes |
|---|---|---|---|---|
| `feature` | Default feature slice | 288 | 352 | Tightened so mid-laptop screens don't squeeze the center. |
| `store` | Builder / storefront editor | 320 | 500 | Right-priority space distribution; resizable to 1200. |
| `admin` | Platform-admin / cms-lite | similar to feature | similar to feature | Used for parity with platform-admin chrome. |
| `ide` | IDE-style developer surfaces | wide | wide | Persisted widths across sessions. |

`storageKey` MUST differ per slice (`content-layout`, `cms-lite-layout`, `support-layout`, etc) — otherwise multiple slices share the same persisted widths.

## Mobile

`MobileInspectorDrawer` + `MobilePanelWrapper` open as bottom / right drawers below the `stackAt` breakpoint. The layout switches automatically — slices should NOT branch on `useIsMobile` themselves.

The drawer accepts `header` + `footer` slot props so the mobile path mirrors desktop chrome (matching `rightHeader` / `rightFooter` props on the parent).

## History

- **2026-05-18** — V-wave: ported PanelSection compound (Header / Items / Footer + PanelGroup / PanelMenu / PanelSeparator primitives) from superspace. Added `leftFooter` / `centerFooter` / `rightFooter` slot props on `ThreeColumnLayoutAdvanced`. Refactored PanelHeader chrome to sidebar tokens + data-slot attrs. Split TRIGGER from HEADER on desktop + mobile paths so the collapse button always renders ABOVE the optional `leftHeader` chrome row. Site copy preserves its `tone="layout" | "feature"` prop on top of the new chrome.
- **2026-05-17** — Initial three-column shipped with merged trigger+header (passing `leftHeader` replaced the collapse button).
