"use client"

import React, { useState } from "react"
import {
    FileText,
    Image as ImageIcon,
    Video,
    Globe,
    Search,
    Eye,
    Edit3,
} from "lucide-react"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { MetricCard } from "@/frontend/shared/ui/dashboard"
import type { ContentData } from "../types"

interface ContentDashboardProps {
    data: ContentData
    isLoading?: boolean
}

export default function ContentDashboard({ data, isLoading }: ContentDashboardProps) {
    const [activeTab, setActiveTab] = useState("all")

    if (isLoading) {
        return <div className="p-8 text-center text-muted-foreground">Loading content data...</div>
    }

    return (
        <div className="space-y-6">
            {/* Stats Cards */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <MetricCard
                    title="Total Items"
                    value={data.stats.totalItems}
                    icon={FileText}
                />
                <MetricCard
                    title="Published"
                    value={data.stats.published}
                    icon={Globe}
                    iconClassName="text-green-500"
                />
                <MetricCard
                    title="Drafts"
                    value={data.stats.drafts}
                    icon={Edit3}
                    iconClassName="text-orange-500"
                />
                <MetricCard
                    title="Total Views"
                    value={data.stats.views.toLocaleString()}
                    icon={Eye}
                    iconClassName="text-blue-500"
                />
            </div>

            {/* Main Content */}
            <div className="flex flex-col gap-4">
                <div className="flex justify-between items-center">
                    <div className="flex items-center gap-2 flex-1 max-w-sm">
                        <div className="relative flex-1">
                            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                            <Input placeholder="Search content..." className="pl-8" />
                        </div>
                    </div>
                </div>

                <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
                    <div className="overflow-x-auto">
                        <TabsList className="flex justify-start min-w-max">
                            <TabsTrigger value="all">All Content</TabsTrigger>
                            <TabsTrigger value="published">Published</TabsTrigger>
                            <TabsTrigger value="drafts">Drafts</TabsTrigger>
                            <TabsTrigger value="scheduled">Scheduled</TabsTrigger>
                        </TabsList>
                    </div>

                    <TabsContent value="all" className="space-y-4">
                        <Card>
                            <CardHeader className="p-0"></CardHeader>
                            <CardContent className="p-0">
                                <div className="overflow-x-auto">
                                    <div className="rounded-md border min-w-[640px]">
                                        <div className="grid grid-cols-12 gap-4 p-4 border-b bg-muted/50 font-medium text-sm">
                                            <div className="col-span-6 min-w-0">Title</div>
                                            <div className="col-span-2 min-w-0">Author</div>
                                            <div className="col-span-2 min-w-0">Status</div>
                                            <div className="col-span-2 min-w-0 text-right">Views</div>
                                        </div>
                                        {data.recentContent.map((item) => (
                                            <div key={item.id} className="grid grid-cols-12 gap-4 p-4 border-b last:border-0 hover:bg-muted/50 transition-colors items-center text-sm">
                                                <div className="col-span-6 min-w-0 flex items-center gap-3">
                                                    <div className="p-2 bg-muted rounded shrink-0">
                                                        {item.type === 'article' ? <FileText className="h-4 w-4" /> :
                                                            item.type === 'image' ? <ImageIcon className="h-4 w-4" /> :
                                                                item.type === 'video' ? <Video className="h-4 w-4" /> :
                                                                    <Globe className="h-4 w-4" />}
                                                    </div>
                                                    <div className="min-w-0">
                                                        <p className="font-medium truncate">{item.title}</p>
                                                        <p className="text-xs text-muted-foreground capitalize truncate">{item.type} • {item.publishedAt || 'Not published'}</p>
                                                    </div>
                                                </div>
                                                <div className="col-span-2 min-w-0 truncate">{item.author}</div>
                                                <div className="col-span-2 min-w-0">
                                                    <Badge variant={
                                                        item.status === 'published' ? 'default' :
                                                            item.status === 'draft' ? 'secondary' : 'outline'
                                                    } className="capitalize">
                                                        {item.status}
                                                    </Badge>
                                                </div>
                                                <div className="col-span-2 min-w-0 text-right font-medium truncate">
                                                    {item.views.toLocaleString()}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    <TabsContent value="published">
                        <div className="py-8 text-center text-muted-foreground">No published content yet</div>
                    </TabsContent>
                    <TabsContent value="drafts">
                        <div className="py-8 text-center text-muted-foreground">No drafts available</div>
                    </TabsContent>
                    <TabsContent value="scheduled">
                        <div className="py-8 text-center text-muted-foreground">No scheduled content</div>
                    </TabsContent>
                </Tabs>
            </div>
        </div>
    )
}
