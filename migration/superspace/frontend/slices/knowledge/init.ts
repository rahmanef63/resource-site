/**
 * Knowledge Feature Initialization
 * Registers knowledge settings with the shared settings registry
 */

import { registerFeatureSettings } from "@/frontend/shared/settings"
import { BookOpen, Edit3, FolderTree, Search } from "lucide-react"
import {
    KnowledgeGeneralSettings,
    KnowledgeEditorSettings,
    KnowledgeOrganizationSettings,
    KnowledgeSearchSettings,
} from "./settings"
import { registerKnowledgeAgent } from "./agent"

registerFeatureSettings("knowledge", () => [
    {
        id: "knowledge-general",
        label: "General",
        icon: BookOpen,
        order: 100,
        component: KnowledgeGeneralSettings,
    },
    {
        id: "knowledge-editor",
        label: "Editor",
        icon: Edit3,
        order: 110,
        component: KnowledgeEditorSettings,
    },
    {
        id: "knowledge-organization",
        label: "Organization",
        icon: FolderTree,
        order: 120,
        component: KnowledgeOrganizationSettings,
    },
    {
        id: "knowledge-search",
        label: "Search",
        icon: Search,
        order: 130,
        component: KnowledgeSearchSettings,
    },
])

registerKnowledgeAgent()
