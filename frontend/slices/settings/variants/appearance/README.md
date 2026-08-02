# shell-settings — settings-app UI primitives

Portable, brand-free building blocks for a settings app:

- `SettingsSection` — titled group: uppercase muted label + icon, rule, content.
- `SettingsRow` — label left / control right; stacks on narrow widths.
- `Segmented` — single-select segmented control (shadcn ToggleGroup).
- `AccentSwatches` — color-dot picker; the color values ARE the data.
- `AppearancePanel` — the composed Appearance / Shell / Display panel.

## Mount

```tsx
import { AppearancePanel, SettingsSection, SettingsRow } from "@/features/shell-settings";
import type { AppearanceAdapter } from "@/features/shell-settings";

// The consumer builds the adapter from its OWN appearance store. Every group
// is optional — only what you provide renders.
const adapter: AppearanceAdapter = {
  style: { value: style, options: STYLES, onChange: setStyle },
  theme: { value: theme, options: MODES, onChange: setTheme },
  accent: { value: accent, options: ACCENT_COLORS, onChange: setAccent },
  reduceTransparency: { value: reduce, onChange: setReduce },
};

<AppearancePanel appearance={adapter} />;

// Or compose your own pages from the primitives:
<SettingsSection icon={<Wifi />} title="Network">
  <SettingsRow label="Proxy">{/* any control */}</SettingsRow>
</SettingsSection>;
```

No host seam needed — the slice is pure presentation; the injected
`AppearanceAdapter` (see `lib/types.ts`) is the whole contract.
