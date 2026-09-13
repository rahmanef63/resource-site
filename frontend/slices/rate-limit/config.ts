type RateLimitRegistryConfig = {
  slug: string;
  title: string;
  category: "infra";
  routes: unknown[];
};

/** Framework-neutral registry metadata for the backend-only rate-limit slice. */
export const rateLimitFeature = {
  slug: "rate-limit",
  title: "Rate Limit",
  category: "infra",
  routes: [],
} satisfies RateLimitRegistryConfig;
