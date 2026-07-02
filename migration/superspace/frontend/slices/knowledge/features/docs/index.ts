/**
 * Knowledge > Docs Sub-Feature
 * 
 * This sub-feature wraps and re-exports the documents feature functionality
 * within the knowledge base context. All document functionality is reused
 * from the original documents feature to follow DRY principles.
 * 
 * The documents feature will be deprecated and removed in favor of this
 * sub-feature under the knowledge umbrella.
 */

// Re-export all from the shared documents engine
export * from "@/frontend/shared/documents";

// Re-export components
export {
  CreateDocumentDialog,
  DocumentsListView,
  DocumentDetailView,
  DocumentEditorOnly,
  DocumentsView,
  DocumentsBreadcrumbs,
  DocumentsTree,
  DocumentPresenceIndicator,
} from "@/frontend/shared/documents";

// Re-export settings
export {
  DocumentsEditorSettings,
  DocumentsSharingSettings,
  DocumentsCollaborationSettings,
  DocumentsExportSettings,
  DocumentsGeneralSettings,
  useDocumentsSettingsStorage,
} from "@/frontend/slices/documents";
