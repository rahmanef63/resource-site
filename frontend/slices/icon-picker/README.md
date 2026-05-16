# icon-picker

> Notion-style icon picker. Emoji + lucide icons with search, color tinting, recents tracking.

## Install

```bash
npx rr add icon-picker
```

Files land at `slices/icon-picker/`.

## Usage

### Popover (compact trigger)

```tsx
import { IconPicker, parseIconValue, DynamicIcon } from "@/features/icon-picker";

function ProjectSettings() {
  const [icon, setIcon] = useState("📁");
  const parsed = parseIconValue(icon);

  return (
    <IconPicker value={icon} onChange={setIcon}>
      <button>
        <DynamicIcon icon={parsed} className="size-5" />
      </button>
    </IconPicker>
  );
}
```

### Inline (full sheet/dialog use)

```tsx
import { IconPickerInline } from "@/features/icon-picker";

<Sheet>
  <SheetContent>
    <IconPickerInline value={icon} onChange={setIcon} />
  </SheetContent>
</Sheet>
```

## Value format

One string holds emoji OR lucide name OR colored variant:

- `"📁"` — raw emoji (backwards-compat)
- `"lucide:Folder"` — lucide icon
- `"lucide:Folder?c=ff0066"` — lucide icon with hex color tint

Parse via `parseIconValue()`. Build via `lucideValue()` + `withColor()`.

## DB storage

Add `icon: v.string()` to your Convex table. No migration needed — backwards-compat with existing raw-emoji fields.

## Source

Lifted 2026-05-16 from `notion-page-clone/frontend/shared/components/icon-picker/`. Version 0.2.0.
