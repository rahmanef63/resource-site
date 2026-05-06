/**
 * Built-in Item Variants
 *
 * Pre-defined variants for common use cases:
 * - chat: Chat conversations
 * - call: Voice/video calls
 * - doc: Documents/files
 * - menu: Menu/tree items with actions
 * - status: Status/stories
 * - list: Generic list item (fallback)
 *
 * @author SuperSpace Team
 * @version 1.0.0
 */

import { z } from "zod";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MoreVertical, Phone, Video, FileText, Folder, File } from "lucide-react";
import { cn } from "@/lib/utils";
import { createVariant, itemVariantRegistry } from "./variant-registry";

/**
 * CHAT VARIANT
 * For chat conversations with last message preview
 */
const ChatParams = z.object({
  summary: z.string().optional(),
  lastMessage: z.string().optional(),
  lastAt: z.string(), // ISO datetime
  avatarUrl: z.string().optional(),
  ai: z.boolean().optional(),
  unread: z.number().optional(),
  online: z.boolean().optional(),
});

export const chatVariant = createVariant({
  id: "chat",
  title: "Chat Conversation",
  description: "Chat conversation with message preview and status",
  paramsSchema: ChatParams,
  render: ({ item, onAction, utils, slots }) => {
    const params = item.params;
    return (
      <button
        className={cn(
          "w-full flex items-center gap-3 px-3 py-2.5 text-left transition-colors",
          "hover:bg-muted/50 rounded-md",
          item.active && "bg-muted"
        )}
        onClick={() => onAction?.(item.id, "select")}
        disabled={item.disabled}
      >
        {slots?.leading}
        <div className="relative">
          <Image
            src={params.avatarUrl ?? item.avatarUrl ?? "/default-avatar.png"}
            alt=""
            width={40}
            height={40}
            className="size-10 rounded-full object-cover"
          />
          {params.online && (
            <span className="absolute bottom-0 right-0 size-3 rounded-full bg-green-500 ring-2 ring-background" />
          )}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium truncate">{item.label}</span>
            {params.ai && <Badge variant="secondary" className="text-[10px] px-1">AI</Badge>}
          </div>
          <p className="text-xs text-muted-foreground truncate">
            {params.summary ?? params.lastMessage}
          </p>
        </div>
        <div className="flex flex-col items-end gap-1 shrink-0">
          <time className="text-[11px] text-muted-foreground">
            {utils.formatTime(params.lastAt)}
          </time>
          {params.unread ? (
            <Badge variant="default" className="size-5 p-0 text-[10px] flex items-center justify-center">
              {params.unread}
            </Badge>
          ) : null}
        </div>
        {slots?.trailing}
      </button>
    );
  },
});

/**
 * CALL VARIANT
 * For voice/video calls with status
 */
const CallParams = z.object({
  direction: z.enum(["in", "out", "missed"]),
  medium: z.enum(["voice", "video"]),
  group: z.boolean().optional(),
  ongoing: z.boolean().optional(),
  duration: z.string().optional(),
  timestamp: z.string(),
  avatarUrl: z.string().optional(),
});

export const callVariant = createVariant({
  id: "call",
  title: "Call Item",
  description: "Voice or video call with status and actions",
  paramsSchema: CallParams,
  render: ({ item, onAction, utils }) => {
    const params = item.params;
    
    // Helper to get initials from name
    const getInitials = (name?: string) => {
      if (!name) return "?";
      return name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2);
    };

    // Determine call icon
    const CallIcon = params.medium === "video" ? Video : Phone;
    const isMissed = params.direction === "missed";

    return (
      <button
        className={cn(
          "w-full flex items-center gap-3 px-3 py-2.5 rounded-md hover:bg-muted/50 transition-colors text-left",
          item.active && "bg-muted"
        )}
        onClick={() => onAction?.(item.id, "select")}
      >
        {/* Avatar with initials */}
        <Avatar className="size-12">
          {params.avatarUrl && <AvatarImage src={params.avatarUrl} alt={item.label || "User"} />}
          <AvatarFallback className="bg-muted text-muted-foreground">
            {getInitials(item.label)}
          </AvatarFallback>
        </Avatar>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="text-sm font-medium truncate">{item.label}</div>
          <div className="flex items-center gap-1 text-xs text-muted-foreground">
            <CallIcon className={cn("size-3.5", isMissed && "text-destructive")} />
            <span className={isMissed ? "text-destructive" : ""}>
              {params.direction === "in" && "Incoming"}
              {params.direction === "out" && "Outgoing"}
              {params.direction === "missed" && "Missed"}
            </span>
            {params.duration && <span>({params.duration})</span>}
          </div>
        </div>

        {/* Timestamp */}
        <time className="text-xs text-muted-foreground shrink-0">
          {utils.formatTime(params.timestamp)}
        </time>

        {params.ongoing && (
          <Button
            size="sm"
            variant="default"
            className="h-7 text-xs"
            onClick={(e) => {
              e.stopPropagation();
              onAction?.(item.id, "joinCall");
            }}
          >
            Join
          </Button>
        )}
      </button>
    );
  },
});

/**
 * DOC VARIANT
 * For documents and files
 */
const DocParams = z.object({
  iconId: z.string().optional(),
  lastSeen: z.string().optional(),
  lastModified: z.string().optional(),
  size: z.string().optional(),
  type: z.string().optional(),
});

export const docVariant = createVariant({
  id: "doc",
  title: "Document Item",
  description: "Document or file with metadata",
  paramsSchema: DocParams,
  render: ({ item, onAction }) => {
    const params = item.params;
    return (
      <div className={cn(
        "w-full flex items-center gap-3 px-3 py-2 rounded-md hover:bg-muted/50 transition-colors",
        item.active && "bg-muted"
      )}>
        <div className="flex items-center justify-center size-8 shrink-0">
          {params.iconId === "folder" ? (
            <Folder className="size-5 text-blue-500" />
          ) : (
            <FileText className="size-5 text-muted-foreground" />
          )}
        </div>
        <div className="flex-1 min-w-0">
          <div className="text-sm font-medium truncate">{item.label}</div>
          {(params.lastSeen || params.lastModified || params.size) && (
            <div className="text-xs text-muted-foreground">
              {params.lastSeen && `Seen ${params.lastSeen}`}
              {params.lastModified && `Edited ${params.lastModified}`}
              {params.size && ` • ${params.size}`}
            </div>
          )}
        </div>
        <Button
          variant="ghost"
          size="icon"
          className="size-6 shrink-0"
          onClick={(e) => {
            e.stopPropagation();
            onAction?.(item.id, "more");
          }}
        >
          <MoreVertical className="size-4" />
        </Button>
      </div>
    );
  },
});

/**
 * MENU VARIANT
 * For menu/tree items with kebab actions
 */
const MenuParams = z.object({
  isFolder: z.boolean().optional(),
  depth: z.number().default(0),
  hidden: z.boolean().optional(),
  childCount: z.number().optional(),
});

export const menuVariant = createVariant({
  id: "menu",
  title: "Menu/Tree Item",
  description: "Menu or tree item with drag-and-drop and actions",
  paramsSchema: MenuParams,
  render: ({ item, onAction }) => {
    const params = item.params;
    return (
      <div
        style={{ paddingLeft: params.depth * 16 }}
        className={cn(
          "w-full flex items-center gap-2 px-3 py-1.5 group hover:bg-muted/50 rounded-md transition-colors",
          params.hidden && "opacity-50",
          item.active && "bg-muted"
        )}
      >
        <div className="flex items-center gap-2 flex-1 min-w-0">
          {params.isFolder ? (
            <Folder className="size-4 shrink-0 text-blue-500" />
          ) : (
            <File className="size-4 shrink-0 text-muted-foreground" />
          )}
          <span className="text-sm truncate">{item.label}</span>
          {params.childCount !== undefined && params.childCount > 0 && (
            <Badge variant="secondary" className="text-[10px] px-1 h-4">
              {params.childCount}
            </Badge>
          )}
        </div>
        <div className="opacity-0 group-hover:opacity-100 flex items-center gap-1 shrink-0 transition-opacity">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="size-6">
                <MoreVertical className="size-3.5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => onAction?.(item.id, "rename")}>
                Rename
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onAction?.(item.id, "copyId")}>
                Copy ID
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onAction?.(item.id, "duplicate")}>
                Duplicate
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onAction?.(item.id, "hide")}>
                {params.hidden ? "Show" : "Hide"}
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => onAction?.(item.id, "delete")}
                className="text-destructive"
              >
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    );
  },
});

/**
 * STATUS VARIANT
 * For status updates/stories
 */
const StatusParams = z.object({
  createdAt: z.string(),
  tags: z.array(z.string()).optional(),
  seen: z.boolean().optional(),
  imageUrl: z.string().optional(),
});

export const statusVariant = createVariant({
  id: "status",
  title: "Status/Story Item",
  description: "Status update or story with preview",
  paramsSchema: StatusParams,
  render: ({ item, utils }) => {
    const params = item.params;
    return (
      <div className="w-full flex items-center gap-3 px-3 py-2.5 hover:bg-muted/50 rounded-md transition-colors">
        <div className={cn(
          "relative size-12 rounded-full",
          !params.seen && "ring-2 ring-primary"
        )}>
          <Image
            src={params.imageUrl ?? item.avatarUrl ?? "/default-avatar.png"}
            alt=""
            width={48}
            height={48}
            className="size-12 rounded-full object-cover"
          />
        </div>
        <div className="flex-1 min-w-0">
          <div className="text-sm font-medium truncate">{item.label}</div>
          <div className="text-xs text-muted-foreground">
            {utils.formatTime(params.createdAt)}
          </div>
        </div>
        {params.tags && params.tags.length > 0 && (
          <div className="flex gap-1 shrink-0">
            {params.tags.slice(0, 2).map((tag: string) => (
              <Badge key={tag} variant="secondary" className="text-[10px] px-1.5 h-5">
                {tag}
              </Badge>
            ))}
          </div>
        )}
      </div>
    );
  },
});

/**
 * LIST VARIANT (Generic fallback)
 * Simple list item with icon and label
 */
const ListParams = z.object({
  description: z.string().optional(),
  badge: z.string().optional(),
  timestamp: z.string().optional(),
});

export const listVariant = createVariant({
  id: "list",
  title: "Generic List Item",
  description: "Simple list item with icon and label",
  paramsSchema: ListParams,
  render: ({ item, utils, slots }) => {
    const Icon = typeof item.icon === "function" ? item.icon : null;
    const params = item.params;

    return (
      <button
        className={cn(
          "w-full flex items-center gap-3 px-3 py-2 text-left rounded-md transition-colors",
          "hover:bg-muted/50",
          item.active && "bg-muted"
        )}
        disabled={item.disabled}
      >
        {slots?.leading}
        {Icon && <Icon className="size-4 shrink-0 text-muted-foreground" />}
        <div className="flex-1 min-w-0">
          <div className="text-sm font-medium truncate">{item.label}</div>
          {params.description && (
            <div className="text-xs text-muted-foreground truncate">
              {params.description}
            </div>
          )}
        </div>
        {params.badge && (
          <Badge variant="secondary" className="text-xs shrink-0">
            {params.badge}
          </Badge>
        )}
        {params.timestamp && (
          <time className="text-[11px] text-muted-foreground shrink-0">
            {utils.formatTime(params.timestamp)}
          </time>
        )}
        {slots?.trailing}
      </button>
    );
  },
});

/**
 * Register all built-in variants
 */
export function registerBuiltInVariants() {
  itemVariantRegistry.register(chatVariant);
  itemVariantRegistry.register(callVariant);
  itemVariantRegistry.register(docVariant);
  itemVariantRegistry.register(menuVariant);
  itemVariantRegistry.register(statusVariant);
  itemVariantRegistry.register(listVariant);
}

// Auto-register on import
registerBuiltInVariants();
