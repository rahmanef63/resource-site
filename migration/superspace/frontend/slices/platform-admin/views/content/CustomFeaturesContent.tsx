"use client"

import React from "react"
import { Blocks, Building2 } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { cn } from "@/lib/utils"
import type { FeatureStatus } from "../../types"

// Custom Features Content
interface CustomFeaturesContentProps {
  features: any[]
  onItemSelect: (item: any) => void
  selectedItemId?: string
}

export function CustomFeaturesContent({ features, onItemSelect, selectedItemId }: CustomFeaturesContentProps) {
  if (features.length === 0) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        <Blocks className="h-12 w-12 mx-auto mb-4 opacity-50" />
        <p>No custom features created yet.</p>
        <p className="text-sm">Features created via Builder will appear here.</p>
      </div>
    )
  }

  return (
    <div className="p-4">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Feature</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Created</TableHead>
            <TableHead>Public</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {features.map((feature) => (
            <TableRow
              key={feature._id}
              className={cn(
                "cursor-pointer transition-colors",
                selectedItemId === feature._id && "bg-primary/5 border-l-2 border-l-primary"
              )}
              onClick={() => onItemSelect(feature)}
            >
              <TableCell>
                <div className="flex flex-col">
                  <span className="font-medium">{feature.name}</span>
                  <span className="text-xs text-muted-foreground">{feature.featureId}</span>
                </div>
              </TableCell>
              <TableCell>
                <Badge variant="outline">{feature.status}</Badge>
              </TableCell>
              <TableCell className="text-sm text-muted-foreground">
                {new Date(feature.createdAt).toLocaleDateString()}
              </TableCell>
              <TableCell>
                <Badge variant={feature.isPublic ? "default" : "secondary"}>
                  {feature.isPublic ? "Public" : "Private"}
                </Badge>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}

// Workspaces Content
interface WorkspacesContentProps {
  workspaces: any[]
  onItemSelect: (item: any) => void
  selectedItemId?: string
}

export function WorkspacesContent({ workspaces, onItemSelect, selectedItemId }: WorkspacesContentProps) {
  if (workspaces.length === 0) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        <Building2 className="h-12 w-12 mx-auto mb-4 opacity-50" />
        <p>No workspaces found.</p>
      </div>
    )
  }

  return (
    <div className="p-4">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Workspace</TableHead>
            <TableHead>Type</TableHead>
            <TableHead>Created</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {workspaces.map((workspace) => (
            <TableRow
              key={workspace._id}
              className={cn(
                "cursor-pointer transition-colors",
                selectedItemId === workspace._id && "bg-primary/5 border-l-2 border-l-primary"
              )}
              onClick={() => onItemSelect(workspace)}
            >
              <TableCell>
                <div className="flex items-center gap-2">
                  <Building2 className="h-4 w-4 text-muted-foreground" />
                  <span className="font-medium">{workspace.name}</span>
                </div>
              </TableCell>
              <TableCell>
                <Badge variant="outline">
                  {workspace.type || "workspace"}
                </Badge>
              </TableCell>
              <TableCell className="text-sm text-muted-foreground">
                {new Date(workspace.createdAt).toLocaleDateString()}
              </TableCell>
              <TableCell className="text-right">
                <Button variant="ghost" size="sm">
                  Manage Access
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}

// Analytics Content (Placeholder)
export function AnalyticsContent() {
  return (
    <div className="flex items-center justify-center h-full p-6">
      <div className="text-center">
        <div className="rounded-full bg-muted p-4 mx-auto mb-4 w-fit">
          <svg className="h-8 w-8 text-muted-foreground/50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
          </svg>
        </div>
        <h3 className="text-lg font-medium mb-1">Analytics Dashboard</h3>
        <p className="text-sm text-muted-foreground">Platform-wide usage statistics and metrics.</p>
      </div>
    </div>
  )
}

// Settings Content (Placeholder)
export function SettingsContent() {
  return (
    <div className="flex items-center justify-center h-full p-6">
      <div className="text-center">
        <div className="rounded-full bg-muted p-4 mx-auto mb-4 w-fit">
          <svg className="h-8 w-8 text-muted-foreground/50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
        </div>
        <h3 className="text-lg font-medium mb-1">System Settings</h3>
        <p className="text-sm text-muted-foreground">Platform configuration and management options.</p>
      </div>
    </div>
  )
}
