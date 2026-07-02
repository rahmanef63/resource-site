"use client"

import React, { useState } from "react"
import {
    Megaphone,
    BarChart3,
    Target,
    Users,
    TrendingUp,
    Mail,
    Share2,
    Globe
} from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { MetricCard } from "@/frontend/shared/ui/dashboard"
import type { MarketingData } from "../types"

interface MarketingDashboardProps {
    data: MarketingData
    isLoading?: boolean
}

export default function MarketingDashboard({ data, isLoading }: MarketingDashboardProps) {
    const [activeTab, setActiveTab] = useState("overview")

    if (isLoading) {
        return <div className="p-8 text-center text-muted-foreground">Loading marketing data...</div>
    }

    return (
        <div className="space-y-6">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <MetricCard
                    title="Active Campaigns"
                    value={data.stats.activeCampaigns}
                    icon={Megaphone}
                    iconClassName="text-primary"
                    subtitle="Running across all channels"
                />
                <MetricCard
                    title="Total Spend"
                    value={`$${data.stats.spend.toLocaleString()}`}
                    icon={TrendingUp}
                    subtitle="This month"
                />
                <MetricCard
                    title="Conversions"
                    value={data.stats.totalLeads}
                    icon={Target}
                    trend={{ value: data.stats.conversionRate, direction: "up", label: "conversion rate" }}
                />
                <MetricCard
                    title="ROI"
                    value={`${data.stats.roi}x`}
                    icon={BarChart3}
                    subtitle="Return on ad spend"
                />
            </div>

            {/* Main Content */}
            <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
                <div className="overflow-x-auto">
                    <TabsList className="flex justify-start min-w-max">
                        <TabsTrigger value="overview">Overview</TabsTrigger>
                        <TabsTrigger value="campaigns">Campaigns</TabsTrigger>
                        <TabsTrigger value="creative">Creative</TabsTrigger>
                        <TabsTrigger value="audiences">Audiences</TabsTrigger>
                    </TabsList>
                </div>

                <TabsContent value="overview" className="space-y-4">
                    {/* Active Campaigns List */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Active Campaigns</CardTitle>
                            <CardDescription>Performance of currently running ads</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                {data.activeCampaigns.map((campaign) => (
                                    <div key={campaign.id} className="flex items-center justify-between p-4 border rounded-lg bg-card hover:bg-muted/50 transition-colors">
                                        <div className="flex items-start gap-4 flex-1 min-w-0">
                                            <div className={`p-2 rounded-lg shrink-0 ${campaign.platform === 'email' ? 'bg-blue-100 text-blue-600' :
                                                    campaign.platform === 'social' ? 'bg-purple-100 text-purple-600' :
                                                        'bg-orange-100 text-orange-600'
                                                }`}>
                                                {campaign.platform === 'email' ? <Mail className="h-5 w-5" /> :
                                                    campaign.platform === 'social' ? <Share2 className="h-5 w-5" /> :
                                                        <Globe className="h-5 w-5" />}
                                            </div>
                                            <div className="space-y-1 flex-1 min-w-0">
                                                <div className="flex items-center gap-2">
                                                    <p className="font-semibold truncate">{campaign.name}</p>
                                                    <Badge variant={
                                                        campaign.status === 'active' ? 'default' : 'secondary'
                                                    } className="capitalize text-[10px] h-5 shrink-0">
                                                        {campaign.status}
                                                    </Badge>
                                                </div>
                                                <div className="grid grid-cols-3 gap-4 text-sm max-w-md pt-2">
                                                    <div className="min-w-0">
                                                        <p className="text-muted-foreground text-xs">Spend</p>
                                                        <p className="font-medium truncate">${campaign.budget}</p>
                                                    </div>
                                                    <div className="min-w-0">
                                                        <p className="text-muted-foreground text-xs">Clicks</p>
                                                        <p className="font-medium truncate">{campaign.clicks.toLocaleString()}</p>
                                                    </div>
                                                    <div className="min-w-0">
                                                        <p className="text-muted-foreground text-xs">Conv.</p>
                                                        <p className="font-medium truncate">{campaign.conversions}</p>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-4">
                                            <div className="text-right hidden md:block">
                                                <p className="text-sm font-medium">CTR</p>
                                                <p className="text-lg font-bold">
                                                    {((campaign.clicks / campaign.impressions) * 100).toFixed(1)}%
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="campaigns">
                    <Card>
                        <CardHeader>
                            <CardTitle>All Campaigns</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-center py-12">
                                <Megaphone className="h-12 w-12 mx-auto mb-4 text-muted-foreground/50" />
                                <p className="font-medium text-foreground">No campaigns yet</p>
                                <p className="text-sm text-muted-foreground">Create your first marketing campaign to get started</p>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="creative">
                    <Card>
                        <CardHeader>
                            <CardTitle>Creative Assets</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-center py-12">
                                <Target className="h-12 w-12 mx-auto mb-4 text-muted-foreground/50" />
                                <p className="font-medium text-foreground">Asset Library</p>
                                <p className="text-sm text-muted-foreground">Upload and manage your creative assets</p>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="audiences">
                    <Card>
                        <CardHeader>
                            <CardTitle>Audience Segments</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-center py-12">
                                <Users className="h-12 w-12 mx-auto mb-4 text-muted-foreground/50" />
                                <p className="font-medium text-foreground">Audience Segments</p>
                                <p className="text-sm text-muted-foreground">Define and manage your target audiences</p>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    )
}
