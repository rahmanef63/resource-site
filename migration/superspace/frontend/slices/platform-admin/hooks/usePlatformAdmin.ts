import { useQuery, useMutation } from "convex/react"
import { api } from "@/frontend/shared/foundation/utils/convex/any-api"
import type { Id } from "@/convex/_generated/dataModel"
import type {
  FeatureStatus,
  AccessLevel,
  ErrorReport,
  ErrorReportSeverity,
  ErrorReportStatus,
} from "../types"

/**
 * Hook to check platform admin status
 */
export function usePlatformAdminStatus() {
  const status = useQuery(api.features.custom.admin.checkMyPlatformAdminStatus)
  
  return {
    isLoading: status === undefined,
    isAuthenticated: status?.isAuthenticated ?? false,
    isPlatformAdmin: status?.isPlatformAdmin ?? false,
    email: status?.email ?? null,
    name: status?.name ?? null,
    clerkId: status?.clerkId ?? null,
  }
}

/**
 * Hook to manage system features (platform admin only)
 * These are the features that appear in Menu Store
 */
export function useSystemFeatures(enabled = true) {
  const { isPlatformAdmin } = usePlatformAdminStatus()
  const shouldQuery = enabled && isPlatformAdmin
  const features = useQuery(
    api.features.system.admin.getSystemFeatures,
    shouldQuery ? {} : undefined
  )
  
  return {
    features: features ?? [],
    isLoading: shouldQuery ? features === undefined : false,
    isEmpty: shouldQuery ? features?.length === 0 : false,
  }
}

/**
 * Hook for system feature mutations
 */
export function useSystemFeatureMutations() {
  const createFeature = useMutation(api.features.system.admin.createSystemFeature)
  const updateFeature = useMutation(api.features.system.admin.updateSystemFeature)
  const deleteFeature = useMutation(api.features.system.admin.deleteSystemFeature)
  const setVisibility = useMutation(api.features.system.admin.setFeatureVisibility)
  const seedFeatures = useMutation(api.features.system.admin.seedSystemFeaturesFromCatalog)
  
  return {
    createFeature: async (data: {
      featureId: string
      name: string
      description: string
      icon: string
      version: string
      category: string
      tags: string[]
      status: FeatureStatus
      isReady: boolean
      expectedRelease?: string
      featureType: string
      isPublic: boolean
    }) => {
      return await createFeature(data)
    },
    updateFeature: async (
      id: Id<"systemFeatures">,
      data: Partial<{
        name: string
        description: string
        icon: string
        version: string
        category: string
        tags: string[]
        status: FeatureStatus
        isReady: boolean
        expectedRelease?: string
        featureType: string
        isPublic: boolean
        isEnabled: boolean
        order: number
      }>
    ) => {
      return await updateFeature({ id, ...data })
    },
    deleteFeature: async (id: Id<"systemFeatures">) => {
      return await deleteFeature({ id })
    },
    setVisibility: async (id: Id<"systemFeatures">, isPublic: boolean, isEnabled: boolean) => {
      return await setVisibility({ id, isPublic, isEnabled })
    },
    seedFeatures: async () => {
      return await seedFeatures({})
    },
  }
}

/**
 * Hook to manage custom features (platform admin only)
 */
export function useCustomFeatures(enabled = true) {
  const { isPlatformAdmin } = usePlatformAdminStatus()
  const shouldQuery = enabled && isPlatformAdmin
  const features = useQuery(
    api.features.custom.admin.getAllCustomFeatures,
    shouldQuery ? {} : undefined
  )
  
  return {
    features: features ?? [],
    isLoading: shouldQuery ? features === undefined : false,
    isEmpty: shouldQuery ? features?.length === 0 : false,
  }
}

/**
 * Hook to manage all workspaces (platform admin only)
 */
export function useAllWorkspaces(enabled = true) {
  const { isPlatformAdmin } = usePlatformAdminStatus()
  const shouldQuery = enabled && isPlatformAdmin
  const workspaces = useQuery(
    api.features.custom.admin.getAllWorkspaces,
    shouldQuery ? {} : undefined
  )
  
  return {
    workspaces: workspaces ?? [],
    isLoading: shouldQuery ? workspaces === undefined : false,
    isEmpty: shouldQuery ? workspaces?.length === 0 : false,
  }
}

/**
 * Hook for feature access management
 */
export function useFeatureAccess(workspaceId: Id<"workspaces"> | null, enabled = true) {
  const { isPlatformAdmin } = usePlatformAdminStatus()
  // Only query if enabled, is admin, and has workspaceId
  const canQuery = enabled && isPlatformAdmin
  const access = useQuery(
    api.features.custom.admin.getWorkspaceFeatureAccess,
    canQuery && workspaceId ? { workspaceId } : "skip"
  )
  
  return {
    access: access ?? [],
    isLoading: canQuery && workspaceId ? access === undefined : false,
  }
}

/**
 * Hook for platform admin mutations
 */
export function usePlatformAdminMutations() {
  const updateFeatureStatus = useMutation(api.features.custom.admin.updateFeatureStatus)
  const grantFeatureAccess = useMutation(api.features.custom.admin.grantFeatureAccess)
  
  return {
    updateFeatureStatus: async (featureId: Id<"customFeatures">, status: FeatureStatus) => {
      // Cast to the expected type (excluding 'experimental' for custom features)
      const validStatus = status === "experimental" ? "development" : status
      return await updateFeatureStatus({ featureId, status: validStatus as "stable" | "beta" | "development" | "deprecated" | "disabled" })
    },
    grantFeatureAccess: async (
      featureId: string,
      workspaceId: Id<"workspaces">,
      accessLevel: AccessLevel
    ) => {
      return await grantFeatureAccess({ featureId, workspaceId, accessLevel })
    },
  }
}

// ============================================================================
// BUNDLE CATEGORY HOOKS
// ============================================================================

/**
 * Hook to manage bundle categories (platform admin only)
 */
export function useBundleCategories(enabled = true) {
  const { isPlatformAdmin } = usePlatformAdminStatus()
  const shouldQuery = enabled && isPlatformAdmin
  const bundles = useQuery(
    api.features.bundles.mutations.list,
    shouldQuery ? {} : undefined
  )
  
  return {
    bundles: bundles ?? [],
    isLoading: shouldQuery ? bundles === undefined : false,
    isEmpty: shouldQuery ? bundles?.length === 0 : false,
  }
}

/**
 * Hook to get feature bundle memberships
 */
export function useFeatureBundles(featureId: string | null, enabled = true) {
  const { isPlatformAdmin } = usePlatformAdminStatus()
  // Only query if enabled, is admin, and has featureId
  const canQuery = enabled && isPlatformAdmin
  const memberships = useQuery(
    api.features.bundles.mutations.getFeatureBundles,
    canQuery && featureId ? { featureId } : "skip"
  )
  
  return {
    memberships: memberships ?? [],
    isLoading: canQuery && featureId ? memberships === undefined : false,
  }
}

/**
 * Hook for bundle category mutations
 */
export function useBundleCategoryMutations() {
  const createBundle = useMutation(api.features.bundles.mutations.create)
  const updateBundle = useMutation(api.features.bundles.mutations.update)
  const removeBundle = useMutation(api.features.bundles.mutations.remove)
  const seedBundles = useMutation(api.features.bundles.mutations.seedBundleCategories)
  const setFeatureBundles = useMutation(api.features.bundles.mutations.setFeatureBundles)
  const setFeatureBundleMembership = useMutation(api.features.bundles.mutations.setFeatureBundleMembership)
  const removeFeatureFromBundle = useMutation(api.features.bundles.mutations.removeFeatureFromBundle)
  
  return {
    createBundle: async (data: {
      bundleId: string
      name: string
      description: string
      icon: string
      category: "productivity" | "business" | "personal" | "creative" | "education" | "community"
      primaryColor?: string
      accentColor?: string
      recommendedFor: Array<"personal" | "family" | "group" | "organization" | "institution">
      tags: string[]
      isEnabled?: boolean
      isPublic?: boolean
    }) => {
      return await createBundle(data)
    },
    updateBundle: async (
      id: Id<"bundleCategories">,
      data: Partial<{
        name: string
        description: string
        icon: string
        category: "productivity" | "business" | "personal" | "creative" | "education" | "community"
        primaryColor: string
        accentColor: string
        recommendedFor: Array<"personal" | "family" | "group" | "organization" | "institution">
        tags: string[]
        isEnabled: boolean
        isPublic: boolean
        order: number
      }>
    ) => {
      return await updateBundle({ id, ...data })
    },
    removeBundle: async (id: Id<"bundleCategories">) => {
      return await removeBundle({ id })
    },
    seedBundles: async () => {
      return await seedBundles({})
    },
    setFeatureBundles: async (
      featureId: string,
      bundles: Array<{ bundleId: string; role: "core" | "recommended" | "optional" }>
    ) => {
      return await setFeatureBundles({ featureId, bundles })
    },
    setFeatureBundleMembership: async (
      featureId: string,
      bundleId: string,
      role: "core" | "recommended" | "optional"
    ) => {
      return await setFeatureBundleMembership({ featureId, bundleId, role })
    },
    removeFeatureFromBundle: async (featureId: string, bundleId: string) => {
      return await removeFeatureFromBundle({ featureId, bundleId })
    },
  }
}

/**
 * Hook to fetch error reports (platform admin only).
 */
export function useErrorReports(
  filter: { status?: ErrorReportStatus; severity?: ErrorReportSeverity } = {},
  enabled = true,
) {
  const { isPlatformAdmin } = usePlatformAdminStatus()
  const shouldQuery = enabled && isPlatformAdmin
  const reports = useQuery(
    api.features.platformAdmin.reportQueries.listErrorReports,
    shouldQuery ? filter : "skip",
  ) as ErrorReport[] | undefined

  return {
    reports: reports ?? [],
    isLoading: shouldQuery ? reports === undefined : false,
    isEmpty: shouldQuery ? reports?.length === 0 : false,
  }
}

/**
 * Hook for the sidebar badge count (platform admin only).
 */
export function useErrorReportStats(enabled = true) {
  const { isPlatformAdmin } = usePlatformAdminStatus()
  const shouldQuery = enabled && isPlatformAdmin
  const stats = useQuery(
    api.features.platformAdmin.reportQueries.getErrorReportStats,
    shouldQuery ? {} : "skip",
  ) as { openCount: number } | undefined
  return {
    openCount: stats?.openCount ?? 0,
    isLoading: shouldQuery ? stats === undefined : false,
  }
}

/**
 * Hook for error report mutations.
 *
 * `createErrorReport` is intentionally not gated by platform-admin —
 * any signed-in user can file a report when they hit an error.
 * `updateStatus` is platform-admin-only (server-enforced).
 */
export function useErrorReportMutations() {
  const createErrorReport = useMutation(
    api.features.platformAdmin.reportMutations.createErrorReport,
  )
  const updateStatusMutation = useMutation(
    api.features.platformAdmin.reportMutations.updateErrorReportStatus,
  )
  return {
    createErrorReport,
    updateStatus: async (
      id: Id<"errorReports">,
      status: ErrorReportStatus,
      resolutionNote?: string,
    ) => updateStatusMutation({ id, status, resolutionNote }),
  }
}

/**
 * Combined hook for full platform admin functionality
 */
export function usePlatformAdmin(enabled = true) {
  const status = usePlatformAdminStatus()
  const allowAdminQueries = enabled && status.isAuthenticated && status.isPlatformAdmin
  const customFeatures = useCustomFeatures(allowAdminQueries)
  const systemFeatures = useSystemFeatures(allowAdminQueries)
  const workspaces = useAllWorkspaces(allowAdminQueries)
  const bundleCategories = useBundleCategories(allowAdminQueries)
  const mutations = usePlatformAdminMutations()
  const systemMutations = useSystemFeatureMutations()
  const bundleMutations = useBundleCategoryMutations()
  
  return {
    ...status,
    features: customFeatures.features,
    systemFeatures: systemFeatures.features,
    workspaces: workspaces.workspaces,
    bundleCategories: bundleCategories.bundles,
    isLoadingFeatures: customFeatures.isLoading,
    isLoadingSystemFeatures: systemFeatures.isLoading,
    isLoadingWorkspaces: workspaces.isLoading,
    isLoadingBundles: bundleCategories.isLoading,
    ...mutations,
    ...systemMutations,
    ...bundleMutations,
  }
}
