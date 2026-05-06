/**
 * Slash Commands Component
 * 
 * Provides / command suggestions for tools and actions
 * @module shared/communications/composer
 */

"use client"

import * as React from "react"
import { cn } from "@/lib/utils"
import {
  MessageSquare,
  Image,
  FileText,
  Video,
  Mic,
  Calendar,
  MapPin,
  BarChart3,
  Code,
  Link2,
  Search,
  Bot,
  Zap,
  Play,
  Settings,
  Users,
  Hash,
  Bookmark,
  Flag,
  Bell,
  type LucideIcon,
} from "lucide-react"
import { ScrollArea } from "@/components/ui/scroll-area"

// =============================================================================
// Types
// =============================================================================

export type SlashCommandCategory = 
  | "actions" 
  | "media" 
  | "ai" 
  | "tools" 
  | "navigation"

export interface SlashCommand {
  id: string
  command: string
  label: string
  description: string
  icon: LucideIcon
  category: SlashCommandCategory
  /** Keywords for search */
  keywords?: string[]
  /** Is this command available in AI context */
  aiOnly?: boolean
  /** Is this command available in chat context */
  chatOnly?: boolean
}

export interface SlashCommandsProps {
  /** Search query (text after /) */
  query: string
  /** Available commands */
  commands?: SlashCommand[]
  /** Selected index */
  selectedIndex: number
  /** On command select */
  onSelect: (command: SlashCommand) => void
  /** Context - determines which commands are shown */
  context?: "chat" | "ai" | "all"
  /** Custom class */
  className?: string
}

// =============================================================================
// Default Commands
// =============================================================================

export const DEFAULT_SLASH_COMMANDS: SlashCommand[] = [
  // Actions
  {
    id: "giphy",
    command: "/giphy",
    label: "GIF",
    description: "Search and send a GIF",
    icon: Image,
    category: "actions",
    keywords: ["gif", "meme", "animation"],
  },
  {
    id: "poll",
    command: "/poll",
    label: "Create Poll",
    description: "Create a poll for quick voting",
    icon: BarChart3,
    category: "actions",
    keywords: ["vote", "survey", "question"],
  },
  {
    id: "remind",
    command: "/remind",
    label: "Set Reminder",
    description: "Set a reminder for yourself or channel",
    icon: Bell,
    category: "actions",
    keywords: ["timer", "notification", "schedule"],
  },
  {
    id: "code",
    command: "/code",
    label: "Code Block",
    description: "Insert a formatted code block",
    icon: Code,
    category: "actions",
    keywords: ["snippet", "programming", "syntax"],
  },
  
  // Media
  {
    id: "image",
    command: "/image",
    label: "Upload Image",
    description: "Upload an image or screenshot",
    icon: Image,
    category: "media",
    keywords: ["photo", "picture", "screenshot"],
  },
  {
    id: "video",
    command: "/video",
    label: "Video Message",
    description: "Record or upload a video",
    icon: Video,
    category: "media",
    keywords: ["clip", "record", "screen"],
  },
  {
    id: "voice",
    command: "/voice",
    label: "Voice Message",
    description: "Record a voice message",
    icon: Mic,
    category: "media",
    keywords: ["audio", "record", "speak"],
  },
  {
    id: "file",
    command: "/file",
    label: "Upload File",
    description: "Upload any file",
    icon: FileText,
    category: "media",
    keywords: ["document", "attachment", "upload"],
  },
  
  // AI Commands
  {
    id: "ask",
    command: "/ask",
    label: "Ask AI",
    description: "Ask AI a question about your workspace",
    icon: Bot,
    category: "ai",
    keywords: ["question", "help", "assistant"],
  },
  {
    id: "summarize",
    command: "/summarize",
    label: "Summarize",
    description: "Summarize conversation or document",
    icon: Zap,
    category: "ai",
    aiOnly: true,
    keywords: ["tldr", "brief", "overview"],
  },
  {
    id: "translate",
    command: "/translate",
    label: "Translate",
    description: "Translate text to another language",
    icon: MessageSquare,
    category: "ai",
    keywords: ["language", "convert"],
  },
  {
    id: "generate",
    command: "/generate",
    label: "Generate",
    description: "Generate content with AI",
    icon: Zap,
    category: "ai",
    aiOnly: true,
    keywords: ["create", "write", "make"],
  },
  
  // Tools
  {
    id: "search",
    command: "/search",
    label: "Search",
    description: "Search messages and files",
    icon: Search,
    category: "tools",
    keywords: ["find", "lookup", "query"],
  },
  {
    id: "schedule",
    command: "/schedule",
    label: "Schedule Message",
    description: "Schedule a message to send later",
    icon: Calendar,
    category: "tools",
    chatOnly: true,
    keywords: ["timer", "delay", "later"],
  },
  {
    id: "call",
    command: "/call",
    label: "Start Call",
    description: "Start a voice or video call",
    icon: Video,
    category: "tools",
    chatOnly: true,
    keywords: ["huddle", "meeting", "voice"],
  },
  {
    id: "run",
    command: "/run",
    label: "Run Code",
    description: "Execute code snippet",
    icon: Play,
    category: "tools",
    aiOnly: true,
    keywords: ["execute", "script"],
  },
  
  // Navigation
  {
    id: "channel",
    command: "/channel",
    label: "Go to Channel",
    description: "Navigate to a channel",
    icon: Hash,
    category: "navigation",
    chatOnly: true,
    keywords: ["goto", "open", "switch"],
  },
  {
    id: "dm",
    command: "/dm",
    label: "Direct Message",
    description: "Open a DM with someone",
    icon: Users,
    category: "navigation",
    chatOnly: true,
    keywords: ["message", "private"],
  },
  {
    id: "bookmark",
    command: "/bookmark",
    label: "Bookmarks",
    description: "View saved messages",
    icon: Bookmark,
    category: "navigation",
    keywords: ["saved", "starred"],
  },
]

// =============================================================================
// Component
// =============================================================================

export function SlashCommands({
  query,
  commands = DEFAULT_SLASH_COMMANDS,
  selectedIndex,
  onSelect,
  context = "all",
  className,
}: SlashCommandsProps) {
  const listRef = React.useRef<HTMLDivElement>(null)

  // Filter commands based on query and context
  const filteredCommands = React.useMemo(() => {
    let filtered = commands

    // Filter by context
    if (context === "chat") {
      filtered = filtered.filter(cmd => !cmd.aiOnly)
    } else if (context === "ai") {
      filtered = filtered.filter(cmd => !cmd.chatOnly)
    }

    // Filter by query
    if (query) {
      const lowerQuery = query.toLowerCase()
      filtered = filtered.filter(cmd => 
        cmd.command.toLowerCase().includes(lowerQuery) ||
        cmd.label.toLowerCase().includes(lowerQuery) ||
        cmd.description.toLowerCase().includes(lowerQuery) ||
        cmd.keywords?.some(k => k.includes(lowerQuery))
      )
    }

    return filtered
  }, [commands, query, context])

  // Group by category
  const groupedCommands = React.useMemo(() => {
    const groups: Record<SlashCommandCategory, SlashCommand[]> = {
      actions: [],
      media: [],
      ai: [],
      tools: [],
      navigation: [],
    }

    for (const cmd of filteredCommands) {
      groups[cmd.category].push(cmd)
    }

    return groups
  }, [filteredCommands])

  // Scroll selected item into view
  React.useEffect(() => {
    if (listRef.current) {
      const selectedItem = listRef.current.querySelector(`[data-index="${selectedIndex}"]`)
      selectedItem?.scrollIntoView({ block: "nearest" })
    }
  }, [selectedIndex])

  if (filteredCommands.length === 0) {
    return (
      <div className={cn(
        "bg-popover border rounded-lg shadow-lg p-4 text-center text-sm text-muted-foreground",
        className
      )}>
        No commands found for "{query}"
      </div>
    )
  }

  const categoryLabels: Record<SlashCommandCategory, string> = {
    actions: "Actions",
    media: "Media",
    ai: "AI Tools",
    tools: "Tools",
    navigation: "Navigation",
  }

  let globalIndex = 0

  return (
    <div className={cn(
      "bg-popover border rounded-lg shadow-lg overflow-hidden max-h-[300px]",
      className
    )}>
      <ScrollArea className="max-h-[300px]" ref={listRef}>
        <div className="p-1">
          {(Object.entries(groupedCommands) as [SlashCommandCategory, SlashCommand[]][]).map(
            ([category, cmds]) => {
              if (cmds.length === 0) return null

              return (
                <div key={category} className="mb-1 last:mb-0">
                  <div className="px-2 py-1.5 text-xs font-medium text-muted-foreground uppercase tracking-wide">
                    {categoryLabels[category]}
                  </div>
                  {cmds.map((cmd) => {
                    const itemIndex = globalIndex++
                    return (
                      <button
                        key={cmd.id}
                        data-index={itemIndex}
                        onClick={() => onSelect(cmd)}
                        className={cn(
                          "flex items-center gap-3 w-full px-2 py-2 rounded-md text-left transition-colors",
                          itemIndex === selectedIndex
                            ? "bg-accent text-accent-foreground"
                            : "hover:bg-accent/50"
                        )}
                      >
                        <div className="h-8 w-8 rounded-md bg-muted flex items-center justify-center shrink-0">
                          <cmd.icon className="h-4 w-4" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="font-mono text-sm text-primary">{cmd.command}</span>
                            <span className="text-sm font-medium">{cmd.label}</span>
                          </div>
                          <p className="text-xs text-muted-foreground truncate">
                            {cmd.description}
                          </p>
                        </div>
                      </button>
                    )
                  })}
                </div>
              )
            }
          )}
        </div>
      </ScrollArea>
    </div>
  )
}

export default SlashCommands
