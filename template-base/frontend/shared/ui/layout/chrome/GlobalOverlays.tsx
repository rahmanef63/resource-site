"use client"

import * as React from "react"
import { HelpCircle, BookOpen } from "lucide-react"
import { useIsMobile } from "@/hooks/use-mobile"

import {
    Sheet,
    SheetContent,
    SheetDescription,
    SheetHeader,
    SheetTitle,
} from "@/components/ui/sheet"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import {
    Drawer,
    DrawerContent,
    DrawerDescription,
    DrawerHeader,
    DrawerTitle,
} from "@/components/ui/drawer"
import { Button } from "@/components/ui/button"
import { ComprehensiveSettingsPage } from "@/frontend/shared/settings/comprehensive"
import NotificationsPage from "@/frontend/shared/foundation/utils/notifications/page"
import { useWorkspaceContext } from "@/frontend/shared/foundation/provider/WorkspaceProvider"

export function GlobalOverlays() {
    const [showSettings, setShowSettings] = React.useState(false)
    const [showNotifications, setShowNotifications] = React.useState(false)
    const [showHelp, setShowHelp] = React.useState(false)

    const isMobile = useIsMobile()
    const { workspaceId } = useWorkspaceContext()

    const [initialTab, setInitialTab] = React.useState<"workspace" | "features" | "global">("workspace")
    const [initialId, setInitialId] = React.useState<string | undefined>(undefined)
    const [initialFeatureSlug, setInitialFeatureSlug] = React.useState<string | undefined>(undefined)

    // Track if component is mounted (to avoid SSR hydration issues with isMobile)
    const [mounted, setMounted] = React.useState(false)
    React.useEffect(() => {
        setMounted(true)
    }, [])

    React.useEffect(() => {
        // Event listeners for global triggers
        const handleOpenSettings = (e: Event) => {
            const detail = (e as CustomEvent).detail
            if (detail?.tab) setInitialTab(detail.tab)
            if (detail?.id) setInitialId(detail.id)
            if (detail?.featureSlug) setInitialFeatureSlug(detail.featureSlug)
            setShowSettings(true)
        }
        const handleOpenNotifications = () => setShowNotifications(true)
        const handleCloseNotifications = () => setShowNotifications(false)
        const handleOpenHelp = () => setShowHelp(true)

        window.addEventListener("open-settings", handleOpenSettings)
        window.addEventListener("open-notifications", handleOpenNotifications)
        window.addEventListener("close-notifications", handleCloseNotifications)
        window.addEventListener("open-help", handleOpenHelp)

        return () => {
            window.removeEventListener("open-settings", handleOpenSettings)
            window.removeEventListener("open-notifications", handleOpenNotifications)
            window.removeEventListener("close-notifications", handleCloseNotifications)
            window.removeEventListener("open-help", handleOpenHelp)
        }
    }, [])

    // Settings content component
    const SettingsContent = () => (
        <ComprehensiveSettingsPage
            defaultTab={initialTab}
            defaultId={initialId}
            defaultFeatureSlug={initialFeatureSlug}
        />
    )

    // Notifications content component — real page
    const NotificationsContent = () => (
        <NotificationsPage workspaceId={workspaceId} />
    )

    // Don't render dialogs/drawers until mounted to get correct isMobile value
    if (!mounted) {
        return null
    }

    return (
        <>
            {/* Settings - Drawer on mobile, Dialog on desktop */}
            {isMobile ? (
                <Drawer open={showSettings} onOpenChange={setShowSettings}>
                    <DrawerContent className="h-[80vh] rounded-t-[1.75rem] border-x-0 border-b-0 p-0 gap-0">
                        <DrawerHeader className="sr-only">
                            <DrawerTitle>Settings</DrawerTitle>
                            <DrawerDescription>
                                Configure your workspace and application settings.
                            </DrawerDescription>
                        </DrawerHeader>
                        <div className="min-h-0 flex-1 overflow-hidden">
                            <SettingsContent />
                        </div>
                    </DrawerContent>
                </Drawer>
            ) : (
                <Dialog open={showSettings} onOpenChange={setShowSettings}>
                    <DialogContent className="w-full h-full max-w-full sm:max-w-7xl sm:h-[90vh] p-0 gap-0 overflow-hidden sm:rounded-xl">
                        <DialogHeader className="sr-only">
                            <DialogTitle>Settings</DialogTitle>
                            <DialogDescription>
                                Configure your workspace and application settings.
                            </DialogDescription>
                        </DialogHeader>
                        <SettingsContent />
                    </DialogContent>
                </Dialog>
            )}

            {/* Notifications - Drawer on mobile, sheet on desktop */}
            {isMobile ? (
                <Drawer open={showNotifications} onOpenChange={setShowNotifications}>
                    <DrawerContent
                        className="h-[88dvh] max-h-[88dvh] rounded-t-[1.75rem] border-x-0 border-b-0 p-0 gap-0"
                        data-testid="notifications-drawer-content"
                    >
                        <DrawerHeader className="sr-only">
                            <DrawerTitle>Notifications</DrawerTitle>
                            <DrawerDescription>
                                Stay updated with the latest activity.
                            </DrawerDescription>
                        </DrawerHeader>
                        <div className="mx-auto mt-3 h-1.5 w-12 shrink-0 rounded-full bg-muted" />
                        <div className="min-h-0 flex-1 overflow-hidden" data-testid="notifications-drawer-body">
                            <NotificationsContent />
                        </div>
                    </DrawerContent>
                </Drawer>
            ) : (
                <Sheet open={showNotifications} onOpenChange={setShowNotifications}>
                    <SheetContent
                        side="right"
                        className="flex h-full w-full max-w-full flex-col overflow-hidden border-l border-border/60 px-0 pt-0 sm:max-w-[420px] lg:max-w-[460px]"
                        data-testid="notifications-sheet-content"
                    >
                        <SheetHeader className="sr-only">
                            <SheetTitle>Notifications</SheetTitle>
                            <SheetDescription>
                                Stay updated with the latest activity.
                            </SheetDescription>
                        </SheetHeader>
                        <div className="min-h-0 flex-1 overflow-hidden" data-testid="notifications-sheet-body">
                            <NotificationsContent />
                        </div>
                    </SheetContent>
                </Sheet>
            )}

            {/* Help Dialog (Modal) */}
            <Dialog open={showHelp} onOpenChange={setShowHelp}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Help & Support</DialogTitle>
                        <DialogDescription>
                            Need assistance? We&apos;re here to help.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        <div className="grid grid-cols-2 gap-4">
                            <Button variant="outline" className="h-24 flex-col gap-2" onClick={() => window.open('https://docs.google.com', '_blank')}>
                                <BookOpen className="h-6 w-6" />
                                Documentation
                            </Button>
                            <Button variant="outline" className="h-24 flex-col gap-2" onClick={() => window.open('mailto:support@example.com', '_blank')}>
                                <HelpCircle className="h-6 w-6" />
                                Contact Support
                            </Button>
                        </div>
                        <div className="rounded-lg bg-muted p-4 text-sm">
                            <p className="font-medium mb-1">Keyboard Shortcuts</p>
                            <div className="space-y-1 text-muted-foreground">
                                <p>Cmd+K : Command Palette</p>
                                <p>? : Show Shortcuts</p>
                            </div>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>
        </>
    )
}
