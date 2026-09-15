<script lang="ts">
  import { SIZE_CELLS } from "../../glass-desktop/config/constants";
  import { widgetDescriptors } from "../../glass-desktop/lib/widget-catalog";
  import type { WidgetInstance } from "../../glass-desktop/types";
  import WidgetCard from "./WidgetCard.svelte";
  function instance(id:string):WidgetInstance{return {instanceId:`gallery:${id}`,widgetId:id,space:0,col:0,row:0}}
</script>
<div class="gallery" data-slice="glass-desktop-gallery">{#each widgetDescriptors as descriptor (descriptor.id)}{@const cells=SIZE_CELLS[descriptor.size]}<article style:grid-column={`span ${cells.c}`} class:large={descriptor.size==="L"}><WidgetCard instance={instance(descriptor.id)} {descriptor} pill={cells.r===1}/><span>{descriptor.family} · {descriptor.size}</span></article>{/each}</div>
<style>
.gallery{min-height:100%;display:grid;grid-template-columns:repeat(6,minmax(9rem,1fr));grid-auto-rows:9.5rem;gap:.75rem;padding:1rem;background:radial-gradient(circle at 20% 0%,#25355b,#11131b 52%,#08090e);color:var(--color-ink-hi)}article{min-width:0;display:grid;grid-template-rows:minmax(0,1fr) auto;gap:.3rem}article.large{grid-row:span 2}article>span{font-size:.6rem;text-transform:uppercase;letter-spacing:.08em;color:var(--color-ink-low);padding-left:.3rem}@media(max-width:900px){.gallery{grid-template-columns:repeat(4,minmax(8rem,1fr))}}@media(max-width:600px){.gallery{grid-template-columns:repeat(2,minmax(8rem,1fr))}}
</style>
