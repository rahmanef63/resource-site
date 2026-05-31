"use client";

import { Fragment } from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useApps } from "../lib/registry";
import { useBrand } from "../registry/brand";
import { useFocused } from "../hooks/use-shell";
import {
  shellStore,
  openWindow,
  closeWindow,
  setLauncherOpen,
  toggleSpotlight,
  toggleInspector,
  toggleMaximize,
} from "../lib/store";
import { StatusCluster } from "./menu-bar-status";

// execCommand is deprecated but the only zero-dep clipboard driver from a menu.
function exec(cmd: string) {
  try {
    document.execCommand(cmd);
  } catch {
    /* no-op in read-only contexts; the ⌘ label is the real affordance */
  }
}

// Edit menu rows — execCommand drives the focused selection; `sep` = divider.
const EDIT_ITEMS: { cmd: string; label: string; key: string; sep?: boolean }[] = [
  { cmd: "cut", label: "Cut", key: "⌘X" },
  { cmd: "copy", label: "Copy", key: "⌘C" },
  { cmd: "paste", label: "Paste", key: "⌘V" },
  { cmd: "selectAll", label: "Select All", key: "⌘A", sep: true },
];

// macOS-style menu bar: logo · app menus · right status cluster (sys + clock).
export function MenuBar() {
  const apps = useApps();
  const brand = useBrand();
  const signOut = async () => {
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
      className="glass absolute inset-x-0 top-0 z-[900] flex h-[30px] items-center gap-0.5 border-b border-border px-2.5 text-[13px] font-medium"
      style={{ background: "var(--glass-bar)" }}
    >
      <span className="grid size-4 place-items-center rounded-[5px] bg-primary text-[10px] font-extrabold text-primary-foreground">
        {brand.logo}
      </span>

      <Menu label={brand.name} bold>
        <DropdownMenuItem onSelect={() => openWindow("os-settings", "Settings")}>
          About {brand.name}
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem onSelect={() => openWindow("os-settings", "Settings")}>
          System Settings…
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem onSelect={() => void signOut()}>Log Out</DropdownMenuItem>
      </Menu>

      <Menu label={appName} bold>
        <DropdownMenuItem disabled>About {appName}</DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem>
          Preferences… <DropdownMenuShortcut>⌘,</DropdownMenuShortcut>
        </DropdownMenuItem>
      </Menu>

      <Menu label="File">
        <DropdownMenuItem onSelect={() => setLauncherOpen(true)}>
          New Window… <DropdownMenuShortcut>⌘N</DropdownMenuShortcut>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem disabled={!focusedId} onSelect={closeFocused}>
          Close Window <DropdownMenuShortcut>⌘W</DropdownMenuShortcut>
        </DropdownMenuItem>
      </Menu>

      <Menu label="Edit">
        {EDIT_ITEMS.map((it) => (
          <Fragment key={it.cmd}>
            {it.sep && <DropdownMenuSeparator />}
            <DropdownMenuItem onSelect={() => exec(it.cmd)}>
              {it.label} <DropdownMenuShortcut>{it.key}</DropdownMenuShortcut>
            </DropdownMenuItem>
          </Fragment>
        ))}
      </Menu>

      <Menu label="View">
        <DropdownMenuItem disabled={!focusedId} onSelect={maximizeFocused}>
          Enter Full Screen <DropdownMenuShortcut>⌃⌘F</DropdownMenuShortcut>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem onSelect={() => setLauncherOpen(true)}>
          Launchpad
        </DropdownMenuItem>
        <DropdownMenuItem onSelect={() => toggleSpotlight()}>
          Spotlight <DropdownMenuShortcut>⌘K</DropdownMenuShortcut>
        </DropdownMenuItem>
        <DropdownMenuItem onSelect={() => toggleInspector()}>
          AI Inspector <DropdownMenuShortcut>⌘I</DropdownMenuShortcut>
        </DropdownMenuItem>
      </Menu>

      <StatusCluster />
    </header>
  );
}

function Menu(props: { label: string; bold?: boolean; children: React.ReactNode }) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        className={
          "rounded-md px-2.5 py-0.5 outline-none hover:bg-[var(--hover-strong)] data-[state=open]:bg-[var(--hover-strong)] " +
          (props.bold ? "font-bold" : "")
        }
      >
        {props.label}
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start">{props.children}</DropdownMenuContent>
    </DropdownMenu>
  );
}

