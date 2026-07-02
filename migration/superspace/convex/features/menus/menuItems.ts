import { v } from "convex/values"
import { query, mutation, action, internalMutation } from "../../_generated/server"
// any-api escape hatch: direct named imports of api/internal trip TS2589
// under tsc 5.0.2 (production build). Star import + cast bypasses depth.
import * as _ApiModule from "../../_generated/api"
const api: any = (_ApiModule as any).api
const internal: any = (_ApiModule as any).internal
import type { Doc, Id } from "../../_generated/dataModel"
import { ensureUser, requirePermission, requireActiveMembership, resolveCandidateUserIds } from "../../auth/helpers"
import { logAuditEvent } from "../../shared/audit"
import { PERMS } from "../../workspace/permissions"
import { generateWorkspaceFeatureLabel } from "../../../lib/workspaces/featureLabels"

type FeatureVisibilityType = "default" | "system" | "optional"

type FeatureStatus = "stable" | "beta" | "development" | "experimental" | "deprecated"

function normalizeFeatureStatus(status: string | undefined): FeatureStatus | undefined {
  switch (status) {
    case "stable":
    case "beta":
    case "development":
    case "experimental":
    case "deprecated":
      return status
    default:
      return undefined
  }
}

const SYSTEM_PERMISSION_KEY = "MANAGE_WORKSPACE"
const SYSTEM_PERMISSION_VALUE =
  (PERMS as Record<string, string>)[SYSTEM_PERMISSION_KEY as keyof typeof PERMS] ?? "manage_workspace"

function normalizePermissionKey(permKey?: string): string | undefined {
  if (!permKey) return undefined
  const permsRecord = PERMS as Record<string, string>
  const upper = permKey.toUpperCase()
  return permsRecord[upper as keyof typeof PERMS] ?? permKey
}

function isFeatureDisabledByAccess(access: any | null | undefined): boolean {
  if (!access) return false
  if (access.accessLevel === "disabled") return true
  if (access.configOverrides?.enabled === false) return true
  return false
}

function isFeatureEnabledByAccess(access: any | null | undefined): boolean {
  if (!access) return false
  if (access.accessLevel === "disabled") return false
  if (access.configOverrides?.enabled === false) return false
  if (access.configOverrides?.enabled === true) return true
  return access.accessLevel === "owner" || access.accessLevel === "admin" || access.accessLevel === "user"
}

async function getRoleIdsForPermission(ctx: any, workspaceId: Id<"workspaces">, permKey?: string) {
  const resolved = normalizePermissionKey(permKey)
  if (!resolved) return []

  const roles = await ctx.db
    .query("roles")
    .withIndex("by_workspace", (q: any) => q.eq("workspaceId", workspaceId))
    .take(1000)

  return roles
    .filter((role: any) => {
      const permissions: string[] = role.permissions || []
      return permissions.includes("*") || permissions.includes(resolved)
    })
    .map((role: any) => role._id)
}

import { DEFAULT_MENU_ITEMS } from "./menu_manifest_data"
import { OPTIONAL_FEATURES_CATALOG } from "./optional_features_catalog"

export interface FeatureManifestItem {
  slug: string;
  name: string;
  description?: string;
  icon?: string;
  version?: string;
  category?: string;
  featureType?: string;
  tags?: string[];
  status?: string;
  isReady?: boolean;
  expectedRelease?: string;
  type?: string;
  path?: string;
  component?: string;
}

type TemplateFeatureManifestItem = FeatureManifestItem & {
  metadata?: Record<string, any>
  description?: string
  category?: string
  tags?: string[]
  version?: string
  status?: string
  isReady?: boolean
  expectedRelease?: string
  featureType?: string
  requiresPermission?: string
  originalFeatureType?: string
  originalRequiresPermission?: string
  order?: number
}

// Helper to get roles with a given permission for a workspace
async function getRolesWithPermission(ctx: any, workspaceId: Id<"workspaces">, permKey?: string) {
  const permissionValue = normalizePermissionKey(permKey)
  if (!permissionValue) return []

  const roles = await ctx.db
    .query("roles")
    .withIndex("by_workspace", (q: any) => q.eq("workspaceId", workspaceId))
    .take(1000)

  return roles
    .filter((role: any) => {
      const permissions = role.permissions || []
      return permissions.includes("*") || permissions.includes(permissionValue)
    })
    .map((role: any) => role._id)
}

type MenuItemDoc = Doc<"menuItems">

const ROOT_PARENT_ID = "__root__"
const SHAREABLE_MENU_PREFIX = "menu-share"

function toParentKey(parentId?: Id<"menuItems"> | null) {
  return parentId ? String(parentId) : ROOT_PARENT_ID
}

async function getWorkspaceDefaultMenuSetId(ctx: any, workspaceId: Id<"workspaces">) {
  const assignment = await ctx.db
    .query("workspaceMenuAssignments")
    .withIndex("by_workspace_default", (q: any) => q.eq("workspaceId", workspaceId).eq("isDefault", true))
    .first()

  return assignment?.menuSetId
}

async function getMenuItemTree(ctx: any, rootMenuItemId: Id<"menuItems">) {
  const root = await ctx.db.get(rootMenuItemId)
  if (!root) return [] as MenuItemDoc[]

  const items: MenuItemDoc[] = [root]
  const queue: Id<"menuItems">[] = [rootMenuItemId]

  while (queue.length > 0) {
    const parentId = queue.shift()
    if (!parentId) continue

    const children = await ctx.db
      .query("menuItems")
      .withIndex("by_parent", (q: any) => q.eq("parentId", parentId))
      .take(1000)

    children.sort((a: MenuItemDoc, b: MenuItemDoc) => (a.order ?? 0) - (b.order ?? 0))

    for (const child of children) {
      items.push(child)
      queue.push(child._id)
    }
  }

  return items
}

async function normalizeMenuOrders(
  ctx: any,
  workspaceId: Id<"workspaces">,
  parentId?: Id<"menuItems"> | null,
  excludeIds?: Set<string>,
) {
  const siblings = await ctx.db
    .query("menuItems")
    .withIndex("by_workspace_parent", (q: any) => q.eq("workspaceId", workspaceId).eq("parentId", parentId ?? undefined))
    .take(1000)

  const orderedSiblings = siblings
    .filter((item: MenuItemDoc) => !excludeIds?.has(String(item._id)))
    .sort((a: MenuItemDoc, b: MenuItemDoc) => (a.order ?? 0) - (b.order ?? 0))

  await Promise.all(
    orderedSiblings.map((item: MenuItemDoc, index: number) => {
      if (item.order === index) return Promise.resolve()
      return ctx.db.patch(item._id, { order: index })
    }),
  )
}

async function getScopeMenuItems(
  ctx: any,
  workspaceId: Id<"workspaces">,
  menuSetId?: Id<"menuSets">,
) {
  if (menuSetId) {
    return await ctx.db
      .query("menuItems")
      .withIndex("by_menuSet", (q: any) => q.eq("menuSetId", menuSetId))
      .take(1000)
  }

  return await ctx.db
    .query("menuItems")
    .withIndex("by_workspace", (q: any) => q.eq("workspaceId", workspaceId))
    .take(1000)
}

function buildUniqueCopyName(
  baseName: string,
  usedNames: Set<string>,
  suffix = "Copy",
) {
  let counter = 1
  let candidate = `${baseName} ${suffix}`
  while (usedNames.has(candidate)) {
    counter += 1
    candidate = `${baseName} ${suffix} ${counter}`
  }
  usedNames.add(candidate)
  return candidate
}

function buildUniqueCopySlug(
  baseSlug: string,
  usedSlugs: Set<string>,
) {
  if (!baseSlug || baseSlug === "#" || baseSlug.startsWith("#")) {
    return baseSlug
  }

  let counter = 1
  let candidate = `${baseSlug}-copy`
  while (usedSlugs.has(candidate)) {
    counter += 1
    candidate = `${baseSlug}-copy-${counter}`
  }
  usedSlugs.add(candidate)
  return candidate
}

function getCopiedPath(path: string | undefined, sourceSlug: string, copiedSlug: string) {
  if (!path) return path
  if (path === `/${sourceSlug}`) return `/${copiedSlug}`
  return path
}

function normalizeManifestType(type: string | undefined) {
  return type === "folder" ||
    type === "group" ||
    type === "route" ||
    type === "divider" ||
    type === "action" ||
    type === "chat" ||
    type === "document"
    ? type
    : "route"
}

function getManifestRequiredPermission(featureData: TemplateFeatureManifestItem) {
  return featureData.requiresPermission || featureData.metadata?.requiresPermission
}

async function resolveMenuActorUserId(
  ctx: any,
  workspaceId: Id<"workspaces">,
  preferredUserId?: Id<"users">,
) {
  if (preferredUserId) {
    return preferredUserId
  }

  const memberships = await ctx.db
    .query("workspaceMemberships")
    .withIndex("by_workspace", (q: any) => q.eq("workspaceId", workspaceId))
    .take(1000)

  return memberships.find((membership: any) => membership.status === "active")?.userId ?? null
}

async function ensureWorkspaceDefaultMenuSet(
  ctx: any,
  workspace: Doc<"workspaces">,
  actorUserId: Id<"users">,
) {
  const existingAssignment = await ctx.db
    .query("workspaceMenuAssignments")
    .withIndex("by_workspace_default", (q: any) => q.eq("workspaceId", workspace._id).eq("isDefault", true))
    .first()

  if (existingAssignment) {
    return existingAssignment.menuSetId
  }

  const menuSetId = await ctx.db.insert("menuSets", {
    ownerType: "workspace",
    ownerWorkspaceId: workspace._id,
    name: `${workspace.name} Default`,
    slug: `workspace-${String(workspace._id)}-default`,
    description: `Default menu set for ${workspace.name}`,
    isPublic: false,
    createdBy: actorUserId,
  })

  await ctx.db.insert("workspaceMenuAssignments", {
    workspaceId: workspace._id,
    menuSetId,
    isDefault: true,
    order: 0,
    createdAt: Date.now(),
  })

  return menuSetId
}

async function installManifestItemsForWorkspace(
  ctx: any,
  args: {
    workspace: Doc<"workspaces">
    actorUserId: Id<"users">
    selectedSlugs?: string[]
  },
) {
  const menuSetId = await ensureWorkspaceDefaultMenuSet(ctx, args.workspace, args.actorUserId)
  const existingItems = await getScopeMenuItems(ctx, args.workspace._id, menuSetId)
  const existingSlugs = new Set(
    existingItems
      .map((item: MenuItemDoc) => item.slug)
      .filter((slug: string | undefined): slug is string => Boolean(slug)),
  )
  const existingBySlug = new Map<string, MenuItemDoc>()
  for (const item of existingItems) {
    if (item.slug) existingBySlug.set(item.slug, item)
  }

  const selectedSlugSet = new Set(args.selectedSlugs ?? [])
  const optionalItems = OPTIONAL_FEATURES_CATALOG
    .filter((item) => selectedSlugSet.has(item.slug)) as TemplateFeatureManifestItem[]
  const manifestItems = [...(DEFAULT_MENU_ITEMS as TemplateFeatureManifestItem[]), ...optionalItems]
  const dedupedItems = manifestItems.filter((item, index, all) =>
    all.findIndex((candidate) => candidate.slug === item.slug) === index,
  )

  let maxOrder = existingItems.reduce(
    (max: number, item: MenuItemDoc) => Math.max(max, item.order || 0),
    0,
  )
  let insertedCount = 0

  // @dod:skip-perf reason="maxOrder accumulates each iteration — insertion order determines menu position; must stay sequential"
  for (const featureData of dedupedItems) {
    if (existingSlugs.has(featureData.slug)) {
      // Refresh stored metadata so config.ts status/isReady/version bumps
      // propagate to already-seeded rows. Preserves user-customised name,
      // order, visibility, parentId; overwrites metadata only.
      const existingRow = existingBySlug.get(featureData.slug)
      if (existingRow) {
        const requiresPermission = getManifestRequiredPermission(featureData)
        const mergedMetadata = {
          ...(existingRow.metadata ?? {}),
          description: featureData.description ?? existingRow.metadata?.description,
          category: featureData.category ?? existingRow.metadata?.category,
          tags: featureData.tags ?? existingRow.metadata?.tags,
          version: featureData.version ?? existingRow.metadata?.version,
          status: normalizeFeatureStatus(featureData.status ?? existingRow.metadata?.status),
          isReady: featureData.isReady ?? existingRow.metadata?.isReady,
          expectedRelease: featureData.expectedRelease ?? existingRow.metadata?.expectedRelease,
          featureType: (featureData.featureType as FeatureVisibilityType | undefined) ??
            existingRow.metadata?.featureType,
          requiresPermission: requiresPermission ?? existingRow.metadata?.requiresPermission,
          originalRequiresPermission:
            featureData.originalRequiresPermission ?? existingRow.metadata?.originalRequiresPermission,
        }
        // Only patch when something actually changed to avoid write amplification.
        const beforeJson = JSON.stringify(existingRow.metadata ?? {})
        const afterJson = JSON.stringify(mergedMetadata)
        if (beforeJson !== afterJson) {
          // @dod:skip-perf reason="maxOrder accumulates each iteration — insertion order determines menu position; must stay sequential"
          await ctx.db.patch(existingRow._id, { metadata: mergedMetadata })
        }
      }
      continue
    }

    maxOrder += 1
    const requiresPermission = getManifestRequiredPermission(featureData)
    const visibleForRoleIds = requiresPermission
      ? await getRolesWithPermission(ctx, args.workspace._id, requiresPermission)
      : []

    // @dod:skip-perf reason="maxOrder accumulates each iteration — insertion order determines menu position; must stay sequential"
    await ctx.db.insert("menuItems", {
      workspaceId: args.workspace._id,
      menuSetId,
      parentId: undefined,
      name: generateWorkspaceFeatureLabel(featureData.slug, {
        workspaceName: args.workspace.name,
        fallbackName: featureData.name || featureData.slug,
      }),
      slug: featureData.slug,
      type: normalizeManifestType(featureData.type),
      icon: featureData.icon,
      path: featureData.path || `/${featureData.slug}`,
      component: featureData.component,
      order: maxOrder,
      isVisible: true,
      visibleForRoleIds,
      metadata: {
        ...(featureData.metadata ?? {}),
        description: featureData.description ?? featureData.metadata?.description,
        category: featureData.category ?? featureData.metadata?.category,
        tags: featureData.tags ?? featureData.metadata?.tags,
        version: featureData.version ?? featureData.metadata?.version,
        status: normalizeFeatureStatus(featureData.status ?? featureData.metadata?.status),
        isReady: featureData.isReady ?? featureData.metadata?.isReady,
        expectedRelease: featureData.expectedRelease ?? featureData.metadata?.expectedRelease,
        featureType: (featureData.featureType as FeatureVisibilityType | undefined) ?? featureData.metadata?.featureType,
        originalFeatureType: featureData.originalFeatureType ?? featureData.metadata?.originalFeatureType,
        requiresPermission: requiresPermission ?? featureData.metadata?.requiresPermission,
        originalRequiresPermission:
          featureData.originalRequiresPermission ?? featureData.metadata?.originalRequiresPermission,
      },
      createdBy: args.actorUserId,
    })

    existingSlugs.add(featureData.slug)
    insertedCount += 1
  }

  return insertedCount
}

function buildShareableMenuId(menuItem: MenuItemDoc) {
  return `${SHAREABLE_MENU_PREFIX}:${menuItem.workspaceId}:${menuItem._id}`
}

function parseShareableMenuId(shareableId: string) {
  const [prefix, workspaceId, menuItemId] = shareableId.split(":")
  if (prefix !== SHAREABLE_MENU_PREFIX || !workspaceId || !menuItemId) {
    throw new Error("Invalid shareable menu ID")
  }

  return {
    workspaceId,
    menuItemId,
  }
}

async function copyMenuTreeToWorkspace(
  ctx: any,
  args: {
    sourceRoot: MenuItemDoc
    targetWorkspaceId: Id<"workspaces">
    targetMenuSetId?: Id<"menuSets">
    targetParentId?: Id<"menuItems">
    rootOrder: number
    rootName?: string
    actorUserId: Id<"users">
  },
) {
  const sourceTree = await getMenuItemTree(ctx, args.sourceRoot._id)
  if (sourceTree.length === 0) {
    throw new Error("Menu item not found")
  }

  const childrenByParent = new Map<string, MenuItemDoc[]>()
  for (const item of sourceTree) {
    const key = toParentKey(item.parentId)
    const current = childrenByParent.get(key) ?? []
    current.push(item)
    current.sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
    childrenByParent.set(key, current)
  }

  const existingItems = await getScopeMenuItems(ctx, args.targetWorkspaceId, args.targetMenuSetId)
  const usedSlugs = new Set<string>(
    existingItems
      .map((item: MenuItemDoc) => item.slug)
      .filter((slug: string | undefined): slug is string => Boolean(slug)),
  )

  const cloneItem = async (
    item: MenuItemDoc,
    parentId: Id<"menuItems"> | undefined,
    explicitOrder?: number,
    explicitName?: string,
  ): Promise<Id<"menuItems">> => {
    const copiedSlug = buildUniqueCopySlug(item.slug, usedSlugs)
    const insertedId = await ctx.db.insert("menuItems", {
      workspaceId: args.targetWorkspaceId,
      menuSetId: args.targetMenuSetId,
      parentId,
      name: explicitName ?? item.name,
      slug: copiedSlug,
      type: item.type,
      icon: item.icon,
      path: getCopiedPath(item.path, item.slug, copiedSlug),
      component: item.component,
      order: explicitOrder ?? item.order,
      isVisible: item.isVisible,
      visibleForRoleIds: item.visibleForRoleIds ?? [],
      metadata: item.metadata,
      createdBy: args.actorUserId,
    })

    const bindings = await ctx.db
      .query("menuItemComponents")
      .withIndex("by_menuItem", (q: any) => q.eq("menuItemId", item._id))
      .take(1000)

    await Promise.all(bindings.map((binding: any) =>
      ctx.db.insert("menuItemComponents", {
        menuItemId: insertedId,
        componentVersionId: binding.componentVersionId,
        slot: binding.slot,
        order: binding.order,
        props: binding.props,
        bindings: binding.bindings,
        layout: binding.layout,
        visibility: binding.visibility,
        createdAt: Date.now(),
      })
    ))

    const children = childrenByParent.get(String(item._id)) ?? []
    for (const child of children) {
      await cloneItem(child, insertedId)
    }

    return insertedId
  }

  return await cloneItem(
    args.sourceRoot,
    args.targetParentId,
    args.rootOrder,
    args.rootName,
  )
}

// Get workspace menu items - merges database items with manifest for SSOT
export const getWorkspaceMenuItems = query({
  args: {
    workspaceId: v.id("workspaces"),
  },
  handler: async (ctx, args) => {
    let membership: any = null
    try {
      const res = await requireActiveMembership(ctx, args.workspaceId)
      membership = res.membership
    } catch {
      return [] as any
    }

    // Resolve effective menu set for this user within the workspace
    let effectiveMenuSetId: any = null
    try {
      const candidateIds = await resolveCandidateUserIds(ctx)
      for (const idStr of candidateIds) {
        const userAssignments = await ctx.db
          .query("userMenuAssignments")
          .withIndex("by_user", (q) => q.eq("userId", idStr as any))
          .take(1000)
        // Prefer workspace-scoped default
        const wsDefault = userAssignments.find(
          (a: any) =>
            a.scope === "workspace" && String(a.workspaceId || "") === String(args.workspaceId) && a.isDefault,
        )
        if (wsDefault) {
          effectiveMenuSetId = wsDefault.menuSetId
          break
        }
        // Then prefer any workspace-scoped assignment
        const wsAny = userAssignments.find(
          (a: any) => a.scope === "workspace" && String(a.workspaceId || "") === String(args.workspaceId),
        )
        if (wsAny) {
          effectiveMenuSetId = wsAny.menuSetId
          break
        }
        // Then global default
        const globalDefault = userAssignments.find((a: any) => a.scope === "global" && a.isDefault)
        if (globalDefault) {
          effectiveMenuSetId = globalDefault.menuSetId
          break
        }
      }
      if (!effectiveMenuSetId) {
        const wsAssignedDefault = await ctx.db
          .query("workspaceMenuAssignments")
          .withIndex("by_workspace_default", (q) => q.eq("workspaceId", args.workspaceId).eq("isDefault", true))
          .first()
        if (wsAssignedDefault) effectiveMenuSetId = wsAssignedDefault.menuSetId
      }
    } catch (_err) { }

    // Get all menu items for the effective scope
    let menuItems: any[] = []
    if (effectiveMenuSetId) {
      menuItems = await ctx.db
        .query("menuItems")
        .withIndex("by_menuSet", (q) => q.eq("menuSetId", effectiveMenuSetId))
        .filter((q) => q.eq(q.field("isVisible"), true))
        .take(1000)
    } else {
      // Back-compat: workspace-scoped menu items
      menuItems = await ctx.db
        .query("menuItems")
        .withIndex("by_workspace", (q) => q.eq("workspaceId", args.workspaceId))
        .filter((q) => q.eq(q.field("isVisible"), true))
        .take(1000)
    }

    // === SSOT: Feature/menu visibility is controlled by:
    // 1) DEFAULT_MENU_ITEMS manifest for default/system features
    // 2) systemFeatures table (platform admin) if present
    // 3) OPTIONAL_FEATURES_CATALOG fallback if systemFeatures is not seeded
    // 4) featureAccess table for per-workspace enable/disable overrides

    const manifestBySlug = new Map(DEFAULT_MENU_ITEMS.map((m: any) => [m.slug, m]))
    const manifestSlugs = new Set(manifestBySlug.keys())

    const systemFeatures = await ctx.db.query("systemFeatures").take(100)
    const hasSystemRegistry = systemFeatures.length > 0
    const systemById = new Map(systemFeatures.map((f: any) => [f.featureId, f]))

    const optionalFallbackSlugs = new Set(OPTIONAL_FEATURES_CATALOG.map((f: any) => f.slug))
    const optionalSlugs = hasSystemRegistry
      ? new Set(Array.from(systemById.values()).filter((f: any) => f.featureType === "optional").map((f: any) => f.featureId))
      : optionalFallbackSlugs

    const featureAccess = await ctx.db
      .query("featureAccess")
      .withIndex("by_workspace", (q: any) => q.eq("workspaceId", args.workspaceId))
      .take(1000)
    const accessByFeatureId = new Map(featureAccess.map((a: any) => [a.featureId, a]))

    const systemAllows = (featureId: string, featureType?: string) => {
      if (!hasSystemRegistry) return true
      const sys = systemById.get(featureId)
      if (!sys) {
        // If the platform registry exists but doesn't include this feature:
        // - allow default/system features if they still exist in the code manifest
        // - treat optional features as removed from the platform catalog
        return featureType === "default" || featureType === "system"
      }
      if (sys.isEnabled === false) return false
      if (sys.status === "disabled") return false
      return true
    }

    const isFeatureMenuCandidate = (item: any) => {
      const slug = String(item?.slug ?? "")
      return Boolean(item?.metadata?.featureType) || manifestSlugs.has(slug) || optionalSlugs.has(slug)
    }

    const isFeatureMenuAllowed = (item: any) => {
      const slug = String(item?.slug ?? "")
      const manifestItem = manifestBySlug.get(slug)
      const inferredType =
        item?.metadata?.featureType ??
        item?.metadata?.originalFeatureType ??
        manifestItem?.metadata?.featureType ??
        (optionalSlugs.has(slug) ? "optional" : undefined)

      const access = accessByFeatureId.get(slug)

      if (inferredType === "default" || inferredType === "system") {
        // Must still exist in code manifest; can be explicitly disabled via admin overrides.
        if (!manifestSlugs.has(slug)) return false
        if (!systemAllows(slug, inferredType)) return false
        if (isFeatureDisabledByAccess(access)) return false
        return true
      }

      if (inferredType === "optional") {
        // Optional features are admin-controlled; if the platform registry exists, it is authoritative.
        if (!optionalSlugs.has(slug)) return false
        if (!systemAllows(slug, inferredType)) return false
        // If there is an explicit per-workspace access record, respect it.
        // If there is no record, keep backward-compat with existing installed menu items.
        if (access) return isFeatureEnabledByAccess(access)
        return true
      }

      // Unknown type: if it's not in manifest or optional catalog, treat as stale feature and hide.
      if (manifestSlugs.has(slug)) return systemAllows(slug, "default") && !isFeatureDisabledByAccess(access)
      if (optionalSlugs.has(slug)) return systemAllows(slug, "optional") && (access ? isFeatureEnabledByAccess(access) : true)
      return false
    }

    // Remove stale/disabled feature menu items from the response.
    // (We do not delete DB rows here; we just stop showing them to users.)
    menuItems = menuItems.filter((item) => {
      if (!isFeatureMenuCandidate(item)) return true
      return isFeatureMenuAllowed(item)
    })

    // === SSOT: Merge missing default/system features from manifest ===
    // This ensures new features appear immediately without requiring a sync
    const dbSlugs = new Set(menuItems.map((item) => item.slug))

    // Build catalog lookup for optional features
    const catalogBySlug = new Map(
      OPTIONAL_FEATURES_CATALOG.map((f) => [f.slug, f])
    )

    // Get roles for permission checking
    const allRoles = await ctx.db
      .query("roles")
      .withIndex("by_workspace", (q: any) => q.eq("workspaceId", args.workspaceId))
      .take(1000)

    const getVisibleRoleIds = (permKey?: string) => {
      const permissionValue = normalizePermissionKey(permKey)
      if (!permissionValue) return []
      return allRoles
        .filter((role: any) => {
          const permissions = role.permissions || []
          return permissions.includes("*") || permissions.includes(permissionValue)
        })
        .map((role: any) => role._id)
    }

    // === SSOT: Update existing optional features with latest catalog values ===
    // This ensures isReady and status are always current from catalog
    menuItems = menuItems.map((item) => {
      const catalogFeature = catalogBySlug.get(item.slug)
      if (catalogFeature && item.metadata?.featureType === "optional") {
        return {
          ...item,
          metadata: {
            ...item.metadata,
            isReady: catalogFeature.isReady,
            status: catalogFeature.status,
          },
        }
      }
      return item
    })

    // Add missing default/system features from manifest (respect platform/admin disabling)
    for (const manifestItem of DEFAULT_MENU_ITEMS) {
      if (!dbSlugs.has(manifestItem.slug)) {
        // Only include default and system features (not optional)
        const featureType = manifestItem.metadata?.featureType
        if (featureType === "default" || featureType === "system") {
          if (!systemAllows(manifestItem.slug, featureType)) continue
          const access = accessByFeatureId.get(manifestItem.slug)
          if (isFeatureDisabledByAccess(access)) continue
          const visibleForRoleIds = getVisibleRoleIds(manifestItem.requiresPermission)

          // Create a virtual menu item from manifest
          menuItems.push({
            _id: `manifest:${manifestItem.slug}` as any, // Virtual ID
            workspaceId: args.workspaceId,
            name: manifestItem.name,
            slug: manifestItem.slug,
            type: manifestItem.type,
            icon: manifestItem.icon,
            path: manifestItem.path,
            component: manifestItem.component,
            order: manifestItem.order,
            isVisible: true,
            visibleForRoleIds,
            metadata: manifestItem.metadata,
            _fromManifest: true, // Mark as from manifest (not persisted)
          })
        }
      }
    }

    // Filter menu items based on user role permissions
    const visibleMenuItems = menuItems.filter((item) => {
      if (item.visibleForRoleIds.length === 0) return true // Visible to all if no specific roles
      return item.visibleForRoleIds.includes(membership.roleId)
    })

    // Sort by order
    return visibleMenuItems.sort((a, b) => a.order - b.order)
  },
})

// Get available feature menus (features that can be added to a workspace menu)
// Only returns features NOT already installed in the workspace
export const getAvailableFeatureMenus = query({
  args: {
    workspaceId: v.id("workspaces"),
  },
  handler: async (ctx, args) => {
    // Get the workspace's default menu set
    const wsAssignment = await ctx.db
      .query("workspaceMenuAssignments")
      .withIndex("by_workspace_default", (q: any) => q.eq("workspaceId", args.workspaceId).eq("isDefault", true))
      .first()
    const menuSetId = wsAssignment?.menuSetId

    // Get currently installed menu items - check BOTH menuSetId and workspaceId for compatibility
    let installedMenuItems: any[] = []

    if (menuSetId) {
      installedMenuItems = await ctx.db
        .query("menuItems")
        .withIndex("by_menuSet", (q: any) => q.eq("menuSetId", menuSetId))
        .take(1000)
    }

    // Also check by workspaceId (back-compat for old items without menuSetId)
    const wsItems = await ctx.db
      .query("menuItems")
      .withIndex("by_workspace", (q: any) => q.eq("workspaceId", args.workspaceId))
      .take(1000)

    // Merge and dedupe by slug
    const allInstalled = [...installedMenuItems, ...wsItems]
    const installedSlugs = new Set(allInstalled.map(item => item.slug))

    // Combine default features from manifest with optional features catalog
    const allFeatures = [
      ...DEFAULT_MENU_ITEMS.map((item) => {
        const metadata = ((item as any).metadata ?? {}) as Record<string, any>
        return {
          slug: item.slug,
          name: item.name,
          description: (item as any).description ?? metadata.description ?? "",
          icon: item.icon ?? "Box",
          version: (item as any).version ?? metadata.version,
          category: (item as any).category ?? metadata.category,
          featureType: (item as any).featureType ?? metadata.featureType,
          tags: (item as any).tags ?? metadata.tags ?? [],
          status: normalizeFeatureStatus((item as any).status ?? metadata.status) ?? "stable" as const,
          isReady: (item as any).isReady ?? metadata.isReady ?? true,
          expectedRelease: (item as any).expectedRelease ?? metadata.expectedRelease,
        }
      }),
      ...OPTIONAL_FEATURES_CATALOG.map((item) => ({
        slug: item.slug,
        name: item.name,
        description: item.description ?? "",
        icon: item.icon ?? "Box",
        version: item.version,
        category: item.category,
        featureType: "optional" as const,
        tags: item.tags ?? [],
        status: normalizeFeatureStatus(item.status) ?? "stable" as const,
        isReady: item.isReady ?? true,
        expectedRelease: (item as FeatureManifestItem).expectedRelease,
      })),
    ]

    // Dedupe by slug (prefer first occurrence) AND filter out already installed features
    const seen = new Set<string>()
    return allFeatures.filter((f) => {
      // Skip if already seen (dedupe)
      if (seen.has(f.slug)) return false
      seen.add(f.slug)
      // Skip if already installed in this workspace
      if (installedSlugs.has(f.slug)) return false
      return true
    })
  },
})

// Get single menu item
export const getMenuItem = query({
  args: { menuItemId: v.id("menuItems") },
  handler: async (ctx, args) => {
    const menuItem = await ctx.db.get(args.menuItemId)
    if (!menuItem) return null
    try {
      await requireActiveMembership(ctx, menuItem.workspaceId)
    } catch {
      return null as any
    }

    return menuItem
  },
})

// Get menu item by slug within a workspace (with access validation)
export const getMenuItemBySlug = query({
  args: { workspaceId: v.id("workspaces"), slug: v.string() },
  handler: async (ctx, args) => {
    let membership: any = null
    try {
      const res = await requireActiveMembership(ctx, args.workspaceId)
      membership = res.membership
    } catch {
      return null as any
    }

    // Resolve effective menu set (see getWorkspaceMenuItems)
    let effectiveMenuSetId: any = null
    try {
      const candidateIds = await resolveCandidateUserIds(ctx)
      for (const idStr of candidateIds) {
        const userAssignments = await ctx.db
          .query("userMenuAssignments")
          .withIndex("by_user", (q) => q.eq("userId", idStr as any))
          .take(1000)
        const wsDefault = userAssignments.find(
          (a: any) =>
            a.scope === "workspace" && String(a.workspaceId || "") === String(args.workspaceId) && a.isDefault,
        )
        if (wsDefault) {
          effectiveMenuSetId = wsDefault.menuSetId
          break
        }
        const wsAny = userAssignments.find(
          (a: any) => a.scope === "workspace" && String(a.workspaceId || "") === String(args.workspaceId),
        )
        if (wsAny) {
          effectiveMenuSetId = wsAny.menuSetId
          break
        }
        const globalDefault = userAssignments.find((a: any) => a.scope === "global" && a.isDefault)
        if (globalDefault) {
          effectiveMenuSetId = globalDefault.menuSetId
          break
        }
      }
      if (!effectiveMenuSetId) {
        const wsAssignedDefault = await ctx.db
          .query("workspaceMenuAssignments")
          .withIndex("by_workspace_default", (q) => q.eq("workspaceId", args.workspaceId).eq("isDefault", true))
          .first()
        if (wsAssignedDefault) effectiveMenuSetId = wsAssignedDefault.menuSetId
      }
    } catch (_err) { }

    let items: any[] = []
    if (effectiveMenuSetId) {
      items = await ctx.db
        .query("menuItems")
        .withIndex("by_menuSet", (q) => q.eq("menuSetId", effectiveMenuSetId))
        .filter((q) => q.and(q.eq(q.field("slug"), args.slug), q.eq(q.field("isVisible"), true)))
        .take(1000)
    } else {
      // Back-compat: workspace-scoped
      items = await ctx.db
        .query("menuItems")
        .withIndex("by_workspace", (q) => q.eq("workspaceId", args.workspaceId))
        .filter((q) => q.and(q.eq(q.field("slug"), args.slug), q.eq(q.field("isVisible"), true)))
        .take(1000)
    }

    const item = items[0] || null
    if (!item) return null

    // Enforce SSOT feature visibility (same rules as getWorkspaceMenuItems)
    const manifestBySlug = new Map(DEFAULT_MENU_ITEMS.map((m: any) => [m.slug, m]))
    const manifestSlugs = new Set(manifestBySlug.keys())

    const systemFeatures = await ctx.db.query("systemFeatures").take(100)
    const hasSystemRegistry = systemFeatures.length > 0
    const systemById = new Map(systemFeatures.map((f: any) => [f.featureId, f]))

    const optionalFallbackSlugs = new Set(OPTIONAL_FEATURES_CATALOG.map((f: any) => f.slug))
    const optionalSlugs = hasSystemRegistry
      ? new Set(Array.from(systemById.values()).filter((f: any) => f.featureType === "optional").map((f: any) => f.featureId))
      : optionalFallbackSlugs

    const access = await ctx.db
      .query("featureAccess")
      .withIndex("by_feature_workspace", (q: any) => q.eq("featureId", args.slug).eq("workspaceId", args.workspaceId))
      .first()

    const systemAllows = (featureId: string, featureType?: string) => {
      if (!hasSystemRegistry) return true
      const sys = systemById.get(featureId)
      if (!sys) {
        return featureType === "default" || featureType === "system"
      }
      if (sys.isEnabled === false) return false
      if (sys.status === "disabled") return false
      return true
    }

    const manifestItem = manifestBySlug.get(args.slug)
    const inferredType =
      item?.metadata?.featureType ??
      item?.metadata?.originalFeatureType ??
      manifestItem?.metadata?.featureType ??
      (optionalSlugs.has(args.slug) ? "optional" : undefined)

    const isCandidate = Boolean(inferredType) || manifestSlugs.has(args.slug) || optionalSlugs.has(args.slug)
    if (isCandidate) {
      if (inferredType === "default" || inferredType === "system") {
        if (!manifestSlugs.has(args.slug)) return null as any
        if (!systemAllows(args.slug, inferredType)) return null as any
        if (isFeatureDisabledByAccess(access)) return null as any
      } else if (inferredType === "optional") {
        if (!optionalSlugs.has(args.slug)) return null as any
        if (!systemAllows(args.slug, inferredType)) return null as any
        if (access && !isFeatureEnabledByAccess(access)) return null as any
      } else {
        // Unknown feature-type candidate: hide if not known.
        if (!manifestSlugs.has(args.slug) && !optionalSlugs.has(args.slug)) return null as any
      }
    }

    // Role-based visibility (if configured)
    if (item.visibleForRoleIds.length > 0 && !item.visibleForRoleIds.includes(membership.roleId)) {
      return null as any
    }

    return item
  },
})

// Create default menu items for a workspace based on manifest
// INTERNAL MUTATION: Called from server context (createWorkspace, resetWorkspace)
// Does not require auth - actorUserId passed from caller (workspace owner)
export const createDefaultMenuItems = internalMutation({
  args: {
    workspaceId: v.id("workspaces"),
    selectedSlugs: v.optional(v.array(v.string())),
    actorUserId: v.optional(v.id("users")), // Passed from createWorkspace (owner)
  },
  handler: async (ctx, args) => {
    const workspace = await ctx.db.get(args.workspaceId)
    if (!workspace) {
      return false
    }

    const actorUserId = await resolveMenuActorUserId(ctx, args.workspaceId, args.actorUserId)
    if (!actorUserId) {
      return false
    }

    await installManifestItemsForWorkspace(ctx, {
      workspace,
      actorUserId,
      selectedSlugs: args.selectedSlugs,
    })

    return true
  },
})

export const deleteMenuItem = mutation({
  args: {
    menuItemId: v.id("menuItems"),
  },
  handler: async (ctx, args) => {
    const menuItem = await ctx.db.get(args.menuItemId)
    if (!menuItem) return args.menuItemId

    const { membership } = await requirePermission(ctx, menuItem.workspaceId, PERMS.MANAGE_MENUS)
    const actorUserId = membership?.userId ?? (await ensureUser(ctx))
    const tree = await getMenuItemTree(ctx, args.menuItemId)
    const deletedIds = new Set(tree.map((item) => String(item._id)))

    for (const item of tree) {
      const rolePermissions = await ctx.db
        .query("roleMenuPermissions")
        .withIndex("by_menu", (q: any) => q.eq("menuItemId", item._id))
        .take(1000)

      const bindings = await ctx.db
        .query("menuItemComponents")
        .withIndex("by_menuItem", (q: any) => q.eq("menuItemId", item._id))
        .take(1000)

      await Promise.all([
        ...rolePermissions.map((permission: any) => ctx.db.delete(permission._id)),
        ...bindings.map((binding: any) => ctx.db.delete(binding._id)),
      ])
    }

    // @dod:skip-perf reason="tree deleted in reverse (children before parents) to avoid FK violations; ordering is required"
    for (const item of [...tree].reverse()) {
      await ctx.db.delete(item._id)
    }

    await normalizeMenuOrders(ctx, menuItem.workspaceId, menuItem.parentId, deletedIds)

    await logAuditEvent(ctx, {
      action: "menus.delete",
      workspaceId: menuItem.workspaceId,
      actorUserId,
      resourceType: "menu_item",
      resourceId: args.menuItemId,
      changes: {
        deletedCount: tree.length,
        deletedMenuItemIds: [...deletedIds],
        parentId: menuItem.parentId ?? null,
      },
    })

    return args.menuItemId
  },
})

export const updateMenuOrder = mutation({
  args: {
    menuItemId: v.id("menuItems"),
    newOrder: v.number(),
    parentId: v.optional(v.union(v.id("menuItems"), v.null())),
  },
  handler: async (ctx, args) => {
    const menuItem = await ctx.db.get(args.menuItemId)
    if (!menuItem) throw new Error("Menu item not found")

    const { membership } = await requirePermission(ctx, menuItem.workspaceId, PERMS.MANAGE_MENUS)
    const actorUserId = membership?.userId ?? (await ensureUser(ctx))
    const nextParentId = args.parentId ?? undefined
    const previousParentId = menuItem.parentId

    await ctx.db.patch(args.menuItemId, {
      parentId: nextParentId,
      order: args.newOrder,
    })

    if (String(previousParentId ?? "") !== String(nextParentId ?? "")) {
      await normalizeMenuOrders(ctx, menuItem.workspaceId, previousParentId)
    }

    await logAuditEvent(ctx, {
      action: "menus.reorder",
      workspaceId: menuItem.workspaceId,
      actorUserId,
      resourceType: "menu_item",
      resourceId: args.menuItemId,
      changes: {
        previousParentId: previousParentId ?? null,
        nextParentId: nextParentId ?? null,
        previousOrder: menuItem.order,
        nextOrder: args.newOrder,
      },
    })

    return args.menuItemId
  },
})

export const renameMenuItem = mutation({
  args: {
    menuItemId: v.id("menuItems"),
    name: v.string(),
  },
  handler: async (ctx, args) => {
    const menuItem = await ctx.db.get(args.menuItemId)
    if (!menuItem) throw new Error("Menu item not found")

    const nextName = args.name.trim()
    if (!nextName) throw new Error("Menu item name is required")

    const { membership } = await requirePermission(ctx, menuItem.workspaceId, PERMS.MANAGE_MENUS)
    const actorUserId = membership?.userId ?? (await ensureUser(ctx))

    await ctx.db.patch(args.menuItemId, {
      name: nextName,
    })

    await logAuditEvent(ctx, {
      action: "menus.rename",
      workspaceId: menuItem.workspaceId,
      actorUserId,
      resourceType: "menu_item",
      resourceId: args.menuItemId,
      changes: {
        previousName: menuItem.name,
        nextName,
      },
    })

    return args.menuItemId
  },
})

export const duplicateMenuItem = mutation({
  args: {
    menuItemId: v.id("menuItems"),
    newName: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const menuItem = await ctx.db.get(args.menuItemId)
    if (!menuItem) throw new Error("Menu item not found")

    const { membership } = await requirePermission(ctx, menuItem.workspaceId, PERMS.MANAGE_MENUS)
    const actorUserId = membership?.userId ?? (await ensureUser(ctx))

    const siblings = await ctx.db
      .query("menuItems")
      .withIndex("by_workspace_parent", (q: any) => q.eq("workspaceId", menuItem.workspaceId).eq("parentId", menuItem.parentId))
      .take(1000)

    const usedNames = new Set(siblings.map((item: MenuItemDoc) => item.name))
    const nextName = args.newName?.trim()
      ? args.newName.trim()
      : buildUniqueCopyName(menuItem.name, usedNames)
    const nextOrder = siblings.reduce((max: number, item: MenuItemDoc) => Math.max(max, item.order ?? 0), -1) + 1

    const duplicatedMenuItemId = await copyMenuTreeToWorkspace(ctx, {
      sourceRoot: menuItem,
      targetWorkspaceId: menuItem.workspaceId,
      targetMenuSetId: menuItem.menuSetId,
      targetParentId: menuItem.parentId,
      rootOrder: nextOrder,
      rootName: nextName,
      actorUserId,
    })

    await logAuditEvent(ctx, {
      action: "menus.duplicate",
      workspaceId: menuItem.workspaceId,
      actorUserId,
      resourceType: "menu_item",
      resourceId: duplicatedMenuItemId,
      changes: {
        sourceMenuItemId: menuItem._id,
        sourceName: menuItem.name,
        duplicatedName: nextName,
      },
    })

    return duplicatedMenuItemId
  },
})

export const shareMenuItem = mutation({
  args: {
    menuItemId: v.id("menuItems"),
  },
  handler: async (ctx, args) => {
    const menuItem = await ctx.db.get(args.menuItemId)
    if (!menuItem) throw new Error("Menu item not found")

    const { membership } = await requirePermission(ctx, menuItem.workspaceId, PERMS.MANAGE_MENUS)
    const actorUserId = membership?.userId ?? (await ensureUser(ctx))
    const shareableId = buildShareableMenuId(menuItem)

    await logAuditEvent(ctx, {
      action: "menus.share",
      workspaceId: menuItem.workspaceId,
      actorUserId,
      resourceType: "menu_item",
      resourceId: args.menuItemId,
      changes: {
        shareableId,
      },
    })

    return {
      shareableId,
      menuItemId: menuItem._id,
      name: menuItem.name,
      slug: menuItem.slug,
    }
  },
})

export const importMenuFromShareableId = mutation({
  args: {
    workspaceId: v.id("workspaces"),
    shareableId: v.string(),
    newName: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const { membership } = await requirePermission(ctx, args.workspaceId, PERMS.MANAGE_MENUS)
    const actorUserId = membership?.userId ?? (await ensureUser(ctx))
    const { menuItemId } = parseShareableMenuId(args.shareableId)
    const normalizedMenuItemId = ctx.db.normalizeId("menuItems", menuItemId)

    if (!normalizedMenuItemId) {
      throw new Error("Shared menu item not found")
    }

    const sourceMenuItem = await ctx.db.get(normalizedMenuItemId)
    if (!sourceMenuItem) {
      throw new Error("Shared menu item not found")
    }

    const targetMenuSetId = await getWorkspaceDefaultMenuSetId(ctx, args.workspaceId)
    const targetRootItems = await ctx.db
      .query("menuItems")
      .withIndex("by_workspace_parent", (q: any) => q.eq("workspaceId", args.workspaceId).eq("parentId", undefined))
      .take(1000)

    const usedRootNames = new Set(targetRootItems.map((item: MenuItemDoc) => item.name))
    const importedName = args.newName?.trim()
      ? args.newName.trim()
      : usedRootNames.has(sourceMenuItem.name)
        ? buildUniqueCopyName(sourceMenuItem.name, usedRootNames, "Imported")
        : sourceMenuItem.name
    const nextOrder = targetRootItems.reduce((max: number, item: MenuItemDoc) => Math.max(max, item.order ?? 0), -1) + 1

    const importedMenuItemId = await copyMenuTreeToWorkspace(ctx, {
      sourceRoot: sourceMenuItem,
      targetWorkspaceId: args.workspaceId,
      targetMenuSetId,
      targetParentId: undefined,
      rootOrder: nextOrder,
      rootName: importedName,
      actorUserId,
    })

    await logAuditEvent(ctx, {
      action: "menus.import",
      workspaceId: args.workspaceId,
      actorUserId,
      resourceType: "menu_item",
      resourceId: importedMenuItemId,
      changes: {
        sourceMenuItemId: sourceMenuItem._id,
        shareableId: args.shareableId,
        importedName,
      },
    })

    return {
      menuItemId: importedMenuItemId,
      imported: true,
      sourceName: sourceMenuItem.name,
    }
  },
})

// Update menu item
export const updateMenuItem = mutation({
  args: {
    menuItemId: v.id("menuItems"),
    name: v.optional(v.string()),
    slug: v.optional(v.string()),
    type: v.optional(
      v.union(
        v.literal("folder"),
        v.literal("group"),
        v.literal("route"),
        v.literal("divider"),
        v.literal("action"),
        v.literal("chat"),
        v.literal("document"),
      ),
    ),
    icon: v.optional(v.string()),
    path: v.optional(v.string()),
    component: v.optional(v.string()),
    isVisible: v.optional(v.boolean()),
    order: v.optional(v.number()),
    parentId: v.optional(v.union(v.id("menuItems"), v.null())),
    visibleForRoleIds: v.optional(v.array(v.id("roles"))),
    metadata: v.optional(
      v.object({
        description: v.optional(v.string()),
        badge: v.optional(v.string()),
        color: v.optional(v.string()),
        targetId: v.optional(v.string()),
        jsonPlaceholder: v.optional(v.object({})),
      }),
    ),
  },
  handler: async (ctx, args) => {
    const menuItem = await ctx.db.get(args.menuItemId)
    if (!menuItem) throw new Error("Menu item not found")
    const { membership } = await requirePermission(ctx, menuItem.workspaceId, PERMS.MANAGE_MENUS)
    const actorUserId = membership?.userId ?? (await ensureUser(ctx))

    const updates: any = {}
    if (args.name !== undefined) updates.name = args.name
    if (args.slug !== undefined) updates.slug = args.slug
    if (args.type !== undefined) updates.type = args.type
    if (args.icon !== undefined) updates.icon = args.icon
    if (args.path !== undefined) updates.path = args.path
    if (args.component !== undefined) updates.component = args.component
    if (args.isVisible !== undefined) updates.isVisible = args.isVisible
    if (args.order !== undefined) updates.order = args.order
    if (Object.prototype.hasOwnProperty.call(args, "parentId")) updates.parentId = args.parentId ?? undefined
    if (args.visibleForRoleIds !== undefined) updates.visibleForRoleIds = args.visibleForRoleIds
    if (args.metadata !== undefined) updates.metadata = args.metadata

    await ctx.db.patch(args.menuItemId, updates)

    await logAuditEvent(ctx, {
      action: "menus.update",
      workspaceId: menuItem.workspaceId,
      actorUserId,
      resourceType: "menu_item",
      resourceId: args.menuItemId,
      changes: updates,
    })

    return args.menuItemId
  },
})

export const setMenuItemFeatureType = mutation({
  args: {
    menuItemId: v.id("menuItems"),
    featureType: v.union(v.literal("default"), v.literal("system"), v.literal("optional")),
  },
  handler: async (ctx, args) => {
    const menuItem = await ctx.db.get(args.menuItemId)
    if (!menuItem) throw new Error("Menu item not found")

    const { membership } = await requirePermission(ctx, menuItem.workspaceId, PERMS.MANAGE_MENUS)
    const actorUserId = membership?.userId ?? (await ensureUser(ctx))

    const metadata: any = { ...(menuItem.metadata ?? {}) }
    const originalFeatureType: FeatureVisibilityType =
      (metadata.originalFeatureType as FeatureVisibilityType | undefined) ??
      (metadata.featureType as FeatureVisibilityType | undefined) ??
      "default"

    if (!metadata.originalFeatureType) {
      metadata.originalFeatureType = originalFeatureType
    }

    const targetFeatureType = args.featureType as FeatureVisibilityType
    metadata.featureType = targetFeatureType

    const originalPermission = metadata.originalRequiresPermission ?? metadata.requiresPermission
    const visibilityPermission =
      targetFeatureType === "system" ? SYSTEM_PERMISSION_KEY : originalPermission

    const visibleForRoleIds = await getRoleIdsForPermission(
      ctx,
      menuItem.workspaceId,
      visibilityPermission,
    )

    const updates: any = {
      metadata,
      visibleForRoleIds,
    }

    await ctx.db.patch(args.menuItemId, updates)

    await logAuditEvent(ctx, {
      action: "menus.update_feature_type",
      workspaceId: menuItem.workspaceId,
      actorUserId,
      resourceType: "menu_item",
      resourceId: args.menuItemId,
      changes: {
        previousFeatureType: menuItem.metadata?.featureType ?? null,
        nextFeatureType: metadata.featureType,
      },
    })

    return {
      menuItemId: args.menuItemId,
      featureType: metadata.featureType,
      visibleForRoleIds,
    }
  },
})

// Create menu item
export const createMenuItem = mutation({
  args: {
    workspaceId: v.id("workspaces"),
    parentId: v.optional(v.union(v.id("menuItems"), v.null())),
    name: v.string(),
    slug: v.string(),
    type: v.union(
      v.literal("folder"),
      v.literal("group"),
      v.literal("route"),
      v.literal("divider"),
      v.literal("action"),
      v.literal("chat"),
      v.literal("document"),
    ),
    icon: v.optional(v.string()),
    path: v.optional(v.string()),
    component: v.optional(v.string()),
    order: v.optional(v.number()),
    isVisible: v.optional(v.boolean()),
    visibleForRoleIds: v.optional(v.array(v.id("roles"))),
    metadata: v.optional(
      v.object({
        description: v.optional(v.string()),
        badge: v.optional(v.string()),
        color: v.optional(v.string()),
        targetId: v.optional(v.string()),
        jsonPlaceholder: v.optional(v.object({})),
      }),
    ),
  },
  handler: async (ctx, args) => {
    // Require permission
    const { membership } = await requirePermission(ctx, args.workspaceId, PERMS.MANAGE_MENUS)
    const actorUserId = membership?.userId ?? (await ensureUser(ctx))

    // Get next order number if not provided
    let order = args.order
    if (order === undefined) {
      const existingItems = await ctx.db
        .query("menuItems")
        .withIndex("by_workspace_parent", (q) => q.eq("workspaceId", args.workspaceId).eq("parentId", args.parentId ?? undefined))
        .take(1000)
      order = existingItems.length
    }

    let menuSetId: Id<"menuSets"> | undefined
    if (args.parentId) {
      const parentMenuItem = await ctx.db.get(args.parentId)
      menuSetId = parentMenuItem?.menuSetId
    } else {
      menuSetId = await getWorkspaceDefaultMenuSetId(ctx, args.workspaceId)
    }

    const menuItemId = await ctx.db.insert("menuItems", {
      workspaceId: args.workspaceId,
      menuSetId,
      parentId: args.parentId ?? undefined,
      name: args.name,
      slug: args.slug,
      type: args.type,
      icon: args.icon,
      path: args.path,
      component: args.component,
      order,
      isVisible: args.isVisible ?? true,
      visibleForRoleIds: args.visibleForRoleIds ?? [],
      metadata: args.metadata,
      createdBy: actorUserId,
    })

    await logAuditEvent(ctx, {
      action: "menus.create",
      workspaceId: args.workspaceId,
      actorUserId,
      resourceType: "menu_item",
      resourceId: menuItemId,
      changes: {
        parentId: args.parentId ?? null,
        slug: args.slug,
        type: args.type,
      },
    })

    return menuItemId
  },
})

export const syncWorkspaceDefaultMenus = mutation({
  args: {
    workspaceId: v.id("workspaces"),
    featureSlugs: v.optional(v.array(v.string())),
  },
  handler: async (ctx, args) => {
    try {
      const { membership } = await requirePermission(ctx, args.workspaceId, PERMS.MANAGE_MENUS)
      await ctx.runMutation(internal.features.menus.menuItems.createDefaultMenuItems, {
        workspaceId: args.workspaceId,
        actorUserId: membership?.userId,
        selectedSlugs: args.featureSlugs ?? undefined,
      })
      return true as const
    } catch (error) {
      return false as const
    }
  },
})

/**
 * Refresh stored metadata on existing menuItem rows against the live
 * feature catalog. Does NOT insert new rows or delete existing ones —
 * only patches metadata.{status, isReady, version, expectedRelease,
 * description, category, tags, requiresPermission} for rows whose slug
 * appears in the catalog.
 *
 * Use when config.ts changes (status → beta, isReady → true, bumped
 * version) need to propagate to workspaces that were seeded before the
 * bump, without re-running the full install path.
 */
export const refreshMenuMetadata = mutation({
  args: { workspaceId: v.id("workspaces") },
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  handler: async (ctx: any, args) => {
    await requirePermission(ctx, args.workspaceId, PERMS.MANAGE_MENUS)

    const existing = await ctx.db
      .query("menuItems")
      .withIndex("by_workspace", (q: any) => q.eq("workspaceId", args.workspaceId))
      .take(1000)

    // Merge DEFAULT + OPTIONAL into a slug→manifest map.
    const catalog = new Map<string, any>()
    for (const item of DEFAULT_MENU_ITEMS as TemplateFeatureManifestItem[]) {
      catalog.set(item.slug, item)
    }
    for (const item of OPTIONAL_FEATURES_CATALOG as unknown as TemplateFeatureManifestItem[]) {
      if (!catalog.has(item.slug)) catalog.set(item.slug, item)
    }

    const patchResults = await Promise.all(
      existing.map(async (row: any) => {
        if (!row.slug) return 0
        const featureData = catalog.get(row.slug)
        if (!featureData) return 0

        const requiresPermission = getManifestRequiredPermission(featureData)
        const merged = {
          ...(row.metadata ?? {}),
          description: featureData.description ?? row.metadata?.description,
          category: featureData.category ?? row.metadata?.category,
          tags: featureData.tags ?? row.metadata?.tags,
          version: featureData.version ?? row.metadata?.version,
          status: normalizeFeatureStatus(featureData.status ?? row.metadata?.status),
          isReady: featureData.isReady ?? row.metadata?.isReady,
          expectedRelease: featureData.expectedRelease ?? row.metadata?.expectedRelease,
          featureType: (featureData.featureType as FeatureVisibilityType | undefined) ??
            row.metadata?.featureType,
          requiresPermission: requiresPermission ?? row.metadata?.requiresPermission,
          originalRequiresPermission:
            featureData.originalRequiresPermission ?? row.metadata?.originalRequiresPermission,
        }

        if (JSON.stringify(row.metadata ?? {}) !== JSON.stringify(merged)) {
          await ctx.db.patch(row._id, { metadata: merged })
          return 1 as const
        }
        return 0 as const
      })
    )
    const patched = patchResults.reduce((a, b) => a + b, 0)

    return { patched, total: existing.length }
  },
})

// Cron job handler: Syncs default menus for all workspaces to ensure manifest updates propagate
export const syncAllWorkspaceMenus = internalMutation({
  args: {},
  handler: async (ctx) => {
    // 1. Get all workspaces
    // @dod:skip-perf reason="cron-triggered cross-workspace menu sync; full scan is the entire purpose"
    const workspaces = await ctx.db.query("workspaces").take(1000)

    // 2. For each workspace, sync default menu items
    // We use Promise.all to run them in parallel (up to limits)
    // For very large datasets, this might need to be an action iterating batches
    await Promise.all(
      workspaces.map(async (workspace) => {
        // Use ctx.runMutation to call the internal mutation (Convex best practice)
        // Note: We skip the actorUserId as this is a system-triggered sync
        await ctx.runMutation(internal.features.menus.menuItems.createDefaultMenuItems, {
          workspaceId: workspace._id,
          actorUserId: undefined,
          selectedSlugs: undefined,
        })
      })
    )

    console.log(`Synced menus for ${workspaces.length} workspaces`)
  },
})

// Get menu items that have updates available (version mismatch with manifest)
export const getMenuUpdates = query({
  args: {
    workspaceId: v.id("workspaces"),
  },
  handler: async (ctx, args) => {
    // Get all menu items for this workspace
    const menuItems = await ctx.db
      .query("menuItems")
      .withIndex("by_workspace", (q: any) => q.eq("workspaceId", args.workspaceId))
      .take(1000)

    const updates: Array<{
      menuItemId: Id<"menuItems">
      currentVersion: string
      latestVersion: string
    }> = []

    // Check each menu item against the manifest
    for (const item of menuItems) {
      if (!item.slug) continue

      // Look up in DEFAULT_MENU_ITEMS
      const defaultItem = DEFAULT_MENU_ITEMS.find((d) => d.slug === item.slug) as FeatureManifestItem | undefined
      if (defaultItem && defaultItem.version) {
        const currentVersion = (item as any).version || "1.0.0"
        if (currentVersion !== defaultItem.version) {
          updates.push({
            menuItemId: item._id,
            currentVersion,
            latestVersion: defaultItem.version,
          })
        }
        continue
      }

      // Look up in OPTIONAL_FEATURES_CATALOG
      const optionalItem = OPTIONAL_FEATURES_CATALOG.find((o) => o.slug === item.slug) as FeatureManifestItem | undefined
      if (optionalItem && optionalItem.version) {
        const currentVersion = (item as any).version || "1.0.0"
        if (currentVersion !== optionalItem.version) {
          updates.push({
            menuItemId: item._id,
            currentVersion,
            latestVersion: optionalItem.version,
          })
        }
      }
    }

    return updates
  },
})

// Install feature menus for a workspace (public API for frontend)
export const installFeatureMenus = mutation({
  args: {
    workspaceId: v.id("workspaces"),
    featureSlugs: v.array(v.string()),
  },
  handler: async (ctx, args) => {
    try {
      const { membership } = await requirePermission(ctx, args.workspaceId, PERMS.MANAGE_MENUS)
      const workspace = await ctx.db.get(args.workspaceId)
      if (!workspace) {
        return { success: false, error: "Workspace not found" }
      }

      const installed = await installManifestItemsForWorkspace(ctx, {
        workspace,
        actorUserId: membership?.userId as Id<"users">,
        selectedSlugs: args.featureSlugs,
      })

      return { success: true, installed }
    } catch (error) {
      console.error("Failed to install feature menus:", error)
      return { success: false, error: String(error) }
    }
  },
})

// Uninstall feature menus for a workspace (mobile Discover tab + settings)
export const uninstallFeatureMenus = mutation({
  args: {
    workspaceId: v.id("workspaces"),
    featureSlugs: v.array(v.string()),
  },
  handler: async (ctx, args) => {
    try {
      const { membership } = await requirePermission(ctx, args.workspaceId, PERMS.MANAGE_MENUS)
      const actorUserId = membership?.userId ?? (await ensureUser(ctx))

      // Get the workspace's default menu set (same pattern as installFeatureMenus)
      const wsAssignment = await ctx.db
        .query("workspaceMenuAssignments")
        .withIndex("by_workspace_default", (q: any) => q.eq("workspaceId", args.workspaceId).eq("isDefault", true))
        .first()
      const menuSetId = wsAssignment?.menuSetId

      await Promise.all(args.featureSlugs.map(async (slug) => {
        // Find by menuSetId (primary)
        const byMenuSet = menuSetId
          ? await ctx.db
              .query("menuItems")
              .withIndex("by_menuSet", (q: any) => q.eq("menuSetId", menuSetId))
              .filter((q: any) => q.eq(q.field("slug"), slug))
              .take(1000)
          : []

        // Also check workspace-scoped items (back-compat)
        const byWorkspace = await ctx.db
          .query("menuItems")
          .withIndex("by_workspace", (q: any) => q.eq("workspaceId", args.workspaceId))
          .filter((q: any) => q.eq(q.field("slug"), slug))
          .take(1000)

        // Dedupe by _id and delete
        const seen = new Set<string>()
        await Promise.all([...byMenuSet, ...byWorkspace].map(async (item) => {
          if (seen.has(item._id)) return
          seen.add(item._id)
          await ctx.db.delete(item._id)
          await logAuditEvent(ctx, {
            action: "menus.feature.uninstalled",
            workspaceId: args.workspaceId,
            actorUserId,
            resourceType: "menu_item",
            resourceId: item._id,
            changes: { slug },
          })
        }))
      }))

      return { success: true, uninstalled: args.featureSlugs.length }
    } catch (error) {
      console.error("Failed to uninstall feature menus:", error)
      return { success: false, error: String(error) }
    }
  },
})

/**
 * Repair orphaned menu items that are missing menuSetId or have wrong menuSetId.
 * Uses the same index as getWorkspaceMenuItems to ensure consistency.
 */
export const repairOrphanedMenuItems = mutation({
  args: {},
  handler: async (ctx) => {
    // @dod:skip-perf reason="one-off repair migration; cross-workspace full scan is the entire purpose"
    const allItems = await ctx.db.query("menuItems").take(1000)

    const results = await Promise.all(
      allItems.map(async (item) => {
        if (!item.workspaceId) return "skipped" as const

        // Use the SAME index query as getWorkspaceMenuItems
        const wsAssignment = await ctx.db
          .query("workspaceMenuAssignments")
          .withIndex("by_workspace_default", (q: any) => q.eq("workspaceId", item.workspaceId).eq("isDefault", true))
          .first()

        if (!wsAssignment) return "skipped" as const

        const correctMenuSetId = wsAssignment.menuSetId

        // Fix if missing or mismatched
        if (!item.menuSetId || item.menuSetId !== correctMenuSetId) {
          await ctx.db.patch(item._id, { menuSetId: correctMenuSetId })
          return "repaired" as const
        }
        return "ok" as const
      })
    )

    const repaired = results.filter((r) => r === "repaired").length
    const skipped = results.filter((r) => r === "skipped").length

    return {
      totalItems: allItems.length,
      repaired,
      skipped,
      message: `Repaired ${repaired} menu items, skipped ${skipped} without workspace assignment`
    }
  },
})
