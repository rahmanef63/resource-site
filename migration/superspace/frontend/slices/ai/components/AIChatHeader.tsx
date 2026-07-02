"use client"

import { useState } from "react"
import * as LucideIcons from "lucide-react"
import { Bot, Paperclip, Brain, ChevronLeft, Settings2, PanelLeft } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { cn } from "@/lib/utils"
import { useTheme } from "next-themes"
import { useRegisterMobileContentHeader } from "@/frontend/shared/ui/layout/dashboard/mobile/mobile-chrome-title"
import type { AISession } from "../stores"
import { ContextSelectorDialog } from "./ContextSelectorDialog"
import { IconPicker } from "./IconPicker"
import { ChatHistoryDropdown } from "./ChatHistoryDropdown"
import { AgentSelector } from "./AgentSelector"

interface AIChatHeaderProps {
  session: AISession | null
  knowledgeEnabled: boolean
  onKnowledgeToggle: (enabled: boolean) => void
  onIconChange?: (icon: string) => void
  onAgentSelect?: (agentId: string | null) => void
  onBack?: () => void
  className?: string
  // New props
  onToggleInfo?: () => void
  isInfoOpen?: boolean
}

export function AIChatHeader({
  session,
  knowledgeEnabled,
  onKnowledgeToggle,
  onIconChange,
  onAgentSelect,
  onBack,
  className,
  onToggleInfo,
  isInfoOpen,
}: AIChatHeaderProps) {
  const [showContextSelector, setShowContextSelector] = useState(false)
  const { theme } = useTheme()
  // Suppress MobileTopBar title strip — AIChatHeader IS the header on mobile
  useRegisterMobileContentHeader(true)

  // Get session icon
  const SessionIcon = session?.icon && (session.icon in LucideIcons)
    ? (LucideIcons as any)[session.icon]
    : Bot

  // Context sources count
  const contextSourcesCount = knowledgeEnabled ? 1 : 0

  return (
    <div className={cn(
      "flex items-center justify-between px-3 md:px-4 py-2.5 md:py-3 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60",
      "border-border",
      className
    )}>
      {/* Left: Back button + History + Avatar + Title */}
      <div className="flex items-center gap-2 md:gap-3 min-w-0 flex-1">

        {/* Back button on mobile */}
        {onBack && (
          <Button aria-label="Previous"
            variant="ghost"
            size="icon"
            onClick={onBack}
            className="h-8 w-8 shrink-0"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
        )}

        {/* Chat History Dropdown - hidden on mobile for cleaner UI */}
        <div className="hidden md:block">
          <ChatHistoryDropdown />
        </div>

        <div className="flex items-center gap-2 min-w-0">
          {/* Icon Picker or Avatar */}
          {onIconChange ? (
            <IconPicker
              value={session?.icon}
              onValueChange={onIconChange}
              className="shrink-0"
            />
          ) : (
            <Avatar className="h-8 w-8 md:h-9 md:w-9 shrink-0">
              <AvatarFallback className="bg-gradient-to-br from-purple-500 to-pink-500 text-white">
                <SessionIcon className="h-4 w-4 md:h-5 md:w-5" />
              </AvatarFallback>
            </Avatar>
          )}

          <div className="min-w-0 flex-1 flex flex-col justify-center">
            <h2 className="font-semibold truncate text-sm md:text-base text-foreground">
              {session?.title || "AI Assistant"}
            </h2>
            {/* Agent Selector in Header */}
            {onAgentSelect ? (
              <div className="mt-0.5">
                <AgentSelector
                  selectedAgentId={session?.metadata?.agentId || null}
                  onAgentSelect={onAgentSelect}
                  disabled={!!session?.metadata?.agentId && session.messages.length > 0} // Lock agent once chat starts if desired, or allow switching
                />
              </div>
            ) : (
              session?.topic && (
                <p className="text-xs text-muted-foreground truncate hidden sm:block">
                  {session.topic}
                </p>
              )
            )}
          </div>
        </div>
      </div>

      {/* Right: Actions */}
      <div className="flex items-center gap-1.5 md:gap-2 shrink-0">
        <TooltipProvider delayDuration={300}>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant={knowledgeEnabled ? "secondary" : "ghost"}
                size="sm"
                onClick={() => knowledgeEnabled ? setShowContextSelector(true) : onKnowledgeToggle(true)}
                className={cn(
                  "h-8 gap-1.5 md:gap-2 relative",
                  knowledgeEnabled && "bg-purple-500/10 text-purple-600 dark:text-purple-400 hover:bg-purple-500/20"
                )}
              >
                <Brain className="h-4 w-4" />
                <span className="hidden sm:inline">Context</span>
                {knowledgeEnabled && contextSourcesCount > 0 && (
                  <Badge variant="secondary" className="h-4 w-4 p-0 flex items-center justify-center text-[10px] ml-1">
                    {contextSourcesCount}
                  </Badge>
                )}
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>{knowledgeEnabled ? "Configure context sources" : "Enable knowledge context"}</p>
            </TooltipContent>
          </Tooltip>

          {/* Info Panel Toggle */}
          {onToggleInfo && (
            <Tooltip>
              <TooltipTrigger asChild>
                <Button aria-label="Toggle sidebar"
                  variant={isInfoOpen ? "secondary" : "ghost"}
                  size="icon"
                  onClick={onToggleInfo}
                  className="h-8 w-8"
                >
                  <PanelLeft className={`h-4 w-4 ${isInfoOpen ? "text-primary" : ""}`} />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>{isInfoOpen ? "Close info" : "Open session info"}</p>
              </TooltipContent>
            </Tooltip>
          )}

          {knowledgeEnabled && (
            <Tooltip>
              <TooltipTrigger asChild>
                <Button aria-label="Settings"
                  variant="ghost"
                  size="icon"
                  onClick={() => onKnowledgeToggle(false)}
                  className="h-8 w-8"
                >
                  <Settings2 className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Disable context</p>
              </TooltipContent>
            </Tooltip>
          )}
        </TooltipProvider>

        {/* Context Selector Dialog */}
        <ContextSelectorDialog
          open={showContextSelector}
          onOpenChange={setShowContextSelector}
        />
      </div>
    </div>
  )
}
