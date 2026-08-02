"use client";
/* Android (Material-You) mobile shell — same store + apps as every other shell,
   one fullscreen app at a time (mirrors MobileShell). Chrome: status bar →
   pull-down notification shade with quick-settings tiles, Pixel-style home
   (android-home.tsx) + Google-style search, swipe-up App Drawer, gesture nav
   (back / home / recents), and a Recents card deck. Drives the shared store
   only. Home column, splash and the long-press popup live in their own
   files (android-home.tsx, android-splash.tsx, android-app-menu.tsx) to keep
   this orchestrator under the 200-LOC gate. */
import { useState } from "react";
import { ArrowLeft, CornersOut as Fullscreen, Gear, Palette } from "@phosphor-icons/react";
import { Button } from "@/components/ui/button";
import { useApps } from "../../../lib/registry";
import { useWindowOrder, useFocused, useWindow } from "../../../hooks/use-shell";
import { shellStore, openWindow, closeWindow, minimizeWindow, restoreWindow } from "../../../lib/store";
import { WindowContent } from "../../window-content";
import type { AppDescriptor } from "../../../lib/types";
import { StatusBar, NavBar } from "./android-shell-parts";
import { AndroidHome } from "./android-home";
import { AppOpenSplash, useAppOpenSplash } from "./android-splash";
import { AppDrawer } from "./android-drawer";
import { Recents } from "./android-recents";
import { Shade } from "./android-shade";
import { AndroidAppMenu } from "./android-app-menu";
import { ContextMenu, useContextMenu, type MenuItem } from "../context-menu";
import { isBrowserFullscreen, toggleBrowserFullscreen } from "../../../lib/browser-fullscreen";

function AndroidShell() {
  const apps = useApps();
  const order = useWindowOrder();
  const focused = useFocused();
  const [home, setHome] = useState(true);
  const [drawer, setDrawer] = useState(false);
  const [shade, setShade] = useState(false);
  const [recents, setRecents] = useState(false);
  const [menuApp, setMenuApp] = useState<{ app: AppDescriptor; rect: DOMRect | null } | null>(null);
  const { splash, show: showSplash } = useAppOpenSplash();
  const menu = useContextMenu();
  const ctxItems: MenuItem[] = [
    {
      label: isBrowserFullscreen() ? "Exit Full Screen" : "Enter Full Screen",
      icon: Fullscreen,
      onClick: () => toggleBrowserFullscreen(),
    },
    { type: "sep" },
    { label: "Settings", icon: Gear, onClick: () => openWindow("settings", "Settings") },
    { label: "Personalize", icon: Palette, onClick: () => openWindow("settings", "Personalization", undefined, { section: "appearance" }) },
  ];

  const dockable = apps.filter((a) => !a.noDock);
  const topId =
    focused && !shellStore.getWindow(focused)?.minimized
      ? focused
      : ([...order].reverse().find((id) => !shellStore.getWindow(id)?.minimized) ?? null);
  const top = useWindow(topId ?? "__none__"); // reactive: re-renders on the active window's own payload/title changes
  const showApp = !home && !!top;
  const activeApp = top ? apps.find((a) => a.id === top.app) : null;

  const launch = (app: AppDescriptor) => {
    showSplash(app); // Android 12+ splash — held briefly before content shows
    openWindow(app.id, app.title, app.defaultSize, undefined, { multi: app.multi });
    setDrawer(false);
    setRecents(false);
    setHome(false);
  };
  // Long-press app-shortcuts popup — captures the pressed icon's rect so
  // AndroidAppMenu can anchor next to it instead of centering over a dim.
  const openMenu = (app: AppDescriptor, rect?: DOMRect) => setMenuApp({ app, rect: rect ?? null });
  const goHome = () => {
    if (topId) minimizeWindow(topId);
    setHome(true);
    setDrawer(false);
    setRecents(false);
  };
  // Android root-back = exit (pop) the current app, distinct from Home which
  // only minimizes it to Recents. Reveal the app behind it if any, else Home.
  // On the home screen Back is a no-op.
  const goBack = () => {
    if (!topId) return;
    closeWindow(topId);
    const stillOpen = shellStore.getOrder().some((id) => !shellStore.getWindow(id)?.minimized);
    if (!stillOpen) setHome(true);
  };
  const resume = (id: string) => {
    restoreWindow(id);
    setRecents(false);
    setHome(false);
  };
  // Recents "Clear all" — pop every open window, then land on Home (deck-clear).
  const clearAllRecents = () => { shellStore.getOrder().forEach(closeWindow); goHome(); };
  // Android back edge-swipe: a drag inward starting <=24px from the left/right
  // screen edge, >60px horizontal → goBack(). Mid-screen starts are ignored so
  // in-app carousels keep their own swipes; skip while an overlay is already up.
  const onEdgeSwipe = (e: React.PointerEvent) => {
    if (drawer || recents || shade || menuApp) return;
    const r = e.currentTarget.getBoundingClientRect();
    const dir = e.clientX - r.left <= 24 ? 1 : r.right - e.clientX <= 24 ? -1 : 0;
    if (!dir) return;
    const x0 = e.clientX, y0 = e.clientY, ac = new AbortController(); // ponytail: per-gesture listeners, no shared drag state
    const move = (ev: PointerEvent) => { if ((ev.clientX - x0) * dir > 60 && Math.abs(ev.clientY - y0) < 80) { goBack(); ac.abort(); } };
    window.addEventListener("pointermove", move, { signal: ac.signal });
    window.addEventListener("pointerup", () => ac.abort(), { signal: ac.signal });
    window.addEventListener("pointercancel", () => ac.abort(), { signal: ac.signal }); // touch scroll-takeover
  };

  return (
    // No opaque scrim here (android-wallpaper-hidden) — the Wallpaper layer
    // the Surface renders behind every shell (wp-material, a real Material
    // You mesh render) shows straight through; AndroidHome carries its own
    // label-legibility treatment for text over it.
    <div onPointerDown={onEdgeSwipe} className="absolute inset-0 z-[10] flex flex-col overflow-hidden overscroll-none text-foreground">
      {/* status bar (tap OR swipe-down → shade) — translucent over the wallpaper, above the grid */}
      <StatusBar onTap={() => setShade(true)} onSwipeDown={() => setShade(true)} />

      <AndroidHome dockable={dockable} onLaunch={launch} onContext={openMenu} onSwipeUpDrawer={() => setDrawer(true)} onEmptyContext={menu.open} />

      <NavBar onHome={goHome} onRecents={() => setRecents(true)} />

      {/* fullscreen app — flat M3 top app bar (android-app-topbar-gradient):
          surface-colored, no brand gradient, ArrowLeft not a chevron. */}
      {showApp && activeApp && top && (
        <div className="absolute inset-0 z-[20] flex flex-col bg-background [animation:appOpen_.24s_cubic-bezier(.2,.8,.2,1)] [transform-origin:center_bottom]">
          <header className="flex h-14 shrink-0 items-center gap-1 border-b border-border bg-card px-1 text-foreground">
            <Button variant="ghost" size="icon" onClick={goBack} aria-label="Back" className="size-11 shrink-0 rounded-full text-foreground">
              <ArrowLeft className="size-5" />
            </Button>
            <strong className="flex-1 truncate pr-3 text-[19px] font-normal">{activeApp.title}</strong>
          </header>
          <main className="relative min-h-0 flex-1 overflow-auto overscroll-none [container-type:inline-size]">
            <WindowContent app={top.app} payload={top.payload} />
          </main>
          <NavBar onHome={goHome} onRecents={() => setRecents(true)} />
        </div>
      )}

      {splash && <AppOpenSplash app={splash.app} leaving={splash.leaving} />}

      {drawer && <AppDrawer apps={dockable} onLaunch={launch} onClose={() => setDrawer(false)} onContext={openMenu} />}
      {recents && <Recents order={order} apps={apps} onResume={resume} onHome={goHome} onClearAll={clearAllRecents} />}
      {shade && <Shade onClose={() => setShade(false)} />}
      {menuApp && (
        <AndroidAppMenu
          app={menuApp.app}
          rect={menuApp.rect}
          onOpen={() => { launch(menuApp.app); setMenuApp(null); }}
          onClose={() => setMenuApp(null)}
        />
      )}
      <ContextMenu pos={menu.pos} onClose={menu.close} items={ctxItems} />
    </div>
  );
}

// Registered lazily from desktop.tsx (React.lazy over a dynamic import of
// this module) rather than self-registering here — this module's own tree
// (drawer/recents/shade/home/splash) shipped in the OS bundle to every
// visitor even when this shell was never picked, via desktop.tsx's static
// side-effect import.
export { AndroidShell };
