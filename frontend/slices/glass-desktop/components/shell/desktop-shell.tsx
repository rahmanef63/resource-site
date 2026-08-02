"use client";
// glass-desktop — DesktopShell (Build Plan §5). The one full-bleed chrome that
// composes the desktop: Dusk Field wallpaper at z-0, the SpacePager carrying the
// two WidgetCanvas spaces at the widget layer, and the MenuBar pinned on top at
// the chrome layer. Exactly ONE outer chrome element. Wraps everything in
// ClockProvider so the menu bar (and every clock widget) shares one 1 Hz tick.
import { useCallback, useState } from "react";
import { cn } from "@/lib/utils";
import { Z, STORAGE } from "@/features/glass-desktop/config/constants";
import { ClockProvider } from "@/features/glass-desktop/hooks/use-clock";
import { useLayout } from "@/features/glass-desktop/hooks/use-layout";
import { WidgetCanvas } from "@/features/glass-desktop/components/engine/widget-canvas";
import { Wallpaper } from "./wallpaper";
import { SpacePager } from "./space-pager";
import { MenuBar } from "./menu-bar";
import { WidgetPicker } from "@/features/glass-desktop/components/config/widget-picker";
import { usePersistentState } from "@/features/glass-desktop/hooks/use-persistent-state";
import type { LayoutStore } from "@/features/glass-desktop/types";
import { LucentTheme } from "@/features/glass-desktop/components/engine/lucent-theme";

export interface DesktopShellProps {
  /** Brand shown in the menu bar. Portability prop — no hardcoded consumer. */
  brand?: { name: string; glyph?: React.ReactNode };
  /** Layout persistence adapter (defaults to the localStorage adapter). */
  store?: LayoutStore;
}

/**
 * The Lucent glass desktop chrome. Full-bleed h-dvh, single outer element; the
 * wallpaper, spaces and menu bar layer inside it by z-index only.
 */
export function DesktopShell({ brand, store }: DesktopShellProps) {
  const [editing, setEditing] = useState(false);
  const toggleEditing = useCallback(() => setEditing((v) => !v), []);
  const [pickerOpen, setPickerOpen] = useState(false);
  // Active space is owned by SpacePager but shared via the same persisted key,
  // so "Add widget" targets the space the user is actually looking at.
  const [activeSpace] = usePersistentState<0 | 1>(STORAGE.space, 0);
  // One layout store for the whole desktop — both spaces read the same state.
  const layout = useLayout({ store });

  return (
    <ClockProvider>
      <div
        data-slice="glass-desktop"
        className={cn("relative h-dvh w-full overflow-hidden")}
        style={{ color: "var(--color-ink-hi)", fontFamily: "var(--font-ui)" }}
      >
        <LucentTheme />
        {/* z-0: Dusk Field wallpaper. */}
        <Wallpaper style={{ zIndex: Z.wallpaper }} />

        {/* Chrome + canvas column, stacked above the wallpaper. */}
        <div className="relative flex h-full flex-col">
          <div style={{ zIndex: Z.chrome }}>
            <MenuBar
              brand={brand}
              editing={editing}
              onEditLayout={toggleEditing}
              onAddWidget={() => setPickerOpen(true)}
              onResetLayout={layout.reset}
            />
          </div>

          <div className="relative min-h-0 flex-1" style={{ zIndex: Z.widget }}>
            <SpacePager
              spaces={[
                <WidgetCanvas
                  key={0}
                  space={0}
                  instances={layout.instances}
                  editMode={editing}
                  onMove={layout.move}
                  onRemove={layout.remove}
                  onResize={layout.resize}
                />,
                <WidgetCanvas
                  key={1}
                  space={1}
                  instances={layout.instances}
                  editMode={editing}
                  onMove={layout.move}
                  onRemove={layout.remove}
                  onResize={layout.resize}
                />,
              ]}
            />
          </div>
        </div>

        <WidgetPicker
          open={pickerOpen}
          onOpenChange={setPickerOpen}
          activeSpace={activeSpace}
          add={layout.add}
        />
      </div>
    </ClockProvider>
  );
}
