"use client"

import * as React from "react"
import * as ToggleGroupPrimitive from "@radix-ui/react-toggle-group"

import { cn } from "@/lib/utils"

type ToggleSize = "sm" | "default" | "lg"
type ToggleVariant = "default" | "outline"

const toggleGroupItemSizes: Record<ToggleSize, string> = {
  sm: "h-8 px-3 text-xs",
  default: "h-9 px-3 text-sm",
  lg: "h-10 px-4 text-base",
}

export interface ToggleGroupOption {
  value: string
  label?: React.ReactNode
  icon?: React.ReactNode
}

type ToggleGroupValue = string | string[]

export interface ToggleGroupProps
  extends Omit<
    React.ComponentPropsWithoutRef<typeof ToggleGroupPrimitive.Root>,
    "value" | "defaultValue" | "onValueChange"
  > {
  value?: ToggleGroupValue
  defaultValue?: ToggleGroupValue
  onValueChange?: (value: ToggleGroupValue) => void
  options?: ToggleGroupOption[]
  size?: ToggleSize
  variant?: ToggleVariant
}

const ToggleGroup = React.forwardRef<
  React.ElementRef<typeof ToggleGroupPrimitive.Root>,
  ToggleGroupProps
>(
  (
    {
      value,
      defaultValue,
      onValueChange,
      options = [],
      size = "default",
      variant = "default",
      className,
      children,
      ...props
    },
    ref
  ) => {
    const { type = "single", ...rest } = props as ToggleGroupProps & {
      type?: "single" | "multiple"
    }

    const handleValueChange = React.useCallback(
      (nextValue: string | string[]) => {
        onValueChange?.(nextValue)
      },
      [onValueChange]
    )

    // Bypass discriminated union type error using an any-casted component
    const Component = ToggleGroupPrimitive.Root as any
    return (
      <Component
        ref={ref}
        data-slot="toggle-group"
        className={cn("flex flex-wrap gap-2", className)}
        value={value as string[] | string | undefined}
        defaultValue={defaultValue as string[] | string | undefined}
        onValueChange={handleValueChange}
        type={type}
        {...rest}
      >
        {options.map(({ value: optionValue, label, icon }) => {
          const hasIcon = Boolean(icon)
          const hasLabel = label !== undefined && label !== null

          return (
            <ToggleGroupPrimitive.Item
              key={optionValue}
              value={optionValue}
              data-slot="toggle-group-item"
              className={cn(
                "inline-flex items-center justify-center gap-1 rounded-md border border-input text-sm font-medium transition-[background-color,color,transform] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 data-[state=on]:bg-primary data-[state=on]:text-primary-foreground",
                variant === "outline" && "bg-transparent",
                toggleGroupItemSizes[size]
              )}
            >
              {icon}
              {hasLabel && hasIcon ? <span>{label}</span> : label ?? icon}
            </ToggleGroupPrimitive.Item>
          )
        })
        }
        {children}
      </Component >
    )
  }
)
ToggleGroup.displayName = "ToggleGroup"

export { ToggleGroup }
