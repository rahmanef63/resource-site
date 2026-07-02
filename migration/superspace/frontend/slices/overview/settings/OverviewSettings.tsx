"use client"

import { SettingsSection } from "@/frontend/shared/settings/primitives/SettingsSection"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"
import { useOverviewSettingsStorage, type OverviewSettingsSchema } from "./useOverviewSettings"

// ============================================================================
// General Settings
// ============================================================================

export function OverviewGeneralSettings() {
  const { settings, updateSettings } = useOverviewSettingsStorage()

  const handleToggle = (key: keyof OverviewSettingsSchema) => (checked: boolean) => {
    updateSettings({ [key]: checked })
  }

  const handleTimeRangeChange = (value: string) => {
    updateSettings({ defaultTimeRange: value as OverviewSettingsSchema["defaultTimeRange"] })
  }

  return (
    <div className="space-y-6">
      {/* Display Settings */}
      <SettingsSection title="Display" description="How the overview dashboard looks">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <Label htmlFor="notifications" className="flex flex-col gap-1">
              <span>Notifications</span>
              <span className="text-xs text-muted-foreground font-normal">
                Show notifications for workspace activity
              </span>
            </Label>
            <Switch
              id="notifications"
              checked={settings.notificationsEnabled}
              onCheckedChange={handleToggle("notificationsEnabled")}
            />
          </div>

          <div className="flex items-center justify-between">
            <Label htmlFor="auto-refresh" className="flex flex-col gap-1">
              <span>Auto Refresh</span>
              <span className="text-xs text-muted-foreground font-normal">
                Automatically refresh dashboard data
              </span>
            </Label>
            <Switch
              id="auto-refresh"
              checked={settings.autoRefresh}
              onCheckedChange={handleToggle("autoRefresh")}
            />
          </div>

          <div className="flex items-center justify-between">
            <Label htmlFor="time-range" className="flex flex-col gap-1">
              <span>Default Time Range</span>
              <span className="text-xs text-muted-foreground font-normal">
                Default period for statistics
              </span>
            </Label>
            <Select value={settings.defaultTimeRange} onValueChange={handleTimeRangeChange}>
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="today">Today</SelectItem>
                <SelectItem value="7d">7 Days</SelectItem>
                <SelectItem value="30d">30 Days</SelectItem>
                <SelectItem value="90d">90 Days</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </SettingsSection>

      <Separator />

      {/* Widget Settings */}
      <SettingsSection title="Widgets" description="Choose which sections to display">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <Label htmlFor="show-stats" className="flex flex-col gap-1">
              <span>Statistics</span>
              <span className="text-xs text-muted-foreground font-normal">
                Key metrics like members, tasks, documents
              </span>
            </Label>
            <Switch
              id="show-stats"
              checked={settings.showStats}
              onCheckedChange={handleToggle("showStats")}
            />
          </div>

          <div className="flex items-center justify-between">
            <Label htmlFor="show-activity" className="flex flex-col gap-1">
              <span>Recent Activity</span>
              <span className="text-xs text-muted-foreground font-normal">
                Activity feed from workspace
              </span>
            </Label>
            <Switch
              id="show-activity"
              checked={settings.showRecentActivity}
              onCheckedChange={handleToggle("showRecentActivity")}
            />
          </div>

          <div className="flex items-center justify-between">
            <Label htmlFor="show-team" className="flex flex-col gap-1">
              <span>Team Composition</span>
              <span className="text-xs text-muted-foreground font-normal">
                Members grouped by role
              </span>
            </Label>
            <Switch
              id="show-team"
              checked={settings.showTeamComposition}
              onCheckedChange={handleToggle("showTeamComposition")}
            />
          </div>

          <div className="flex items-center justify-between">
            <Label htmlFor="show-recent" className="flex flex-col gap-1">
              <span>Recent Items</span>
              <span className="text-xs text-muted-foreground font-normal">
                Recently accessed documents, tasks, etc.
              </span>
            </Label>
            <Switch
              id="show-recent"
              checked={settings.showRecentItems}
              onCheckedChange={handleToggle("showRecentItems")}
            />
          </div>

          <div className="flex items-center justify-between">
            <Label htmlFor="show-events" className="flex flex-col gap-1">
              <span>Upcoming Events</span>
              <span className="text-xs text-muted-foreground font-normal">
                Calendar events and deadlines
              </span>
            </Label>
            <Switch
              id="show-events"
              checked={settings.showUpcomingEvents}
              onCheckedChange={handleToggle("showUpcomingEvents")}
            />
          </div>

          <div className="flex items-center justify-between">
            <Label htmlFor="show-ai" className="flex flex-col gap-1">
              <span>AI Assistant</span>
              <span className="text-xs text-muted-foreground font-normal">
                Quick chat with AI assistant
              </span>
            </Label>
            <Switch
              id="show-ai"
              checked={settings.showAIChat}
              onCheckedChange={handleToggle("showAIChat")}
            />
          </div>
        </div>
      </SettingsSection>

      <Separator />

      {/* AI Settings */}
      <SettingsSection title="AI Assistant" description="Configure AI behavior">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <Label htmlFor="ai-prompts" className="flex flex-col gap-1">
              <span>Quick Prompts</span>
              <span className="text-xs text-muted-foreground font-normal">
                Show quick prompt buttons in AI chat
              </span>
            </Label>
            <Switch
              id="ai-prompts"
              checked={settings.aiQuickPromptsEnabled}
              onCheckedChange={handleToggle("aiQuickPromptsEnabled")}
            />
          </div>
        </div>
      </SettingsSection>
    </div>
  )
}
