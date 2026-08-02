/**
 * OpenGraph link preview utilities
 * @module shared/chat/lib/ogPreview
 */

import { extractUrls } from "../util/formatMessage";

/**
 * OpenGraph metadata
 */
export type OgMetadata = {
  url: string;
  title?: string;
  description?: string;
  image?: string;
  siteName?: string;
  type?: string;
};

/**
 * Fetch OpenGraph metadata for a URL
 * TODO: This should be implemented as a server action or API route
 * to avoid CORS issues and improve security
 */
export async function fetchOgMetadata(url: string): Promise<OgMetadata | null> {
  try {
    // TODO: Call server action or API route
    // Example: const response = await fetch('/api/og-preview', { method: 'POST', body: JSON.stringify({ url }) });

    // Mock implementation

    // Return mock data for now
    return {
      url,
      title: "Example Page",
      description: "This is a preview description",
      image: undefined,
      siteName: "example.com",
      type: "website",
    };
  } catch (error) {
    console.error("Failed to fetch OG metadata:", error);
    return null;
  }
}

/**
 * Extract and fetch OG metadata for all URLs in text
 */
export async function extractAndFetchPreviews(
  text: string
): Promise<OgMetadata[]> {
  const urls = extractUrls(text);
  const previews: OgMetadata[] = [];

  for (const url of urls) {
    try {
      const metadata = await fetchOgMetadata(url);
      if (metadata) {
        previews.push(metadata);
      }
    } catch (error) {
      console.error(`Failed to fetch preview for ${url}:`, error);
    }
  }

  return previews;
}

/**
 * Cache for OG metadata to avoid redundant fetches
 */
class OgCache {
  private cache: Map<string, { data: OgMetadata | null; timestamp: number }>;
  private ttl: number;

  constructor(ttlMs = 3600000) {
    // 1 hour default TTL
    this.cache = new Map();
    this.ttl = ttlMs;
  }

  get(url: string): OgMetadata | null | undefined {
    const cached = this.cache.get(url);
    if (!cached) return undefined;

    // Check if expired
    if (Date.now() - cached.timestamp > this.ttl) {
      this.cache.delete(url);
      return undefined;
    }

    return cached.data;
  }

  set(url: string, data: OgMetadata | null): void {
    this.cache.set(url, { data, timestamp: Date.now() });
  }

  clear(): void {
    this.cache.clear();
  }
}

/**
 * Global OG cache instance
 */
export const ogCache = new OgCache();

/**
 * Fetch with cache
 */
export async function fetchOgMetadataWithCache(
  url: string
): Promise<OgMetadata | null> {
  // Check cache first
  const cached = ogCache.get(url);
  if (cached !== undefined) {
    return cached;
  }

  // Fetch fresh data
  const metadata = await fetchOgMetadata(url);
  ogCache.set(url, metadata);
  return metadata;
}

/**
 * Validate URL before fetching
 */
export function isValidUrl(url: string): boolean {
  try {
    const parsed = new URL(url);
    return parsed.protocol === "http:" || parsed.protocol === "https:";
  } catch {
    return false;
  }
}

/**
 * Sanitize URL
 */
export function sanitizeUrl(url: string): string {
  try {
    const parsed = new URL(url);
    // Remove tracking parameters
    const cleanParams = new URLSearchParams();
    parsed.searchParams.forEach((value, key) => {
      // Keep only non-tracking params
      if (!["utm_source", "utm_medium", "utm_campaign", "fbclid"].includes(key)) {
        cleanParams.set(key, value);
      }
    });
    parsed.search = cleanParams.toString();
    return parsed.toString();
  } catch {
    return url;
  }
}
