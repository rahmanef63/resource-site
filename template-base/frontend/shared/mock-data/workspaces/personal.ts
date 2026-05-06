/**
 * Personal Productivity Workspace Configuration
 * Freelancers, Solopreneurs, Content Creators
 */

import type { WorkspaceConfig } from "../types";
import { defineMockWorkspace, menuItem } from "./helpers";

const personalMenu = [
  menuItem("personal-main", "overview", "Personal Overview", "LayoutDashboard"),
  menuItem("personal-main", "calendar", "My Schedule", "Calendar"),
  menuItem("personal-main", "tasks", "To-Do List", "CheckCircle"),
  menuItem("personal-main", "crm", "Client CRM", "Users"),
  menuItem("personal-main", "documents", "Notes & Ideas", "StickyNote"),
  menuItem("personal-main", "projects", "Content Planner", "Trello"),
  menuItem("personal-main", "ai", "AI Brain", "Sparkles"),
];

const secondBrainMenu = [
  menuItem("personal-knowledge", "overview", "Second Brain Overview", "LayoutDashboard"),
  menuItem("personal-knowledge", "knowledge", "Knowledge Hub", "Brain"),
  menuItem("personal-knowledge", "documents", "Notes", "StickyNote"),
  menuItem("personal-knowledge", "ai", "AI Brainstorm", "Sparkles"),
  menuItem("personal-knowledge", "tasks", "Research Tasks", "CheckCircle"),
  menuItem("personal-knowledge", "projects", "Idea Vault", "Trello"),
  menuItem("personal-knowledge", "calendar", "Review Calendar", "Calendar"),
];

const financeTrackerMenu = [
  menuItem("personal-finance", "overview", "Finance Overview", "LayoutDashboard"),
  menuItem("personal-finance", "accounting", "Ledger", "PiggyBank"),
  menuItem("personal-finance", "reports", "Finance Reports", "FileBarChart"),
  menuItem("personal-finance", "analytics", "Budget Analytics", "BarChart3"),
  menuItem("personal-finance", "tasks", "Bill Reminders", "CheckCircle"),
  menuItem("personal-finance", "documents", "Receipts", "FileText"),
  menuItem("personal-finance", "calendar", "Payment Calendar", "Calendar"),
];

const clientSpaceMenu = [
  menuItem("personal-clients", "overview", "Client Space Overview", "LayoutDashboard"),
  menuItem("personal-clients", "crm", "Clients", "Users"),
  menuItem("personal-clients", "projects", "Delivery Projects", "Trello"),
  menuItem("personal-clients", "documents", "Proposals", "FileText"),
  menuItem("personal-clients", "communications", "Client Messages", "MessageCircle"),
  menuItem("personal-clients", "calendar", "Call Calendar", "Calendar"),
  menuItem("personal-clients", "tasks", "Follow-ups", "CheckCircle"),
];

const contentCreationMenu = [
  menuItem("personal-content", "overview", "Content Overview", "LayoutDashboard"),
  menuItem("personal-content", "content", "Content Studio", "PenTool"),
  menuItem("personal-content", "projects", "Production Board", "Trello"),
  menuItem("personal-content", "calendar", "Publishing Calendar", "Calendar"),
  menuItem("personal-content", "analytics", "Channel Analytics", "BarChart3"),
  menuItem("personal-content", "documents", "Drafts", "FileText"),
  menuItem("personal-content", "ai", "AI Drafting", "Sparkles"),
];

export const personalConfig: WorkspaceConfig = {
  workspace: defineMockWorkspace({
    id: "ws-personal",
    name: "Alex's Studio",
    slug: "personal",
    description: "Personal productivity and freelance hub",
    icon: "User",
    color: "#8b5cf6",
    themePreset: "pastel-dreams",
    menuItems: personalMenu,
    children: [
      defineMockWorkspace({
        id: "ws-personal-knowledge",
        name: "Second Brain",
        slug: "knowledge-base",
        icon: "Brain",
        parentId: "ws-personal",
        themePreset: "midnight-bloom",
        menuItems: secondBrainMenu,
      }),
      defineMockWorkspace({
        id: "ws-personal-finance",
        name: "Finance Tracker",
        slug: "finance",
        icon: "PiggyBank",
        parentId: "ws-personal",
        themePreset: "amber-minimal",
        menuItems: financeTrackerMenu,
      }),
      defineMockWorkspace({
        id: "ws-personal-clients",
        name: "Client Space",
        slug: "clients",
        icon: "Briefcase",
        parentId: "ws-personal",
        themePreset: "ocean-breeze",
        menuItems: clientSpaceMenu,
      }),
      defineMockWorkspace({
        id: "ws-personal-content",
        name: "Content Creation",
        slug: "content",
        icon: "PenTool",
        parentId: "ws-personal",
        themePreset: "candyland",
        menuItems: contentCreationMenu,
      }),
    ],
  }),
};
