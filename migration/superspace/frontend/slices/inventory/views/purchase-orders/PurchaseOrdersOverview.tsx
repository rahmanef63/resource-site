'use client'

import React, { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ClipboardList, Plus, Clock, CheckCircle, Truck, XCircle } from 'lucide-react'

interface PurchaseOrdersOverviewProps {
  workspaceId?: string | null
}

export default function PurchaseOrdersOverview({ workspaceId }: PurchaseOrdersOverviewProps) {
  const [activeTab, setActiveTab] = useState('all')
  const orders: unknown[] = [] // Will be populated from database

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ClipboardList className="h-5 w-5" />
            <div>
              <CardTitle>Purchase Orders</CardTitle>
              <CardDescription>
                Manage purchase orders and procurement
              </CardDescription>
            </div>
          </div>
          <Button size="sm">
            <Plus className="h-4 w-4 mr-2" />
            Create PO
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="mb-4 flex w-full justify-evenly">
            <TabsTrigger value="all">All</TabsTrigger>
            <TabsTrigger value="draft"><Clock className="h-3 w-3 mr-1" />Draft</TabsTrigger>
            <TabsTrigger value="pending"><Clock className="h-3 w-3 mr-1" />Pending</TabsTrigger>
            <TabsTrigger value="shipped"><Truck className="h-3 w-3 mr-1" />Shipped</TabsTrigger>
            <TabsTrigger value="received"><CheckCircle className="h-3 w-3 mr-1" />Received</TabsTrigger>
          </TabsList>
          <TabsContent value={activeTab}>
            <div className="grid grid-cols-4 gap-4 mb-4">
              <div className="p-3 rounded-lg border text-center">
                <p className="text-2xl font-bold">0</p>
                <p className="text-xs text-muted-foreground">Total POs</p>
              </div>
              <div className="p-3 rounded-lg border text-center">
                <p className="text-2xl font-bold">$0</p>
                <p className="text-xs text-muted-foreground">Total Value</p>
              </div>
              <div className="p-3 rounded-lg border text-center">
                <p className="text-2xl font-bold">0</p>
                <p className="text-xs text-muted-foreground">Pending</p>
              </div>
              <div className="p-3 rounded-lg border text-center">
                <p className="text-2xl font-bold">0</p>
                <p className="text-xs text-muted-foreground">This Month</p>
              </div>
            </div>
            {orders.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-32 text-muted-foreground">
                <ClipboardList className="h-10 w-10 mb-3 opacity-20" />
                <p className="font-medium">No purchase orders</p>
                <p className="text-sm">Create your first PO to start procurement</p>
              </div>
            ) : null}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}
