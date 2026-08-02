"use client";

import { Moon, MoonStars as MoonStar, Sun, HardDrive as Server, Cloud, Sparkle as Sparkles, Stack as Layers, MagnifyingGlass as Search, type Icon } from "@phosphor-icons/react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  useWindowOrder,
  closeAll,
  toggleInspector,
  toggleSpotlight,
  useShellUI,
  useShellAppearance,
  useServerToggle,
  useFocusMode,
  toggleFocusMode,
} from "@/features/appshell";
import { ThemeQuickPicker } from "@/features/appshell/components/theme-quick-picker";

// iOS Control Center — a FULL-SCREEN frost overlay (real iOS: the wallpaper
// stays visible under heavy frost; the sheet-of-list-rows look is wrong).
// Modules are re-laid as two shapes (Module, below): 1x1 circular toggles and
// 2x2 square toggles, each with its label BELOW the glyph. Only REAL toggles
// (this is a web app: no wifi/cellular/battery/brightness to fake). Appearance
// + the optional server toggle come from the shell capabilities so this stays
// a single source of truth. Open state is owned by the mobile surface and read
// via the shell-UI context — this component only re-skins presentation.
//
// `dragProgress` (0–1, optional): a future 1:1 pull-down gesture can drive the
// panel in while dragging by passing the live progress; the panel scales/fades
// with it instead of playing the canned open animation. Omit it (the default,
// today's only caller) and the panel falls back to the existing instant
// open + appOpen-keyframe presentation.
export function ControlCenter({ dragProgress }: { dragProgress?: number }) {
  const { controlCenterOpen: open, setControlCenterOpen: onOpenChange } = useShellUI();
  const { theme, setTheme } = useShellAppearance();
  const server = useServerToggle();
  const focus = useFocusMode();
  const openCount = useWindowOrder().length;
  const dark = theme === "dark";
  const close = () => onOpenChange(false);

  const dragging = dragProgress !== undefined;
  if (!open && !dragging) return null;

  return (
    <div
      onClick={close}
      style={{
        background: "rgba(10,12,24,.32)",
        backdropFilter: "blur(50px) saturate(180%)",
        WebkitBackdropFilter: "blur(50px) saturate(180%)",
        ...(dragProgress !== undefined && {
          opacity: dragProgress,
          transform: `scale(${0.94 + dragProgress * 0.06})`,
        }),
      }}
      className={cn(
        "absolute inset-0 z-[40] flex flex-col",
        !dragging && "[animation:appOpen_.22s_cubic-bezier(.2,.8,.2,1)]",
      )}
    >
      <div className="h-12 shrink-0" />
      <div
        onClick={(e) => e.stopPropagation()}
        className="mx-auto grid w-full max-w-[320px] grid-cols-2 gap-3 px-4 pt-2"
      >
        <Module
          shape="square"
          icon={dark ? Moon : Sun}
          label={dark ? "Dark" : "Light"}
          on={dark}
          onClick={() => setTheme(dark ? "light" : "dark")}
        />
        {server && (
          <Module
            shape="square"
            icon={server.live ? Cloud : Server}
            label={server.label}
            on={server.live}
            disabled={server.locked}
            onClick={server.toggle}
          />
        )}
        <Module shape="square" icon={MoonStar} label="Focus" on={focus} onClick={toggleFocusMode} />
        <Module
          shape="square"
          icon={Layers}
          label={openCount ? "Close All" : "Windows"}
          disabled={openCount === 0}
          onClick={() => {
            closeAll();
            close();
          }}
        />
      </div>
      <div onClick={(e) => e.stopPropagation()} className="mx-auto flex w-full max-w-[320px] justify-center gap-10 px-4 pt-6">
        <Module
          shape="circle"
          icon={Search}
          label="Search"
          onClick={() => {
            close();
            toggleSpotlight();
          }}
        />
        <Module
          shape="circle"
          icon={Sparkles}
          label="Assistant"
          onClick={() => {
            close();
            toggleInspector();
          }}
        />
        <div className="flex flex-col items-center gap-1.5">
          <ThemeQuickPicker
            align="center"
            className="press-scale grid size-[62px] place-items-center rounded-full bg-white/15 text-white hover:bg-white/15 [&_svg]:size-[22px]"
          />
          <span className="max-w-[74px] truncate text-center text-[12px] font-medium text-white/90">Theme</span>
        </div>
      </div>
    </div>
  );
}

function Module({
  shape,
  icon: Icon,
  label,
  on = false,
  disabled = false,
  onClick,
}: {
  shape: "circle" | "square";
  icon: Icon;
  label: string;
  on?: boolean;
  disabled?: boolean;
  onClick: () => void;
}) {
  return (
    <div className="flex flex-col items-center gap-1.5">
      <Button
        type="button"
        variant="ghost"
        disabled={disabled}
        onClick={onClick}
        aria-label={label}
        aria-pressed={on}
        className={cn(
          "press-scale grid place-items-center border-0 p-0 shadow-none disabled:opacity-40",
          shape === "circle"
            ? cn(
                "size-[62px] rounded-full [&_svg]:size-[22px]",
                on
                  ? "bg-white text-black hover:bg-white hover:text-black"
                  : "bg-white/15 text-white hover:bg-white/15 hover:text-white",
              )
            : cn(
                "aspect-square w-full rounded-[19px] [&_svg]:size-5",
                on
                  ? "bg-[var(--os-accent)] text-white hover:bg-[var(--os-accent)] hover:text-white"
                  : "bg-white/15 text-white hover:bg-white/15 hover:text-white",
              ),
        )}
      >
        <Icon className="text-inherit" />
      </Button>
      <span className="max-w-[74px] truncate text-center text-[12px] font-medium text-white/90">{label}</span>
    </div>
  );
}
