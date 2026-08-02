/**
 * Starred Feature Preview
 * 
 * Mock preview showing starred/favorite items
 */

"use client"

import * as React from 'react'
import { Star, FileText, MessageSquare, Users, FolderOpen, Search, Filter } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { defineFeaturePreview } from '@/frontend/shared/preview'
import type { FeaturePreviewProps } from '@/frontend/shared/preview'

interface StarredItem {
  id: string
  name: string
  type: 'document' | 'channel' | 'workspace' | 'folder'
  starredAt: string
  lastAccessed: string
}

interface StarredMockData {
  items: StarredItem[]
  stats: {
    total: number
    documents: number
    channels: number
    workspaces: number
  }
}

const typeIcons: Record<string, React.ReactNode> = {
  document: <FileText className="h-4 w-4 text-blue-500" />,
  channel: <MessageSquare className="h-4 w-4 text-green-500" />,
  workspace: <Users className="h-4 w-4 text-purple-500" />,
  folder: <FolderOpen className="h-4 w-4 text-yellow-500" />,
}

function StarredPreview({ mockData, compact, interactive }: FeaturePreviewProps) {
  const data = mockData.data as unknown as StarredMockData
  const [filter, setFilter] = React.useState<string>('all')

  const filteredItems = filter === 'all' 
    ? data.items 
    : data.items.filter(item => item.type === filter)

  if (compact) {
    return (
      <div className="space-y-2">
        {data.items.slice(0, 3).map((item) => (
          <div key={item.id} className="flex items-center gap-2 p-2 bg-muted/50 rounded-md">
            <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />
            {typeIcons[item.type]}
            <span className="text-sm truncate flex-1">{item.name}</span>
          </div>
        ))}
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Stats */}
      <div className="grid grid-cols-4 gap-2">
        <Card className="bg-yellow-500/10">
          <CardContent className="p-3 text-center">
            <Star className="h-4 w-4 mx-auto text-yellow-500 fill-yellow-500 mb-1" />
            <div className="text-lg font-bold">{data.stats.total}</div>
            <div className="text-[10px] text-muted-foreground">Total</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-3 text-center">
            <FileText className="h-4 w-4 mx-auto text-blue-500 mb-1" />
            <div className="text-lg font-bold">{data.stats.documents}</div>
            <div className="text-[10px] text-muted-foreground">Docs</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-3 text-center">
            <MessageSquare className="h-4 w-4 mx-auto text-green-500 mb-1" />
            <div className="text-lg font-bold">{data.stats.channels}</div>
            <div className="text-[10px] text-muted-foreground">Channels</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-3 text-center">
            <Users className="h-4 w-4 mx-auto text-purple-500 mb-1" />
            <div className="text-lg font-bold">{data.stats.workspaces}</div>
            <div className="text-[10px] text-muted-foreground">Workspaces</div>
          </CardContent>
        </Card>
      </div>

      {/* Search & Filter */}
      <div className="flex items-center gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Search starred..." className="pl-9 h-9" disabled={!interactive} />
        </div>
      </div>

      {/* Tabs */}
      <Tabs value={filter} onValueChange={setFilter}>
        <TabsList className="flex w-full justify-evenly">
          <TabsTrigger value="all" className="text-xs">All</TabsTrigger>
          <TabsTrigger value="document" className="text-xs">Docs</TabsTrigger>
          <TabsTrigger value="channel" className="text-xs">Channels</TabsTrigger>
          <TabsTrigger value="workspace" className="text-xs">Workspaces</TabsTrigger>
        </TabsList>
      </Tabs>

      {/* Items */}
      <Card>
        <ScrollArea className="h-[220px]">
          <div className="divide-y">
            {filteredItems.map((item) => (
              <div key={item.id} className="flex items-center gap-3 p-3 hover:bg-muted/50 transition-colors cursor-pointer">
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="h-8 w-8 flex-shrink-0"
                  disabled={!interactive}
                >
                  <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />
                </Button>
                <div className="w-8 h-8 rounded-md bg-muted flex items-center justify-center flex-shrink-0">
                  {typeIcons[item.type]}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm truncate">{item.name}</p>
                  <p className="text-xs text-muted-foreground">
                    Starred {item.starredAt} • Accessed {item.lastAccessed}
                  </p>
                </div>
                <Badge variant="secondary" className="text-xs capitalize">
                  {item.type}
                </Badge>
              </div>
            ))}
          </div>
        </ScrollArea>
      </Card>
    </div>
  )
}

// Register the preview
export default defineFeaturePreview({
  featureId: 'starred',
  name: 'Starred',
  description: 'Quick access to favorite items',
  component: StarredPreview,
  category: 'productivity',
  tags: ['favorites', 'bookmarks', 'quick-access'],
  mockDataSets: [
    {
      id: 'default',
      name: 'My Starred',
      description: 'Collection of starred items',
      data: {
        stats: { total: 12, documents: 5, channels: 4, workspaces: 3 },
        items: [
          { id: '1', name: 'Project Roadmap', type: 'document', starredAt: '2d ago', lastAccessed: '1h ago' },
          { id: '2', name: '#engineering', type: 'channel', starredAt: '1w ago', lastAccessed: '30m ago' },
          { id: '3', name: 'Product Team', type: 'workspace', starredAt: '1mo ago', lastAccessed: '2h ago' },
          { id: '4', name: 'Design System Guide', type: 'document', starredAt: '3d ago', lastAccessed: '1d ago' },
          { id: '5', name: '#announcements', type: 'channel', starredAt: '2w ago', lastAccessed: '4h ago' },
          { id: '6', name: 'API Documentation', type: 'document', starredAt: '5d ago', lastAccessed: '2d ago' },
        ],
      },
    },
  ],
})
