"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import {
    SettingsToggle,
    SettingsSelect,
    SettingsSlider,
} from "@/frontend/shared/settings/primitives"
import { useCmsLiteSettingsStorage } from "./useCmsLiteSettings"

export function CmsLiteSettings() {
    const { settings, updateSetting, resetSettings, isLoaded } = useCmsLiteSettingsStorage()

    if (!isLoaded) return <div className="p-4 text-center text-muted-foreground">Loading...</div>

    return (
        <div className="space-y-6">
            <Card>
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <div>
                            <CardTitle>Content</CardTitle>
                            <CardDescription>Authoring and publishing defaults</CardDescription>
                        </div>
                        <Button variant="ghost" size="sm" onClick={resetSettings}>Reset</Button>
                    </div>
                </CardHeader>
                <CardContent className="space-y-4">
                    <SettingsSelect
                        id="default-publish-status"
                        label="Default Publish Status"
                        description="Status assigned to newly created content"
                        value={settings.defaultPublishStatus}
                        onValueChange={(v) => updateSetting("defaultPublishStatus", v as typeof settings.defaultPublishStatus)}
                        options={[
                            { value: "draft", label: "Draft" },
                            { value: "published", label: "Published" },
                            { value: "scheduled", label: "Scheduled" },
                        ]}
                    />

                    <SettingsSelect
                        id="default-content-type"
                        label="Default Content Type"
                        description="Type selected when creating new content"
                        value={settings.defaultContentType}
                        onValueChange={(v) => updateSetting("defaultContentType", v as typeof settings.defaultContentType)}
                        options={[
                            { value: "article", label: "Article" },
                            { value: "page", label: "Page" },
                            { value: "post", label: "Post" },
                        ]}
                    />

                    <Separator />

                    <SettingsToggle
                        id="auto-save"
                        label="Auto-Save Draft"
                        description="Automatically save changes while editing"
                        checked={settings.autoSaveDraft}
                        onCheckedChange={(v) => updateSetting("autoSaveDraft", v)}
                    />

                    <SettingsSlider
                        id="auto-save-interval"
                        label={`Auto-Save Interval (${settings.autoSaveIntervalSeconds}s)`}
                        description="How often drafts are automatically saved"
                        value={settings.autoSaveIntervalSeconds}
                        onValueChange={(v: number[]) => updateSetting("autoSaveIntervalSeconds", v[0])}
                        min={10}
                        max={120}
                        step={10}
                        disabled={!settings.autoSaveDraft}
                    />

                    <Separator />

                    <SettingsToggle
                        id="version-history"
                        label="Version History"
                        description="Keep history of content revisions"
                        checked={settings.enableVersionHistory}
                        onCheckedChange={(v) => updateSetting("enableVersionHistory", v)}
                    />

                    <SettingsToggle
                        id="seo-fields"
                        label="SEO Fields"
                        description="Show meta title, description, and keywords"
                        checked={settings.enableSEOFields}
                        onCheckedChange={(v) => updateSetting("enableSEOFields", v)}
                    />

                    <SettingsToggle
                        id="tags"
                        label="Tags"
                        description="Allow tagging content for organization"
                        checked={settings.enableTags}
                        onCheckedChange={(v) => updateSetting("enableTags", v)}
                    />

                    <SettingsToggle
                        id="image-optimization"
                        label="Image Optimization"
                        description="Auto-compress uploaded images"
                        checked={settings.imageOptimization}
                        onCheckedChange={(v) => updateSetting("imageOptimization", v)}
                    />

                    <SettingsToggle
                        id="allow-comments"
                        label="Allow Comments"
                        description="Enable reader comments on published content"
                        checked={settings.allowComments}
                        onCheckedChange={(v) => updateSetting("allowComments", v)}
                    />

                    <Separator />

                    <SettingsToggle
                        id="notifications"
                        label="Notifications"
                        description="Receive notifications for content updates"
                        checked={settings.notificationsEnabled}
                        onCheckedChange={(v) => updateSetting("notificationsEnabled", v)}
                    />
                </CardContent>
            </Card>
        </div>
    )
}
