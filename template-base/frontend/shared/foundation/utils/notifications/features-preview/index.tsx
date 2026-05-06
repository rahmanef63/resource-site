/**
 * Notifications Feature Preview
 * 
 * Mock preview showing notifications center interface
 */

"use client"

import * as React from 'react'
import { Bell, Check, CheckCheck, Settings, MessageSquare, FileText, UserPlus, AlertTriangle, AtSign, Calendar, Trash2 } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { defineFeaturePreview } from '@/frontend/shared/preview'
import type { FeaturePreviewProps } from '@/frontend/shared/preview'

interface Notification {
  id: string
  type: 'message' | 'document' | 'mention' | 'invite' | 'alert' | 'event'
  title: string
  description: string
  time: string
  read: boolean
  avatar?: string
}

interface NotificationsMockData {
  notifications: Notification[]
  unreadCount: number
  categories: {
    all: number
    mentions: number
    updates: number
  }
}

const typeIcons: Record<string, React.ReactNode> = {
  message: <MessageSquare className="h-4 w-4 text-blue-500" />,
  document: <FileText className="h-4 w-4 text-green-500" />,
  mention: <AtSign className="h-4 w-4 text-purple-500" />,
  invite: <UserPlus className="h-4 w-4 text-orange-500" />,
  alert: <AlertTriangle className="h-4 w-4 text-red-500" />,
  event: <Calendar className="h-4 w-4 text-cyan-500" />,
}

function NotificationsPreview({ mockData, compact, interactive }: FeaturePreviewProps) {
  const data = mockData.data as unknown as NotificationsMockData
  const [selectedTab, setSelectedTab] = React.useState('all')

  if (compact) {
    return (
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium">Notifications</span>
          {data.unreadCount > 0 && (
            <Badge variant="destructive" className="h-5 px-1.5">{data.unreadCount}</Badge>
          )}
        </div>
        {data.notifications.filter(n => !n.read).slice(0, 2).map((notif) => (
          <div key={notif.id} className="flex items-start gap-2 p-2 bg-muted/50 rounded-md">
            {typeIcons[notif.type]}
            <div className="flex-1 min-w-0">
              <p className="text-xs font-medium truncate">{notif.title}</p>
              <p className="text-[10px] text-muted-foreground">{notif.time}</p>
            </div>
          </div>
        ))}
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Bell className="h-5 w-5" />
          <h3 className="font-semibold">Notifications</h3>
          {data.unreadCount > 0 && (
            <Badge variant="destructive" className="h-5 px-1.5">{data.unreadCount} new</Badge>
          )}
        </div>
        <div className="flex gap-1">
          <Button variant="ghost" size="sm" className="h-8 text-xs gap-1" disabled={!interactive}>
            <CheckCheck className="h-3 w-3" />
            Mark all read
          </Button>
          <Button variant="ghost" size="icon" className="h-8 w-8" disabled={!interactive}>
            <Settings className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Tabs */}
      <Tabs value={selectedTab} onValueChange={setSelectedTab} className="w-full">
        <TabsList className="flex w-full justify-evenly">
          <TabsTrigger value="all" className="flex-1 gap-1">
            All
            <Badge variant="secondary" className="h-4 px-1 text-[10px]">{data.categories.all}</Badge>
          </TabsTrigger>
          <TabsTrigger value="mentions" className="flex-1 gap-1">
            Mentions
            <Badge variant="secondary" className="h-4 px-1 text-[10px]">{data.categories.mentions}</Badge>
          </TabsTrigger>
          <TabsTrigger value="updates" className="flex-1 gap-1">
            Updates
            <Badge variant="secondary" className="h-4 px-1 text-[10px]">{data.categories.updates}</Badge>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="mt-3">
          <Card>
            <ScrollArea className="h-[280px]">
              <div className="divide-y">
                {data.notifications.map((notif) => (
                  <div 
                    key={notif.id} 
                    className={cn(
                      "flex items-start gap-3 p-3 hover:bg-muted/50 transition-colors group",
                      !notif.read && "bg-primary/5"
                    )}
                  >
                    <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center flex-shrink-0">
                      {typeIcons[notif.type]}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <p className={cn(
                          "text-sm",
                          !notif.read && "font-medium"
                        )}>{notif.title}</p>
                        {!notif.read && (
                          <span className="w-2 h-2 rounded-full bg-primary flex-shrink-0 mt-1.5" />
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground mt-0.5">{notif.description}</p>
                      <p className="text-[10px] text-muted-foreground mt-1">{notif.time}</p>
                    </div>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                      disabled={!interactive}
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </Card>
        </TabsContent>

        <TabsContent value="mentions" className="mt-3">
          <Card>
            <CardContent className="p-8 text-center text-muted-foreground">
              <AtSign className="h-8 w-8 mx-auto mb-2 opacity-50" />
              <p className="text-sm">Filter applied: Mentions only</p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="updates" className="mt-3">
          <Card>
            <CardContent className="p-8 text-center text-muted-foreground">
              <Bell className="h-8 w-8 mx-auto mb-2 opacity-50" />
              <p className="text-sm">Filter applied: Updates only</p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

// Register the preview
export default defineFeaturePreview({
  featureId: 'notifications',
  name: 'Notifications',
  description: 'Notification center and preferences',
  component: NotificationsPreview,
  category: 'communication',
  tags: ['notifications', 'alerts', 'mentions', 'updates'],
  mockDataSets: [
    {
      id: 'default',
      name: 'Notifications',
      description: 'Recent notifications',
      data: {
        unreadCount: 5,
        categories: { all: 12, mentions: 3, updates: 6 },
        notifications: [
          { id: '1', type: 'mention', title: '@alice mentioned you', description: 'Check out this document I shared...', time: '2 min ago', read: false },
          { id: '2', type: 'message', title: 'New message in #general', description: 'Team standup starting in 5 minutes', time: '10 min ago', read: false },
          { id: '3', type: 'document', title: 'Document shared with you', description: 'Q4 Report.pdf was shared by Bob', time: '1h ago', read: false },
          { id: '4', type: 'invite', title: 'New team member joined', description: 'Charlie accepted your invitation', time: '2h ago', read: true },
          { id: '5', type: 'alert', title: 'Storage almost full', description: 'You have used 90% of your storage', time: '5h ago', read: true },
          { id: '6', type: 'event', title: 'Event reminder', description: 'Sprint Planning starts in 30 minutes', time: '1d ago', read: true },
        ],
      },
    },
  ],
})
