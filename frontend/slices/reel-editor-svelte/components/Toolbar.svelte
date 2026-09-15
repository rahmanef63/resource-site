<script lang="ts">
  import { RATIOS } from "@/features/reel-editor/lib/composition";
  import { fmtFrame, type Composition, type TrackKind } from "@/features/reel-editor/lib/mock-timeline";
  let { comp, frame, canUndo, canRedo, hasSelection, playing, monitor, onUndo, onRedo, onTogglePlay, onMonitor, onRatio, onTitle, onSplit, onDuplicate, onDelete, onAddTrack, onImport, onRender, onNew, onSettings } = $props<{
    comp: Composition; frame: number; canUndo: boolean; canRedo: boolean; hasSelection: boolean; playing: boolean; monitor: boolean;
    onUndo: () => void; onRedo: () => void; onTogglePlay: () => void; onMonitor: () => void; onRatio: (w: number, h: number) => void; onTitle: () => void; onSplit: () => void; onDuplicate: () => void; onDelete: () => void; onAddTrack: (kind: TrackKind) => void; onImport: () => void; onRender: () => void; onNew: () => void; onSettings: () => void;
  }>();
</script>
<header class="flex flex-wrap items-center gap-1.5 border-b bg-background p-2 text-xs">
  <strong class="mr-2">Reel</strong>
  <button class="rounded border px-2 py-1" onclick={onNew}>New</button>
  <button class="rounded border px-2 py-1" onclick={onImport}>Import</button>
  <button class="rounded border px-2 py-1 disabled:opacity-40" disabled={!canUndo} onclick={onUndo}>Undo</button>
  <button class="rounded border px-2 py-1 disabled:opacity-40" disabled={!canRedo} onclick={onRedo}>Redo</button>
  <span class="mx-1 h-5 w-px bg-border"></span>
  <button class="rounded border px-2 py-1" onclick={onTitle}>+ Title</button>
  <button class="rounded border px-2 py-1 disabled:opacity-40" disabled={!hasSelection} onclick={onSplit}>Split</button>
  <button class="rounded border px-2 py-1 disabled:opacity-40" disabled={!hasSelection} onclick={onDuplicate}>Duplicate</button>
  <button class="rounded border px-2 py-1 disabled:opacity-40" disabled={!hasSelection} onclick={onDelete}>Delete</button>
  <select class="rounded border bg-background px-2 py-1" aria-label="Canvas ratio" onchange={(e) => { const p=RATIOS[Number(e.currentTarget.value)]; if(p) onRatio(p.w,p.h); }}>
    {#each RATIOS as ratio, i}<option value={i} selected={ratio.w===comp.w && ratio.h===comp.h}>{ratio.label}</option>{/each}
  </select>
  <select class="rounded border bg-background px-2 py-1" aria-label="Add track" onchange={(e) => { const v=e.currentTarget.value as TrackKind; if(v) { onAddTrack(v); e.currentTarget.value=""; } }}><option value="">+ Track</option><option value="video">Video</option><option value="audio">Audio</option></select>
  <span class="ml-auto tabular-nums text-muted-foreground">{fmtFrame(frame, comp.fps)}</span>
  <button class="rounded border px-2 py-1" aria-pressed={monitor} onclick={onMonitor}>{monitor ? "🔊" : "🔇"}</button>
  <button class="rounded border px-2 py-1" aria-pressed={playing} onclick={onTogglePlay}>{playing ? "Pause" : "Play"}</button>
  <button class="rounded border px-2 py-1" onclick={onSettings}>Settings</button>
  <button class="rounded bg-primary px-3 py-1 text-primary-foreground" onclick={onRender}>Render</button>
</header>
