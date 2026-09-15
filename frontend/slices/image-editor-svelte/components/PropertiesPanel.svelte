<script lang="ts">
  import type { BrowserEditorCore, EditorSnapshot } from "@/features/image-editor/lib/editor-core";
  import { BLEND_MODES } from "@/features/image-editor/lib/types";
  import { FONT_FAMILIES } from "@/features/image-editor/lib/model";
  let { editor, snapshot } = $props<{ editor: BrowserEditorCore; snapshot: EditorSnapshot }>();
  let layer = $derived(snapshot.doc.layers.find((item) => item.id === snapshot.selectedId) ?? null);
  const num=(e:Event)=>Number((e.currentTarget as HTMLInputElement).value);
  const field="w-full rounded border bg-background px-2 py-1 text-xs";
</script>
<section class="min-h-0 flex-1 overflow-y-auto p-3 text-xs">
  {#if !layer}
    <div class="space-y-3">
      <strong class="text-sm">Document</strong>
      <div class="grid grid-cols-2 gap-2"><label class="space-y-1"><span>Width</span><input class={field} type="number" min="1" value={snapshot.doc.width} onchange={(e)=>editor.setDocSize(num(e),snapshot.doc.height)}/></label><label class="space-y-1"><span>Height</span><input class={field} type="number" min="1" value={snapshot.doc.height} onchange={(e)=>editor.setDocSize(snapshot.doc.width,num(e))}/></label></div>
      <label class="block space-y-1"><span>Background</span><input class="h-8 w-full rounded border" type="color" value={snapshot.doc.bg === "transparent" ? "#ffffff" : snapshot.doc.bg} oninput={(e)=>editor.setBackground(e.currentTarget.value)}/></label>
      <p class="text-muted-foreground">Select a layer to edit transforms, adjustments and styles.</p>
    </div>
  {:else}
    <div class="space-y-4">
      <div class="flex items-center gap-2"><strong class="min-w-0 flex-1 truncate text-sm">{layer.name}</strong><span class="rounded bg-muted px-1.5 py-0.5 text-[10px]">{layer.kind}</span></div>
      <label class="block space-y-1"><span>Name</span><input class={field} value={layer.name} onchange={(e)=>editor.update(layer!.id,{name:e.currentTarget.value})}/></label>
      <div class="grid grid-cols-2 gap-2">
        <label class="space-y-1"><span>Opacity</span><input class="w-full" type="range" min="0" max="1" step="0.01" value={layer.opacity} oninput={(e)=>editor.update(layer!.id,{opacity:num(e)})}/></label>
        <label class="space-y-1"><span>Blend</span><select class={field} value={layer.style.blend} onchange={(e)=>editor.patchStyle(layer!.id,{blend:e.currentTarget.value as typeof layer.style.blend})}>{#each BLEND_MODES as mode (mode)}<option value={mode}>{mode}</option>{/each}</select></label>
      </div>
      <div class="grid grid-cols-2 gap-2 border-t pt-3">
        <label class="space-y-1"><span>X</span><input class={field} type="number" value={layer.t.x} onchange={(e)=>editor.update(layer!.id,{t:{...layer!.t,x:num(e)}})}/></label>
        <label class="space-y-1"><span>Y</span><input class={field} type="number" value={layer.t.y} onchange={(e)=>editor.update(layer!.id,{t:{...layer!.t,y:num(e)}})}/></label>
        <label class="space-y-1"><span>Width</span><input class={field} type="number" min="1" value={layer.t.width} onchange={(e)=>editor.update(layer!.id,{t:{...layer!.t,width:num(e)}})}/></label>
        <label class="space-y-1"><span>Height</span><input class={field} type="number" min="1" value={layer.t.height} onchange={(e)=>editor.update(layer!.id,{t:{...layer!.t,height:num(e)}})}/></label>
        <label class="space-y-1"><span>Rotate</span><input class={field} type="number" value={layer.t.rotation} onchange={(e)=>editor.update(layer!.id,{t:{...layer!.t,rotation:num(e)}})}/></label>
        <label class="space-y-1"><span>Scale X</span><input class={field} type="number" step="0.1" value={layer.t.scaleX} onchange={(e)=>editor.update(layer!.id,{t:{...layer!.t,scaleX:num(e)}})}/></label>
      </div>
      {#if layer.kind === "text"}
        <div class="space-y-2 border-t pt-3"><label class="block space-y-1"><span>Text</span><textarea class="min-h-20 w-full rounded border bg-background p-2" value={layer.text??""} oninput={(e)=>editor.update(layer!.id,{text:e.currentTarget.value})}></textarea></label><div class="grid grid-cols-2 gap-2"><label class="space-y-1"><span>Font</span><select class={field} value={layer.fontFamily} onchange={(e)=>editor.update(layer!.id,{fontFamily:e.currentTarget.value})}>{#each FONT_FAMILIES as font (font)}<option value={font}>{font}</option>{/each}</select></label><label class="space-y-1"><span>Size</span><input class={field} type="number" min="6" value={layer.fontSize??64} onchange={(e)=>editor.update(layer!.id,{fontSize:num(e)})}/></label><label class="space-y-1"><span>Fill</span><input class="h-8 w-full rounded border" type="color" value={layer.fill??"#ffffff"} oninput={(e)=>editor.update(layer!.id,{fill:e.currentTarget.value})}/></label><label class="space-y-1"><span>Align</span><select class={field} value={layer.align??"left"} onchange={(e)=>editor.update(layer!.id,{align:e.currentTarget.value as "left"|"center"|"right"})}><option>left</option><option>center</option><option>right</option></select></label></div></div>
      {/if}
      {#if layer.kind === "shape"}
        <div class="grid grid-cols-2 gap-2 border-t pt-3"><label class="space-y-1"><span>Shape</span><select class={field} value={layer.shape??"rect"} onchange={(e)=>editor.update(layer!.id,{shape:e.currentTarget.value as "rect"|"ellipse"|"line"})}><option value="rect">Rectangle</option><option value="ellipse">Ellipse</option><option value="line">Line</option></select></label><label class="space-y-1"><span>Fill</span><input class="h-8 w-full rounded border" type="color" value={layer.fillColor??"#3b82f6"} oninput={(e)=>editor.update(layer!.id,{fillColor:e.currentTarget.value})}/></label></div>
      {/if}
      <div class="space-y-2 border-t pt-3"><strong class="text-[10px] uppercase text-muted-foreground">Adjustments</strong>{#each [["brightness",-1,1,.05],["contrast",-100,100,1],["saturation",-2,10,.1],["hue",0,360,1],["blur",0,40,1]] as row (row[0])}<label class="grid grid-cols-[72px_1fr_42px] items-center gap-2"><span class="capitalize">{row[0]}</span><input type="range" min={row[1]} max={row[2]} step={row[3]} value={layer.adj[row[0] as keyof typeof layer.adj] as number} oninput={(e)=>editor.patchAdj(layer!.id,{[row[0]]:num(e)})}/><span class="text-right tabular-nums">{Math.round(Number(layer.adj[row[0] as keyof typeof layer.adj]))}</span></label>{/each}<div class="flex gap-3">{#each ["grayscale","invert","sepia"] as key (key)}<label class="flex items-center gap-1"><input type="checkbox" checked={!!layer.adj[key as "grayscale"|"invert"|"sepia"]} onchange={(e)=>editor.patchAdj(layer!.id,{[key]:e.currentTarget.checked})}/>{key}</label>{/each}</div></div>
      <div class="space-y-2 border-t pt-3"><strong class="text-[10px] uppercase text-muted-foreground">Layer style</strong><div class="grid grid-cols-2 gap-2"><label class="flex items-center gap-1"><input type="checkbox" checked={layer.style.shadow.enabled} onchange={(e)=>editor.patchShadow(layer!.id,{enabled:e.currentTarget.checked})}/> Shadow</label><label class="flex items-center gap-1"><input type="checkbox" checked={layer.style.glow.enabled} onchange={(e)=>editor.patchGlow(layer!.id,{enabled:e.currentTarget.checked})}/> Glow</label><label class="flex items-center gap-1"><input type="checkbox" checked={layer.style.stroke.enabled} onchange={(e)=>editor.patchStroke(layer!.id,{enabled:e.currentTarget.checked})}/> Stroke</label><label class="flex items-center gap-1"><input type="checkbox" checked={layer.style.clipBelow} onchange={(e)=>editor.patchStyle(layer!.id,{clipBelow:e.currentTarget.checked})}/> Clip below</label></div></div>
      {#if layer.kind !== "adjustment"}<div class="flex gap-2 border-t pt-3">{#if layer.mask}<button class="rounded border px-2 py-1" onclick={()=>editor.setMaskEdit(snapshot.maskEditId===layer!.id?null:layer!.id)}>{snapshot.maskEditId===layer.id?"Done mask":"Edit mask"}</button><button class="rounded border px-2 py-1" onclick={()=>editor.removeMask(layer!.id)}>Remove mask</button>{:else}<button class="rounded border px-2 py-1" onclick={()=>editor.addMask(layer!.id)}>Add mask</button>{/if}</div>{/if}
    </div>
  {/if}
</section>
