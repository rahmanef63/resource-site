"use client"

import { Camera, Eye, Lock, Image as ImageIcon } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { useStatusSettingsStorage } from "./useStatusSettings"
import {
  SettingsSection,
  SettingsToggle,
  SettingsSelect,
  SettingsRadioGroup,
} from "@/frontend/shared/settings/primitives"

/**
 * Status General Settings
 */
export function StatusGeneralSettings() {
  const { settings, updateSetting, resetSettings, isLoaded } = useStatusSettingsStorage()

  if (!isLoaded) {
    return <div className="p-4 text-center text-muted-foreground">Loading...</div>
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Status Settings</CardTitle>
              <CardDescription>Configure how your status updates work</CardDescription>
            </div>
            <Button variant="ghost" size="sm" onClick={resetSettings}>
              Reset
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <SettingsSelect
            id="auto-expire"
            label="Auto-Expire Time"
            description="How long until status updates disappear"
            value={String(settings.autoExpireHours)}
            onValueChange={(v) => updateSetting("autoExpireHours", Number(v) as 24 | 48 | 72)}
            options={[
              { value: "24", label: "24 hours" },
              { value: "48", label: "48 hours" },
              { value: "72", label: "72 hours" },
            ]}
          />

          <SettingsSelect
            id="default-type"
            label="Default Status Type"
            description="Default type when creating new status"
            value={settings.defaultStatusType}
            onValueChange={(v) => updateSetting("defaultStatusType", v as "photo" | "video" | "text")}
            options={[
              { value: "photo", label: "Photo" },
              { value: "video", label: "Video" },
              { value: "text", label: "Text" },
            ]}
          />

          <Separator />

          <SettingsSection title="Interactions" description="How others can interact with your status">
            <SettingsToggle
              id="allow-comments"
              label="Allow Comments"
              description="Let others comment on your status"
              checked={settings.allowComments}
              onCheckedChange={(v) => updateSetting("allowComments", v)}
            />

            <SettingsToggle
              id="allow-reactions"
              label="Allow Reactions"
              description="Let others react to your status"
              checked={settings.allowReactions}
              onCheckedChange={(v) => updateSetting("allowReactions", v)}
            />
          </SettingsSection>
        </CardContent>
      </Card>
    </div>
  )
}

/**
 * Status Privacy Settings
 */
export function StatusPrivacySettings() {
  const { settings, updateSetting, isLoaded } = useStatusSettingsStorage()

  if (!isLoaded) {
    return <div className="p-4 text-center text-muted-foreground">Loading...</div>
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Privacy Settings</CardTitle>
          <CardDescription>Control who can see your status updates</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <SettingsRadioGroup
            id="visibility"
            label="Status Visibility"
            description="Who can see your status updates"
            value={settings.visibility}
            onValueChange={(v) => updateSetting("visibility", v as "everyone" | "contacts" | "selected" | "nobody")}
            options={[
              { value: "everyone", label: "Everyone" },
              { value: "contacts", label: "My Contacts Only" },
              { value: "selected", label: "Selected Contacts" },
              { value: "nobody", label: "Nobody" },
            ]}
          />
        </CardContent>
      </Card>
    </div>
  )
}

/**
 * Status Visibility Settings
 */
export function StatusVisibilitySettings() {
  const { settings, updateSetting, isLoaded } = useStatusSettingsStorage()

  if (!isLoaded) {
    return <div className="p-4 text-center text-muted-foreground">Loading...</div>
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Visibility Settings</CardTitle>
          <CardDescription>Manage visibility options for your status</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <SettingsToggle
            id="show-seen"
            label="Show Seen List"
            description="Show who has viewed your status"
            checked={settings.showSeenList}
            onCheckedChange={(v) => updateSetting("showSeenList", v)}
          />

          <SettingsToggle
            id="allow-replies"
            label="Allow Replies"
            description="Let viewers reply to your status"
            checked={settings.allowReplies}
            onCheckedChange={(v) => updateSetting("allowReplies", v)}
          />

          <SettingsToggle
            id="notify-views"
            label="Notify on Views"
            description="Get notified when someone views your status"
            checked={settings.notifyOnViews}
            onCheckedChange={(v) => updateSetting("notifyOnViews", v)}
          />
        </CardContent>
      </Card>
    </div>
  )
}

/**
 * Status Media Settings
 */
export function StatusMediaSettings() {
  const { settings, updateSetting, isLoaded } = useStatusSettingsStorage()

  if (!isLoaded) {
    return <div className="p-4 text-center text-muted-foreground">Loading...</div>
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Media Settings</CardTitle>
          <CardDescription>Configure media options for status</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <SettingsSelect
            id="upload-quality"
            label="Upload Quality"
            description="Quality of uploaded media"
            value={settings.uploadQuality}
            onValueChange={(v) => updateSetting("uploadQuality", v as "original" | "high" | "medium" | "low")}
            options={[
              { value: "original", label: "Original" },
              { value: "high", label: "High" },
              { value: "medium", label: "Medium" },
              { value: "low", label: "Low (saves data)" },
            ]}
          />

          <SettingsToggle
            id="auto-download"
            label="Auto-Download Media"
            description="Automatically download status media"
            checked={settings.autoDownload}
            onCheckedChange={(v) => updateSetting("autoDownload", v)}
          />

          <SettingsToggle
            id="allow-resharing"
            label="Allow Resharing"
            description="Let others reshare your status"
            checked={settings.allowResharing}
            onCheckedChange={(v) => updateSetting("allowResharing", v)}
          />
        </CardContent>
      </Card>
    </div>
  )
}

export { Camera, Eye, Lock, ImageIcon }
