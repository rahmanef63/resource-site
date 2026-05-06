"use client";

import { useEffect, useRef, useState } from "react";
import { useTheme } from "next-themes";
import { Palette, ChevronDown, RotateCcw } from "lucide-react";
import {
  applyPreset,
  getSavedPreset,
  listPresetsFull,
  presetSwatches,
  previewPreset,
  restoreSavedPreset,
  type PresetFull,
} from "@/shared/lib/theme-presets";
import { groupPresets } from "@/shared/lib/preset-groups";
import { cn } from "@/shared/lib/cn";

type Group = {
  id: string;
  label: string;
  items: { name: string; title: string; full: PresetFull }[];
};

export function ThemePresetSwitcher({ className = "" }: { className?: string }) {
  const [open, setOpen] = useState(false);
  const [groups, setGroups] = useState<Group[]>([]);
  const [current, setCurrent] = useState<string | null>(null);
  const ref = useRef<HTMLDivElement>(null);
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === "dark";

  useEffect(() => {
    setCurrent(getSavedPreset());
    listPresetsFull().then((full) => {
      const byName = new Map(full.map((f) => [f.name, f]));
      const g = groupPresets(full.map((f) => ({ name: f.name, title: f.title })));
      setGroups(
        g.map((grp) => ({
          id: grp.id,
          label: grp.label,
          items: grp.items.map((it) => ({
            name: it.name,
            title: it.title,
            full: byName.get(it.name)!,
          })),
        })),
      );
    }).catch(() => {});
  }, []);

  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
        void restoreSavedPreset();
      }
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setOpen(false);
        void restoreSavedPreset();
      }
    };
    document.addEventListener("mousedown", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const commit = async (name: string | null) => {
    await applyPreset(name);
    setCurrent(name);
    setOpen(false);
  };

  return (
    <div ref={ref} className={cn("relative", className)}>
      <button
        type="button"
        aria-label="Theme preset"
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-1 h-10 px-3 border-2 border-foreground rounded-md hover:bg-foreground hover:text-background transition-colors"
      >
        <Palette className="w-4 h-4" />
        <ChevronDown className={cn("w-3 h-3 transition-transform", open && "rotate-180")} />
      </button>
      {open && (
        <div
          className="absolute right-0 top-full mt-1 w-72 max-h-[28rem] overflow-y-auto border-2 border-foreground rounded-md shadow-md bg-background z-50"
          onMouseLeave={() => void restoreSavedPreset()}
        >
          <button
            type="button"
            onClick={() => commit(null)}
            onMouseEnter={() => void previewPreset(null)}
            className={cn(
              "flex w-full items-center justify-between gap-2 px-3 py-2 text-[11px] uppercase tracking-brutal-sm border-b-2 border-foreground hover:bg-foreground hover:text-background transition-colors",
              current === null && "bg-foreground text-background",
            )}
          >
            <span className="flex items-center gap-2">
              <RotateCcw className="w-3 h-3" />
              Default · Neo Brutalism
            </span>
          </button>
          {groups.map((grp) => (
            <div key={grp.id}>
              <div className="sticky top-0 bg-muted/80 backdrop-blur border-b border-foreground/30 px-3 py-1 text-[9px] uppercase tracking-brutal-sm font-medium text-muted-foreground">
                {grp.label}
              </div>
              {grp.items.map((p) => (
                <button
                  key={p.name}
                  type="button"
                  onClick={() => commit(p.name)}
                  onMouseEnter={() => void previewPreset(p.name)}
                  className={cn(
                    "flex w-full items-center justify-between gap-2 px-3 py-2 text-[11px] uppercase tracking-brutal-sm border-b border-foreground/15 hover:bg-foreground hover:text-background transition-colors",
                    current === p.name && "bg-foreground text-background",
                  )}
                >
                  <span className="flex-1 text-left truncate">{p.title}</span>
                  <Swatches preset={p.full} isDark={isDark} />
                </button>
              ))}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function Swatches({ preset, isDark = false }: { preset: PresetFull; isDark?: boolean }) {
  const colors = presetSwatches(preset, isDark);
  return (
    <span className="flex items-center gap-0.5 shrink-0">
      {colors.map((c, i) => (
        <span
          key={i}
          style={{ background: c }}
          className="block h-3 w-3 rounded-full border border-current/30"
          aria-hidden="true"
        />
      ))}
    </span>
  );
}
