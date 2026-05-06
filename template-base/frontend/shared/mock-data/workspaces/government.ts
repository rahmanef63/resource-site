/**
 * Government Office Workspace Configuration
 * Public Service Units, Licensing Departments
 */

import type { WorkspaceConfig } from "../types";
import { defineMockWorkspace, menuItem } from "./helpers";

const governmentMenu = [
  menuItem("gov-main", "overview", "Public Services Overview", "ShieldCheck"),
  menuItem("gov-main", "approvals", "Permit Approvals", "FileCheck"),
  menuItem("gov-main", "documents", "Official Documents", "FileText"),
  menuItem("gov-main", "projects", "Public Projects", "FolderKanban"),
  menuItem("gov-main", "forms", "Citizen Forms", "ClipboardList"),
  menuItem("gov-main", "support", "Citizen Support", "LifeBuoy"),
];

const licensingMenu = [
  menuItem("gov-licensing", "overview", "Licensing Overview", "LayoutDashboard"),
  menuItem("gov-licensing", "approvals", "Permit Queue", "FileCheck"),
  menuItem("gov-licensing", "forms", "Application Forms", "ClipboardList"),
  menuItem("gov-licensing", "documents", "Issued Permits", "FileText"),
  menuItem("gov-licensing", "tasks", "Verification Tasks", "CheckSquare"),
  menuItem("gov-licensing", "support", "Citizen Desk", "LifeBuoy"),
  menuItem("gov-licensing", "calendar", "Inspection Calendar", "Calendar"),
];

const publicRelationsMenu = [
  menuItem("gov-pr", "overview", "Public Relations Overview", "LayoutDashboard"),
  menuItem("gov-pr", "communications", "Press Desk", "MessageCircle"),
  menuItem("gov-pr", "marketing", "Campaign Planner", "Megaphone"),
  menuItem("gov-pr", "calendar", "Media Calendar", "Calendar"),
  menuItem("gov-pr", "documents", "Press Kits", "FileText"),
  menuItem("gov-pr", "analytics", "Engagement Analytics", "BarChart3"),
  menuItem("gov-pr", "contacts", "Stakeholder Directory", "Contact"),
];

const treasuryMenu = [
  menuItem("gov-treasury", "overview", "Treasury Overview", "LayoutDashboard"),
  menuItem("gov-treasury", "accounting", "Treasury Ledger", "Calculator"),
  menuItem("gov-treasury", "reports", "Budget Reports", "FileBarChart"),
  menuItem("gov-treasury", "approvals", "Budget Approvals", "FileCheck"),
  menuItem("gov-treasury", "documents", "Treasury Docs", "FileText"),
  menuItem("gov-treasury", "analytics", "Revenue Analytics", "BarChart3"),
  menuItem("gov-treasury", "tasks", "Reconciliation Tasks", "CheckSquare"),
];

const infrastructureMenu = [
  menuItem("gov-infra", "overview", "Infrastructure Overview", "LayoutDashboard"),
  menuItem("gov-infra", "projects", "Infrastructure Projects", "FolderKanban"),
  menuItem("gov-infra", "tasks", "Field Tasks", "CheckSquare"),
  menuItem("gov-infra", "approvals", "Maintenance Approvals", "FileCheck"),
  menuItem("gov-infra", "documents", "Project Files", "FileText"),
  menuItem("gov-infra", "analytics", "Asset Analytics", "BarChart3"),
  menuItem("gov-infra", "calendar", "Maintenance Calendar", "Calendar"),
];

export const governmentConfig: WorkspaceConfig = {
  workspace: defineMockWorkspace({
    id: "ws-government",
    name: "City Public Services",
    slug: "government",
    description: "Public service and licensing department",
    icon: "Landmark",
    color: "#d946ef",
    themePreset: "graphite",
    menuItems: governmentMenu,
    children: [
      defineMockWorkspace({
        id: "ws-gov-licensing",
        name: "Licensing Dept",
        slug: "licensing",
        icon: "Stamp",
        parentId: "ws-government",
        themePreset: "supabase",
        menuItems: licensingMenu,
      }),
      defineMockWorkspace({
        id: "ws-gov-pr",
        name: "Public Relations",
        slug: "public-relations",
        icon: "Megaphone",
        parentId: "ws-government",
        themePreset: "tangerine",
        menuItems: publicRelationsMenu,
      }),
      defineMockWorkspace({
        id: "ws-gov-treasury",
        name: "Treasury",
        slug: "treasury",
        icon: "Landmark",
        parentId: "ws-government",
        themePreset: "elegant-luxury",
        menuItems: treasuryMenu,
      }),
      defineMockWorkspace({
        id: "ws-gov-infra",
        name: "Infrastructure",
        slug: "infrastructure",
        icon: "Construction",
        parentId: "ws-government",
        themePreset: "caffeine",
        menuItems: infrastructureMenu,
      }),
    ],
  }),
};
