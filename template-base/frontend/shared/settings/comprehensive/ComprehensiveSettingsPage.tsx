"use client"

import * as React from "react"
import { TwoTabSettingsLayout, SettingsId, SettingsTabType, SettingsMenuSection } from "./layout"
import { ActivityUsageSettings } from "./sections/ActivityUsageSettings"
import { AIExperienceSettings } from "./sections/AIExperienceSettings"
import { PrivacySettings } from "./sections/PrivacySettings"
import { FamilySettings } from "./sections/FamilySettings"
import { PersonalizationSettings } from "../personal/PersonalizationSettings"
import { WorkspaceSettingsContent } from "../workspace/WorkspaceSettingsContent"
import { useWorkspaceContext } from "@/frontend/shared/foundation/provider/WorkspaceProvider"
import { Id } from "@/convex/_generated/dataModel"
import { Separator } from "@/components/ui/separator"
import { useQuery } from "convex/react"
import { api } from "@/frontend/shared/foundation/utils/convex/any-api"
import {
    getFeatureSettingsBuilder,
    getAllRegisteredFeatures
} from "@/frontend/shared/foundation/utils/registry/feature-settings-registry"
import { Settings } from "lucide-react"

// Placeholder for sections not yet implemented
const PlaceholderSettings = ({ title }: { title: string }) => (
    <div className="space-y-6">
        <div>
            <h3 className="text-lg font-medium">{title}</h3>
            <p className="text-sm text-muted-foreground">Configure {title.toLowerCase()} settings below.</p>
        </div>
        <Separator />
        <div className="h-40 rounded-lg border border-dashed flex items-center justify-center text-muted-foreground bg-muted/10">
            <div className="text-center">
                <p className="font-medium">{title}</p>
                <p className="text-xs">Settings will appear here</p>
            </div>
        </div>
    </div>
)

// No features placeholder
const NoFeaturesPlaceholder = () => (
    <div className="space-y-6">
        <div>
            <h3 className="text-lg font-medium">Feature Settings</h3>
            <p className="text-sm text-muted-foreground">Configure settings for your installed features.</p>
        </div>
        <Separator />
        <div className="h-60 rounded-lg border border-dashed flex items-center justify-center text-muted-foreground bg-muted/10">
            <div className="text-center space-y-2">
                <Settings className="h-10 w-10 mx-auto opacity-50" />
                <p className="font-medium">No Feature Settings Available</p>
                <p className="text-xs max-w-xs">Install features from the Feature Store to see their settings here.</p>
            </div>
        </div>
    </div>
)

interface ComprehensiveSettingsPageProps {
    defaultTab?: SettingsTabType
    defaultId?: SettingsId
    defaultFeatureSlug?: string
}

// Helper to capitalize feature name
function capitalizeFeatureName(slug: string): string {
    return slug
        .split(/[-_]/)
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ')
}

export function ComprehensiveSettingsPage({
    defaultTab = "workspace",
    defaultId,
    defaultFeatureSlug
}: ComprehensiveSettingsPageProps) {
    const [activeTab, setActiveTab] = React.useState<SettingsTabType>(defaultTab)
    const [activeId, setActiveId] = React.useState<SettingsId>(
        defaultId || (defaultTab === "workspace" ? "ws_appearance" : defaultTab === "features" ? "ft_settings" : "gl_activity")
    )
    const [activeFeatureSlug, setActiveFeatureSlug] = React.useState<string | undefined>(defaultFeatureSlug)

    const { workspaceId } = useWorkspaceContext()

    // Fetch workspace name for display
    const workspaceData = useQuery(
        api["workspace/workspaces"]?.getWorkspace,
        workspaceId ? { workspaceId: workspaceId as Id<"workspaces"> } : "skip"
    ) as { name?: string } | null | undefined

    // Build menu for ALL features with registered settings
    const allFeaturesMenu = React.useMemo((): SettingsMenuSection[] => {
        const registeredFeatures = getAllRegisteredFeatures()

        if (registeredFeatures.length === 0) {
            return []
        }

        const sections: SettingsMenuSection[] = []

        registeredFeatures.forEach(featureSlug => {
            const builder = getFeatureSettingsBuilder(featureSlug)
            if (!builder) return

            const defaultCtx = {
                menuItem: {
                    id: featureSlug,
                    name: featureSlug,
                    slug: featureSlug,
                    icon: 'Settings'
                } as any
            }
            const items = builder(defaultCtx)

            if (items.length > 0) {
                sections.push({
                    label: capitalizeFeatureName(featureSlug),
                    items: items.map(item => ({
                        id: `${featureSlug}::${item.id}`, // Prefix with feature slug for uniqueness
                        label: item.label,
                        icon: item.icon || Settings
                    }))
                })
            }
        })

        return sections
    }, [])

    // Parse activeId to get feature slug and setting id
    const parseActiveId = React.useCallback((id: SettingsId): { featureSlug: string | null, settingId: string } => {
        if (id.includes('::')) {
            const [featureSlug, settingId] = id.split('::')
            return { featureSlug, settingId }
        }
        return { featureSlug: null, settingId: id }
    }, [])

    // Update state if props change (re-opening dialog with new args)
    React.useEffect(() => {
        if (!defaultTab && !defaultFeatureSlug && !defaultId) return
        setActiveTab(defaultTab)

        if (defaultTab === "features" && defaultFeatureSlug) {
            const builder = getFeatureSettingsBuilder(defaultFeatureSlug)
            const defaultCtx = { menuItem: { id: defaultFeatureSlug, name: defaultFeatureSlug, slug: defaultFeatureSlug, icon: 'Settings' } as any }
            const items = builder ? builder(defaultCtx) : []
            if (items.length > 0) {
                // Use prefixed ID format
                const prefixedId = `${defaultFeatureSlug}::${items[0].id}`
                setActiveId(prefixedId)
            } else {
                setActiveId("ft_settings")
            }
            setActiveFeatureSlug(defaultFeatureSlug)
        } else if (defaultTab === "features") {
            // If no specific feature, select first available
            if (allFeaturesMenu.length > 0 && allFeaturesMenu[0].items.length > 0) {
                setActiveId(allFeaturesMenu[0].items[0].id)
            } else {
                setActiveId("ft_settings")
            }
        } else {
            setActiveId(defaultId || (defaultTab === "workspace" ? "ws_appearance" : "gl_activity"))
            setActiveFeatureSlug(undefined)
        }
    }, [defaultTab, defaultId, defaultFeatureSlug, allFeaturesMenu])

    // Reset activeId when tab changes
    const handleTabChange = (tab: SettingsTabType) => {
        setActiveTab(tab)
        // Set default item for each tab
        if (tab === "workspace") {
            setActiveId("ws_appearance")
        } else if (tab === "features") {
            // Select first available feature setting
            if (allFeaturesMenu.length > 0 && allFeaturesMenu[0].items.length > 0) {
                setActiveId(allFeaturesMenu[0].items[0].id)
            } else {
                setActiveId("ft_settings")
            }
        } else {
            setActiveId("gl_activity")
        }
    }

    // Handle navigation - update active feature slug when navigating
    const handleNavigate = (id: SettingsId) => {
        setActiveId(id)
        const { featureSlug } = parseActiveId(id)
        if (featureSlug) {
            setActiveFeatureSlug(featureSlug)
        }
    }

    const renderContent = () => {
        // ==========================================
        // Workspace Settings (This Workspace tab)
        // ==========================================
        if (activeTab === "workspace") {
            switch (activeId) {
                case "ws_appearance":
                    return <WorkspaceSettingsContent workspaceId={workspaceId as Id<"workspaces">} activeCategory="appearance" />
                case "ws_general":
                    return <WorkspaceSettingsContent workspaceId={workspaceId as Id<"workspaces">} activeCategory="general" />
                case "ws_members":
                    return <WorkspaceSettingsContent workspaceId={workspaceId as Id<"workspaces">} activeCategory="members" />
                case "ws_roles":
                    return <WorkspaceSettingsContent workspaceId={workspaceId as Id<"workspaces">} activeCategory="roles" />
                case "ws_features":
                    return <WorkspaceSettingsContent workspaceId={workspaceId as Id<"workspaces">} activeCategory="features" />
                case "ws_menus":
                    return <PlaceholderSettings title="Menu Store" />
                case "ws_security":
                    return <WorkspaceSettingsContent workspaceId={workspaceId as Id<"workspaces">} activeCategory="security" />
                case "ws_billing":
                    return <PlaceholderSettings title="Billing & Plans" />
                case "ws_danger":
                    return <PlaceholderSettings title="Danger Zone" />
                default:
                    return <PlaceholderSettings title="Workspace Settings" />
            }
        }

        // ==========================================
        // Features Settings (Features tab)
        // ==========================================
        if (activeTab === "features") {
            // Check if we have any features
            if (allFeaturesMenu.length === 0) {
                return <NoFeaturesPlaceholder />
            }

            // Parse the active ID to get feature and setting
            const { featureSlug, settingId } = parseActiveId(activeId)

            if (featureSlug) {
                const builder = getFeatureSettingsBuilder(featureSlug)
                if (builder) {
                    const defaultCtx = {
                        menuItem: {
                            id: featureSlug,
                            name: featureSlug,
                            slug: featureSlug,
                            icon: 'Settings'
                        } as any
                    }
                    const items = builder(defaultCtx)
                    const activeItem = items.find(item => item.id === settingId)

                    if (activeItem && activeItem.component) {
                        const Component = activeItem.component
                        return <Component />
                    }
                }
            }

            // Fallback
            return <PlaceholderSettings title="Feature Settings" />
        }

        // ==========================================
        // Global Settings (Global tab)
        // ==========================================
        switch (activeId) {
            // Your Experience
            case "gl_activity": return <ActivityUsageSettings />
            case "gl_ai": return <AIExperienceSettings />
            case "gl_productivity": return <PlaceholderSettings title="Productivity Preferences" />

            // Privacy & Visibility
            case "gl_privacy":
            case "gl_discovery":
                return <PrivacySettings />

            // App & Media
            case "gl_theme": return <PersonalizationSettings />
            case "gl_notifications": return <PlaceholderSettings title="Notification Preferences" />
            case "gl_devices": return <PlaceholderSettings title="Manage Devices" />

            // Account
            case "gl_account": return <PlaceholderSettings title="Account Settings" />
            case "gl_help": return <PlaceholderSettings title="Help & Support" />

            default:
                return <PlaceholderSettings title="Global Settings" />
        }
    }

    return (
        <TwoTabSettingsLayout
            activeTab={activeTab}
            activeId={activeId}
            onTabChange={handleTabChange}
            onNavigate={handleNavigate}
            workspaceName={workspaceData?.name || "Current Workspace"}
            featuresMenu={allFeaturesMenu.length > 0 ? allFeaturesMenu : undefined}
        >
            {renderContent()}
        </TwoTabSettingsLayout>
    )
}

