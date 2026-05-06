/**
 * Shared Context Menu for Conversations
 * Used by Chat, AI, and other conversation-like features
 * @module shared/communications/conversation
 * 
 * @example
 * // Basic usage with any React element as children
 * <ConversationContextMenu
 *   item={item}
 *   context="ai"
 *   onPin={(id, isPinned) => handlePin(id, isPinned)}
 *   onDelete={(id) => handleDelete(id)}
 * >
 *   <YourCardComponent />
 * </ConversationContextMenu>
 * 
 * @example
 * // With custom actions
 * <ConversationContextMenu
 *   item={item}
 *   customActions={[
 *     { id: 'custom', label: 'Custom Action', icon: Star, onClick: handleCustom }
 *   ]}
 * >
 *   <div>...</div>
 * </ConversationContextMenu>
 */

"use client"

import * as React from "react"
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuSeparator,
  ContextMenuTrigger,
} from "@/components/ui/context-menu"
import {
  Pin,
  PinOff,
  Bell,
  BellOff,
  Archive,
  ArchiveRestore,
  Trash2,
  Edit,
  LogOut,
  Star,
  StarOff,
  Copy,
  Share2,
  Download,
} from "lucide-react"
import type { 
  ConversationItem, 
  ConversationContext,
  ConversationCallbacks,
  ConversationLabels,
  CustomAction,
} from "./types"
import { getLabels } from "./types"

export interface ConversationContextMenuProps<T extends ConversationItem = ConversationItem> 
  extends ConversationCallbacks<T> {
  /** The conversation item */
  item: T
  /** The trigger element (wrapped in ContextMenuTrigger) */
  children: React.ReactNode
  /** Context for label customization */
  context?: ConversationContext
  /** Custom labels override */
  labels?: Partial<ConversationLabels>
  /** Custom actions to add */
  customActions?: CustomAction[]
  /** Whether to show the "leave" action (typically for multi-user chats) */
  showLeave?: boolean
  /** Whether this is a group/multi-participant conversation */
  isGroup?: boolean
}

export function ConversationContextMenu<T extends ConversationItem = ConversationItem>({
  item,
  children,
  context = 'chat',
  labels: customLabels,
  customActions,
  showLeave = false,
  isGroup = false,
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
}: ConversationContextMenuProps<T>) {
  const labels = getLabels(context, customLabels)
  
  // Use onRename as fallback for onEdit if both are not provided
  const handleEdit = onEdit || onRename
  
  const hasTopSection = handleEdit
  const hasMiddleSection = onPin || onFavorite || onMute
  const hasBottomSection = onArchive
  const hasDestructiveSection = (showLeave && onLeave) || onDelete
  const hasExtraActions = onDuplicate || onExport || onShare || (customActions && customActions.length > 0)

  return (
    <ContextMenu>
      <ContextMenuTrigger className="block">
        {children}
      </ContextMenuTrigger>
      <ContextMenuContent className="w-56">
        {/* Edit/Rename */}
        {handleEdit && (
          <>
            <ContextMenuItem onClick={() => handleEdit(item)}>
              <Edit className="mr-2 h-4 w-4" />
              {labels.editLabel || `Edit ${labels.itemType}`}
            </ContextMenuItem>
            {(hasMiddleSection || hasBottomSection || hasDestructiveSection || hasExtraActions) && (
              <ContextMenuSeparator />
            )}
          </>
        )}

        {/* Pin/Favorite/Mute Section */}
        {onPin && (
          <ContextMenuItem onClick={() => onPin(item.id, !item.isPinned)}>
            {item.isPinned ? (
              <>
                <PinOff className="mr-2 h-4 w-4" />
                {labels.unpinLabel || `Unpin ${labels.itemType}`}
              </>
            ) : (
              <>
                <Pin className="mr-2 h-4 w-4" />
                {labels.pinLabel || `Pin ${labels.itemType}`}
              </>
            )}
          </ContextMenuItem>
        )}

        {onFavorite && (
          <ContextMenuItem onClick={() => onFavorite(item.id, !item.isFavorite)}>
            {item.isFavorite ? (
              <>
                <StarOff className="mr-2 h-4 w-4" />
                {labels.unfavoriteLabel || 'Remove from Favorites'}
              </>
            ) : (
              <>
                <Star className="mr-2 h-4 w-4" />
                {labels.favoriteLabel || 'Add to Favorites'}
              </>
            )}
          </ContextMenuItem>
        )}

        {onMute && (
          <ContextMenuItem onClick={() => onMute(item.id, !item.isMuted)}>
            {item.isMuted ? (
              <>
                <Bell className="mr-2 h-4 w-4" />
                {labels.unmuteLabel || 'Unmute Notifications'}
              </>
            ) : (
              <>
                <BellOff className="mr-2 h-4 w-4" />
                {labels.muteLabel || 'Mute Notifications'}
              </>
            )}
          </ContextMenuItem>
        )}

        {hasMiddleSection && (hasBottomSection || hasDestructiveSection || hasExtraActions) && (
          <ContextMenuSeparator />
        )}

        {/* Archive Section */}
        {onArchive && (
          <>
            <ContextMenuItem onClick={() => onArchive(item.id, !item.isArchived)}>
              {item.isArchived ? (
                <>
                  <ArchiveRestore className="mr-2 h-4 w-4" />
                  {labels.unarchiveLabel || `Unarchive ${labels.itemType}`}
                </>
              ) : (
                <>
                  <Archive className="mr-2 h-4 w-4" />
                  {labels.archiveLabel || `Archive ${labels.itemType}`}
                </>
              )}
            </ContextMenuItem>
            {(hasDestructiveSection || hasExtraActions) && <ContextMenuSeparator />}
          </>
        )}

        {/* Extra Actions (Duplicate, Export, Share) */}
        {onDuplicate && (
          <ContextMenuItem onClick={() => onDuplicate(item)}>
            <Copy className="mr-2 h-4 w-4" />
            Duplicate
          </ContextMenuItem>
        )}

        {onExport && (
          <ContextMenuItem onClick={() => onExport(item)}>
            <Download className="mr-2 h-4 w-4" />
            Export
          </ContextMenuItem>
        )}

        {onShare && (
          <ContextMenuItem onClick={() => onShare(item)}>
            <Share2 className="mr-2 h-4 w-4" />
            Share
          </ContextMenuItem>
        )}

        {/* Custom Actions */}
        {customActions?.map((action) => (
          <ContextMenuItem
            key={action.id}
            onClick={() => action.onClick(item)}
            className={
              action.variant === 'destructive' 
                ? 'text-destructive focus:text-destructive'
                : action.variant === 'warning'
                ? 'text-orange-600 focus:text-orange-600'
                : undefined
            }
          >
            {action.icon && <action.icon className="mr-2 h-4 w-4" />}
            {action.label}
          </ContextMenuItem>
        ))}

        {hasExtraActions && hasDestructiveSection && <ContextMenuSeparator />}

        {/* Destructive Section */}
        {showLeave && onLeave && (
          <ContextMenuItem 
            onClick={() => onLeave(item.id)}
            className="text-orange-600 focus:text-orange-600"
          >
            <LogOut className="mr-2 h-4 w-4" />
            {labels.leaveLabel || 'Leave Conversation'}
          </ContextMenuItem>
        )}

        {onDelete && (
          <ContextMenuItem 
            onClick={() => onDelete(item.id)}
            className="text-destructive focus:text-destructive"
          >
            <Trash2 className="mr-2 h-4 w-4" />
            {labels.deleteLabel || `Delete ${labels.itemType}`}
          </ContextMenuItem>
        )}
      </ContextMenuContent>
    </ContextMenu>
  )
}

export default ConversationContextMenu
