"use client";

import { useEffect, useState } from "react";
import { Sun, Moon, MagnifyingGlass as Search, Sparkle as Sparkles } from "@phosphor-icons/react";
import { useShellAppearance } from "../registry/capabilities";
import { toggleSpotlight, toggleInspector, toggleNotificationCenter } from "../lib/store";
import { useNotifications } from "../lib/toast";
import { Slot } from "../registry/feature-registry";
import { ThemeQuickPicker } from "./theme-quick-picker";

// Right cluster of the menu bar: spotlight · inspector · theme · clock.
export function StatusCluster() {
  const { theme, setTheme } = useShellAppearance();
  const clock = useClock();
  const unread = useNotifications().some((n) => !n.read);

  return (
    <div className="ml-auto flex items-center gap-0.5 text-muted-foreground">
      <button
        aria-label="Spotlight (⌘K)"
        onClick={toggleSpotlight}
        className="grid size-6 place-items-center rounded-md hover:bg-[var(--hover-strong)]"
      >
        <Search className="size-4" />
      </button>
      <button
        aria-label="AI Inspector (⌘I)"
        onClick={toggleInspector}
        className="grid size-6 place-items-center rounded-md hover:bg-[var(--hover-strong)]"
      >
        <Sparkles className="size-4" />
      </button>
      <button
        aria-label="Toggle theme"
        onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
        className="grid size-6 place-items-center rounded-md hover:bg-[var(--hover-strong)]"
      >
        {theme === "dark" ? <Moon className="size-4" /> : <Sun className="size-4" />}
      </button>
      <ThemeQuickPicker />
      {/* Host-contributed trailing items (e.g. macOS Control Center). */}
      <Slot region="menuBarStatus" />
      {/* Clock → Notification Center; dot = unread. */}
      <button
        aria-label="Notification Center"
        onClick={toggleNotificationCenter}
        className="relative flex items-center rounded-md px-1.5 py-0.5 font-semibold tabular-nums text-foreground hover:bg-[var(--hover-strong)]"
      >
        {clock}
        {unread && <span className="absolute right-0.5 top-0.5 size-1.5 rounded-full bg-primary" />}
      </button>
    </div>
  );
}

function useClock() {
  const [now, setNow] = useState("");
  useEffect(() => {
    const tick = () =>
      setNow(
        new Date().toLocaleDateString([], { weekday: "short", month: "short", day: "numeric" }) +
          "  " +
          new Date().toLocaleTimeString([], { hour: "numeric", minute: "2-digit" }),
      );
    tick();
    const t = setInterval(tick, 20000);
    return () => clearInterval(t);
  }, []);
  return now;
}
