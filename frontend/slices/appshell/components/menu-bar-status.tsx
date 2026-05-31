"use client";

import { useEffect, useState } from "react";
import { Sun, Moon, Activity, Search, Sparkles } from "lucide-react";
import { useShellAppearance, useCpuPercent } from "../registry/capabilities";
import { toggleSpotlight, toggleInspector } from "../lib/store";

// Right cluster of the menu bar: cpu · spotlight · inspector · theme · clock.
export function StatusCluster() {
  const { theme, setTheme } = useShellAppearance();
  const cpu = useCpuPercent();
  const clock = useClock();

  return (
    <div className="ml-auto flex items-center gap-0.5 text-muted-foreground">
      {cpu != null && (
        <span className="flex items-center gap-1 rounded-md px-2 py-0.5 tabular-nums">
          <Activity className="size-3.5" />
          {cpu}%
        </span>
      )}
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
      <time className="px-1.5 font-semibold tabular-nums text-foreground">{clock}</time>
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
