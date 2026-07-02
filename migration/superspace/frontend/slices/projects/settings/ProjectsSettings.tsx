"use client"

/**
 * Projects Feature Settings
 * All settings with persistence using useProjectsSettingsStorage
 */

import { SettingsSection } from "@/frontend/shared/settings/primitives/SettingsSection"
import { SettingsToggle } from "@/frontend/shared/settings/primitives/SettingsToggle"
import { SettingsSelect } from "@/frontend/shared/settings/primitives/SettingsSelect"
import { useProjectsSettingsStorage } from "./useProjectsSettings"

/**
 * Projects Display Settings
 * How projects are shown and organized
 */
export function ProjectsDisplaySettings() {
  const { settings, updateSetting, isLoading } = useProjectsSettingsStorage()

  if (isLoading) {
    return <div className="animate-pulse h-48 bg-muted rounded-lg" />
  }

  return (
    <div className="space-y-6">
      <SettingsSection
        title="Project Display"
        description="Configure how projects are displayed"
      >
        <SettingsSelect
          label="Default View"
          description="How projects are displayed by default"
          value={settings.defaultView}
          onValueChange={(value) => updateSetting("defaultView", value as typeof settings.defaultView)}
          options={[
            { value: "grid", label: "Grid" },
            { value: "list", label: "List" },
            { value: "timeline", label: "Timeline" },
            { value: "kanban", label: "Kanban" },
          ]}
        />

        <SettingsToggle
          label="Show Archived Projects"
          description="Display archived projects in the list"
          checked={settings.showArchived}
          onCheckedChange={(checked) => updateSetting("showArchived", checked)}
        />

        <SettingsToggle
          label="Compact Mode"
          description="Show projects in a more compact layout"
          checked={settings.compactMode}
          onCheckedChange={(checked) => updateSetting("compactMode", checked)}
        />

        <SettingsToggle
          label="Show Progress"
          description="Display progress indicators on project cards"
          checked={settings.showProgress}
          onCheckedChange={(checked) => updateSetting("showProgress", checked)}
        />
      </SettingsSection>

      <SettingsSection
        title="Templates"
        description="Project template settings"
      >
        <SettingsToggle
          label="Enable Templates"
          description="Use project templates when creating new projects"
          checked={settings.enableTemplates}
          onCheckedChange={(checked) => updateSetting("enableTemplates", checked)}
        />

        <SettingsSelect
          label="Auto-Archive After"
          description="Archive completed projects after specified days"
          value={settings.autoArchiveDays}
          onValueChange={(value) => updateSetting("autoArchiveDays", value as typeof settings.autoArchiveDays)}
          options={[
            { value: "30", label: "30 days" },
            { value: "60", label: "60 days" },
            { value: "90", label: "90 days" },
            { value: "180", label: "180 days" },
            { value: "never", label: "Never" },
          ]}
        />
      </SettingsSection>
    </div>
  )
}

/**
 * Projects Collaboration Settings
 * Team access and permissions
 */
export function ProjectsCollaborationSettings() {
  const { settings, updateSetting, isLoading } = useProjectsSettingsStorage()

  if (isLoading) {
    return <div className="animate-pulse h-48 bg-muted rounded-lg" />
  }

  return (
    <div className="space-y-6">
      <SettingsSection
        title="Access Control"
        description="Configure who can access projects"
      >
        <SettingsToggle
          label="Allow Guest Access"
          description="Allow external guests to view projects"
          checked={settings.allowGuestAccess}
          onCheckedChange={(checked) => updateSetting("allowGuestAccess", checked)}
        />

        <SettingsToggle
          label="Require Approval"
          description="Require approval to join projects"
          checked={settings.requireApproval}
          onCheckedChange={(checked) => updateSetting("requireApproval", checked)}
        />

        <SettingsSelect
          label="Default Role"
          description="Default role for new project members"
          value={settings.defaultRole}
          onValueChange={(value) => updateSetting("defaultRole", value as typeof settings.defaultRole)}
          options={[
            { value: "viewer", label: "Viewer" },
            { value: "member", label: "Member" },
            { value: "editor", label: "Editor" },
            { value: "admin", label: "Admin" },
          ]}
        />
      </SettingsSection>

      <SettingsSection
        title="Communication"
        description="Collaboration and notification settings"
      >
        <SettingsToggle
          label="Notify on Join"
          description="Notify project owner when someone joins"
          checked={settings.notifyOnJoin}
          onCheckedChange={(checked) => updateSetting("notifyOnJoin", checked)}
        />

        <SettingsToggle
          label="Allow Comments"
          description="Enable comments on projects and tasks"
          checked={settings.allowComments}
          onCheckedChange={(checked) => updateSetting("allowComments", checked)}
        />

        <SettingsToggle
          label="Enable Mentions"
          description="Allow @mentions to notify team members"
          checked={settings.enableMentions}
          onCheckedChange={(checked) => updateSetting("enableMentions", checked)}
        />
      </SettingsSection>
    </div>
  )
}

/**
 * Projects Timeline Settings
 * Visual timeline and scheduling options
 */
export function ProjectsTimelineSettings() {
  const { settings, updateSetting, isLoading } = useProjectsSettingsStorage()

  if (isLoading) {
    return <div className="animate-pulse h-48 bg-muted rounded-lg" />
  }

  return (
    <div className="space-y-6">
      <SettingsSection
        title="Timeline Display"
        description="Configure timeline view options"
      >
        <SettingsSelect
          label="Default Time Range"
          description="Default time range shown in timeline view"
          value={settings.defaultTimeRange}
          onValueChange={(value) => updateSetting("defaultTimeRange", value as typeof settings.defaultTimeRange)}
          options={[
            { value: "week", label: "Week" },
            { value: "month", label: "Month" },
            { value: "quarter", label: "Quarter" },
            { value: "year", label: "Year" },
          ]}
        />

        <SettingsToggle
          label="Show Milestones"
          description="Display project milestones on timeline"
          checked={settings.showMilestones}
          onCheckedChange={(checked) => updateSetting("showMilestones", checked)}
        />

        <SettingsToggle
          label="Show Deadlines"
          description="Display task deadlines on timeline"
          checked={settings.showDeadlines}
          onCheckedChange={(checked) => updateSetting("showDeadlines", checked)}
        />

        <SettingsToggle
          label="Highlight Overdue"
          description="Highlight overdue items with warning colors"
          checked={settings.highlightOverdue}
          onCheckedChange={(checked) => updateSetting("highlightOverdue", checked)}
        />
      </SettingsSection>
    </div>
  )
}

/**
 * Projects Workflow Settings
 * Status, tags, and workflow automation
 */
export function ProjectsWorkflowSettings() {
  const { settings, updateSetting, isLoading } = useProjectsSettingsStorage()

  if (isLoading) {
    return <div className="animate-pulse h-48 bg-muted rounded-lg" />
  }

  return (
    <div className="space-y-6">
      <SettingsSection
        title="Status & Workflow"
        description="Configure project workflow settings"
      >
        <SettingsToggle
          label="Enable Statuses"
          description="Use project status tracking"
          checked={settings.enableStatuses}
          onCheckedChange={(checked) => updateSetting("enableStatuses", checked)}
        />

        <SettingsSelect
          label="Default Status"
          description="Default status for new projects"
          value={settings.defaultStatus}
          onValueChange={(value) => updateSetting("defaultStatus", value as typeof settings.defaultStatus)}
          options={[
            { value: "planning", label: "Planning" },
            { value: "active", label: "Active" },
            { value: "on-hold", label: "On Hold" },
            { value: "completed", label: "Completed" },
          ]}
        />
      </SettingsSection>

      <SettingsSection
        title="Project Defaults"
        description="Default settings for new projects"
      >
        <SettingsToggle
          label="Enable Tags"
          description="Allow tagging projects for organization"
          checked={settings.enableTags}
          onCheckedChange={(checked) => updateSetting("enableTags", checked)}
        />

        <SettingsToggle
          label="Require Description"
          description="Require a description when creating projects"
          checked={settings.requireDescription}
          onCheckedChange={(checked) => updateSetting("requireDescription", checked)}
        />

        <SettingsToggle
          label="Auto-Assign Creator"
          description="Automatically assign creator as project lead"
          checked={settings.autoAssignCreator}
          onCheckedChange={(checked) => updateSetting("autoAssignCreator", checked)}
        />
      </SettingsSection>
    </div>
  )
}
