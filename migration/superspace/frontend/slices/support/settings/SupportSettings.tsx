"use client"

/**
 * Support Feature Settings
 * All settings with persistence using useSupportSettingsStorage
 */

import { SettingsSection } from "@/frontend/shared/settings/primitives/SettingsSection"
import { SettingsToggle } from "@/frontend/shared/settings/primitives/SettingsToggle"
import { SettingsSelect } from "@/frontend/shared/settings/primitives/SettingsSelect"
import { useSupportSettingsStorage } from "./useSupportSettings"

/**
 * Support Ticket Settings
 * Core ticket configuration
 */
export function SupportTicketSettings() {
  const { settings, updateSetting, isLoading } = useSupportSettingsStorage()

  if (isLoading) {
    return <div className="animate-pulse h-48 bg-muted rounded-lg" />
  }

  return (
    <div className="space-y-6">
      <SettingsSection
        title="Ticket Management"
        description="Configure support ticket settings"
      >
        <SettingsToggle
          label="Enable Tickets"
          description="Allow users to create support tickets"
          checked={settings.enableTickets}
          onCheckedChange={(checked) => updateSetting("enableTickets", checked)}
        />

        <SettingsToggle
          label="Auto-Assign Tickets"
          description="Automatically assign tickets to agents"
          checked={settings.autoAssign}
          onCheckedChange={(checked) => updateSetting("autoAssign", checked)}
        />

        <SettingsSelect
          label="Default Priority"
          description="Default priority for new tickets"
          value={settings.defaultPriority}
          onValueChange={(value) => updateSetting("defaultPriority", value as typeof settings.defaultPriority)}
          options={[
            { value: "low", label: "Low" },
            { value: "medium", label: "Medium" },
            { value: "high", label: "High" },
            { value: "urgent", label: "Urgent" },
          ]}
        />

        <SettingsToggle
          label="Show Resolved Tickets"
          description="Display resolved tickets in the list"
          checked={settings.showResolved}
          onCheckedChange={(checked) => updateSetting("showResolved", checked)}
        />
      </SettingsSection>

      <SettingsSection
        title="Categories"
        description="Ticket categorization settings"
      >
        <SettingsToggle
          label="Enable Categories"
          description="Use ticket categories for organization"
          checked={settings.ticketCategories}
          onCheckedChange={(checked) => updateSetting("ticketCategories", checked)}
        />

        <SettingsToggle
          label="Require Category"
          description="Require a category when creating tickets"
          checked={settings.requireCategory}
          onCheckedChange={(checked) => updateSetting("requireCategory", checked)}
          disabled={!settings.ticketCategories}
        />
      </SettingsSection>
    </div>
  )
}

/**
 * Support Response Settings
 * Response and feedback options
 */
export function SupportResponseSettings() {
  const { settings, updateSetting, isLoading } = useSupportSettingsStorage()

  if (isLoading) {
    return <div className="animate-pulse h-48 bg-muted rounded-lg" />
  }

  return (
    <div className="space-y-6">
      <SettingsSection
        title="Response Templates"
        description="Configure response options"
      >
        <SettingsToggle
          label="Canned Responses"
          description="Enable pre-written response templates"
          checked={settings.enableCannedResponses}
          onCheckedChange={(checked) => updateSetting("enableCannedResponses", checked)}
        />

        <SettingsToggle
          label="AI-Powered Responses"
          description="Use AI to suggest responses"
          checked={settings.enableAIResponses}
          onCheckedChange={(checked) => updateSetting("enableAIResponses", checked)}
        />

        <SettingsToggle
          label="Require Feedback"
          description="Require feedback rating on closed tickets"
          checked={settings.requireFeedback}
          onCheckedChange={(checked) => updateSetting("requireFeedback", checked)}
        />
      </SettingsSection>

      <SettingsSection
        title="Auto-Close"
        description="Automatic ticket closure settings"
      >
        <SettingsToggle
          label="Auto-Close Tickets"
          description="Automatically close inactive tickets"
          checked={settings.autoClose}
          onCheckedChange={(checked) => updateSetting("autoClose", checked)}
        />

        <SettingsSelect
          label="Auto-Close After"
          description="Days of inactivity before auto-close"
          value={settings.autoCloseDays}
          onValueChange={(value) => updateSetting("autoCloseDays", value as typeof settings.autoCloseDays)}
          options={[
            { value: "3", label: "3 days" },
            { value: "7", label: "7 days" },
            { value: "14", label: "14 days" },
            { value: "30", label: "30 days" },
            { value: "never", label: "Never" },
          ]}
          disabled={!settings.autoClose}
        />
      </SettingsSection>
    </div>
  )
}

/**
 * Support SLA Settings
 * Service Level Agreement configuration
 */
export function SupportSLASettings() {
  const { settings, updateSetting, isLoading } = useSupportSettingsStorage()

  if (isLoading) {
    return <div className="animate-pulse h-48 bg-muted rounded-lg" />
  }

  return (
    <div className="space-y-6">
      <SettingsSection
        title="SLA Configuration"
        description="Service Level Agreement settings"
      >
        <SettingsToggle
          label="Enable SLA"
          description="Track response and resolution times"
          checked={settings.enableSLA}
          onCheckedChange={(checked) => updateSetting("enableSLA", checked)}
        />

        <SettingsSelect
          label="Response Time Target"
          description="Target time for initial response"
          value={settings.responseTimeTarget}
          onValueChange={(value) => updateSetting("responseTimeTarget", value as typeof settings.responseTimeTarget)}
          options={[
            { value: "1h", label: "1 hour" },
            { value: "4h", label: "4 hours" },
            { value: "8h", label: "8 hours" },
            { value: "24h", label: "24 hours" },
            { value: "48h", label: "48 hours" },
          ]}
          disabled={!settings.enableSLA}
        />

        <SettingsSelect
          label="Resolution Time Target"
          description="Target time for ticket resolution"
          value={settings.resolutionTimeTarget}
          onValueChange={(value) => updateSetting("resolutionTimeTarget", value as typeof settings.resolutionTimeTarget)}
          options={[
            { value: "24h", label: "24 hours" },
            { value: "48h", label: "48 hours" },
            { value: "72h", label: "72 hours" },
            { value: "1week", label: "1 week" },
          ]}
          disabled={!settings.enableSLA}
        />

        <SettingsToggle
          label="Escalate on Breach"
          description="Escalate tickets that breach SLA targets"
          checked={settings.escalateOnBreach}
          onCheckedChange={(checked) => updateSetting("escalateOnBreach", checked)}
          disabled={!settings.enableSLA}
        />
      </SettingsSection>
    </div>
  )
}

/**
 * Support Notification Settings
 * Support-specific notifications
 */
export function SupportNotificationSettings() {
  const { settings, updateSetting, isLoading } = useSupportSettingsStorage()

  if (isLoading) {
    return <div className="animate-pulse h-48 bg-muted rounded-lg" />
  }

  return (
    <div className="space-y-6">
      <SettingsSection
        title="Ticket Notifications"
        description="When to receive support notifications"
      >
        <SettingsToggle
          label="New Ticket"
          description="Notify when a new ticket is created"
          checked={settings.notifyOnNewTicket}
          onCheckedChange={(checked) => updateSetting("notifyOnNewTicket", checked)}
        />

        <SettingsToggle
          label="Ticket Assignment"
          description="Notify when a ticket is assigned to you"
          checked={settings.notifyOnAssignment}
          onCheckedChange={(checked) => updateSetting("notifyOnAssignment", checked)}
        />

        <SettingsToggle
          label="Ticket Updates"
          description="Notify when tickets are updated"
          checked={settings.notifyOnUpdate}
          onCheckedChange={(checked) => updateSetting("notifyOnUpdate", checked)}
        />

        <SettingsToggle
          label="Ticket Resolution"
          description="Notify when tickets are resolved"
          checked={settings.notifyOnResolution}
          onCheckedChange={(checked) => updateSetting("notifyOnResolution", checked)}
        />

        <SettingsToggle
          label="Daily Digest"
          description="Receive a daily summary of support activity"
          checked={settings.dailyDigest}
          onCheckedChange={(checked) => updateSetting("dailyDigest", checked)}
        />
      </SettingsSection>
    </div>
  )
}
