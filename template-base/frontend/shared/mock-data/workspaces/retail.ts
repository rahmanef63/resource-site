/**
 * Retail Chain Workspace Configuration
 * F&B, Hospitality, Multi-branch Retail
 */

import type { WorkspaceConfig } from "../types";
import { defineMockWorkspace, menuItem } from "./helpers";

const retailMenu = [
  menuItem("retail-main", "overview", "Retail Overview", "LayoutDashboard"),
  menuItem("retail-main", "sales", "POS System", "CreditCard"),
  menuItem("retail-main", "inventory", "Inventory", "Package"),
  menuItem("retail-main", "analytics", "Sales Analytics", "LineChart"),
  menuItem("retail-main", "tasks", "Shift Management", "ClipboardCheck"),
  menuItem("retail-main", "calendar", "Staff Roster", "CalendarDays"),
  menuItem("retail-main", "projects", "Campaigns", "Megaphone"),
];

const downtownBranchMenu = [
  menuItem("retail-downtown", "overview", "Downtown Overview", "LayoutDashboard"),
  menuItem("retail-downtown", "sales", "Register", "CreditCard"),
  menuItem("retail-downtown", "inventory", "Shelf Inventory", "Package"),
  menuItem("retail-downtown", "tasks", "Store Tasks", "ClipboardCheck"),
  menuItem("retail-downtown", "calendar", "Shift Calendar", "CalendarDays"),
  menuItem("retail-downtown", "analytics", "Store Analytics", "LineChart"),
  menuItem("retail-downtown", "support", "Customer Support", "LifeBuoy"),
];

const mallBranchMenu = [
  menuItem("retail-mall", "overview", "Mall Branch Overview", "LayoutDashboard"),
  menuItem("retail-mall", "sales", "POS Register", "CreditCard"),
  menuItem("retail-mall", "communications", "Floor Chat", "MessageCircle"),
  menuItem("retail-mall", "inventory", "Stock Check", "Package"),
  menuItem("retail-mall", "tasks", "Daily Ops", "ClipboardCheck"),
  menuItem("retail-mall", "calendar", "Crew Schedule", "CalendarDays"),
  menuItem("retail-mall", "analytics", "Footfall Analytics", "LineChart"),
];

const centralWarehouseMenu = [
  menuItem("retail-warehouse", "overview", "Warehouse Overview", "LayoutDashboard"),
  menuItem("retail-warehouse", "inventory", "Warehouse Stock", "Package"),
  menuItem("retail-warehouse", "tasks", "Fulfillment Queue", "ClipboardCheck"),
  menuItem("retail-warehouse", "reports", "Restock Reports", "FileBarChart"),
  menuItem("retail-warehouse", "analytics", "Supply Analytics", "LineChart"),
  menuItem("retail-warehouse", "documents", "Shipping Docs", "FileText"),
  menuItem("retail-warehouse", "calendar", "Dock Schedule", "CalendarDays"),
];

const retailMarketingMenu = [
  menuItem("retail-marketing", "overview", "Marketing Overview", "LayoutDashboard"),
  menuItem("retail-marketing", "marketing", "Campaign Planner", "Megaphone"),
  menuItem("retail-marketing", "projects", "Promo Projects", "FolderKanban"),
  menuItem("retail-marketing", "analytics", "Campaign Analytics", "LineChart"),
  menuItem("retail-marketing", "communications", "Brand Chat", "MessageCircle"),
  menuItem("retail-marketing", "contacts", "Partner Contacts", "Contact"),
  menuItem("retail-marketing", "calendar", "Launch Calendar", "CalendarDays"),
];

export const retailConfig: WorkspaceConfig = {
  workspace: defineMockWorkspace({
    id: "ws-retail",
    name: "FreshMart Chain",
    slug: "retail",
    description: "Multi-branch retail management",
    icon: "ShoppingBag",
    color: "#f97316",
    themePreset: "tangerine",
    menuItems: retailMenu,
    children: [
      defineMockWorkspace({
        id: "ws-retail-branch-downtown",
        name: "Downtown Branch",
        slug: "branch-downtown",
        icon: "Store",
        parentId: "ws-retail",
        themePreset: "candyland",
        menuItems: downtownBranchMenu,
      }),
      defineMockWorkspace({
        id: "ws-retail-branch-mall",
        name: "Mall Branch",
        slug: "branch-mall",
        icon: "Store",
        parentId: "ws-retail",
        themePreset: "bubblegum",
        menuItems: mallBranchMenu,
      }),
      defineMockWorkspace({
        id: "ws-retail-warehouse",
        name: "Central Warehouse",
        slug: "central-warehouse",
        icon: "Container",
        parentId: "ws-retail",
        themePreset: "caffeine",
        menuItems: centralWarehouseMenu,
      }),
      defineMockWorkspace({
        id: "ws-retail-marketing",
        name: "Marketing Hub",
        slug: "marketing-hub",
        icon: "Target",
        parentId: "ws-retail",
        themePreset: "sunset-horizon",
        menuItems: retailMarketingMenu,
      }),
    ],
  }),
};
