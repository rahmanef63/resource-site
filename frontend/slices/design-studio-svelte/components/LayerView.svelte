<script lang="ts">
  import type { Layer } from "@/features/design-studio/lib/model-core";
  import { parseCss } from "@/features/design-studio/lib/masks";

  let { layer, z, selected = false, interactive = false, onPointerDown }: {
    layer: Layer; z: number; selected?: boolean; interactive?: boolean;
    onPointerDown?: (event: PointerEvent, layer: Layer) => void;
  } = $props();

  let wrap = $derived([
    `z-index:${z}`,
    `opacity:${layer.opacity / 100}`,
    `transform:translate(${layer.x}%,${layer.y}%) scale(${layer.scale / 100}) rotate(${layer.rotate}deg)`,
    `cursor:${interactive ? "grab" : "crosshair"}`,
    `pointer-events:${interactive ? "auto" : "none"}`,
    ...Object.entries(parseCss(layer.css)).map(([key, value]) => `${key}:${value}`),
  ].join(";"));
  let ring = $derived(selected ? "outline:2px dashed rgba(255,255,255,.9);outline-offset:-3px" : "");
</script>

<div
  class="absolute inset-0 grid place-items-center"
  role="presentation"
  style={wrap}
  onpointerdown={(event) => onPointerDown?.(event, layer)}
>
  {#if layer.kind === "text"}
    <span style={`${ring};position:relative;padding:4px 10px;color:${layer.color};font-weight:800;font-size:34px;letter-spacing:-.02em;text-shadow:0 2px 14px rgba(0,0,0,.35);text-align:center;clip-path:${layer.clip ?? "none"}`}>{layer.text}</span>
  {:else if layer.kind === "sticker"}
    <span style={`${ring};position:relative;font-size:54px;line-height:1;filter:drop-shadow(0 3px 8px rgba(0,0,0,.4));clip-path:${layer.clip ?? "none"}`}>{layer.emoji}</span>
  {:else if layer.kind === "shape"}
    <div style={`${ring};position:relative;width:46%;height:46%;border-radius:${layer.shape === "ellipse" ? "50%" : "18px"};background:${layer.color};clip-path:${layer.clip ?? "none"}`}></div>
  {:else if layer.kind === "html"}
    <div style={`${ring};position:relative;max-width:90%;max-height:90%;overflow:auto;clip-path:${layer.clip ?? "none"}`}>
      <iframe title={layer.name} srcdoc={layer.html ?? ""} sandbox="allow-scripts" class="block border-0 bg-transparent" style="width:320px;height:180px;pointer-events:none"></iframe>
    </div>
  {:else}
    <div style={`${ring};position:relative;width:${layer.base ? "100%" : "62%"};height:${layer.base ? "100%" : "62%"};overflow:hidden;border-radius:${layer.base ? 0 : 8}px;background:${layer.tint};clip-path:${layer.clip ?? "none"}`}>
      {#if layer.src}
        <img src={layer.src} alt={layer.name} class="size-full object-cover" />
      {:else}
        <div class="absolute inset-0" style="background-image:repeating-linear-gradient(45deg,rgba(255,255,255,.08) 0 12px,transparent 12px 24px)"></div>
      {/if}
    </div>
  {/if}
</div>
