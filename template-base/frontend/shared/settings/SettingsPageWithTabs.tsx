"use client"

/**
 * Settings Page with Tabs
 *
 * Main settings page with three tabs:
 * - Personal: User account and preferences
 * - Features: Settings from installed features (dynamic)
 * - Workspace: Workspace-level settings
 */

import { useMemo, useState } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Settings,
  User,
  Video,
  Bell,
  Palette,
  HardDrive,
  Keyboard,
  HelpCircle,
  Puzzle,
  Building2,
} from "lucide-react"
import { SettingsRegistryProvider } from "./SettingsProvider"
import { DynamicSettingsView } from "./components/DynamicSettingsView"
import { FeatureSettingsSync } from "./components/FeatureSettingsSync"
import type { SettingsCategory } from "./types"
import {
  GeneralSettings,
  AccountSettings,
  VideoVoiceSettings,
  NotificationSettings,
  PersonalizationSettings,
  StorageSettings,
  ShortcutsSettings,
  HelpSettings,
} from "./personal"
import type { Id } from "@convex/_generated/dataModel"

export interface SettingsPageWithTabsProps {
  workspaceId?: Id<"workspaces"> | null
  defaultTab?: "personal" | "features" | "workspace"
  defaultCategory?: string
}

/**
 * Personal Settings Tab Content
 */
function PersonalSettingsContent({ defaultCategory }: { defaultCategory?: string }) {
  const personalSettings: SettingsCategory[] = useMemo(
    () => [
      {
        id: "general",
        label: "General",
        icon: Settings,
        order: 0,
        component: GeneralSettings,
      },
      {
        id: "account",
        label: "Account",
        icon: User,
        order: 10,
        component: AccountSettings,
      },
      {
        id: "video-voice",
        label: "Video & Voice",
        icon: Video,
        order: 30,
        component: VideoVoiceSettings,
      },
      {
        id: "notifications",
        label: "Notifications",
        icon: Bell,
        order: 40,
        component: NotificationSettings,
      },
      {
        id: "personalization",
        label: "Personalization",
        icon: Palette,
        order: 50,
        component: PersonalizationSettings,
      },
      {
        id: "storage",
        label: "Storage and data",
        icon: HardDrive,
        order: 60,
        component: StorageSettings,
      },
      {
        id: "shortcuts",
        label: "Keyboard shortcuts",
        icon: Keyboard,
        order: 70,
        component: ShortcutsSettings,
      },
      {
        id: "help",
        label: "Help",
        icon: HelpCircle,
        order: 80,
        component: HelpSettings,
      },
    ],
    []
  )

  return (
    <SettingsRegistryProvider
      coreSettings={personalSettings}
      defaultCategory={defaultCategory || "general"}
    >
      <DynamicSettingsView
        title=""
        groupByFeature={false}
        defaultCategory={defaultCategory || "general"}
        className="border-0"
      />
    </SettingsRegistryProvider>
  )
}

/**
 * Features Settings Tab Content
 * Shows settings from all installed features dynamically
 */
function FeaturesSettingsContent({
  workspaceId,
  defaultCategory,
}: {
  workspaceId?: Id<"workspaces"> | null
  defaultCategory?: string
}) {
  if (!workspaceId) {
    return (
      <div className="flex items-center justify-center h-64 text-muted-foreground">
        <p>Please select a workspace to view feature settings</p>
      </div>
    )
  }

  return (
    <SettingsRegistryProvider defaultCategory={defaultCategory}>
      <FeatureSettingsSync workspaceId={workspaceId} />
      <DynamicSettingsView />
    </SettingsRegistryProvider>
  )
}

/**
 * Workspace Settings Tab Content
 */
function WorkspaceSettingsContent({
  workspaceId,
  defaultCategory,
}: {
  workspaceId?: Id<"workspaces"> | null
  defaultCategory?: string
}) {
  // Lazy import to avoid circular deps
  const { WorkspaceSettingsContent } = require("./workspace/WorkspaceSettingsContent")

  if (!workspaceId) {
    return (
      <div className="flex items-center justify-center h-64 text-muted-foreground">
        <p>Please select a workspace to view workspace settings</p>
      </div>
    )
  }

  return <WorkspaceSettingsContent workspaceId={workspaceId} activeCategory={defaultCategory || "general"} />
}

export function SettingsPageWithTabs({
  workspaceId,
  defaultTab = "personal",
  defaultCategory,
}: SettingsPageWithTabsProps) {
  const [activeTab, setActiveTab] = useState(defaultTab)

  return (
    <div className="flex flex-col h-full bg-background">
      {/* Header */}
      <div className="border-b bg-background px-6 py-4">
        <h1 className="text-2xl font-bold">Settings</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Manage your account, features, and workspace settings
        </p>
      </div>

      {/* Tabs */}
      <Tabs
        value={activeTab}
        onValueChange={(v) => setActiveTab(v as typeof activeTab)}
        className="flex-1 flex flex-col min-h-0"
      >
        <div className="border-b px-4 sm:px-6 overflow-x-auto no-scrollbar">
          <TabsList className="h-12 bg-transparent p-0 gap-4 w-full sm:w-auto justify-evenly">
            <TabsTrigger
              value="personal"
              className="data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:bg-transparent rounded-none px-4 py-3"
            >
              <User className="h-4 w-4 mr-2" />
              Personal
            </TabsTrigger>
            <TabsTrigger
              value="features"
              className="data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:bg-transparent rounded-none px-4 py-3"
            >
              <Puzzle className="h-4 w-4 mr-2" />
              Features
            </TabsTrigger>
            <TabsTrigger
              value="workspace"
              className="data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:bg-transparent rounded-none px-4 py-3"
            >
              <Building2 className="h-4 w-4 mr-2" />
              Workspace
            </TabsTrigger>
          </TabsList>
        </div>

        <div className="flex-1 min-h-0 overflow-auto">
          <TabsContent value="personal" className="h-full m-0">
            <PersonalSettingsContent defaultCategory={defaultCategory} />
          </TabsContent>

          <TabsContent value="features" className="h-full m-0">
            <FeaturesSettingsContent
              workspaceId={workspaceId}
              defaultCategory={defaultCategory}
            />
          </TabsContent>

          <TabsContent value="workspace" className="h-full m-0">
            <WorkspaceSettingsContent
              workspaceId={workspaceId}
              defaultCategory={defaultCategory}
            />
          </TabsContent>
        </div>
      </Tabs>
    </div>
  )
}
