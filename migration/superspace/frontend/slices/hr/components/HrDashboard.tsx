"use client"

import React, { useState } from "react"
import {
    Users,
    UserPlus,
    Calendar,
    Briefcase,
    CheckCircle,
    XCircle,
    Clock,
} from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { ShellTabs, type ShellTabItem } from "@/frontend/shared/ui/layout/feature-shell"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { MetricCard, EmptyState } from "@/frontend/shared/ui/dashboard"
import type { HrData } from "../types"

interface HrDashboardProps {
    data: HrData
    isLoading?: boolean
}

export default function HrDashboard({ data, isLoading }: HrDashboardProps) {
    const [activeTab, setActiveTab] = useState("overview")

    if (isLoading) {
        return <div className="p-8 text-center text-muted-foreground">Loading HR data...</div>
    }

    const overviewContent = (
        <div className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
                <Card>
                    <CardHeader>
                        <CardTitle>Recent Hires</CardTitle>
                        <CardDescription>Latest team members</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-2">
                            {data.recentHires.slice(0, 5).map((employee) => (
                                <div key={employee.id} className="flex items-center justify-between p-3 border rounded-lg">
                                    <div className="flex items-center gap-3 min-w-0">
                                        <Avatar className="h-9 w-9 shrink-0">
                                            <AvatarImage src={employee.avatar} />
                                            <AvatarFallback>{employee.name.substring(0, 2).toUpperCase()}</AvatarFallback>
                                        </Avatar>
                                        <div className="min-w-0">
                                            <p className="text-sm font-medium truncate">{employee.name}</p>
                                            <p className="text-xs text-muted-foreground truncate">{employee.role}</p>
                                        </div>
                                    </div>
                                    <Badge variant="outline" className="shrink-0">{employee.department}</Badge>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Pending Leave Requests</CardTitle>
                        <CardDescription>Requires approval</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-2">
                            {data.leaveRequests.slice(0, 5).map((request) => (
                                <div key={request.id} className="flex items-center justify-between p-3 border rounded-lg">
                                    <div className="flex items-center gap-3 min-w-0">
                                        <div className="p-2 bg-yellow-100 text-yellow-600 rounded-lg shrink-0">
                                            <Clock className="h-4 w-4" />
                                        </div>
                                        <div className="min-w-0">
                                            <p className="text-sm font-medium truncate">{request.employee}</p>
                                            <p className="text-xs text-muted-foreground truncate">{request.type} • {request.dates}</p>
                                        </div>
                                    </div>
                                    <div className="flex gap-2 shrink-0">
                                        <Button size="icon" variant="ghost" aria-label={`Approve leave request from ${request.employee}`} className="h-8 w-8 text-green-600">
                                            <CheckCircle className="h-4 w-4" />
                                        </Button>
                                        <Button size="icon" variant="ghost" aria-label={`Reject leave request from ${request.employee}`} className="h-8 w-8 text-red-600">
                                            <XCircle className="h-4 w-4" />
                                        </Button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    )

    const tabs: ShellTabItem[] = [
        { value: "overview", label: "Overview", icon: Users, content: overviewContent },
        {
            value: "employees", label: "Employees", icon: Users, content: (
                <Card>
                    <CardHeader>
                        <CardTitle>Employee Directory</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <EmptyState icon={Users} title="No employees yet" description="Add employees to build your team directory" />
                    </CardContent>
                </Card>
            )
        },
        {
            value: "leave", label: "Leave Requests", icon: Calendar, content: (
                <Card>
                    <CardHeader><CardTitle>Leave Management</CardTitle></CardHeader>
                    <CardContent>
                        <EmptyState icon={Calendar} title="Leave Requests" description="Manage employee time-off and leave requests" />
                    </CardContent>
                </Card>
            )
        },
        {
            value: "recruitment", label: "Recruitment", icon: Briefcase, content: (
                <Card>
                    <CardHeader><CardTitle>Recruitment Pipeline</CardTitle></CardHeader>
                    <CardContent>
                        <EmptyState icon={Briefcase} title="Applicant Tracking" description="Track candidates through your hiring process" />
                    </CardContent>
                </Card>
            )
        },
    ]

    return (
        <div className="flex min-h-0 flex-1 flex-col gap-6">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <MetricCard title="Total Employees" value={data.stats.totalEmployees} icon={Users} subtitle={`Across ${data.stats.departmentCount} departments`} />
                <MetricCard title="On Leave" value={data.stats.onLeave} icon={Calendar} subtitle="Employees currently away" />
                <MetricCard title="Open Positions" value={data.stats.openPositions} icon={Briefcase} subtitle="Active job listings" />
                <MetricCard title="New Hires" value={data.stats.newHires} icon={UserPlus} subtitle="Joined this month" />
            </div>

            <ShellTabs items={tabs} value={activeTab} onValueChange={setActiveTab} />
        </div>
    )
}
