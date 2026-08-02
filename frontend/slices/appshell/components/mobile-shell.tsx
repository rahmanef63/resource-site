"use client";

import { useRef, useState } from "react";
import { useApps } from "../lib/registry";
import { useWindowOrder, useFocused, useWindow } from "../hooks/use-shell";
import { shellStore, openWindow, minimizeWindow, restoreWindow, toggleSpotlight } from "../lib/store";
import { AppFrame } from "../primitives/app-frame";
import { WindowContent } from "./window-content";
import { MobileSwitcher } from "./mobile-switcher";
import { MobileHome } from "./mobile-home";
import { MobileNotifications } from "./mobile-notifications";
import { MobileStatusBar } from "./mobile-status-bar";
import { Indicator, appZoomStyle } from "./mobile-shell-parts";
import { useAppZoom } from "./use-app-zoom";
import type { EdgeSide } from "./mobile-edge-drag";
import { Slot } from "../registry/feature-registry";
import { ShellUIProvider, type ShellUI } from "../registry/shell-ui";

// Real catalog ids — the old "files-manager"/"os-terminal"/"system-monitor"/
// "os-settings" matched zero apps (renamed/dropped), leaving the iOS dock empty.
const DOCK_IDS = ["site", "book", "files", "settings"];

// Phones: no floating windows — a paged home + one fullscreen app at a time.
// Reuses the same store (open/minimize/focus) so state matches the desktop.
export function MobileShell() {
  const apps = useApps();
  const order = useWindowOrder();
  const focused = useFocused();
  const [home, setHome] = useState(true);
  const [switcher, setSwitcher] = useState(false);
  const [cc, setCc] = useState(false);
  const [nc, setNc] = useState(false); // notification center (pull down, left half)
  const [ncDrag, setNcDrag] = useState<number | undefined>(undefined);
  const [ccDrag, setCcDrag] = useState<number | undefined>(undefined);
  const [closing, setClosing] = useState(false); // playing the reverse icon-zoom (P2 ios-app-open-zoom)
  const rootRef = useRef<HTMLDivElement>(null);
  const frameRef = useRef<HTMLDivElement>(null);
  const zoom = useAppZoom(rootRef, frameRef);

  const dockApps = apps.filter((a) => DOCK_IDS.includes(a.id));
  // Hide noDock utility/sensitive apps (admin/users/preview/page) from the home
  // grid + App Library, exactly like Android/macOS/Windows do. Keep the FULL list
  // for the active-app lookup below (a noDock app can still be open).
  const homeApps = apps.filter((a) => !a.noDock);

  // The visible app is the FOCUSED window (front-most) — fall back to the newest
  // non-minimized one. `order` is append-only and doesn't track focus.
  const topId =
    focused && !shellStore.getWindow(focused)?.minimized
      ? focused
      : ([...order].reverse().find((id) => !shellStore.getWindow(id)?.minimized) ?? null);
  const top = useWindow(topId ?? "__none__"); // reactive: re-renders on the active window's own payload/title changes
  const showApp = !home && top;
  const activeApp = top ? apps.find((a) => a.id === top.app) : null;

  // SSOT navigation: open / resume bring a window to the front; home minimises.
  // `rect` (the tapped icon's bounding box, from AppsGrid/dock/AppActionSheet)
  // drives the icon-zoom open (use-app-zoom.ts) — omit it for a plain fade
  // (programmatic opens, e.g. Spotlight results, and switcher resume).
  const launch = (app: (typeof apps)[number], rect?: DOMRect) => {
    zoom.open(rect);
    openWindow(app.id, app.title, app.defaultSize, undefined, { multi: app.multi });
    setSwitcher(false);
    setHome(false);
  };
  const launchById = (appId: string) => {
    const app = apps.find((a) => a.id === appId);
    if (app) launch(app);
  };
  const resume = (id: string) => {
    restoreWindow(id);
    setSwitcher(false);
    setHome(false);
  };
  // Reverses the icon-zoom (when one was captured at launch) and delays the
  // actual minimize/home commit until it finishes — mirrors use-window-exit's
  // idiom for the desktop shells' close/minimize animations.
  const goHome = () => {
    if (closing) return;
    setSwitcher(false);
    if (!topId) return setHome(true);
    if (!zoom.vars) {
      minimizeWindow(topId);
      return setHome(true);
    }
    setClosing(true);
    zoom.close(() => {
      minimizeWindow(topId);
      setClosing(false);
      setHome(true);
    });
  };

  const openSwitcher = () => setSwitcher(true);

  // P2 ios-nc-cc-drag-follow (mobile-home half — see mobile-edge-drag.ts for
  // the full contract): drives a live 0–1 progress into MobileNotifications'
  // `dragProgress` prop and Control Center's (via the Slot's `slotProps`),
  // both of which already accept it. NC must be *mounted* while dragging
  // (MobileNotifications still gates on `open`, per its own comment), so `nc`
  // OR an in-flight drag both count as open; CC reads dragProgress on its own
  // regardless of its `open` state, so cc only flips on a committed open.
  const onEdgeDrag = (side: EdgeSide, progress: number) => {
    if (side === "nc") setNcDrag(progress);
    else setCcDrag(progress);
  };
  const onEdgeDragEnd = (side: EdgeSide, open: boolean) => {
    if (side === "nc") {
      setNcDrag(undefined);
      setNc(open);
    } else {
      setCcDrag(undefined);
      if (open) setCc(true);
    }
  };

  const shellUI: ShellUI = {
    controlCenterOpen: cc,
    setControlCenterOpen: setCc,
    openApp: launch,
    openAppById: launchById,
    quickAppIds: dockApps.map((a) => a.id),
  };

  return (
    <ShellUIProvider value={shellUI}>
      <div ref={rootRef} className="absolute inset-0 z-[10] flex flex-col overscroll-none">
      <MobileHome
        apps={homeApps}
        dockApps={dockApps}
        onLaunch={launch}
        onSearch={toggleSpotlight}
        onEdgeDrag={onEdgeDrag}
        onEdgeDragEnd={onEdgeDragEnd}
        hasNotifications
        indicator={<Indicator onTap={openSwitcher} />}
      />

      {/* APP fullscreen — edge-to-edge (P2 ios-fullscreen-app-chrome): no OS
          header, the status bar overlays the top safe area and the home
          indicator floats over the bottom one; the app scrolls under both. */}
      {showApp && activeApp && (
        <div
          ref={frameRef}
          className="absolute inset-0 z-[10] flex flex-col overflow-hidden"
          style={appZoomStyle(zoom.vars, closing)}
        >
          <div className="pointer-events-none absolute inset-x-0 top-0 z-[20] h-11">
            <MobileStatusBar showReturnPill={false} />
          </div>
          <AppFrame safeArea="top" className="h-full" bodyClassName="overscroll-none pb-[calc(13px_+_var(--sai-bottom))]">
            <WindowContent app={top.app} payload={top.payload} />
          </AppFrame>
          <div className="pointer-events-none absolute inset-x-0 bottom-0 z-[20]">
            <Indicator light={false} onTap={openSwitcher} />
          </div>
        </div>
      )}

      {switcher && <MobileSwitcher onPick={resume} onHome={goHome} />}
      <MobileNotifications open={nc || ncDrag !== undefined} onClose={() => setNc(false)} dragProgress={ncDrag} />
      <Slot region="controlCenter" slotProps={{ dragProgress: ccDrag }} />
      <Slot region="topPill" />
      </div>
    </ShellUIProvider>
  );
}
