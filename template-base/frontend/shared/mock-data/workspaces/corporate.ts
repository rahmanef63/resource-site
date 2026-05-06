/**
 * Corporate Workspace Configuration
 * Small-to-Enterprise companies (Service, Manufacturing, Retail, Consulting)
 */

import type { WorkspaceConfig } from "../types";
import { defineMockWorkspace, menuItem } from "./helpers";

const corporateMenu = [
  menuItem("corp-main", "overview", "Executive Overview", "LayoutDashboard"),
  menuItem("corp-main", "projects", "Projects", "FolderKanban"),
  menuItem("corp-main", "crm", "CRM", "Users"),
  menuItem("corp-main", "sales", "Sales", "TrendingUp"),
  menuItem("corp-main", "inventory", "Inventory", "Package"),
  menuItem("corp-main", "hr", "HR Portal", "Briefcase"),
  menuItem("corp-main", "tasks", "Tasks", "CheckSquare", { badge: "5 Urgent" }),
  menuItem("corp-main", "accounting", "Accounting", "Calculator"),
  menuItem("corp-main", "analytics", "Business Intelligence", "BarChart3"),
  menuItem("corp-main", "approvals", "Approvals", "FileCheck"),
];

const hrDepartmentMenu = [
  menuItem("corp-hr", "overview", "People Overview", "LayoutDashboard"),
  menuItem("corp-hr", "hr", "HR Portal", "Briefcase"),
  menuItem("corp-hr", "user-management", "Team Directory", "Users"),
  menuItem("corp-hr", "tasks", "Hiring Tasks", "CheckSquare"),
  menuItem("corp-hr", "calendar", "Interview Calendar", "Calendar"),
  menuItem("corp-hr", "documents", "Policy Docs", "FileText"),
  menuItem("corp-hr", "approvals", "Leave Approvals", "FileCheck"),
];

const financeDepartmentMenu = [
  menuItem("corp-finance", "overview", "Finance Overview", "LayoutDashboard"),
  menuItem("corp-finance", "accounting", "Accounting", "Calculator"),
  menuItem("corp-finance", "approvals", "Expense Approvals", "FileCheck"),
  menuItem("corp-finance", "reports", "Financial Reports", "FileBarChart"),
  menuItem("corp-finance", "analytics", "Cashflow Analytics", "BarChart3"),
  menuItem("corp-finance", "documents", "Statements", "FileText"),
  menuItem("corp-finance", "tasks", "Month-End Tasks", "CheckSquare"),
];

const salesDepartmentMenu = [
  menuItem("corp-sales", "overview", "Revenue Overview", "LayoutDashboard"),
  menuItem("corp-sales", "sales", "Pipeline", "TrendingUp"),
  menuItem("corp-sales", "crm", "Accounts", "Users"),
  menuItem("corp-sales", "marketing", "Campaign Planner", "Megaphone"),
  menuItem("corp-sales", "analytics", "Conversion Analytics", "BarChart3"),
  menuItem("corp-sales", "communications", "Client Comms", "MessageCircle"),
  menuItem("corp-sales", "calendar", "Demo Schedule", "Calendar"),
];

const operationsDepartmentMenu = [
  menuItem("corp-ops", "overview", "Operations Overview", "LayoutDashboard"),
  menuItem("corp-ops", "projects", "Rollout Projects", "FolderKanban"),
  menuItem("corp-ops", "tasks", "Operations Tasks", "CheckSquare"),
  menuItem("corp-ops", "approvals", "Vendor Approvals", "FileCheck"),
  menuItem("corp-ops", "documents", "Runbooks", "FileText"),
  menuItem("corp-ops", "analytics", "Operations Analytics", "BarChart3"),
  menuItem("corp-ops", "calendar", "Shift Planning", "Calendar"),
];

const warehouseDepartmentMenu = [
  menuItem("corp-warehouse", "overview", "Warehouse Overview", "LayoutDashboard"),
  menuItem("corp-warehouse", "inventory", "Inventory Control", "Package"),
  menuItem("corp-warehouse", "tasks", "Picking Tasks", "CheckSquare"),
  menuItem("corp-warehouse", "reports", "Stock Reports", "FileBarChart"),
  menuItem("corp-warehouse", "analytics", "Warehouse Analytics", "BarChart3"),
  menuItem("corp-warehouse", "documents", "Receiving Logs", "FileText"),
  menuItem("corp-warehouse", "calendar", "Inbound Schedule", "Calendar"),
];

export const corporateConfig: WorkspaceConfig = {
  workspace: defineMockWorkspace({
    id: "ws-corporate",
    name: "Acme Corp Global",
    slug: "corporate",
    description: "Global enterprise management workspace",
    icon: "Building2",
    color: "#0f172a",
    themePreset: "graphite",
    menuItems: corporateMenu,
    children: [
      defineMockWorkspace({
        id: "ws-corp-hr",
        name: "HR Department",
        slug: "hr-dept",
        icon: "Users",
        parentId: "ws-corporate",
        themePreset: "clean-slate",
        menuItems: hrDepartmentMenu,
      }),
      defineMockWorkspace({
        id: "ws-corp-finance",
        name: "Finance Dept",
        slug: "finance",
        icon: "Banknote",
        parentId: "ws-corporate",
        themePreset: "elegant-luxury",
        menuItems: financeDepartmentMenu,
      }),
      defineMockWorkspace({
        id: "ws-corp-sales",
        name: "Sales & Marketing",
        slug: "sales-marketing",
        icon: "TrendingUp",
        parentId: "ws-corporate",
        themePreset: "bold-tech",
        menuItems: salesDepartmentMenu,
      }),
      defineMockWorkspace({
        id: "ws-corp-ops",
        name: "Operations",
        slug: "operations",
        icon: "Settings",
        parentId: "ws-corporate",
        themePreset: "modern-minimal",
        menuItems: operationsDepartmentMenu,
      }),
      defineMockWorkspace({
        id: "ws-corp-warehouse",
        name: "Warehouse",
        slug: "warehouse",
        icon: "Package",
        parentId: "ws-corporate",
        themePreset: "caffeine",
        menuItems: warehouseDepartmentMenu,
      }),
    ],
  }),
};
