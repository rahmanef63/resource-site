"use client"

import * as React from "react"
import * as ProgressPrimitive from "@radix-ui/react-progress"

import { cn } from "@/lib/utils"

type FormatValueFn = (percentage: number, value: number, max: number) => React.ReactNode

export interface ProgressProps
  extends Omit<
    React.ComponentPropsWithoutRef<typeof ProgressPrimitive.Root>,
    "value" | "max"
  > {
  value?: number
  max?: number
  showValue?: boolean
  wrapperClassName?: string
  formatValue?: FormatValueFn
}

const defaultFormatValue: FormatValueFn = (percentage) =>
  `${Math.round(percentage)}%`

const Progress = React.forwardRef<
  React.ElementRef<typeof ProgressPrimitive.Root>,
  ProgressProps
>(
  (
    {
      className,
      value = 0,
      max = 100,
      showValue = false,
      wrapperClassName,
      formatValue = defaultFormatValue,
      ...props
    },
    ref
  ) => {
    const clampedMax = Math.max(max, 1)
    const clampedValue = Math.min(Math.max(value, 0), clampedMax)
    const percentage = (clampedValue / clampedMax) * 100

    const root = (
      <ProgressPrimitive.Root
        ref={ref}
        data-slot="progress"
        className={cn(
          "relative h-2 w-full overflow-hidden rounded-full bg-muted",
          className
        )}
        value={percentage}
        max={100}
        aria-valuemin={0}
        aria-valuemax={clampedMax}
        aria-valuenow={clampedValue}
        aria-label={props["aria-label"] ?? "Progress"}
        {...props}
      >
        <ProgressPrimitive.Indicator
          data-slot="progress-indicator"
          className="bg-primary h-full w-full flex-1 transition-all"
          style={{ transform: `translateX(-${100 - percentage}%)` }}
        />
      </ProgressPrimitive.Root>
    )

    if (!showValue) {
      return root
    }

    return (
      <div className={cn("flex flex-col gap-1", wrapperClassName)}>
        {root}
        <span className="text-xs font-medium text-muted-foreground">
          {formatValue(percentage, clampedValue, clampedMax)}
        </span>
      </div>
    )
  }
)
Progress.displayName = ProgressPrimitive.Root.displayName

export { Progress }
