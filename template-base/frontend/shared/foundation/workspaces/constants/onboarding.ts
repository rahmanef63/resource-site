import { CheckCircle2, Database, Table2 } from "lucide-react"
import type { LucideIcon } from "lucide-react"

import type { OnboardingProgressStep } from "../components/types"
import type { OnboardingStepDef } from "../components/onboarding-types"

export interface OnboardingJourneyStepDef {
  id: "workspace" | "database" | "row"
  title: string
  description: string
  icon: LucideIcon
}

export const WORKSPACE_ONBOARDING_WIZARD_STEPS: OnboardingStepDef[] = [
  {
    id: "details",
    label: "Details",
    title: "Set up your workspace details",
    description: "Name the workspace and choose how you plan to use it.",
    icon: "Rocket",
  },
  {
    id: "bundle",
    label: "Template",
    title: "Choose Your Template",
    description: "Pick a starting point you can keep customizing after launch.",
    icon: "Layers",
  },
  {
    id: "features",
    label: "Features",
    title: "Customize Features",
    description: "Review the included tools and toggle optional ones on or off.",
    icon: "Settings",
  },
]

export const WORKSPACE_ONBOARDING_PROGRESS_STEPS: OnboardingProgressStep[] =
  WORKSPACE_ONBOARDING_WIZARD_STEPS.map(({ id, label }) => ({
    id,
    label,
  }))

export const WORKSPACE_ONBOARDING_JOURNEY_TITLE = "Getting started"
export const WORKSPACE_ONBOARDING_JOURNEY_DESCRIPTION =
  "Three guided steps to launch your workspace."

export const WORKSPACE_ONBOARDING_JOURNEY_STEPS: OnboardingJourneyStepDef[] = [
  {
    id: "workspace",
    title: "Create your workspace",
    description: "Pick a name and choose what you want to enable.",
    icon: CheckCircle2,
  },
  {
    id: "database",
    title: "Create your first database",
    description: "Start from a blank table or a starter template.",
    icon: Database,
  },
  {
    id: "row",
    title: "Add your first row",
    description: "Add a record so your workspace has real data.",
    icon: Table2,
  },
]
