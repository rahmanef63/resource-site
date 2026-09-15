<script lang="ts">
  import {
    Cloud,
    Code,
    File,
    Film,
    Folder,
    Gauge,
    Globe,
    Grid3x3,
    Image,
    Music,
    Settings,
    Sparkles,
    Terminal,
  } from "@lucide/svelte";
  import type { Component } from "svelte";

  const icons: Record<string, Component<Record<string, unknown>>> = {
    folder: Folder,
    globe: Globe,
    film: Film,
    image: Image,
    gauge: Gauge,
    settings: Settings,
    code: Code,
    cloud: Cloud,
    music: Music,
    grid: Grid3x3,
    file: File,
    sparkles: Sparkles,
    terminal: Terminal,
  } as unknown as Record<string, Component<Record<string, unknown>>>;

  let { glyph, color, size = 40 } = $props<{ glyph: string; color: string; size?: number }>();
  let Icon = $derived(icons[glyph] ?? Sparkles);
</script>

<span
  class={`grid flex-none place-items-center rounded-xl text-white ${color}`}
  style={`width:${size}px;height:${size}px`}
>
  <Icon size={Math.round(size * 0.46)} />
</span>
