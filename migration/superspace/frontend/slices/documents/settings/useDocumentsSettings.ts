"use client"

import { createFeatureSettingsHook } from "@/frontend/shared/settings/hooks/useSettingsStorage"

/**
 * Documents Settings Schema
 */
export interface DocumentsSettingsSchema {
  // Editor
  autoSave: boolean
  autoSaveInterval: 10 | 30 | 60 | 300 // seconds
  showWordCount: boolean
  spellCheck: boolean
  defaultFont: "system" | "serif" | "sans" | "mono"
  fontSize: "small" | "medium" | "large"
  lineSpacing: "compact" | "normal" | "relaxed"
  
  // Sharing
  defaultVisibility: "private" | "team" | "workspace"
  allowComments: boolean
  allowDownload: boolean
  requireApproval: boolean
  
  // Collaboration
  showCollaboratorCursors: boolean
  showCollaboratorNames: boolean
  changeTracking: boolean
  
  // Version Control
  autoVersioning: boolean
  maxVersions: number
  
  // Export
  defaultExportFormat: "pdf" | "docx" | "md" | "html"
  includeMetadata: boolean
}

export const DEFAULT_DOCUMENTS_SETTINGS: DocumentsSettingsSchema = {
  // Editor
  autoSave: true,
  autoSaveInterval: 30,
  showWordCount: true,
  spellCheck: true,
  defaultFont: "system",
  fontSize: "medium",
  lineSpacing: "normal",
  
  // Sharing
  defaultVisibility: "private",
  allowComments: true,
  allowDownload: true,
  requireApproval: false,
  
  // Collaboration
  showCollaboratorCursors: true,
  showCollaboratorNames: true,
  changeTracking: false,
  
  // Version Control
  autoVersioning: true,
  maxVersions: 50,
  
  // Export
  defaultExportFormat: "pdf",
  includeMetadata: false,
}

export const useDocumentsSettingsStorage = createFeatureSettingsHook<DocumentsSettingsSchema>(
  "documents",
  DEFAULT_DOCUMENTS_SETTINGS
)
