"use client";
/* System tray + clock — split out of taskbar-buttons.tsx (200-LOC gate).
   Re-exported from there so taskbar.tsx's import path is unchanged. */
import { useEffect, useState } from "react";
import { WifiHigh as Wifi, SpeakerHigh as Volume2, BatteryFull, BatteryMedium, BatteryLow, BatteryWarning, BatteryCharging } from "@phosphor-icons/react";
import { cn } from "@/lib/utils";
import { useNotifications } from "../../../lib/toast";
import { useBattery } from "../../../hooks/use-battery";

// System tray cluster — network/sound/battery glyphs as one button toggling the
// Quick Settings flyout (Win11: clicking the tray opens it). Battery is now
// the real navigator.getBattery() reading (same phosphor family, level-picked
// member + charging bolt) — falls back to the full glyph when unsupported,
// same static story Quick Settings' own footer already told (P5 critic:
// "Battery and radio status are fake static glyphs").
export function SystemTray({ open, onClick }: { open: boolean; onClick: () => void }) {
  const battery = useBattery();
  const pct = battery.supported ? battery.level : 1;
  const low = battery.supported && pct < 0.2 && !battery.charging;
  const BatteryIcon = battery.charging
    ? BatteryCharging
    : pct < 0.2
      ? BatteryWarning
      : pct < 0.5
        ? BatteryLow
        : pct < 0.9
          ? BatteryMedium
          : BatteryFull;
  return (
    <button
      onClick={onClick}
      aria-label="Quick Settings"
      title="Network, Sound, Battery"
      className={`flex h-9 items-center gap-2 rounded-md px-2 hover:bg-muted ${open ? "bg-muted" : ""}`}
    >
      <Wifi className="size-5" />
      <Volume2 className="size-5" />
      <BatteryIcon className={cn("size-5", low && "text-destructive")} />
    </button>
  );
}

// Clock block — clicking it toggles the Action Center (Win11: date/time opens notifications).
export function Clock({ open, onClick }: { open: boolean; onClick: () => void }) {
  const [now, setNow] = useState(() => new Date());
  const unread = useNotifications().some((n) => !n.read); // Win11 clock shows an unread bubble
  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 30000);
    return () => clearInterval(t);
  }, []);
  return (
    <button
      onClick={onClick}
      aria-label="Notifications"
      title="Notifications"
      className={`relative flex h-9 flex-col items-end rounded-md px-2 text-[11px] leading-tight text-muted-foreground hover:bg-muted ${open ? "bg-muted" : ""}`}
    >
      {unread && <span className="absolute right-1 top-1 size-1.5 rounded-full bg-primary" />}
      <span>{now.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</span>
      <span>{now.toLocaleDateString([], { day: "2-digit", month: "2-digit", year: "numeric" })}</span>
    </button>
  );
}
