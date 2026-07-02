/**
 * Progress Bar Component - Compact Version
 * Space-efficient progress indicator with gradient animation and glow
 */

import { cn } from "@/lib/utils";
import type { FormStep } from "../types";

interface ProgressBarProps {
  currentStep: FormStep;
  steps: Array<{ id: FormStep; title: string }>;
  onStepClick?: (step: FormStep) => void;
}

const stepOrder: FormStep[] = ['domain', 'seo', 'analytics', 'advanced', 'mcp'];

export function ProgressBar({ currentStep, steps, onStepClick }: ProgressBarProps) {
  const currentIndex = stepOrder.indexOf(currentStep);
  const progress = ((currentIndex + 1) / steps.length) * 100;

  return (
    <div className="w-full space-y-3">
      {/* Compact Progress Bar with Glow */}
      <div className="relative h-2 bg-muted/50 dark:bg-muted/30 rounded-full overflow-hidden shadow-inner">
        <div
          className={cn(
            "absolute inset-y-0 left-0 rounded-full transition-all duration-700 ease-out",
            "bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500",
            "shadow-lg shadow-purple-500/50 dark:shadow-purple-400/30"
          )}
          style={{ width: `${progress}%` }}
        >
          {/* Shimmer animation */}
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent animate-shimmer" />
          
          {/* Glow effect */}
          <div className="absolute inset-0 blur-sm bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 opacity-60" />
        </div>
      </div>

      {/* Compact Step Indicators */}
      <div className="flex items-center justify-between px-1">
        {steps.map((step, index) => {
          const isActive = step.id === currentStep;
          const isCompleted = stepOrder.indexOf(step.id) < currentIndex;
          const isClickable = onStepClick && (isCompleted || isActive);

          return (
            <button
              key={step.id}
              onClick={() => isClickable && onStepClick?.(step.id)}
              disabled={!isClickable}
              className={cn(
                "flex flex-col items-center gap-1.5 transition-all duration-300 group",
                isClickable && "cursor-pointer hover:scale-105",
                !isClickable && "cursor-not-allowed opacity-40"
              )}
            >
              {/* Compact Circle */}
              <div
                className={cn(
                  "relative flex items-center justify-center w-8 h-8 rounded-full border-2 transition-all duration-300",
                  isActive && "border-primary bg-primary text-primary-foreground shadow-lg shadow-primary/50 scale-110",
                  isCompleted && "border-green-500 bg-green-500 text-white shadow-md shadow-green-500/30",
                  !isActive && !isCompleted && "border-muted-foreground/30 bg-background/50 dark:bg-muted/20 text-muted-foreground"
                )}
              >
                {isCompleted ? (
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                ) : (
                  <div className={cn(
                    "w-2 h-2 rounded-full transition-all duration-300",
                    isActive && "bg-primary-foreground scale-125",
                    !isActive && "bg-muted-foreground/50"
                  )} />
                )}

                {/* Pulse animation for active step */}
                {isActive && (
                  <span className="absolute inset-0 rounded-full bg-primary animate-ping opacity-25" />
                )}
              </div>

              {/* Compact Label */}
              <span
                className={cn(
                  "text-[10px] font-medium transition-all duration-300 max-w-[70px] text-center leading-tight",
                  isActive && "text-primary font-semibold",
                  isCompleted && "text-green-600 dark:text-green-400",
                  !isActive && !isCompleted && "text-muted-foreground"
                )}
              >
                {step.title}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
