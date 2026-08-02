/**
 * Bundle Hooks for Onboarding and Workspace Creation
 * 
 * Provides access to bundle templates from:
 * 1. Database (bundleCategories table) - for bundles configured via Platform Admin
 * 2. Static config (bundles.ts) - fallback for features' bundle membership
 * 
 * The database stores bundle metadata and feature-bundle memberships,
 * while static config provides the initial feature definitions.
 */

import { useQuery } from "convex/react"
import { api } from "@convex/_generated/api"
import { useMemo } from "react"
import type { WorkspaceType } from "../types"
import type { WorkspaceBundleTemplate } from "../constants/bundles"
import { getAllBundles, getBundleEnabledFeatures } from "../constants/bundles"

/**
 * Database bundle category type
 */
interface DatabaseBundle {
  _id: string
  bundleId: string
  name: string
  description: string
  icon: string
  category: "productivity" | "business" | "personal" | "creative" | "education" | "community"
  primaryColor?: string
  accentColor?: string
  recommendedFor: WorkspaceType[]
  tags: string[]
  isEnabled: boolean
  isPublic: boolean
  order: number
  isSystem?: boolean
  createdAt: number
  updatedAt?: number
}

/**
 * Database bundle with features
 */
interface DatabaseBundleWithFeatures extends DatabaseBundle {
  features: {
    core: string[]
    recommended: string[]
    optional: string[]
  }
}

/**
 * Merged bundle type that combines database and static config
 */
export interface MergedBundle {
  id: string
  name: string
  description: string
  icon: string
  category: "productivity" | "business" | "personal" | "creative" | "education" | "community"
  recommendedFor: WorkspaceType[]
  features: {
    core: string[]
    recommended: string[]
    optional: string[]
  }
  theme?: {
    primaryColor?: string
    accentColor?: string
  }
  tags: string[]
  // Source tracking
  source: "database" | "static" | "merged"
  isSystem?: boolean
  order: number
}

/**
 * Hook to get public bundles for onboarding/workspace creation
 * Combines database bundles with static config fallback
 */
export function usePublicBundles() {
  // Fetch bundles from database
  const databaseBundles = useQuery(api.features.bundles.mutations.listPublic)
  const isLoading = databaseBundles === undefined
  
  // Get static bundles as fallback
  const staticBundles = useMemo(() => getAllBundles(), [])
  
  // Merge database and static bundles
  const bundles = useMemo<MergedBundle[]>(() => {
    // If database bundles are loaded and have data, use them
    if (databaseBundles && databaseBundles.length > 0) {
      return databaseBundles.map((db: DatabaseBundle, index: number) => {
        // Find matching static bundle for feature data
        const staticBundle = staticBundles.find(s => s.id === db.bundleId)
        
        return {
          id: db.bundleId,
          name: db.name,
          description: db.description,
          icon: db.icon,
          category: db.category,
          recommendedFor: db.recommendedFor,
          // Use static bundle features if available (until database has feature memberships)
          features: staticBundle?.features || {
            core: [],
            recommended: [],
            optional: [],
          },
          theme: {
            primaryColor: db.primaryColor,
            accentColor: db.accentColor,
          },
          tags: db.tags,
          source: "database" as const,
          isSystem: db.isSystem,
          order: db.order ?? index,
        }
      }).sort((a, b) => a.order - b.order)
    }
    
    // Fallback to static bundles
    return staticBundles.map((sb, index) => ({
      id: sb.id,
      name: sb.name,
      description: sb.description,
      icon: sb.icon,
      category: sb.category,
      recommendedFor: sb.recommendedFor,
      features: sb.features,
      theme: sb.theme,
      tags: sb.tags,
      source: "static" as const,
      isSystem: false,
      order: index,
    }))
  }, [databaseBundles, staticBundles])
  
  return {
    bundles,
    isLoading,
    isEmpty: bundles.length === 0,
    source: databaseBundles && databaseBundles.length > 0 ? "database" : "static",
  }
}

/**
 * Hook to get a specific bundle with its features
 * Fetches from database if available, falls back to static
 */
export function useBundleWithFeatures(bundleId: string | null) {
  // Try to get from database
  const databaseBundle = useQuery(
    api.features.bundles.mutations.getBundleWithFeatures,
    bundleId ? { bundleId } : "skip"
  )
  
  const isLoading = bundleId !== null && databaseBundle === undefined
  
  // Get static bundle as fallback
  const staticBundles = useMemo(() => getAllBundles(), [])
  const staticBundle = useMemo(
    () => staticBundles.find(b => b.id === bundleId),
    [staticBundles, bundleId]
  )
  
  // Merge or fallback
  const bundle = useMemo<MergedBundle | null>(() => {
    if (!bundleId) return null
    
    // If database has this bundle with features, use it
    if (databaseBundle) {
      const db = databaseBundle as DatabaseBundleWithFeatures
      
      // If database has feature memberships, use them
      const hasDbFeatures = 
        db.features.core.length > 0 ||
        db.features.recommended.length > 0 ||
        db.features.optional.length > 0
      
      return {
        id: db.bundleId,
        name: db.name,
        description: db.description,
        icon: db.icon,
        category: db.category,
        recommendedFor: db.recommendedFor,
        features: hasDbFeatures ? db.features : (staticBundle?.features || db.features),
        theme: {
          primaryColor: db.primaryColor,
          accentColor: db.accentColor,
        },
        tags: db.tags,
        source: hasDbFeatures ? "database" : "merged",
        isSystem: db.isSystem,
        order: db.order,
      }
    }
    
    // Fallback to static
    if (staticBundle) {
      return {
        id: staticBundle.id,
        name: staticBundle.name,
        description: staticBundle.description,
        icon: staticBundle.icon,
        category: staticBundle.category,
        recommendedFor: staticBundle.recommendedFor,
        features: staticBundle.features,
        theme: staticBundle.theme,
        tags: staticBundle.tags,
        source: "static",
        isSystem: false,
        order: 0,
      }
    }
    
    return null
  }, [bundleId, databaseBundle, staticBundle])
  
  return {
    bundle,
    isLoading,
    source: bundle?.source || null,
  }
}

/**
 * Hook to get bundles filtered by workspace type
 */
export function useBundlesForWorkspaceType(workspaceType: WorkspaceType) {
  const { bundles, isLoading } = usePublicBundles()
  
  const filteredBundles = useMemo(() => {
    const recommended = bundles.filter(b => b.recommendedFor.includes(workspaceType))
    const others = bundles.filter(b => !b.recommendedFor.includes(workspaceType))
    return [...recommended, ...others]
  }, [bundles, workspaceType])
  
  return {
    bundles: filteredBundles,
    recommendedBundles: filteredBundles.filter(b => b.recommendedFor.includes(workspaceType)),
    otherBundles: filteredBundles.filter(b => !b.recommendedFor.includes(workspaceType)),
    isLoading,
  }
}

/**
 * Get enabled features for a merged bundle
 */
export function getMergedBundleEnabledFeatures(bundle: MergedBundle): string[] {
  return [...bundle.features.core, ...bundle.features.recommended]
}

/**
 * Get all features for a merged bundle
 */
export function getMergedBundleAllFeatures(bundle: MergedBundle): string[] {
  return [...bundle.features.core, ...bundle.features.recommended, ...bundle.features.optional]
}
