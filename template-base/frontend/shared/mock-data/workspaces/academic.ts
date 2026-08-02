/**
 * Academic Institution Workspace Configuration
 * Schools, Universities, Educational Institues
 */

import type { WorkspaceConfig } from "../types";
import { defineMockWorkspace, menuItem } from "./helpers";

const academicMenu = [
  menuItem("academic-main", "overview", "University Overview", "LayoutDashboard"),
  menuItem("academic-main", "contacts", "Directory", "Contact"),
  menuItem("academic-main", "knowledge", "Knowledge Base", "Library"),
  menuItem("academic-main", "forms", "Admissions", "ClipboardList"),
  menuItem("academic-main", "calendar", "Class Schedule", "Calendar"),
  menuItem("academic-main", "analytics", "Performance Analytics", "BarChart3"),
];

const facultyMenu = [
  menuItem("academic-faculty", "overview", "Faculty Overview", "LayoutDashboard"),
  menuItem("academic-faculty", "calendar", "Lecture Schedule", "Calendar"),
  menuItem("academic-faculty", "documents", "Course Materials", "FileText"),
  menuItem("academic-faculty", "knowledge", "Research Notes", "Library"),
  menuItem("academic-faculty", "tasks", "Department Tasks", "CheckSquare"),
  menuItem("academic-faculty", "analytics", "Faculty Metrics", "BarChart3"),
  menuItem("academic-faculty", "forms", "Lab Requests", "ClipboardList"),
];

const studentServicesMenu = [
  menuItem("academic-student-services", "overview", "Student Services Overview", "LayoutDashboard"),
  menuItem("academic-student-services", "contacts", "Student Directory", "Contact"),
  menuItem("academic-student-services", "forms", "Service Requests", "ClipboardList"),
  menuItem("academic-student-services", "support", "Student Support", "LifeBuoy"),
  menuItem("academic-student-services", "calendar", "Campus Calendar", "Calendar"),
  menuItem("academic-student-services", "communications", "Announcements", "MessageCircle"),
  menuItem("academic-student-services", "documents", "Policy Docs", "FileText"),
];

const researchGroupsMenu = [
  menuItem("academic-research", "overview", "Research Overview", "LayoutDashboard"),
  menuItem("academic-research", "projects", "Research Projects", "FolderKanban"),
  menuItem("academic-research", "documents", "Paper Drafts", "FileText"),
  menuItem("academic-research", "knowledge", "Research Wiki", "Library"),
  menuItem("academic-research", "calendar", "Lab Calendar", "Calendar"),
  menuItem("academic-research", "analytics", "Grant Metrics", "BarChart3"),
  menuItem("academic-research", "approvals", "Ethics Approvals", "FileCheck"),
];

const clubsMenu = [
  menuItem("academic-clubs", "overview", "Clubs Overview", "LayoutDashboard"),
  menuItem("academic-clubs", "calendar", "Event Schedule", "Calendar"),
  menuItem("academic-clubs", "communications", "Club Chat", "MessageCircle"),
  menuItem("academic-clubs", "forms", "Join Requests", "ClipboardList"),
  menuItem("academic-clubs", "contacts", "Member Directory", "Contact"),
  menuItem("academic-clubs", "projects", "Program Plans", "FolderKanban"),
  menuItem("academic-clubs", "documents", "Club Resources", "FileText"),
];

export const academicConfig: WorkspaceConfig = {
  workspace: defineMockWorkspace({
    id: "ws-academic",
    name: "Grand University",
    slug: "academic",
    description: "Main university administration and faculties",
    icon: "GraduationCap",
    color: "#7c3aed",
    themePreset: "perpetuity",
    menuItems: academicMenu,
    children: [
      defineMockWorkspace({
        id: "ws-acad-faculty",
        name: "Faculty of Science",
        slug: "science-faculty",
        icon: "Microscope",
        parentId: "ws-academic",
        themePreset: "claude",
        menuItems: facultyMenu,
      }),
      defineMockWorkspace({
        id: "ws-acad-student-services",
        name: "Student Services",
        slug: "student-services",
        icon: "Users",
        parentId: "ws-academic",
        themePreset: "ocean-breeze",
        menuItems: studentServicesMenu,
      }),
      defineMockWorkspace({
        id: "ws-acad-research",
        name: "Research Groups",
        slug: "research",
        icon: "FlaskConical",
        parentId: "ws-academic",
        themePreset: "starry-night",
        menuItems: researchGroupsMenu,
      }),
      defineMockWorkspace({
        id: "ws-acad-clubs",
        name: "Extracurricular Clubs",
        slug: "clubs",
        icon: "Tent",
        parentId: "ws-academic",
        themePreset: "sunset-horizon",
        menuItems: clubsMenu,
      }),
    ],
  }),
};
