<script lang="ts">
  import WidgetContent from "./WidgetContent.svelte";
  import type { WidgetDescriptor, WidgetInstance, WidgetSize } from "../../glass-desktop/types";
  let { instance, descriptor, pill = false, editing = false, onRemove, onResize }: { instance: WidgetInstance; descriptor: WidgetDescriptor; pill?: boolean; editing?: boolean; onRemove?: (id: string) => void; onResize?: (id: string, size: WidgetSize) => void } = $props();
  const cycle: WidgetSize[] = ["SP", "S", "WP", "W", "L"];
  function resize() { const current = (instance.props?.size as WidgetSize | undefined) ?? descriptor.size; onResize?.(instance.instanceId, cycle[(cycle.indexOf(current) + 1) % cycle.length]!); }
</script>
<div class:pill class="card" role="group" aria-label={descriptor.title}>
  <WidgetContent {instance} {descriptor} />
  {#if editing}<div class="actions"><button type="button" aria-label={`Resize ${descriptor.title}`} onclick={resize}>⤢</button><button type="button" class="remove" aria-label={`Remove ${descriptor.title}`} onclick={() => onRemove?.(instance.instanceId)}>×</button></div>{/if}
</div>
<style>
  .card{position:relative;height:100%;width:100%;box-sizing:border-box;display:flex;flex-direction:column;overflow:hidden;padding:.75rem;border:1px solid var(--color-hairline);border-radius:var(--radius-widget);background:linear-gradient(var(--color-glass-hi),var(--color-glass-lo));backdrop-filter:blur(var(--blur-glass)) saturate(140%);box-shadow:var(--shadow-widget);contain:layout paint}.card:hover{border-color:var(--color-hairline-hover)}.pill{border-radius:var(--radius-pill)}.actions{position:absolute;right:.35rem;top:.35rem;display:flex;gap:.2rem}.actions button{width:1.45rem;height:1.45rem;border:1px solid var(--color-hairline);border-radius:999px;background:var(--color-glass-solid);color:var(--color-ink-mid);cursor:pointer}.actions .remove{color:var(--color-accent-coral)}
</style>
