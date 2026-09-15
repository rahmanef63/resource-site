export { default as DashboardShell } from "./components/DashboardShell.svelte";
export { default as DashboardSidebar } from "./components/DashboardSidebar.svelte";
export { default as MobileDock } from "./components/MobileDock.svelte";
export { default as MobileMenuDrawer } from "./components/MobileMenuDrawer.svelte";
export { dashboardShellConfig, type DashboardShellFeature } from "./config";
export { activeItem, activeTitle, deriveDock, flattenNav, isActive } from "../dashboard-shell/lib/nav";
export type { Brand, NavGroup, NavItem, ShellSlot } from "./types";
export type { BrandCore, NavGroupCore, NavItemCore } from "../dashboard-shell/lib/core-types";
