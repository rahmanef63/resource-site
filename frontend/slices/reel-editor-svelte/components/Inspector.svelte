<script lang="ts">
  import type { Clip, Track, KfProp } from "@/features/reel-editor/lib/mock-timeline";
  import { KF_DEFAULT } from "@/features/reel-editor/lib/keyframes";
  let { clip, tracks, onPatch, onBase, onSpeed, onCrossfade } = $props<{
    clip: Clip | null; tracks: Track[]; onPatch: (patch: Partial<Clip>) => void; onBase: (key: KfProp, value: number) => void; onSpeed: (value: number) => void; onCrossfade: (frames: number) => void;
  }>();
  const number = (event: Event) => Number((event.currentTarget as HTMLInputElement).value);
  const TRANSFORM_KEYS: KfProp[] = ["opacity", "scale", "x", "y", "rotate"];
  let compatible = $derived(clip ? tracks.filter((t: Track) => t.kind===clip.kind || (clip.kind==="overlay" && t.kind==="overlay")) : []);
</script>
<aside class="min-h-0 overflow-y-auto border-l bg-muted/10 p-3">
  {#if !clip}
    <p class="text-sm text-muted-foreground">Select a clip to edit.</p>
  {:else}
    <div class="space-y-4">
      <div><p class="text-xs text-muted-foreground">Selected clip</p><strong class="text-sm">{clip.name}</strong></div>
      <label class="block space-y-1 text-xs"><span>Track</span><select class="w-full rounded border bg-background px-2 py-1" value={clip.track} onchange={(e)=>onPatch({track:e.currentTarget.value})}>{#each compatible as t}<option value={t.id}>{t.name}</option>{/each}</select></label>
      <div class="grid grid-cols-2 gap-2">
        <label class="space-y-1 text-xs"><span>Start</span><input class="w-full rounded border bg-background px-2 py-1" type="number" min="0" value={clip.start} onchange={(e)=>onPatch({start:number(e)})}/></label>
        <label class="space-y-1 text-xs"><span>Length</span><input class="w-full rounded border bg-background px-2 py-1" type="number" min="6" value={clip.len} onchange={(e)=>onPatch({len:number(e)})}/></label>
      </div>
      {#if clip.media}
        <div class="grid grid-cols-2 gap-2">
          <label class="space-y-1 text-xs"><span>Speed</span><input class="w-full rounded border bg-background px-2 py-1" type="number" min="0.25" max="4" step="0.25" value={clip.speed??1} onchange={(e)=>onSpeed(number(e))}/></label>
          <label class="flex items-end gap-2 pb-1 text-xs"><input type="checkbox" checked={!!clip.reverse} onchange={(e)=>onPatch({reverse:e.currentTarget.checked})}/> Reverse</label>
        </div>
      {/if}
      {#if clip.kind === "audio" || clip.media?.type === "video"}
        <div class="grid grid-cols-2 gap-2">
          <label class="space-y-1 text-xs"><span>Volume</span><input class="w-full" type="range" min="0" max="1" step="0.05" value={clip.vol??1} oninput={(e)=>onPatch({vol:number(e)})}/></label>
          <label class="flex items-center gap-2 text-xs"><input type="checkbox" checked={!!clip.mute} onchange={(e)=>onPatch({mute:e.currentTarget.checked})}/> Mute</label>
          <label class="space-y-1 text-xs"><span>Fade in</span><input class="w-full rounded border bg-background px-2 py-1" type="number" min="0" value={clip.fadeIn??0} onchange={(e)=>onPatch({fadeIn:number(e)})}/></label>
          <label class="space-y-1 text-xs"><span>Fade out</span><input class="w-full rounded border bg-background px-2 py-1" type="number" min="0" value={clip.fadeOut??0} onchange={(e)=>onPatch({fadeOut:number(e)})}/></label>
        </div>
      {/if}
      {#if clip.text != null}<label class="block space-y-1 text-xs"><span>Text</span><textarea class="min-h-20 w-full rounded border bg-background p-2" value={clip.text} oninput={(e)=>onPatch({text:e.currentTarget.value})}></textarea></label>{/if}
      <div class="space-y-2 border-t pt-3">
        <p class="text-[10px] font-semibold uppercase text-muted-foreground">Transform</p>
        {#each TRANSFORM_KEYS as key}
          <label class="grid grid-cols-[64px_1fr_48px] items-center gap-2 text-xs"><span class="capitalize">{key}</span><input type="range" min={key==="opacity"?0:key==="scale"?0:-180} max={key==="opacity"?100:key==="scale"?300:180} value={clip.base?.[key]??KF_DEFAULT[key]} oninput={(e)=>onBase(key,number(e))}/><span class="text-right tabular-nums">{Math.round(clip.base?.[key]??KF_DEFAULT[key])}</span></label>
        {/each}
      </div>
      <div class="grid grid-cols-2 gap-2 border-t pt-3">
        <label class="space-y-1 text-xs"><span>Transition</span><select class="w-full rounded border bg-background px-2 py-1" value={clip.xtype??"dissolve"} onchange={(e)=>onPatch({xtype:e.currentTarget.value as Clip["xtype"]})}><option value="dissolve">Dissolve</option><option value="wipe">Wipe</option><option value="slide">Slide</option></select></label>
        <label class="space-y-1 text-xs"><span>Frames</span><input class="w-full rounded border bg-background px-2 py-1" type="number" min="0" value={clip.xfade??0} onchange={(e)=>onCrossfade(number(e))}/></label>
      </div>
    </div>
  {/if}
</aside>
