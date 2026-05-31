"use client";

import { useEffect } from "react";
import { useShellAppearance } from "../registry/capabilities";
import { AppRegistryProvider } from "../lib/registry";
import { ResponsiveProvider } from "../responsive/responsive-provider";
import { useResponsive } from "../responsive/use-responsive";
import { useWindowOrder } from "../hooks/use-shell";
import { usePersistLayout } from "../hooks/use-persist-layout";
import { MenuBar } from "./menu-bar";
import { Dock } from "./dock";
import { AppLauncher } from "./app-launcher";
import { Wallpaper } from "./wallpaper";
import { MobileShell } from "./mobile-shell";
import { Window } from "./window";
import { Slot } from "../registry/feature-registry";
import { toggleSpotlight, toggleInspector } from "../lib/store";
import type { AppDescriptor } from "../lib/types";

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
  const mobile = useResponsive().isMobile;
  usePersistLayout();
  useSpotlightHotkey();
  useInspectorHotkey();

  return (
    <div className="relative h-dvh w-screen overflow-hidden">
      <Wallpaper />
      {mobile ? <MobileShell /> : <DesktopChrome />}
      <Slot region="overlay" />
      <Slot region="notifications" />
    </div>
  );
}

// ⌘K / Ctrl+K toggles Spotlight from anywhere on the desktop.
function useSpotlightHotkey() {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        toggleSpotlight();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);
}

// ⌘I / Ctrl+I toggles the AI Inspector.
function useInspectorHotkey() {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "i") {
        e.preventDefault();
        toggleInspector();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);
}

function DesktopChrome() {
  const order = useWindowOrder();
  return (
    <>
      <MenuBar />
      <section className="absolute inset-x-0 bottom-0 top-[30px] z-[10]">
        {order.map((id) => (
          <Window key={id} id={id} />
        ))}
      </section>
      <Slot region="rightPanel" />
      <AppLauncher />
      <Dock />
    </>
  );
}
