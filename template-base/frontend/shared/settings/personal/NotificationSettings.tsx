"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { SettingsToggle, SettingsSelect, SettingsSection } from "../primitives"

/**
 * Notification Settings - User-level notification preferences
 */
export function NotificationSettings() {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Push Notifications</CardTitle>
          <CardDescription>
            Configure desktop and mobile notifications
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <SettingsToggle
            label="Enable Notifications"
            description="Receive push notifications"
            checked={true}
            onCheckedChange={() => {}}
          />
          
          <SettingsToggle
            label="Sound"
            description="Play sound for notifications"
            checked={true}
            onCheckedChange={() => {}}
          />
          
          <SettingsToggle
            label="Show Previews"
            description="Show message content in notifications"
            checked={true}
            onCheckedChange={() => {}}
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Notification Types</CardTitle>
          <CardDescription>
            Choose what you want to be notified about
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <SettingsToggle
            label="Direct Messages"
            description="Notifications for direct messages"
            checked={true}
            onCheckedChange={() => {}}
          />
          
          <SettingsToggle
            label="Mentions"
            description="Notifications when you're mentioned"
            checked={true}
            onCheckedChange={() => {}}
          />
          
          <SettingsToggle
            label="Replies"
            description="Notifications for replies to your messages"
            checked={true}
            onCheckedChange={() => {}}
          />
          
          <SettingsToggle
            label="Team Updates"
            description="Notifications for team announcements"
            checked={false}
            onCheckedChange={() => {}}
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Do Not Disturb</CardTitle>
          <CardDescription>
            Schedule quiet hours
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <SettingsToggle
            label="Enable DND Schedule"
            description="Automatically enable DND during set hours"
            checked={false}
            onCheckedChange={() => {}}
          />
        </CardContent>
      </Card>
    </div>
  )
}
