import type { Id } from "@convex/_generated/dataModel"

export interface MenuItem {
    _id: Id<"menuItems">
    name: string
    slug: string
    type: "folder" | "route" | "divider" | "action" | "chat" | "document" | string
    icon?: string | null
    path?: string | null
    metadata?: Record<string, any>
}
