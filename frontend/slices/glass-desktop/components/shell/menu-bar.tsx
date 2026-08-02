"use client";
// glass-desktop — MenuBar (Build Plan §5). Top chrome bar: glass fill, bottom
// hairline, fixed MENUBAR_H. Left = Lucent diamond glyph + brand + a "Widgets"
// dropdown (edit-layout toggle, add widget, reset layout). Right = the live
// clock (shared minute channel) plus a couple of status glyphs. Fictional
// Lucent identity only — no Apple menu names, no traffic-light controls.
import type { ReactNode } from "react";
import { Wifi, BatteryMedium } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuCheckboxItem,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import { MENUBAR_H } from "@/features/glass-desktop/config/constants";
import { useClock } from "@/features/glass-desktop/hooks/use-clock";
import { useMounted } from "@/features/glass-desktop/hooks/use-mounted";

// Locale pinned so server + first client paint agree (§7 hydration rule).
const TIME_FMT = new Intl.DateTimeFormat("en-GB", {
  hour: "2-digit",
  minute: "2-digit",
  hour12: false,
});

export interface MenuBarProps {
  /** Brand shown after the diamond. Portable — no hardcoded consumer name. */
  brand?: { name: string; glyph?: ReactNode };
  /** Whether the canvas is in edit mode (drives the checkbox item's state). */
  editing?: boolean;
  onEditLayout?: () => void;
  onAddWidget?: () => void;
  onResetLayout?: () => void;
}

function Clock() {
  const mounted = useMounted();
  const now = useClock("minute");
  // Placeholder until mounted keeps SSR + first paint byte-identical.
  return (
    <span
      className="tabular-nums"
      style={{ fontFamily: "var(--font-numeric)", color: "var(--color-ink-hi)" }}
    >
      {mounted ? TIME_FMT.format(now) : "--:--"}
    </span>
  );
}

export function MenuBar({
  brand = { name: "Lucent" },
  editing = false,
  onEditLayout,
  onAddWidget,
  onResetLayout,
}: MenuBarProps) {
  return (
    <header
      role="banner"
      data-slice-part="menu-bar"
      className={cn(
        "flex w-full shrink-0 items-center gap-1 px-3",
        "border-b border-solid [border-color:var(--color-hairline)]",
      )}
      style={{
        height: MENUBAR_H,
        background: "linear-gradient(var(--color-glass-hi), var(--color-glass-lo))",
        backdropFilter: "blur(var(--blur-glass)) saturate(140%)",
        WebkitBackdropFilter: "blur(var(--blur-glass)) saturate(140%)",
      }}
    >
      {/* Left: brand + Widgets menu. */}
      <span
        className="flex items-center gap-2 pr-1 text-sm font-semibold select-none"
        style={{ color: "var(--color-ink-hi)", fontFamily: "var(--font-ui)" }}
      >
        <span aria-hidden="true" style={{ color: "var(--color-accent-blue)" }}>
          {brand.glyph ?? "◇"}
        </span>
        {brand.name}
      </span>

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            size="sm"
            className="h-6 px-2 text-xs [color:var(--color-ink-mid)] hover:[color:var(--color-ink-hi)]"
          >
            Widgets
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start" className="w-52">
          <DropdownMenuCheckboxItem checked={editing} onCheckedChange={() => onEditLayout?.()}>
            Edit layout
          </DropdownMenuCheckboxItem>
          <DropdownMenuItem onSelect={() => onAddWidget?.()}>Add widget…</DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            variant="destructive"
            onSelect={() => onResetLayout?.()}
          >
            Reset layout…
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Right: live clock + status glyphs. */}
      <div
        className="ml-auto flex items-center gap-3 text-xs"
        style={{ color: "var(--color-ink-mid)" }}
      >
        <Wifi aria-hidden="true" className="size-[14px]" />
        <BatteryMedium aria-hidden="true" className="size-4" />
        <Clock />
      </div>
    </header>
  );
}
