"use client"

import React, { useState } from "react"
import {
    Calculator,
    TrendingUp,
    TrendingDown,
    DollarSign,
    FileText,
    ArrowUpRight,
    ArrowDownRight,
} from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { ShellTabs, type ShellTabItem } from "@/frontend/shared/ui/layout/feature-shell"
import { MetricCard, ActivityListItem, EmptyState } from "@/frontend/shared/ui/dashboard"
import type { AccountingData } from "../types"

interface AccountingDashboardProps {
    data: AccountingData
    isLoading?: boolean
}

export default function AccountingDashboard({ data, isLoading }: AccountingDashboardProps) {
    const [activeTab, setActiveTab] = useState("overview")

    if (isLoading) {
        return <div className="p-8 text-center text-muted-foreground">Loading accounting data...</div>
    }

    const overviewContent = (
        <div className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
                <Card>
                    <CardHeader>
                        <CardTitle>Recent Transactions</CardTitle>
                        <CardDescription>Latest financial activity</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-2">
                            {data.recentTransactions.slice(0, 5).map((tx) => (
                                <ActivityListItem
                                    key={tx.id}
                                    icon={tx.type === "income" ? ArrowDownRight : ArrowUpRight}
                                    iconClassName={tx.type === "income" ? "bg-green-100 text-green-600" : "bg-red-100 text-red-600"}
                                    title={tx.description}
                                    meta={`${tx.date} • ${tx.category}`}
                                    amount={
                                        <span className={tx.type === "income" ? "text-green-600" : "text-foreground"}>
                                            {tx.type === "income" ? "+" : "-"}${tx.amount.toLocaleString()}
                                        </span>
                                    }
                                    status={{ label: tx.status, variant: "outline" }}
                                />
                            ))}
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Recent Invoices</CardTitle>
                        <CardDescription>Status of sent invoices</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-2">
                            {data.recentInvoices.slice(0, 5).map((inv) => (
                                <ActivityListItem
                                    key={inv.id}
                                    icon={FileText}
                                    iconClassName="bg-blue-100 text-blue-600"
                                    title={inv.customer}
                                    meta={`Due: ${inv.dueDate}`}
                                    amount={`$${inv.amount.toLocaleString()}`}
                                    status={{
                                        label: inv.status,
                                        variant: inv.status === "paid" ? "default" : inv.status === "overdue" ? "destructive" : "secondary",
                                    }}
                                />
                            ))}
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    )

    const tabs: ShellTabItem[] = [
        { value: "overview", label: "Overview", icon: Calculator, content: overviewContent },
        {
            value: "transactions", label: "Transactions", icon: ArrowUpRight, content: (
                <Card>
                    <CardHeader>
                        <CardTitle>All Transactions</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <EmptyState icon={Calculator} title="No transactions yet" description="Record your first transaction to get started" />
                    </CardContent>
                </Card>
            )
        },
        {
            value: "invoices", label: "Invoices", icon: FileText, content: (
                <Card>
                    <CardHeader><CardTitle>Invoices</CardTitle></CardHeader>
                    <CardContent>
                        <EmptyState icon={FileText} title="No invoices yet" description="Create and manage customer invoices" />
                    </CardContent>
                </Card>
            )
        },
        {
            value: "reports", label: "Reports", icon: TrendingUp, content: (
                <Card>
                    <CardHeader><CardTitle>Financial Reports</CardTitle></CardHeader>
                    <CardContent>
                        <EmptyState icon={TrendingUp} title="No reports yet" description="Generate reports from your accounting data" />
                    </CardContent>
                </Card>
            )
        },
    ]

    return (
        <div className="flex min-h-0 flex-1 flex-col gap-6">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <MetricCard title="Total Revenue" value={`$${data.stats.totalRevenue.toLocaleString()}`} icon={DollarSign} trend={{ value: 12.5, direction: "up", label: "from last month" }} />
                <MetricCard title="Net Profit" value={`$${data.stats.netProfit.toLocaleString()}`} icon={TrendingUp} trend={{ value: 8.2, direction: "up", label: "margin" }} />
                <MetricCard title="Expenses" value={`$${data.stats.expenses.toLocaleString()}`} icon={TrendingDown} trend={{ value: 3.1, direction: "down", label: "vs last month" }} />
                <MetricCard title="Pending Invoices" value={data.stats.pendingInvoices} icon={FileText} subtitle="Waiting for payment" />
            </div>

            <ShellTabs items={tabs} value={activeTab} onValueChange={setActiveTab} />
        </div>
    )
}
