"use client"

import * as React from "react"
import * as AccordionPrimitive from "@radix-ui/react-accordion"
import { ChevronDown } from "lucide-react"

import { cn } from "@/lib/utils"

export interface AccordionItem {
  value: string
  title: React.ReactNode
  content: React.ReactNode
}

export interface AccordionProps
  extends Omit<
    React.ComponentPropsWithoutRef<typeof AccordionPrimitive.Root>,
    "children"
  > {
  items: AccordionItem[]
  itemClassName?: string
  triggerClassName?: string
  contentClassName?: string
}

const Accordion = React.forwardRef<
  React.ElementRef<typeof AccordionPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof AccordionPrimitive.Root> & { 
    items: AccordionItem[]
    itemClassName?: string
    triggerClassName?: string
    contentClassName?: string
  }
>(
  (
    {
      items,
      className,
      itemClassName,
      triggerClassName,
      contentClassName,
      ...props
    },
    ref
  ) => {
    return (
      <AccordionPrimitive.Root
        ref={ref}
        data-slot="accordion"
        className={cn("w-full space-y-2", className)}
        {...props}
      >
        {items.map(({ value, title, content }) => (
          <AccordionPrimitive.Item
            key={value}
            value={value}
            className={cn(
              "border border-border bg-card text-card-foreground rounded-md",
              itemClassName
            )}
          >
            <AccordionPrimitive.Header className="flex">
              <AccordionPrimitive.Trigger
                className={cn(
                  "flex flex-1 items-center justify-between gap-2 px-4 py-3 text-left text-sm font-medium transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 [&[data-state=open]>svg]:rotate-180",
                  triggerClassName
                )}
              >
                <span>{title}</span>
                <ChevronDown className="size-4 shrink-0 transition-transform duration-200" />
              </AccordionPrimitive.Trigger>
            </AccordionPrimitive.Header>
            <AccordionPrimitive.Content
              className={cn(
                "px-4 pb-4 text-sm text-muted-foreground data-[state=open]:animate-accordion-down data-[state=closed]:animate-accordion-up",
                contentClassName
              )}
            >
              {content}
            </AccordionPrimitive.Content>
          </AccordionPrimitive.Item>
        ))}
      </AccordionPrimitive.Root>
    )
  }
)
Accordion.displayName = "Accordion"

export { Accordion }
