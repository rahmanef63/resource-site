/**
 * Healthcare Workspace Configuration
 * Clinics, Hospitals, Pharmacies
 */

import type { WorkspaceConfig } from "../types";
import { defineMockWorkspace, menuItem } from "./helpers";

const healthcareMenu = [
  menuItem("health-main", "overview", "Hospital Overview", "LayoutDashboard"),
  menuItem("health-main", "crm", "Patient CRM", "Users"),
  menuItem("health-main", "calendar", "Appointments", "Calendar"),
  menuItem("health-main", "inventory", "Medical Inventory", "Package"),
  menuItem("health-main", "accounting", "Billing & Finance", "DollarSign"),
  menuItem("health-main", "support", "Patient Support", "Headphones"),
  menuItem("health-main", "tasks", "Duty Roster", "ClipboardCheck"),
];

const pharmacyMenu = [
  menuItem("health-pharmacy", "overview", "Pharmacy Overview", "LayoutDashboard"),
  menuItem("health-pharmacy", "inventory", "Medication Stock", "Package"),
  menuItem("health-pharmacy", "tasks", "Dispensing Queue", "ClipboardCheck"),
  menuItem("health-pharmacy", "approvals", "Prescription Approvals", "FileCheck"),
  menuItem("health-pharmacy", "documents", "Drug Records", "FileText"),
  menuItem("health-pharmacy", "analytics", "Usage Analytics", "BarChart3"),
  menuItem("health-pharmacy", "calendar", "Delivery Schedule", "Calendar"),
];

const patientRecordsMenu = [
  menuItem("health-records", "overview", "Records Overview", "LayoutDashboard"),
  menuItem("health-records", "documents", "Patient Files", "FileText"),
  menuItem("health-records", "database", "Clinical Database", "Database"),
  menuItem("health-records", "tasks", "Records Tasks", "ClipboardCheck"),
  menuItem("health-records", "approvals", "Release Approvals", "FileCheck"),
  menuItem("health-records", "analytics", "Access Analytics", "BarChart3"),
  menuItem("health-records", "calendar", "Review Calendar", "Calendar"),
];

const laboratoryMenu = [
  menuItem("health-lab", "overview", "Lab Overview", "LayoutDashboard"),
  menuItem("health-lab", "tasks", "Test Queue", "ClipboardCheck"),
  menuItem("health-lab", "documents", "Lab Reports", "FileText"),
  menuItem("health-lab", "approvals", "Result Verification", "FileCheck"),
  menuItem("health-lab", "analytics", "Sample Analytics", "BarChart3"),
  menuItem("health-lab", "calendar", "Equipment Schedule", "Calendar"),
  menuItem("health-lab", "inventory", "Lab Inventory", "Package"),
];

const healthAdminMenu = [
  menuItem("health-admin", "overview", "Admin Overview", "LayoutDashboard"),
  menuItem("health-admin", "accounting", "Billing", "DollarSign"),
  menuItem("health-admin", "reports", "Finance Reports", "FileBarChart"),
  menuItem("health-admin", "approvals", "Insurance Approvals", "FileCheck"),
  menuItem("health-admin", "crm", "Patient Accounts", "Users"),
  menuItem("health-admin", "tasks", "Admin Tasks", "ClipboardCheck"),
  menuItem("health-admin", "documents", "Compliance Docs", "FileText"),
];

export const healthcareConfig: WorkspaceConfig = {
  workspace: defineMockWorkspace({
    id: "ws-healthcare",
    name: "City General Hospital",
    slug: "healthcare",
    description: "Patient care and hospital management",
    icon: "Stethoscope",
    color: "#0ea5e9",
    themePreset: "clean-slate",
    menuItems: healthcareMenu,
    children: [
      defineMockWorkspace({
        id: "ws-health-pharmacy",
        name: "Pharmacy",
        slug: "pharmacy",
        icon: "Pill",
        parentId: "ws-healthcare",
        themePreset: "nature",
        menuItems: pharmacyMenu,
      }),
      defineMockWorkspace({
        id: "ws-health-records",
        name: "Patient Records",
        slug: "records",
        icon: "FileStack",
        parentId: "ws-healthcare",
        themePreset: "mono",
        menuItems: patientRecordsMenu,
      }),
      defineMockWorkspace({
        id: "ws-health-lab",
        name: "Laboratory",
        slug: "lab",
        icon: "TestTube",
        parentId: "ws-healthcare",
        themePreset: "supabase",
        menuItems: laboratoryMenu,
      }),
      defineMockWorkspace({
        id: "ws-health-admin",
        name: "Admin & Finance",
        slug: "admin",
        icon: "Building",
        parentId: "ws-healthcare",
        themePreset: "elegant-luxury",
        menuItems: healthAdminMenu,
      }),
    ],
  }),
};
