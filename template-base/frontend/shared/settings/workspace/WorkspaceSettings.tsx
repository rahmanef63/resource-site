"use client"

import { useMemo } from "react"
import { useSearchParams } from "next/navigation"
import {
  AlertTriangle,
  BarChart3,
  BookOpen,
  Calendar,
  ClipboardList,
  FileText,
  MessageSquare,
  Settings2,
  Bot,
  Camera,
  Download,
} from "lucide-react"
import type { Id } from "@convex/_generated/dataModel"
import {
  DynamicSettingsView,
  FeatureSettingsSync,
  FEATURE_SETTINGS_DEFAULT_CATEGORY,
  buildPlaceholderCategory,
  getFeatureDefaultCategory,
} from "../components"
import type { FeatureSettingsSyncProps } from "../components"
import { SettingsRegistryProvider } from "../SettingsProvider"
import type { SettingsCategory } from "../types"
import { GeneralSettings } from "./GeneralSettings"
import { DangerZoneSettings } from "./DangerZoneSettings"
import { ImportMigrationSettings } from "./ImportMigrationSettings"

type StaticFeatureBuilders = NonNullable<FeatureSettingsSyncProps["staticBuilders"]>

const LEGACY_FEATURE_BUILDERS: StaticFeatureBuilders = {
  chats: ({ menuItem }) => [
    buildPlaceholderCategory(
      FEATURE_SETTINGS_DEFAULT_CATEGORY.chats,
      MessageSquare,
      90,
      menuItem.name || "Chats",
      "Manage chat behaviors, message retention, and inbox defaults."
    ),
  ],
  // NOTE: chat and calls settings now register dynamically via featureSettingsRegistry
  ai: ({ menuItem }) => [
    buildPlaceholderCategory(
      FEATURE_SETTINGS_DEFAULT_CATEGORY.ai,
      Bot,
      150,
      menuItem.name || "AI",
      "Configure AI assistants, smart replies, and automation settings."
    ),
  ],
  status: ({ menuItem }) => [
    buildPlaceholderCategory(
      FEATURE_SETTINGS_DEFAULT_CATEGORY.status,
      Camera,
      220,
      menuItem.name || "Status",
      "Control who can view and interact with status updates."
    ),
  ],
  documents: ({ menuItem }) => [
    buildPlaceholderCategory(
      FEATURE_SETTINGS_DEFAULT_CATEGORY.documents,
      FileText,
      300,
      menuItem.name || "Documents",
      "Set up templates, permissions, and editing defaults."
    ),
  ],
  reports: ({ menuItem }) => [
    buildPlaceholderCategory(
      FEATURE_SETTINGS_DEFAULT_CATEGORY.reports,
      BarChart3,
      400,
      menuItem.name || "Reports",
      "Configure data sources, refresh schedules, and visibility."
    ),
  ],
  calendar: ({ menuItem }) => [
    buildPlaceholderCategory(
      FEATURE_SETTINGS_DEFAULT_CATEGORY.calendar,
      Calendar,
      420,
      menuItem.name || "Calendar",
      "Manage calendars, default views, and event syncing."
    ),
  ],
  tasks: ({ menuItem }) => [
    buildPlaceholderCategory(
      FEATURE_SETTINGS_DEFAULT_CATEGORY.tasks,
      ClipboardList,
      500,
      menuItem.name || "Tasks",
      "Customize task states, notifications, and automations."
    ),
  ],
  wiki: ({ menuItem }) => [
    buildPlaceholderCategory(
      FEATURE_SETTINGS_DEFAULT_CATEGORY.wiki,
      BookOpen,
      600,
      menuItem.name || "Wiki",
      "Manage knowledge base structure and contributor permissions."
    ),
  ],
}

export function getWorkspaceFeatureDefaultCategory(slug: string): string | undefined {
  return getFeatureDefaultCategory(slug)
}

export interface WorkspaceSettingsProps {
  workspaceId: Id<"workspaces">
}

export function WorkspaceSettings({ workspaceId }: WorkspaceSettingsProps) {
  const searchParams = useSearchParams()
  const requestedCategory = searchParams.get("category") ?? undefined

  const resolvedDefaultCategory = useMemo(() => {
    if (!requestedCategory) {
      return "general"
    }

    return getFeatureDefaultCategory(requestedCategory) ?? requestedCategory
  }, [requestedCategory])

  const coreCategories: SettingsCategory[] = useMemo(
    () => [
      {
        id: "general",
        label: "General",
        icon: Settings2,
        order: 0,
        component: () => <GeneralSettings workspaceId={workspaceId} />,
      },
      {
        id: "import",
        label: "Import",
        icon: Download,
        order: 20,
        component: () => <ImportMigrationSettings workspaceId={workspaceId} />,
      },
      {
        id: "danger-zone",
        label: "Danger Zone",
        icon: AlertTriangle,
        order: 1000,
        component: () => <DangerZoneSettings workspaceId={workspaceId} />,
      },
    ],
    [workspaceId]
  )

  return (
    <SettingsRegistryProvider
      coreSettings={coreCategories}
      defaultCategory={resolvedDefaultCategory}
    >
      <FeatureSettingsSync
        workspaceId={workspaceId}
        staticBuilders={LEGACY_FEATURE_BUILDERS}
      />
      <DynamicSettingsView />
    </SettingsRegistryProvider>
  )
}
