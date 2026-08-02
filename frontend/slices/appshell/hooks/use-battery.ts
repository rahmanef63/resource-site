"use client";

/* useBattery — thin wrapper around the (Chromium-only) Battery Status API
 * (`navigator.getBattery()`). P5 critic item: "Battery and radio status are
 * fake static glyphs — no live Battery API" — every status bar/tray battery
 * glyph in the OS currently renders a hardcoded level.
 *
 * CONTRACT (consumed independently by other agents/files — keep this shape
 * stable):
 *   useBattery(): { level: number; charging: boolean; supported: boolean }
 *   - level     — 0..1 fraction charged (0.82 === 82%). Meaningless when
 *                 `supported` is false; callers must not render it then.
 *   - charging  — true while plugged in and charging.
 *   - supported — false on any browser without navigator.getBattery
 *                 (Firefox, Safari, most WebViews) and during SSR/first
 *                 paint before the promise resolves. Callers MUST check this
 *                 and keep their own static fallback glyph/level when false
 *                 — this hook never invents a fake reading.
 *
 * Live-updates via the BatteryManager's own `levelchange`/`chargingchange`
 * events for as long as the component stays mounted — no polling.
 */
import { useEffect, useState } from "react";

export type BatteryState = { level: number; charging: boolean; supported: boolean };

const UNSUPPORTED: BatteryState = { level: 1, charging: false, supported: false };

// Minimal shape of the non-standard Battery Status API — not in lib.dom.d.ts.
type BatteryManager = {
  level: number;
  charging: boolean;
  addEventListener(type: "levelchange" | "chargingchange", listener: () => void): void;
  removeEventListener(type: "levelchange" | "chargingchange", listener: () => void): void;
};
type NavigatorWithBattery = Navigator & { getBattery?: () => Promise<BatteryManager> };

export function useBattery(): BatteryState {
  const [state, setState] = useState<BatteryState>(UNSUPPORTED);

  useEffect(() => {
    const getBattery = (navigator as NavigatorWithBattery).getBattery;
    if (!getBattery) return; // stays UNSUPPORTED — caller keeps its static fallback

    let battery: BatteryManager | null = null;
    let alive = true;
    const sync = () => {
      if (!battery || !alive) return;
      setState({ level: battery.level, charging: battery.charging, supported: true });
    };

    getBattery.call(navigator).then((b) => {
      if (!alive) return;
      battery = b;
      sync();
      b.addEventListener("levelchange", sync);
      b.addEventListener("chargingchange", sync);
    });

    return () => {
      alive = false;
      battery?.removeEventListener("levelchange", sync);
      battery?.removeEventListener("chargingchange", sync);
    };
  }, []);

  return state;
}
