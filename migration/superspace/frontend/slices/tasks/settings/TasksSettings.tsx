"use client"

/**
 * Tasks Feature Settings
 */

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { useTasksSettingsStorage } from "./useTasksSettings"
import {
  SettingsSection,
  SettingsToggle,
  SettingsSelect,
  SettingsSlider,
} from "@/frontend/shared/settings/primitives"

export function TasksGeneralSettings() {
  const { settings, updateSetting, resetSettings, isLoaded } = useTasksSettingsStorage()

  if (!isLoaded) {
    return <div className="p-4 text-center text-muted-foreground">Loading...</div>
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Task Management</CardTitle>
              <CardDescription>Configure how tasks are displayed and managed</CardDescription>
            </div>
            <Button variant="ghost" size="sm" onClick={resetSettings}>
              Reset
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <SettingsSelect
            id="default-view"
            label="Default View"
            description="How tasks are displayed by default"
            value={settings.defaultView}
            onValueChange={(v) => updateSetting("defaultView", v as "list" | "board" | "calendar" | "timeline")}
            options={[
              { value: "list", label: "List" },
              { value: "board", label: "Board" },
              { value: "calendar", label: "Calendar" },
              { value: "timeline", label: "Timeline" },
            ]}
          />

          <SettingsToggle
            id="completed"
            label="Show Completed Tasks"
            description="Display completed tasks in the list"
            checked={settings.showCompletedTasks}
            onCheckedChange={(v) => updateSetting("showCompletedTasks", v)}
          />

          <SettingsToggle
            id="subtasks"
            label="Enable Subtasks"
            description="Allow creating subtasks within tasks"
            checked={settings.enableSubtasks}
            onCheckedChange={(v) => updateSetting("enableSubtasks", v)}
          />

          <SettingsToggle
            id="timetracking"
            label="Time Tracking"
            description="Track time spent on tasks"
            checked={settings.enableTimeTracking}
            onCheckedChange={(v) => updateSetting("enableTimeTracking", v)}
          />

          <Separator />

          <SettingsSection title="Display Options" description="Visual preferences">
            <SettingsToggle
              id="task-ids"
              label="Show Task IDs"
              description="Display unique task identifiers"
              checked={settings.showTaskIds}
              onCheckedChange={(v) => updateSetting("showTaskIds", v)}
            />

            <SettingsToggle
              id="compact"
              label="Compact Cards"
              description="Use smaller task cards"
              checked={settings.compactCards}
              onCheckedChange={(v) => updateSetting("compactCards", v)}
            />

            <SettingsSelect
              id="color-by"
              label="Color Tasks By"
              description="Visual grouping of tasks"
              value={settings.colorBy}
              onValueChange={(v) => updateSetting("colorBy", v as "priority" | "status" | "none")}
              options={[
                { value: "priority", label: "Priority" },
                { value: "status", label: "Status" },
                { value: "none", label: "None" },
              ]}
            />
          </SettingsSection>
        </CardContent>
      </Card>
    </div>
  )
}

export function TasksDefaultsSettings() {
  const { settings, updateSetting, isLoaded } = useTasksSettingsStorage()

  if (!isLoaded) {
    return <div className="p-4 text-center text-muted-foreground">Loading...</div>
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Task Defaults</CardTitle>
          <CardDescription>Default values for new tasks</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <SettingsSelect
            id="default-priority"
            label="Default Priority"
            description="Priority for new tasks"
            value={settings.defaultPriority}
            onValueChange={(v) => updateSetting("defaultPriority", v as "low" | "medium" | "high" | "urgent")}
            options={[
              { value: "low", label: "Low" },
              { value: "medium", label: "Medium" },
              { value: "high", label: "High" },
              { value: "urgent", label: "Urgent" },
            ]}
          />

          <SettingsSlider
            id="due-offset"
            label="Default Due Date"
            description="Days from creation for default due date"
            value={settings.defaultDueDateOffset}
            onValueChange={(v: number[]) => updateSetting("defaultDueDateOffset", v[0] as number)}
            min={0}
            max={30}
            step={1}
            valueFormatter={(v) => v === 0 ? "No default" : `${v} days`}
          />

          <SettingsToggle
            id="auto-assign"
            label="Auto-Assign to Creator"
            description="Automatically assign new tasks to yourself"
            checked={settings.autoAssignToCreator}
            onCheckedChange={(v) => updateSetting("autoAssignToCreator", v)}
          />
        </CardContent>
      </Card>
    </div>
  )
}

export function TasksNotificationsSettings() {
  const { settings, updateSetting, isLoaded } = useTasksSettingsStorage()

  if (!isLoaded) {
    return <div className="p-4 text-center text-muted-foreground">Loading...</div>
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Task Notifications</CardTitle>
          <CardDescription>Configure task-related notifications</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <SettingsToggle
            id="reminders"
            label="Due Date Reminders"
            description="Get reminded before task due dates"
            checked={settings.dueDateReminders}
            onCheckedChange={(v) => updateSetting("dueDateReminders", v)}
          />

          <SettingsSelect
            id="reminder-time"
            label="Reminder Time"
            description="When to send due date reminders"
            value={settings.reminderTime}
            onValueChange={(v) => updateSetting("reminderTime", v as "1hour" | "1day" | "1week")}
            options={[
              { value: "1hour", label: "1 hour before" },
              { value: "1day", label: "1 day before" },
              { value: "1week", label: "1 week before" },
            ]}
            disabled={!settings.dueDateReminders}
          />

          <Separator />

          <SettingsToggle
            id="assignment"
            label="Assignment Notifications"
            description="Get notified when assigned to a task"
            checked={settings.assignmentNotifications}
            onCheckedChange={(v) => updateSetting("assignmentNotifications", v)}
          />

          <SettingsToggle
            id="statuschange"
            label="Status Change Notifications"
            description="Get notified when task status changes"
            checked={settings.statusChangeNotifications}
            onCheckedChange={(v) => updateSetting("statusChangeNotifications", v)}
          />

          <SettingsToggle
            id="digest"
            label="Daily Digest"
            description="Receive a daily summary of your tasks"
            checked={settings.dailyDigest}
            onCheckedChange={(v) => updateSetting("dailyDigest", v)}
          />
        </CardContent>
      </Card>
    </div>
  )
}

export function TasksProductivitySettings() {
  const { settings, updateSetting, isLoaded } = useTasksSettingsStorage()

  if (!isLoaded) {
    return <div className="p-4 text-center text-muted-foreground">Loading...</div>
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Productivity</CardTitle>
          <CardDescription>Productivity features</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <SettingsToggle
            id="focus-mode"
            label="Focus Mode"
            description="Minimize distractions while working on tasks"
            checked={settings.enableFocusMode}
            onCheckedChange={(v) => updateSetting("enableFocusMode", v)}
          />

          <Separator />

          <SettingsSection title="Pomodoro Timer" description="Time-boxing technique for productivity">
            <SettingsToggle
              id="pomodoro"
              label="Enable Pomodoro"
              description="Use Pomodoro technique for tasks"
              checked={settings.pomodoroIntegration}
              onCheckedChange={(v) => updateSetting("pomodoroIntegration", v)}
            />

            <SettingsSlider
              id="pomodoro-duration"
              label="Pomodoro Duration"
              description="Length of each focus session"
              value={settings.pomodoroDuration}
              onValueChange={(v: number[]) => updateSetting("pomodoroDuration", v[0] as number)}
              min={15}
              max={60}
              step={5}
              valueFormatter={(v) => `${v} min`}
              disabled={!settings.pomodoroIntegration}
            />
          </SettingsSection>
        </CardContent>
      </Card>
    </div>
  )
}
