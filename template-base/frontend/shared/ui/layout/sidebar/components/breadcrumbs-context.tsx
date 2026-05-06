"use client"

import React from "react"
import { usePathname } from "next/navigation"
import { DISCOVERED_FEATURES, getFeatureById } from "@/frontend/shared/lib/features/registry"
import type { FeatureConfig } from "@/frontend/shared/lib/features/defineFeature"
import {
  getDashboardFeatureHref,
  getDashboardRouteInfo,
  rebaseDashboardPath,
} from "@/frontend/shared/ui/layout/dashboard/dashboard-routes"

export type SidebarBreadcrumbItem = {
  label: string
  href: string
}

type BreadcrumbsContextValue = {
  breadcrumbs: SidebarBreadcrumbItem[]
  setBreadcrumbs: (items: SidebarBreadcrumbItem[]) => void
}

const BreadcrumbsContext = React.createContext<BreadcrumbsContextValue | null>(
  null
)

export function useBreadcrumbs() {
  const ctx = React.useContext(BreadcrumbsContext)
  if (!ctx) {
    throw new Error(
      "useBreadcrumbs must be used within a BreadcrumbsProvider"
    )
  }
  return ctx
}

/**
 * Find a feature by matching its path or navigation patterns
 */
function findFeatureByPath(pathname: string): FeatureConfig | undefined {
  const routeInfo = getDashboardRouteInfo(pathname)
  if (!routeInfo.base || !routeInfo.slug) return undefined

  const slug = routeInfo.slug

  // First try exact match by ID
  const feature = getFeatureById(slug)
  if (feature) return feature

  // Try matching by path
  for (const f of DISCOVERED_FEATURES) {
    // Check main feature path
    const featurePath = rebaseDashboardPath(f.ui.path, routeInfo.base)
    if (featurePath === pathname || featurePath === getDashboardFeatureHref(routeInfo.base, slug)) {
      return f
    }

    // Check navigation aliases
    if (f.navigation?.aliases?.includes(slug)) {
      return f
    }

    // Check children
    if (f.children) {
      for (const child of f.children) {
        if (rebaseDashboardPath(child.ui.path, routeInfo.base) === pathname || child.id === slug) {
          return child
        }
      }
    }
  }

  return undefined
}

/**
 * Find parent feature if current feature is a child
 */
function findParentFeature(childId: string): FeatureConfig | undefined {
  for (const f of DISCOVERED_FEATURES) {
    if (f.children?.some(c => c.id === childId)) {
      return f
    }
  }
  return undefined
}

/**
 * Generate breadcrumbs from pathname
 */
function generateBreadcrumbsFromPath(pathname: string): SidebarBreadcrumbItem[] {
  const breadcrumbs: SidebarBreadcrumbItem[] = []
  const routeInfo = getDashboardRouteInfo(pathname)

  // Don't show breadcrumbs on dashboard root
  if ((routeInfo.base && routeInfo.isRoot) || pathname === "/dashboard/" || pathname === "/mock-dashboard/") {
    return []
  }

  // Find the current feature
  const currentFeature = findFeatureByPath(pathname)

  if (currentFeature) {
    // Check if this is a child feature
    const parentFeature = findParentFeature(currentFeature.id)

    if (parentFeature) {
      // Add parent feature
      breadcrumbs.push({
        label: parentFeature.name,
        href: routeInfo.base ? rebaseDashboardPath(parentFeature.ui.path, routeInfo.base) : parentFeature.ui.path,
      })
    }

    // Add current feature
    breadcrumbs.push({
      label: currentFeature.name,
      href: routeInfo.base ? rebaseDashboardPath(currentFeature.ui.path, routeInfo.base) : currentFeature.ui.path,
    })

    // Check for sub-paths beyond the feature (e.g., /dashboard/documents/123)
    const pathSegments = pathname.split('/').filter(Boolean)
    const featurePathSegments = (routeInfo.base
      ? rebaseDashboardPath(currentFeature.ui.path, routeInfo.base)
      : currentFeature.ui.path
    ).split('/').filter(Boolean)

    if (pathSegments.length > featurePathSegments.length) {
      // There are additional path segments - could be an ID or sub-route
      const remainingSegments = pathSegments.slice(featurePathSegments.length)

      // Add sub-paths as breadcrumbs (these can be overridden by setBreadcrumbs)
      for (let i = 0; i < remainingSegments.length; i++) {
        const segment = remainingSegments[i]

        // Skip if it looks like an ID
        if (segment.match(/^[a-z0-9]{24,}$/i)) continue

        // Convert slug to readable name
        const label = segment
          .split('-')
          .map(word => word.charAt(0).toUpperCase() + word.slice(1))
          .join(' ')

        breadcrumbs.push({
          label,
          href: '/' + pathSegments.slice(0, featurePathSegments.length + i + 1).join('/'),
        })
      }
    }
  } else {
    // Fallback: Generate breadcrumbs from path segments
    const segments = pathname.split('/').filter(Boolean)

    // Skip dashboard-like prefix
    const relevantSegments = segments.slice(1)
    const basePath = routeInfo.base ?? "/dashboard"

    for (let i = 0; i < relevantSegments.length; i++) {
      const segment = relevantSegments[i]

      // Skip if it looks like an ID
      if (segment.match(/^[a-z0-9]{24,}$/i)) continue

      // Convert slug to readable name
      const label = segment
        .split('-')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ')

      breadcrumbs.push({
        label,
        href: `${basePath}/${relevantSegments.slice(0, i + 1).join('/')}`,
      })
    }
  }

  return breadcrumbs
}

export function BreadcrumbsProvider({
  children,
}: {
  children: React.ReactNode
}) {
  const [manualBreadcrumbs, setManualBreadcrumbs] = React.useState<SidebarBreadcrumbItem[] | null>(null)
  const pathname = usePathname()

  // Auto-generate breadcrumbs from pathname
  const autoBreadcrumbs = React.useMemo(() => {
    return generateBreadcrumbsFromPath(pathname ?? "")
  }, [pathname])

  // Clear manual breadcrumbs on route change
  React.useEffect(() => {
    setManualBreadcrumbs(null)
  }, [pathname])

  // Use manual breadcrumbs if set, otherwise use auto-generated
  const breadcrumbs = manualBreadcrumbs ?? autoBreadcrumbs

  const setBreadcrumbs = React.useCallback((items: SidebarBreadcrumbItem[]) => {
    setManualBreadcrumbs(items)
  }, [])

  const value = React.useMemo(
    () => ({ breadcrumbs, setBreadcrumbs }),
    [breadcrumbs, setBreadcrumbs]
  )

  return (
    <BreadcrumbsContext.Provider value={value}>
      {children}
    </BreadcrumbsContext.Provider>
  )
}
