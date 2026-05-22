/**
 * Adapter — convert workspaceShell_menuItems row to legacy menuItems shape.
 *
 * Existing sidebar/breadcrumb code consumes the legacy shape (fields: name,
 * slug, type, path, component, visibleForRoleIds, etc). Until P5 wiring is
 * fully verified, dual-read paths use this adapter so the downstream consumer
 * sees a unified shape regardless of source.
 *
 * Field map:
 *   label              → name
 *   route              → path
 *   featureSlug        → slug (fallback metadata.legacySlug)
 *   metadata.legacyType→ type (fallback route ? "route" : "folder")
 *   metadata.legacyComponent → component
 *   metadata.legacyVisibleForRoleIds → visibleForRoleIds
 *   (passthrough: _id, icon, order, isVisible, parentId, menuSetId,
 *    workspaceId, metadata)
 */
import type { Doc } from "@/convex/_generated/dataModel"

export type LegacyMenuItemShape = {
  _id: string
  workspaceId?: string
  menuSetId?: string
  parentId?: string | null
  name: string
  slug: string
  type: string
  icon?: string
  path?: string
  component?: string
  order: number
  isVisible: boolean
  visibleForRoleIds: string[]
  metadata?: Record<string, any>
}

export function toLegacyMenuItem(
  it: Doc<"workspaceShell_menuItems">,
): LegacyMenuItemShape {
  const meta = (it.metadata ?? {}) as Record<string, any>
  return {
    _id: String(it._id),
    workspaceId: it.workspaceId ? String(it.workspaceId) : undefined,
    menuSetId: it.menuSetId ? String(it.menuSetId) : undefined,
    parentId: it.parentId ? String(it.parentId) : null,
    name: it.label,
    slug: (it.featureSlug ?? meta.legacySlug ?? it.label) as string,
    type: (meta.legacyType ?? (it.route ? "route" : "folder")) as string,
    icon: it.icon,
    path: it.route,
    component: meta.legacyComponent as string | undefined,
    order: it.order,
    isVisible: it.isVisible !== false,
    visibleForRoleIds: (meta.legacyVisibleForRoleIds ?? []) as string[],
    metadata: meta,
  }
}

export function toLegacyMenuItems(
  items: ReadonlyArray<Doc<"workspaceShell_menuItems">>,
): LegacyMenuItemShape[] {
  return items.map(toLegacyMenuItem)
}
