"use client";

import { useQuery, useMutation } from "convex/react";
import { api } from "@convex/_generated/api";

/**
 * Helper hook for Convex backend operations
 * 
 * This hook provides a simplified way to access Convex API.
 * 
 * NOTE: The CMS Lite Convex API structure varies by module:
 * - Some modules have queries/mutations in api folder
 * - Some only have actions
 * - Check convex/features/cmsLite/[module]/api/ for actual structure
 * 
 * RECOMMENDED USAGE - Use Convex hooks directly:
 * ```tsx
 * // Query example
 * const products = useQuery(api.features.cmsLite.products.api.actions.list, { 
 *   workspaceId 
 * });
 * 
 * // Mutation example
 * const createProduct = useMutation(api.features.cmsLite.products.api.actions.create);
 * await createProduct({ workspaceId, ...data });
 * ```
 * 
 * Or use this helper for workspaceId management:
 * ```tsx
 * const backend = useConvexBackend('workspace-id');
 * // Access api, useQuery, useMutation from backend object
 * ```
 */
export function useConvexBackend(workspaceId: string) {
  // Return utilities for direct use
  return {
    workspaceId,
    api, // Expose full API for direct access

    // Re-export hooks for convenience
    useQuery,
    useMutation,
  };
}
