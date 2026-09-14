<script lang="ts">
  import { FILTERS, SLIDERS, type AdjustKey, type Adjustments } from "@/features/design-studio/lib/filters";
  import { ASPECTS, type Layer, type LayerKind } from "@/features/design-studio/lib/model-core";
  import { MASKS, PALETTE, SAFE_PLATFORMS, type SafePlatform } from "@/features/design-studio/lib/masks";
  import type { PanelTab } from "@/features/design-studio/lib/scene-core";

  let { tab, layers, selected, selectedLayer, adjustments, activeFilter, aspect, safe, platform,
    onTab, onSelect, onToggle, onMove, onDelete, onRename, onAdd, onUpdate, onAdjust, onFilter, onAspect, onReset, onSafe, onPlatform }: {
    tab: PanelTab; layers: Layer[]; selected: string | null; selectedLayer?: Layer;
    adjustments: Adjustments; activeFilter: string; aspect: string; safe: boolean; platform: SafePlatform;
    onTab: (tab: PanelTab) => void; onSelect: (id: string) => void; onToggle: (id: string) => void;
    onMove: (id: string, dir: -1 | 1) => void; onDelete: (id: string) => void; onRename: (id: string, name: string) => void;
    onAdd: (kind: LayerKind) => void; onUpdate: (patch: Partial<Layer>) => void; onAdjust: (key: AdjustKey, value: number) => void;
    onFilter: (name: string) => void; onAspect: (value: string) => void; onReset: () => void; onSafe: (value: boolean) => void;
    onPlatform: (platform: SafePlatform) => void;
  } = $props();
</script>

<aside class="h-full overflow-y-auto border-l bg-card p-4">
  <div class="mb-4 grid grid-cols-2 rounded-lg bg-muted p-1">
    {#each ["layers", "adjust"] as value}
      <button type="button" class={`rounded-md px-2 py-1.5 text-xs ${tab === value ? "bg-background font-medium shadow-sm" : "text-muted-foreground"}`} onclick={() => onTab(value as PanelTab)}>{value === "layers" ? "Layers" : "Adjust"}</button>
    {/each}
  </div>

  {#if tab === "layers"}
    <div class="mb-3 grid grid-cols-3 gap-1">
      <button type="button" class="rounded-md border px-2 py-1.5 text-xs hover:bg-accent" onclick={() => onAdd("text")}>+ Text</button>
      <button type="button" class="rounded-md border px-2 py-1.5 text-xs hover:bg-accent" onclick={() => onAdd("image")}>+ Image</button>
      <button type="button" class="rounded-md border px-2 py-1.5 text-xs hover:bg-accent" onclick={() => onAdd("html")}>+ HTML</button>
    </div>
    <div class="space-y-2">
      {#each layers as layer, index (layer.id)}
        <div class={`rounded-lg border p-2 ${selected === layer.id ? "border-primary bg-primary/5" : ""}`}>
          <div class="flex items-center gap-1">
            <button type="button" class="min-w-0 flex-1 truncate text-left text-xs font-medium" onclick={() => onSelect(layer.id)}>{layer.name}</button>
            <button type="button" class="rounded px-1 text-xs" onclick={() => onToggle(layer.id)}>{layer.visible ? "●" : "○"}</button>
            <button type="button" class="rounded px-1 text-xs disabled:opacity-30" disabled={index === 0} onclick={() => onMove(layer.id, -1)}>↑</button>
            <button type="button" class="rounded px-1 text-xs disabled:opacity-30" disabled={index === layers.length - 1} onclick={() => onMove(layer.id, 1)}>↓</button>
            <button type="button" class="rounded px-1 text-xs text-destructive" onclick={() => onDelete(layer.id)}>×</button>
          </div>
          {#if selected === layer.id}
            <input class="mt-2 h-8 w-full rounded-md border bg-background px-2 text-xs" value={layer.name} oninput={(event) => onRename(layer.id, event.currentTarget.value)} aria-label="Layer name" />
          {/if}
        </div>
      {/each}
    </div>

    {#if selectedLayer}
      <div class="mt-5 space-y-3 border-t pt-4">
        <h3 class="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Transform</h3>
        {#each [["x","X",-60,60],["y","Y",-60,60],["scale","Scale",10,240],["rotate","Rotate",-180,180],["opacity","Opacity",0,100]] as row}
          <label class="grid grid-cols-[55px_1fr_48px] items-center gap-2 text-xs"><span>{row[1]}</span><input type="range" min={row[2]} max={row[3]} value={selectedLayer[row[0] as keyof Layer] as number} oninput={(event) => onUpdate({ [row[0]]: Number(event.currentTarget.value) })} /><span class="text-right tabular-nums">{selectedLayer[row[0] as keyof Layer]}</span></label>
        {/each}
        {#if selectedLayer.kind === "text"}<textarea class="min-h-16 w-full rounded-md border bg-background p-2 text-xs" value={selectedLayer.text ?? ""} oninput={(event) => onUpdate({ text: event.currentTarget.value })}></textarea>{/if}
        <div class="flex flex-wrap gap-1">
          {#each PALETTE as color}<button type="button" class="size-6 rounded-full border" style={`background:${color}`} aria-label={`Use ${color}`} onclick={() => onUpdate({ color, tint: color })}></button>{/each}
        </div>
        <select class="h-8 w-full rounded-md border bg-background px-2 text-xs" value={selectedLayer.clip ?? ""} onchange={(event) => onUpdate({ clip: event.currentTarget.value })} aria-label="Layer mask">
          {#each MASKS as mask}<option value={mask.value}>{mask.label}</option>{/each}
        </select>
        <textarea class="min-h-16 w-full rounded-md border bg-background p-2 font-mono text-xs" value={selectedLayer.css ?? ""} placeholder="Custom CSS" oninput={(event) => onUpdate({ css: event.currentTarget.value })}></textarea>
      </div>
    {/if}
  {:else}
    <div class="space-y-4">
      <div class="flex flex-wrap gap-1">{#each FILTERS as filter}<button type="button" class={`rounded-full border px-2 py-1 text-xs ${activeFilter === filter.name ? "bg-primary text-primary-foreground" : ""}`} onclick={() => onFilter(filter.name)}>{filter.name}</button>{/each}</div>
      {#each SLIDERS as slider}<label class="grid grid-cols-[72px_1fr_42px] items-center gap-2 text-xs"><span>{slider.label}</span><input type="range" min={slider.min} max={slider.max} step={slider.key === "blur" ? 0.1 : 1} value={adjustments[slider.key]} oninput={(event) => onAdjust(slider.key, Number(event.currentTarget.value))} /><span class="text-right tabular-nums">{adjustments[slider.key]}{slider.unit}</span></label>{/each}
      <button type="button" class="rounded-md border px-3 py-1.5 text-xs hover:bg-accent" onclick={onReset}>Reset</button>
      <div class="border-t pt-4"><p class="mb-2 text-xs font-semibold">Aspect</p><div class="flex flex-wrap gap-1">{#each ASPECTS as item}<button type="button" class={`rounded-md border px-2 py-1 text-xs ${aspect === item.value ? "bg-accent" : ""}`} onclick={() => onAspect(item.value)}>{item.label}</button>{/each}</div></div>
      <label class="flex items-center justify-between gap-3 text-xs"><span>Safe-area guide</span><input type="checkbox" checked={safe} onchange={(event) => onSafe(event.currentTarget.checked)} /></label>
      <select class="h-8 w-full rounded-md border bg-background px-2 text-xs" value={platform} onchange={(event) => onPlatform(event.currentTarget.value as SafePlatform)} aria-label="Safe area platform">{#each SAFE_PLATFORMS as item}<option value={item}>{item}</option>{/each}</select>
    </div>
  {/if}
</aside>
