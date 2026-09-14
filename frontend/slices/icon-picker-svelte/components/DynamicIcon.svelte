<script lang="ts">
  import { onMount } from "svelte";
  import { parseIconValue } from "@/features/icon-picker/lib/parse";
  import { renderSizeFor } from "@/features/icon-picker/lib/icon-render-config";
  import { twemojiUrl } from "@/features/icon-picker/lib/twemoji";
  import {
    DEFAULT_ICON_STYLE,
    readIconStyle,
    subscribeIconStyle,
    type Style,
  } from "@/features/icon-picker/lib/style-core";
  import { FALLBACK_LUCIDE_SVELTE_ICON, resolveLucideSvelteIcon } from "../lib/lucide-icons";
  import { FALLBACK_PHOSPHOR_SVELTE_ICON, resolvePhosphorSvelteIcon } from "../lib/phosphor-icons";

  let {
    value,
    fallback = "📄",
    title = undefined,
    size = undefined,
    className = "",
    forceNative = false,
    iconStyle = undefined,
  } = $props<{
    value: string | null | undefined;
    fallback?: string;
    title?: string;
    size?: number;
    className?: string;
    forceNative?: boolean;
    iconStyle?: Style;
  }>();

  let storedStyle = $state<Style>(DEFAULT_ICON_STYLE);
  let failedTwemoji = $state(false);
  let parsed = $derived.by(() => {
    const primary = parseIconValue(value);
    if (primary.kind === "emoji" && !primary.emoji) return parseIconValue(fallback);
    return primary.kind === "empty" ? parseIconValue(fallback) : primary;
  });
  let effectiveStyle = $derived(forceNative ? "native" : (iconStyle ?? storedStyle));
  let kind = $derived(parsed.kind === "empty" ? "emoji" : parsed.kind);
  let renderSize = $derived(size === undefined ? undefined : renderSizeFor(kind === "emoji" && effectiveStyle === "twemoji" ? "twemoji" : kind, size));
  let boxStyle = $derived([
    size === undefined ? "" : `width:${size}px;height:${size}px`,
    parsed.kind === "lucide" || parsed.kind === "phosphor" ? `color:${parsed.color ?? "currentColor"}` : "",
  ].filter(Boolean).join(";"));

  onMount(() => {
    storedStyle = readIconStyle();
    return subscribeIconStyle(() => { storedStyle = readIconStyle(); });
  });

  $effect(() => {
    value;
    failedTwemoji = false;
  });
</script>

<span
  class={`inline-flex items-center justify-center overflow-visible leading-none ${className}`}
  style={boxStyle || undefined}
  {title}
>
  {#if parsed.kind === "lucide"}
    {@const Icon = resolveLucideSvelteIcon(parsed.name) ?? FALLBACK_LUCIDE_SVELTE_ICON}
    <Icon size={renderSize ?? "1em"} color={parsed.color ?? "currentColor"} />
  {:else if parsed.kind === "phosphor"}
    {@const Icon = resolvePhosphorSvelteIcon(parsed.name) ?? FALLBACK_PHOSPHOR_SVELTE_ICON}
    <Icon size={renderSize ?? "1em"} color={parsed.color ?? "currentColor"} weight="fill" />
  {:else}
    {@const glyph = parsed.kind === "emoji" ? parsed.emoji : ""}
    {@const url = effectiveStyle === "twemoji" ? twemojiUrl(glyph) : null}
    {#if url && !failedTwemoji}
      <img
        src={url}
        alt={glyph}
        title={title ?? glyph}
        loading="lazy"
        decoding="async"
        draggable="false"
        width={renderSize}
        height={renderSize}
        style={renderSize === undefined ? undefined : `width:${renderSize}px;height:${renderSize}px`}
        class={renderSize === undefined ? "h-[1em] w-[1em] select-none object-contain" : "select-none object-contain"}
        onerror={() => { failedTwemoji = true; }}
      />
    {:else}
      <span style={renderSize === undefined ? undefined : `font-size:${renderSize}px;line-height:1`}>{glyph}</span>
    {/if}
  {/if}
</span>
