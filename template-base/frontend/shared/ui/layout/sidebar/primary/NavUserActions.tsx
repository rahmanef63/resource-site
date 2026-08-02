"use client"

import * as React from "react"
import { useMutation, useQuery } from "convex/react"
import { useUser } from "@/frontend/shared/foundation/auth"
import { Check, Eye, LogOut, Palette, Settings, User } from "lucide-react"
import type { Id } from "@convex/_generated/dataModel"
import { api } from "@convex/_generated/api"
import { toast } from "sonner"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ResponsiveDialog } from "@/frontend/shared/ui/components/ResponsiveDialog"
import {
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
import {
  SafeSignInButton,
  SafeSignOutButton,
  SafeSignUpButton,
} from "@/frontend/shared/foundation"
import { useUnifiedWorkspaceContext } from "@/frontend/shared/foundation/provider/UnifiedWorkspaceContext"
import { DEFAULT_ACTIVE_THEME, ThemeToggle, useThemeConfig } from "@/frontend/shared/theme"
import { formatThemeLabel } from "@/frontend/shared/theme/utils/format-theme-label"

type ActionVariant = "dropdown" | "sheet"

interface RegistryTheme {
  name: string
  label: string
  activeColor: {
    light: string
    dark: string
  }
}

interface RegistryItem {
  name: string
  title: string
  cssVars: {
    light: Record<string, string>
    dark: Record<string, string>
  }
}

interface RegistryData {
  items: RegistryItem[]
}

interface BaseNavUserActionsProps {
  variant: ActionVariant
  onSettingsClick?: () => void
  onOpenProfile?: () => void
  onOpenThemePreset?: () => void
  onClose?: () => void
}

interface SignedInNavUserActionsProps extends BaseNavUserActionsProps {}

interface GuestNavUserActionsProps extends BaseNavUserActionsProps {}

interface NavUserProfileDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  profileSettingsComponent?: React.ComponentType
}

interface ThemePresetDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

function ActionSectionLabel({
  children,
  variant,
}: {
  children: React.ReactNode
  variant: ActionVariant
}) {
  if (variant === "dropdown") {
    return (
      <DropdownMenuLabel className="text-xs font-normal text-muted-foreground">
        {children}
      </DropdownMenuLabel>
    )
  }

  return (
    <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
      {children}
    </p>
  )
}

function ActionDivider({ variant }: { variant: ActionVariant }) {
  if (variant === "dropdown") {
    return <DropdownMenuSeparator />
  }

  return <Separator />
}

function ActionRow({
  variant,
  icon: Icon,
  label,
  description,
  trailing,
  onAction,
}: {
  variant: ActionVariant
  icon: React.ElementType
  label: string
  description?: string
  trailing?: React.ReactNode
  onAction?: () => void
}) {
  if (variant === "dropdown") {
    return (
      <DropdownMenuItem onSelect={onAction ? () => onAction() : undefined}>
        <Icon className="mr-2 h-4 w-4" />
        <span>{label}</span>
        {trailing ? (
          <span className="ml-auto max-w-24 truncate text-xs text-muted-foreground">
            {trailing}
          </span>
        ) : null}
      </DropdownMenuItem>
    )
  }

  return (
    <Button
      type="button"
      variant="ghost"
      className="h-auto w-full justify-between rounded-xl px-3 py-3"
      onClick={onAction}
    >
      <div className="flex min-w-0 items-center gap-3 text-left">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-muted">
          <Icon className="h-4 w-4 text-muted-foreground" />
        </div>
        <div className="min-w-0">
          <p className="truncate text-sm font-medium">{label}</p>
          {description ? (
            <p className="truncate text-xs text-muted-foreground">{description}</p>
          ) : null}
        </div>
      </div>
      {trailing ? (
        <span className="max-w-24 truncate text-xs text-muted-foreground">
          {trailing}
        </span>
      ) : null}
    </Button>
  )
}

function renderAppearanceSection(variant: ActionVariant) {
  if (variant === "dropdown") {
    return (
      <div className="px-2 py-1.5">
        <ThemeToggle className="w-full" />
      </div>
    )
  }

  return (
    <div className="rounded-xl border border-border/60 bg-background/80 p-4 shadow-sm">
      <p className="mb-3 text-sm font-medium">Color Mode</p>
      <ThemeToggle className="w-full" />
    </div>
  )
}

export function NavUserProfileDialog({
  open,
  onOpenChange,
  profileSettingsComponent: ProfileSettings,
}: NavUserProfileDialogProps) {
  const { user: authUser } = useUser()
  const { currentWorkspace, guestUser, isGuestMode } = useUnifiedWorkspaceContext()

  return (
    <ResponsiveDialog open={open} onOpenChange={onOpenChange} variant="modal" size="lg">
      <ResponsiveDialog.Header>
        <ResponsiveDialog.Title>{isGuestMode ? "Guest Profile" : "Profile Settings"}</ResponsiveDialog.Title>
        <ResponsiveDialog.Description>
          {isGuestMode
            ? "Preview Superspace in demo mode, or sign in to save your preferences."
            : "Manage your account profile and personalization."}
        </ResponsiveDialog.Description>
      </ResponsiveDialog.Header>

      <ResponsiveDialog.Body className="p-0">
          {isGuestMode ? (
            <div className="space-y-6 p-4">
              <div className="flex items-center gap-4 rounded-xl border border-border/60 bg-background/80 p-4 shadow-sm">
                <Avatar className="h-16 w-16 rounded-xl">
                  <AvatarFallback className="rounded-xl">
                    {guestUser?.initials ?? "GU"}
                  </AvatarFallback>
                </Avatar>
                <div className="min-w-0 flex-1">
                  <h3 className="truncate text-lg font-medium">
                    {guestUser?.name ?? "Guest User"}
                  </h3>
                  <p className="truncate text-sm text-muted-foreground">
                    {guestUser?.email ?? "guest@superspace.demo"}
                  </p>
                </div>
                {currentWorkspace?.name ? (
                  <Badge variant="secondary" className="rounded-full">
                    {currentWorkspace.name}
                  </Badge>
                ) : null}
              </div>

              <div className="space-y-2 text-sm text-muted-foreground">
                <p>
                  You are currently browsing the demo workspace. Profile and
                  theme changes can be previewed here before you create an account.
                </p>
                <p>
                  Sign in or sign up to save your preferences, sync them across
                  workspaces, and continue from this preview.
                </p>
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                <SafeSignInButton>
                  <Button type="button" className="w-full rounded-xl">
                    Sign in
                  </Button>
                </SafeSignInButton>
                <SafeSignUpButton>
                  <Button type="button" variant="outline" className="w-full rounded-xl">
                    Sign up
                  </Button>
                </SafeSignUpButton>
              </div>
            </div>
          ) : ProfileSettings ? (
            <ProfileSettings />
          ) : (
            <div className="space-y-4 p-4">
              <div className="flex items-center gap-4">
                <Avatar className="h-16 w-16">
                  <AvatarImage src={authUser?.imageUrl} />
                  <AvatarFallback>CN</AvatarFallback>
                </Avatar>
                <div>
                  <h3 className="text-lg font-medium">{authUser?.fullName}</h3>
                  <p className="text-sm text-muted-foreground">
                    {authUser?.primaryEmailAddress?.emailAddress}
                  </p>
                </div>
              </div>
              <div className="text-sm text-muted-foreground">
                Profile editing is managed via your identity provider.
              </div>
            </div>
          )}
      </ResponsiveDialog.Body>
    </ResponsiveDialog>
  )
}

export function ThemePresetDialog({
  open,
  onOpenChange,
}: ThemePresetDialogProps) {
  const {
    currentThemePreset,
    currentWorkspace,
    hasCurrentWorkspaceThemeOverride,
    isGuestMode,
    setCurrentWorkspaceThemePreset,
    workspaceId,
  } = useUnifiedWorkspaceContext()
  const {
    activeTheme,
    previewTheme,
    resolvedTheme,
    setActiveTheme,
    startThemePreview,
    clearThemePreview,
  } = useThemeConfig()
  const scopedWorkspaceId = !isGuestMode && workspaceId
    ? workspaceId as Id<"workspaces">
    : null
  const themeState = useQuery(
    // @ts-ignore — deep type recursion in Convex API refs
    api.workspace.storage.getWorkspaceEffectiveTheme,
    scopedWorkspaceId ? { workspaceId: scopedWorkspaceId } : "skip",
  )
  const updateWorkspaceThemePreference = useMutation(
    // @ts-ignore — deep type recursion in Convex API refs
    api.workspace.storage.updateWorkspaceThemePreference,
  )
  const [registryThemes, setRegistryThemes] = React.useState<RegistryTheme[]>([])
  const [loading, setLoading] = React.useState(true)
  const [isSavingTheme, setIsSavingTheme] = React.useState(false)

  const workspaceDefaultThemePreset = typeof currentWorkspace?.themePreset === "string"
    && currentWorkspace.themePreset.trim().length > 0
    ? currentWorkspace.themePreset
    : DEFAULT_ACTIVE_THEME
  const persistedThemePreset = isGuestMode
    ? currentThemePreset ?? workspaceDefaultThemePreset
    : themeState?.themePreset ?? activeTheme
  const canResetToWorkspaceDefault = isGuestMode
    ? Boolean(hasCurrentWorkspaceThemeOverride)
    : Boolean(themeState?.userThemePreset)
  const showWorkspaceDefaultAction = isGuestMode || Boolean(scopedWorkspaceId)

  React.useEffect(() => {
    const loadThemes = async () => {
      try {
        const response = await fetch("/r/registry.json")
        if (!response.ok) {
          return
        }

        const registryData: RegistryData = await response.json()
        const themes = registryData.items.map(
          (item): RegistryTheme => ({
            name: item.name,
            label: item.title,
            activeColor: {
              light: item.cssVars.light.primary || "var(--primary)",
              dark: item.cssVars.dark.primary || "var(--primary)",
            },
          }),
        )

        setRegistryThemes(themes)
      } catch (error) {
        console.error("Failed to load themes from registry:", error)
      } finally {
        setLoading(false)
      }
    }

    void loadThemes()
  }, [])

  const handlePreview = React.useCallback((themeName: string) => {
    startThemePreview(themeName)
  }, [startThemePreview])

  const handleUseTheme = React.useCallback(async (themeName: string) => {
    if (isGuestMode) {
      setCurrentWorkspaceThemePreset?.(themeName)
      setActiveTheme(themeName)
      clearThemePreview()
      toast.success(`Theme preset saved for ${currentWorkspace?.name ?? "this workspace"}`)
      onOpenChange(false)
      return
    }

    if (!scopedWorkspaceId) {
      setActiveTheme(themeName)
      clearThemePreview()
      onOpenChange(false)
      return
    }

    setIsSavingTheme(true)
    try {
      await updateWorkspaceThemePreference({
        workspaceId: scopedWorkspaceId,
        themePreset: themeName,
      })
      setActiveTheme(themeName)
      clearThemePreview()
      toast.success("Theme preset saved for this workspace")
      onOpenChange(false)
    } catch (error) {
      console.error("Failed to save workspace theme preset:", error)
      clearThemePreview()
      toast.error("Failed to save workspace theme preset")
    } finally {
      setIsSavingTheme(false)
    }
  }, [
    currentWorkspace?.name,
    clearThemePreview,
    isGuestMode,
    onOpenChange,
    scopedWorkspaceId,
    setActiveTheme,
    setCurrentWorkspaceThemePreset,
    updateWorkspaceThemePreference,
  ])

  const handleUseWorkspaceDefaultTheme = React.useCallback(async () => {
    if (isGuestMode) {
      setCurrentWorkspaceThemePreset?.(null)
      setActiveTheme(workspaceDefaultThemePreset)
      clearThemePreview()
      toast.success("Workspace theme reset to the demo default")
      onOpenChange(false)
      return
    }

    if (!scopedWorkspaceId) {
      return
    }

    const fallbackTheme = themeState?.workspaceThemePreset
      ?? themeState?.userDefaultThemePreset
      ?? DEFAULT_ACTIVE_THEME
    setIsSavingTheme(true)

    try {
      await updateWorkspaceThemePreference({
        workspaceId: scopedWorkspaceId,
        themePreset: undefined,
      })
      setActiveTheme(fallbackTheme)
      clearThemePreview()
      toast.success("Workspace theme override cleared")
      onOpenChange(false)
    } catch (error) {
      console.error("Failed to clear workspace theme preset:", error)
      clearThemePreview()
      toast.error("Failed to clear workspace theme preset")
    } finally {
      setIsSavingTheme(false)
    }
  }, [
    clearThemePreview,
    isGuestMode,
    onOpenChange,
    scopedWorkspaceId,
    setActiveTheme,
    setCurrentWorkspaceThemePreset,
    themeState?.userDefaultThemePreset,
    themeState?.workspaceThemePreset,
    updateWorkspaceThemePreference,
    workspaceDefaultThemePreset,
  ])

  const handleCancelPreview = React.useCallback(() => {
    clearThemePreview()
  }, [clearThemePreview])

  const handleDialogOpenChange = React.useCallback((nextOpen: boolean) => {
    if (!nextOpen) {
      handleCancelPreview()
    }

    onOpenChange(nextOpen)
  }, [handleCancelPreview, onOpenChange])

  return (
    <ResponsiveDialog open={open} onOpenChange={handleDialogOpenChange} variant="modal" size="md">
      <ResponsiveDialog.Header>
        <ResponsiveDialog.Title>Choose Theme</ResponsiveDialog.Title>
        <ResponsiveDialog.Description>
          {showWorkspaceDefaultAction
            ? `Select a theme preset for ${currentWorkspace?.name ?? "this workspace"}.`
            : "Select a theme preset and color mode."}
        </ResponsiveDialog.Description>
      </ResponsiveDialog.Header>

      <ResponsiveDialog.Body className="px-4 py-4 sm:px-6">
        <div className="border-b pb-4">
          <p className="mb-2 text-sm font-medium">Color Mode</p>
          <ThemeToggle />
        </div>

        <ScrollArea className="max-h-[60vh] mt-4">
          <div className="space-y-2 pr-4">
            {showWorkspaceDefaultAction ? (
              <Button
                variant="outline"
                className="w-full justify-between"
                disabled={!canResetToWorkspaceDefault || isSavingTheme}
                onClick={() => void handleUseWorkspaceDefaultTheme()}
              >
                <span>Use Workspace Default</span>
                {!canResetToWorkspaceDefault ? (
                  <Check className="h-4 w-4 text-primary" />
                ) : null}
              </Button>
            ) : null}

            {loading ? (
              <div className="space-y-2">
                {[1, 2, 3, 4].map((item) => (
                  <div key={item} className="h-14 animate-pulse rounded-lg bg-muted" />
                ))}
              </div>
            ) : (
              registryThemes.map((themeOption) => {
                const isPersistedActive = persistedThemePreset === themeOption.name
                const isDisplayedTheme = resolvedTheme === themeOption.name
                const isPreviewing = previewTheme === themeOption.name
                const isWorkspaceOverride = isGuestMode
                  ? Boolean(
                      hasCurrentWorkspaceThemeOverride
                      && persistedThemePreset === themeOption.name,
                    )
                  : themeState?.userThemePreset === themeOption.name

                return (
                  <div
                    key={themeOption.name}
                    className={`flex items-center justify-between rounded-lg border p-3 transition-colors ${
                      isPreviewing
                        ? "border-primary/60 bg-primary/[0.06] shadow-[inset_0_0_0_1px_rgba(99,102,241,0.14)]"
                        : isPersistedActive
                          ? "border-border/80 bg-muted/25"
                          : isDisplayedTheme
                            ? "border-primary/40 bg-primary/[0.04]"
                            : "border-border hover:bg-accent"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className="h-6 w-6 rounded-full border-2 border-border"
                        style={{ backgroundColor: themeOption.activeColor.light }}
                      />
                      <div>
                        <p className="text-sm font-medium">{themeOption.label}</p>
                        {isPreviewing ? (
                          <p className="text-xs text-primary">Previewing</p>
                        ) : isPersistedActive ? (
                          <p className="text-xs text-muted-foreground">
                            {isWorkspaceOverride ? "Saved for this workspace" : "Current theme"}
                          </p>
                        ) : null}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {!isPreviewing && !isDisplayedTheme ? (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handlePreview(themeOption.name)}
                        >
                          <Eye className="mr-1 h-4 w-4" />
                          Preview
                        </Button>
                      ) : null}
                      {isPreviewing ? (
                        <Button
                          variant="default"
                          size="sm"
                          disabled={isSavingTheme}
                          onClick={() => void handleUseTheme(themeOption.name)}
                        >
                          <Check className="mr-1 h-4 w-4" />
                          Use
                        </Button>
                      ) : null}
                      {isPersistedActive && !isPreviewing ? (
                        <Check className="h-4 w-4 text-primary" />
                      ) : null}
                    </div>
                  </div>
                )
              })
            )}
          </div>
        </ScrollArea>
      </ResponsiveDialog.Body>
    </ResponsiveDialog>
  )
}

export function SignedInNavUserActions({
  variant,
  onSettingsClick,
  onOpenProfile,
  onOpenThemePreset,
  onClose,
}: SignedInNavUserActionsProps) {
  const { activeTheme } = useThemeConfig()

  const handleOpenSettings = React.useCallback(() => {
    if (onSettingsClick) {
      onSettingsClick()
    } else {
      window.dispatchEvent(new CustomEvent("open-settings", { detail: { tab: "workspace" } }))
    }
    onClose?.()
  }, [onClose, onSettingsClick])

  return (
    <>
      <ActionRow
        variant={variant}
        icon={User}
        label="Profile"
        description="View your account profile"
        onAction={onOpenProfile}
      />
      <ActionRow
        variant={variant}
        icon={Settings}
        label="Settings"
        description="Workspace and feature settings"
        onAction={handleOpenSettings}
      />

      <ActionDivider variant={variant} />
      <ActionSectionLabel variant={variant}>Appearance</ActionSectionLabel>
      {renderAppearanceSection(variant)}
      <ActionRow
        variant={variant}
        icon={Palette}
        label="Theme Preset"
        description="Preview and save a workspace theme"
        trailing={formatThemeLabel(activeTheme)}
        onAction={onOpenThemePreset}
      />

      <ActionDivider variant={variant} />
      <SafeSignOutButton>
        {variant === "dropdown" ? (
          <DropdownMenuItem onSelect={() => onClose?.()}>
            <LogOut className="mr-2 h-4 w-4" />
            Sign out
          </DropdownMenuItem>
        ) : (
          <Button
            type="button"
            variant="ghost"
            className="h-auto w-full justify-start rounded-xl px-3 py-3 text-destructive"
            onClick={() => onClose?.()}
          >
            <LogOut className="mr-3 h-4 w-4" />
            Sign out
          </Button>
        )}
      </SafeSignOutButton>
    </>
  )
}

export function GuestNavUserActions({
  variant,
  onSettingsClick,
  onOpenProfile,
  onOpenThemePreset,
  onClose,
}: GuestNavUserActionsProps) {
  const { activeTheme } = useThemeConfig()

  const handleOpenSettings = React.useCallback(() => {
    if (onSettingsClick) {
      onSettingsClick()
    } else {
      window.dispatchEvent(new CustomEvent("open-settings", { detail: { tab: "workspace" } }))
    }
    onClose?.()
  }, [onClose, onSettingsClick])

  return (
    <>
      <ActionRow
        variant={variant}
        icon={User}
        label="Profile"
        description="View demo profile and continue with an account"
        onAction={onOpenProfile}
      />
      <ActionRow
        variant={variant}
        icon={Settings}
        label="Settings"
        description="Preview workspace and global settings"
        onAction={handleOpenSettings}
      />

      <ActionDivider variant={variant} />
      <ActionSectionLabel variant={variant}>Appearance</ActionSectionLabel>
      {renderAppearanceSection(variant)}
      <ActionRow
        variant={variant}
        icon={Palette}
        label="Theme Preset"
        description="Preview and save a workspace theme"
        trailing={formatThemeLabel(activeTheme)}
        onAction={onOpenThemePreset}
      />

      <ActionDivider variant={variant} />
      <SafeSignInButton>
        {variant === "dropdown" ? (
          <DropdownMenuItem onSelect={() => onClose?.()}>
            <User className="mr-2 h-4 w-4" />
            Sign in
          </DropdownMenuItem>
        ) : (
          <Button type="button" className="w-full rounded-xl" onClick={() => onClose?.()}>
            Sign in
          </Button>
        )}
      </SafeSignInButton>
      <SafeSignUpButton>
        {variant === "dropdown" ? (
          <DropdownMenuItem onSelect={() => onClose?.()}>
            <User className="mr-2 h-4 w-4" />
            Sign up
          </DropdownMenuItem>
        ) : (
          <Button
            type="button"
            variant="outline"
            className="w-full rounded-xl"
            onClick={() => onClose?.()}
          >
            Sign up
          </Button>
        )}
      </SafeSignUpButton>
    </>
  )
}
