"use client"

import { createFeatureSettingsHook } from "@/frontend/shared/settings/hooks/useSettingsStorage"

/**
 * Knowledge Settings Schema
 */
export interface KnowledgeSettingsSchema {
    // General
    defaultSort: "recent" | "alphabetical" | "popular" | "updated"
    showPreviews: boolean
    previewLength: "short" | "medium" | "long"

    // Editor
    fontSize: "small" | "medium" | "large"
    lineHeight: "compact" | "normal" | "relaxed"
    spellCheck: boolean
    autoSave: boolean
    autoSaveInterval: 10 | 30 | 60 // seconds

    // Organization
    autoTagging: boolean
    showRelatedArticles: boolean
    maxRelatedArticles: 3 | 5 | 10
    enableCategories: boolean

    // Search
    searchInContent: boolean
    highlightMatches: boolean
    showSearchHistory: boolean
}

export const DEFAULT_KNOWLEDGE_SETTINGS: KnowledgeSettingsSchema = {
    // General
    defaultSort: "recent",
    showPreviews: true,
    previewLength: "medium",

    // Editor
    fontSize: "medium",
    lineHeight: "normal",
    spellCheck: true,
    autoSave: true,
    autoSaveInterval: 30,

    // Organization
    autoTagging: true,
    showRelatedArticles: true,
    maxRelatedArticles: 5,
    enableCategories: true,

    // Search
    searchInContent: true,
    highlightMatches: true,
    showSearchHistory: true,
}

export const useKnowledgeSettingsStorage = createFeatureSettingsHook<KnowledgeSettingsSchema>(
    "knowledge",
    DEFAULT_KNOWLEDGE_SETTINGS
)
