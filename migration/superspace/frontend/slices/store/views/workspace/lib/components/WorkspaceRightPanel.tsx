/**
 * Workspace Right Panel Component
 * 
 * Preview or settings panel for selected features
 */

"use client"

import * as React from "react"
import { Button } from "@/components/ui/button"
import { ContainerHeader } from "@/frontend/shared/ui/layout/header"
import { PanelSection } from "@/frontend/shared/ui/layout/container/three-column"
import { PreviewPanel } from "@/frontend/shared/preview"
import { FeatureSettingsPanel } from "@/frontend/shared/settings/components/FeatureSettingsPanel"
import { SettingsRegistryProvider } from "@/frontend/shared/settings"
import { Eye, X } from "lucide-react"
import type { FeaturePreviewConfig } from "@/frontend/shared/preview"

export interface WorkspaceRightPanelProps {
    mode: "preview" | "settings"
    selectedFeatureId: string | null
    selectedSettingsSlug: string | null
    previewVisible: boolean
    settingsVisible: boolean
    featurePreviews: FeaturePreviewConfig[]
    onClose: () => void
}

export function WorkspaceRightPanel({
    mode,
    selectedFeatureId,
    selectedSettingsSlug,
    previewVisible,
    settingsVisible,
    featurePreviews,
    onClose
}: WorkspaceRightPanelProps) {
    const selectedFeatureConfig = React.useMemo(() => {
        if (!selectedFeatureId) return null
        return featurePreviews.find((f) => f.featureId === selectedFeatureId) ?? null
    }, [selectedFeatureId, featurePreviews])

    // Preview mode
    if (mode === "preview") {
        return (
            <PanelSection label="Feature preview">
                <PanelSection.Header>
                    <ContainerHeader
                        title={selectedFeatureConfig?.name ?? "Preview"}
                        subtitle={selectedFeatureConfig?.description ?? "Select a feature to preview"}
                        icon={Eye}
                        actions={
                            previewVisible && selectedFeatureId && (
                                <Button aria-label="Close"
                                    variant="ghost"
                                    size="icon"
                                    className="h-7 w-7"
                                    onClick={onClose}
                                >
                                    <X className="h-3.5 w-3.5" />
                                </Button>
                            )
                        }
                    />
                </PanelSection.Header>

                <PanelSection.Items>
                    <PreviewPanel
                        featureId={selectedFeatureId}
                        visible={previewVisible}
                        onClose={onClose}
                        hideHeader
                    />
                </PanelSection.Items>
            </PanelSection>
        )
    }

    // Settings mode
    if (mode === "settings" && settingsVisible && selectedSettingsSlug) {
        return (
            <PanelSection label="Feature settings">
                <PanelSection.Items>
                    <SettingsRegistryProvider>
                        <FeatureSettingsPanel featureSlug={selectedSettingsSlug} />
                    </SettingsRegistryProvider>
                </PanelSection.Items>
            </PanelSection>
        )
    }

    return null
}
