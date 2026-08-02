"use client"

import * as React from "react"
import {
  Command as CommandIcon,
  Search,
  Settings,
  User,
  FileText,
  FolderKanban,
  Bell,
  Moon,
  Sun,
  LogOut,
  Plus,
  Building2,
  LayoutGrid,
  Keyboard,
} from "lucide-react"
import { useTheme } from "next-themes"
import { useRouter } from "next/navigation"
import { useAuthClient } from "@/frontend/shared/foundation/auth"

import { Button } from "@/components/ui/button"
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
  CommandShortcut,
} from "@/components/ui/command"
import { cn } from "@/lib/utils"
import { getAllCommands } from "@/frontend/shared/foundation/utils/registry/command-registry"
import { getAllFeatures } from "@/frontend/shared/lib/features/registry"
import {
  getDashboardFeatureHref,
  AUTHENTICATED_DASHBOARD_BASE,
} from "@/frontend/shared/ui/layout/dashboard/dashboard-routes"
import { getIconComponent } from "@/frontend/shared/ui/icons/dynamic-icon"
import { useWorkspaceContext } from "@/frontend/shared/foundation/provider/WorkspaceProvider"

export interface CommandAction {
  id: string
  label: string
  icon?: React.ComponentType<{ className?: string }>
  shortcut?: string
  group?: string
  keywords?: string[]
  onSelect: () => void
}

export interface CommandMenuProps {
  actions?: CommandAction[]
  placeholder?: string
  onOpenChange?: (open: boolean) => void
  className?: string
}

const defaultGroups: Record<string, string> = {
  navigation: "Go to Feature",
  workspaces: "Switch Workspace",
  actions: "Quick Actions",
  settings: "Settings",
  theme: "Theme",
}

/**
 * Command Menu Component (Cmd+K / Ctrl+K)
 */
export function CommandMenu({
  actions = [],
  placeholder = "Type a command or search...",
  onOpenChange,
  className,
}: CommandMenuProps) {
  const [open, setOpen] = React.useState(false)
  const { theme, setTheme } = useTheme()
  const router = useRouter()
  const { signOut } = useAuthClient()

  // Workspace context for workspace switching
  const { workspaces, setWorkspaceId } = useWorkspaceContext()

  // Dynamic feature navigation from registry
  const featureNavCommands = React.useMemo((): CommandAction[] =>
    getAllFeatures()
      .filter(f => f.technical?.hasUI !== false)
      .map(f => {
        const IconComponent =
          (f.ui?.icon ? (getIconComponent(f.ui.icon) as React.ComponentType<{ className?: string }> | null) : null) ??
          LayoutGrid
        return {
          id: `nav-feature-${f.id}`,
          label: `Go to ${f.name}`,
          icon: IconComponent,
          group: "navigation",
          keywords: [f.id, ...f.name.toLowerCase().split(" ")],
          onSelect: () => {
            router.push(getDashboardFeatureHref(AUTHENTICATED_DASHBOARD_BASE, f.id))
          },
        }
      }),
  [router])

  // Workspace switching commands
  const workspaceCommands = React.useMemo((): CommandAction[] => {
    if (!workspaces) return []
    return workspaces.map(ws => ({
      id: `switch-ws-${ws._id}`,
      label: ws.name,
      icon: Building2,
      group: "workspaces",
      keywords: ["workspace", "switch", ws.name.toLowerCase()],
      onSelect: () => setWorkspaceId(ws._id),
    }))
  }, [workspaces, setWorkspaceId])

  // Non-navigation default actions (theme, profile, logout)
  const defaultActions = React.useMemo((): CommandAction[] => [
    // Quick Actions
    {
      id: "new-document",
      label: "Create New Document",
      icon: FileText,
      shortcut: "N D",
      group: "actions",
      keywords: ["new", "create", "document", "file"],
      onSelect: () => window.dispatchEvent(new Event("open-create-document-dialog")),
    },
    {
      id: "new-project",
      label: "Create New Project",
      icon: FolderKanban,
      shortcut: "N P",
      group: "actions",
      keywords: ["new", "create", "project"],
      onSelect: () => router.push(getDashboardFeatureHref(AUTHENTICATED_DASHBOARD_BASE, "projects")),
    },
    {
      id: "notifications",
      label: "View Notifications",
      icon: Bell,
      shortcut: "G N",
      group: "actions",
      keywords: ["notifications", "alerts", "inbox"],
      onSelect: () => window.dispatchEvent(new Event("open-notifications")),
    },

    // Theme
    {
      id: "theme-light",
      label: "Light Mode",
      icon: Sun,
      group: "theme",
      keywords: ["light", "theme", "mode"],
      onSelect: () => setTheme("light"),
    },
    {
      id: "theme-dark",
      label: "Dark Mode",
      icon: Moon,
      group: "theme",
      keywords: ["dark", "theme", "mode"],
      onSelect: () => setTheme("dark"),
    },

    // Settings
    {
      id: "profile",
      label: "Edit Profile",
      icon: User,
      group: "settings",
      keywords: ["profile", "account", "user"],
      onSelect: () => router.push("/dashboard/settings"),
    },
    {
      id: "logout",
      label: "Sign Out",
      icon: LogOut,
      group: "settings",
      keywords: ["logout", "signout", "exit"],
      onSelect: () => signOut({ redirectUrl: "/sign-in" }),
    },
  // eslint-disable-next-line react-hooks/exhaustive-deps
  ], [router, setTheme, signOut])

  const registryCommands = React.useMemo(() =>
    getAllCommands().map(cmd => ({
      id: cmd.id,
      label: cmd.label,
      icon: cmd.icon,
      shortcut: cmd.shortcut,
      group: cmd.group ?? "other",
      keywords: cmd.keywords,
      onSelect: cmd.action,
    })),
  []) // getAllCommands reads a static registry — no reactive deps needed

  const allActions = React.useMemo(() => [
    ...featureNavCommands,
    ...workspaceCommands,
    ...defaultActions,
    ...registryCommands,
    ...actions,
  ], [featureNavCommands, workspaceCommands, defaultActions, registryCommands, actions])

  // Group actions
  const groupedActions = React.useMemo(() =>
    allActions.reduce((acc, action) => {
      const group = action.group || "other"
      if (!acc[group]) acc[group] = []
      acc[group].push(action)
      return acc
    }, {} as Record<string, CommandAction[]>),
  [allActions])

  // Keyboard shortcut
  React.useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault()
        setOpen((open) => !open)
      }
    }

    // Listen for custom open event
    const handleOpenEvent = () => setOpen(true)
    window.addEventListener("open-command-menu", handleOpenEvent)

    document.addEventListener("keydown", down)
    return () => {
      document.removeEventListener("keydown", down)
      window.removeEventListener("open-command-menu", handleOpenEvent)
    }
  }, [])

  const handleOpenChange = (newOpen: boolean) => {
    setOpen(newOpen)
    onOpenChange?.(newOpen)
  }

  const handleSelect = (action: CommandAction) => {
    action.onSelect()
    setOpen(false)
  }

  return (
    <>
      <CommandDialog open={open} onOpenChange={handleOpenChange}>
        <CommandInput placeholder={placeholder} />
        <CommandList>
          <CommandEmpty>No results found.</CommandEmpty>

          {Object.entries(groupedActions).map(([group, groupActions]) => (
            <React.Fragment key={group}>
              <CommandGroup heading={defaultGroups[group] || group}>
                {groupActions.map((action) => {
                  const Icon = action.icon ?? CommandIcon
                  return (
                    <CommandItem
                      key={action.id}
                      value={`${action.label} ${action.keywords?.join(" ") || ""}`}
                      onSelect={() => handleSelect(action)}
                    >
                      <Icon className="mr-2 h-4 w-4" />
                      <span>{action.label}</span>
                      {action.shortcut && (
                        <CommandShortcut>{action.shortcut}</CommandShortcut>
                      )}
                    </CommandItem>
                  )
                })}
              </CommandGroup>
              <CommandSeparator />
            </React.Fragment>
          ))}
        </CommandList>
      </CommandDialog>
    </>
  )
}

/**
 * Command Menu Trigger Button
 */
export function CommandMenuTrigger({
  className,
  onClick,
}: {
  className?: string
  onClick?: () => void
}) {
  return (
    <Button
      variant="outline"
      className={cn(
        "relative h-9 w-full justify-start rounded-md bg-muted/50 text-sm font-normal text-muted-foreground shadow-none sm:pr-12 md:w-40 lg:w-64",
        className
      )}
      onClick={onClick}
    >
      <Search className="mr-2 h-4 w-4" />
      <span className="hidden lg:inline-flex">Search or command...</span>
      <span className="inline-flex lg:hidden">Search...</span>
      <kbd className="pointer-events-none absolute right-1.5 top-1.5 hidden h-6 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-xs font-medium opacity-100 sm:flex">
        <span className="text-xs">⌘</span>K
      </kbd>
    </Button>
  )
}

/**
 * Keyboard Shortcuts Dialog
 */
export function KeyboardShortcutsDialog({
  trigger,
  className,
}: {
  trigger?: React.ReactNode
  className?: string
}) {
  const [open, setOpen] = React.useState(false)

  const shortcuts = [
    {
      category: "Navigation", items: [
        { keys: ["⌘", "K"], description: "Open Command Menu / Go to Feature" },
        { keys: ["⌘", "K"], description: "Switch Workspace" },
      ]
    },
    {
      category: "Actions", items: [
        { keys: ["⌘", "K"], description: "Open Command Menu" },
        { keys: ["/"], description: "Focus Search" },
        { keys: ["N", "D"], description: "New Document" },
        { keys: ["N", "P"], description: "New Project" },
      ]
    },
    {
      category: "General", items: [
        { keys: ["⌘", "S"], description: "Save" },
        { keys: ["⌘", "Z"], description: "Undo" },
        { keys: ["⌘", "⇧", "Z"], description: "Redo" },
        { keys: ["?"], description: "Show Shortcuts" },
      ]
    },
  ]

  // Listen for ? key
  React.useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "?" && !e.metaKey && !e.ctrlKey) {
        e.preventDefault()
        setOpen((open) => !open)
      }
    }

    document.addEventListener("keydown", down)
    return () => document.removeEventListener("keydown", down)
  }, [])

  return (
    <CommandDialog open={open} onOpenChange={setOpen}>
      <div className="p-4">
        <div className="flex items-center gap-2 mb-4">
          <Keyboard className="h-5 w-5" />
          <h2 className="text-lg font-semibold">Keyboard Shortcuts</h2>
        </div>
        <div className="space-y-6">
          {shortcuts.map((section) => (
            <div key={section.category}>
              <h3 className="text-sm font-medium text-muted-foreground mb-2">
                {section.category}
              </h3>
              <div className="space-y-2">
                {section.items.map((shortcut) => (
                  <div
                    key={shortcut.description}
                    className="flex items-center justify-between py-1"
                  >
                    <span className="text-sm">{shortcut.description}</span>
                    <div className="flex items-center gap-1">
                      {shortcut.keys.map((key, i) => (
                        <React.Fragment key={i}>
                          <kbd className="px-2 py-1 text-xs font-semibold bg-muted rounded">
                            {key}
                          </kbd>
                          {i < shortcut.keys.length - 1 && (
                            <span className="text-muted-foreground">+</span>
                          )}
                        </React.Fragment>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </CommandDialog>
  )
}
