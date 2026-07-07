"use client";

import { useEffect } from "react";
import {
  toggleSpotlight,
  setSpotlightOpen,
  toggleInspector,
  snapWindow,
  nextSnapZone,
  toggleMaximize,
  minimizeWindow,
  shellStore,
  retileSnapped,
} from "../lib/store";

// Re-tile snapped/maximized windows when the browser viewport resizes —
// without this a half-snapped window keeps its stale rect after a resize.
export function useViewportRetile() {
  useEffect(() => {
    let t: number | undefined;
    const onResize = () => {
      if (t) window.clearTimeout(t);
      t = window.setTimeout(retileSnapped, 150); // debounced — resize storms
    };
    window.addEventListener("resize", onResize);
    return () => {
      if (t) window.clearTimeout(t);
      window.removeEventListener("resize", onResize);
    };
  }, []);
}

// Spotlight: ⌘K / Ctrl+K (command-palette convention) OR ⌘Space / Ctrl+Space
// (the muscle-memory macOS Spotlight binding). ⌘Space can fire mid-typing, so
// it's ignored inside a text field. (On a native Mac the real OS grabs ⌘Space
// before the page sees it — harmless; ⌘K stays the reliable trigger there.)
export function useSpotlightHotkey() {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (!(e.metaKey || e.ctrlKey)) return;
      const isK = e.key.toLowerCase() === "k";
      const isSpace = e.code === "Space";
      if (!isK && !isSpace) return;
      if (isSpace) {
        const el = e.target as HTMLElement | null;
        if (el && (el.tagName === "INPUT" || el.tagName === "TEXTAREA" || el.isContentEditable)) return;
      }
      e.preventDefault();
      toggleSpotlight();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);
}

// ⌘I / Ctrl+I toggles the AI Inspector.
export function useInspectorHotkey() {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "i") {
        e.preventDefault();
        toggleInspector();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);
}

// ⌘/Ctrl + Arrow snaps the focused window: ←/→ half, ↑ maximize, ↓ restore or
// minimize. Skipped while typing in a field. Disabled on non-windowed shells
// (single-pane / mobile) so it never tiles a window the user can't see.
export function useWindowSnapKeys(enabled: boolean) {
  useEffect(() => {
    if (!enabled) return;
    const onKey = (e: KeyboardEvent) => {
      if (!(e.metaKey || e.ctrlKey)) return;
      if (!e.key.startsWith("Arrow")) return;
      const el = e.target as HTMLElement | null;
      if (el && (el.tagName === "INPUT" || el.tagName === "TEXTAREA" || el.isContentEditable)) return;
      const id = shellStore.getFocused();
      if (!id) return;
      const win = shellStore.getWindow(id);
      if (!win) return;
      e.preventDefault();
      switch (e.key) {
        // Repeated ⌘+←/→ cycles the column width: half → third → two-thirds.
        case "ArrowLeft": snapWindow(id, nextSnapZone("left", win.snapZone)); break;
        case "ArrowRight": snapWindow(id, nextSnapZone("right", win.snapZone)); break;
        case "ArrowUp": if (!win.maximized) toggleMaximize(id); break;
        case "ArrowDown": win.maximized ? toggleMaximize(id) : minimizeWindow(id); break;
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [enabled]);
}

// ⌥⌘Esc (Option+Cmd+Esc) opens Force Quit Applications — the macOS panel that
// lists open windows so one can be force-quit. preventDefault keeps Safari from
// running its own ⌥⌘Esc handler when the page has focus on a real Mac.
export function useForceQuitHotkey(onOpen: () => void) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.altKey && e.metaKey && (e.key === "Escape" || e.code === "Escape")) {
        e.preventDefault();
        setSpotlightOpen(false); // mutually exclusive with Spotlight — avoid a double key-dispatch
        onOpen();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onOpen]);
}

// F3 (or ⌘/Ctrl + Up is taken by maximize) opens Mission Control — the shared
// window overview. Local to the shell so switching shells drops the overlay.
export function useOverviewKey(open: () => void) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "F3") { e.preventDefault(); open(); }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);
}
