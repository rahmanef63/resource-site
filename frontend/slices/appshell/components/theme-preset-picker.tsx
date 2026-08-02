"use client";
/* Theme-preset picker (Settings → Theme preset, and the toolbar quick-picker —
   see theme-quick-picker.tsx). Ported from os-vps's compact theme section:
   grouped tweakcn presets as swatch chips, lazy registry load (the ~240KB
   JSON only fetches when this section mounts). Picking a preset rethemes
   palette + window chrome + typeface in one shot (lib/theme-presets);
   "Stock" restores the shipped neutral palette. Lives in appshell (not
   components/apps) so both the Settings app AND every shell's own toolbar
   picker can import it without the app layer depending on appshell, or vice
   versa, twice. */
import { useEffect, useState } from "react";
import { setPreset, useAppearance } from "@/lib/shared/appearance";
import {
  loadPresetRegistry,
  groupPresets,
  presetSwatches,
  type PresetGroup,
  type PresetItem,
} from "@/lib/shared/theme-presets";

export function ThemePresetPicker() {
  const { preset } = useAppearance();
  const [groups, setGroups] = useState<PresetGroup[] | null>(null);

  useEffect(() => {
    let live = true;
    void loadPresetRegistry().then((r) => {
      if (live) setGroups(groupPresets(r.items));
    });
    return () => { live = false; };
  }, []);

  if (!groups) {
    return <p className="text-xs text-muted-foreground">Loading presets…</p>;
  }

  return (
    <div className="flex flex-col gap-3">
      <PresetChip
        active={preset === null}
        title="Stock"
        swatches={["#ffffff", "#171717", "#171717", "#f5f5f5", "#e7000b"]}
        onClick={() => setPreset(null)}
      />
      {groups.map((g) => (
        <div key={g.id}>
          <p className="mb-1.5 text-[11px] text-muted-foreground">{g.label}</p>
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
            {g.items.map((p) => (
              <PresetChip
                key={p.name}
                active={preset === p.name}
                title={p.title}
                swatches={presetSwatches(p)}
                onClick={() => setPreset(p.name)}
                item={p}
              />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

function PresetChip({ active, title, swatches, onClick, item }: {
  active: boolean;
  title: string;
  swatches: string[];
  onClick: () => void;
  item?: PresetItem;
}) {
  return (
    <button
      onClick={onClick}
      title={item?.description ?? title}
      className={`flex items-center gap-2 rounded-lg border px-2.5 py-2 text-left text-xs font-medium ${
        active ? "border-primary bg-primary/5 ring-1 ring-primary" : "border-border hover:bg-muted"
      }`}
    >
      <span className="flex shrink-0 -space-x-1">
        {swatches.map((c, i) => (
          <span
            key={i}
            className="size-3.5 rounded-full ring-1 ring-border"
            style={{ background: c }}
          />
        ))}
      </span>
      <span className="truncate">{title}</span>
    </button>
  );
}
