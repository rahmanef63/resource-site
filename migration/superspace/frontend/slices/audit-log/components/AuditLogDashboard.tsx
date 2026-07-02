"use client"

import React, { useState } from "react"
import {
    Activity,
    Shield,
    Users,
    AlertTriangle,
    Search,
    Terminal,
    CheckCircle,
    XCircle
} from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { ShellTabs } from "@/frontend/shared/ui/layout/feature-shell"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { MetricCard, EmptyState } from "@/frontend/shared/ui/dashboard"
import type { AuditLogData } from "../types"

interface AuditLogDashboardProps {
    data: AuditLogData
    isLoading?: boolean
}

export default function AuditLogDashboard({ data, isLoading }: AuditLogDashboardProps) {
    const [activeTab, setActiveTab] = useState("live")

    if (isLoading) {
        return <div className="p-8 text-center text-muted-foreground">Loading audit logs...</div>
    }

    return (
        <div className="space-y-6">
            {/* Stats Cards */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <MetricCard
                    title="Total Events"
                    value={data.stats.totalEvents.toLocaleString()}
                    icon={Activity}
                    subtitle="Last 24 hours"
                />
                <MetricCard
                    title="Critical"
                    value={data.stats.criticalEvents}
                    icon={AlertTriangle}
                    iconClassName="text-red-500"
                    subtitle="Security alerts"
                />
                <MetricCard
                    title="Active Users"
                    value={data.stats.activeUsers}
                    icon={Users}
                    iconClassName="text-blue-500"
                    subtitle="Performed actions"
                />
                <MetricCard
                    title="System Health"
                    value={data.stats.systemHealth}
                    icon={Shield}
                    iconClassName="text-green-500"
                    subtitle="All systems operational"
                />
            </div>

            {/* Main Content */}
            <div className="flex flex-col gap-4">
                <div className="flex justify-between items-center">
                    <div className="flex items-center gap-2 flex-1 max-w-sm">
                        <div className="relative flex-1">
                            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                            <Input placeholder="Search logs..." className="pl-8" />
                        </div>
                    </div>
                </div>

                <ShellTabs
                    items={[
                        {
                            value: "live",
                            label: "Live Feed",
                            icon: Activity,
                            content: (
                                <Card>
                                    <CardContent className="p-0">
                                        <div className="overflow-x-auto">
                                            <div className="min-w-[720px]">
                                                <div className="grid grid-cols-12 py-3 px-4 border-b bg-muted/30 text-xs font-semibold text-muted-foreground uppercase">
                                                    <div className="col-span-2 min-w-0">Time</div>
                                                    <div className="col-span-2 min-w-0">Status</div>
                                                    <div className="col-span-3 min-w-0">Action</div>
                                                    <div className="col-span-2 min-w-0">Actor</div>
                                                    <div className="col-span-3 min-w-0">Target</div>
                                                </div>
                                                <div className="divide-y">
                                                    {data.recentEvents.map((event) => (
                                                        <div key={event.id} className="grid grid-cols-12 items-center p-4 text-sm hover:bg-muted/50 transition-colors font-mono">
                                                            <div className="col-span-2 min-w-0 text-muted-foreground truncate">{event.timestamp}</div>
                                                            <div className="col-span-2 min-w-0">
                                                                <Badge variant={event.status === 'success' ? 'outline' : event.status === 'warning' ? 'secondary' : 'destructive'} className="bg-transparent">
                                                                    {event.status === 'success' && <CheckCircle className="h-3 w-3 mr-1 text-green-500" />}
                                                                    {event.status === 'failure' && <XCircle className="h-3 w-3 mr-1 text-red-500" />}
                                                                    {event.status === 'warning' && <AlertTriangle className="h-3 w-3 mr-1 text-orange-500" />}
                                                                    {event.status}
                                                                </Badge>
                                                            </div>
                                                            <div className="col-span-3 min-w-0 font-medium truncate">{event.action}</div>
                                                            <div className="col-span-2 min-w-0 flex items-center gap-1.5">
                                                                <div className="h-5 w-5 rounded-full bg-blue-100 flex items-center justify-center text-xs text-blue-700 shrink-0">
                                                                    {event.actor.charAt(0)}
                                                                </div>
                                                                <span className="truncate">{event.actor}</span>
                                                            </div>
                                                            <div className="col-span-3 min-w-0 text-muted-foreground truncate">{event.target}</div>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            ),
                        },
                        {
                            value: "security",
                            label: "Security",
                            icon: Shield,
                            content: (
                                <EmptyState icon={Shield} title="Security Events" description="Filter events by security-related actions" className="border rounded-lg bg-muted/10" />
                            ),
                        },
                        {
                            value: "system",
                            label: "System",
                            icon: Terminal,
                            content: (
                                <EmptyState icon={Terminal} title="System Logs" description="View system-level events and operations" className="border rounded-lg bg-muted/10" />
                            ),
                        },
                    ]}
                    value={activeTab}
                    onValueChange={setActiveTab}
                />
            </div>
        </div>
    )
}
