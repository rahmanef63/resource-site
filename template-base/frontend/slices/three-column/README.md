# Three-Column Layout

Facade slice for `frontend/shared/ui/layout/container/three-column/`.

Use cases:

- CMS-lite / admin panels — folders ↔ list ↔ inspector
- IDE-style surfaces — files ↔ editor ↔ outline
- Content composers — nav ↔ canvas ↔ properties
- Documentation sites — TOC ↔ doc body ↔ on-this-page

## Install

```bash
npx rr add three-column
```

## Quick start

```tsx
import {
  ThreeColumnLayoutAdvanced,
  PanelSection,
  PanelMenu,
  PanelMenuButton,
} from "@/features/three-column";

<ThreeColumnLayoutAdvanced
  preset="feature"
  storageKey="my-app-layout"
  persistState
  leftFooter={<NewFolderButton />}
  centerFooter={<SaveDraftButton />}
  rightFooter={<ApplyChangesButton />}
  left={
    <PanelSection label="Folders">
      <PanelSection.Header>Workspace</PanelSection.Header>
      <PanelSection.Items>
        <PanelMenu>
          <PanelMenuButton isActive>Inbox</PanelMenuButton>
          <PanelMenuButton>Drafts</PanelMenuButton>
        </PanelMenu>
      </PanelSection.Items>
      <PanelSection.Footer>3 folders</PanelSection.Footer>
    </PanelSection>
  }
  center={
    <PanelSection unstyled>
      {/* unstyled drops sidebar tokens — center column is content surface */}
      <PanelSection.Items className="p-6">…editor…</PanelSection.Items>
    </PanelSection>
  }
  right={
    <PanelSection label="Inspector">
      <PanelSection.Header>Inspector</PanelSection.Header>
      <PanelSection.Items>…properties…</PanelSection.Items>
      <PanelSection.Footer>4 properties</PanelSection.Footer>
    </PanelSection>
  }
/>
```

## Live preview

`/preview/three-column-trio` on the rr site shows the full trio
(left+center+right with footers) wired with V-wave PanelSection + footer
slot props.

## Architecture

Full spec — including:

- trigger ≠ header rule (V-wave separation)
- footer slot props (`leftFooter`, `centerFooter`, `rightFooter`)
- PanelSection invariants (`flex-1` + `min-h-0` Firefox pair)
- theme tokens (sidebar root, header chrome, focus ring, active row)
- presets (`feature` / `store` / `admin` / `ide`)
- mobile drawer with header+footer slots

— see `docs/architecture/three-column-layout.md` on the rr site repo.

## Presets

| Preset | Use case | Left | Right |
|---|---|---|---|
| `feature` | Default feature slice | 288 | 352 |
| `store` | Builder / storefront editor | 320 | 500 |
| `admin` | Platform-admin / cms-lite | similar to feature | similar to feature |
| `ide` | IDE-style developer surfaces | wide | wide |

`storageKey` MUST differ per slice (`content-layout`, `cms-lite-layout`,
etc) — otherwise multiple slices share the same persisted widths.
