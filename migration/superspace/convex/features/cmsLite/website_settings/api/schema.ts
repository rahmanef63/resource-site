/**
 * CMS Lite Website Settings Schema
 * 
 * Stores website configuration including domain, SEO, analytics, and social media settings.
 * One settings record per workspace.
 */

import { defineTable } from "convex/server";
import { v } from "convex/values";

export const websiteSettingsTable = defineTable({
  // Workspace association
  workspaceId: v.id("workspaces"),
  
  // Domain Settings
  subdomain: v.optional(v.string()), // e.g., "mysite" → mysite.superspace.app
  customDomain: v.optional(v.string()), // e.g., "www.mysite.com"
  useCustomDomain: v.optional(v.boolean()), // Whether to use custom domain or subdomain
  domainVerified: v.optional(v.boolean()), // Whether custom domain DNS is verified
  domainVerifiedAt: v.optional(v.number()), // Timestamp of last successful verification
  
  // SEO Settings
  siteTitle: v.optional(v.string()), // Browser tab title
  siteDescription: v.optional(v.string()), // Meta description (max 160 chars)
  keywords: v.optional(v.string()), // Comma-separated keywords
  favicon: v.optional(v.string()), // URL to favicon
  ogImage: v.optional(v.string()), // URL to Open Graph image (social share)
  
  // Analytics & Tracking
  googleAnalyticsId: v.optional(v.string()), // GA4 measurement ID (G-XXXXXXXXXX)
  facebookPixelId: v.optional(v.string()), // Facebook Pixel ID
  
  // Social Media Links
  twitterHandle: v.optional(v.string()), // Twitter/X username
  facebookPage: v.optional(v.string()), // Facebook page slug
  linkedinPage: v.optional(v.string()), // LinkedIn page slug
  
  // Advanced Settings
  robotsTxt: v.optional(v.string()), // Custom robots.txt content
  customCss: v.optional(v.string()), // Custom CSS injected into pages
  customHeadCode: v.optional(v.string()), // Custom HTML injected into <head>
  
  // Metadata
  createdAt: v.number(),
  updatedAt: v.number(),
  updatedBy: v.optional(v.id("users")), // User who last updated settings
})
  .index("by_workspace", ["workspaceId"])
  .index("by_subdomain", ["subdomain"]) // For subdomain lookup
  .index("by_custom_domain", ["customDomain"]); // For custom domain lookup

export const websiteSettingsValidator = v.object({
  workspaceId: v.id("workspaces"),
  subdomain: v.optional(v.string()),
  customDomain: v.optional(v.string()),
  useCustomDomain: v.optional(v.boolean()),
  domainVerified: v.optional(v.boolean()),
  domainVerifiedAt: v.optional(v.number()),
  siteTitle: v.optional(v.string()),
  siteDescription: v.optional(v.string()),
  keywords: v.optional(v.string()),
  favicon: v.optional(v.string()),
  ogImage: v.optional(v.string()),
  googleAnalyticsId: v.optional(v.string()),
  facebookPixelId: v.optional(v.string()),
  twitterHandle: v.optional(v.string()),
  facebookPage: v.optional(v.string()),
  linkedinPage: v.optional(v.string()),
  robotsTxt: v.optional(v.string()),
  customCss: v.optional(v.string()),
  customHeadCode: v.optional(v.string()),
  createdAt: v.number(),
  updatedAt: v.number(),
  updatedBy: v.optional(v.id("users")),
});
