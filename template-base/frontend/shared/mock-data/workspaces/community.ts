/**
 * Community Workspace Configuration
 * Clubs, Societies, Social Groups
 */

import type { WorkspaceConfig } from "../types";
import { defineMockWorkspace, menuItem } from "./helpers";

const communityMenu = [
  menuItem("community-main", "overview", "Community Overview", "LayoutDashboard"),
  menuItem("community-main", "contacts", "Member Directory", "Contact"),
  menuItem("community-main", "calendar", "Events Calendar", "CalendarCheck"),
  menuItem("community-main", "communications", "General Chat", "MessageSquare"),
  menuItem("community-main", "crm", "Sponsors CRM", "Handshake"),
  menuItem("community-main", "knowledge", "Club Rules", "Book"),
];

const committeeMenu = [
  menuItem("community-committee", "overview", "Committee Overview", "LayoutDashboard"),
  menuItem("community-committee", "documents", "Meeting Notes", "FileText"),
  menuItem("community-committee", "tasks", "Committee Tasks", "CheckSquare"),
  menuItem("community-committee", "calendar", "Governance Calendar", "CalendarCheck"),
  menuItem("community-committee", "approvals", "Budget Approvals", "FileCheck"),
  menuItem("community-committee", "contacts", "Committee Directory", "Contact"),
  menuItem("community-committee", "analytics", "Membership Metrics", "BarChart3"),
];

const eventTeamMenu = [
  menuItem("community-events", "overview", "Events Overview", "LayoutDashboard"),
  menuItem("community-events", "calendar", "Event Calendar", "CalendarCheck"),
  menuItem("community-events", "projects", "Event Plans", "FolderKanban"),
  menuItem("community-events", "tasks", "Run-of-show Tasks", "CheckSquare"),
  menuItem("community-events", "communications", "Volunteer Chat", "MessageSquare"),
  menuItem("community-events", "forms", "RSVP Forms", "ClipboardList"),
  menuItem("community-events", "contacts", "Partner Directory", "Contact"),
];

const membershipMenu = [
  menuItem("community-membership", "overview", "Membership Overview", "LayoutDashboard"),
  menuItem("community-membership", "contacts", "Member Records", "Contact"),
  menuItem("community-membership", "forms", "Registration Forms", "ClipboardList"),
  menuItem("community-membership", "user-management", "Roles & Access", "Users"),
  menuItem("community-membership", "communications", "Welcome Messages", "MessageSquare"),
  menuItem("community-membership", "reports", "Retention Reports", "FileBarChart"),
  menuItem("community-membership", "tasks", "Renewal Tasks", "CheckSquare"),
];

const fundraisingMenu = [
  menuItem("community-fundraising", "overview", "Fundraising Overview", "LayoutDashboard"),
  menuItem("community-fundraising", "crm", "Sponsor CRM", "Heart"),
  menuItem("community-fundraising", "projects", "Fundraising Campaigns", "FolderKanban"),
  menuItem("community-fundraising", "analytics", "Donation Analytics", "BarChart3"),
  menuItem("community-fundraising", "calendar", "Campaign Calendar", "CalendarCheck"),
  menuItem("community-fundraising", "communications", "Sponsor Updates", "MessageSquare"),
  menuItem("community-fundraising", "documents", "Fundraising Decks", "FileText"),
];

export const communityConfig: WorkspaceConfig = {
  workspace: defineMockWorkspace({
    id: "ws-community",
    name: "Tech Enthusiasts Club",
    slug: "community",
    description: "Community hub for tech lovers",
    icon: "Users2",
    color: "#f43f5e",
    themePreset: "claymorphism",
    menuItems: communityMenu,
    children: [
      defineMockWorkspace({
        id: "ws-comm-committee",
        name: "Committee",
        slug: "committee",
        icon: "Gavel",
        parentId: "ws-community",
        themePreset: "perpetuity",
        menuItems: committeeMenu,
      }),
      defineMockWorkspace({
        id: "ws-comm-events",
        name: "Event Team",
        slug: "events-team",
        icon: "PartyPopper",
        parentId: "ws-community",
        themePreset: "candyland",
        menuItems: eventTeamMenu,
      }),
      defineMockWorkspace({
        id: "ws-comm-membership",
        name: "Membership Mgmt",
        slug: "membership",
        icon: "IdCard",
        parentId: "ws-community",
        themePreset: "bubblegum",
        menuItems: membershipMenu,
      }),
      defineMockWorkspace({
        id: "ws-comm-fundraising",
        name: "Fundraising",
        slug: "fundraising",
        icon: "Heart",
        parentId: "ws-community",
        themePreset: "sunset-horizon",
        menuItems: fundraisingMenu,
      }),
    ],
  }),
};
