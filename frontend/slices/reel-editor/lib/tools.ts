// Agentic tool collection. The slice is NOT an agent — it exports this
// collection of function-calling tools and ONE shared agent (e.g. the
// assistant host) drives it alongside other slices' collections via
// @/shared/agentic. Ctx = the live HistoryApi from useHistory().

import {
  defineToolCollection,
  noArgs,
  num,
  obj,
  str,
} from "@/shared/agentic";
import {
  addTextClip,
  duplicateClip,
  moveToTrack,
  removeClip,
  setCrossfade,
  setRatio,
  setSpeed,
  splitAt,
} from "./composition";
import type { HistoryApi } from "./history";

export type ReelCtx = HistoryApi;

const summary = (ctx: ReelCtx): string => {
  const c = ctx.comp;
  const clips = c.clips
    .map((cl) => `${cl.id} "${cl.name}" track=${cl.track} start=${cl.start} len=${cl.len}`)
    .join("; ");
  return `composition ${c.w}x${c.h} @${c.fps}fps duration=${c.duration} | tracks: ${c.tracks
    .map((t) => `${t.id}(${t.kind})`)
    .join(", ")} | clips: ${clips || "none"}`;
};

const need = (ctx: ReelCtx, id: string) => {
  if (!ctx.comp.clips.some((cl) => cl.id === id)) throw new Error(`no clip "${id}"`);
};

export const reelEditorTools = defineToolCollection<ReelCtx>({
  namespace: "reel-editor",
  describe: summary,
  tools: [
    {
      name: "project.inspect",
      description: "Read back the composition: size, fps, tracks, every clip with id/track/start/len.",
      parameters: noArgs,
      run: (ctx) => summary(ctx),
    },
    {
      name: "ratio.set",
      description: "Set the canvas dimensions (e.g. 1080x1920 for 9:16).",
      parameters: obj({ "w!": num("width px"), "h!": num("height px") }),
      run: (ctx, a) => {
        ctx.apply((c) => setRatio(c, a.w as number, a.h as number), true);
        return `canvas ${a.w}x${a.h}`;
      },
    },
    {
      name: "title.add",
      description: "Add an animated text/title clip on the text track.",
      parameters: obj({ "text!": str("title text"), frame: num("start frame (default 0)") }),
      run: (ctx, a) => {
        ctx.apply((c) => addTextClip(c, a.text as string, (a.frame as number) ?? 0), true);
        return `title "${a.text}" added`;
      },
    },
    {
      name: "clip.split",
      description: "Split a clip at a frame into two clips.",
      parameters: obj({ "frame!": num("timeline frame"), clipId: str("clip id (default: clip under the frame)") }),
      run: (ctx, a) => {
        ctx.apply((c) => splitAt(c, a.frame as number, (a.clipId as string) ?? null), true);
        return `split at frame ${a.frame}`;
      },
    },
    {
      name: "clip.remove",
      description: "Delete a clip by id.",
      parameters: obj({ "id!": str("clip id") }),
      run: (ctx, a) => {
        need(ctx, a.id as string);
        ctx.apply((c) => removeClip(c, a.id as string), true);
        return `clip ${a.id} removed`;
      },
    },
    {
      name: "clip.duplicate",
      description: "Duplicate a clip; the copy starts right after the original.",
      parameters: obj({ "id!": str("clip id") }),
      run: (ctx, a) => {
        need(ctx, a.id as string);
        ctx.apply((c) => duplicateClip(c, a.id as string), true);
        return `clip ${a.id} duplicated`;
      },
    },
    {
      name: "clip.speed",
      description: "Set a clip's playback speed (0.25–4), rescaling its length NLE-style.",
      parameters: obj({ "id!": str("clip id"), "speed!": num("multiplier", { min: 0.25, max: 4 }) }),
      run: (ctx, a) => {
        need(ctx, a.id as string);
        ctx.apply((c) => setSpeed(c, a.id as string, a.speed as number), true);
        return `clip ${a.id} speed ${a.speed}x`;
      },
    },
    {
      name: "clip.crossfade",
      description: "Cross-dissolve a clip's start over its same-track predecessor (frames<=0 clears).",
      parameters: obj({ "id!": str("clip id"), "frames!": num("overlap frames") }),
      run: (ctx, a) => {
        need(ctx, a.id as string);
        ctx.apply((c) => setCrossfade(c, a.id as string, a.frames as number), true);
        return `clip ${a.id} crossfade ${a.frames}f`;
      },
    },
    {
      name: "clip.move_track",
      description: "Move a clip onto another track of the same kind.",
      parameters: obj({ "id!": str("clip id"), "track!": str("target track id") }),
      run: (ctx, a) => {
        need(ctx, a.id as string);
        ctx.apply((c) => moveToTrack(c, a.id as string, a.track as string), true);
        return `clip ${a.id} → track ${a.track}`;
      },
    },
    {
      name: "history.undo",
      description: "Undo the last edit.",
      parameters: noArgs,
      run: (ctx) => {
        ctx.undo();
        return "undone";
      },
    },
    {
      name: "history.redo",
      description: "Redo the last undone edit.",
      parameters: noArgs,
      run: (ctx) => {
        ctx.redo();
        return "redone";
      },
    },
  ],
});
