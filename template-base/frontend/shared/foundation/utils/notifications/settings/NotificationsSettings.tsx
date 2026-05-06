"use client"

/**
 * Notifications Feature Settings
 * All settings with persistence using useNotificationsSettingsStorage
 */

import { SettingsSection } from "@/frontend/shared/settings/primitives/SettingsSection"
import { SettingsToggle } from "@/frontend/shared/settings/primitives/SettingsToggle"
import { SettingsSelect } from "@/frontend/shared/settings/primitives/SettingsSelect"
import { SettingsSlider } from "@/frontend/shared/settings/primitives/SettingsSlider"
import { useNotificationsSettingsStorage } from "./useNotificationsSettings"

/**
 * Notifications General Settings
 * Core notification preferences
 */
export function NotificationsGeneralSettings() {
  const { settings, updateSetting, isLoading } = useNotificationsSettingsStorage()

  if (isLoading) {
    return <div className="animate-pulse h-48 bg-muted rounded-lg" />
  }

  return (
    <div className="space-y-6">
      <SettingsSection
        title="Notification Channels"
        description="Configure how you receive notifications"
      >
        <SettingsToggle
          label="Enable Notifications"
          description="Receive notifications from the app"
          checked={settings.enabled}
          onCheckedChange={(checked) => updateSetting("enabled", checked)}
        />

        <SettingsToggle
          label="Sound Notifications"
          description="Play sounds for notifications"
          checked={settings.sound}
          onCheckedChange={(checked) => updateSetting("sound", checked)}
          disabled={!settings.enabled}
        />

        <SettingsSlider
          label="Sound Volume"
          description="Notification sound volume level"
          value={[settings.soundVolume * 100]}
          onValueChange={(value) => updateSetting("soundVolume", value[0] / 100)}
          max={100}
          step={10}
          showValue
          disabled={!settings.enabled || !settings.sound}
        />

        <SettingsToggle
          label="Desktop Notifications"
          description="Show desktop push notifications"
          checked={settings.desktop}
          onCheckedChange={(checked) => updateSetting("desktop", checked)}
          disabled={!settings.enabled}
        />

        <SettingsToggle
          label="Email Notifications"
          description="Receive notifications via email"
          checked={settings.email}
          onCheckedChange={(checked) => updateSetting("email", checked)}
          disabled={!settings.enabled}
        />

        <SettingsToggle
          label="Badge Count"
          description="Show unread count badge on app icon"
          checked={settings.badge}
          onCheckedChange={(checked) => updateSetting("badge", checked)}
          disabled={!settings.enabled}
        />
      </SettingsSection>
    </div>
  )
}

/**
 * Notifications Quiet Hours Settings
 * Do Not Disturb configuration
 */
export function NotificationsQuietHoursSettings() {
  const { settings, updateSetting, isLoading } = useNotificationsSettingsStorage()

  if (isLoading) {
    return <div className="animate-pulse h-48 bg-muted rounded-lg" />
  }

  return (
    <div className="space-y-6">
      <SettingsSection
        title="Quiet Hours"
        description="Set times when notifications are silenced"
      >
        <SettingsToggle
          label="Enable Quiet Hours"
          description="Silence notifications during specified times"
          checked={settings.quietHoursEnabled}
          onCheckedChange={(checked) => updateSetting("quietHoursEnabled", checked)}
        />

        <SettingsSelect
          label="Start Time"
          description="When quiet hours begin"
          value={settings.quietStartTime}
          onValueChange={(value) => updateSetting("quietStartTime", value as typeof settings.quietStartTime)}
          options={[
            { value: "20:00", label: "8:00 PM" },
            { value: "21:00", label: "9:00 PM" },
            { value: "22:00", label: "10:00 PM" },
            { value: "23:00", label: "11:00 PM" },
            { value: "00:00", label: "12:00 AM" },
          ]}
          disabled={!settings.quietHoursEnabled}
        />

        <SettingsSelect
          label="End Time"
          description="When quiet hours end"
          value={settings.quietEndTime}
          onValueChange={(value) => updateSetting("quietEndTime", value as typeof settings.quietEndTime)}
          options={[
            { value: "05:00", label: "5:00 AM" },
            { value: "06:00", label: "6:00 AM" },
            { value: "07:00", label: "7:00 AM" },
            { value: "08:00", label: "8:00 AM" },
            { value: "09:00", label: "9:00 AM" },
          ]}
          disabled={!settings.quietHoursEnabled}
        />

        <SettingsToggle
          label="Allow Urgent"
          description="Allow urgent notifications during quiet hours"
          checked={settings.allowUrgent}
          onCheckedChange={(checked) => updateSetting("allowUrgent", checked)}
          disabled={!settings.quietHoursEnabled}
        />

        <SettingsToggle
          label="Weekends Only"
          description="Only enable quiet hours on weekends"
          checked={settings.weekendsOnly}
          onCheckedChange={(checked) => updateSetting("weekendsOnly", checked)}
          disabled={!settings.quietHoursEnabled}
        />
      </SettingsSection>
    </div>
  )
}

/**
 * Notifications Filter Settings
 * Control which notifications you see
 */
export function NotificationsFilterSettings() {
  const { settings, updateSetting, isLoading } = useNotificationsSettingsStorage()

  if (isLoading) {
    return <div className="animate-pulse h-48 bg-muted rounded-lg" />
  }

  return (
    <div className="space-y-6">
      <SettingsSection
        title="Priority Filtering"
        description="Filter notifications by importance"
      >
        <SettingsSelect
          label="Priority Filter"
          description="Only show notifications at or above priority"
          value={settings.priorityFilter}
          onValueChange={(value) => updateSetting("priorityFilter", value as typeof settings.priorityFilter)}
          options={[
            { value: "all", label: "All priorities" },
            { value: "medium-high", label: "Medium & High only" },
            { value: "high", label: "High priority only" },
          ]}
        />

        <SettingsToggle
          label="Mentions Only"
          description="Only notify when you're mentioned"
          checked={settings.mentionsOnly}
          onCheckedChange={(checked) => updateSetting("mentionsOnly", checked)}
        />
      </SettingsSection>

      <SettingsSection
        title="Grouping"
        description="How notifications are grouped"
      >
        <SettingsToggle
          label="Group Notifications"
          description="Combine similar notifications together"
          checked={settings.groupNotifications}
          onCheckedChange={(checked) => updateSetting("groupNotifications", checked)}
        />

        <SettingsSelect
          label="Group Delay"
          description="Wait time before grouping notifications"
          value={settings.groupDelay}
          onValueChange={(value) => updateSetting("groupDelay", value as typeof settings.groupDelay)}
          options={[
            { value: "instant", label: "Instant" },
            { value: "1min", label: "1 minute" },
            { value: "5min", label: "5 minutes" },
            { value: "15min", label: "15 minutes" },
          ]}
          disabled={!settings.groupNotifications}
        />
      </SettingsSection>
    </div>
  )
}

/**
 * Notifications Per-Feature Settings
 * Enable/disable notifications by feature
 */
export function NotificationsFeatureSettings() {
  const { settings, updateSetting, isLoading } = useNotificationsSettingsStorage()

  if (isLoading) {
    return <div className="animate-pulse h-48 bg-muted rounded-lg" />
  }

  return (
    <div className="space-y-6">
      <SettingsSection
        title="Feature Notifications"
        description="Enable or disable notifications by feature"
      >
        <SettingsToggle
          label="Chat Notifications"
          description="Notifications for messages and conversations"
          checked={settings.chatNotifications}
          onCheckedChange={(checked) => updateSetting("chatNotifications", checked)}
        />

        <SettingsToggle
          label="Task Notifications"
          description="Notifications for task updates and assignments"
          checked={settings.taskNotifications}
          onCheckedChange={(checked) => updateSetting("taskNotifications", checked)}
        />

        <SettingsToggle
          label="Project Notifications"
          description="Notifications for project updates and changes"
          checked={settings.projectNotifications}
          onCheckedChange={(checked) => updateSetting("projectNotifications", checked)}
        />

        <SettingsToggle
          label="Calendar Notifications"
          description="Notifications for events and reminders"
          checked={settings.calendarNotifications}
          onCheckedChange={(checked) => updateSetting("calendarNotifications", checked)}
        />

        <SettingsToggle
          label="Document Notifications"
          description="Notifications for document updates and shares"
          checked={settings.documentNotifications}
          onCheckedChange={(checked) => updateSetting("documentNotifications", checked)}
        />

        <SettingsToggle
          label="System Notifications"
          description="System updates and security alerts"
          checked={settings.systemNotifications}
          onCheckedChange={(checked) => updateSetting("systemNotifications", checked)}
        />
      </SettingsSection>
    </div>
  )
}
