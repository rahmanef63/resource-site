"use client"

import * as React from "react"
import { IconDotsVertical } from "@tabler/icons-react"
import { SignInButton, useUser } from "@/frontend/shared/foundation/auth"
import { User } from "lucide-react"
import Link from "next/link"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useIsGuestMode } from "@/frontend/shared/foundation/provider/GuestWorkspaceProvider"
import { useUnifiedWorkspaceContext } from "@/frontend/shared/foundation/provider/UnifiedWorkspaceContext"
import {
  GuestNavUserActions,
  NavUserProfileDialog,
  SignedInNavUserActions,
  ThemePresetDialog,
} from "@/frontend/shared/ui/layout/sidebar/primary/NavUserActions"

interface NavUserProps {
  profileSettingsComponent?: React.ComponentType
  onSettingsClick?: () => void
}

interface DropdownNavUserContentProps {
  email?: string
  fallback: string
  imageUrl?: string
  isMobile: boolean
  name: string
  children: React.ReactNode
}

function DropdownNavUserContent({
  email,
  fallback,
  imageUrl,
  isMobile,
  name,
  children,
}: DropdownNavUserContentProps) {
  return (
    <SidebarMenuItem>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <SidebarMenuButton
            size="lg"
            className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
          >
            <Avatar className="h-8 w-8 rounded-lg grayscale">
              {imageUrl ? (
                <AvatarImage src={imageUrl} alt={`${name} avatar`} />
              ) : null}
              <AvatarFallback className="rounded-lg">{fallback}</AvatarFallback>
            </Avatar>
            <div className="grid flex-1 text-left text-sm leading-tight">
              <span className="truncate font-medium">{name}</span>
              <span className="truncate text-xs text-muted-foreground">
                {email}
              </span>
            </div>
            <IconDotsVertical className="ml-auto size-4" />
          </SidebarMenuButton>
        </DropdownMenuTrigger>
        <DropdownMenuContent
          className="min-w-56 rounded-lg"
          align="end"
          side={isMobile ? "bottom" : "top"}
        >
          {children}
        </DropdownMenuContent>
      </DropdownMenu>
    </SidebarMenuItem>
  )
}

function FallbackSignedOutNavUserContent() {
  return (
    <>
      <SidebarMenuItem>
        <SignInButton mode="modal">
          <SidebarMenuButton size="lg" className="justify-between">
            <div className="flex items-center gap-3">
              <div className="flex aspect-square size-8 items-center justify-center rounded-lg border">
                <User className="size-4" />
              </div>
              <div className="grid text-left text-sm leading-tight">
                <span className="truncate font-semibold">Sign in</span>
                <span className="truncate text-xs text-muted-foreground">Access your workspace</span>
              </div>
            </div>
          </SidebarMenuButton>
        </SignInButton>
      </SidebarMenuItem>
      <SidebarMenuItem>
        <SidebarMenuButton asChild size="lg" className="justify-between">
          <Link href="/sign-up">
            <div className="flex items-center gap-3">
              <div className="flex aspect-square size-8 items-center justify-center rounded-lg border">
                <User className="size-4" />
              </div>
              <div className="grid text-left text-sm leading-tight">
                <span className="truncate font-semibold">Sign up</span>
                <span className="truncate text-xs text-muted-foreground">Create a new account</span>
              </div>
            </div>
          </Link>
        </SidebarMenuButton>
      </SidebarMenuItem>
    </>
  )
}

export function NavUser({
  profileSettingsComponent,
  onSettingsClick,
}: NavUserProps = {}) {
  const { isMobile } = useSidebar()
  const { isLoaded, user } = useUser()
  const isGuestMode = useIsGuestMode()
  const { guestUser } = useUnifiedWorkspaceContext()
  const [profileDialogOpen, setProfileDialogOpen] = React.useState(false)
  const [themeDialogOpen, setThemeDialogOpen] = React.useState(false)

  if (!isLoaded) {
    return (
      <SidebarMenu>
        <SidebarMenuItem>
          <SidebarMenuButton size="lg" className="animate-pulse">
            <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-muted" />
            <div className="grid flex-1 text-left text-sm leading-tight">
              <span className="h-3 truncate rounded bg-muted font-medium" />
              <span className="h-2 truncate rounded bg-muted text-xs" />
            </div>
          </SidebarMenuButton>
        </SidebarMenuItem>
      </SidebarMenu>
    )
  }

  return (
    <>
      <SidebarMenu>
        {user ? (
          <DropdownNavUserContent
            email={user.primaryEmailAddress?.emailAddress}
            fallback={(user.fullName ?? "CN").slice(0, 2).toUpperCase()}
            imageUrl={user.imageUrl}
            isMobile={isMobile}
            name={user.fullName ?? "User"}
          >
            <SignedInNavUserActions
              variant="dropdown"
              onSettingsClick={onSettingsClick}
              onOpenProfile={() => setProfileDialogOpen(true)}
              onOpenThemePreset={() => setThemeDialogOpen(true)}
            />
          </DropdownNavUserContent>
        ) : isGuestMode ? (
          <DropdownNavUserContent
            email={guestUser?.email}
            fallback={guestUser?.initials ?? "GU"}
            isMobile={isMobile}
            name={guestUser?.name ?? "Guest User"}
          >
            <GuestNavUserActions
              variant="dropdown"
              onSettingsClick={onSettingsClick}
              onOpenProfile={() => setProfileDialogOpen(true)}
              onOpenThemePreset={() => setThemeDialogOpen(true)}
            />
          </DropdownNavUserContent>
        ) : (
          <FallbackSignedOutNavUserContent />
        )}
      </SidebarMenu>

      {(user || isGuestMode) ? (
        <>
          {profileDialogOpen ? (
            <NavUserProfileDialog
              open={profileDialogOpen}
              onOpenChange={setProfileDialogOpen}
              profileSettingsComponent={profileSettingsComponent}
            />
          ) : null}
          {themeDialogOpen ? (
            <ThemePresetDialog
              open={themeDialogOpen}
              onOpenChange={setThemeDialogOpen}
            />
          ) : null}
        </>
      ) : null}
    </>
  )
}
