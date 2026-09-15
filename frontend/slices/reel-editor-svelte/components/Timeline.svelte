<script lang="ts">
  import { clipsForTrack, trackWidth, type Clip, type Composition, type Track } from "@/features/reel-editor/lib/mock-timeline";
  let { comp, frame, zoom, selectedId, onFrame, onSelect, onTrackPatch, onMoveTrack } = $props<{
    comp: Composition; frame: number; zoom: number; selectedId: string | null;
    onFrame: (frame: number) => void; onSelect: (id: string) => void; onTrackPatch: (id: string, patch: Partial<Track>) => void; onMoveTrack: (id: string, dir: -1 | 1) => void;
  }>();
  let width = $derived(trackWidth(comp.duration, zoom));
  const frameAt = (event: MouseEvent) => {
    const rect=(event.currentTarget as HTMLElement).getBoundingClientRect();
    onFrame(Math.max(0,Math.min(comp.duration,(event.clientX-rect.left)/zoom)));
  };
</script>
<section class="min-h-44 border-t bg-background">
  <div class="grid grid-cols-[128px_1fr] border-b text-[10px] text-muted-foreground">
    <div class="px-2 py-1.5 font-semibold uppercase">Tracks</div>
    <div class="overflow-x-auto">
      <button class="relative block h-7 text-left" style={`width:${width}px`} onclick={frameAt} aria-label="Set playhead">
        {#each Array.from({length: Math.ceil(comp.duration/(comp.fps*2))+1}) as _, i}
          <span class="absolute top-1" style={`left:${i*comp.fps*2*zoom}px`}>{i*2}s</span>
        {/each}
        <span class="absolute inset-y-0 w-px bg-red-500" style={`left:${frame*zoom}px`}></span>
      </button>
    </div>
  </div>
  <div class="max-h-64 overflow-y-auto">
    {#each comp.tracks as track, index (track.id)}
      <div class="grid grid-cols-[128px_1fr] border-b last:border-b-0">
        <div class="flex items-center gap-1 px-1.5 py-1 text-[10px]">
          <span class="min-w-0 flex-1 truncate font-medium">{track.name}</span>
          <button class="rounded px-1" title="Lock" aria-pressed={!!track.lock} onclick={() => onTrackPatch(track.id,{lock:!track.lock})}>{track.lock?"🔒":"🔓"}</button>
          <button class="rounded px-1" title="Hide" aria-pressed={!!track.hide} onclick={() => onTrackPatch(track.id,{hide:!track.hide})}>{track.hide?"🙈":"👁"}</button>
          {#if track.kind === "audio"}<button class="rounded px-1" title="Mute" aria-pressed={!!track.mute} onclick={() => onTrackPatch(track.id,{mute:!track.mute})}>{track.mute?"🔇":"🔊"}</button>{/if}
          <button class="rounded px-1 disabled:opacity-30" disabled={index===0} onclick={() => onMoveTrack(track.id,-1)} aria-label="Move track up">↑</button>
          <button class="rounded px-1 disabled:opacity-30" disabled={index===comp.tracks.length-1} onclick={() => onMoveTrack(track.id,1)} aria-label="Move track down">↓</button>
        </div>
        <div class="overflow-x-auto bg-muted/15">
          <div class="relative h-10" style={`width:${width}px`}>
            {#each clipsForTrack(comp.clips,track.id) as clip (clip.id)}
              <button
                class="absolute top-1 h-8 overflow-hidden rounded border px-2 text-left text-[10px] text-white shadow-sm"
                class:ring-2={selectedId===clip.id}
                class:ring-primary={selectedId===clip.id}
                style={`left:${clip.start*zoom}px;width:${Math.max(16,clip.len*zoom)}px;background:${clip.color}`}
                onclick={() => onSelect(clip.id)}
                title={`${clip.name} · ${clip.len}f`}
              ><span class="block truncate">{clip.name}</span><span class="opacity-70">{clip.len}f</span></button>
            {/each}
            <span class="pointer-events-none absolute inset-y-0 w-px bg-red-500" style={`left:${frame*zoom}px`}></span>
          </div>
        </div>
      </div>
    {/each}
  </div>
</section>
