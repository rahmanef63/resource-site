"use client";

import {
  DropdownMenuItem,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { useApps } from "../lib/registry";
import { useBrand } from "../registry/brand";
import { useFocused } from "../hooks/use-shell";
import {
  shellStore,
  openWindow,
  closeWindow,
  toggleMaximize,
} from "../lib/store";
import { StatusCluster } from "./menu-bar-status";
import { Menu, AppMenus, DefaultMenus, WindowMenu, HelpMenu } from "./menu-bar-parts";

// macOS-style menu bar: logo · app menus · right status cluster (sys + clock).
export function MenuBar() {
  const apps = useApps();
  const brand = useBrand();
  const signOut = async () => {
    try { localStorage.removeItem("os:session"); } catch { /* private mode */ } // clear the OS owner write-session too
    await fetch("/api/auth/logout", { method: "POST" }).catch(() => {});
    location.reload();
  };
  const focusedId = useFocused();
  const focusedApp = apps.find(
    (a) => a.id === (focusedId ? shellStore.getWindow(focusedId)?.app : null),
  );
  const appName = focusedApp?.title ?? brand.idleAppName ?? brand.name;
  const closeFocused = () => focusedId && closeWindow(focusedId);
  const maximizeFocused = () => focusedId && toggleMaximize(focusedId);

  return (
    <header
      // 24px, no border — the frosted material alone separates the bar from the
      // wallpaper below (real macOS never draws a bottom hairline here).
      className="glass absolute inset-x-0 top-0 z-[900] flex h-[var(--menubar-h)] items-center gap-0.5 px-2.5 text-[13px] font-medium"
      style={{ background: "var(--glass-bar)" }}
    >
      <span className="grid size-4 place-items-center rounded-[5px] bg-primary text-[10px] font-extrabold text-primary-foreground">
        {brand.logo}
      </span>

      <Menu label={brand.name} bold>
        <DropdownMenuItem onSelect={() => openWindow("about", "About Rahman OS")}>
          About {brand.name}
        </DropdownMenuItem>
        {/* This computer IS rahmanef.com — the Site app deep-links to its own
            tabs via the payload (TABS id). Portfolio → "portfolio", Connect →
            "about" (the Profile/Connect card). */}
        <DropdownMenuItem onSelect={() => openWindow("site", "rahmanef.com", undefined, "portfolio")}>
          Portfolio
        </DropdownMenuItem>
        <DropdownMenuItem onSelect={() => openWindow("site", "rahmanef.com", undefined, "about")}>
          Connect
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem onSelect={() => openWindow("settings", "Settings")}>
          System Settings…
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem onSelect={() => void signOut()}>Log Out</DropdownMenuItem>
      </Menu>

      <Menu label={appName} bold>
        <DropdownMenuItem disabled>About {appName}</DropdownMenuItem>
        <DropdownMenuSeparator />
        {/* No per-app prefs target → opens the global Settings app (the honest
            match). Dropped the ⌘, label: the chord was never bound. */}
        <DropdownMenuItem onSelect={() => openWindow("settings", "Settings")}>
          Preferences…
        </DropdownMenuItem>
      </Menu>

      {focusedApp?.menus?.length ? (
        <AppMenus menus={focusedApp.menus} />
      ) : (
        <DefaultMenus focusedId={focusedId} closeFocused={closeFocused} maximizeFocused={maximizeFocused} />
      )}

      {/* Window + Help persist regardless of app menus (real macOS behaviour). */}
      <WindowMenu focusedId={focusedId} />
      <HelpMenu />

      <StatusCluster />
    </header>
  );
}
