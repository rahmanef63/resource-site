/**
 * Slice contract for `appshell` — v1.4.0.
 * Excluded from app tsc; validated by rr tooling on lift.
 */
import { defineSliceContract } from "@/packages/cli/lib/contract";

export const contract = defineSliceContract({
  id: "appshell",
  version: "1.5.0",
  category: "ui",
  kind: "full",
  requires: {
    auth: "none" as const,
    rbac: [] as string[],
    env: [] as string[],
    deps: [] as const,
  },
  provides: {
    tools: [
      "appshell.window.list",
      "appshell.app.launch",
      "appshell.app.focus",
      "appshell.window.close",
      "appshell.window.focus",
      "appshell.window.minimize",
      "appshell.window.restore",
      "appshell.window.toggle_maximize",
      "appshell.space.set",
      "appshell.profile.save",
      "appshell.profile.apply",
      "appshell.notify"
    ] as string[],
    routes: [] as string[],
    hooks: [
      "useCommands",
      "useBadges",
      "useRecents",
      "useLayouts",
      "useActiveSpace",
      "useClips",
      "useShareState",
      "useQuickLook",
      "useShortcuts",
      "useFocusMode",
      "useLocked",
      "useProfiles",
      "useResponsive",
      "useContainer",
      "useApps",
      "useWindow",
      "useFocused",
      "useFeatures",
      "useBrand",
      "useShellUI",
      "useShellConfig",
      "useQuickLinks",
    ] as string[],
    components: [
      "AppShell",
      "Slot",
      "AppFrame",
      "MasterDetail",
      "ResponsiveToolbar",
      "TouchList",
      "QuicklinkIcon",
      "DashboardShell",
    ] as string[],
    tables: [] as string[],
  },
});

export default contract;
