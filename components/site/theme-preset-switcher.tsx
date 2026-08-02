"use client";

import { useMemo, useState } from "react";
import { useTheme } from "next-themes";
import { ChevronDown, Palette, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import {
  DEFAULT_PRESET_NAME,
  useThemePreset,
} from "@/components/site/theme-preset-provider";
import { type ThemePresetItem } from "@/lib/theme/theme-presets";
import { groupPresets, type PresetGroup } from "@/lib/theme/preset-groups";
import { ModeSelector, type ModeId } from "@/components/site/theme-preset/mode-selector";
import { PresetList } from "@/components/site/theme-preset/preset-list";

interface ThemePresetSwitcherProps {
  size?: "sm" | "mobile";
  triggerClassName?: string;
}

export function ThemePresetSwitcher({
  size = "sm",
  triggerClassName,
}: ThemePresetSwitcherProps) {
  const { registry, presetName, setPreset, preview, restore } = useThemePreset();
  const { theme, setTheme } = useTheme();
  const [open, setOpen] = useState(false);

  const groups: PresetGroup<ThemePresetItem>[] = useMemo(() => {
    if (!registry) return [];
    return groupPresets(registry.items);
  }, [registry]);

  const presetCount = useMemo(
    () => groups.reduce((sum, g) => sum + g.items.length, 0),
    [groups],
  );

  const activeMode: ModeId =
    theme === "light" || theme === "dark" || theme === "system"
      ? theme
      : "system";

  const commit = (name: string) => {
    setPreset(name);
    setOpen(false);
  };

  const resetDefault = () => commit(DEFAULT_PRESET_NAME);

  return (
    <Popover
      open={open}
      onOpenChange={(next) => {
        if (!next) restore();
        setOpen(next);
      }}
    >
      <PopoverTrigger asChild>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          aria-label="Tema dan preset warna"
          className={cn(
            size === "mobile" && "h-11 w-11",
            "gap-1.5",
            triggerClassName,
          )}
        >
          <Palette className="h-4 w-4" />
          <ChevronDown
            className={cn(
              "h-3 w-3 transition-transform opacity-70",
              open && "rotate-180",
            )}
          />
        </Button>
      </PopoverTrigger>
      <PopoverContent
        align="end"
        sideOffset={8}
        collisionPadding={8}
        avoidCollisions
        className="flex h-[min(80vh,34rem)] w-[min(20rem,calc(100vw-1rem))] sm:w-80 flex-col p-0 overflow-hidden"
        onMouseLeave={() => restore()}
      >
        <ModeSelector activeMode={activeMode} setTheme={setTheme} />

        <div className="flex shrink-0 items-center justify-between border-b border-border px-3 py-2">
          <span className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
            Preset Warna{" "}
            <span className="font-normal text-muted-foreground/70">
              ({presetCount})
            </span>
          </span>
          <button
            type="button"
            onClick={resetDefault}
            onMouseEnter={() => preview(DEFAULT_PRESET_NAME)}
            onMouseLeave={() => restore()}
            className={cn(
              "flex items-center gap-1 rounded-md px-2 py-1 text-[11px] text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground",
              presetName === DEFAULT_PRESET_NAME && "text-foreground",
            )}
          >
            <RotateCcw className="h-3 w-3" />
            Default
          </button>
        </div>

        <PresetList
          groups={groups}
          presetName={presetName}
          commit={commit}
          preview={preview}
        />
      </PopoverContent>
    </Popover>
  );
}
