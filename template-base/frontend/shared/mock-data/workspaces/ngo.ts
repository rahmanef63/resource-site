/**
 * NGO / Foundation Workspace Configuration
 * Non-profit, Social Organizations
 */

import type { WorkspaceConfig } from "../types";
import { defineMockWorkspace, menuItem } from "./helpers";

const ngoMenu = [
  menuItem("ngo-main", "overview", "Foundation Overview", "LayoutDashboard"),
  menuItem("ngo-main", "crm", "Donor CRM", "Heart"),
  menuItem("ngo-main", "projects", "Social Programs", "FolderHeart"),
  menuItem("ngo-main", "contacts", "Volunteers", "Contact"),
  menuItem("ngo-main", "analytics", "Impact Reports", "PieChart"),
  menuItem("ngo-main", "knowledge", "SOPs & Guides", "BookOpen"),
  menuItem("ngo-main", "calendar", "Events Calendar", "CalendarHeart"),
];

const cleanWaterMenu = [
  menuItem("ngo-clean-water", "overview", "Program Overview", "LayoutDashboard"),
  menuItem("ngo-clean-water", "projects", "Field Projects", "FolderKanban"),
  menuItem("ngo-clean-water", "tasks", "Site Tasks", "CheckSquare"),
  menuItem("ngo-clean-water", "calendar", "Deployment Calendar", "Calendar"),
  menuItem("ngo-clean-water", "documents", "Program Docs", "FileText"),
  menuItem("ngo-clean-water", "communications", "Field Comms", "MessageCircle"),
  menuItem("ngo-clean-water", "analytics", "Impact Metrics", "BarChart3"),
];

const volunteersMenu = [
  menuItem("ngo-volunteers", "overview", "Volunteer Overview", "LayoutDashboard"),
  menuItem("ngo-volunteers", "contacts", "Volunteer Directory", "Contact"),
  menuItem("ngo-volunteers", "forms", "Signup Forms", "ClipboardList"),
  menuItem("ngo-volunteers", "calendar", "Shift Calendar", "Calendar"),
  menuItem("ngo-volunteers", "communications", "Volunteer Chat", "MessageCircle"),
  menuItem("ngo-volunteers", "tasks", "Volunteer Tasks", "CheckSquare"),
  menuItem("ngo-volunteers", "documents", "Training Docs", "FileText"),
];

const donorRelationsMenu = [
  menuItem("ngo-donors", "overview", "Donor Overview", "LayoutDashboard"),
  menuItem("ngo-donors", "crm", "Donor CRM", "Heart"),
  menuItem("ngo-donors", "analytics", "Fundraising Analytics", "BarChart3"),
  menuItem("ngo-donors", "reports", "Donor Reports", "FileBarChart"),
  menuItem("ngo-donors", "communications", "Donor Updates", "MessageCircle"),
  menuItem("ngo-donors", "calendar", "Stewardship Calendar", "Calendar"),
  menuItem("ngo-donors", "documents", "Grant Decks", "FileText"),
];

const grantsMenu = [
  menuItem("ngo-grants", "overview", "Grants Overview", "LayoutDashboard"),
  menuItem("ngo-grants", "accounting", "Grant Finance", "Coins"),
  menuItem("ngo-grants", "approvals", "Grant Approvals", "FileCheck"),
  menuItem("ngo-grants", "reports", "Compliance Reports", "FileBarChart"),
  menuItem("ngo-grants", "documents", "Grant Files", "FileText"),
  menuItem("ngo-grants", "tasks", "Submission Tasks", "CheckSquare"),
  menuItem("ngo-grants", "analytics", "Funding Analytics", "BarChart3"),
];

export const ngoConfig: WorkspaceConfig = {
  workspace: defineMockWorkspace({
    id: "ws-ngo",
    name: "Global Hope Foundation",
    slug: "ngo",
    description: "Humanitarian aid and social programs",
    icon: "HeartHandshake",
    color: "#10b981",
    themePreset: "nature",
    menuItems: ngoMenu,
    children: [
      defineMockWorkspace({
        id: "ws-ngo-program-a",
        name: "Clean Water Program",
        slug: "clean-water",
        icon: "Droplets",
        parentId: "ws-ngo",
        themePreset: "ocean-breeze",
        menuItems: cleanWaterMenu,
      }),
      defineMockWorkspace({
        id: "ws-ngo-volunteers",
        name: "Volunteer Management",
        slug: "volunteers",
        icon: "Users2",
        parentId: "ws-ngo",
        themePreset: "pastel-dreams",
        menuItems: volunteersMenu,
      }),
      defineMockWorkspace({
        id: "ws-ngo-donors",
        name: "Donor Relations",
        slug: "donor-relations",
        icon: "Heart",
        parentId: "ws-ngo",
        themePreset: "sunset-horizon",
        menuItems: donorRelationsMenu,
      }),
      defineMockWorkspace({
        id: "ws-ngo-grants",
        name: "Finance & Grants",
        slug: "grants",
        icon: "Coins",
        parentId: "ws-ngo",
        themePreset: "amber-minimal",
        menuItems: grantsMenu,
      }),
    ],
  }),
};
