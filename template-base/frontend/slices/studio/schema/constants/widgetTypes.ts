/**
 * widgetTypes — re-exports the canonical widget type list from StudioUISchema.ts.
 *
 * SINGLE SOURCE OF TRUTH: frontend/slices/studio/ui/types/StudioUISchema.ts
 * Do NOT duplicate the list here. Always import from there.
 */
export {
  WIDGET_REGISTRY,
  KNOWN_WIDGET_TYPES,
  DEPRECATED_WIDGET_TYPES,
  ACTIVE_WIDGET_TYPES,
  NODE_ID_REGEX,
  NODE_ID_MAX_LENGTH,
  UI_SCHEMA_VERSIONS,
  CURRENT_UI_SCHEMA_VERSION,
  LEGACY_UI_SCHEMA_VERSION,
} from "@/frontend/slices/studio/ui/types/StudioUISchema";

export type {
  WidgetType,
  StudioUISchema,
  SchemaNode,
  UIDocumentMetadata,
  UISchemaVersion,
} from "@/frontend/slices/studio/ui/types/StudioUISchema";
