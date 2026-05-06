/**
 * Unified Sidebar System
 *
 * This module provides a comprehensive sidebar system with:
 * - Primary Sidebar: Main application navigation (app-sidebar, workspace switcher, nav items)
 * - Secondary Sidebar: Feature-specific navigation and tools
 * - Shared Components: Common components used across sidebar variants
 */

// Primary Sidebar (Main App Navigation)
export * from "./primary";

// Secondary Sidebar (Feature-specific Navigation)
export * from "./secondary";

// Shared Components
export * from "./components";

// Named exports for explicit imports
export { AppSidebar } from "./primary/AppSidebar";
export { WorkspaceSwitcher } from "./workspace-switcher/WorkspaceSwitcher";
export { NavMain } from "./primary/NavMain";
export { NavSecondary } from "./primary/NavSecondary";
export { NavSystem } from "./primary/NavSystem";
export { NavUser } from "./primary/NavUser";

export { SecondarySidebarLayout } from "./secondary/components/SecondarySidebarLayout";
export { SecondarySidebarHeader } from "./secondary/components/SecondarySidebarHeader";
export { SecondarySidebar } from "./secondary/components/SecondarySidebar";
export { SecondarySidebarTools } from "./secondary/components/SecondarySidebarTools";

export { useBreadcrumbs, BreadcrumbsProvider } from "./components/breadcrumbs-context";
export type { SidebarBreadcrumbItem } from "./components/breadcrumbs-context";
export { OnboardingGuard } from "./components/onboarding-guard";
export { SiteHeader } from "./components/site-header";
export { LoadingBar } from "./components/loading-bar";
