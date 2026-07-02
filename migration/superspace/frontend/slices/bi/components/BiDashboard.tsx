"use client"

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { ShellTabs, type ShellTabItem } from "@/frontend/shared/ui/layout/feature-shell";
import { BiData, BiMetric } from "../types";
import {
    AreaChart,
    Area,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    BarChart,
    Bar,
    PieChart,
    Pie,
    Cell,
    LineChart,
    Line,
    Legend
} from 'recharts';
import { TrendingUp, Users, DollarSign, Activity, type LucideIcon } from "lucide-react";
import { MetricCard } from "@/frontend/shared/ui/dashboard";
import type { MetricTrendDirection } from "@/frontend/shared/ui/dashboard";

interface BiDashboardProps {
    data: BiData;
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];

export const BiDashboard: React.FC<BiDashboardProps> = ({ data }) => {
    const { metrics, revenueHistory, userGrowth, deviceUsage, isLoading } = data;

    if (isLoading) {
        return <div className="p-8 text-center text-muted-foreground">Loading Analytics...</div>;
    }

    const renderMetricCard = (metric: BiMetric, icon: LucideIcon) => (
        <MetricCard
            title={metric.label}
            value={metric.value}
            icon={icon}
            trend={{
                value: metric.change,
                direction: metric.trend as MetricTrendDirection,
                label: `from last ${metric.period}`,
            }}
        />
    );

    return (
        <div className="space-y-6">
            {/* Metrics Row */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                {renderMetricCard(metrics.revenue, DollarSign)}
                {renderMetricCard(metrics.activeUsers, Users)}
                {renderMetricCard(metrics.conversionRate, TrendingUp)}
                {renderMetricCard(metrics.churnRate, Activity)}
            </div>

            <ShellTabs
                defaultValue="overview"
                items={[
                    {
                        value: "overview",
                        label: "Overview",
                        icon: Activity,
                        content: (
                            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
                                <Card className="md:col-span-2 lg:col-span-4">
                                    <CardHeader>
                                        <CardTitle>Revenue Over Time</CardTitle>
                                        <CardDescription>Monthly revenue performance for the current year.</CardDescription>
                                    </CardHeader>
                                    <CardContent className="pl-2">
                                        <div className="h-[300px] w-full">
                                            <ResponsiveContainer width="100%" height="100%">
                                                <AreaChart data={revenueHistory} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                                                    <defs>
                                                        <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                                                            <stop offset="5%" stopColor="#8884d8" stopOpacity={0.8} />
                                                            <stop offset="95%" stopColor="#8884d8" stopOpacity={0} />
                                                        </linearGradient>
                                                    </defs>
                                                    <XAxis dataKey="name" fontSize={12} tickLine={false} axisLine={false} />
                                                    <YAxis fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `$${value}`} />
                                                    <Tooltip />
                                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#eee" />
                                                    <Area type="monotone" dataKey="value" stroke="#8884d8" fillOpacity={1} fill="url(#colorRevenue)" />
                                                </AreaChart>
                                            </ResponsiveContainer>
                                        </div>
                                    </CardContent>
                                </Card>

                                <Card className="md:col-span-2 lg:col-span-3">
                                    <CardHeader>
                                        <CardTitle>Device Usage</CardTitle>
                                        <CardDescription>Distribution of users by device type.</CardDescription>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="h-[300px] w-full">
                                            <ResponsiveContainer width="100%" height="100%">
                                                <PieChart>
                                                    <Pie data={deviceUsage} cx="50%" cy="50%" innerRadius={60} outerRadius={80} fill="#8884d8" paddingAngle={5} dataKey="value">
                                                        {deviceUsage.map((entry, index) => (
                                                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                                        ))}
                                                    </Pie>
                                                    <Tooltip />
                                                    <Legend />
                                                </PieChart>
                                            </ResponsiveContainer>
                                        </div>
                                    </CardContent>
                                </Card>
                            </div>
                        ),
                    },
                    {
                        value: "users",
                        label: "User Growth",
                        icon: Users,
                        content: (
                            <Card>
                                <CardHeader>
                                    <CardTitle>User Growth</CardTitle>
                                    <CardDescription>New vs Returning Users</CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <div className="h-[400px] w-full">
                                        <ResponsiveContainer width="100%" height="100%">
                                            <BarChart data={userGrowth}>
                                                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                                <XAxis dataKey="name" />
                                                <YAxis />
                                                <Tooltip />
                                                <Legend />
                                                <Bar dataKey="value" name="New Users" fill="#8884d8" radius={[4, 4, 0, 0]} />
                                                <Bar dataKey="secondaryValue" name="Returning Users" fill="#82ca9d" radius={[4, 4, 0, 0]} />
                                            </BarChart>
                                        </ResponsiveContainer>
                                    </div>
                                </CardContent>
                            </Card>
                        ),
                    },
                    {
                        value: "revenue",
                        label: "Revenue",
                        icon: DollarSign,
                        content: (
                            <Card>
                                <CardHeader>
                                    <CardTitle>Detailed Revenue Analysis</CardTitle>
                                    <CardDescription>Comparative revenue trends</CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <div className="h-[400px] w-full">
                                        <ResponsiveContainer width="100%" height="100%">
                                            <LineChart data={revenueHistory}>
                                                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                                <XAxis dataKey="name" />
                                                <YAxis />
                                                <Tooltip />
                                                <Legend />
                                                <Line type="monotone" dataKey="value" stroke="#82ca9d" name="This Year" strokeWidth={2} />
                                                <Line type="monotone" dataKey="secondaryValue" stroke="#ff7300" name="Last Year" strokeWidth={2} strokeDasharray="5 5" />
                                            </LineChart>
                                        </ResponsiveContainer>
                                    </div>
                                </CardContent>
                            </Card>
                        ),
                    },
                ]}
            />
        </div>
    );
};
