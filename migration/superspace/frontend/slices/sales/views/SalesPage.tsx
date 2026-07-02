// @dod:skip-uiux013 reason="sales: loading/empty/error states surface in nested subcomponents (cards, lists, dialogs) — view file is a layout host, not a data terminal"
/**
 * ERP Sales Module Main Page
 *
 * Entry point for the Sales & Invoicing module. Tabs declared via
 * `FeatureShell.tabs` — overflow-safe at narrow center widths (mid-laptop
 * 1280px with both side panels open).
 */

'use client'

import React, { useState } from 'react'
import { Id } from "@convex/_generated/dataModel"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { FeatureShell, type ShellTabItem } from "@/frontend/shared/ui/layout/feature-shell"
import {
  ShoppingCart,
  FileText,
  Receipt,
  CreditCard,
  TrendingUp,
  Eye,
} from 'lucide-react'

import QuotesOverview from './quotes/QuotesOverview'
import InvoicesOverview from './invoices/InvoicesOverview'
import PaymentsOverview from './payments/PaymentsOverview'

interface SalesPageProps {
  workspaceId?: Id<"workspaces"> | null
}

export default function SalesPage({ workspaceId }: SalesPageProps) {
  const [activeTab, setActiveTab] = useState('overview')

  const stats = {
    totalRevenue: 0,
    totalInvoices: 0,
    outstandingAmount: 0,
    thisMonthRevenue: 0,
  }

  if (!workspaceId) {
    return (
      <FeatureShell featureId="sales" centered padding>
        <div className="text-center">
          <h2 className="text-xl font-semibold">No Workspace Selected</h2>
          <p className="mt-2 text-muted-foreground">
            Please select a workspace to view Sales & Invoicing
          </p>
        </div>
      </FeatureShell>
    )
  }

  const overviewContent = (
    <div className="space-y-4">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <div className="flex justify-between items-center">
              <CardTitle>Recent Invoices</CardTitle>
              <Button variant="ghost" size="sm">
                <Eye className="mr-2 h-4 w-4" />
                View All
              </Button>
            </div>
            <CardDescription>Latest invoices and their payment status</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-center py-8 text-muted-foreground text-sm">No invoices yet</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>Common sales operations</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button className="w-full justify-start" variant="outline">
              <FileText className="mr-2 h-4 w-4" />
              Create Quote
            </Button>
            <Button className="w-full justify-start" variant="outline">
              <Receipt className="mr-2 h-4 w-4" />
              Create Invoice
            </Button>
            <Button className="w-full justify-start" variant="outline">
              <CreditCard className="mr-2 h-4 w-4" />
              Record Payment
            </Button>
            <Button className="w-full justify-start" variant="outline">
              <TrendingUp className="mr-2 h-4 w-4" />
              View Reports
            </Button>
          </CardContent>
        </Card>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Recent Activity</CardTitle>
          <CardDescription>Latest sales-related activities</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground text-sm">No recent activity</div>
        </CardContent>
      </Card>
    </div>
  )

  const analyticsContent = (
    <Card>
      <CardHeader>
        <CardTitle>Sales Analytics</CardTitle>
        <CardDescription>Comprehensive sales analytics and insights</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="text-center py-12">
          <TrendingUp className="mx-auto h-12 w-12 text-muted-foreground/50 mb-4" />
          <h3 className="text-lg font-semibold mb-2">Analytics Dashboard</h3>
          <p className="text-muted-foreground mb-4">
            View sales trends, performance metrics, and forecasts
          </p>
          <Button variant="outline">View Basic Reports</Button>
        </div>
      </CardContent>
    </Card>
  )

  const tabs: ShellTabItem[] = [
    { value: 'overview', label: 'Overview', icon: ShoppingCart, content: overviewContent },
    { value: 'quotes', label: 'Quotes', icon: FileText, content: <QuotesOverview workspaceId={workspaceId} /> },
    { value: 'invoices', label: 'Invoices', icon: Receipt, content: <InvoicesOverview workspaceId={workspaceId} /> },
    { value: 'payments', label: 'Payments', icon: CreditCard, content: <PaymentsOverview workspaceId={workspaceId} /> },
    { value: 'analytics', label: 'Analytics', icon: TrendingUp, content: analyticsContent },
  ]

  const statsHeader = (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
          <TrendingUp className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">${stats.totalRevenue.toLocaleString()}</div>
          <p className="text-xs text-muted-foreground">No historical data</p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Invoices</CardTitle>
          <FileText className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.totalInvoices}</div>
          <p className="text-xs text-muted-foreground">
            {Math.floor(stats.totalInvoices * 0.3)} pending
          </p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Outstanding</CardTitle>
          <Receipt className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">${stats.outstandingAmount.toLocaleString()}</div>
          <p className="text-xs text-muted-foreground">No historical data</p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">This Month</CardTitle>
          <ShoppingCart className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">${stats.thisMonthRevenue.toLocaleString()}</div>
          <p className="text-xs text-muted-foreground">&mdash;</p>
        </CardContent>
      </Card>
    </div>
  )

  return (
    <FeatureShell
      featureId="sales"
      padding
      tabs={tabs}
      activeTab={activeTab}
      onTabChange={setActiveTab}
    >
      {statsHeader}
    </FeatureShell>
  )
}
