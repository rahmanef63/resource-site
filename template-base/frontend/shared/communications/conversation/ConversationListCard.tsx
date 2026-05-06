/**
 * Shared List Card for Conversations
 * Used by Chat, AI, and other conversation-like features
 * @module shared/communications/conversation
 */

"use client"

import * as React from "react"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { cn } from "@/lib/utils"
import { truncate as truncateMessage } from "@/frontend/shared/foundation/utils/core/format"
import { 
  Pin, 
  BellOff, 
  Star, 
  Bot, 
  MessageSquare,
  Archive,
} from "lucide-react"
import type { ConversationItem, ConversationContext, ConversationCallbacks } from "./types"
import { ConversationContextMenu } from "./ConversationContextMenu"

// ============================================================================
// Utility Functions
// ============================================================================

function getInitials(name: string): string {
  return name
    .split(' ')
    .map(word => word[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)
}


// ============================================================================
// Types
// ============================================================================

export interface ConversationListCardProps<T extends ConversationItem = ConversationItem> 
  extends ConversationCallbacks<T> {
  /** The conversation item to display */
  item: T
  /** Whether this card is currently active/selected */
  isActive?: boolean
  /** Click handler for the card */
  onClick?: () => void
  /** Context for styling and labels */
  context?: ConversationContext
  /** Last message preview text */
  lastMessage?: string
  /** Whether to show in compact mode */
  compact?: boolean
  /** Whether this is a group conversation */
  isGroup?: boolean
  /** Whether to show context menu */
  showContextMenu?: boolean
  /** Whether to show the leave action in context menu */
  showLeaveAction?: boolean
  /** Custom icon to use instead of avatar */
  icon?: React.ReactNode
  /** Custom badge content */
  badge?: React.ReactNode
  /** Whether this is a global/private item */
  isGlobal?: boolean
  /** Additional className */
  className?: string
}

export function ConversationListCard<T extends ConversationItem = ConversationItem>({
  item,
  isActive = false,
  onClick,
  context = 'chat',
  lastMessage,
  compact = false,
  isGroup = false,
  showContextMenu = true,
  showLeaveAction = false,
  icon,
  badge,
  isGlobal = false,
  className,
  // CRUD callbacks
  onEdit,
  onRename,
  onPin,
  onFavorite,
  onMute,
  onArchive,
  onLeave,
  onDelete,
  onDuplicate,
  onExport,
  onShare,
}: ConversationListCardProps<T>) {
  
  // Determine if we have any callbacks for context menu
  const hasContextMenuActions = onEdit || onRename || onPin || onFavorite || 
    onMute || onArchive || onLeave || onDelete || onDuplicate || onExport || onShare

  // Build the card content
  const cardContent = compact ? (
    <CompactCard 
      item={item}
      isActive={isActive}
      onClick={onClick}
      context={context}
      icon={icon}
      className={className}
    />
  ) : (
    <FullCard
      item={item}
      isActive={isActive}
      onClick={onClick}
      context={context}
      lastMessage={lastMessage}
      icon={icon}
      badge={badge}
      isGlobal={isGlobal}
      isGroup={isGroup}
      className={className}
    />
  )

  // Wrap with context menu if enabled and has actions
  if (showContextMenu && hasContextMenuActions) {
    return (
      <ConversationContextMenu
        item={item}
        context={context}
        showLeave={showLeaveAction && isGroup}
        isGroup={isGroup}
        onEdit={onEdit}
        onRename={onRename}
        onPin={onPin}
        onFavorite={onFavorite}
        onMute={onMute}
        onArchive={onArchive}
        onLeave={onLeave}
        onDelete={onDelete}
        onDuplicate={onDuplicate}
        onExport={onExport}
        onShare={onShare}
      >
        {cardContent}
      </ConversationContextMenu>
    )
  }

  return cardContent
}

// ============================================================================
// Compact Card
// ============================================================================

interface CompactCardProps<T extends ConversationItem> {
  item: T
  isActive?: boolean
  onClick?: () => void
  context?: ConversationContext
  icon?: React.ReactNode
  className?: string
}

function CompactCard<T extends ConversationItem>({
  item,
  isActive,
  onClick,
  context,
  icon,
  className,
}: CompactCardProps<T>) {
  return (
    <div
      className={cn(
        "relative p-2 cursor-pointer rounded-lg transition-all duration-200",
        "hover:bg-accent",
        isActive && "bg-accent",
        className
      )}
      onClick={onClick}
      title={item.name}
    >
      {icon ? (
        <div className="h-10 w-10 mx-auto flex items-center justify-center">
          {icon}
        </div>
      ) : (
        <Avatar className="h-10 w-10 mx-auto">
          <AvatarImage src={item.avatar} />
          <AvatarFallback className="bg-primary/10 text-primary font-medium text-sm">
            {context === 'ai' ? <Bot className="h-5 w-5" /> : getInitials(item.name)}
          </AvatarFallback>
        </Avatar>
      )}
      
      {/* Unread Badge */}
      {item.unreadCount && item.unreadCount > 0 && (
        <Badge 
          className="absolute -top-1 -right-1 min-w-[18px] h-[18px] flex items-center justify-center rounded-full text-xs"
        >
          {item.unreadCount > 99 ? "99+" : item.unreadCount}
        </Badge>
      )}
      
      {/* Pin Indicator */}
      {item.isPinned && (
        <Pin className="absolute top-0 left-0 h-3 w-3 text-primary" />
      )}
    </div>
  )
}

// ============================================================================
// Full Card
// ============================================================================

interface FullCardProps<T extends ConversationItem> {
  item: T
  isActive?: boolean
  onClick?: () => void
  context?: ConversationContext
  lastMessage?: string
  icon?: React.ReactNode
  badge?: React.ReactNode
  isGlobal?: boolean
  isGroup?: boolean
  className?: string
}

function FullCard<T extends ConversationItem>({
  item,
  isActive,
  onClick,
  context = 'chat',
  lastMessage,
  icon,
  badge,
  isGlobal,
  isGroup,
  className,
}: FullCardProps<T>) {
  return (
    <Card
      className={cn(
        "p-3 cursor-pointer transition-all duration-200",
        "hover:shadow-md hover:border-primary/20",
        isActive 
          ? "bg-accent border-primary/30 shadow-sm" 
          : "bg-card hover:bg-muted/50",
        className
      )}
      onClick={onClick}
    >
      <div className="flex items-start gap-3">
        {/* Avatar/Icon */}
        {icon ? (
          <div className="h-12 w-12 rounded-full flex items-center justify-center flex-shrink-0 bg-gradient-to-br from-primary/80 to-primary">
            {icon}
          </div>
        ) : (
          <Avatar className="h-12 w-12 shrink-0">
            <AvatarImage src={item.avatar} />
            <AvatarFallback className={cn(
              "font-medium",
              context === 'ai' 
                ? "bg-gradient-to-br from-blue-600 to-purple-600 text-white"
                : "bg-primary/10 text-primary"
            )}>
              {context === 'ai' ? <Bot className="h-6 w-6" /> : getInitials(item.name)}
            </AvatarFallback>
          </Avatar>
        )}
        
        {/* Content */}
        <div className="flex-1 min-w-0 space-y-1">
          {/* Title Row */}
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-1 min-w-0">
              <h3 className="font-medium text-foreground truncate text-sm">
                {item.name}
              </h3>
              {/* Status Indicators */}
              {item.isPinned && <Pin className="h-3 w-3 text-muted-foreground flex-shrink-0" />}
              {item.isMuted && <BellOff className="h-3 w-3 text-muted-foreground flex-shrink-0" />}
              {item.isFavorite && <Star className="h-3 w-3 text-yellow-500 flex-shrink-0 fill-yellow-500" />}
            </div>
            <span className="text-xs text-muted-foreground flex-shrink-0">
              {item.timestamp}
            </span>
          </div>
          
          {/* Message Preview */}
          <p className="text-sm text-muted-foreground line-clamp-2 leading-relaxed">
            {truncateMessage(lastMessage || item.description || '', 50)}
          </p>
          
          {/* Footer: Tags and Badges */}
          <div className="flex items-center justify-between gap-2 pt-0.5">
            <div className="flex items-center gap-1 flex-wrap">
              {/* Archived Badge */}
              {item.isArchived && (
                <Badge variant="secondary" className="text-xs flex items-center gap-1">
                  <Archive className="h-3 w-3" />
                  Archived
                </Badge>
              )}
              
              {/* Global/Private Badge */}
              {isGlobal && (
                <Badge 
                  variant="outline" 
                  className="text-xs bg-purple-500/10 text-purple-500 border-purple-500/20"
                >
                  Private
                </Badge>
              )}
              
              {/* Group Badge */}
              {isGroup && context === 'chat' && (
                <Badge variant="outline" className="text-xs">
                  Group
                </Badge>
              )}
              
              {/* Custom Tags */}
              {item.tags?.slice(0, 2).map((tag) => (
                <Badge key={tag} variant="outline" className="text-[10px] px-1 py-0">
                  {tag}
                </Badge>
              ))}
            </div>
            
            {/* Right side badges */}
            <div className="flex items-center gap-1">
              {/* Custom Badge */}
              {badge}
              
              {/* Message Count */}
              {item.messageCount && item.messageCount > 0 && (
                <Badge 
                  variant="secondary" 
                  className="text-xs bg-primary/10 text-primary"
                >
                  {item.messageCount} msg{item.messageCount !== 1 ? 's' : ''}
                </Badge>
              )}
              
              {/* Unread Count */}
              {item.unreadCount && item.unreadCount > 0 && (
                <Badge className="min-w-[20px] h-5 flex items-center justify-center rounded-full">
                  {item.unreadCount > 99 ? "99+" : item.unreadCount}
                </Badge>
              )}
            </div>
          </div>
        </div>
      </div>
    </Card>
  )
}

export default ConversationListCard
