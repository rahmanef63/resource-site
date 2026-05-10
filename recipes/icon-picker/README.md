# Recipe: icon-picker

Notion-style icon picker. Source: notion-page-clone `frontend/slices/icon-picker/`.

Copied into `template-base/frontend/slices/notion/slices/icon-picker/` — usable standalone or as a notion-inner slice.

## What it does

Single `string` field stores either emoji or `lucide:Name` plus optional `?c=hex` tint. Backwards-compat with raw-emoji icons — no schema migration.

## Stored value shape

| Form | Example | Render |
|---|---|---|
| empty | `""` | fallback (📄) |
| emoji | `🎯` | native or twemoji SVG |
| emoji + tint | `🎯?c=ff0000` | (used for ring/bg, not glyph color) |
| lucide | `lucide:Star` | lucide-react SVG, `currentColor` |
| lucide + color | `lucide:Star?c=f59e0b` | lucide SVG tinted |

Parse + build helpers in `lib/parse.ts`.

## Features

- Tabs: **Emoji** + **Icons** (lucide-react)
- Search across catalogs
- 10-swatch Notion color palette (`lib/colors.ts`)
- Twemoji ↔ native toggle (per-device localStorage)
- Random pick + clear
- Popover + inline variants
- Curated catalogs (~`emoji-catalog.ts`, `lucide-catalog.ts`) — small bundle, easy to extend

## Files (7)

```
components/
  DynamicIcon.tsx          # render value → emoji/twemoji/lucide
  IconPicker.tsx           # IconPickerInline + IconPickerPopover
lib/
  parse.ts                 # parse + build value strings
  parse.test.ts            # vitest specs
  colors.ts                # 10-color Notion palette
  emoji-catalog.ts         # grouped curated emoji
  lucide-catalog.ts        # grouped curated lucide names
  twemoji.ts               # codepoint → jsDelivr SVG URL
  style-pref.ts            # twemoji/native localStorage hook
index.ts                   # barrel
```

## Deps

`lucide-react`, `@/shared/ui/{input,button,tabs,scroll-area,popover}` (shadcn), `@/shared/lib/utils` (cn).

No npm install beyond stock shadcn + lucide-react. Twemoji SVGs hot-link from jsDelivr (`cdn.jsdelivr.net/gh/jdecked/twemoji@15.1.0/assets/svg/`) — CC-BY 4.0, no bundle cost.

## Standalone use

```bash
cp -r template-base/frontend/slices/notion/slices/icon-picker frontend/slices/icon-picker
# Imports already use @/shared/ui/* + @/shared/lib/utils — no rewrite needed.
```

```tsx
import { IconPickerPopover, DynamicIcon } from "@/frontend/slices/icon-picker";

<IconPickerPopover value={page.icon} onChange={(v) => updateIcon(v)} onClear={() => updateIcon("")} />
<DynamicIcon value={page.icon} className="text-2xl" />
```

## Storage tip

Add `icon: v.string()` to your Convex table — same field works for emoji + lucide + tint. Empty string = no icon.

## Refinements vs source

- localStorage key `nosion:iconStyle` → `notion:iconStyle` (generic kitab namespace).

## Tests

`lib/parse.test.ts` — vitest. Covers parse / build / round-trip / hex normalisation / invalid input.
