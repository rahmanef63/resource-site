/**
 * Creative Agency Workspace Configuration
 * Design Studios, Media Companies, Software Houses
 */

import type { WorkspaceConfig } from "../types";
import { defineMockWorkspace, menuItem } from "./helpers";

const creativeAgencyMenu = [
  menuItem("creative-main", "overview", "Studio Overview", "LayoutDashboard"),
  menuItem("creative-main", "projects", "Projects", "FolderKanban"),
  menuItem("creative-main", "tasks", "My Tasks", "CheckSquare"),
  menuItem("creative-main", "calendar", "Schedule", "Calendar"),
  menuItem("creative-main", "communications", "Team Chat", "MessageCircle", { badge: 3 }),
  menuItem("creative-main", "documents", "Asset Library", "Image"),
  menuItem("creative-main", "knowledge", "Brand Guidelines", "Book"),
  menuItem("creative-main", "approvals", "Client Invoices", "FileCheck"),
];

const clientAWorkspaceMenu = [
  menuItem("creative-client-a", "overview", "Client A Overview", "LayoutDashboard"),
  menuItem("creative-client-a", "projects", "Campaign Projects", "FolderKanban"),
  menuItem("creative-client-a", "tasks", "Delivery Tasks", "CheckSquare"),
  menuItem("creative-client-a", "documents", "Creative Assets", "Image"),
  menuItem("creative-client-a", "approvals", "Feedback Queue", "FileCheck"),
  menuItem("creative-client-a", "communications", "Client Chat", "MessageCircle"),
  menuItem("creative-client-a", "calendar", "Review Calendar", "Calendar"),
];

const clientBWorkspaceMenu = [
  menuItem("creative-client-b", "overview", "Client B Overview", "LayoutDashboard"),
  menuItem("creative-client-b", "projects", "Launch Projects", "FolderKanban"),
  menuItem("creative-client-b", "marketing", "Campaign Planner", "Megaphone"),
  menuItem("creative-client-b", "communications", "Stakeholder Chat", "MessageCircle"),
  menuItem("creative-client-b", "documents", "Brand Assets", "Image"),
  menuItem("creative-client-b", "approvals", "Approval Flow", "FileCheck"),
  menuItem("creative-client-b", "analytics", "Campaign Analytics", "BarChart3"),
];

const internalDesignMenu = [
  menuItem("creative-internal", "overview", "Design Team Overview", "LayoutDashboard"),
  menuItem("creative-internal", "tasks", "Studio Tasks", "CheckSquare"),
  menuItem("creative-internal", "calendar", "Sprint Calendar", "Calendar"),
  menuItem("creative-internal", "documents", "Design Files", "Image"),
  menuItem("creative-internal", "knowledge", "Design System", "Book"),
  menuItem("creative-internal", "communications", "Design Chat", "MessageCircle"),
  menuItem("creative-internal", "ai", "AI Moodboard", "Sparkles"),
];

const productionHubMenu = [
  menuItem("creative-production", "overview", "Production Overview", "LayoutDashboard"),
  menuItem("creative-production", "projects", "Content Pipeline", "FolderKanban"),
  menuItem("creative-production", "content", "Publishing Queue", "Clapperboard"),
  menuItem("creative-production", "calendar", "Shoot Schedule", "Calendar"),
  menuItem("creative-production", "documents", "Shot Lists", "FileText"),
  menuItem("creative-production", "communications", "Crew Chat", "MessageCircle"),
  menuItem("creative-production", "approvals", "Delivery Sign-off", "FileCheck"),
];

export const creativeAgencyConfig: WorkspaceConfig = {
  workspace: defineMockWorkspace({
    id: "ws-creative",
    name: "Pixel Perfect Studio",
    slug: "creative",
    description: "Creative design and media production studio",
    icon: "Palette",
    color: "#ec4899",
    themePreset: "quantum-rose",
    menuItems: creativeAgencyMenu,
    children: [
      defineMockWorkspace({
        id: "ws-creative-client-a",
        name: "Client A Workspace",
        slug: "client-a",
        icon: "Briefcase",
        parentId: "ws-creative",
        themePreset: "vintage-paper",
        menuItems: clientAWorkspaceMenu,
      }),
      defineMockWorkspace({
        id: "ws-creative-client-b",
        name: "Client B Workspace",
        slug: "client-b",
        icon: "Briefcase",
        parentId: "ws-creative",
        themePreset: "neo-brutalism",
        menuItems: clientBWorkspaceMenu,
      }),
      defineMockWorkspace({
        id: "ws-creative-internal",
        name: "Internal Design Team",
        slug: "internal-design",
        icon: "PenTool",
        parentId: "ws-creative",
        themePreset: "pastel-dreams",
        menuItems: internalDesignMenu,
      }),
      defineMockWorkspace({
        id: "ws-creative-production",
        name: "Content Production Hub",
        slug: "production",
        icon: "Video",
        parentId: "ws-creative",
        themePreset: "cyberpunk",
        menuItems: productionHubMenu,
      }),
    ],
  }),
};
