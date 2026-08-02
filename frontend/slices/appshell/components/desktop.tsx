"use client";

import { lazy, Suspense, useState } from "react";
import { AppWindow, Robot as Bot, Monitor, DeviceMobile as Smartphone } from "@phosphor-icons/react";
import { useShellAppearance } from "../registry/capabilities";
import { AppRegistryProvider } from "../lib/registry";
import { ResponsiveProvider } from "../responsive/responsive-provider";
import { useResponsive } from "../responsive/use-responsive";
import { useOverscrollGuard } from "../responsive/use-overscroll-guard";
import { usePersistLayout } from "../hooks/use-persist-layout";
import { Wallpaper } from "./wallpaper";
import { MobileShell } from "./mobile-shell";
import { Slot } from "../registry/feature-registry";
import { registerShell, resolveShell, useShellPrefs } from "../registry/shells";
import { DesktopChrome } from "./desktop-parts";
import { PhoneFrame } from "./phone-frame";
import { ForceQuitDialog } from "./force-quit-dialog";
import { OsSpinner } from "./os-spinner";
import { useShellTokens } from "./use-shell-tokens";
import {
  useViewportRetile,
  useSpotlightHotkey,
  useInspectorHotkey,
  useWindowSnapKeys,
  useForceQuitHotkey,
} from "./desktop-hotkeys";
import "../lib/window-commands"; // side-effect: registers pin + tiling palette commands
import "../lib/spaces"; // side-effect: registers the Spaces switcher commands
import "../lib/window-tabs"; // side-effect: registers merge/separate tab commands
import "../lib/focus-mode"; // side-effect: registers the Focus mode command
import "../lib/profiles"; // side-effect: registers session-profile commands
// NOTE: the Dashboard + Mobile shells live in the APP layer (components/shells/*)
// because they read @/features/data; the app registers them via page.tsx so the
// appshell slice stays data-agnostic.
import type { AppDescriptor } from "../lib/types";

// Lazy — NOT a static side-effect import. Windows/Android each pull in a
// real subtree (taskbar/action-center/snap-assist/... resp. drawer/recents/
// shade/home/splash) that only needs to ship to a visitor who actually
// picks that shell; registerShell() below carries the metadata eagerly
// (cheap: an id/label/icon/wallpaper) so the shell still lists as a picker
// option before its code has ever loaded. Surface() wraps <Comp/> in
// Suspense to cover the load.
const WindowsShell = lazy(() =>
  import("./shells/windows/windows-shell").then((m) => ({ default: m.WindowsShell })),
);
const AndroidShell = lazy(() =>
  import("./shells/android/android-shell").then((m) => ({ default: m.AndroidShell })),
);

// The OS surface. Receives apps from the app layer (no hardcoded list). Only
// subscribes to `order`, so dragging a window never re-renders the desktop.
export function OsDesktop({ apps }: { apps: AppDescriptor[] }) {
  const { device } = useShellAppearance();
  return (
    <AppRegistryProvider apps={apps}>
      <ResponsiveProvider device={device}>
        <Surface />
      </ResponsiveProvider>
    </AppRegistryProvider>
  );
}

function Surface() {
  const r = useResponsive();
  const prefs = useShellPrefs();
  const [forceQuit, setForceQuit] = useState(false);

  // The live form factor picks the surface; the user's per-surface preference
  // picks WHICH shell renders there (desktop look vs mobile look, chosen
  // independently in Settings). A mobile shell on a wide viewport (device
  // override = phone) previews inside a phone frame; a real narrow screen fills.
  const surface = r.isMobile ? "mobile" : "desktop";
  const desc = resolveShell(surface, prefs);
  const Comp = desc.render;

  useShellTokens(desc.id);
  usePersistLayout();
  useSpotlightHotkey();
  useViewportRetile();
  useInspectorHotkey();
  // Only windowed shells (macOS/Windows) react to ⌘+Arrow snap — otherwise the
  // hotkey would silently snap the hidden focused window under a single-pane or
  // mobile shell, surprising the user when they switch back.
  useWindowSnapKeys(!!desc.windowed);
  // ⌥⌘Esc opens Force Quit on every shell — the panel lists windows even when the
  // active shell hides them, matching macOS where the panel is always reachable.
  useForceQuitHotkey(() => setForceQuit(true));
  // Mobile surface owns its vertical gestures: kill the browser's
  // pull-to-refresh (it reloads the site mid shade-swipe) + edge nav.
  useOverscrollGuard(surface === "mobile");
  const framed = surface === "mobile" && r.vw >= 768;

  return (
    <div className="relative h-dvh w-screen overflow-hidden">
      <Wallpaper shellDefault={desc.wallpaper} />
      {/* Windows/Android are React.lazy() — Suspense covers their one-time
          dynamic-import load (see the lazy() calls above); macOS/iOS/
          Dashboard/Mobile resolve synchronously so this never shows for them. */}
      <Suspense fallback={<div className="grid h-full w-full place-items-center"><OsSpinner /></div>}>
        {framed ? <PhoneFrame Comp={Comp} wallpaper={desc.wallpaper} /> : <Comp />}
      </Suspense>
      <Slot region="overlay" />
      <Slot region="notifications" />
      <ForceQuitDialog open={forceQuit} onClose={() => setForceQuit(false)} />
    </div>
  );
}

// The four built-in shells (+ dashboard / mobile-dashboard, registered from
// the app layer into the same registry). macOS/iOS render synchronously
// (their code already ships in this bundle regardless — DesktopChrome/
// MobileShell are the OS's own default look); Windows/Android are the
// React.lazy() components declared above — this metadata is all that's
// eager for them, the render prop's actual code loads on first pick.
registerShell({ id: "macos", label: "macOS", icon: Monitor, surface: "desktop", group: "Desktop", windowed: true, wallpaper: "aurora", render: DesktopChrome });
registerShell({ id: "ios", label: "iOS", icon: Smartphone, surface: "mobile", group: "Mobile", wallpaper: "ios", render: MobileShell });
registerShell({ id: "windows", label: "Windows", icon: AppWindow, surface: "desktop", group: "Desktop", windowed: true, wallpaper: "win11", render: WindowsShell });
registerShell({ id: "android", label: "Android", icon: Bot, surface: "mobile", group: "Mobile", wallpaper: "material", render: AndroidShell });
