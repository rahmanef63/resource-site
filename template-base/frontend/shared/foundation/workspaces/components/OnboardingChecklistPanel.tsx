"use client"

import { ChevronDown } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible"
import { cn } from "@/lib/utils"

import {
  WORKSPACE_ONBOARDING_JOURNEY_DESCRIPTION,
  WORKSPACE_ONBOARDING_JOURNEY_STEPS,
  WORKSPACE_ONBOARDING_JOURNEY_TITLE,
  type OnboardingJourneyStepDef,
} from "../constants/onboarding"

type JourneyStepId = (typeof WORKSPACE_ONBOARDING_JOURNEY_STEPS)[number]["id"]

export interface OnboardingChecklistPanelProps {
  mode?: "desktop" | "mobile-summary"
  currentStepId: JourneyStepId
  completedStepIds?: JourneyStepId[]
  className?: string
}

function getStepStatus(
  stepId: JourneyStepId,
  currentStepId: JourneyStepId,
  completedStepIds: JourneyStepId[],
) {
  if (completedStepIds.includes(stepId)) return "completed"
  if (stepId === currentStepId) return "current"
  return "next"
}

function StepRow({
  step,
  index,
  status,
}: {
  step: OnboardingJourneyStepDef
  index: number
  status: "completed" | "current" | "next"
}) {
  const StepIcon = step.icon
  const isCurrent = status === "current"
  const isCompleted = status === "completed"

  return (
    <div key={step.id} className="flex items-start gap-2.5">
      <div
        className={cn(
          "mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full border bg-background",
          isCurrent && "border-primary/40 bg-primary/5",
          isCompleted && "border-primary bg-primary text-primary-foreground",
        )}
      >
        <StepIcon
          className={cn(
            "h-3.5 w-3.5",
            isCompleted
              ? "text-primary-foreground"
              : isCurrent
                ? "text-primary"
                : "text-muted-foreground",
          )}
        />
      </div>
      <div className="min-w-0 space-y-1">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-sm font-medium leading-5">
            {index + 1}. {step.title}
          </span>
          {isCurrent ? (
            <span className="rounded-full bg-primary/10 px-2 py-0.5 text-[11px] font-medium text-primary">
              Current
            </span>
          ) : null}
          {isCompleted ? (
            <span className="rounded-full bg-primary px-2 py-0.5 text-[11px] font-medium text-primary-foreground">
              Done
            </span>
          ) : null}
        </div>
        <p className="text-xs leading-5 text-muted-foreground">{step.description}</p>
      </div>
    </div>
  )
}

function ChecklistSteps({
  currentStepId,
  completedStepIds,
}: {
  currentStepId: JourneyStepId
  completedStepIds: JourneyStepId[]
}) {
  return (
    <div className="space-y-3">
      {WORKSPACE_ONBOARDING_JOURNEY_STEPS.map((step, index) => (
        <StepRow
          key={step.id}
          step={step}
          index={index}
          status={getStepStatus(step.id, currentStepId, completedStepIds)}
        />
      ))}
    </div>
  )
}

export function OnboardingChecklistPanel({
  mode = "desktop",
  currentStepId,
  completedStepIds = [],
  className,
}: OnboardingChecklistPanelProps) {
  const activeStep =
    WORKSPACE_ONBOARDING_JOURNEY_STEPS.find((step) => step.id === currentStepId) ??
    WORKSPACE_ONBOARDING_JOURNEY_STEPS[0]

  if (mode === "mobile-summary") {
    return (
      <Card className={cn("border-border/60 bg-card/80 shadow-none", className)}>
        <Collapsible defaultOpen={false}>
          <div className="flex items-start justify-between gap-4 p-4">
            <div className="min-w-0">
              <p className="text-sm font-semibold">{WORKSPACE_ONBOARDING_JOURNEY_TITLE}</p>
              <p className="mt-1 text-sm text-muted-foreground">
                Current: {activeStep.title}
              </p>
            </div>
            <CollapsibleTrigger asChild>
              <Button variant="outline" size="sm" className="shrink-0 rounded-full">
                View steps
                <ChevronDown className="ml-1 h-4 w-4" />
              </Button>
            </CollapsibleTrigger>
          </div>
          <CollapsibleContent className="border-t border-border/60 px-4 pb-4 pt-4">
            <ChecklistSteps
              currentStepId={currentStepId}
              completedStepIds={completedStepIds}
            />
          </CollapsibleContent>
        </Collapsible>
      </Card>
    )
  }

  return (
    <Card className={cn("border-border/60 bg-card/80 shadow-none", className)}>
      <CardHeader className="space-y-2">
        <CardTitle className="text-base">{WORKSPACE_ONBOARDING_JOURNEY_TITLE}</CardTitle>
        <CardDescription>{WORKSPACE_ONBOARDING_JOURNEY_DESCRIPTION}</CardDescription>
      </CardHeader>
      <CardContent>
        <ChecklistSteps
          currentStepId={currentStepId}
          completedStepIds={completedStepIds}
        />
      </CardContent>
    </Card>
  )
}
