"use client"

/**
 * Documents Feature Settings
 */

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { useDocumentsSettingsStorage } from "./useDocumentsSettings"
import {
  SettingsSection,
  SettingsToggle,
  SettingsSelect,
  SettingsSlider,
} from "@/frontend/shared/settings/primitives"

export function DocumentsEditorSettings() {
  const { settings, updateSetting, resetSettings, isLoaded } = useDocumentsSettingsStorage()

  if (!isLoaded) {
    return <div className="p-4 text-center text-muted-foreground">Loading...</div>
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Document Editor</CardTitle>
              <CardDescription>Configure document editing preferences</CardDescription>
            </div>
            <Button variant="ghost" size="sm" onClick={resetSettings}>
              Reset
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <SettingsToggle
            id="autosave"
            label="Auto-Save"
            description="Automatically save documents while editing"
            checked={settings.autoSave}
            onCheckedChange={(v) => updateSetting("autoSave", v)}
          />

          <SettingsSelect
            id="autosave-interval"
            label="Auto-Save Interval"
            description="How often to save automatically"
            value={String(settings.autoSaveInterval)}
            onValueChange={(v) => updateSetting("autoSaveInterval", Number(v) as 10 | 30 | 60 | 300)}
            options={[
              { value: "10", label: "10 seconds" },
              { value: "30", label: "30 seconds" },
              { value: "60", label: "1 minute" },
              { value: "300", label: "5 minutes" },
            ]}
            disabled={!settings.autoSave}
          />

          <Separator />

          <SettingsSection title="Display" description="Editor appearance">
            <SettingsToggle
              id="wordcount"
              label="Show Word Count"
              description="Display word and character count"
              checked={settings.showWordCount}
              onCheckedChange={(v) => updateSetting("showWordCount", v)}
            />

            <SettingsToggle
              id="spellcheck"
              label="Spell Check"
              description="Highlight spelling errors"
              checked={settings.spellCheck}
              onCheckedChange={(v) => updateSetting("spellCheck", v)}
            />

            <SettingsSelect
              id="font"
              label="Default Font"
              description="Font family for documents"
              value={settings.defaultFont}
              onValueChange={(v) => updateSetting("defaultFont", v as "system" | "serif" | "sans" | "mono")}
              options={[
                { value: "system", label: "System Default" },
                { value: "serif", label: "Serif" },
                { value: "sans", label: "Sans-serif" },
                { value: "mono", label: "Monospace" },
              ]}
            />

            <SettingsSelect
              id="font-size"
              label="Font Size"
              description="Default text size"
              value={settings.fontSize}
              onValueChange={(v) => updateSetting("fontSize", v as "small" | "medium" | "large")}
              options={[
                { value: "small", label: "Small" },
                { value: "medium", label: "Medium" },
                { value: "large", label: "Large" },
              ]}
            />

            <SettingsSelect
              id="line-spacing"
              label="Line Spacing"
              description="Space between lines"
              value={settings.lineSpacing}
              onValueChange={(v) => updateSetting("lineSpacing", v as "compact" | "normal" | "relaxed")}
              options={[
                { value: "compact", label: "Compact" },
                { value: "normal", label: "Normal" },
                { value: "relaxed", label: "Relaxed" },
              ]}
            />
          </SettingsSection>
        </CardContent>
      </Card>
    </div>
  )
}

export function DocumentsSharingSettings() {
  const { settings, updateSetting, isLoaded } = useDocumentsSettingsStorage()

  if (!isLoaded) {
    return <div className="p-4 text-center text-muted-foreground">Loading...</div>
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Sharing & Permissions</CardTitle>
          <CardDescription>Control how documents are shared</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <SettingsSelect
            id="visibility"
            label="Default Visibility"
            description="Default sharing setting for new documents"
            value={settings.defaultVisibility}
            onValueChange={(v) => updateSetting("defaultVisibility", v as "private" | "team" | "workspace")}
            options={[
              { value: "private", label: "Private" },
              { value: "team", label: "Team Only" },
              { value: "workspace", label: "Workspace" },
            ]}
          />

          <SettingsToggle
            id="comments"
            label="Allow Comments"
            description="Let others comment on your documents"
            checked={settings.allowComments}
            onCheckedChange={(v) => updateSetting("allowComments", v)}
          />

          <SettingsToggle
            id="download"
            label="Allow Download"
            description="Allow others to download shared documents"
            checked={settings.allowDownload}
            onCheckedChange={(v) => updateSetting("allowDownload", v)}
          />

          <SettingsToggle
            id="approval"
            label="Require Approval"
            description="Require approval before publishing changes"
            checked={settings.requireApproval}
            onCheckedChange={(v) => updateSetting("requireApproval", v)}
          />
        </CardContent>
      </Card>
    </div>
  )
}

export function DocumentsCollaborationSettings() {
  const { settings, updateSetting, isLoaded } = useDocumentsSettingsStorage()

  if (!isLoaded) {
    return <div className="p-4 text-center text-muted-foreground">Loading...</div>
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Collaboration</CardTitle>
          <CardDescription>Real-time collaboration settings</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <SettingsToggle
            id="cursors"
            label="Show Collaborator Cursors"
            description="See where others are editing"
            checked={settings.showCollaboratorCursors}
            onCheckedChange={(v) => updateSetting("showCollaboratorCursors", v)}
          />

          <SettingsToggle
            id="names"
            label="Show Collaborator Names"
            description="Display names next to cursors"
            checked={settings.showCollaboratorNames}
            onCheckedChange={(v) => updateSetting("showCollaboratorNames", v)}
          />

          <SettingsToggle
            id="tracking"
            label="Change Tracking"
            description="Track changes made by collaborators"
            checked={settings.changeTracking}
            onCheckedChange={(v) => updateSetting("changeTracking", v)}
          />

          <Separator />

          <SettingsSection title="Version Control" description="Document history settings">
            <SettingsToggle
              id="auto-version"
              label="Auto-Versioning"
              description="Automatically create versions"
              checked={settings.autoVersioning}
              onCheckedChange={(v) => updateSetting("autoVersioning", v)}
            />

            <SettingsSlider
              id="max-versions"
              label="Max Versions"
              description="Maximum versions to keep"
              value={settings.maxVersions}
              onValueChange={(v: number[]) => updateSetting("maxVersions", v[0] as number)}
              min={10}
              max={100}
              step={10}
              disabled={!settings.autoVersioning}
            />
          </SettingsSection>
        </CardContent>
      </Card>
    </div>
  )
}

export function DocumentsExportSettings() {
  const { settings, updateSetting, isLoaded } = useDocumentsSettingsStorage()

  if (!isLoaded) {
    return <div className="p-4 text-center text-muted-foreground">Loading...</div>
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Export</CardTitle>
          <CardDescription>Export preferences</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <SettingsSelect
            id="format"
            label="Default Export Format"
            description="Preferred format for exports"
            value={settings.defaultExportFormat}
            onValueChange={(v) => updateSetting("defaultExportFormat", v as "pdf" | "docx" | "md" | "html")}
            options={[
              { value: "pdf", label: "PDF" },
              { value: "docx", label: "Word (DOCX)" },
              { value: "md", label: "Markdown" },
              { value: "html", label: "HTML" },
            ]}
          />

          <SettingsToggle
            id="metadata"
            label="Include Metadata"
            description="Include document metadata in exports"
            checked={settings.includeMetadata}
            onCheckedChange={(v) => updateSetting("includeMetadata", v)}
          />
        </CardContent>
      </Card>
    </div>
  )
}

// Backward compatibility exports
export const DocumentsGeneralSettings = DocumentsEditorSettings
