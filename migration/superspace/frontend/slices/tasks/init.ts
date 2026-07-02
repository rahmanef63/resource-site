/**
 * Tasks Feature Initialization
 * Registers tasks-related settings with the settings registry
 */

import { registerFeatureSettings } from "@/frontend/shared/settings"
import { CheckSquare, Bell, Settings2, Timer } from "lucide-react"
import {
  TasksGeneralSettings,
  TasksDefaultsSettings,
  TasksNotificationsSettings,
  TasksProductivitySettings,
} from "./settings/TasksSettings"

import { registerTasksAgent } from "./agent"

// Register tasks feature settings
registerFeatureSettings("tasks", () => [
  {
    id: "tasks-general",
    label: "General",
    icon: CheckSquare,
    order: 400,
    component: TasksGeneralSettings,
  },
  {
    id: "tasks-defaults",
    label: "Defaults",
    icon: Settings2,
    order: 410,
    component: TasksDefaultsSettings,
  },
  {
    id: "tasks-notifications",
    label: "Notifications",
    icon: Bell,
    order: 420,
    component: TasksNotificationsSettings,
  },
  {
    id: "tasks-productivity",
    label: "Productivity",
    icon: Timer,
    order: 430,
    component: TasksProductivitySettings,
  },
])

registerTasksAgent()

