<script lang="ts">
  import DynamicIcon from "./DynamicIcon.svelte";
  import type { Style } from "@/features/icon-picker/lib/style-core";

  let {
    value,
    title = value,
    active = false,
    index = undefined,
    iconStyle,
    onpick,
  } = $props<{
    value: string;
    title?: string;
    active?: boolean;
    index?: number;
    iconStyle: Style;
    onpick: () => void;
  }>();
</script>

<button
  type="button"
  class={`flex h-8 w-8 items-center justify-center rounded text-lg leading-none transition ${active ? "bg-brand/15 ring-1 ring-brand" : "hover:bg-accent"}`}
  data-icon-cell-index={index}
  onclick={onpick}
  aria-label={`Pick ${title}`}
  {title}
>
  <DynamicIcon {value} {iconStyle} size={18} />
</button>
