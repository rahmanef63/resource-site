"use client"

/**
 * Knowledge Feature Settings Components
 */

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { useKnowledgeSettingsStorage } from "./useKnowledgeSettings"
import {
    SettingsSection,
    SettingsToggle,
    SettingsSelect,
    SettingsSlider,
} from "@/frontend/shared/settings/primitives"

export function KnowledgeGeneralSettings() {
    const { settings, updateSetting, resetSettings, isLoaded } = useKnowledgeSettingsStorage()

    if (!isLoaded) {
        return <div className="p-4 text-center text-muted-foreground">Loading...</div>
    }

    return (
        <div className="space-y-6">
            <Card>
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <div>
                            <CardTitle>General Settings</CardTitle>
                            <CardDescription>Configure knowledge base defaults</CardDescription>
                        </div>
                        <Button variant="ghost" size="sm" onClick={resetSettings}>
                            Reset
                        </Button>
                    </div>
                </CardHeader>
                <CardContent className="space-y-4">
                    <SettingsSelect
                        id="sort"
                        label="Default Sort Order"
                        description="How articles are sorted by default"
                        value={settings.defaultSort}
                        onValueChange={(v) => updateSetting("defaultSort", v as typeof settings.defaultSort)}
                        options={[
                            { value: "recent", label: "Most Recent" },
                            { value: "alphabetical", label: "Alphabetical" },
                            { value: "popular", label: "Most Popular" },
                            { value: "updated", label: "Recently Updated" },
                        ]}
                    />

                    <Separator />

                    <SettingsToggle
                        id="previews"
                        label="Show Article Previews"
                        description="Display content previews in lists"
                        checked={settings.showPreviews}
                        onCheckedChange={(v) => updateSetting("showPreviews", v)}
                    />

                    <SettingsSelect
                        id="preview-length"
                        label="Preview Length"
                        description="Amount of content shown in previews"
                        value={settings.previewLength}
                        onValueChange={(v) => updateSetting("previewLength", v as typeof settings.previewLength)}
                        options={[
                            { value: "short", label: "Short (1-2 lines)" },
                            { value: "medium", label: "Medium (3-4 lines)" },
                            { value: "long", label: "Long (5+ lines)" },
                        ]}
                        disabled={!settings.showPreviews}
                    />
                </CardContent>
            </Card>
        </div>
    )
}

export function KnowledgeEditorSettings() {
    const { settings, updateSetting, isLoaded } = useKnowledgeSettingsStorage()

    if (!isLoaded) {
        return <div className="p-4 text-center text-muted-foreground">Loading...</div>
    }

    return (
        <div className="space-y-6">
            <Card>
                <CardHeader>
                    <CardTitle>Editor Settings</CardTitle>
                    <CardDescription>Customize article editing experience</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <SettingsSelect
                        id="font-size"
                        label="Font Size"
                        description="Text size in the editor"
                        value={settings.fontSize}
                        onValueChange={(v) => updateSetting("fontSize", v as typeof settings.fontSize)}
                        options={[
                            { value: "small", label: "Small" },
                            { value: "medium", label: "Medium" },
                            { value: "large", label: "Large" },
                        ]}
                    />

                    <SettingsSelect
                        id="line-height"
                        label="Line Height"
                        description="Spacing between lines"
                        value={settings.lineHeight}
                        onValueChange={(v) => updateSetting("lineHeight", v as typeof settings.lineHeight)}
                        options={[
                            { value: "compact", label: "Compact" },
                            { value: "normal", label: "Normal" },
                            { value: "relaxed", label: "Relaxed" },
                        ]}
                    />

                    <Separator />

                    <SettingsToggle
                        id="spellcheck"
                        label="Spell Check"
                        description="Check spelling while writing"
                        checked={settings.spellCheck}
                        onCheckedChange={(v) => updateSetting("spellCheck", v)}
                    />

                    <SettingsSection title="Auto-Save" description="Automatic saving settings">
                        <SettingsToggle
                            id="autosave"
                            label="Enable Auto-Save"
                            description="Automatically save articles while editing"
                            checked={settings.autoSave}
                            onCheckedChange={(v) => updateSetting("autoSave", v)}
                        />

                        <SettingsSelect
                            id="autosave-interval"
                            label="Save Interval"
                            description="How often to auto-save"
                            value={String(settings.autoSaveInterval)}
                            onValueChange={(v) => updateSetting("autoSaveInterval", Number(v) as typeof settings.autoSaveInterval)}
                            options={[
                                { value: "10", label: "Every 10 seconds" },
                                { value: "30", label: "Every 30 seconds" },
                                { value: "60", label: "Every minute" },
                            ]}
                            disabled={!settings.autoSave}
                        />
                    </SettingsSection>
                </CardContent>
            </Card>
        </div>
    )
}

export function KnowledgeOrganizationSettings() {
    const { settings, updateSetting, isLoaded } = useKnowledgeSettingsStorage()

    if (!isLoaded) {
        return <div className="p-4 text-center text-muted-foreground">Loading...</div>
    }

    return (
        <div className="space-y-6">
            <Card>
                <CardHeader>
                    <CardTitle>Organization</CardTitle>
                    <CardDescription>Configure article organization and discovery</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <SettingsToggle
                        id="auto-tagging"
                        label="Auto-Tagging"
                        description="Automatically suggest tags for articles"
                        checked={settings.autoTagging}
                        onCheckedChange={(v) => updateSetting("autoTagging", v)}
                    />

                    <SettingsToggle
                        id="categories"
                        label="Enable Categories"
                        description="Organize articles into categories"
                        checked={settings.enableCategories}
                        onCheckedChange={(v) => updateSetting("enableCategories", v)}
                    />

                    <Separator />

                    <SettingsSection title="Related Articles" description="Show related content">
                        <SettingsToggle
                            id="related"
                            label="Show Related Articles"
                            description="Display related articles at the bottom"
                            checked={settings.showRelatedArticles}
                            onCheckedChange={(v) => updateSetting("showRelatedArticles", v)}
                        />

                        <SettingsSelect
                            id="max-related"
                            label="Max Related Articles"
                            description="Number of related articles to show"
                            value={String(settings.maxRelatedArticles)}
                            onValueChange={(v) => updateSetting("maxRelatedArticles", Number(v) as typeof settings.maxRelatedArticles)}
                            options={[
                                { value: "3", label: "3 articles" },
                                { value: "5", label: "5 articles" },
                                { value: "10", label: "10 articles" },
                            ]}
                            disabled={!settings.showRelatedArticles}
                        />
                    </SettingsSection>
                </CardContent>
            </Card>
        </div>
    )
}

export function KnowledgeSearchSettings() {
    const { settings, updateSetting, isLoaded } = useKnowledgeSettingsStorage()

    if (!isLoaded) {
        return <div className="p-4 text-center text-muted-foreground">Loading...</div>
    }

    return (
        <div className="space-y-6">
            <Card>
                <CardHeader>
                    <CardTitle>Search Settings</CardTitle>
                    <CardDescription>Configure search behavior</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <SettingsToggle
                        id="search-content"
                        label="Search in Content"
                        description="Search within article body, not just titles"
                        checked={settings.searchInContent}
                        onCheckedChange={(v) => updateSetting("searchInContent", v)}
                    />

                    <SettingsToggle
                        id="highlight"
                        label="Highlight Matches"
                        description="Highlight search terms in results"
                        checked={settings.highlightMatches}
                        onCheckedChange={(v) => updateSetting("highlightMatches", v)}
                    />

                    <SettingsToggle
                        id="history"
                        label="Show Search History"
                        description="Display recent searches for quick access"
                        checked={settings.showSearchHistory}
                        onCheckedChange={(v) => updateSetting("showSearchHistory", v)}
                    />
                </CardContent>
            </Card>
        </div>
    )
}

export const KnowledgeSettings = KnowledgeGeneralSettings
