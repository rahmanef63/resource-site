"use client"

import * as React from "react"
import { useUser } from "@/frontend/shared/foundation/auth"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet"
import { useUnifiedMobileWorkspaceContext } from "@/frontend/shared/ui/layout/dashboard/mobile/useUnifiedMobileWorkspaceContext"
import {
  GuestNavUserActions,
  NavUserProfileDialog,
  SignedInNavUserActions,
  ThemePresetDialog,
} from "@/frontend/shared/ui/layout/sidebar/primary/NavUserActions"

interface MobileProfileSheetProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function MobileProfileSheet({
  open,
  onOpenChange,
}: MobileProfileSheetProps) {
  const { user, isLoaded } = useUser()
  const { currentWorkspace, isGuestMode } = useUnifiedMobileWorkspaceContext()
  const [profileDialogOpen, setProfileDialogOpen] = React.useState(false)
  const [themeDialogOpen, setThemeDialogOpen] = React.useState(false)

  return (
    <>
      <Sheet open={open} onOpenChange={onOpenChange}>
        <SheetContent
          side="bottom"
          className="h-[min(85vh,44rem)] rounded-t-[1.75rem] border-x-0 border-b-0 px-0 pt-0"
        >
          <SheetHeader className="border-b border-border/60 px-4 pb-4 pt-3 text-left">
            <div className="mx-auto mb-3 h-1.5 w-12 rounded-full bg-muted" />
            <SheetTitle>Profile</SheetTitle>
            <SheetDescription>
              {user
                ? "Manage your account, settings, and appearance."
                : isGuestMode
                  ? "Preview your guest profile, settings, and appearance before signing in."
                  : "Manage your sign-in and appearance preferences."}
            </SheetDescription>
          </SheetHeader>

          <div className="space-y-4 overflow-y-auto px-4 py-4">
            {isLoaded && user ? (
              <>
                <div className="flex items-center gap-3 rounded-xl border border-border/60 bg-background/80 p-4 shadow-sm">
                  <Avatar className="h-12 w-12 rounded-xl">
                    {user.imageUrl ? (
                      <AvatarImage src={user.imageUrl} alt={user.fullName ?? "User avatar"} />
                    ) : null}
                    <AvatarFallback className="rounded-xl">
                      {(user.fullName ?? "CN").slice(0, 2).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold">{user.fullName}</p>
                    <p className="truncate text-xs text-muted-foreground">
                      {user.primaryEmailAddress?.emailAddress}
                    </p>
                  </div>
                  {currentWorkspace?.name ? (
                    <Badge variant="secondary" className="max-w-[9rem] truncate rounded-full">
                      {currentWorkspace.name}
                    </Badge>
                  ) : null}
                </div>

                <div className="space-y-3 pb-4">
                  <SignedInNavUserActions
                    variant="sheet"
                    onClose={() => onOpenChange(false)}
                    onOpenProfile={() => setProfileDialogOpen(true)}
                    onOpenThemePreset={() => setThemeDialogOpen(true)}
                  />
                </div>
              </>
            ) : (
              <GuestNavUserActions
                variant="sheet"
                onClose={() => onOpenChange(false)}
                onOpenProfile={() => setProfileDialogOpen(true)}
                onOpenThemePreset={() => setThemeDialogOpen(true)}
              />
            )}
          </div>
        </SheetContent>
      </Sheet>

      {profileDialogOpen ? (
        <NavUserProfileDialog
          open={profileDialogOpen}
          onOpenChange={setProfileDialogOpen}
        />
      ) : null}
      {themeDialogOpen ? (
        <ThemePresetDialog
          open={themeDialogOpen}
          onOpenChange={setThemeDialogOpen}
        />
      ) : null}
    </>
  )
}
