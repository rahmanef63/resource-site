"use client"

/**
 * User Settings View
 *
 * Unified settings view for user-level settings using the dynamic registry system.
 * Now DRY and consistent with WorkspaceSettings.
 */

import { useMemo } from "react"
import {
  Settings,
  User,
  Video,
  Bell,
  Palette,
  HardDrive,
  Keyboard,
  HelpCircle,
} from "lucide-react"
import { SettingsRegistryProvider } from "./SettingsProvider"
import { DynamicSettingsView } from "./components/DynamicSettingsView"
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

/**
 * User-level settings (account, preferences, etc.)
 * These are always available regardless of workspace
 */
export interface SettingsViewProps {
  defaultCategory?: string
}

export function SettingsView({ defaultCategory = "general" }: SettingsViewProps = {}) {
  const userSettings: SettingsCategory[] = useMemo(
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
      coreSettings={userSettings}
      defaultCategory={defaultCategory}
    >
      <DynamicSettingsView />
    </SettingsRegistryProvider>
  )
}
