"use client"

import * as React from "react"
import { useHeaderContextSafe } from "../context"
import {
  getMetaContainerClasses,
  getMetaItemClasses,
  getMetaSeparatorClasses,
} from "../styles"
import type { HeaderMetaProps } from "../types"

import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip"

export const HeaderMeta = React.forwardRef<HTMLDivElement, HeaderMetaProps>(
  ({ items, separator = "dot", className }, ref) => {
    const context = useHeaderContextSafe()
    const size = context?.size ?? "md"

    const getSeparatorContent = () => {
      switch (separator) {
        case "dot":
          return "•"
        case "pipe":
          return "|"
        case "slash":
          return "/"
        default:
          return null
      }
    }

    return (
      <div
        ref={ref}
        className={getMetaContainerClasses({ size, className })}
      >
        {items.map((item, index) => {
          const ItemIcon = item.icon
          return (
            <React.Fragment key={index}>
              {index > 0 && separator !== "none" && (
                <span className={getMetaSeparatorClasses({ separator })}>
                  {getSeparatorContent()}
                </span>
              )}
              <Tooltip>
                <TooltipTrigger asChild>
                  <span className={getMetaItemClasses()}>
                    {ItemIcon && <ItemIcon className="h-3.5 w-3.5" />}
                    <span>{item.label}:</span>
                    <span className="font-medium text-foreground">{item.value}</span>
                  </span>
                </TooltipTrigger>
                {item.tooltip && <TooltipContent>{item.tooltip}</TooltipContent>}
              </Tooltip>
            </React.Fragment>
          )
        })}
      </div>
    )
  }
)
HeaderMeta.displayName = "HeaderMeta"
