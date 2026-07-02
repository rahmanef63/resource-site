/**
 * ERP Inventory Module Main Page
 *
 * Entry point for the Inventory Management module. 9-tab slice — declared via
 * `FeatureShell.tabs` so tab bar horizontally scrolls instead of clipping at
 * narrow center widths.
 */

'use client'

import React, { useState } from 'react'
import { Id } from "@convex/_generated/dataModel"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { PageContainer } from "@/frontend/shared/ui/layout/container"
import {
  Package,
  ShoppingCart,
  Edit3,
  ArrowRightLeft,
  BarChart3,
  AlertTriangle,
  TrendingUp,
  Plus,
  Warehouse,
  Truck,
  FileBarChart,
} from 'lucide-react'
import { FeatureShell, type ShellTabItem } from "@/frontend/shared/ui/layout/feature-shell"
import { FeatureNotReady } from "@/frontend/shared/ui/components/feature-not-ready"

import WarehousesOverview from './warehouses/WarehousesOverview'
import PurchaseOrdersOverview from './purchase-orders/PurchaseOrdersOverview'

interface InventoryPageProps {
  workspaceId?: Id<"workspaces"> | null
}

export default function InventoryPage({ workspaceId }: InventoryPageProps) {
  const [activeTab, setActiveTab] = useState('overview')

  const stats = {
    totalItems: 0,
    totalValue: 0,
    lowStockItems: 0,
    pendingPOs: 0,
    warehouses: 0,
    totalSuppliers: 0,
    expiringSoon: 0,
    outOfStock: 0,
  }

  const lowStockAlerts: Array<{ itemName: string; current: number; min: number; warehouse: string }> = []
  const recentActivities: Array<{ action: string; time: string }> = []

  if (!workspaceId) {
    return (
      <PageContainer centered>
        <div className="text-center">
          <h2 className="text-xl font-semibold">No Workspace Selected</h2>
          <p className="mt-2 text-muted-foreground">
            Please select a workspace to view Inventory Management
          </p>
        </div>
      </PageContainer>
    )
  }

  const overviewContent = (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-orange-500" />
              Low Stock Alerts
            </CardTitle>
            <Button variant="ghost" size="sm">View All</Button>
          </div>
          <CardDescription>Items that need to be reordered soon</CardDescription>
        </CardHeader>
        <CardContent>
          {lowStockAlerts.length > 0 ? (
            <div className="space-y-4">
              {lowStockAlerts.slice(0, 5).map((alert, i) => (
                <div key={i} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="space-y-1">
                    <p className="font-medium">{alert.itemName}</p>
                    <p className="text-sm text-muted-foreground">
                      Current: {alert.current} / Min: {alert.min}
                    </p>
                  </div>
                  <div className="text-right">
                    <Badge variant={alert.current === 0 ? "destructive" : "secondary"}>
                      {alert.current === 0 ? "Out of Stock" : "Low Stock"}
                    </Badge>
                    <p className="text-sm text-muted-foreground mt-1">{alert.warehouse}</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <Package className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">No Low Stock Items</h3>
              <p className="text-muted-foreground">All items are adequately stocked</p>
            </div>
          )}
        </CardContent>
      </Card>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>Common inventory operations</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button className="w-full justify-start" variant="outline">
              <Plus className="mr-2 h-4 w-4" />Add New Item
            </Button>
            <Button className="w-full justify-start" variant="outline">
              <ShoppingCart className="mr-2 h-4 w-4" />Create Purchase Order
            </Button>
            <Button className="w-full justify-start" variant="outline">
              <Edit3 className="mr-2 h-4 w-4" />Stock Adjustment
            </Button>
            <Button className="w-full justify-start" variant="outline">
              <ArrowRightLeft className="mr-2 h-4 w-4" />Transfer Stock
            </Button>
            <Button className="w-full justify-start" variant="outline">
              <BarChart3 className="mr-2 h-4 w-4" />Generate Report
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
            <CardDescription>Latest inventory-related activities</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentActivities.length > 0 ? (
                recentActivities.slice(0, 5).map((activity, i) => (
                  <div key={i} className="flex items-center space-x-4 text-sm">
                    <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                    <span>{activity.action}</span>
                    <span className="text-muted-foreground ml-auto">{activity.time}</span>
                  </div>
                ))
              ) : (
                <div className="text-center py-6">
                  <p className="text-muted-foreground text-sm">No recent activity</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Inventory by Category</CardTitle>
          <CardDescription>Stock value distribution across categories</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-12">
            <BarChart3 className="mx-auto h-12 w-12 text-muted-foreground/50 mb-4" />
            <h3 className="text-lg font-semibold mb-2">Analytics Dashboard</h3>
            <p className="text-muted-foreground mb-4">
              View inventory insights and category breakdown
            </p>
            <Button variant="outline">View Reports</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )

  const tabs: ShellTabItem[] = [
    { value: 'overview', label: 'Overview', icon: BarChart3, content: overviewContent },
    { value: 'items', label: 'Items', icon: Package, badge: stats.totalItems || undefined, content: <FeatureNotReady featureName="Items" featureSlug="inventory" status="beta" message="Item catalog + create flow sedang dibangun. Backend ready via api.features.inventory.mutations.createItem." /> },
    { value: 'stock', label: 'Stock', icon: TrendingUp, badge: stats.lowStockItems || undefined, content: <FeatureNotReady featureName="Stock Levels" featureSlug="inventory" status="beta" message="Stock level view + adjustment sedang dibangun. Backend ready via api.features.inventory.mutations.adjustStock." /> },
    { value: 'warehouses', label: 'Warehouses', icon: Warehouse, badge: stats.warehouses || undefined, content: <WarehousesOverview workspaceId={workspaceId} /> },
    { value: 'purchase-orders', label: 'Purchase Orders', icon: ShoppingCart, badge: stats.pendingPOs || undefined, content: <PurchaseOrdersOverview workspaceId={workspaceId} /> },
    { value: 'suppliers', label: 'Suppliers', icon: Truck, badge: stats.totalSuppliers || undefined, content: <FeatureNotReady featureName="Suppliers" featureSlug="inventory" status="beta" message="Supplier directory + create flow sedang dibangun. Backend ready via api.features.inventory.mutations.createSupplier." /> },
    { value: 'adjustments', label: 'Adjustments', icon: Edit3, content: <FeatureNotReady featureName="Stock Adjustments" featureSlug="inventory" status="development" message="Stock adjustment + audit log sedang dibangun." /> },
    { value: 'transfers', label: 'Transfers', icon: ArrowRightLeft, content: <FeatureNotReady featureName="Stock Transfers" featureSlug="inventory" status="development" message="Stock transfer flow antar warehouse sedang dibangun." /> },
    { value: 'reports', label: 'Reports', icon: FileBarChart, content: <FeatureNotReady featureName="Inventory Reports" featureSlug="inventory" status="development" message="Reports (stock value, movements, low-stock) sedang dibangun." /> },
  ]

  const statsHeader = (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Items</CardTitle>
          <Package className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.totalItems.toLocaleString()}</div>
          <p className="text-xs text-muted-foreground">Across {stats.warehouses} warehouses</p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Value</CardTitle>
          <TrendingUp className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">${stats.totalValue.toLocaleString()}</div>
          <p className="text-xs text-muted-foreground">
            <span className="text-green-600">+5.2%</span> from last month
          </p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Low Stock</CardTitle>
          <AlertTriangle className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-orange-600">{stats.lowStockItems}</div>
          <p className="text-xs text-muted-foreground">{stats.outOfStock} out of stock</p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Pending POs</CardTitle>
          <ShoppingCart className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.pendingPOs}</div>
          <p className="text-xs text-muted-foreground">{stats.totalSuppliers} suppliers</p>
        </CardContent>
      </Card>
    </div>
  )

  return (
    <FeatureShell
      featureId="inventory"
      padding
      tabs={tabs}
      activeTab={activeTab}
      onTabChange={setActiveTab}
    >
      {statsHeader}
    </FeatureShell>
  )
}
