import { describe, expect, it, vi } from "vitest";
import { GAP, spawnRect, workArea, snapRect, nextSnapZone } from "./store-geometry";

// spawnRect reads window.innerWidth/Height — stub a 1280x800 viewport.
vi.stubGlobal("window", Object.assign(globalThis.window ?? {}, { innerWidth: 1280, innerHeight: 800 }));

describe("spawnRect (cascade clamp)", () => {
  it("cascades early windows from the classic origin", () => {
    expect(spawnRect(0, 720, 460)).toMatchObject({ x: 80, y: 64, w: 720, h: 460 });
    expect(spawnRect(2, 720, 460)).toMatchObject({ x: 80 + 56, y: 64 + 56 });
  });

  it("wraps the cascade instead of marching forever", () => {
    expect(spawnRect(6, 720, 460)).toMatchObject({ x: 80, y: 64 }); // 6 % 6 = 0
  });

  it("never lets the window cross the right/bottom work-area edge", () => {
    const { vw, bottom } = workArea();
    for (let n = 0; n < 12; n++) {
      const r = spawnRect(n, 900, 700);
      expect(r.x + r.w).toBeLessThanOrEqual(vw - GAP);
      expect(r.y + r.h).toBeLessThanOrEqual(bottom);
      expect(r.x).toBeGreaterThanOrEqual(GAP);
    }
  });

  it("shrinks oversized windows to fit the work area", () => {
    const { vw, top, bottom } = workArea();
    const r = spawnRect(0, 5000, 5000);
    expect(r.w).toBe(vw - GAP * 2);
    expect(r.h).toBe(bottom - top);
  });
});

describe("nextSnapZone (⌘+arrow width cycling)", () => {
  it("cycles the left column half → third → two-thirds → half", () => {
    expect(nextSnapZone("left", undefined)).toBe("left"); // un-snapped → half
    expect(nextSnapZone("left", "left")).toBe("l13");
    expect(nextSnapZone("left", "l13")).toBe("l23");
    expect(nextSnapZone("left", "l23")).toBe("left"); // wraps
  });

  it("cycles the right column half → third → two-thirds → half", () => {
    expect(nextSnapZone("right", undefined)).toBe("right");
    expect(nextSnapZone("right", "right")).toBe("r13");
    expect(nextSnapZone("right", "r13")).toBe("r23");
    expect(nextSnapZone("right", "r23")).toBe("right");
  });

  it("restarts the cycle at the half when coming from the other side / a quadrant", () => {
    expect(nextSnapZone("left", "right")).toBe("left");
    expect(nextSnapZone("left", "tr")).toBe("left");
    expect(nextSnapZone("right", "l23")).toBe("right");
  });
});

describe("snapRect thirds tile the work area (no overlap, single gutter)", () => {
  it("l13 + r23 cover the full width with one GAP gutter, ⅔ = 2×⅓", () => {
    const { vw } = workArea();
    const l13 = snapRect("l13"), r23 = snapRect("r23");
    expect(l13.x).toBe(GAP);
    expect(r23.x + r23.w).toBeCloseTo(vw - GAP, 5); // ends at the right margin
    expect(r23.x - (l13.x + l13.w)).toBeCloseTo(GAP, 5); // exactly one gutter
    expect(r23.w).toBeCloseTo(l13.w * 2, 5);
  });

  it("l23 + r13 mirror it (⅔ left, ⅓ right)", () => {
    const { vw } = workArea();
    const l23 = snapRect("l23"), r13 = snapRect("r13");
    expect(l23.x).toBe(GAP);
    expect(r13.x + r13.w).toBeCloseTo(vw - GAP, 5);
    expect(r13.x - (l23.x + l23.w)).toBeCloseTo(GAP, 5);
    expect(l23.w).toBeCloseTo(r13.w * 2, 5);
  });
});
