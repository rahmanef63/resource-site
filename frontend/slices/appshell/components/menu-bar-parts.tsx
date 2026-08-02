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
import { cn } from "@/lib/utils";
import { useApps } from "../lib/registry";
import { useBrand } from "../registry/brand";
import { useWindowOrder } from "../hooks/use-shell";
import {
  shellStore,
  openWindow,
  setLauncherOpen,
  toggleSpotlight,
  toggleInspector,
  toggleMaximize,
  minimizeWindow,
  minimizeAll,
  restoreWindow,
  focusWindow,
} from "../lib/store";
import { togglePin } from "../lib/window-commands";
import { mergeFocusedAppWindows } from "../lib/window-tabs";
import { exec, EDIT_ITEMS } from "./menu-bar-helpers";
import type { AppDescriptor } from "../lib/types";

// An app's own menu-bar dropdowns (macOS replaces File/Edit/View with the
// focused app's menus). Declarative — items carry their own onSelect.
export function AppMenus({ menus }: { menus: NonNullable<AppDescriptor["menus"]> }) {
  return (
    <>
      {menus.map((m) => (
        <Menu key={m.label} label={m.label}>
          {m.items.map((it, i) =>
            "sep" in it && it.sep ? (
              <DropdownMenuSeparator key={i} />
            ) : (
              <DropdownMenuItem key={i} disabled={it.disabled} onSelect={() => it.onSelect?.()}>
                {it.label}
                {it.shortcut && <DropdownMenuShortcut>{it.shortcut}</DropdownMenuShortcut>}
              </DropdownMenuItem>
            ),
          )}
        </Menu>
      ))}
    </>
  );
}

// The generic File/Edit/View shown when the focused app declares no menus.
export function DefaultMenus({
  focusedId, closeFocused, maximizeFocused,
}: {
  focusedId: string | null;
  closeFocused: () => void;
  maximizeFocused: () => void;
}) {
  return (
    <>
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
    </>
  );
}

// macOS Window menu: minimize/zoom the focused window + the open-window list
// (✓ marks the focused one; picking restores + focuses).
export function WindowMenu({ focusedId }: { focusedId: string | null }) {
  const order = useWindowOrder();
  const windows = order
    .map((id) => ({ id, win: shellStore.getWindow(id) }))
    .filter((w): w is { id: string; win: NonNullable<ReturnType<typeof shellStore.getWindow>> } => !!w.win);
  // "Merge All Windows" only makes sense when the focused app has ≥2 windows.
  const focusedApp = focusedId ? shellStore.getWindow(focusedId)?.app : null;
  const mergeable = !!focusedApp && windows.filter((w) => w.win.app === focusedApp).length > 1;
  return (
    <Menu label="Window">
      <DropdownMenuItem disabled={!focusedId} onSelect={() => focusedId && minimizeWindow(focusedId)}>
        Minimize <DropdownMenuShortcut>⌘M</DropdownMenuShortcut>
      </DropdownMenuItem>
      <DropdownMenuItem disabled={!focusedId} onSelect={() => focusedId && toggleMaximize(focusedId)}>
        Zoom
      </DropdownMenuItem>
      <DropdownMenuItem disabled={!focusedId} onSelect={() => focusedId && togglePin(focusedId)}>
        {focusedId && shellStore.getWindow(focusedId)?.pinned ? "Unpin Window" : "Pin Window on Top"}
      </DropdownMenuItem>
      <DropdownMenuItem disabled={windows.length === 0} onSelect={() => minimizeAll()}>
        Minimize All
      </DropdownMenuItem>
      <DropdownMenuItem disabled={!mergeable} onSelect={() => mergeFocusedAppWindows()}>
        Merge All Windows
      </DropdownMenuItem>
      {windows.length > 0 && <DropdownMenuSeparator />}
      {windows.map(({ id, win }) => (
        <DropdownMenuItem
          key={id}
          onSelect={() => { if (win.minimized) restoreWindow(id); focusWindow(id); }}
        >
          <span className="w-3.5 text-center">{id === focusedId ? "✓" : win.minimized ? "◆" : ""}</span>
          <span className="truncate">{win.title}</span>
        </DropdownMenuItem>
      ))}
    </Menu>
  );
}

// Help: Spotlight is the search affordance; a Docs/handbook app (if the host
// registers one) gets a direct entry.
export function HelpMenu() {
  const apps = useApps();
  const brand = useBrand();
  const docs = apps.find((a) => a.id === "docs");
  return (
    <Menu label="Help">
      <DropdownMenuItem onSelect={() => toggleSpotlight()}>
        Search <DropdownMenuShortcut>⌘K</DropdownMenuShortcut>
      </DropdownMenuItem>
      <DropdownMenuItem onSelect={() => openWindow("shortcuts", "Keyboard Shortcuts")}>
        Keyboard Shortcuts
      </DropdownMenuItem>
      {docs && (
        <DropdownMenuItem onSelect={() => openWindow(docs.id, docs.title, docs.defaultSize)}>
          {brand.name} Help
        </DropdownMenuItem>
      )}
      <DropdownMenuSeparator />
      <DropdownMenuItem onSelect={() => toggleInspector()}>
        AI Inspector <DropdownMenuShortcut>⌘I</DropdownMenuShortcut>
      </DropdownMenuItem>
    </Menu>
  );
}

export function Menu(props: { label: string; bold?: boolean; children: React.ReactNode }) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        className={cn(
          // Real macOS: menu titles carry NO idle hover wash — they only pick up
          // a NEUTRAL translucent wash while the menu system is engaged (blue is
          // pre-Big-Sur). The full-row accent-blue highlight lives on the ITEM
          // below, not the title — see .os-menu in appshell.css.
          "rounded-[6px] px-2 py-[3px] outline-none transition-colors duration-150 data-[state=open]:bg-white/10 dark:data-[state=open]:bg-white/10",
          props.bold ? "font-bold" : "font-medium",
        )}
      >
        {props.label}
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" sideOffset={1} className={cn("os-menu material-menu")}>
        {props.children}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
