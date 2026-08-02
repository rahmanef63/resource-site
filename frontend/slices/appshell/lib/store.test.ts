import { beforeEach, describe, expect, it, vi } from "vitest";
import {
  openWindow,
  closeWindow,
  closeAll,
  focusWindow,
  focusApp,
  minimizeWindow,
  restoreWindow,
  toggleMaximize,
  snapWindow,
  moveWindow,
  resizeWindow,
} from "./store";
import { shellStore } from "./store-state";
import { registerExitAnimator } from "../hooks/use-window-exit";

// spawnRect / workArea read window.innerWidth/Height — stub a 1280x800 viewport.
// matchMedia + document back requestExit's reduce-motion check ("motion on").
vi.stubGlobal("window", Object.assign(globalThis.window ?? {}, { innerWidth: 1280, innerHeight: 800, matchMedia: () => ({ matches: false }) }));
vi.stubGlobal("document", { documentElement: { classList: { contains: () => false } } });

describe("openWindow", () => {
  beforeEach(() => closeAll());

  it("reuses the single window of a singleton app + updates its payload", () => {
    const a = openWindow("files", "Files", undefined, { path: "/a" });
    const b = openWindow("files", "Files", undefined, { path: "/b" });
    expect(b).toBe(a); // same window
    expect(shellStore.getOrder()).toEqual([a]);
    expect(shellStore.getWindow(a)?.payload).toEqual({ path: "/b" }); // re-open updates payload
  });

  it("spawns a fresh window each time for a multi app", () => {
    const a = openWindow("files", "Files", undefined, undefined, { multi: true });
    const b = openWindow("files", "Files", undefined, undefined, { multi: true });
    expect(b).not.toBe(a);
    expect(shellStore.getOrder()).toEqual([a, b]);
  });

  it("re-opening a minimized singleton restores + focuses it", () => {
    const a = openWindow("files", "Files");
    minimizeWindow(a);
    expect(shellStore.getWindow(a)?.minimized).toBe(true);
    openWindow("files", "Files");
    expect(shellStore.getWindow(a)?.minimized).toBe(false);
    expect(shellStore.getFocused()).toBe(a);
  });

  it("focuses the newly opened window", () => {
    openWindow("files", "Files");
    const b = openWindow("notion", "DB");
    expect(shellStore.getFocused()).toBe(b);
  });
});

describe("focusWindow / focusApp", () => {
  beforeEach(() => closeAll());

  it("raises the focused window above the rest", () => {
    const a = openWindow("files", "Files");
    const b = openWindow("notion", "DB");
    expect(shellStore.getWindow(b)!.z).toBeGreaterThan(shellStore.getWindow(a)!.z);
    focusWindow(a);
    expect(shellStore.getWindow(a)!.z).toBeGreaterThan(shellStore.getWindow(b)!.z);
    expect(shellStore.getFocused()).toBe(a);
  });

  it("focusApp returns false when the app has no window, true when it focuses one", () => {
    expect(focusApp("files")).toBe(false);
    const a = openWindow("files", "Files");
    openWindow("notion", "DB"); // steal focus
    expect(focusApp("files")).toBe(true);
    expect(shellStore.getFocused()).toBe(a);
  });

  it("focusApp restores a minimized window", () => {
    const a = openWindow("files", "Files");
    minimizeWindow(a);
    expect(focusApp("files")).toBe(true);
    expect(shellStore.getWindow(a)?.minimized).toBe(false);
  });
});

describe("minimize / restore", () => {
  beforeEach(() => closeAll());

  it("toggles the minimized flag and restore re-focuses", () => {
    const a = openWindow("files", "Files");
    openWindow("notion", "DB"); // a no longer focused
    minimizeWindow(a);
    expect(shellStore.getWindow(a)?.minimized).toBe(true);
    restoreWindow(a);
    expect(shellStore.getWindow(a)?.minimized).toBe(false);
    expect(shellStore.getFocused()).toBe(a);
  });
});

describe("toggleMaximize", () => {
  beforeEach(() => closeAll());

  it("maximizes then restores the exact previous rect", () => {
    const a = openWindow("files", "Files", { w: 640, h: 480 });
    const before = { ...shellStore.getWindow(a)! };
    toggleMaximize(a);
    const max = shellStore.getWindow(a)!;
    expect(max.maximized).toBe(true);
    expect(max.w).toBeGreaterThan(before.w); // filled the work area
    toggleMaximize(a);
    const after = shellStore.getWindow(a)!;
    expect(after.maximized).toBe(false);
    expect({ x: after.x, y: after.y, w: after.w, h: after.h }).toEqual({ x: before.x, y: before.y, w: before.w, h: before.h });
    expect(after.prevRect).toBeUndefined();
  });
});

describe("closeWindow", () => {
  beforeEach(() => closeAll());

  it("removes the window and focuses the next in order", () => {
    const a = openWindow("files", "Files");
    const b = openWindow("notion", "DB");
    closeWindow(b);
    expect(shellStore.getWindow(b)).toBeUndefined();
    expect(shellStore.getOrder()).toEqual([a]);
    expect(shellStore.getFocused()).toBe(a);
  });

  it("sets focused to null after the last window closes", () => {
    const a = openWindow("files", "Files");
    closeWindow(a);
    expect(shellStore.getOrder()).toEqual([]);
    expect(shellStore.getFocused()).toBeNull();
  });
});

describe("exit animators defer close/minimize", () => {
  beforeEach(() => closeAll());

  it("closeWindow waits for the animator's done() before committing", () => {
    const a = openWindow("files", "Files");
    let finish!: () => void;
    const off = registerExitAnimator(a, (kind, done) => { expect(kind).toBe("close"); finish = done; });
    closeWindow(a);
    expect(shellStore.getWindow(a)).toBeDefined(); // frame still up — animating out
    finish();
    expect(shellStore.getWindow(a)).toBeUndefined();
    finish(); // double-commit guard: a second done() is a no-op
    off();
  });

  it("minimizeWindow defers the minimized flag until done()", () => {
    const a = openWindow("files", "Files");
    let finish!: () => void;
    const off = registerExitAnimator(a, (_kind, done) => { finish = done; });
    minimizeWindow(a);
    expect(shellStore.getWindow(a)?.minimized).toBe(false);
    finish();
    expect(shellStore.getWindow(a)?.minimized).toBe(true);
    off();
  });

  it("the hard fallback commits when the animator never calls done()", () => {
    vi.useFakeTimers();
    const a = openWindow("files", "Files");
    const off = registerExitAnimator(a, () => { /* wedged animator */ });
    closeWindow(a);
    expect(shellStore.getWindow(a)).toBeDefined();
    vi.advanceTimersByTime(400);
    expect(shellStore.getWindow(a)).toBeUndefined();
    off();
    vi.useRealTimers();
  });

  it("windows without an animator (mobile shells) still commit instantly", () => {
    const a = openWindow("files", "Files");
    minimizeWindow(a);
    expect(shellStore.getWindow(a)?.minimized).toBe(true);
    closeWindow(a);
    expect(shellStore.getWindow(a)).toBeUndefined();
  });
});

describe("move / resize leave the snap grid", () => {
  beforeEach(() => closeAll());

  it("clears snapZone on free move and on resize", () => {
    const a = openWindow("files", "Files");
    snapWindow(a, "left");
    expect(shellStore.getWindow(a)?.snapZone).toBe("left");
    moveWindow(a, 100, 100);
    expect(shellStore.getWindow(a)?.snapZone).toBeUndefined();

    snapWindow(a, "right");
    resizeWindow(a, 500, 400);
    expect(shellStore.getWindow(a)?.snapZone).toBeUndefined();
  });
});
