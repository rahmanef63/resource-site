"use client"

import * as React from "react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/tooltip"
import { useIsMobile } from "@/hooks/use-mobile"
import { ChevronLeft, ChevronRight, ChevronDown, X, PanelLeftClose, PanelLeftOpen } from "lucide-react"
import {
    User,
    Shield,
    Bell,
    Monitor,
    Smartphone,
    HelpCircle,
    Globe,
    Briefcase,
    Users,
    Activity,
    BrainCircuit,
    Lock,
    MessageCircle,
    Layout,
    FileImage,
    Settings,
    Building2,
    Puzzle
} from "lucide-react"
import {
    Sheet,
    SheetContent,
    SheetHeader,
    SheetTitle,
    SheetTrigger,
} from "@/components/ui/sheet"

// ============================================================
// Types
// ============================================================
export type SettingsTabType = "workspace" | "features" | "global"
export type SettingsId = string

export interface SettingsMenuItem {
    id: SettingsId
    label: string
    icon?: React.ElementType
    description?: string
}

export interface SettingsMenuSection {
    label: string
    items: SettingsMenuItem[]
}

// ============================================================
// Workspace Settings Menu (This Workspace tab)
// ============================================================
export const WORKSPACE_SETTINGS_MENU: SettingsMenuSection[] = [
    {
        label: "Workspace",
        items: [
            { id: "ws_appearance", label: "Appearance", icon: FileImage, description: "Icon, color, logo, and theme" },
            { id: "ws_general", label: "General", icon: Building2, description: "Workspace name, description, and icon" },
            { id: "ws_members", label: "Members", icon: Users, description: "Manage team members and invitations" },
            { id: "ws_roles", label: "Roles & Permissions", icon: Shield, description: "Configure access levels" },
        ]
    },
    {
        label: "Features",
        items: [
            { id: "ws_features", label: "Installed Features", icon: Layout, description: "Enable or disable features" },
            { id: "ws_menus", label: "Menu Store", icon: Settings, description: "Customize sidebar menus" },
        ]
    },
    {
        label: "Advanced",
        items: [
            { id: "ws_security", label: "Security", icon: Lock, description: "2FA, sessions, and audit logs" },
            { id: "ws_billing", label: "Billing", icon: Briefcase, description: "Plans and payment methods" },
            { id: "ws_danger", label: "Danger Zone", icon: Shield, description: "Delete or transfer workspace" },
        ]
    }
]

// ============================================================
// Global Settings Menu (Global tab)
// ============================================================
export const GLOBAL_SETTINGS_MENU: SettingsMenuSection[] = [
    {
        label: "Your Experience",
        items: [
            { id: "gl_activity", label: "Activity & Usage", icon: Activity, description: "Login history and sessions" },
            { id: "gl_ai", label: "AI Experience", icon: BrainCircuit, description: "AI assistance preferences" },
            { id: "gl_productivity", label: "Productivity", icon: Globe, description: "Defaults and shortcuts" },
        ]
    },
    {
        label: "Privacy & Visibility",
        items: [
            { id: "gl_privacy", label: "Profile Visibility", icon: Lock, description: "Who can see your profile" },
            { id: "gl_discovery", label: "Search & Discovery", icon: User, description: "How others find you" },
        ]
    },
    {
        label: "App & Media",
        items: [
            { id: "gl_theme", label: "Display & Theme", icon: Monitor, description: "Dark mode, colors, fonts" },
            { id: "gl_notifications", label: "Notifications", icon: Bell, description: "Email and push settings" },
            { id: "gl_devices", label: "Devices", icon: Smartphone, description: "Manage logged-in devices" },
        ]
    },
    {
        label: "Account",
        items: [
            { id: "gl_account", label: "Account Settings", icon: User, description: "Email, password, 2FA" },
            { id: "gl_help", label: "Help & Support", icon: HelpCircle, description: "FAQs and contact support" },
        ]
    }
]

// ============================================================
// Features Settings Menu (Features tab - dynamically populated)
// ============================================================
// This will be populated dynamically based on active feature
export const FEATURES_SETTINGS_MENU: SettingsMenuSection[] = [
    {
        label: "Active Feature",
        items: [
            { id: "ft_settings", label: "Feature Settings", icon: Settings, description: "Configure the current feature" },
        ]
    }
]

// ============================================================
// Layout Component Props
// ============================================================
interface TwoTabSettingsLayoutProps {
    children: React.ReactNode
    activeTab: SettingsTabType
    activeId: SettingsId
    onTabChange: (tab: SettingsTabType) => void
    onNavigate: (id: SettingsId) => void
    workspaceName?: string
    className?: string
    featuresMenu?: SettingsMenuSection[]
}

// ============================================================
// Mobile Menu Sheet Component
// ============================================================
function MobileMenuSheet({
    currentMenu,
    activeId,
    onNavigate,
    activeLabel,
}: {
    currentMenu: SettingsMenuSection[]
    activeId: SettingsId
    onNavigate: (id: SettingsId) => void
    activeLabel: string
}) {
    const [open, setOpen] = React.useState(false)

    const handleNavigate = (id: SettingsId) => {
        onNavigate(id)
        setOpen(false)
    }

    return (
        <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild>
                <Button
                    variant="outline"
                    className="w-full justify-between h-12 px-4"
                >
                    <div className="flex items-center gap-2">
                        <Settings className="h-4 w-4" />
                        <span className="font-medium">{activeLabel}</span>
                    </div>
                    <ChevronDown className="h-4 w-4 opacity-50" />
                </Button>
            </SheetTrigger>
            <SheetContent side="bottom" className="h-[70vh]">
                <SheetHeader className="pb-4">
                    <SheetTitle>Select Setting</SheetTitle>
                </SheetHeader>
                <ScrollArea className="h-full pb-8">
                    <div className="space-y-4">
                        {currentMenu.map((section) => (
                            <div key={section.label}>
                                <h3 className="mb-2 px-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                                    {section.label}
                                </h3>
                                <div className="space-y-1">
                                    {section.items.map((item) => {
                                        const Icon = item.icon
                                        const isActive = activeId === item.id
                                        return (
                                            <Button
                                                key={item.id}
                                                variant={isActive ? "secondary" : "ghost"}
                                                size="lg"
                                                className={cn(
                                                    "w-full justify-start h-12 px-3",
                                                    isActive && "bg-secondary font-medium"
                                                )}
                                                onClick={() => handleNavigate(item.id)}
                                            >
                                                {Icon && <Icon className="mr-3 h-5 w-5 text-muted-foreground" />}
                                                <div className="flex flex-col items-start">
                                                    <span>{item.label}</span>
                                                    {item.description && (
                                                        <span className="text-xs text-muted-foreground font-normal">
                                                            {item.description}
                                                        </span>
                                                    )}
                                                </div>
                                            </Button>
                                        )
                                    })}
                                </div>
                            </div>
                        ))}
                    </div>
                </ScrollArea>
            </SheetContent>
        </Sheet>
    )
}

// ============================================================
// Two-Tab Settings Layout Component
// ============================================================
export function TwoTabSettingsLayout({
    children,
    activeTab,
    activeId,
    onTabChange,
    onNavigate,
    workspaceName = "Current Workspace",
    className,
    featuresMenu
}: TwoTabSettingsLayoutProps) {
    const isMobile = useIsMobile()
    const [mounted, setMounted] = React.useState(false)

    React.useEffect(() => {
        setMounted(true)
    }, [])

    const currentMenu = activeTab === "workspace"
        ? WORKSPACE_SETTINGS_MENU
        : activeTab === "features"
            ? (featuresMenu || FEATURES_SETTINGS_MENU)
            : GLOBAL_SETTINGS_MENU

    // Find active item label for mobile header
    const activeItem = currentMenu
        .flatMap(section => section.items)
        .find(item => item.id === activeId)
    const activeLabel = activeItem?.label || "Settings"

    // Show loading state while checking for mobile
    if (!mounted) {
        return (
            <div className={cn("flex h-full w-full bg-background items-center justify-center", className)}>
                <div className="animate-pulse text-muted-foreground">Loading settings...</div>
            </div>
        )
    }

    // Mobile Layout
    if (isMobile) {
        return (
            <div className={cn("flex flex-col h-full w-full bg-background overflow-hidden", className)}>
                {/* Mobile Header with Tabs */}
                <div className="flex-shrink-0 border-b bg-background">
                    <div className="p-3 space-y-3">
                        <div className="flex items-center justify-between">
                            <h2 className="text-lg font-bold">Settings</h2>
                        </div>

                        {/* Tab Switcher */}
                        <Tabs value={activeTab} onValueChange={(v) => onTabChange(v as SettingsTabType)} className="w-full">
                            <TabsList className="flex w-full justify-evenly h-10">
                                <TabsTrigger value="workspace" className="text-xs px-2 gap-1">
                                    <Building2 className="h-4 w-4" />
                                    <span className="hidden xs:inline">Workspace</span>
                                </TabsTrigger>
                                <TabsTrigger value="features" className="text-xs px-2 gap-1">
                                    <Puzzle className="h-4 w-4" />
                                    <span className="hidden xs:inline">Features</span>
                                </TabsTrigger>
                                <TabsTrigger value="global" className="text-xs px-2 gap-1">
                                    <Globe className="h-4 w-4" />
                                    <span className="hidden xs:inline">Global</span>
                                </TabsTrigger>
                            </TabsList>
                        </Tabs>

                        {/* Menu Selector Sheet */}
                        <MobileMenuSheet
                            currentMenu={currentMenu}
                            activeId={activeId}
                            onNavigate={onNavigate}
                            activeLabel={activeLabel}
                        />
                    </div>
                </div>

                {/* Content Area */}
                <ScrollArea className="flex-1 min-h-0">
                    <div className="p-4">
                        {children}
                    </div>
                </ScrollArea>
            </div>
        )
    }

    return <DesktopLayout
        activeTab={activeTab}
        activeId={activeId}
        onTabChange={onTabChange}
        onNavigate={onNavigate}
        currentMenu={currentMenu}
        workspaceName={workspaceName}
        className={className}
    >
        {children}
    </DesktopLayout>
}

// ============================================================
// Desktop Layout — extracted to allow collapsible-sidebar state
// to live in its own component without polluting the mobile path.
// ============================================================
const SETTINGS_SIDEBAR_COLLAPSED_KEY = "settings-sidebar-collapsed"

function useSettingsSidebarCollapsed(): [boolean, (v: boolean) => void] {
    const [collapsed, setCollapsedState] = React.useState<boolean>(false)

    React.useEffect(() => {
        try {
            const raw = window.localStorage.getItem(SETTINGS_SIDEBAR_COLLAPSED_KEY)
            if (raw === "1") setCollapsedState(true)
        } catch { /* localStorage may be disabled */ }
    }, [])

    const setCollapsed = React.useCallback((v: boolean) => {
        setCollapsedState(v)
        try {
            window.localStorage.setItem(SETTINGS_SIDEBAR_COLLAPSED_KEY, v ? "1" : "0")
        } catch { /* fail silent */ }
    }, [])

    return [collapsed, setCollapsed]
}

interface DesktopLayoutProps extends Omit<TwoTabSettingsLayoutProps, "featuresMenu"> {
    currentMenu: SettingsMenuSection[]
}

function DesktopLayout({
    children,
    activeTab,
    activeId,
    onTabChange,
    onNavigate,
    currentMenu,
    workspaceName = "Current Workspace",
    className,
}: DesktopLayoutProps) {
    const [collapsed, setCollapsed] = useSettingsSidebarCollapsed()

    return (
        <TooltipProvider delayDuration={150}>
            <div className={cn("flex h-full w-full bg-background overflow-hidden", className)}>
                {/* Sidebar */}
                <div
                    className={cn(
                        "border-r flex flex-col h-full min-h-0 bg-muted/10 transition-[width] duration-150",
                        collapsed ? "w-14" : "w-[280px]",
                    )}
                >
                    {/* Header with Tabs + collapse toggle */}
                    <div className={cn("space-y-3", collapsed ? "p-2 pb-1" : "p-4 pb-2")}>
                        <div className="flex items-center justify-between gap-1">
                            {!collapsed && (
                                <h2 className="text-lg font-bold tracking-tight px-2">Settings</h2>
                            )}
                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        className="h-7 w-7 shrink-0"
                                        onClick={() => setCollapsed(!collapsed)}
                                        aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
                                    >
                                        {collapsed ? <PanelLeftOpen className="h-4 w-4" /> : <PanelLeftClose className="h-4 w-4" />}
                                    </Button>
                                </TooltipTrigger>
                                <TooltipContent side="right">
                                    {collapsed ? "Expand sidebar" : "Collapse sidebar"}
                                </TooltipContent>
                            </Tooltip>
                        </div>

                        <Tabs value={activeTab} onValueChange={(v) => onTabChange(v as SettingsTabType)} className="w-full">
                            <TabsList className={cn(
                                "flex w-full justify-evenly h-9",
                                collapsed && "flex-col h-auto bg-transparent gap-1 p-0",
                            )}>
                                <TabsTrigger value="workspace" className={cn(
                                    "text-xs",
                                    collapsed ? "w-full h-9 p-0 justify-center" : "px-1",
                                )}>
                                    <Building2 className={cn("h-3.5 w-3.5", !collapsed && "mr-1")} />
                                    {!collapsed && <span className="truncate">This Workspace</span>}
                                </TabsTrigger>
                                <TabsTrigger value="features" className={cn(
                                    "text-xs",
                                    collapsed ? "w-full h-9 p-0 justify-center" : "px-1",
                                )}>
                                    <Puzzle className={cn("h-3.5 w-3.5", !collapsed && "mr-1")} />
                                    {!collapsed && <span className="truncate">Features</span>}
                                </TabsTrigger>
                                <TabsTrigger value="global" className={cn(
                                    "text-xs",
                                    collapsed ? "w-full h-9 p-0 justify-center" : "px-1",
                                )}>
                                    <Globe className={cn("h-3.5 w-3.5", !collapsed && "mr-1")} />
                                    {!collapsed && <span className="truncate">Global</span>}
                                </TabsTrigger>
                            </TabsList>
                        </Tabs>
                    </div>

                    {/* Menu Items */}
                    <ScrollArea className={cn("flex-1 min-h-0", collapsed ? "px-1" : "px-3")}>
                        <div className="space-y-4 py-2 pb-8">
                            {currentMenu.map((section, idx) => (
                                <div key={section.label}>
                                    {!collapsed && (
                                        <h3 className="mb-1.5 px-3 text-[10px] font-semibold text-muted-foreground/60 uppercase tracking-wider">
                                            {section.label}
                                        </h3>
                                    )}
                                    <div className="space-y-0.5">
                                        {section.items.map((item) => {
                                            const Icon = item.icon
                                            const isActive = activeId === item.id
                                            const button = (
                                                <Button
                                                    key={item.id}
                                                    variant={isActive ? "secondary" : "ghost"}
                                                    size="sm"
                                                    className={cn(
                                                        "h-9 font-normal",
                                                        collapsed
                                                            ? "w-10 p-0 justify-center mx-auto"
                                                            : "w-full justify-start px-3",
                                                        isActive && "font-medium bg-secondary",
                                                    )}
                                                    onClick={() => onNavigate(item.id)}
                                                    aria-label={item.label}
                                                >
                                                    {Icon && <Icon className={cn("h-4 w-4 text-muted-foreground", !collapsed && "mr-2.5")} />}
                                                    {!collapsed && <span className="truncate">{item.label}</span>}
                                                </Button>
                                            )
                                            if (collapsed) {
                                                return (
                                                    <Tooltip key={item.id}>
                                                        <TooltipTrigger asChild>{button}</TooltipTrigger>
                                                        <TooltipContent side="right">
                                                            <div className="font-medium">{item.label}</div>
                                                            {item.description && (
                                                                <div className="text-xs text-muted-foreground">{item.description}</div>
                                                            )}
                                                        </TooltipContent>
                                                    </Tooltip>
                                                )
                                            }
                                            return button
                                        })}
                                    </div>
                                    {idx < currentMenu.length - 1 && !collapsed && <Separator className="mt-3 opacity-30" />}
                                </div>
                            ))}
                        </div>
                    </ScrollArea>

                    {/* Footer */}
                    {!collapsed && (
                        <div className="p-3 border-t bg-muted/20">
                            <div className="flex items-center gap-2.5 px-2">
                                <div className="h-7 w-7 rounded-md bg-primary/10 flex items-center justify-center">
                                    <Settings className="h-3.5 w-3.5 text-primary" />
                                </div>
                                <div className="text-xs text-muted-foreground truncate">
                                    <p className="font-medium text-foreground truncate">
                                        {activeTab === "workspace" ? workspaceName : activeTab === "features" ? "Feature Settings" : "Global Settings"}
                                    </p>
                                    <p className="text-[10px]">SuperSpace v1.0</p>
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* Content Area */}
                <div className="flex-1 flex flex-col min-w-0 min-h-0 bg-background overflow-hidden">
                    <ScrollArea className="flex-1 min-h-0 h-full">
                        <div className={cn(
                            "max-w-3xl mx-auto",
                            // Reduced padding so content fits in narrow inspector panel
                            // (default ~400-500px). Wider modal still benefits from max-w-3xl cap.
                            "p-4 md:p-6",
                        )}>
                            {children}
                        </div>
                    </ScrollArea>
                </div>
            </div>
        </TooltipProvider>
    )
}

// ============================================================
// Legacy Export (for backward compatibility during transition)
// ============================================================
export const COMPREHENSIVE_SETTINGS_MENU = GLOBAL_SETTINGS_MENU
export type { TwoTabSettingsLayoutProps as ComprehensiveSettingsLayoutProps }
export { TwoTabSettingsLayout as ComprehensiveSettingsLayout }

