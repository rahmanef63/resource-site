import { addTextClip, duplicateClip, moveToTrack, removeClip, setCrossfade, setRatio, setSpeed, splitAt } from "./composition";
import type { Composition } from "./mock-timeline";

export type ReelCtx = {
  comp: Composition;
  apply: (fn: (c: Composition) => Composition, commit?: boolean) => void;
  undo: () => void;
  redo: () => void;
};

type Schema = { type: "object"; properties: Record<string, unknown>; required: string[]; additionalProperties: false };
const schema = (properties: Record<string, unknown> = {}, required: string[] = []): Schema => ({ type: "object", properties, required, additionalProperties: false });
const str = (description: string) => ({ type: "string", description });
const num = (description: string, extra: Record<string, number> = {}) => ({ type: "number", description, ...extra });

const summary = (ctx: ReelCtx): string => {
  const c = ctx.comp;
  const clips = c.clips.map((cl) => `${cl.id} "${cl.name}" track=${cl.track} start=${cl.start} len=${cl.len}`).join("; ");
  return `composition ${c.w}x${c.h} @${c.fps}fps duration=${c.duration} | tracks: ${c.tracks.map((t) => `${t.id}(${t.kind})`).join(", ")} | clips: ${clips || "none"}`;
};
const need = (ctx: ReelCtx, id: string) => { if (!ctx.comp.clips.some((clip) => clip.id === id)) throw new Error(`no clip "${id}"`); };

export const reelEditorTools = {
  namespace: "reel-editor",
  instructions: "Video timeline editor. project.inspect for clip and track ids before editing; clip.remove is destructive; use history.undo/redo to recover.",
  describe: summary,
  tools: [
    { name: "project.inspect", description: "Read composition size, fps, tracks and clips.", parameters: schema(), run: (ctx: ReelCtx) => summary(ctx) },
    { name: "ratio.set", description: "Set canvas dimensions.", parameters: schema({ w: num("width px"), h: num("height px") }, ["w", "h"]), run: (ctx: ReelCtx, a: Record<string, unknown>) => { ctx.apply((c) => setRatio(c, Number(a.w), Number(a.h)), true); return `canvas ${a.w}x${a.h}`; } },
    { name: "title.add", description: "Add a text/title clip on the text track.", parameters: schema({ text: str("title text"), frame: num("start frame") }, ["text"]), run: (ctx: ReelCtx, a: Record<string, unknown>) => { ctx.apply((c) => addTextClip(c, String(a.text), Number(a.frame ?? 0)), true); return `title "${a.text}" added`; } },
    { name: "clip.split", description: "Split a clip at a frame.", parameters: schema({ frame: num("timeline frame"), clipId: str("clip id") }, ["frame"]), run: (ctx: ReelCtx, a: Record<string, unknown>) => { ctx.apply((c) => splitAt(c, Number(a.frame), a.clipId == null ? null : String(a.clipId)), true); return `split at frame ${a.frame}`; } },
    { name: "clip.remove", description: "Delete a clip by id.", parameters: schema({ id: str("clip id") }, ["id"]), run: (ctx: ReelCtx, a: Record<string, unknown>) => { const id=String(a.id); need(ctx,id); ctx.apply((c) => removeClip(c,id), true); return `clip ${id} removed`; } },
    { name: "clip.duplicate", description: "Duplicate a clip after the original.", parameters: schema({ id: str("clip id") }, ["id"]), run: (ctx: ReelCtx, a: Record<string, unknown>) => { const id=String(a.id); need(ctx,id); ctx.apply((c) => duplicateClip(c,id), true); return `clip ${id} duplicated`; } },
    { name: "clip.speed", description: "Set playback speed from 0.25x to 4x.", parameters: schema({ id: str("clip id"), speed: num("multiplier", { minimum: 0.25, maximum: 4 }) }, ["id", "speed"]), run: (ctx: ReelCtx, a: Record<string, unknown>) => { const id=String(a.id); need(ctx,id); ctx.apply((c) => setSpeed(c,id,Number(a.speed)), true); return `clip ${id} speed ${a.speed}x`; } },
    { name: "clip.crossfade", description: "Set cross-dissolve overlap frames.", parameters: schema({ id: str("clip id"), frames: num("overlap frames") }, ["id", "frames"]), run: (ctx: ReelCtx, a: Record<string, unknown>) => { const id=String(a.id); need(ctx,id); ctx.apply((c) => setCrossfade(c,id,Number(a.frames)), true); return `clip ${id} crossfade ${a.frames}f`; } },
    { name: "clip.move_track", description: "Move a clip to another track.", parameters: schema({ id: str("clip id"), track: str("target track id") }, ["id", "track"]), run: (ctx: ReelCtx, a: Record<string, unknown>) => { const id=String(a.id); need(ctx,id); ctx.apply((c) => moveToTrack(c,id,String(a.track)), true); return `clip ${id} → track ${a.track}`; } },
    { name: "history.undo", description: "Undo the last edit.", parameters: schema(), run: (ctx: ReelCtx) => { ctx.undo(); return "undone"; } },
    { name: "history.redo", description: "Redo the last undone edit.", parameters: schema(), run: (ctx: ReelCtx) => { ctx.redo(); return "redone"; } },
  ],
};
