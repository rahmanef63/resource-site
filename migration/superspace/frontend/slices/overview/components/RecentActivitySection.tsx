/**
 * Recent Activity Section
 * 
 * Displays recent activity items in a card layout.
 */

"use client"

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Badge } from "@/components/ui/badge"
import { 
  Activity, 
  FileText, 
  MessageSquare, 
  CheckCircle2,
  UserPlus,
  Settings,
  type LucideIcon 
} from "lucide-react"
import { cn } from "@/lib/utils"
import { formatDistanceToNow } from "date-fns"

// ============================================================================
// Types
// ============================================================================

export type ActivityType = 
  | "document"
  | "task"
  | "message"
  | "member"
  | "settings"
  | "general"

export interface ActivityItem {
  id: string
  type: ActivityType
  title: string
  description?: string
  timestamp: number | Date
  user?: {
    name: string
    avatar?: string
  }
  badge?: {
    label: string
    variant?: "default" | "secondary" | "destructive" | "outline"
  }
}

export interface RecentActivitySectionProps {
  /** Activity items to display */
  activities: ActivityItem[]
  /** Max height for scroll area */
  maxHeight?: string
  /** Show empty state */
  emptyMessage?: string
  /** Loading state */
  loading?: boolean
  /** Additional className */
  className?: string
}

// ============================================================================
// Activity Icons
// ============================================================================

const activityIcons: Record<ActivityType, LucideIcon> = {
  document: FileText,
  task: CheckCircle2,
  message: MessageSquare,
  member: UserPlus,
  settings: Settings,
  general: Activity,
}

const activityColors: Record<ActivityType, string> = {
  document: "bg-purple-100 text-purple-600 dark:bg-purple-900/20",
  task: "bg-green-100 text-green-600 dark:bg-green-900/20",
  message: "bg-blue-100 text-blue-600 dark:bg-blue-900/20",
  member: "bg-orange-100 text-orange-600 dark:bg-orange-900/20",
  settings: "bg-gray-100 text-gray-600 dark:bg-gray-900/20",
  general: "bg-primary/10 text-primary",
}

// ============================================================================
// Activity Item
// ============================================================================

function ActivityItemRow({ item }: { item: ActivityItem }) {
  const Icon = activityIcons[item.type]
  const colorClass = activityColors[item.type]
  
  const timeAgo = formatDistanceToNow(
    typeof item.timestamp === 'number' ? item.timestamp : item.timestamp,
    { addSuffix: true }
  )

  return (
    <div className="flex items-start gap-3 p-3 rounded-lg hover:bg-muted/50 transition-colors">
      <div className={cn("p-2 rounded-lg shrink-0", colorClass)}>
        <Icon className="h-4 w-4" />
      </div>
      
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <p className="text-sm font-medium truncate">{item.title}</p>
          {item.badge && (
            <Badge variant={item.badge.variant ?? "secondary"} className="text-xs">
              {item.badge.label}
            </Badge>
          )}
        </div>
        
        {item.description && (
          <p className="text-xs text-muted-foreground truncate">{item.description}</p>
        )}
        
        <div className="flex items-center gap-2 mt-1">
          {item.user && (
            <span className="text-xs text-muted-foreground">{item.user.name}</span>
          )}
          <span className="text-xs text-muted-foreground">{timeAgo}</span>
        </div>
      </div>
    </div>
  )
}

// ============================================================================
// Recent Activity Section
// ============================================================================

export function RecentActivitySection({
  activities,
  maxHeight = "400px",
  emptyMessage = "No recent activity",
  loading = false,
  className,
}: RecentActivitySectionProps) {
  return (
    <Card className={className}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-lg">Recent Activity</CardTitle>
            <CardDescription>Latest updates across your workspace</CardDescription>
          </div>
          <Activity className="h-5 w-5 text-muted-foreground" />
        </div>
      </CardHeader>
      
      <CardContent className="p-0">
        {loading ? (
          <div className="p-4 space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex items-start gap-3">
                <div className="h-8 w-8 bg-muted animate-pulse rounded-lg" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 w-3/4 bg-muted animate-pulse rounded" />
                  <div className="h-3 w-1/2 bg-muted animate-pulse rounded" />
                </div>
              </div>
            ))}
          </div>
        ) : activities.length > 0 ? (
          <ScrollArea style={{ maxHeight }} className="px-4 pb-4">
            <div className="space-y-1">
              {activities.map((activity) => (
                <ActivityItemRow key={activity.id} item={activity} />
              ))}
            </div>
          </ScrollArea>
        ) : (
          <div className="p-8 text-center">
            <Activity className="h-8 w-8 text-muted-foreground/50 mx-auto mb-2" />
            <p className="text-sm text-muted-foreground">{emptyMessage}</p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
