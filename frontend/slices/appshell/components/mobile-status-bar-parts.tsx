"use client";
// Right-ear status glyphs — real iOS 17 renders FILLED shapes here, not
// outline strokes (phosphor's SignalHigh/Wifi/BatteryMedium read as a
// non-iOS "staircase" signal + hollow battery). Three tiny inline SVGs,
// fill/stroke=currentColor so they inherit the status bar's white. Split
// from mobile-status-bar.tsx to keep that file under 200 LOC.
import { useBattery } from "../hooks/use-battery";

export function StatusGlyphs() {
  const battery = useBattery();
  return (
    <span className="flex items-center gap-[7px]">
      <CellularGlyph />
      <WifiGlyph />
      <BatteryGlyph {...battery} />
    </span>
  );
}

// 4 bars of increasing height (~18x12) — full signal.
function CellularGlyph() {
  return (
    <svg viewBox="0 0 18 12" className="h-3 w-[18px]" fill="currentColor" aria-hidden>
      <rect x="0.5" y="7.5" width="3" height="4.5" rx="0.6" />
      <rect x="5" y="5.5" width="3" height="6.5" rx="0.6" />
      <rect x="9.5" y="3" width="3" height="9" rx="0.6" />
      <rect x="14" y="0.5" width="3" height="11.5" rx="0.6" />
    </svg>
  );
}

// Solid 3-arc glyph (~17x12) — thick rounded strokes read as filled bands,
// fanning up from a shared center below the viewBox.
function WifiGlyph() {
  return (
    <svg
      viewBox="0 0 17 12"
      className="h-3 w-[17px]"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      aria-hidden
    >
      <path d="M6.2 9.57A3 3 0 0 1 10.8 9.57" />
      <path d="M3.9 7.64A6 6 0 0 1 13.1 7.64" />
      <path d="M1.61 5.71A9 9 0 0 1 15.39 5.71" />
    </svg>
  );
}

// Rounded-rect outline + solid fill level + nub tip (~27x13). Shape/style is
// unchanged from the prior fidelity pass — only the fill width/color and the
// charging bolt are now real (live Battery API via useBattery(), P5 critic:
// "Battery and radio status are fake static glyphs"). Unsupported browsers
// (no navigator.getBattery — Firefox/Safari) fall back to the original static
// ~70% fill rather than inventing a fake live number.
const FILL_MAX_W = 17.6; // full-charge fill width, inside the outline's stroke
function BatteryGlyph({ level, charging, supported }: { level: number; charging: boolean; supported: boolean }) {
  const pct = supported ? Math.max(0, Math.min(1, level)) : 0.7;
  const low = supported && pct < 0.2 && !charging;
  return (
    <svg viewBox="0 0 27 13" className="h-[13px] w-[27px]" aria-hidden>
      <rect
        x="0.8"
        y="0.8"
        width="22.4"
        height="11.4"
        rx="2.6"
        fill="none"
        stroke="currentColor"
        strokeOpacity="0.5"
        strokeWidth="1.1"
      />
      <rect x="23.6" y="4.15" width="1.8" height="4.7" rx="1" fill="currentColor" />
      <rect
        x="2.6"
        y="2.6"
        width={pct * FILL_MAX_W}
        height="7.6"
        rx="1.3"
        fill={low ? "var(--destructive)" : "currentColor"}
      />
      {charging && <path d="M7.8 1.6 4.6 7.4 6.6 7.4 6 11.4 9.6 5.2 7.4 5.2Z" fill="var(--background)" />}
    </svg>
  );
}
