/**
 * Construction Workspace Configuration
 * Property Developers, Interior Design Firms
 */

import type { WorkspaceConfig } from "../types";
import { defineMockWorkspace, menuItem } from "./helpers";

const constructionMenu = [
  menuItem("construction-main", "overview", "Construction Overview", "LayoutDashboard"),
  menuItem("construction-main", "projects", "Site Projects", "FolderKanban"),
  menuItem("construction-main", "documents", "Blueprints", "Map"),
  menuItem("construction-main", "tasks", "Field Tasks", "CheckSquare"),
  menuItem("construction-main", "approvals", "Material Approvals", "FileCheck"),
  menuItem("construction-main", "accounting", "Project Budget", "DollarSign"),
  menuItem("construction-main", "crm", "Client Updates", "MessageSquare"),
];

const highriseMenu = [
  menuItem("construction-highrise", "overview", "Highrise Overview", "LayoutDashboard"),
  menuItem("construction-highrise", "projects", "Build Plan", "FolderKanban"),
  menuItem("construction-highrise", "tasks", "Site Tasks", "CheckSquare"),
  menuItem("construction-highrise", "documents", "Site Drawings", "Map"),
  menuItem("construction-highrise", "approvals", "Inspection Approvals", "FileCheck"),
  menuItem("construction-highrise", "calendar", "Milestone Calendar", "Calendar"),
  menuItem("construction-highrise", "analytics", "Progress Analytics", "BarChart3"),
];

const renovationMenu = [
  menuItem("construction-renovation", "overview", "Renovation Overview", "LayoutDashboard"),
  menuItem("construction-renovation", "projects", "Renovation Plan", "FolderKanban"),
  menuItem("construction-renovation", "tasks", "Crew Tasks", "CheckSquare"),
  menuItem("construction-renovation", "documents", "Design Specs", "Map"),
  menuItem("construction-renovation", "approvals", "Change Orders", "FileCheck"),
  menuItem("construction-renovation", "crm", "Homeowner Updates", "MessageSquare"),
  menuItem("construction-renovation", "calendar", "Visit Schedule", "Calendar"),
];

const procurementMenu = [
  menuItem("construction-procurement", "overview", "Procurement Overview", "LayoutDashboard"),
  menuItem("construction-procurement", "inventory", "Material Orders", "Truck"),
  menuItem("construction-procurement", "approvals", "PO Approvals", "FileCheck"),
  menuItem("construction-procurement", "accounting", "Vendor Spend", "DollarSign"),
  menuItem("construction-procurement", "documents", "Contracts", "FileText"),
  menuItem("construction-procurement", "tasks", "Follow-up Tasks", "CheckSquare"),
  menuItem("construction-procurement", "reports", "Procurement Reports", "FileBarChart"),
];

const vendorManagementMenu = [
  menuItem("construction-vendors", "overview", "Vendor Overview", "LayoutDashboard"),
  menuItem("construction-vendors", "crm", "Vendor Directory", "Users"),
  menuItem("construction-vendors", "approvals", "Vendor Compliance", "FileCheck"),
  menuItem("construction-vendors", "documents", "Vendor Files", "FileText"),
  menuItem("construction-vendors", "tasks", "Coordination Tasks", "CheckSquare"),
  menuItem("construction-vendors", "calendar", "Delivery Calendar", "Calendar"),
  menuItem("construction-vendors", "communications", "Vendor Chat", "MessageCircle"),
];

export const constructionConfig: WorkspaceConfig = {
  workspace: defineMockWorkspace({
    id: "ws-construction",
    name: "BuildRight Construction",
    slug: "construction",
    description: "Construction and property development",
    icon: "HardHat",
    color: "#eab308",
    themePreset: "caffeine",
    menuItems: constructionMenu,
    children: [
      defineMockWorkspace({
        id: "ws-const-project-1",
        name: "Sky Highrise",
        slug: "project-highrise",
        icon: "Building",
        parentId: "ws-construction",
        themePreset: "graphite",
        menuItems: highriseMenu,
      }),
      defineMockWorkspace({
        id: "ws-const-project-2",
        name: "Villa Renovation",
        slug: "project-renovation",
        icon: "Home",
        parentId: "ws-construction",
        themePreset: "vintage-paper",
        menuItems: renovationMenu,
      }),
      defineMockWorkspace({
        id: "ws-const-procurement",
        name: "Procurement",
        slug: "procurement",
        icon: "Truck",
        parentId: "ws-construction",
        themePreset: "amber-minimal",
        menuItems: procurementMenu,
      }),
      defineMockWorkspace({
        id: "ws-const-vendors",
        name: "Vendor Management",
        slug: "vendors",
        icon: "Users",
        parentId: "ws-construction",
        themePreset: "bold-tech",
        menuItems: vendorManagementMenu,
      }),
    ],
  }),
};
