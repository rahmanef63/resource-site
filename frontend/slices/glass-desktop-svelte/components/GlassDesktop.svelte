<script lang="ts">
  import { onMount, untrack } from "svelte";
  import "../../glass-desktop/config/theme.css";
  import { STORAGE } from "../../glass-desktop/config/constants";
  import { addWidget, moveWidget, normalizeLayout, removeWidget, resetLayout, resizeWidget } from "../../glass-desktop/lib/layout-core";
  import { createLocalStorageStore } from "../../glass-desktop/utils/storage";
  import type { LayoutStore, WidgetInstance, WidgetSize } from "../../glass-desktop/types";
  import MenuBar from "./MenuBar.svelte"; import SpacePager from "./SpacePager.svelte"; import WidgetPicker from "./WidgetPicker.svelte"; import WidgetGallery from "./WidgetGallery.svelte";
  interface Props { initialSpace?:0|1; store?:LayoutStore; brand?:{name:string;glyph?:string}; gallery?:boolean }
  let { initialSpace=0, store=undefined, brand={name:"Lucent"}, gallery=false }:Props=$props();
  const activeStore=untrack(()=>store??createLocalStorageStore());
  let instances=$state<WidgetInstance[]>(resetLayout()); let ready=$state(false); let editing=$state(false); let picker=$state(false); let space=$state<0|1>(untrack(()=>initialSpace)); let seq=0;
  function commit(next:WidgetInstance[]){instances=next;if(ready)activeStore.save({version:1,instances:next})}
  function changeSpace(next:0|1){space=next;if(typeof window!=="undefined")window.localStorage.setItem(STORAGE.space,String(next))}
  function add(id:string,target:0|1){commit(addWidget(instances,id,target,`${id}:s${(seq++).toString(36)}${Date.now().toString(36)}`))}
  function remove(id:string){commit(removeWidget(instances,id))} function resize(id:string,size:WidgetSize){commit(resizeWidget(instances,id,size))} function move(id:string,col:number,row:number){commit(moveWidget(instances,id,col,row))}
  function reset(){activeStore.reset();commit(resetLayout());changeSpace(initialSpace)}
  onMount(()=>{const saved=activeStore.load();if(saved?.instances.length)instances=normalizeLayout(saved.instances);const raw=window.localStorage.getItem(STORAGE.space);if(raw==="0"||raw==="1")space=Number(raw) as 0|1;ready=true;activeStore.save({version:1,instances})});
</script>
{#if gallery}<WidgetGallery/>{:else}<div class="desktop" data-slice="glass-desktop"><div class="wallpaper"></div><MenuBar {brand} {editing} onEdit={()=>editing=!editing} onAdd={()=>picker=true} onReset={reset}/><main><SpacePager {space} {instances} {editing} onSpaceChange={changeSpace} onMove={move} onRemove={remove} onResize={resize}/></main><WidgetPicker open={picker} {space} onClose={()=>picker=false} onAdd={add}/></div>{/if}
<style>
.desktop{position:relative;height:100dvh;min-height:34rem;width:100%;overflow:hidden;color:var(--color-ink-hi);font-family:var(--font-ui);background:var(--color-canvas)}.wallpaper{position:absolute;inset:0;z-index:0;background:radial-gradient(circle at 18% 18%,oklch(45% .10 260/.55),transparent 34%),radial-gradient(circle at 80% 12%,oklch(40% .09 305/.4),transparent 28%),linear-gradient(145deg,#151a28,#090b12 60%,#111722)}.desktop>:not(.wallpaper){position:relative}main{height:calc(100% - 36px);z-index:10}
</style>
