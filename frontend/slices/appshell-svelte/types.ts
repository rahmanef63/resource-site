import type { Component } from "svelte";
import type { ShellId } from "../appshell/registry/shell-core";
export type AppProps = { payload?: unknown };
export type AppMenuItem = { sep?: false; label: string; shortcut?: string; onSelect?: () => void; disabled?: boolean } | { sep: true };
export type AppMenu = { label: string; items: AppMenuItem[] };
export type AppDescriptor = {
  id: string; slug?: string; title: string; icon?: string; gradient?: string;
  load: () => Promise<{ default: Component<AppProps> }>;
  defaultSize?: { w: number; h: number }; noDock?: boolean; multi?: boolean; system?: boolean;
  description?: string; tags?: string[]; menus?: AppMenu[];
};
export type SlotRegion = "overlay"|"rightPanel"|"menuBarStatus"|"notifications"|"topPill"|"controlCenter"|"desktopWidgets";
export type ShellManifest = {
  brand: { name: string; logo?: string; wallpaper?: string; idleAppName?: string };
  apps: AppDescriptor[];
  persistKey?: string; routing?: boolean; titleSync?: boolean; shell?: ShellId;
  slots?: Partial<Record<SlotRegion, Component<any>>>;
};
