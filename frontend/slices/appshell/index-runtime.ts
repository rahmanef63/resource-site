// Runtime barrel — shell runtime services: notifications/toast, activity,
// commands, badges, layouts, recents, window management, spaces, tabs,
// clipboard, share, lock, profiles, shortcuts, focus-mode, dnd, quick-look,
// inspector, plus shared types and the os shell config. Re-exported by ./index.
export {
  toast, dismissToast, useToasts,
  useNotifications, dismissNotification, clearNotifications, markNotificationsRead,
} from "./lib/toast";
export type { NotificationItem } from "./lib/toast";
export { setActivity, clearActivity, useActivities } from "./lib/activity";
export type { Activity } from "./lib/activity";
// Dynamic command registry — contribute palette actions at runtime.
export { registerCommands, getCommands, useCommands } from "./lib/commands";
export type { ShellCommand } from "./lib/commands";
// App-icon badges — count pill / dot / progress ring on every shell's icons.
export { setBadge, getBadge, useBadge, useBadges } from "./lib/badges";
export type { AppIconBadge } from "./lib/badges";
// Named window layouts — save/restore window arrangements (palette-driven).
export { saveLayout, restoreLayout, deleteLayout, listLayouts, useLayouts } from "./lib/layouts";
// Recently-used apps — "continue where you left off" (auto-recorded on launch).
export { listRecents, useRecents } from "./lib/recents";
export type { RecentApp } from "./lib/recents";
// Window management extras — always-on-top + tiling presets (palette-driven).
export { togglePin, TILE_PRESETS } from "./lib/window-commands";
export { configureWindowTitle, startWindowTitleSync } from "./lib/window-title";
// Virtual desktops (Spaces) — per-window spaceId, palette-driven switcher.
export { setActiveSpace, moveWindowToSpace, useActiveSpace, spaceOf, SPACE_IDS } from "./lib/spaces";
// Window tabs — merge an app's windows into one tabbed frame.
export { mergeFocusedAppWindows, ungroup, groupMembers, groupTop } from "./lib/window-tabs";
// Clipboard history — capture/copy-back store behind the ⌘⇧V overlay.
export {
  recordClip, copyClip, togglePinClip, removeClip, clearClips, listClips,
  useClips, useClipboardOpen, setClipboardOpen, toggleClipboard,
} from "./lib/clipboard";
export type { Clip } from "./lib/clipboard";
// Share sheet — target registry + share() opener.
export { registerShareTarget, share, closeShare, targetsFor, useShareState } from "./lib/share";
export type { ShareTarget } from "./lib/share";
// Lock screen — privacy curtain + consumer unlock guard + idle auto-lock.
export { lock, requestUnlock, setUnlockGuard, useLocked, autoLockMinutes, setAutoLockMinutes } from "./lib/lock";
// Session profiles — layout + shell prefs as one switchable unit.
export { saveProfile, applyProfile, deleteProfile, listProfiles, useProfiles } from "./lib/profiles";
export type { SessionProfile } from "./lib/profiles";
// Shortcut hints — ⌘/ cheat-sheet registry.
export { registerShortcuts, listShortcuts, useShortcuts, setShortcutHelpOpen } from "./lib/shortcuts";
export type { ShortcutHint } from "./lib/shortcuts";
// Focus mode (DND) — toasts go log-only while on.
export { setFocusMode, toggleFocusMode, getFocusMode, useFocusMode } from "./lib/focus-mode";
// Cross-app drag & drop — typed payloads + per-app drop handlers.
export {
  registerDropHandler, deliverDrop, appAccepts, makeDragProps, readDragData,
  dragCarriesPayload, DND_MIME,
} from "./lib/dnd";
export type { DragData } from "./lib/dnd";
// Quick Look — Space-bar preview overlay over a previewer registry.
export {
  registerPreviewer, setQuickLookTarget, openQuickLook, closeQuickLook,
  toggleQuickLook, useQuickLook,
} from "./lib/quick-look";
export type { QuickLookPreviewer } from "./lib/quick-look";
export {
  usePublishInspector,
  publishInspector,
  clearInspector,
  useInspectorInfo,
} from "./lib/inspector";
export type {
  InspectorInfo,
  InspectorProp,
  InspectorAction,
} from "./lib/inspector";
export type { Toast, ToastOptions, ToastTone } from "./lib/toast";
export type { AppDescriptor, AppCategory, AppBadge, AppMenu, AppMenuItem, WindowState, WinId, AppProps } from "./lib/types";
export type { IconType } from "./lib/icon";
export { default as osShellConfig } from "./config";
