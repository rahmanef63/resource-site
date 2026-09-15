<script lang="ts">
  import AppHost from "./AppHost.svelte";
  import { closeWindow, focusWindow, minimizeWindow, moveWindow, resizeWindow, snapWindow, toggleMaximize } from "../../appshell/lib/store";
  import { snapZoneAt } from "../../appshell/lib/store-geometry";
  import type { WindowState } from "../../appshell/lib/types-core";
  import type { AppDescriptor } from "../types";
  let { win, app, shell="macos" }: { win:WindowState; app:AppDescriptor; shell?:"macos"|"windows" }=$props();
  function drag(e:PointerEvent){if(win.maximized)return;focusWindow(win.id);const sx=e.clientX,sy=e.clientY,ox=win.x,oy=win.y;const move=(v:PointerEvent)=>moveWindow(win.id,ox+v.clientX-sx,oy+v.clientY-sy);const up=(v:PointerEvent)=>{window.removeEventListener("pointermove",move);window.removeEventListener("pointerup",up);const z=snapZoneAt(v.clientX,v.clientY);if(z)snapWindow(win.id,z)};window.addEventListener("pointermove",move);window.addEventListener("pointerup",up)}
  function resize(e:PointerEvent){e.stopPropagation();const sx=e.clientX,sy=e.clientY,ow=win.w,oh=win.h;const move=(v:PointerEvent)=>resizeWindow(win.id,Math.max(320,ow+v.clientX-sx),Math.max(220,oh+v.clientY-sy));const up=()=>{window.removeEventListener("pointermove",move);window.removeEventListener("pointerup",up)};window.addEventListener("pointermove",move);window.addEventListener("pointerup",up)}
</script>
<section class={`window ${shell}`} style={`left:${win.x}px;top:${win.y}px;width:${win.w}px;height:${win.h}px;z-index:${win.z}`} onpointerdown={()=>focusWindow(win.id)} aria-label={`${win.title} window`}>
  <header role="toolbar" tabindex="0" aria-label={`${win.title} controls`} onpointerdown={drag} ondblclick={()=>toggleMaximize(win.id)}>
    {#if shell==="macos"}<div class="lights"><button class="red" aria-label="Close" onclick={()=>closeWindow(win.id)}></button><button class="yellow" aria-label="Minimize" onclick={()=>minimizeWindow(win.id)}></button><button class="green" aria-label="Maximize" onclick={()=>toggleMaximize(win.id)}></button></div>{/if}
    <strong>{win.title}</strong>
    {#if shell==="windows"}<div class="caption"><button aria-label="Minimize" onclick={()=>minimizeWindow(win.id)}>—</button><button aria-label="Maximize" onclick={()=>toggleMaximize(win.id)}>□</button><button aria-label="Close" onclick={()=>closeWindow(win.id)}>×</button></div>{/if}
  </header>
  <div class="body"><AppHost {app} payload={win.payload}/></div>
  {#if !win.maximized}<button class="resize" aria-label="Resize window" onpointerdown={resize}></button>{/if}
</section>
<style>.window{position:absolute;display:flex;flex-direction:column;overflow:hidden;background:color-mix(in srgb,var(--background,#fff) 94%,transparent);box-shadow:0 24px 70px #0005;border:1px solid #ffffff55;backdrop-filter:blur(20px);color:var(--foreground,#111)}.window.macos{border-radius:12px}.window.windows{border-radius:9px}.window>header{height:38px;display:grid;grid-template-columns:1fr auto 1fr;align-items:center;user-select:none;border-bottom:1px solid #8882;background:#ffffff18}.window.windows>header{grid-template-columns:1fr auto}.window header strong{grid-column:2;font-size:.76rem;font-weight:600;pointer-events:none}.windows header strong{grid-column:1;padding-left:12px}.lights{display:flex;gap:7px;padding-left:12px}.lights button{width:12px;height:12px;border-radius:50%;border:0}.red{background:#ff5f57}.yellow{background:#febc2e}.green{background:#28c840}.caption{display:flex;height:100%}.caption button{width:46px;border:0;background:transparent}.caption button:last-child:hover{background:#c42b1c;color:white}.body{min-height:0;flex:1;overflow:auto}.resize{position:absolute;right:0;bottom:0;width:16px;height:16px;cursor:nwse-resize;border:0;background:linear-gradient(135deg,transparent 55%,#888 56%,#888 62%,transparent 63%)}</style>
