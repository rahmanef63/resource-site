/**
 * Website Settings Hook
 * 
 * Custom hook for managing website settings with Convex.
 * Provides type-safe interface for CRUD operations on website settings.
 * 
 * @example
 * ```tsx
 * const { settings, loading, updateSettings, verifyDomain } = useWebsiteSettings(workspaceId);
 * 
 * // Update settings
 * await updateSettings({
 *   subdomain: 'mysite',
 *   siteTitle: 'My Website'
 * });
 * 
 * // Verify domain
 * const { verified } = await verifyDomain('www.mysite.com');
 * ```
 */

import { useQuery, useMutation } from "convex/react";
import { api } from "@convex/_generated/api";
import type { Id } from "@convex/_generated/dataModel";

export interface WebsiteSettingsData {
  // Domain settings
  subdomain?: string;
  customDomain?: string;
  useCustomDomain?: boolean;
  
  // SEO settings
  siteTitle?: string;
  siteDescription?: string;
  keywords?: string;
  favicon?: string;
  ogImage?: string;
  
  // Analytics
  googleAnalyticsId?: string;
  facebookPixelId?: string;
  
  // Social media
  twitterHandle?: string;
  facebookPage?: string;
  linkedinPage?: string;
  
  // Advanced
  robotsTxt?: string;
  customCss?: string;
  customHeadCode?: string;
}

export interface UseWebsiteSettingsReturn {
  /** Current website settings (null if not yet created) */
  settings: any | null;
  
  /** Loading state */
  loading: boolean;
  
  /** Update or create website settings */
  updateSettings: (data: WebsiteSettingsData) => Promise<any>;
  
  /** Verify custom domain */
  verifyDomain: (domain: string) => Promise<{ verified: boolean }>;
  
  /** Check if subdomain is available */
  checkSubdomain: (subdomain: string) => Promise<boolean>;
  
  /** Check if custom domain is available */
  checkCustomDomain: (domain: string) => Promise<boolean>;
}

/**
 * Hook to manage website settings for a workspace
 */
export function useWebsiteSettings(workspaceId: Id<"workspaces"> | null): UseWebsiteSettingsReturn {
  // Query current settings - skip if workspaceId is null
  const settings = useQuery(
    api.features.cmsLite.website_settings.api.queries.getWebsiteSettings,
    workspaceId ? { workspaceId } : "skip"
  );
  
  // Mutations
  const updateSettingsMutation = useMutation(
    api.features.cmsLite.website_settings.api.mutations.updateWebsiteSettings
  );
  
  const verifyDomainMutation = useMutation(
    api.features.cmsLite.website_settings.api.mutations.verifyDomain
  );
  
  const updateSettings = async (data: WebsiteSettingsData) => {
    if (!workspaceId) {
      throw new Error("No workspace ID available");
    }
    return await updateSettingsMutation({
      workspaceId,
      ...data,
    });
  };
  
  const verifyDomain = async (domain: string) => {
    if (!workspaceId) {
      throw new Error("No workspace ID available");
    }
    return await verifyDomainMutation({
      workspaceId,
      domain,
    });
  };
  
  // For checking availability, we'll use direct queries (not mutations)
  // These should be called from the component directly using useQuery
  // But for backward compatibility, we provide async wrappers
  const checkSubdomain = async (subdomain: string): Promise<boolean> => {
    // This is a placeholder - ideally this should use a separate useQuery
    // For now, return true to allow any subdomain
    console.warn('checkSubdomain: Use useQuery directly in component for reactive updates');
    return true;
  };
  
  const checkCustomDomain = async (domain: string): Promise<boolean> => {
    // This is a placeholder - ideally this should use a separate useQuery
    // For now, return true to allow any domain
    console.warn('checkCustomDomain: Use useQuery directly in component for reactive updates');
    return true;
  };
  
  return {
    settings,
    loading: settings === undefined,
    updateSettings,
    verifyDomain,
    checkSubdomain,
    checkCustomDomain,
  };
}

