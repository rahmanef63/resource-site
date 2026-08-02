"use client";
/* Android notification shade + Quick Settings tiles — split out of
   android-shell-parts.tsx to keep every file <=200 LOC and give P4 fidelity
   work (android-qs-pill-tiles, android-shade-header-footer) a clean,
   single-owner file. Tile grid lives in android-shade-tiles.tsx. */
import { useEffect, useState } from "react";
import { WifiHigh as Wifi, Bluetooth, Moon, CircleHalf as SunMoon, Flashlight, Airplane as Plane, ArrowClockwise as RotateCw, Sun, Gear as Settings, Power, Pencil, X } from "@phosphor-icons/react";
import { Button } from "@/components/ui/button";
import { useNotifications, dismissNotification, clearNotifications, markNotificationsRead } from "../../../lib/toast";
import { openWindow } from "../../../lib/store";
import { lock } from "../../../lib/lock";
import { TONE_DOT } from "../../notif-shared";
import { useFocusMode, toggleFocusMode } from "@/features/appshell";
import { useAppearance, setTheme } from "@/lib/shared/appearance";
import { Clock } from "./android-shell-parts";
import { QsGrid, type QsTile } from "./android-shade-tiles";
import { ThemeQuickPicker } from "../../theme-quick-picker";

// Genuinely-cosmetic radios — a browser OS has no real radio, so honest local
// state. The wired tiles (Do Not Disturb, Dark) are prepended below so they
// land in the default-visible 2x2 alongside Wi-Fi.
const COSMETIC_TILES = [
  { id: "wifi", label: "Wi-Fi", icon: Wifi, on: true },
  { id: "bt", label: "Bluetooth", icon: Bluetooth, on: true },
  { id: "flash", label: "Flashlight", icon: Flashlight, on: false },
  { id: "plane", label: "Airplane", icon: Plane, on: false },
  { id: "rotate", label: "Auto-rotate", icon: RotateCw, on: true },
];

function ShadeIconButton({ icon: Icon, label, onClick, small }: { icon: typeof Settings; label: string; onClick: () => void; small?: boolean }) {
  return (
    <Button
      variant="ghost"
      size="icon"
      aria-label={label}
      title={label}
      onClick={onClick}
      className={small ? "size-8 rounded-full text-[var(--os-accent)] hover:bg-muted" : "size-9 rounded-full text-[var(--os-accent)] hover:bg-muted"}
    >
      <Icon className="size-4" />
    </Button>
  );
}

export function Shade({ onClose }: { onClose: () => void }) {
  // Wired tiles reflect REAL shell state, same actions as windows/quick-settings:
  // Do Not Disturb → focus mode, Dark → theme. The rest stay cosmetic.
  const focus = useFocusMode();
  const dark = useAppearance().theme === "dark";
  const [on, setOn] = useState<Record<string, boolean>>(() => Object.fromEntries(COSMETIC_TILES.map((t) => [t.id, t.on])));
  // Real Android pull-down = quick-settings tiles + the notification list (same
  // persistent log iOS reads). Opening the shade marks them seen, like iOS NC.
  const notifs = useNotifications();
  useEffect(() => { markNotificationsRead(); }, []);

  const tiles: QsTile[] = [
    { id: "dnd", label: "Do Not Disturb", icon: Moon, on: focus, onClick: toggleFocusMode },
    { id: "dark", label: "Dark mode", icon: SunMoon, on: dark, onClick: () => setTheme(dark ? "light" : "dark") },
    ...COSMETIC_TILES.map((t) => ({ ...t, on: on[t.id], onClick: () => setOn((s) => ({ ...s, [t.id]: !s[t.id] })) })),
  ];

  const openSettings = () => { openWindow("settings", "Settings"); onClose(); };
  const powerOff = () => { lock(); onClose(); };

  return (
    <div className="absolute inset-0 z-[40] bg-black/30" onClick={onClose}>
      <div className="max-h-[92%] overflow-y-auto rounded-b-3xl border-b border-border bg-card/95 p-4 shadow-xl backdrop-blur-xl [animation:ccDrop_.4s_cubic-bezier(.05,.7,.1,1)] [scrollbar-width:none]" onClick={(e) => e.stopPropagation()}>
        {/* Header: big clock + date left (Google-Sans-ish), settings/power right.
            No X — the backdrop's onClick above (tap-outside) closes the shade,
            same as swipe-up would. */}
        <div className="mb-3 flex items-start justify-between gap-3">
          <div className="min-w-0">
            <div className="text-4xl font-normal leading-none tracking-tight"><Clock mode="time" /></div>
            <div className="mt-1"><Clock mode="date" /></div>
          </div>
          <div className="flex shrink-0 items-center gap-1 pt-1">
            <ThemeQuickPicker className="size-9 rounded-full text-muted-foreground hover:bg-muted" />
            <ShadeIconButton icon={Settings} label="Settings" onClick={openSettings} />
            <ShadeIconButton icon={Power} label="Power" onClick={powerOff} />
          </div>
        </div>

        <QsGrid tiles={tiles} />

        <div className="mt-3 flex items-center gap-3">
          <Sun className="size-4 text-muted-foreground" />
          <input type="range" defaultValue={70} className="w-full accent-primary" aria-label="Brightness" />
        </div>

        {notifs.length > 0 && (
          <div className="mt-4">
            <div className="mb-1.5 px-1 text-[11px] font-medium text-muted-foreground">Notifications</div>
            <div className="flex flex-col gap-1.5">
              {notifs.map((n) => (
                <div key={n.id} className="flex items-start gap-2.5 rounded-2xl bg-muted/60 p-3">
                  <span className={`mt-1 size-2 shrink-0 rounded-full ${TONE_DOT[n.tone]}`} />
                  <div className="min-w-0 flex-1">
                    <div className="line-clamp-2 text-[13px] font-medium">{n.message}</div>
                    {n.action && (
                      <button
                        onClick={() => { n.action?.onClick(); dismissNotification(n.id); }}
                        className="mt-1.5 rounded-lg bg-primary/15 px-2.5 py-1 text-xs font-medium text-primary"
                      >
                        {n.action.label}
                      </button>
                    )}
                  </div>
                  <button aria-label="Dismiss" onClick={() => dismissNotification(n.id)} className="rounded-full p-1 text-muted-foreground hover:bg-muted">
                    <X className="size-3" />
                  </button>
                </div>
              ))}
            </div>
            <Button variant="ghost" onClick={clearNotifications} className="mx-auto mt-2 flex h-7 rounded-full px-4 text-xs text-muted-foreground hover:bg-muted">
              Clear all
            </Button>
          </div>
        )}

        {/* Footer: pinned below the list — edit tiles / power / settings, small
            ghost icon buttons, mirroring Android 14's shade footer row. Edit
            tiles is a real Android feature (reorder/add QS tiles) this portfolio
            OS has no tile-editor for, so it's inert like the cosmetic radios
            above — present for anatomy, not wired to a fake action. */}
        <div className="mt-4 flex items-center justify-end gap-1 border-t border-border pt-3">
          <ShadeIconButton icon={Pencil} label="Edit tiles" onClick={() => {}} small />
          <ShadeIconButton icon={Power} label="Power" onClick={powerOff} small />
          <ShadeIconButton icon={Settings} label="Settings" onClick={openSettings} small />
        </div>

        <div className="mx-auto mt-3 h-1 w-10 rounded-full bg-foreground/20" />
      </div>
    </div>
  );
}
