/**
 * CMS Lite Feature Preview
 * 
 * Uses the REAL CmsLitePage layout with secondary sidebar
 * showing content management sections
 */

"use client"

import * as React from 'react'
import { useState } from 'react'
import {
  LayoutDashboard,
  ShoppingCart,
  FileText,
  Briefcase,
  Settings,
  Home,
  Layers,
  Link2,
  Menu,
  Wrench,
  Bot,
  Globe,
  Users,
  Plus,
  Eye
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { ScrollArea } from '@/components/ui/scroll-area'
import { defineFeaturePreview } from '@/frontend/shared/preview'
import type { FeaturePreviewProps } from '@/frontend/shared/preview'

interface CmsLiteMockData {
  stats: { products: number; posts: number; pages: number; users: number }
  sections: Array<{ id: string; title: string; icon: string; count?: number }>
}

function CmsLitePreview({ mockData, compact, interactive }: FeaturePreviewProps) {
  const data = mockData.data as unknown as CmsLiteMockData
  const [activeSection, setActiveSection] = useState('dashboard')

  const getIcon = (id: string) => {
    const icons: Record<string, any> = {
      dashboard: LayoutDashboard,
      users: Users,
      products: ShoppingCart,
      posts: FileText,
      portfolio: Briefcase,
      services: Wrench,
      landing: Home,
      navigation: Menu,
      features: Layers,
      quicklinks: Link2,
      ai: Bot,
      settings: Settings,
    }
    return icons[id] || LayoutDashboard
  }

  if (compact) {
    return (
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Globe className="h-4 w-4 text-primary" />
            <span className="text-sm font-medium">CMS Lite</span>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-2">
          <div className="p-2 bg-muted/50 rounded-md text-center">
            <p className="text-lg font-bold">{data.stats.products}</p>
            <p className="text-[10px] text-muted-foreground">Products</p>
          </div>
          <div className="p-2 bg-muted/50 rounded-md text-center">
            <p className="text-lg font-bold">{data.stats.posts}</p>
            <p className="text-[10px] text-muted-foreground">Posts</p>
          </div>
        </div>
      </div>
    )
  }

  const sidebarItems = [
    { group: 'Main', items: ['dashboard', 'users'] },
    { group: 'Content', items: ['products', 'posts', 'portfolio', 'services'] },
    { group: 'Site', items: ['landing', 'navigation', 'features', 'quicklinks'] },
    { group: 'AI', items: ['ai'] },
    { group: 'Config', items: ['settings'] },
  ]

  return (
    <div className="flex h-full border rounded-xl overflow-hidden bg-background">
      {/* Sidebar */}
      <div className="w-56 border-r bg-muted/20 flex flex-col">
        <div className="p-4 border-b">
          <div className="flex items-center gap-2">
            <Globe className="h-5 w-5 text-primary" />
            <div>
              <h3 className="font-semibold text-sm">CMS Lite</h3>
              <p className="text-[10px] text-muted-foreground">Website Admin</p>
            </div>
          </div>
        </div>
        <ScrollArea className="flex-1">
          <div className="p-2 space-y-4">
            {sidebarItems.map((section) => (
              <div key={section.group}>
                <p className="px-3 py-1 text-xs font-semibold text-muted-foreground uppercase">{section.group}</p>
                <div className="space-y-0.5">
                  {section.items.map((item) => {
                    const Icon = getIcon(item)
                    return (
                      <button
                        key={item}
                        className={cn(
                          "w-full flex items-center gap-2 px-3 py-2 rounded-md text-sm transition-colors",
                          activeSection === item ? "bg-primary/10 text-primary" : "hover:bg-muted"
                        )}
                        onClick={() => interactive && setActiveSection(item)}
                        disabled={!interactive}
                      >
                        <Icon className="h-4 w-4" />
                        <span className="capitalize">{item.replace('-', ' ')}</span>
                      </button>
                    )
                  })}
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        <div className="p-4 border-b flex items-center justify-between">
          <div>
            <h2 className="font-semibold capitalize">{activeSection.replace('-', ' ')}</h2>
            <p className="text-xs text-muted-foreground">Manage your website content</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" className="gap-2" disabled={!interactive}>
              <Eye className="h-4 w-4" />
              Preview
            </Button>
            <Button size="sm" className="gap-2" disabled={!interactive}>
              <Plus className="h-4 w-4" />
              Add New
            </Button>
          </div>
        </div>

        <ScrollArea className="flex-1 p-4">
          {activeSection === 'dashboard' && (
            <div className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                {Object.entries(data.stats).map(([key, value]) => (
                  <Card key={key}>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm font-medium capitalize">{key}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">{value}</div>
                    </CardContent>
                  </Card>
                ))}
              </div>
              <Card>
                <CardHeader>
                  <CardTitle>Quick Actions</CardTitle>
                  <CardDescription>Common website operations</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                    <Button variant="outline" className="justify-start" disabled={!interactive}>
                      <ShoppingCart className="mr-2 h-4 w-4" />
                      Add Product
                    </Button>
                    <Button variant="outline" className="justify-start" disabled={!interactive}>
                      <FileText className="mr-2 h-4 w-4" />
                      New Post
                    </Button>
                    <Button variant="outline" className="justify-start" disabled={!interactive}>
                      <Bot className="mr-2 h-4 w-4" />
                      AI Settings
                    </Button>
                    <Button variant="outline" className="justify-start" disabled={!interactive}>
                      <Settings className="mr-2 h-4 w-4" />
                      Site Settings
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {activeSection !== 'dashboard' && (
            <div className="flex items-center justify-center h-64 text-muted-foreground">
              <div className="text-center">
                {React.createElement(getIcon(activeSection), { className: "h-12 w-12 mx-auto mb-3 opacity-50" })}
                <p className="font-medium capitalize">{activeSection.replace('-', ' ')} Management</p>
                <p className="text-sm">Configure your website {activeSection}</p>
              </div>
            </div>
          )}
        </ScrollArea>
      </div>
    </div>
  )
}

export default defineFeaturePreview({
  featureId: 'cms-lite',
  name: 'CMS Lite',
  description: 'Lightweight content management for websites',
  component: CmsLitePreview,
  category: 'content',
  tags: ['cms', 'website', 'content', 'admin', 'blog'],
  mockDataSets: [
    {
      id: 'default',
      name: 'Website Admin',
      description: 'Sample CMS with content stats',
      data: {
        stats: { products: 24, posts: 18, pages: 8, users: 156 },
        sections: [
          { id: 'dashboard', title: 'Dashboard' },
          { id: 'products', title: 'Products', count: 24 },
          { id: 'posts', title: 'Blog Posts', count: 18 },
        ],
      },
    },
  ],
})
