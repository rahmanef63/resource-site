"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { SettingsToggle } from "../primitives"

/**
 * Storage Settings - Data and storage management
 */
export function StorageSettings() {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Storage Usage</CardTitle>
          <CardDescription>
            View and manage your storage
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Used</span>
              <span className="text-muted-foreground">2.5 GB of 15 GB</span>
            </div>
            <Progress value={17} className="h-2" />
          </div>
          
          <div className="grid grid-cols-2 gap-4 pt-4">
            <div className="text-center p-4 rounded-lg bg-muted/50">
              <p className="text-2xl font-bold">1.2 GB</p>
              <p className="text-xs text-muted-foreground">Documents</p>
            </div>
            <div className="text-center p-4 rounded-lg bg-muted/50">
              <p className="text-2xl font-bold">800 MB</p>
              <p className="text-xs text-muted-foreground">Media</p>
            </div>
            <div className="text-center p-4 rounded-lg bg-muted/50">
              <p className="text-2xl font-bold">300 MB</p>
              <p className="text-xs text-muted-foreground">Cache</p>
            </div>
            <div className="text-center p-4 rounded-lg bg-muted/50">
              <p className="text-2xl font-bold">200 MB</p>
              <p className="text-xs text-muted-foreground">Other</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Data Management</CardTitle>
          <CardDescription>
            Control how your data is stored
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <SettingsToggle
            label="Auto-download Media"
            description="Automatically download images and videos"
            checked={true}
            onCheckedChange={() => {}}
          />
          
          <SettingsToggle
            label="Save to Device"
            description="Keep a local copy of your files"
            checked={false}
            onCheckedChange={() => {}}
          />
          
          <div className="flex gap-2 pt-4">
            <Button variant="outline">Clear Cache</Button>
            <Button variant="outline">Export Data</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
