/**
 * Projects Feature Initialization
 * Registers projects-related settings with the settings registry
 */

import { registerFeatureSettings } from "@/frontend/shared/settings"
import { LayoutGrid, Users, Calendar, Workflow } from "lucide-react"
import {
  ProjectsDisplaySettings,
  ProjectsCollaborationSettings,
  ProjectsTimelineSettings,
  ProjectsWorkflowSettings,
} from "./settings"
import { registerProjectsAgent } from "./agent"

// Register projects feature settings
registerFeatureSettings("projects", () => [
  {
    id: "projects-display",
    label: "Display",
    icon: LayoutGrid,
    order: 100,
    component: ProjectsDisplaySettings,
  },
  {
    id: "projects-collaboration",
    label: "Collaboration",
    icon: Users,
    order: 110,
    component: ProjectsCollaborationSettings,
  },
  {
    id: "projects-timeline",
    label: "Timeline",
    icon: Calendar,
    order: 120,
    component: ProjectsTimelineSettings,
  },
  {
    id: "projects-workflow",
    label: "Workflow",
    icon: Workflow,
    order: 130,
    component: ProjectsWorkflowSettings,
  },
])

registerProjectsAgent()

if (typeof window !== "undefined" && process.env.NODE_ENV === "development") {
}
