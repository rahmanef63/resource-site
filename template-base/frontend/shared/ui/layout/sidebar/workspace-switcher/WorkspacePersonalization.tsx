/**
 * WorkspacePersonalization Component
 * 
 * Comprehensive dialog for workspace personalization:
 * - Logo upload / Content Library picker
 * - Theme preset selector
 * - Color customization
 * - Icon picker
 */

"use client"

import React, { useState, useMemo } from "react"
import Image from "next/image"
import { useMutation, useQuery } from "convex/react"
import { api } from "@convex/_generated/api"
import { Id } from "@convex/_generated/dataModel"
import { useTheme } from "next-themes"
import { ResponsiveDialog } from "@/frontend/shared/ui/components/ResponsiveDialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
import {
    Palette,
    ImageIcon,
    Check,
    Loader2,
    Search,
    Building2,
    Home,
    Users,
    Heart,
    Briefcase,
    Star,
    Folder,
    Globe,
    Zap,
    Shield,
    Settings,
    Rocket,
} from "lucide-react"
import { WorkspaceIcon } from "./WorkspaceIcon"
import { WorkspaceLogoUpload } from "./WorkspaceLogoUpload"
import { DEFAULT_WORKSPACE_COLOR, WORKSPACE_COLORS } from "@/frontend/shared/constants/colors"
import { cn } from "@/lib/utils"
import { toast } from "sonner"

// Available icons for workspace
const WORKSPACE_ICONS = [
    { name: "Building2", icon: Building2 },
    { name: "Home", icon: Home },
    { name: "Users", icon: Users },
    { name: "Heart", icon: Heart },
    { name: "Briefcase", icon: Briefcase },
    { name: "Star", icon: Star },
    { name: "Folder", icon: Folder },
    { name: "Globe", icon: Globe },
    { name: "Zap", icon: Zap },
    { name: "Shield", icon: Shield },
    { name: "Settings", icon: Settings },
    { name: "Rocket", icon: Rocket },
]

interface RegistryTheme {
    name: string
    label: string
    activeColor: { light: string; dark: string }
    cssVars: { light: Record<string, string>; dark: Record<string, string> }
}

interface WorkspacePersonalizationProps {
    workspaceId: Id<"workspaces">
    open: boolean
    onOpenChange: (open: boolean) => void
}

export function WorkspacePersonalization({
    workspaceId,
    open,
    onOpenChange,
}: WorkspacePersonalizationProps) {
    const { theme } = useTheme()
    const [activeTab, setActiveTab] = useState("appearance")
    const [registryThemes, setRegistryThemes] = useState<RegistryTheme[]>([])
    const [loadingThemes, setLoadingThemes] = useState(true)
    const [searchQuery, setSearchQuery] = useState("")
    const [isSaving, setIsSaving] = useState(false)

    // Get workspace data
    const workspace = useQuery(api.workspace.workspaces.getWorkspace, { workspaceId })

    // Get workspace logo URL
    const logoUrl = useQuery(api.workspace.storage.getWorkspaceLogoUrl, { workspaceId })
    const themeState = useQuery(api.workspace.storage.getWorkspaceEffectiveTheme, { workspaceId })

    // Get images from Content Library
    const contentImages = useQuery(
        api.shared.content.queries.list,
        { workspaceId, type: "image", status: "ready", limit: 50 }
    )

    // Mutations
    const updateWorkspace = useMutation(api.workspace.workspaces.updateWorkspace)
    const saveWorkspaceLogo = useMutation(api.workspace.storage.saveWorkspaceLogo)
    const updateWorkspaceThemePreference = useMutation(
        api.workspace.storage.updateWorkspaceThemePreference
    )

    // Load themes from registry
    React.useEffect(() => {
        const loadThemes = async () => {
            try {
                const response = await fetch("/r/registry.json")
                if (response.ok) {
                    const data = await response.json()
                    const themes = data.items.map((item: any): RegistryTheme => ({
                        name: item.name,
                        label: item.title,
                        activeColor: {
                            light: item.cssVars.light.primary || "var(--primary)",
                            dark: item.cssVars.dark.primary || "var(--primary)",
                        },
                        cssVars: item.cssVars,
                    }))
                    setRegistryThemes(themes)
                }
            } catch (error) {
                console.error("Failed to load themes:", error)
            } finally {
                setLoadingThemes(false)
            }
        }
        if (open) loadThemes()
    }, [open])

    // Current workspace values
    const currentIcon = workspace?.icon
    const currentColor = (workspace as any)?.color ?? DEFAULT_WORKSPACE_COLOR
    const currentTheme = themeState?.userThemePreset ?? null

    // Handlers
    const handleIconChange = async (iconName: string) => {
        setIsSaving(true)
        try {
            await updateWorkspace({ workspaceId, icon: iconName })
            toast.success("Icon updated")
        } catch (error) {
            console.error("Failed to update icon:", error)
            toast.error("Failed to update icon")
        } finally {
            setIsSaving(false)
        }
    }

    const handleColorChange = async (color: string) => {
        setIsSaving(true)
        try {
            await updateWorkspace({ workspaceId, color })
            toast.success("Color updated")
        } catch (error) {
            console.error("Failed to update color:", error)
            toast.error("Failed to update color")
        } finally {
            setIsSaving(false)
        }
    }

    const handleThemeChange = async (themeName: string) => {
        setIsSaving(true)
        try {
            await updateWorkspaceThemePreference({
                workspaceId,
                themePreset: themeName || undefined,
            })
            toast.success(
                themeName
                    ? "Theme preset saved for this workspace"
                    : "Workspace theme override cleared"
            )
        } catch (error) {
            console.error("Failed to update theme:", error)
            toast.error("Failed to update theme")
        } finally {
            setIsSaving(false)
        }
    }

    const handleSelectFromLibrary = async (storageId: Id<"_storage">) => {
        setIsSaving(true)
        try {
            await saveWorkspaceLogo({ workspaceId, storageId })
        } catch (error) {
            console.error("Failed to set logo from library:", error)
        } finally {
            setIsSaving(false)
        }
    }

    // Filter content library images
    const filteredImages = useMemo(() => {
        const items = contentImages?.items ?? []
        if (!searchQuery) return items
        return items.filter((img: any) =>
            img.name?.toLowerCase().includes(searchQuery.toLowerCase())
        )
    }, [contentImages?.items, searchQuery])

    const isDark = theme === "dark"

    return (
        <ResponsiveDialog open={open} onOpenChange={onOpenChange} variant="modal" size="lg">
            <ResponsiveDialog.Header>
                <ResponsiveDialog.Title className="flex items-center gap-3">
                    <WorkspaceIcon
                        workspaceId={workspaceId}
                        name={workspace?.name || "W"}
                        size="lg"
                    />
                    <span>Personalize Workspace</span>
                </ResponsiveDialog.Title>
                <ResponsiveDialog.Description>
                    Customize the look and feel of {workspace?.name || "your workspace"}
                </ResponsiveDialog.Description>
            </ResponsiveDialog.Header>

            <ResponsiveDialog.Body className="px-4 py-4 sm:px-6">
                <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1">
                    <TabsList className="flex w-full justify-evenly">
                        <TabsTrigger value="appearance">Appearance</TabsTrigger>
                        <TabsTrigger value="logo">Logo</TabsTrigger>
                        <TabsTrigger value="theme">Theme</TabsTrigger>
                    </TabsList>

                    <ScrollArea className="h-[55vh] mt-4 pr-4">
                        {/* Appearance Tab - Icon & Color */}
                        <TabsContent value="appearance" className="space-y-6 mt-0">
                            {/* Icon Picker */}
                            <div className="space-y-3">
                                <Label className="text-sm font-medium">Workspace Icon</Label>
                                <p className="text-xs text-muted-foreground">
                                    Choose an icon to represent your workspace
                                </p>
                                <div className="grid grid-cols-6 gap-2">
                                    {WORKSPACE_ICONS.map(({ name, icon: Icon }) => (
                                        <button
                                            key={name}
                                            onClick={() => handleIconChange(name)}
                                            className={cn(
                                                "flex items-center justify-center size-12 rounded-lg border-2 transition-all hover:bg-accent",
                                                currentIcon === name
                                                    ? "border-primary bg-primary/10"
                                                    : "border-transparent"
                                            )}
                                        >
                                            <Icon className="size-5" />
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <Separator />

                            {/* Color Picker */}
                            <div className="space-y-3">
                                <Label className="text-sm font-medium">Workspace Color</Label>
                                <p className="text-xs text-muted-foreground">
                                    Color used for the workspace icon background
                                </p>
                                <div className="flex flex-wrap gap-2">
                                    {WORKSPACE_COLORS.map((colorItem) => (
                                        <button
                                            key={colorItem.value}
                                            onClick={() => handleColorChange(colorItem.value)}
                                            className={cn(
                                                "size-8 rounded-full border-2 transition-all hover:scale-110",
                                                colorItem.value === currentColor
                                                    ? "border-foreground scale-110"
                                                    : "border-transparent"
                                            )}
                                            style={{ backgroundColor: colorItem.value }}
                                            title={colorItem.name}
                                        >
                                            {colorItem.value === currentColor && (
                                                <Check className="size-4 text-white mx-auto" />
                                            )}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </TabsContent>

                        {/* Logo Tab */}
                        <TabsContent value="logo" className="space-y-6 mt-0">
                            {/* Direct Upload */}
                            <div className="space-y-3">
                                <Label className="text-sm font-medium">Upload Logo</Label>
                                <WorkspaceLogoUpload
                                    workspaceId={workspaceId}
                                    currentLogoUrl={logoUrl}
                                    workspaceName={workspace?.name}
                                    onUploadComplete={() => { }}
                                />
                            </div>

                            <Separator />

                            {/* Content Library Picker */}
                            <div className="space-y-3">
                                <Label className="text-sm font-medium">Select from Content Library</Label>
                                <p className="text-xs text-muted-foreground">
                                    Choose an existing image from your content library
                                </p>

                                {/* Search */}
                                <div className="relative">
                                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                                    <Input
                                        placeholder="Search images..."
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        className="pl-9"
                                    />
                                </div>

                                {/* Image Grid */}
                                <div className="grid grid-cols-4 gap-2 max-h-48 overflow-y-auto">
                                    {filteredImages.length === 0 ? (
                                        <div className="col-span-4 py-8 text-center text-muted-foreground">
                                            <ImageIcon className="size-8 mx-auto mb-2 opacity-50" />
                                            <p className="text-sm">No images found</p>
                                        </div>
                                    ) : (
                                        filteredImages.map((img: any) => (
                                         <button
                                             key={img._id}
                                             onClick={() => img.storageId && handleSelectFromLibrary(img.storageId)}
                                             className="relative aspect-square rounded-lg border-2 overflow-hidden hover:border-primary transition-colors"
                                         >
                                             {img.fileUrl ? (
                                                 <Image
                                                     src={img.fileUrl}
                                                     alt={img.name}
                                                     fill
                                                     className="object-cover"
                                                     sizes="(max-width: 768px) 25vw, 96px"
                                                 />
                                             ) : (
                                                 <div className="w-full h-full bg-muted flex items-center justify-center">
                                                     <ImageIcon className="size-6 text-muted-foreground" />
                                                 </div>
                                             )}
                                            </button>
                                        ))
                                    )}
                                </div>
                            </div>
                        </TabsContent>

                        {/* Theme Tab */}
                        <TabsContent value="theme" className="space-y-4 mt-0">
                            <div className="space-y-2">
                                <Label className="text-sm font-medium">Theme Preset</Label>
                                <p className="text-xs text-muted-foreground">
                                    Choose a theme preset for your view of this workspace.
                                </p>
                            </div>

                            {loadingThemes ? (
                                <div className="flex items-center justify-center py-8">
                                    <Loader2 className="size-6 animate-spin" />
                                </div>
                            ) : (
                                <div className="space-y-2">
                                    {/* Clear theme option */}
                                    <button
                                        onClick={() => handleThemeChange("")}
                                        className={cn(
                                            "w-full flex items-center gap-3 p-3 rounded-lg border transition-colors",
                                            !currentTheme
                                                ? "border-primary bg-primary/5"
                                                : "border-border hover:bg-accent"
                                        )}
                                    >
                                        <div className="size-6 rounded-full border-2 border-dashed border-muted-foreground" />
                                        <div className="flex-1 text-left">
                                            <p className="text-sm font-medium">Use Workspace Default</p>
                                            <p className="text-xs text-muted-foreground">
                                                Clear your override and follow the workspace or global default.
                                            </p>
                                        </div>
                                        {!currentTheme && <Check className="size-4 text-primary" />}
                                    </button>

                                    {/* Theme options */}
                                    {registryThemes.map((t) => {
                                        const isActive = currentTheme === t.name
                                        return (
                                            <button
                                                key={t.name}
                                                onClick={() => handleThemeChange(t.name)}
                                                className={cn(
                                                    "w-full flex items-center gap-3 p-3 rounded-lg border transition-colors",
                                                    isActive
                                                        ? "border-primary bg-primary/5"
                                                        : "border-border hover:bg-accent"
                                                )}
                                            >
                                                <div
                                                    className="size-6 rounded-full border-2 border-border"
                                                    style={{
                                                        backgroundColor: isDark
                                                            ? t.activeColor.dark
                                                            : t.activeColor.light,
                                                    }}
                                                />
                                                <div className="flex-1 text-left">
                                                    <p className="text-sm font-medium">{t.label}</p>
                                                </div>
                                                {isActive && <Check className="size-4 text-primary" />}
                                            </button>
                                        )
                                    })}
                                </div>
                            )}
                        </TabsContent>
                    </ScrollArea>
                </Tabs>

                {/* Saving Indicator */}
                {isSaving && (
                    <div className="absolute top-4 right-4 flex items-center gap-2 text-sm text-muted-foreground">
                        <Loader2 className="size-4 animate-spin" />
                        Saving...
                    </div>
                )}
            </ResponsiveDialog.Body>
        </ResponsiveDialog>
    )
}

export default WorkspacePersonalization
