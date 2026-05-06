/**
 * Chart Block
 * 
 * Displays data visualization using Recharts.
 */

"use client"

import {
    Area,
    AreaChart,
    Bar,
    BarChart,
    CartesianGrid,
    Cell,
    Line,
    LineChart,
    Pie,
    PieChart,
    ResponsiveContainer,
    Tooltip,
    XAxis,
    YAxis,
} from "recharts"
import { BlockCard } from "../shared"
import { PieChart as PieChartIcon, BarChart3, LineChart as LineChartIcon, Activity } from "lucide-react"

// ============================================================================
// Types
// ============================================================================

export type ChartType = "area" | "bar" | "line" | "pie"

export interface ChartDataPoint {
    name: string
    value: number
    [key: string]: string | number
}

export interface ChartBlockProps {
    type: ChartType
    data: ChartDataPoint[]
    title?: string
    description?: string
    color?: string
    height?: number | string
    className?: string
    loading?: boolean
}

// ============================================================================
// Chart Block
// ============================================================================

export function ChartBlock({
    type,
    data,
    title = "Chart",
    description,
    color = "#8884d8",
    height = 300,
    className,
    loading = false,
}: ChartBlockProps) {
    const isEmpty = !data || data.length === 0

    // Determine icon based on type
    const Icon = type === "pie" ? PieChartIcon : type === "bar" ? BarChart3 : type === "line" ? LineChartIcon : Activity

    return (
        <BlockCard
            header={{
                title,
                description,
                icon: Icon,
            }}
            loading={loading}
            isEmpty={isEmpty}
            emptyState={{
                icon: Icon,
                title: "No data available",
                description: "Chart data will appear here",
            }}
            className={className}
        >
            <div style={{ height, width: "100%" }}>
                <ResponsiveContainer width="100%" height="100%">
                    {type === "area" ? (
                        <AreaChart data={data}>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
                            <XAxis
                                dataKey="name"
                                stroke="#888888"
                                fontSize={12}
                                tickLine={false}
                                axisLine={false}
                            />
                            <YAxis
                                stroke="#888888"
                                fontSize={12}
                                tickLine={false}
                                axisLine={false}
                                tickFormatter={(value) => `${value}`}
                            />
                            <Tooltip
                                contentStyle={{ borderRadius: "8px", border: "none", boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)" }}
                            />
                            <Area type="monotone" dataKey="value" stroke={color} fill={color} fillOpacity={0.2} />
                        </AreaChart>
                    ) : type === "bar" ? (
                        <BarChart data={data}>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
                            <XAxis
                                dataKey="name"
                                stroke="#888888"
                                fontSize={12}
                                tickLine={false}
                                axisLine={false}
                            />
                            <YAxis
                                stroke="#888888"
                                fontSize={12}
                                tickLine={false}
                                axisLine={false}
                                tickFormatter={(value) => `${value}`}
                            />
                            <Tooltip
                                cursor={{ fill: "transparent" }}
                                contentStyle={{ borderRadius: "8px", border: "none", boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)" }}
                            />
                            <Bar dataKey="value" fill={color} radius={[4, 4, 0, 0]} />
                        </BarChart>
                    ) : type === "line" ? (
                        <LineChart data={data}>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
                            <XAxis
                                dataKey="name"
                                stroke="#888888"
                                fontSize={12}
                                tickLine={false}
                                axisLine={false}
                            />
                            <YAxis
                                stroke="#888888"
                                fontSize={12}
                                tickLine={false}
                                axisLine={false}
                                tickFormatter={(value) => `${value}`}
                            />
                            <Tooltip
                                contentStyle={{ borderRadius: "8px", border: "none", boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)" }}
                            />
                            <Line type="monotone" dataKey="value" stroke={color} strokeWidth={2} dot={false} />
                        </LineChart>
                    ) : (
                        <PieChart>
                            <Pie
                                data={data}
                                cx="50%"
                                cy="50%"
                                innerRadius={60}
                                outerRadius={80}
                                paddingAngle={5}
                                dataKey="value"
                            >
                                {data.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={index % 2 === 0 ? color : "#e5e7eb"} />
                                ))}
                            </Pie>
                            <Tooltip
                                contentStyle={{ borderRadius: "8px", border: "none", boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)" }}
                            />
                        </PieChart>
                    )}
                </ResponsiveContainer>
            </div>
        </BlockCard>
    )
}
