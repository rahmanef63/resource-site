/**
 * Slice barrel — re-exports the canonical Documents components from the
 * shared module so feature-preview / inspectors can import via the
 * sibling-slice path (`../components`) per the preview validator contract.
 */

export {
  DocumentsView,
  DocumentDetailView,
  DocumentsListView,
  DocumentsTree,
  DocumentsBreadcrumbs,
} from "@/frontend/shared/documents"

export type { DocumentRecord, DocumentsViewProps } from "@/frontend/shared/documents"
