# Icon Picker — Svelte 5 / SvelteKit

Native Svelte distribution with the same stored-value contract as React:
raw emoji, `lucide:Name`, `phosphor:Name`, plus optional `?c=<hex>` tint.

```svelte
<script lang="ts">
  import { IconPicker, DynamicIcon } from "@/features/icon-picker-svelte";
  let value = $state("lucide:Star");
</script>

<IconPicker {value} onchange={(next) => value = next} />
<DynamicIcon {value} size={32} />
```

- Emoji: native or Twemoji CDN rendering, persisted device preference.
- Icons: `@lucide/svelte` outline + `phosphor-svelte` fill with the same curated catalogs.
- Shared localStorage recents, color palette, search, random/clear, keyboard grid navigation.
- Popover auto-flips vertically and promotes to a centered dialog when the viewport cannot fit the picker.
- No React, Next, shadcn, `lucide-react`, `@phosphor-icons/react`, or agent runtime is shipped in the Svelte path.
