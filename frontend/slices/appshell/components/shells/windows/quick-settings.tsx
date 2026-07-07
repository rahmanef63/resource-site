"use client";
/* Windows 11 Quick Settings flyout — the panel Win11 opens from the taskbar tray
   cluster (network/sound/battery). Floats just above the taskbar, bottom-right.
   Toggles are wired to REAL shell actions where they exist (Night light → dark
   theme, Focus → focus mode); the connectivity pills (Wi-Fi/Bluetooth/Airplane)
   and the sliders are honest local state for a portfolio OS. Closes on Escape +
   outside-click, mirroring the Start menu's overlay pattern. */
import { useEffect, useState } from "react";
import { CaretRight as ChevronRight, WifiHigh as Wifi, Bluetooth, Airplane as Plane, Moon, CircleHalf as SunMoon, SpeakerHigh as Volume2, Sun, BatteryFull, BatteryMedium, BatteryLow, BatteryWarning, BatteryCharging, Gear as Settings, Power } from "@phosphor-icons/react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { useFocusMode, toggleFocusMode } from "@/features/appshell";
import { useAppearance, setTheme } from "@/lib/shared/appearance";
import { openWindow } from "../../../lib/store";
import { lock } from "../../../lib/lock";
import { useBattery } from "../../../hooks/use-battery";
import { useHudBezel } from "../../hud-bezel";
import { applyBrightness } from "./brightness";
import { ThemeQuickPicker } from "../../theme-quick-picker";

// Same phosphor battery family + thresholds the other status surfaces use (P5
// critic: "Battery and radio status are fake static glyphs"). Charging always
// wins its own bolt icon; falls back to the static "100%" this panel always
// showed when the Battery Status API is unsupported (Firefox/Safari).
// Returns a rendered element (not a component type) — selecting a component
// type into a PascalCase render-time variable trips react-hooks/static-components
// even when every branch is a stable, pre-existing reference.
function batteryIcon(pct: number, charging: boolean, className?: string) {
  if (charging) return <BatteryCharging className={className} />;
  if (pct < 0.2) return <BatteryWarning className={className} />;
  if (pct < 0.5) return <BatteryLow className={className} />;
  if (pct < 0.9) return <BatteryMedium className={className} />;
  return <BatteryFull className={className} />;
}

// Reads the brightness last applied to the viewport (a persistent DOM style
// write, untouched by this panel opening/closing) so a reopened panel shows
// the slider where the screen actually is instead of resetting to a stale 80.
function currentBrightness(): number {
  if (typeof document === "undefined") return 80;
  const v = parseFloat(document.documentElement.style.getPropertyValue("--os-brightness"));
  return Number.isFinite(v) && v > 0 ? Math.round(v * 100) : 80;
}

export function QuickSettings({ onClose }: { onClose: () => void }) {
  const a = useAppearance();
  const focus = useFocusMode();
  const dark = a.theme === "dark";
  // Cosmetic radios — a web OS has no real radio, so this is honest local state.
  const [wifi, setWifi] = useState(true);
  const [bt, setBt] = useState(false);
  const [airplane, setAirplane] = useState(false);
  const [volume, setVolume] = useState(60);
  const [brightness, setBrightness] = useState(currentBrightness);
  const { trigger: hud, hud: hudNode } = useHudBezel();
  const battery = useBattery();
  const batteryPct = battery.supported ? battery.level : 1;
  const batteryLow = battery.supported && batteryPct < 0.2 && !battery.charging;

  const onVolumeChange = (v: number) => { setVolume(v); hud(Volume2, v); };
  const onBrightnessChange = (v: number) => {
    const clamped = applyBrightness(v);
    setBrightness(clamped);
    hud(Sun, clamped);
  };

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  return (
    <>
      {hudNode}
      {/* Outside-click catcher (same trick as the Start menu). */}
      <div className="absolute inset-0 z-[59]" onClick={onClose} />
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Quick settings"
        className={cn(
          "material-menu",
          "animate-in fade-in-0 slide-in-from-bottom-2 [--tw-duration:200ms]",
          "absolute bottom-14 right-2 z-[61] w-[360px] max-w-[92vw] rounded-lg border border-border p-4 shadow-2xl",
        )}
      >
        <div className="grid grid-cols-3 gap-2">
          <Pill icon={Wifi} label="Wi-Fi" on={wifi} chevron onClick={() => setWifi((v) => !v)} />
          <Pill icon={Bluetooth} label="Bluetooth" on={bt} chevron onClick={() => setBt((v) => !v)} />
          <Pill icon={Plane} label="Airplane" on={airplane} onClick={() => setAirplane((v) => !v)} />
          <Pill icon={Moon} label="Focus" on={focus} onClick={toggleFocusMode} />
          <Pill icon={SunMoon} label="Night light" on={dark} onClick={() => setTheme(dark ? "light" : "dark")} />
        </div>

        <Slider icon={Volume2} label="Volume" value={volume} onChange={onVolumeChange} />
        <Slider icon={Sun} label="Brightness" value={brightness} onChange={onBrightnessChange} />

        <div className="mt-4 flex items-center justify-between border-t border-border pt-3 text-muted-foreground">
          <span className={cn("flex items-center gap-1.5 text-xs", batteryLow && "text-destructive")}>
            {batteryIcon(batteryPct, battery.charging, "size-4")} {Math.round(batteryPct * 100)}%
          </span>
          <div className="flex items-center gap-1">
            <ThemeQuickPicker className="size-8" />
            {/* Settings opens the real settings app; Power runs the real lock()
                curtain (start-menu uses the same). Both then dismiss the flyout. */}
            <IconButton icon={Settings} label="Settings" onClick={() => { openWindow("settings", "Settings"); onClose(); }} />
            <IconButton icon={Power} label="Power" onClick={() => { lock(); onClose(); }} />
          </div>
        </div>
      </div>
    </>
  );
}

// Quick-toggle tile — Win11: a 48px-tall 4px-radius button with a centered
// icon, accent-filled when on; the label sits BELOW the tile, not inside it.
// Wi-Fi/Bluetooth carry a chevron affordance hinting they expand (the
// expansion itself is a stretch goal — the glyph alone reads as "more").
function Pill({ icon: Icon, label, on, chevron, onClick }: { icon: typeof Wifi; label: string; on: boolean; chevron?: boolean; onClick: () => void }) {
  return (
    <div className="flex flex-col items-center gap-1">
      <Button
        variant="ghost"
        onClick={onClick}
        aria-pressed={on}
        aria-label={label}
        className={cn(
          "relative h-12 w-full rounded-[4px] p-0 transition-colors",
          on ? "bg-[var(--os-accent)] text-white hover:bg-[var(--os-accent)]/90" : "bg-muted text-foreground hover:bg-muted/70",
        )}
      >
        <Icon className={cn("size-5", on && "text-white")} />
        {chevron && (
          <ChevronRight className={cn("absolute right-1 top-1 size-3", on ? "text-white/70" : "text-muted-foreground")} aria-hidden />
        )}
      </Button>
      <span className="w-full truncate text-center text-[11px] leading-tight text-muted-foreground">{label}</span>
    </div>
  );
}

// Native range slider (no slider lib) — track follows var(--primary); the thumb
// is restyled once here (Tailwind arbitrary pseudo-element variants) into a
// round accent knob with a small white inner ring, replacing the OS default.
const THUMB =
  "[&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:mt-[-7px] [&::-webkit-slider-thumb]:size-[18px] [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-[var(--os-accent)] [&::-webkit-slider-thumb]:shadow-[inset_0_0_0_3px_white] " +
  "[&::-moz-range-thumb]:appearance-none [&::-moz-range-thumb]:size-[18px] [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:border-0 [&::-moz-range-thumb]:bg-[var(--os-accent)] [&::-moz-range-thumb]:shadow-[inset_0_0_0_3px_white]";
function Slider({ icon: Icon, label, value, onChange }: { icon: typeof Sun; label: string; value: number; onChange: (v: number) => void }) {
  return (
    <label className="mt-3 flex items-center gap-3" aria-label={label}>
      <Icon className="size-4 shrink-0 text-muted-foreground" />
      <input
        type="range"
        min={0}
        max={100}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className={cn("h-1 w-full cursor-pointer appearance-none rounded-full bg-muted", THUMB)}
      />
    </label>
  );
}

function IconButton({ icon: Icon, label, onClick }: { icon: typeof Settings; label: string; onClick: () => void }) {
  return (
    <button onClick={onClick} aria-label={label} title={label} className="grid size-8 place-items-center rounded-md hover:bg-muted">
      <Icon className="size-4" />
    </button>
  );
}
