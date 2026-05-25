# icon-picker

> Notion-style icon picker. Emoji + lucide (outline) + phosphor (fill) icons with search, color tinting, recents, and smart positioning.

## Install

```bash
npx rr add icon-picker
```

Files land at `slices/icon-picker/`. Additional npm dep: `@phosphor-icons/react@^2.1.10`.

## Usage

### Popover (compact trigger, smart positioning)

```tsx
import { IconPickerPopover, parseIconValue, DynamicIcon } from "@/features/icon-picker";

function ProjectSettings() {
  const [icon, setIcon] = useState("📁");

  return (
    <IconPickerPopover value={icon} onChange={setIcon}>
      <button className="size-8">
        <DynamicIcon value={icon} className="size-5" />
      </button>
    </IconPickerPopover>
  );
}
```

The popover auto-flips between top and bottom based on Radix collision
detection, caps height to `--radix-popover-content-available-height`, and
falls back to a centered `<Dialog>` when neither side fits (≥340px usable
vertical) or the viewport is narrower than 360px. Color picks keep the
picker open; icon picks auto-close.

### Inline (full sheet/dialog use)

```tsx
import { IconPickerInline } from "@/features/icon-picker";

<Sheet>
  <SheetContent>
    <IconPickerInline value={icon} onChange={setIcon} />
  </SheetContent>
</Sheet>
```

The inline picker is a flex column with `min-h-0` so it resizes to fill
whatever container it lives in — popover, dialog, sheet, or panel.

## Tab layout

- **Emoji** tab — sub-variant pills switch the global render preference
  Native (OS font) vs Twemoji (CDN SVG, consistent across devices).
- **Icon** tab — sub-variant pills switch between
  Lucide (outline / stroke) and Phosphor fill (solid, color-aware).
  The Color row applies to BOTH icon variants.

## Value format

One string holds emoji OR icon-prefix OR colored variant:

- `"📁"` — raw emoji (backwards-compat)
- `"lucide:Folder"` — lucide outline icon
- `"lucide:Folder?c=ff0066"` — lucide + hex color tint
- `"phosphor:Folder"` — phosphor fill icon
- `"phosphor:Folder?c=ff0066"` — phosphor + hex color tint

Parse via `parseIconValue()`. Build via `lucideValue()` / `phosphorValue()` / `withColor()`.

## DB storage

Add `icon: v.string()` to your Convex table. No migration needed —
backwards-compat with existing raw-emoji + lucide-prefixed fields.

## Style preference key

Twemoji vs native preference is persisted under the localStorage key
`icon-picker:style`. The module migrates the legacy key
`nosion:iconStyle` on first read so existing users keep their pick after
the upgrade.

## Source

Lifted 2026-05-25 from `open-silong/frontend/shared/components/icon-picker/`. Version 0.3.0.
