/**
 * CMS Lite Type Definitions (Placeholder)
 * 
 * These are placeholder types for CMS Lite until the backend is properly integrated.
 * Original types came from ~backend/* which doesn't exist in this project.
 * 
 * TODO: Replace with actual backend types when integrating with Convex or API
 */

export interface PortfolioItem {
  id: number | string; // Support both number and Convex Id<"portfolioItems">
  title: string;
  slug?: string;
  locale?: string;
  description: string | null;
  imageUrl?: string;
  images?: Array<{
    id?: string | number;
    imageUrl: string;
    altText?: string | null;
    displayOrder?: number;
  }>; // Convex structure
  category?: string | null;
  tags?: string[];
  clientName?: string;
  projectDate?: Date;
  active?: boolean;
  status?: string;
  order?: number;
  metaTitle?: string | null;
  metaDescription?: string | null;
  metaKeywords?: string[] | null;
  createdAt?: Date | number;
  updatedAt?: Date | number;
}

export interface ServiceItem {
  id: number | string;
  slug: string;
  name: string;
  description: string;
  labelId?: string;
  labelEn?: string;
  labelAr?: string;
  imageUrl?: string;
  price?: number;
  duration?: string;
  active: boolean;
  order: number;
  displayOrder?: number;
  features?: string[];
  createdAt: Date;
  updatedAt: Date;
}

export interface Settings {
  brandName: string;
  logoUrl?: string;
  faviconUrl?: string;
  primaryColor?: string;
  secondaryColor?: string;
  locale: string;
  timezone: string;
  currency: string;
  contactEmail?: string;
  contactPhone?: string;
  email?: string;
  phone?: string;
  instagram?: string;
  socialMedia?: {
    facebook?: string;
    twitter?: string;
    instagram?: string;
    linkedin?: string;
  };
  seo?: {
    title?: string;
    description?: string;
    keywords?: string[];
  };
}

export interface Quicklink {
  id: string | number; // Support both Convex Id and legacy number
  title: string;
  url: string;
  icon?: string | null;
  order?: number; // Legacy field
  displayOrder?: number; // Convex field
  active: boolean;
  openInNewTab?: boolean;
  createdAt?: Date | number;
}

export interface Post {
  id: number | string; // Support both number and Convex Id<"posts">
  slug?: string;
  title: string;
  content?: string; // Frontend field
  body?: string; // Convex field
  excerpt?: string | null;
  coverImage?: string | null;
  featuredImage?: string; // Legacy field
  authorId?: string;
  status: 'draft' | 'published' | 'scheduled' | string; // Allow any string for Convex compatibility
  publishedAt?: Date | number | null;
  tags?: string[];
  categories?: string[];
  locale?: string;
  metaTitle?: string | null;
  metaDescription?: string | null;
  metaKeywords?: string[] | null;
  scheduledPublishAt?: number | null;
  autoPublished?: boolean | null;
  createdAt?: Date | number;
  updatedAt?: Date | number;
}

export interface Product {
  id: number | string; // Support both number and Convex Id<"products">
  slug?: string;
  name?: string; // Frontend field
  titleId?: string; // Convex field
  titleEn?: string; // Convex field
  titleAr?: string; // Convex field
  description?: string; // Frontend field
  descId?: string | null; // Convex field
  descEn?: string | null; // Convex field
  descAr?: string | null; // Convex field
  price: number;
  compareAtPrice?: number;
  currency?: string;
  imageUrl?: string;
  coverImage?: string; // Added for compatibility
  images?: string[];
  paymentLink?: string; // Added for external payment
  category?: string;
  tags?: string[];
  stock?: number;
  sku?: string;
  status?: string;
  active?: boolean;
  available?: boolean; // Convex field
  featured?: boolean;
  createdAt?: Date | number;
  updatedAt?: Date | number;
}

export interface NavigationItem {
  id: number | string;
  label?: string;
  labelId?: string;
  labelEn?: string;
  labelAr?: string;
  url?: string;
  path?: string;
  order?: number;
  displayOrder?: number;
  parentId?: number | null;
  active: boolean;
  openInNewTab?: boolean;
  isExternal?: boolean;
  icon?: string;
  children?: NavigationItem[];
}

export interface KBDocument {
  id: string | number;
  title: string;
  content: string;
  fileUrl?: string;
  category: string;
  active?: boolean;
  createdAt: Date;
}

export interface Feature {
  id: number;
  locale: string;
  icon: string;
  title: string;
  description: string;
  serviceId?: number;
  order: number;
  displayOrder?: number;
  active: boolean;
}
