"use client"

import React from "react"
import { useQuery } from "convex/react"
import { api } from "@/frontend/shared/foundation/utils/convex/any-api"
import type { Id } from "@/convex/_generated/dataModel"
import {
    Settings, Users, Layers, AlertTriangle, ExternalLink, Building2, Shield, Lock, Briefcase, Palette
} from "lucide-react"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { useRouter } from "next/navigation"
import { WorkspaceAppearanceSettings } from "./WorkspaceAppearanceSettings"

// Inline workspace settings categories (previously in constants.ts)
const ALL_WORKSPACE_SETTINGS = [
    { id: "appearance", label: "Appearance", icon: Palette, description: "Icon, color, logo, and theme" },
    { id: "general", label: "General", icon: Building2, description: "Workspace name, description, and icon" },
    { id: "members", label: "Members", icon: Users, description: "Manage team members and invitations" },
    { id: "roles", label: "Roles & Permissions", icon: Shield, description: "Configure access levels" },
    { id: "features", label: "Installed Features", icon: Layers, description: "Enable or disable features" },
    { id: "security", label: "Security", icon: Lock, description: "2FA, sessions, and audit logs" },
    { id: "danger-zone", label: "Danger Zone", icon: AlertTriangle, description: "Delete or transfer workspace" },
]

interface WorkspaceSettingsContentProps {
    workspaceId: Id<"workspaces"> | null
    activeCategory: string
}

export function WorkspaceSettingsContent({ workspaceId, activeCategory }: WorkspaceSettingsContentProps) {
    const router = useRouter()

    const workspace = useQuery(
        api["workspace/workspaces"]?.getWorkspace,
        workspaceId ? { workspaceId } : "skip"
    ) as { name?: string; ownerId?: Id<"users"> } | null | undefined

    const activeSettingInfo = ALL_WORKSPACE_SETTINGS.find(c => c.id === activeCategory) || ALL_WORKSPACE_SETTINGS[0]

    if (!workspaceId) {
        return (
            <div className="flex h-full items-center justify-center">
                <p className="text-muted-foreground">No workspace selected</p>
            </div>
        )
    }

    return (
        <div className="flex flex-col h-full min-h-0">
            {/* Header Section */}
            <div className="flex-shrink-0 mb-6">
                <div>
                    <h3 className="text-lg font-medium tracking-tight mb-1">{activeSettingInfo?.label}</h3>
                    <p className="text-sm text-muted-foreground">{activeSettingInfo?.description}</p>
                </div>
            </div>

            <ScrollArea className="flex-1 min-h-0">
                <div className="space-y-6 pb-6">
                    {/* Appearance Tab - Icon, Color, Logo, Theme */}
                    {activeCategory === "appearance" && workspaceId && (
                        <WorkspaceAppearanceSettings workspaceId={workspaceId} />
                    )}

                    {/* Preferences Tab */}
                    {activeCategory === "preferences" && (
                        <div className="space-y-4">
                            <Card>
                                <CardHeader>
                                    <CardTitle>Theme</CardTitle>
                                    <CardDescription>Customize the appearance for this workspace</CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <p className="text-sm text-muted-foreground">Theme settings will appear here.</p>
                                </CardContent>
                            </Card>
                            <Card>
                                <CardHeader>
                                    <CardTitle>Display Density</CardTitle>
                                    <CardDescription>Adjust spacing and layout density</CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <p className="text-sm text-muted-foreground">Density settings will appear here.</p>
                                </CardContent>
                            </Card>
                        </div>
                    )}

                    {/* Notifications Tab */}
                    {activeCategory === "notifications" && (
                        <div className="space-y-4">
                            <Card>
                                <CardHeader>
                                    <CardTitle>Workspace Notifications</CardTitle>
                                    <CardDescription>Configure how you receive notifications from this workspace</CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <p className="text-sm text-muted-foreground">Notification settings will appear here.</p>
                                </CardContent>
                            </Card>
                        </div>
                    )}

                    {/* General Tab (Admin+) */}
                    {activeCategory === "general" && (
                        <div className="space-y-4">
                            <Card>
                                <CardHeader>
                                    <CardTitle>Workspace Details</CardTitle>
                                    <CardDescription>Update workspace name, description, and icon</CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <p className="text-sm text-muted-foreground">Workspace details form will appear here.</p>
                                </CardContent>
                            </Card>
                        </div>
                    )}

                    {/* Members Tab (Admin+) */}
                    {activeCategory === "members" && (
                        <div className="space-y-4">
                            <Alert>
                                <Users className="h-4 w-4" />
                                <AlertDescription>
                                    For full member management, go to{" "}
                                    <Button
                                        variant="link"
                                        className="h-auto p-0"
                                        onClick={() => router.push("/dashboard/user-management")}
                                    >
                                        User Management
                                        <ExternalLink className="h-3 w-3 ml-1" />
                                    </Button>
                                </AlertDescription>
                            </Alert>
                            <Card>
                                <CardHeader>
                                    <CardTitle>Quick Member Overview</CardTitle>
                                    <CardDescription>View members of this workspace</CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <p className="text-sm text-muted-foreground">Member list will appear here.</p>
                                </CardContent>
                            </Card>
                        </div>
                    )}

                    {/* Features Tab (Admin+) */}
                    {activeCategory === "features" && (
                        <div className="space-y-4">
                            <Alert>
                                <Layers className="h-4 w-4" />
                                <AlertDescription>
                                    For feature installation and management, go to{" "}
                                    <Button
                                        variant="link"
                                        className="h-auto p-0"
                                        onClick={() => router.push("/dashboard/menus")}
                                    >
                                        Menu Store
                                        <ExternalLink className="h-3 w-3 ml-1" />
                                    </Button>
                                </AlertDescription>
                            </Alert>
                            <Card>
                                <CardHeader>
                                    <CardTitle>Installed Features</CardTitle>
                                    <CardDescription>Features enabled in this workspace</CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <p className="text-sm text-muted-foreground">Feature list with settings will appear here.</p>
                                </CardContent>
                            </Card>
                        </div>
                    )}

                    {/* Security Tab (Owner) */}
                    {activeCategory === "security" && (
                        <div className="space-y-4">
                            <Card>
                                <CardHeader>
                                    <CardTitle>Access Control</CardTitle>
                                    <CardDescription>Manage who can access this workspace</CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <p className="text-sm text-muted-foreground">Security settings will appear here.</p>
                                </CardContent>
                            </Card>
                        </div>
                    )}

                    {/* Danger Zone (Owner only) */}
                    {activeCategory === "danger-zone" && (
                        <div className="space-y-4">
                            <Alert variant="destructive">
                                <AlertTriangle className="h-4 w-4" />
                                <AlertDescription>
                                    These actions are destructive and cannot be undone.
                                </AlertDescription>
                            </Alert>
                            <Card className="border-destructive">
                                <CardHeader>
                                    <CardTitle className="text-destructive">Transfer Ownership</CardTitle>
                                    <CardDescription>Transfer this workspace to another user</CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <Button variant="outline" className="text-destructive border-destructive">
                                        Transfer Ownership
                                    </Button>
                                </CardContent>
                            </Card>
                            <Card className="border-destructive">
                                <CardHeader>
                                    <CardTitle className="text-destructive">Delete Workspace</CardTitle>
                                    <CardDescription>Permanently delete this workspace and all its data</CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <Button variant="destructive">
                                        Delete Workspace
                                    </Button>
                                </CardContent>
                            </Card>
                        </div>
                    )}
                </div>
            </ScrollArea>
        </div>
    )
}
