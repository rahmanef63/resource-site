import { describe, it, expect } from "vitest";
import {
  registerChromeKit,
  getChromeKit,
  chromeKitList,
  tokenPackToVars,
  motionToVars,
  registerBuiltinChromeKits,
  BUILTIN_CHROME_KITS,
  type ChromeKit,
  type MotionProfile,
} from "./chrome-kit";

const osKit = (id: string) => BUILTIN_CHROME_KITS.find((k) => k.id === id)!;

describe("chrome-kit registry", () => {
  it("registers, gets, and lists kits by id", () => {
    const before = chromeKitList().length;
    const kit: ChromeKit = {
      id: "macos",
      surface: "desktop",
      insets: { top: 30, bottom: 92 },
      layout: { kind: "windows", controls: "left-lights", launcher: "dock-magnify", menubar: "global-top" },
    };
    registerChromeKit(kit);
    expect(getChromeKit("macos")).toEqual(kit);
    expect(chromeKitList().length).toBeGreaterThanOrEqual(before);
  });

  it("re-registering the same id replaces (no duplicate)", () => {
    registerBuiltinChromeKits();
    const n = chromeKitList().length;
    registerBuiltinChromeKits(); // idempotent
    expect(chromeKitList().length).toBe(n);
  });

  it("seeds one kit per registered shell, each surface-correct", () => {
    registerBuiltinChromeKits();
    expect(BUILTIN_CHROME_KITS.map((k) => k.id).sort()).toEqual(
      ["android", "dashboard", "ios", "macos", "mobile", "windows"],
    );
    for (const k of BUILTIN_CHROME_KITS) {
      const expectSurface = ["ios", "android", "mobile"].includes(k.id) ? "mobile" : "desktop";
      expect(k.surface).toBe(expectSurface);
    }
  });

  it("macOS kit keeps the live chrome insets (TOPBAR 30 / DOCK_RESERVE 92)", () => {
    expect(osKit("macos").insets).toEqual({ top: 30, bottom: 92 });
  });

  it("self-registers builtins on import (getChromeKit works with no bootstrap call)", () => {
    expect(getChromeKit("ios")).toBeTruthy();
    expect(getChromeKit("android")).toBeTruthy();
    expect(getChromeKit("macos")).toBeTruthy();
  });

  it("android kit matches the verified live render (5-col Pixel home grid)", () => {
    expect(osKit("android").layout).toMatchObject({ kind: "home-grid", columns: 5 });
  });
});

describe("tokenPackToVars", () => {
  it("maps a partial token pack to the appshell CSS var names", () => {
    const vars = tokenPackToVars({
      radius: { window: "8px", icon: "20%", control: "6px" },
      glass: { enabled: 0, blur: "0px", saturate: "100%" },
      surface: { bar: "rgba(0,0,0,0.5)", menu: "x", window: "y", dock: "z" },
      font: { ui: "Segoe UI", mono: "Cascadia" },
    });
    expect(vars["--radius-win"]).toBe("8px");
    expect(vars["--radius-icon"]).toBe("20%");
    expect(vars["--radius-control"]).toBe("6px");
    expect(vars["--glass-enabled"]).toBe("0"); // flat skin: blur off
    expect(vars["--saturate"]).toBe("100%");
    expect(vars["--glass-bar"]).toBe("rgba(0,0,0,0.5)");
    expect(vars["--font-os"]).toBe("Segoe UI");
    expect(vars["--font-mono-os"]).toBe("Cascadia");
  });

  it("emits the P0 contract axes: popover shadow, accent, icon gloss/plate", () => {
    const vars = tokenPackToVars({
      shadow: { window: "0 0 1px black", popover: "0 8px 16px black" },
      accent: "#0078D4",
      icon: { gloss: 0, plate: 0 },
    });
    expect(vars["--shadow-win"]).toBe("0 0 1px black");
    expect(vars["--shadow-popover"]).toBe("0 8px 16px black");
    expect(vars["--os-accent"]).toBe("#0078D4");
    expect(vars["--icon-gloss"]).toBe("0"); // 0 must survive String() (no falsy drop)
    expect(vars["--icon-plate"]).toBe("0");
  });

  it("omits unset groups (only writes the vars it was given)", () => {
    const vars = tokenPackToVars({ radius: { window: "12px", icon: "22%", control: "8px" } });
    expect(Object.keys(vars)).toEqual(["--radius-win", "--radius-icon", "--radius-control"]);
  });

  it("merges motion vars when a MotionProfile is passed", () => {
    const motion: MotionProfile = {
      appOpen: { duration: "300ms", easing: "open-ease" },
      appClose: { duration: "250ms", easing: "close-ease" },
      windowSnap: { duration: "220ms", easing: "snap-ease" },
      page: { duration: "350ms", easing: "page-ease" },
      ease: { standard: "std", decelerate: "dec", spring: "spr" },
    };
    const vars = tokenPackToVars({ accent: "#0A82FF" }, motion);
    expect(vars["--os-accent"]).toBe("#0A82FF");
    expect(vars["--motion-open-dur"]).toBe("300ms");
    expect(vars["--motion-open-ease"]).toBe("open-ease");
    expect(vars["--motion-close-dur"]).toBe("250ms");
    expect(vars["--motion-close-ease"]).toBe("close-ease");
    expect(vars["--motion-snap-dur"]).toBe("220ms");
    expect(vars["--motion-snap-ease"]).toBe("snap-ease");
    expect(vars["--ease-standard"]).toBe("std");
    expect(vars["--ease-decel"]).toBe("dec");
    expect(vars["--ease-spring"]).toBe("spr");
  });

  it("motionToVars alone omits unset motion groups", () => {
    expect(motionToVars({ appOpen: { duration: "1ms", easing: "e" } })).toEqual({
      "--motion-open-dur": "1ms",
      "--motion-open-ease": "e",
    });
  });
});

describe("builtin kit fidelity data (P0)", () => {
  it.each(["macos", "windows", "ios", "android"])("%s kit ships motion + gestures + accent + icon axes", (id) => {
    const kit = osKit(id);
    expect(kit.motion?.appOpen?.duration).toBeTruthy();
    expect(kit.motion?.appClose?.easing).toBeTruthy();
    expect(kit.motion?.ease?.spring).toBeTruthy();
    expect(kit.gestures?.pressFeedback).toBeTruthy();
    expect(kit.tokens?.accent).toMatch(/^#/);
    expect(kit.tokens?.icon).toBeTruthy();
  });

  it("icon axes: macOS keeps gloss, others flat; only Windows drops the plate", () => {
    expect(osKit("macos").tokens?.icon).toEqual({ gloss: 1, plate: 1 });
    expect(osKit("ios").tokens?.icon).toEqual({ gloss: 0, plate: 1 });
    expect(osKit("windows").tokens?.icon).toEqual({ gloss: 0, plate: 0 });
    expect(osKit("android").tokens?.icon).toEqual({ gloss: 0, plate: 1 });
  });

  it("android icons round to the Pixel circle mask (radius.icon 50%)", () => {
    expect(osKit("android").tokens?.radius?.icon).toBe("50%");
  });

  it("windows carries the Fluent accent #0078D4 (not sky-500)", () => {
    expect(osKit("windows").tokens?.accent).toBe("#0078D4");
  });

  it("chrome font stacks resolve loaded fonts, not raw family names", () => {
    // Apple shells: SF-first (owner decision reversed 2026-07-02, chrome only).
    expect(osKit("macos").tokens?.font?.ui).toContain('"SF Pro Text"');
    expect(osKit("ios").tokens?.font?.ui).toContain("-apple-system");
    // next/font families are hash-named — stacks must go through the vars.
    expect(osKit("macos").tokens?.font?.ui).toContain("var(--font-inter");
    expect(osKit("windows").tokens?.font?.ui).toContain("var(--font-selawik");
    expect(osKit("android").tokens?.font?.ui).toContain("var(--font-roboto");
  });

  it("press feedback matches each OS (scale / highlight / ripple)", () => {
    expect(osKit("macos").gestures?.pressFeedback).toBe("scale");
    expect(osKit("windows").gestures?.pressFeedback).toBe("highlight");
    expect(osKit("ios").gestures?.pressFeedback).toBe("scale");
    expect(osKit("android").gestures?.pressFeedback).toBe("ripple");
  });
});
