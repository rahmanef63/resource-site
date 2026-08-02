"use client";

import { useQuery, useMutation } from "convex/react";
import { Id } from "@/convex/_generated/dataModel";
import { api } from "@/frontend/shared/foundation/utils/convex/any-api";

/**
 * Industry Templates Hooks
 * React hooks for the industry templates feature
 * 
 * NOTE: These hooks reference api.features.industryTemplates which will be available
 * after running `npx convex dev` to regenerate the Convex API types.
 */

// Types
export type IndustryCategory =
  | "restaurant"
  | "retail"
  | "healthcare"
  | "education"
  | "professional_services"
  | "manufacturing"
  | "hospitality"
  | "real_estate"
  | "fitness"
  | "salon_spa"
  | "automotive"
  | "construction"
  | "nonprofit"
  | "technology"
  | "creative_agency"
  | "logistics"
  | "custom";

export type FeatureModule =
  | "pos"
  | "inventory"
  | "crm"
  | "marketing"
  | "hr"
  | "accounting"
  | "projects"
  | "support"
  | "bi"
  | "forms"
  | "workflows"
  | "docs"
  | "chat"
  | "calendar"
  | "bookings"
  | "cms"
  | "analytics"
  | "integrations";

export interface InstallOptions {
  includeSampleData: boolean;
  selectedFeatures: FeatureModule[];
  customizations?: Record<string, unknown>;
}

// Any-api helper avoids TS2589 on generated types
const industryTemplatesApi = api.features?.industryTemplates;
export const hasIndustryTemplatesQueryApi = Boolean(industryTemplatesApi?.queries?.getTemplates)

// Query Hooks
export function useTemplates(options?: {
  category?: string;
  search?: string;
  isOfficial?: boolean;
  isPremium?: boolean;
  limit?: number;
}) {
  return useQuery(
    industryTemplatesApi?.queries?.getTemplates ?? "skip",
    industryTemplatesApi ? (options ?? {}) : "skip"
  );
}

export function useTemplateById(templateId: Id<"industryTemplates"> | undefined) {
  return useQuery(
    industryTemplatesApi?.queries?.getTemplateById ?? "skip",
    industryTemplatesApi && templateId ? { templateId } : "skip"
  );
}

export function useTemplatesByCategory(category: string) {
  return useQuery(
    industryTemplatesApi?.queries?.getTemplatesByCategory ?? "skip",
    industryTemplatesApi ? { category } : "skip"
  );
}

export function useFeaturedTemplates(limit?: number) {
  return useQuery(
    industryTemplatesApi?.queries?.getFeaturedTemplates ?? "skip",
    industryTemplatesApi ? { limit } : "skip"
  );
}

export function usePopularTemplates(limit?: number) {
  return useQuery(
    industryTemplatesApi?.queries?.getPopularTemplates ?? "skip",
    industryTemplatesApi ? { limit } : "skip"
  );
}

export function useCategories() {
  return useQuery(
    industryTemplatesApi?.queries?.getCategories ?? "skip",
    industryTemplatesApi ? {} : "skip"
  );
}

export function useMyTemplates(userId: Id<"users"> | undefined) {
  return useQuery(
    industryTemplatesApi?.queries?.getMyTemplates ?? "skip",
    industryTemplatesApi && userId ? { userId } : "skip"
  );
}

export function useMyCustomizations(userId: Id<"users"> | undefined) {
  return useQuery(
    industryTemplatesApi?.queries?.getMyCustomizations ?? "skip",
    industryTemplatesApi && userId ? { userId } : "skip"
  );
}

export function useInstallationHistory(workspaceId: Id<"workspaces"> | undefined) {
  return useQuery(
    industryTemplatesApi?.queries?.getInstallationHistory ?? "skip",
    industryTemplatesApi && workspaceId ? { workspaceId } : "skip"
  );
}

export function useTemplateReviews(
  templateId: Id<"industryTemplates"> | undefined,
  options?: { limit?: number; offset?: number }
) {
  return useQuery(
    industryTemplatesApi?.queries?.getTemplateReviews ?? "skip",
    industryTemplatesApi && templateId ? { templateId, ...options } : "skip"
  );
}

export function useTemplateGuides(templateId: Id<"industryTemplates"> | undefined) {
  return useQuery(
    industryTemplatesApi?.queries?.getTemplateGuides ?? "skip",
    industryTemplatesApi && templateId ? { templateId } : "skip"
  );
}

export function useCompareTemplates(templateIds: Id<"industryTemplates">[]) {
  return useQuery(
    industryTemplatesApi?.queries?.compareTemplates ?? "skip",
    industryTemplatesApi && templateIds.length > 0 ? { templateIds } : "skip"
  );
}

export function useSearchTemplates(searchQuery: string | undefined) {
  return useQuery(
    industryTemplatesApi?.queries?.searchTemplates ?? "skip",
    industryTemplatesApi && searchQuery ? { searchQuery } : "skip"
  );
}

// Mutation Hooks - these will return undefined until Convex types are regenerated
export function useCreateTemplate() {
  return useMutation(industryTemplatesApi?.mutations?.createTemplate);
}

export function useUpdateTemplate() {
  return useMutation(industryTemplatesApi?.mutations?.updateTemplate);
}

export function useDeleteTemplate() {
  return useMutation(industryTemplatesApi?.mutations?.deleteTemplate);
}

export function useInstallTemplate() {
  return useMutation(industryTemplatesApi?.mutations?.installTemplate);
}

export function useCompleteInstallation() {
  return useMutation(industryTemplatesApi?.mutations?.completeInstallation);
}

export function useRollbackInstallation() {
  return useMutation(industryTemplatesApi?.mutations?.rollbackInstallation);
}

export function useCreateReview() {
  return useMutation(industryTemplatesApi?.mutations?.createReview);
}

export function useUpdateReview() {
  return useMutation(industryTemplatesApi?.mutations?.updateReview);
}

export function useDeleteReview() {
  return useMutation(industryTemplatesApi?.mutations?.deleteReview);
}

export function useMarkReviewHelpful() {
  return useMutation(industryTemplatesApi?.mutations?.markReviewHelpful);
}

export function useSaveCustomization() {
  return useMutation(industryTemplatesApi?.mutations?.saveCustomization);
}

export function useUpdateCustomization() {
  return useMutation(industryTemplatesApi?.mutations?.updateCustomization);
}

export function useDeleteCustomization() {
  return useMutation(industryTemplatesApi?.mutations?.deleteCustomization);
}

export function useCreateGuide() {
  return useMutation(industryTemplatesApi?.mutations?.createGuide);
}

export function useUpdateGuide() {
  return useMutation(industryTemplatesApi?.mutations?.updateGuide);
}

export function useDeleteGuide() {
  return useMutation(industryTemplatesApi?.mutations?.deleteGuide);
}

export function useCloneTemplate() {
  return useMutation(industryTemplatesApi?.mutations?.cloneTemplate);
}

// Feature module metadata
export const featureModules: Record<FeatureModule, { name: string; description: string; icon: string }> = {
  pos: { name: "Point of Sale", description: "Process sales and manage transactions", icon: "credit-card" },
  inventory: { name: "Inventory", description: "Track stock and manage products", icon: "package" },
  crm: { name: "CRM", description: "Manage customer relationships", icon: "users" },
  marketing: { name: "Marketing", description: "Campaigns, email, and automation", icon: "megaphone" },
  hr: { name: "HR", description: "Employee management and payroll", icon: "user-cog" },
  accounting: { name: "Accounting", description: "Financial management and reporting", icon: "calculator" },
  projects: { name: "Projects", description: "Project management and tasks", icon: "folder-kanban" },
  support: { name: "Support", description: "Help desk and ticketing", icon: "headset" },
  bi: { name: "Business Intelligence", description: "Dashboards and analytics", icon: "bar-chart-3" },
  forms: { name: "Forms", description: "Custom forms and surveys", icon: "clipboard-list" },
  workflows: { name: "Workflows", description: "Automate business processes", icon: "git-branch" },
  docs: { name: "Documents", description: "Document management and collaboration", icon: "file-text" },
  chat: { name: "Chat", description: "Team communication", icon: "message-circle" },
  calendar: { name: "Calendar", description: "Scheduling and events", icon: "calendar" },
  bookings: { name: "Bookings", description: "Appointment scheduling", icon: "calendar-check" },
  cms: { name: "CMS", description: "Content management system", icon: "layout" },
  analytics: { name: "Analytics", description: "Track metrics and performance", icon: "trending-up" },
  integrations: { name: "Integrations", description: "Connect external services", icon: "plug" },
};

// Category metadata
export const categoryMetadata: Record<IndustryCategory, { name: string; icon: string; description: string }> = {
  restaurant: { name: "Restaurant", icon: "utensils", description: "Restaurants, cafes, bars, and food service" },
  retail: { name: "Retail", icon: "shopping-bag", description: "Stores, boutiques, and e-commerce" },
  healthcare: { name: "Healthcare", icon: "heart-pulse", description: "Clinics, hospitals, and medical practices" },
  education: { name: "Education", icon: "graduation-cap", description: "Schools, tutoring, and training" },
  professional_services: { name: "Professional Services", icon: "briefcase", description: "Law firms, consultants, and agencies" },
  manufacturing: { name: "Manufacturing", icon: "factory", description: "Production and assembly" },
  hospitality: { name: "Hospitality", icon: "bed", description: "Hotels, B&Bs, and vacation rentals" },
  real_estate: { name: "Real Estate", icon: "building", description: "Agents, property management, and development" },
  fitness: { name: "Fitness", icon: "dumbbell", description: "Gyms, studios, and personal training" },
  salon_spa: { name: "Salon & Spa", icon: "scissors", description: "Hair salons, nail bars, and wellness" },
  automotive: { name: "Automotive", icon: "car", description: "Dealerships, repair shops, and services" },
  construction: { name: "Construction", icon: "hard-hat", description: "Contractors, builders, and trades" },
  nonprofit: { name: "Nonprofit", icon: "heart", description: "Charities, foundations, and NGOs" },
  technology: { name: "Technology", icon: "laptop", description: "Software, IT services, and startups" },
  creative_agency: { name: "Creative Agency", icon: "palette", description: "Design, marketing, and media" },
  logistics: { name: "Logistics", icon: "truck", description: "Shipping, warehousing, and delivery" },
  custom: { name: "Custom", icon: "settings", description: "Build your own configuration" },
};
