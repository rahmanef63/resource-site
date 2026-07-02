'use client'

import React, { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Warehouse, Plus, Search, MapPin } from 'lucide-react'

interface WarehousesOverviewProps {
  workspaceId?: string | null
}

export default function WarehousesOverview({ workspaceId }: WarehousesOverviewProps) {
  const [searchQuery, setSearchQuery] = useState('')
  const warehouses: unknown[] = [] // Will be populated from database

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Warehouse className="h-5 w-5" />
            <div>
              <CardTitle>Warehouses</CardTitle>
              <CardDescription>
                Manage warehouse locations and storage
              </CardDescription>
            </div>
          </div>
          <Button size="sm">
            <Plus className="h-4 w-4 mr-2" />
            Add Warehouse
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex gap-2 mb-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search warehouses..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>
        </div>
        <div className="flex gap-2 mb-4">
          <Badge variant="outline">0 Locations</Badge>
          <Badge variant="outline">0 Active</Badge>
        </div>
        {warehouses.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-40 text-muted-foreground">
            <MapPin className="h-12 w-12 mb-4 opacity-20" />
            <p className="font-medium">No warehouses configured</p>
            <p className="text-sm">Add a warehouse to start managing locations</p>
          </div>
        ) : null}
      </CardContent>
    </Card>
  )
}
