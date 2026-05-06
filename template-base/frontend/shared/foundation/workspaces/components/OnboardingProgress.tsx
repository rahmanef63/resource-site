import { Check } from "lucide-react"
import { cn } from "@/lib/utils"
import type { OnboardingProgressProps } from "./types"

export function OnboardingProgress({
  currentStep,
  steps,
  className,
  variant = "steps",
  showActiveLabel = true,
}: OnboardingProgressProps) {
  if (variant === "pulse-line") {
    const totalSteps = Math.max(steps.length, 1)
    const clampedStep = Math.min(Math.max(currentStep, 0), steps.length - 1)
    const progress = ((clampedStep + 1) / totalSteps) * 100

    return (
      <div
        className={cn("w-full", className)}
        role="progressbar"
        aria-valuemin={0}
        aria-valuemax={totalSteps}
        aria-valuenow={clampedStep + 1}
        aria-label={`Step ${clampedStep + 1} of ${totalSteps}`}
      >
        <div className="relative h-1 w-full overflow-visible rounded-full bg-muted/60">
          <div
            className="animate-pulse-glow absolute inset-y-0 left-0 rounded-full bg-primary transition-[width] duration-500 ease-out"
            style={{ width: `${progress}%` }}
          />
        </div>
        {showActiveLabel && (
          <div className="mt-2 flex w-full justify-between gap-2">
            {steps.map((step, index) => {
              const isActive = index === clampedStep
              const isDone = index < clampedStep
              return (
                <span
                  key={step.id}
                  className={cn(
                    "text-[10px] font-semibold uppercase tracking-[0.16em] transition-colors",
                    isActive
                      ? "text-primary"
                      : isDone
                        ? "text-foreground/70"
                        : "text-muted-foreground/70"
                  )}
                >
                  {step.label}
                </span>
              )
            })}
          </div>
        )}
      </div>
    )
  }

  return (
    <div className={cn("w-full", className)}>
      <div className="flex w-full items-start justify-between gap-2 sm:gap-3">
        {steps.map((step, index) => {
          const isCompleted = index < currentStep
          const isCurrent = index === currentStep
          const isLast = index === steps.length - 1

          return (
            <div
              key={step.id}
              className={cn("flex min-w-0 items-start", !isLast && "flex-1")}
            >
              <div className="flex min-w-0 flex-col items-center text-center">
                <div
                  className={cn(
                    "flex h-9 w-9 items-center justify-center rounded-full text-sm font-semibold transition-all duration-300 sm:h-10 sm:w-10",
                    isCompleted
                      ? "bg-primary text-primary-foreground"
                      : isCurrent
                        ? "bg-primary text-primary-foreground ring-4 ring-primary/20"
                        : "bg-muted text-muted-foreground"
                  )}
                >
                  {isCompleted ? (
                    <Check className="h-5 w-5" />
                  ) : (
                    index + 1
                  )}
                </div>
                <span className={cn(
                  "mt-2 max-w-[4.75rem] text-[11px] font-medium leading-4 sm:max-w-none sm:text-xs",
                  isCurrent ? "text-primary" : "text-muted-foreground"
                )}>
                  {step.label}
                </span>
              </div>

              {!isLast && (
                <div
                  className={cn(
                    "mt-4 ml-2 h-1 min-w-4 flex-1 rounded-full transition-all duration-300 sm:mt-5 sm:ml-3",
                    index < currentStep
                      ? "bg-primary"
                      : "bg-muted"
                  )}
                />
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
