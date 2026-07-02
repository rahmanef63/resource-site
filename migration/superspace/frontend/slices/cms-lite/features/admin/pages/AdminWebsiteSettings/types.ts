/**
 * Website Settings Types
 */

export interface WebsiteSettings {
  // Domain Settings
  customDomain?: string;
  subdomain: string;
  useCustomDomain: boolean;
  domainVerified?: boolean;
  
  // SEO Settings
  siteTitle: string;
  siteDescription: string;
  keywords?: string;
  favicon?: string;
  ogImage?: string;
  
  // Analytics
  googleAnalyticsId?: string;
  facebookPixelId?: string;
  
  // Social Media
  twitterHandle?: string;
  facebookPage?: string;
  linkedinPage?: string;
  
  // Advanced
  robotsTxt?: string;
  customCss?: string;
  customHeadCode?: string;
  
  // MCP (Model Context Protocol) Settings
  mcpEnabled?: boolean;
  mcpApiKey?: string;
  mcpAllowedActions?: string[]; // ['edit-content', 'update-styles', 'modify-layout']
  mcpAutoApprove?: boolean;
}

export interface ValidationErrors {
  subdomain?: string;
  customDomain?: string;
  favicon?: string;
  ogImage?: string;
  siteDescription?: string;
  googleAnalyticsId?: string;
  facebookPixelId?: string;
  [key: string]: string | undefined;
}

export interface SEOScore {
  overall: number; // 0-100
  breakdown: {
    title: { score: number; message: string };
    description: { score: number; message: string };
    keywords: { score: number; message: string };
    images: { score: number; message: string };
    social: { score: number; message: string };
  };
  suggestions: string[];
}

export type FormStep = 'domain' | 'seo' | 'analytics' | 'advanced' | 'mcp';

export type RightPanelTab = 'preview' | 'seo';

export interface StepConfig {
  id: FormStep;
  title: string;
  description: string;
  icon: any;
  fields: string[];
}
