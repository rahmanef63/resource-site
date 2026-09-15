import { describe, expect, it, vi } from "vitest";
import { createReelHistory } from "./history-core";
import { defaultComposition } from "./mock-timeline";

function comp(w = 1920) { return { ...defaultComposition(), w }; }

describe("reel history core", () => {
  it("publishes stable snapshots and supports undo/redo", () => {
    vi.spyOn(Date, "now").mockReturnValue(1000);
    const h = createReelHistory(comp());
    const first = h.getSnapshot();
    expect(h.getSnapshot()).toBe(first);
    h.apply((c) => ({ ...c, w: 1080 }), true);
    expect(h.getSnapshot().comp.w).toBe(1080);
    expect(h.getSnapshot().canUndo).toBe(true);
    h.undo();
    expect(h.getSnapshot().comp.w).toBe(1920);
    expect(h.getSnapshot().canRedo).toBe(true);
    h.redo();
    expect(h.getSnapshot().comp.w).toBe(1080);
    vi.restoreAllMocks();
  });

  it("coalesces rapid edits until commit forces a new undo step", () => {
    const now = vi.spyOn(Date, "now");
    now.mockReturnValueOnce(1000).mockReturnValueOnce(1100).mockReturnValueOnce(1200);
    const h = createReelHistory(comp());
    h.apply((c) => ({ ...c, w: 1000 }));
    h.apply((c) => ({ ...c, w: 900 }));
    h.commit();
    h.apply((c) => ({ ...c, w: 800 }));
    h.undo();
    expect(h.getSnapshot().comp.w).toBe(900);
    h.undo();
    expect(h.getSnapshot().comp.w).toBe(1920);
    now.mockRestore();
  });
});
