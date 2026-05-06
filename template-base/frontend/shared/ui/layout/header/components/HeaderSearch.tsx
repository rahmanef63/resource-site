"use client"

import * as React from "react"
import { Search, X } from "lucide-react"
import { useHeaderContextSafe } from "../context"
import { getSearchContainerClasses, getSearchInputClasses } from "../styles"
import type { HeaderSearchProps } from "../types"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip"

export const HeaderSearch = React.forwardRef<HTMLDivElement, HeaderSearchProps>(
  (
    {
      value,
      onChange,
      placeholder = "Search...",
      icon: CustomIcon,
      clearable = true,
      onClear,
      onSubmit,
      shortcut,
      expandable,
      position = "left",
      className,
    },
    ref
  ) => {
    const context = useHeaderContextSafe()
    const size = context?.size ?? "md"
    const [isExpanded, setIsExpanded] = React.useState(!expandable)
    const inputRef = React.useRef<HTMLInputElement>(null)

    const SearchIcon = CustomIcon ?? Search

    const handleClear = () => {
      onChange("")
      onClear?.()
      inputRef.current?.focus()
    }

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === "Enter" && onSubmit) {
        onSubmit(value)
      }
      if (e.key === "Escape" && expandable) {
        setIsExpanded(false)
      }
    }

    if (expandable && !isExpanded) {
      return (
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => {
                setIsExpanded(true)
                setTimeout(() => inputRef.current?.focus(), 0)
              }}
            >
              <SearchIcon className="h-4 w-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            Search {shortcut && <kbd className="ml-2">{shortcut}</kbd>}
          </TooltipContent>
        </Tooltip>
      )
    }

    return (
      <div
        ref={ref}
        className={getSearchContainerClasses({ size, expanded: !expandable, className })}
      >
        <SearchIcon className="absolute left-3 h-4 w-4 text-muted-foreground" />
        <Input
          ref={inputRef}
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          className={getSearchInputClasses({ size, hasIcon: true })}
        />
        {clearable && value && (
          <Button
            variant="ghost"
            size="icon"
            className="absolute right-1 h-6 w-6"
            onClick={handleClear}
          >
            <X className="h-3.5 w-3.5" />
          </Button>
        )}
      </div>
    )
  }
)
HeaderSearch.displayName = "HeaderSearch"
