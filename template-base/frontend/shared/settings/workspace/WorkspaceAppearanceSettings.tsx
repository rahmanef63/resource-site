"use client"

import { InlineWorkspaceColorPicker } from "@/frontend/shared/workspace"
import { IconPicker } from "@/frontend/shared/ui/icons/components/icon-picker"

/**
 * WorkspaceAppearanceSettings
 * 
 * Consolidated appearance settings for workspace:
 * - Icon picker
 * - Color picker
 * - Logo upload
 * - Theme selector
 * 
 * Used in Settings dialog as the "Appearance" tab
 */

import React, { useState, useMemo } from "react"
import Image from "next/image"
import { useMutation, useQuery } from "convex/react"
import { api } from "@convex/_generated/api"
import { Id } from "@convex/_generated/dataModel"
import { useTheme } from "next-themes"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
import {
    Palette,
    Upload,
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
    X,
} from "lucide-react"
import { DEFAULT_WORKSPACE_COLOR, WORKSPACE_COLORS } from "@/frontend/shared/constants/colors"
import { cn } from "@/lib/utils"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"

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
}

interface WorkspaceAppearanceSettingsProps {
    workspaceId: Id<"workspaces">
}

export function WorkspaceAppearanceSettings({ workspaceId }: WorkspaceAppearanceSettingsProps) {
    const { theme } = useTheme()
    const [registryThemes, setRegistryThemes] = useState<RegistryTheme[]>([])
    const [loadingThemes, setLoadingThemes] = useState(true)
    const [isSaving, setIsSaving] = useState(false)
    const [searchQuery, setSearchQuery] = useState("")

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
    const deleteWorkspaceLogo = useMutation(api.workspace.storage.deleteWorkspaceLogo)
    const generateUploadUrl = useMutation(api.workspace.storage.generateLogoUploadUrl)
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
                            light: item.cssVars?.light?.primary || "var(--primary)",
                            dark: item.cssVars?.dark?.primary || "var(--primary)",
                        },
                    }))
                    setRegistryThemes(themes)
                }
            } catch (error) {
                console.error("Failed to load themes:", error)
            } finally {
                setLoadingThemes(false)
            }
        }
        loadThemes()
    }, [])

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

    const handleLogoUpload = async (file: File) => {
        if (file.size > 1024 * 1024) {
            toast.error("File size must be less than 1MB")
            return
        }

        setIsSaving(true)
        try {
            const uploadUrl = await generateUploadUrl({ workspaceId })
            const response = await fetch(uploadUrl, {
                method: "POST",
                headers: { "Content-Type": file.type },
                body: file,
            })
            const { storageId } = await response.json()
            await saveWorkspaceLogo({ workspaceId, storageId })
            toast.success("Logo uploaded")
        } catch (error) {
            console.error("Failed to upload logo:", error)
            toast.error("Failed to upload logo")
        } finally {
            setIsSaving(false)
        }
    }

    const handleLogoDelete = async () => {
        setIsSaving(true)
        try {
            await deleteWorkspaceLogo({ workspaceId })
            toast.success("Logo removed")
        } catch (error) {
            console.error("Failed to delete logo:", error)
            toast.error("Failed to remove logo")
        } finally {
            setIsSaving(false)
        }
    }

    const handleSelectFromLibrary = async (storageId: Id<"_storage">) => {
        setIsSaving(true)
        try {
            await saveWorkspaceLogo({ workspaceId, storageId })
            toast.success("Logo updated")
        } catch (error) {
            console.error("Failed to set logo:", error)
            toast.error("Failed to set logo")
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

    const SelectedIcon = useMemo(() => {
        return WORKSPACE_ICONS.find(i => i.name === currentIcon)?.icon || Building2
    }, [currentIcon])

    return (
        <ScrollArea className="h-full pr-4">
            <div className="space-y-6 pb-20">
                {/* Icon & Color Card */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Palette className="size-5" />
                            Icon & Color
                        </CardTitle>
                        <CardDescription>
                            Customize how this workspace appears in the sidebar
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {/* Icon Picker */}
                        <div className="space-y-3">
                        <Label className="text-sm font-medium">Workspace Icon</Label>
                        <div className="w-full">
                            <IconPicker
                                icon={currentIcon as any || "Building2"}
                                onIconChange={handleIconChange}
                                trigger={
                                    <Button
                                        variant="outline"
                                        className="w-full justify-start h-10 px-3 font-normal"
                                    >
                                        <div className="mr-2 flex items-center justify-center size-5 rounded-md bg-muted">
                                            <SelectedIcon className="size-3.5" />
                                        </div>
                                        <span className="flex-1 text-left">{currentIcon || "Select Icon"}</span>
                                        <span className="opacity-50 text-xs">Click to change</span>
                                    </Button>
                                }
                            />
                        </div>
                    </div>

                    <Separator />

                    {/* Color Picker */}
                    <div className="space-y-3">
                        <Label className="text-sm font-medium">Workspace Color</Label>
                        <InlineWorkspaceColorPicker
                            value={currentColor}
                            onChange={handleColorChange}
                        />
                    </div>
                    </CardContent>
                </Card>

            {/* Logo Card */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <ImageIcon className="size-5" />
                        Workspace Logo
                    </CardTitle>
                    <CardDescription>
                        Upload a custom logo image (max 1MB, PNG/JPEG/SVG/WebP)
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    {/* Current Logo Preview */}
                    {logoUrl && (
                        <div className="flex items-center gap-4">
                            <Image
                                src={logoUrl}
                                alt="Current logo"
                                width={64}
                                height={64}
                                className="size-16 rounded-lg object-cover border"
                            />
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={handleLogoDelete}
                                className="text-destructive"
                            >
                                <X className="size-4 mr-1" />
                                Remove
                            </Button>
                        </div>
                    )}

                    {/* Upload Button */}
                    <div className="flex items-center gap-2">
                        <Button
                            variant="outline"
                            onClick={() => document.getElementById("logo-upload")?.click()}
                        >
                            <Upload className="size-4 mr-2" />
                            Upload Logo
                        </Button>
                        <input
                            id="logo-upload"
                            type="file"
                            accept="image/png,image/jpeg,image/svg+xml,image/webp"
                            className="hidden"
                            onChange={(e) => {
                                const file = e.target.files?.[0]
                                if (file) handleLogoUpload(file)
                            }}
                        />
                    </div>

                    <Separator />

                    {/* Content Library Picker */}
                    <div className="space-y-3">
                        <Label className="text-sm font-medium">Or select from Content Library</Label>
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                            <Input
                                placeholder="Search images..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="pl-9"
                            />
                        </div>
                        <div className="grid grid-cols-5 gap-2 max-h-32 overflow-y-auto">
                            {filteredImages.length === 0 ? (
                                <div className="col-span-5 py-4 text-center text-muted-foreground text-sm">
                                    No images found
                                </div>
                            ) : (
                                filteredImages.slice(0, 10).map((img: any) => (
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
                                                sizes="(max-width: 768px) 20vw, 64px"
                                            />
                                        ) : (
                                            <div className="w-full h-full bg-muted flex items-center justify-center">
                                                <ImageIcon className="size-4 text-muted-foreground" />
                                            </div>
                                        )}
                                    </button>
                                ))
                            )}
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Theme Card */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Palette className="size-5" />
                        Workspace Theme
                    </CardTitle>
                    <CardDescription>
                        Choose a theme preset for your view of this workspace.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    {loadingThemes ? (
                        <div className="flex items-center justify-center py-4">
                            <Loader2 className="size-5 animate-spin" />
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
                                <div className="size-5 rounded-full border-2 border-dashed border-muted-foreground" />
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
                                            className="size-5 rounded-full border"
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
                </CardContent>
            </Card>

            {/* Saving Indicator */}
            {isSaving && (
                <div className="fixed bottom-4 right-4 flex items-center gap-2 bg-background border rounded-lg px-4 py-2 shadow-lg">
                    <Loader2 className="size-4 animate-spin" />
                    <span className="text-sm">Saving...</span>
                </div>
            )}
        </div>
        </ScrollArea>
    )
}

export default WorkspaceAppearanceSettings
