"use client"

import * as React from "react"
import * as TogglePrimitive from "@radix-ui/react-toggle"

import { cn } from "@/lib/utils"

const toggleSizes = {
  sm: "h-8 w-8",
  default: "h-9 w-9",
  lg: "h-10 w-10",
} as const

type ToggleSize = keyof typeof toggleSizes
type ToggleVariant = "default" | "outline"

interface ToggleProps
  extends React.ComponentPropsWithoutRef<typeof TogglePrimitive.Root> {
  size?: ToggleSize
  variant?: ToggleVariant
}

const Toggle = React.forwardRef<
  React.ElementRef<typeof TogglePrimitive.Root>,
  ToggleProps
>(({ className, size = "default", variant = "default", ...props }, ref) => {
  return (
    <TogglePrimitive.Root
      ref={ref}
      data-slot="toggle"
      data-size={size}
      data-variant={variant}
      className={cn(
        "inline-flex items-center justify-center rounded-md border border-input text-sm font-medium transition-[background-color,color,transform] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 data-[state=on]:bg-primary data-[state=on]:text-primary-foreground",
        variant === "outline" && "bg-transparent",
        toggleSizes[size],
        className
      )}
      {...props}
    />
  )
})
Toggle.displayName = TogglePrimitive.Root.displayName

export { Toggle }
