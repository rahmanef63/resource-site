<script lang="ts">
  import { onMount, untrack } from "svelte";
  import { ICON_COLORS } from "@/features/icon-picker/lib/colors";
  import { EMOJI_GROUPS } from "@/features/icon-picker/lib/emoji-catalog";
  import { LUCIDE_GROUPS } from "@/features/icon-picker/lib/lucide-catalog";
  import { PHOSPHOR_GROUPS } from "@/features/icon-picker/lib/phosphor-catalog";
  import { parseIconValue } from "@/features/icon-picker/lib/parse";
  import {
    buildPickerHandlers,
    getSearchPlaceholder,
    handleGridArrowKey,
    type IconVariant,
    type TopTab,
  } from "@/features/icon-picker/lib/picker-handlers";
  import {
    filterEmoji,
    filterLucide,
    filterPhosphor,
  } from "@/features/icon-picker/lib/search-haystacks";
  import {
    getRecentIconsSnapshot,
    subscribeRecentIcons,
  } from "@/features/icon-picker/lib/recents-core";
  import {
    DEFAULT_ICON_STYLE,
    readIconStyle,
    setIconStyle,
    subscribeIconStyle,
    type Style,
  } from "@/features/icon-picker/lib/style-core";
  import IconCell from "./IconCell.svelte";

  let {
    value,
    onchange,
    onclear = undefined,
    onselect = undefined,
    className = "",
  } = $props<{
    value: string | null | undefined;
    onchange: (next: string) => void;
    onclear?: () => void;
    onselect?: () => void;
    className?: string;
  }>();

  const initial = untrack(() => parseIconValue(value));
  let tab = $state<TopTab>(initial.kind === "lucide" || initial.kind === "phosphor" ? "icon" : "emoji");
  let iconVariant = $state<IconVariant>(initial.kind === "phosphor" ? "phosphor" : "lucide");
  let query = $state("");
  let iconStyle = $state<Style>(DEFAULT_ICON_STYLE);
  let recents = $state<readonly string[]>([]);
  let host = $state<HTMLDivElement>();

  let parsed = $derived(parseIconValue(value));
  let normalizedQuery = $derived(query.trim().toLowerCase());
  let emojiResults = $derived(filterEmoji(normalizedQuery));
  let lucideResults = $derived(filterLucide(normalizedQuery));
  let phosphorResults = $derived(filterPhosphor(normalizedQuery));
  let colorEnabled = $derived(tab === "icon");
  let currentColor = $derived(
    colorEnabled && (parsed.kind === "lucide" || parsed.kind === "phosphor")
      ? parsed.color
      : undefined,
  );
  let handlers = $derived(buildPickerHandlers({
    parsed,
    tab,
    iconVariant,
    currentColor,
    colorEnabled,
    onChange: onchange,
    onClear: onclear,
    onSelect: onselect,
    currentValue: value ?? "",
  }));

  const valueFor = (kind: IconVariant, name: string) =>
    `${kind}:${name}${currentColor ? `?c=${currentColor.replace(/^#/, "")}` : ""}`;

  onMount(() => {
    iconStyle = readIconStyle();
    recents = getRecentIconsSnapshot();
    const stopStyle = subscribeIconStyle(() => { iconStyle = readIconStyle(); });
    const stopRecents = subscribeRecentIcons(() => { recents = getRecentIconsSnapshot(); });
    const onKey = (event: KeyboardEvent) => handleGridArrowKey(event, host ?? null);
    host?.addEventListener("keydown", onKey);
    return () => {
      stopStyle();
      stopRecents();
      host?.removeEventListener("keydown", onKey);
    };
  });
</script>

<div
  class={`flex h-full min-h-0 w-full flex-col gap-3 ${className}`}
  bind:this={host}
>
  <div class="flex items-center gap-2">
    <div class="flex h-8 rounded-md bg-muted p-0.5" aria-label="Icon type">
      <button type="button" class={`rounded px-3 text-xs ${tab === "emoji" ? "bg-background shadow-sm" : "text-muted-foreground"}`} onclick={() => { tab = "emoji"; }}>Emoji</button>
      <button type="button" class={`rounded px-3 text-xs ${tab === "icon" ? "bg-background shadow-sm" : "text-muted-foreground"}`} onclick={() => { tab = "icon"; }}>Icon</button>
    </div>
    <div class="ml-auto flex gap-1">
      <button type="button" class="h-7 rounded px-2 text-xs hover:bg-accent" onclick={handlers.pickRandom}>Random</button>
      {#if onclear}
        <button type="button" class="h-7 rounded px-2 text-xs text-muted-foreground hover:bg-accent" onclick={handlers.handleClear}>Clear</button>
      {/if}
    </div>
  </div>

  <div class="flex h-7 items-center gap-0.5 rounded-md border bg-muted/30 p-0.5">
    {#if tab === "emoji"}
      {#each ["native", "twemoji"] as option (option)}
        <button type="button" class={`h-6 flex-1 rounded px-2 text-[11px] ${iconStyle === option ? "bg-background shadow-sm" : "text-muted-foreground"}`} onclick={() => { iconStyle = option as Style; setIconStyle(iconStyle); }}>{option === "native" ? "Native" : "Twemoji"}</button>
      {/each}
    {:else}
      {#each ["lucide", "phosphor"] as option (option)}
        <button type="button" class={`h-6 flex-1 rounded px-2 text-[11px] ${iconVariant === option ? "bg-background shadow-sm" : "text-muted-foreground"}`} onclick={() => { iconVariant = option as IconVariant; }}>{option === "lucide" ? "Lucide" : "Phosphor fill"}</button>
      {/each}
    {/if}
  </div>

  {#if colorEnabled}
    <div class="flex items-center gap-1.5">
      <span class="mr-1 text-[10px] uppercase tracking-wider text-muted-foreground">Color</span>
      {#each ICON_COLORS as color (color.id)}
        {@const selected = (!color.hex && !currentColor) || (!!color.hex && currentColor?.toLowerCase() === color.hex.toLowerCase())}
        <button
          type="button"
          class={`h-5 w-5 rounded-full border p-0 ${selected ? "ring-2 ring-foreground/60 ring-offset-1 ring-offset-background" : "hover:scale-110"}`}
          style={`background-color:${color.hex || "transparent"};border-color:${color.hex || "var(--border)"}`}
          title={color.label}
          aria-label={`Color: ${color.label}`}
          onclick={() => handlers.pickColor(color.hex)}
        >{color.hex ? "" : "∅"}</button>
      {/each}
    </div>
  {/if}

  <input
    class="h-8 w-full rounded-md border bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-ring"
    placeholder={getSearchPlaceholder(tab, iconVariant, iconStyle)}
    bind:value={query}
    aria-label="Search icons"
  />

  <div class="min-h-0 flex-1 space-y-3 overflow-y-auto pr-2">
    {#if !normalizedQuery && recents.length}
      <section>
        <h4 class="mb-1 px-1 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Recent</h4>
        <div class="grid grid-cols-8 gap-1">
          {#each recents as recent, i (`${recent}-${i}`)}
            <IconCell value={recent} title={recent} active={recent === (value ?? "")} {iconStyle} onpick={() => handlers.pickRecent(recent)} />
          {/each}
        </div>
      </section>
    {/if}

    {#if tab === "emoji"}
      {#if emojiResults}
        <div class="grid grid-cols-8 gap-1">
          {#each emojiResults as emoji, i (`${emoji}-${i}`)}
            <IconCell value={emoji} title={emoji} active={parsed.kind === "emoji" && parsed.emoji === emoji} index={i} {iconStyle} onpick={() => handlers.pickEmoji(emoji)} />
          {:else}<p class="col-span-full py-6 text-center text-xs text-muted-foreground">No matches.</p>{/each}
        </div>
      {:else}
        {#each EMOJI_GROUPS as group (group.id)}
          <section><h4 class="mb-1 px-1 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">{group.label}</h4><div class="grid grid-cols-8 gap-1">{#each group.items as emoji, i (`${group.id}-${emoji}-${i}`)}<IconCell value={emoji} title={emoji} active={parsed.kind === "emoji" && parsed.emoji === emoji} {iconStyle} onpick={() => handlers.pickEmoji(emoji)} />{/each}</div></section>
        {/each}
      {/if}
    {:else if iconVariant === "lucide"}
      {@const groups = lucideResults ? [{ id: "search", label: "Results", items: lucideResults }] : LUCIDE_GROUPS}
      {#each groups as group (group.id)}
        <section><h4 class="mb-1 px-1 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">{group.label}</h4><div class="grid grid-cols-8 gap-1">{#each group.items as name, i (`${group.id}-${name}`)}<IconCell value={valueFor("lucide", name)} title={name} active={parsed.kind === "lucide" && parsed.name === name} index={group.id === "search" ? i : undefined} {iconStyle} onpick={() => handlers.pickLucide(name)} />{/each}</div></section>
      {/each}
    {:else}
      {@const groups = phosphorResults ? [{ id: "search", label: "Results", items: phosphorResults }] : PHOSPHOR_GROUPS}
      {#each groups as group (group.id)}
        <section><h4 class="mb-1 px-1 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">{group.label}</h4><div class="grid grid-cols-8 gap-1">{#each group.items as name, i (`${group.id}-${name}`)}<IconCell value={valueFor("phosphor", name)} title={name} active={parsed.kind === "phosphor" && parsed.name === name} index={group.id === "search" ? i : undefined} {iconStyle} onpick={() => handlers.pickPhosphor(name)} />{/each}</div></section>
      {/each}
    {/if}
  </div>
</div>
