<script lang="ts">
  import { onMount } from "svelte";
  import { AI_HELLO, type AiMessage } from "@/features/reel-editor/lib/ai-core";
  import { interpretAi } from "@/features/reel-editor/lib/ai-edit";
  import { addMediaClip, addTextClip, duplicateClip, moveTrack, patchClip, removeClip, setCrossfade, setRatio, setSpeed, splitAt } from "@/features/reel-editor/lib/composition";
  import { clearDraft, loadDraft, saveDraft } from "@/features/reel-editor/lib/draft";
  import { createReelHistory } from "@/features/reel-editor/lib/history-core";
  import { createMediaRef, mediaTypeFromName } from "@/features/reel-editor/lib/import-core";
  import { MediaCache } from "@/features/reel-editor/lib/media-cache";
  import { defaultComposition, uid, type Clip, type MediaRef, type Track, type TrackKind } from "@/features/reel-editor/lib/mock-timeline";
  import { renderToWebM } from "@/features/reel-editor/lib/render";
  import { getSettings } from "@/features/reel-editor/lib/settings";
  import { reelEditorTools, type ReelCtx } from "@/features/reel-editor/lib/tools";
  import type { KfProp } from "@/features/reel-editor/lib/mock-timeline";
  import AiPanel from "./AiPanel.svelte";
  import FilesPanel from "./FilesPanel.svelte";
  import Inspector from "./Inspector.svelte";
  import PreviewStage from "./PreviewStage.svelte";
  import RenderOverlay from "./RenderOverlay.svelte";
  import SettingsPanel from "./SettingsPanel.svelte";
  import Timeline from "./Timeline.svelte";
  import Toolbar from "./Toolbar.svelte";

  type RegisterTools = (collection: typeof reelEditorTools, context: ReelCtx) => void | (() => void);
  type RenderState = { pct: number; done: boolean; url?: string } | null;
  let { registerTools = undefined } = $props<{ registerTools?: RegisterTools }>();
  const history = createReelHistory(defaultComposition());
  const cache = new MediaCache();
  let snapshot = $state(history.getSnapshot());
  let frame = $state(30);
  let playing = $state(false);
  let selectedId = $state<string | null>("c-intro");
  let zoom = $state(3.2);
  let monitor = $state(true);
  let panel = $state<"inspector" | "ai" | "files">("inspector");
  let aiLog = $state<AiMessage[]>([{ ...AI_HELLO }]);
  let settingsOpen = $state(false);
  let render = $state<RenderState>(null);
  let input = $state<HTMLInputElement>();
  let abort: AbortController | null = null;
  let renderUrl: string | null = null;
  let comp = $derived(snapshot.comp);
  let selected = $derived(comp.clips.find((clip) => clip.id === selectedId) ?? null);
  const apply = history.apply;

  function selectNew(next: typeof comp) { selectedId = next.clips.at(-1)?.id ?? selectedId; return next; }
  function addMedia(media: MediaRef, name: string) { apply((c) => selectNew(addMediaClip(c, media, name, frame)), true); panel = "inspector"; }
  function patchSelected(patch: Partial<Clip>) { if (selectedId) apply((c) => patchClip(c, selectedId!, patch)); }
  function patchTrack(id: string, patch: Partial<Track>) { apply((c) => ({ ...c, tracks: c.tracks.map((track) => track.id === id ? { ...track, ...patch } : track) }), true); }
  function setBase(key: KfProp, value: number) { if (selected) patchSelected({ base: { ...selected.base, [key]: value } }); }
  function addTrack(kind: TrackKind) { apply((c) => { const n=c.tracks.filter((t)=>t.kind===kind).length+1; const t={id:uid("t"),name:`${kind === "audio" ? "Audio" : "Video"} ${n}`,kind}; return { ...c, tracks: kind === "audio" ? [...c.tracks,t] : [t,...c.tracks] }; }, true); }
  function split() { apply((c) => splitAt(c, frame, selectedId), true); }
  function duplicate() { if (selectedId) apply((c) => selectNew(duplicateClip(c, selectedId!)), true); }
  function remove() { if (!selectedId) return; apply((c) => removeClip(c, selectedId!), true); selectedId = null; }
  function addTitle() { const text=window.prompt("Title text", "New title")?.trim(); if (text) apply((c) => selectNew(addTextClip(c,text,frame)), true); }
  function newProject() { clearDraft(); history.reset(defaultComposition()); selectedId = null; frame = 0; }
  function runAi(text: string) { const result=interpretAi(text,frame,selected); if(result.transform) apply(result.transform,true); aiLog=[...aiLog,{role:"user",text},{role:"ai",text:result.reply}]; }
  async function importFiles(files: FileList | null) { for (const file of Array.from(files ?? [])) { const type=mediaTypeFromName(file.name,file.type); if(type) addMedia(await createMediaRef(URL.createObjectURL(file),type),file.name); } if(input) input.value=""; }
  async function startRender() { playing=false; abort?.abort(); abort=new AbortController(); render={pct:0,done:false}; try { const blob=await renderToWebM(comp,cache,(pct)=>render={pct,done:false},abort.signal); if(abort.signal.aborted) return; if(renderUrl) URL.revokeObjectURL(renderUrl); renderUrl=URL.createObjectURL(blob); render={pct:100,done:true,url:renderUrl}; } catch { if(!abort.signal.aborted) render=null; } }
  function closeRender() { abort?.abort(); if(renderUrl) URL.revokeObjectURL(renderUrl); renderUrl=null; render=null; }
  function shortcut(event: KeyboardEvent) { const tag=(event.target as HTMLElement)?.tagName; if(["INPUT","TEXTAREA","SELECT"].includes(tag)) return; const mod=event.metaKey||event.ctrlKey; const k=event.key.toLowerCase(); if(mod&&k==="z"){event.preventDefault();event.shiftKey?history.redo():history.undo();} else if(mod&&k==="y"){event.preventDefault();history.redo();} else if(k==="s"&&!mod){event.preventDefault();split();} else if((event.key==="Delete"||event.key==="Backspace")&&selectedId){event.preventDefault();remove();} else if(event.key===" "){event.preventDefault();playing=!playing;} }

  $effect(() => { cache.setMonitor(monitor); });
  $effect(() => { const current=comp; if(!getSettings().autosave) return; const timer=setTimeout(()=>saveDraft(current),800); return ()=>clearTimeout(timer); });
  $effect(() => { if(!playing) return; let last=performance.now(), raf=0; const loop=(now:number)=>{const next=frame+((now-last)/1000)*comp.fps; last=now; frame=next>=comp.duration?0:next; raf=requestAnimationFrame(loop);}; raf=requestAnimationFrame(loop); return ()=>cancelAnimationFrame(raf); });

  onMount(() => {
    const draft=loadDraft(); if(draft) history.reset(draft);
    const unsubscribe=history.subscribe(()=>snapshot=history.getSnapshot()); snapshot=history.getSnapshot();
    const context: ReelCtx = { get comp(){ return history.getSnapshot().comp; }, apply: history.apply, undo: history.undo, redo: history.redo };
    const unregister=registerTools?.(reelEditorTools,context);
    return () => { unsubscribe(); unregister?.(); cache.dispose(); closeRender(); };
  });
</script>

<svelte:window onkeydown={shortcut} />
<div class="relative flex h-full min-h-[560px] flex-col overflow-hidden bg-background text-foreground outline-none" aria-label="Reel video editor">
  <Toolbar {comp} {frame} canUndo={snapshot.canUndo} canRedo={snapshot.canRedo} hasSelection={!!selected} {playing} {monitor} onUndo={history.undo} onRedo={history.redo} onTogglePlay={()=>playing=!playing} onMonitor={()=>monitor=!monitor} onRatio={(w,h)=>apply((c)=>setRatio(c,w,h),true)} onTitle={addTitle} onSplit={split} onDuplicate={duplicate} onDelete={remove} onAddTrack={addTrack} onImport={()=>input?.click()} onRender={()=>void startRender()} onNew={newProject} onSettings={()=>settingsOpen=true} />
  <div class="grid min-h-0 flex-1 grid-cols-[minmax(0,1fr)_290px] max-lg:grid-cols-1">
    <PreviewStage {comp} {frame} {playing} {monitor} {cache} />
    <section class="flex min-h-0 flex-col border-l max-lg:max-h-72 max-lg:border-l-0 max-lg:border-t">
      <div class="flex border-b p-1">{#each ["inspector","ai","files"] as item}<button class={`flex-1 rounded px-2 py-1 text-xs capitalize ${panel===item?"bg-muted font-medium":""}`} onclick={()=>panel=item as typeof panel}>{item}</button>{/each}</div>
      <div class="min-h-0 flex-1 overflow-hidden">{#if panel==="inspector"}<Inspector clip={selected} tracks={comp.tracks} onPatch={patchSelected} onBase={setBase} onSpeed={(v)=>selectedId&&apply((c)=>setSpeed(c,selectedId!,v),true)} onCrossfade={(v)=>selectedId&&apply((c)=>setCrossfade(c,selectedId!,v),true)} />{:else if panel==="ai"}<AiPanel log={aiLog} hasSelection={!!selected} onSend={runAi}/>{:else}<FilesPanel onAdd={addMedia}/>{/if}</div>
    </section>
  </div>
  <Timeline {comp} {frame} {zoom} {selectedId} onFrame={(v)=>frame=v} onSelect={(id)=>{selectedId=id;panel="inspector";}} onTrackPatch={patchTrack} onMoveTrack={(id,dir)=>apply((c)=>moveTrack(c,id,dir),true)} />
  <div class="flex items-center gap-2 border-t px-3 py-1 text-[10px] text-muted-foreground"><span>{comp.w}×{comp.h}</span><span>{comp.fps}fps</span><span>{comp.clips.length} clips</span><label class="ml-auto flex items-center gap-1">Zoom <input class="w-24" type="range" min="0.5" max="8" step="0.1" bind:value={zoom}/></label></div>
  <input class="hidden" type="file" multiple accept="image/*,video/*,audio/*" bind:this={input} onchange={(e)=>void importFiles(e.currentTarget.files)} />
  {#if settingsOpen}<SettingsPanel onClose={()=>settingsOpen=false}/>{/if}
  {#if render}<RenderOverlay pct={render.pct} done={render.done} url={render.url} onClose={closeRender}/>{/if}
</div>
