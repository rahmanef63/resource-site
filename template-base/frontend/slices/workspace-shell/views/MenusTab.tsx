"use client"

import * as React from "react"
import { useQuery, useMutation } from "convex/react"
import { api } from "@/frontend/shared/foundation/utils/convex/any-api"
import type { Doc, Id } from "@/convex/_generated/dataModel"
import { useWorkspaceContext } from "@/frontend/shared/foundation/provider/WorkspaceProvider"
import { useNavContext } from "../hooks/useNavContext"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { ResponsiveDialog } from "@/frontend/shared/ui/components/ResponsiveDialog"
import {
  Plus, Trash2, Pencil, Star, Users, User, Cog, ChevronRight, Eye, EyeOff,
} from "lucide-react"
import { cn } from "@/lib/utils"

interface MenusTabProps {
  workspaceId: Id<"workspaces">
}

export function MenusTab({ workspaceId }: MenusTabProps) {
  const nav = useNavContext(workspaceId)
  const [selectedSetId, setSelectedSetId] = React.useState<Id<"workspaceShell_menuSets"> | null>(null)
  const [newSetOpen, setNewSetOpen] = React.useState(false)

  const allSets = React.useMemo(
    () => [...nav.availableMenuSets.user, ...nav.availableMenuSets.workspace, ...nav.availableMenuSets.system],
    [nav.availableMenuSets],
  )

  React.useEffect(() => {
    if (!selectedSetId && allSets.length > 0) {
      setSelectedSetId(allSets[0]._id)
    }
  }, [selectedSetId, allSets])

  const selectedSet = allSets.find((s) => s._id === selectedSetId) ?? null

  return (
    <div className="grid grid-cols-1 md:grid-cols-[260px_1fr] gap-4">
      <MenuSetsList
        sections={nav.availableMenuSets}
        selectedId={selectedSetId}
        defaultId={
          nav.availableMenuSets.workspace.find((s) => s.isDefault)?._id ?? null
        }
        onSelect={setSelectedSetId}
        onNew={() => setNewSetOpen(true)}
      />
      <MenuItemsEditor
        workspaceId={workspaceId}
        menuSet={selectedSet}
      />
      <CreateMenuSetDialog
        open={newSetOpen}
        onOpenChange={setNewSetOpen}
        workspaceId={workspaceId}
        onCreated={(id) => {
          setSelectedSetId(id)
          setNewSetOpen(false)
        }}
      />
    </div>
  )
}

function MenuSetsList({
  sections,
  selectedId,
  defaultId,
  onSelect,
  onNew,
}: {
  sections: {
    user: Doc<"workspaceShell_menuSets">[]
    workspace: Doc<"workspaceShell_menuSets">[]
    system: Doc<"workspaceShell_menuSets">[]
  }
  selectedId: Id<"workspaceShell_menuSets"> | null
  defaultId: Id<"workspaceShell_menuSets"> | null
  onSelect: (id: Id<"workspaceShell_menuSets">) => void
  onNew: () => void
}) {
  const groups: Array<{
    key: "user" | "workspace" | "system"
    label: string
    icon: typeof User
    items: Doc<"workspaceShell_menuSets">[]
  }> = [
    { key: "user", label: "Yours", icon: User, items: sections.user },
    { key: "workspace", label: "Workspace", icon: Users, items: sections.workspace },
    { key: "system", label: "System", icon: Cog, items: sections.system },
  ]

  return (
    <aside className="space-y-3 rounded-md border bg-card p-2">
      <div className="flex items-center justify-between px-2 pt-1">
        <h4 className="text-xs font-medium uppercase text-muted-foreground">
          Menu sets
        </h4>
        <Button size="sm" variant="ghost" onClick={onNew} className="h-6 px-2">
          <Plus className="h-3 w-3 mr-1" /> New
        </Button>
      </div>
      <div className="space-y-3">
        {groups.map((g) => {
          if (g.items.length === 0) return null
          const Icon = g.icon
          return (
            <div key={g.key} className="space-y-1">
              <div className="flex items-center gap-1.5 px-2 text-[10px] uppercase tracking-wide text-muted-foreground">
                <Icon className="h-3 w-3" />
                {g.label}
              </div>
              {g.items.map((ms) => (
                <button
                  key={ms._id}
                  type="button"
                  onClick={() => onSelect(ms._id)}
                  className={cn(
                    "flex w-full items-center gap-2 rounded px-2 py-1.5 text-sm text-left",
                    ms._id === selectedId
                      ? "bg-accent text-accent-foreground"
                      : "hover:bg-accent/50",
                  )}
                >
                  <span className="truncate flex-1">{ms.name}</span>
                  {ms._id === defaultId && (
                    <Star className="h-3 w-3 text-yellow-500" />
                  )}
                </button>
              ))}
            </div>
          )
        })}
      </div>
    </aside>
  )
}

function MenuItemsEditor({
  workspaceId,
  menuSet,
}: {
  workspaceId: Id<"workspaces">
  menuSet: Doc<"workspaceShell_menuSets"> | null
}) {
  const items = useQuery(
    (api as any).features.workspaceShell.queries.listMenuItemsBySet,
    menuSet ? { menuSetId: menuSet._id } : "skip",
  ) as Doc<"workspaceShell_menuItems">[] | undefined

  const createItem = useMutation((api as any).features.workspaceShell.mutations.createMenuItem)
  const updateItem = useMutation((api as any).features.workspaceShell.mutations.updateMenuItem)
  const deleteItem = useMutation((api as any).features.workspaceShell.mutations.deleteMenuItem)
  const deleteSet = useMutation((api as any).features.workspaceShell.mutations.deleteMenuSet)
  const setDefault = useMutation((api as any).features.workspaceShell.mutations.setWorkspaceDefaultMenuSet)

  const [addOpen, setAddOpen] = React.useState(false)
  const [editing, setEditing] = React.useState<Doc<"workspaceShell_menuItems"> | null>(null)

  if (!menuSet) {
    return (
      <div className="rounded-md border bg-card p-8 text-center text-sm text-muted-foreground">
        Select a menu set from the left.
      </div>
    )
  }

  const sortedItems = (items ?? []).slice().sort((a, b) => a.order - b.order)
  const canEdit = menuSet.ownerType !== "system"

  return (
    <section className="rounded-md border bg-card flex flex-col">
      <header className="border-b px-4 py-3 flex items-center justify-between gap-3 flex-wrap">
        <div className="space-y-0.5 min-w-0">
          <h3 className="text-base font-medium truncate">{menuSet.name}</h3>
          <p className="text-xs text-muted-foreground truncate">
            {menuSet.description ?? "—"} · {sortedItems.length} items · {menuSet.ownerType}
          </p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          {menuSet.ownerType === "workspace" && (
            <Button
              size="sm"
              variant="outline"
              onClick={() => setDefault({ workspaceId, menuSetId: menuSet._id })}
              title="Make this the workspace default"
            >
              <Star className="h-3.5 w-3.5 mr-1" /> Set default
            </Button>
          )}
          {canEdit && (
            <Button size="sm" onClick={() => setAddOpen(true)}>
              <Plus className="h-3.5 w-3.5 mr-1" /> Add item
            </Button>
          )}
          {canEdit && (
            <Button
              size="sm"
              variant="ghost"
              className="text-destructive"
              onClick={async () => {
                if (confirm(`Delete menu set "${menuSet.name}" and ${sortedItems.length} items?`)) {
                  await deleteSet({ id: menuSet._id })
                }
              }}
            >
              <Trash2 className="h-3.5 w-3.5" />
            </Button>
          )}
        </div>
      </header>
      <div className="p-2 overflow-auto max-h-[600px]">
        {sortedItems.length === 0 ? (
          <div className="py-8 text-center text-sm text-muted-foreground">
            {items === undefined ? "Loading…" : "No items. Click Add item to start."}
          </div>
        ) : (
          <ul className="divide-y rounded">
            {sortedItems.map((item) => (
              <li key={item._id} className="flex items-center gap-3 px-2 py-2 text-sm">
                <span className="w-10 text-xs text-muted-foreground tabular-nums">
                  {item.order}
                </span>
                {item.parentId && <ChevronRight className="h-3 w-3 opacity-50" />}
                <span className="font-medium truncate flex-1">{item.label}</span>
                {item.route && (
                  <code className="text-xs text-muted-foreground truncate max-w-[30%]">
                    {item.route}
                  </code>
                )}
                <button
                  type="button"
                  onClick={() => updateItem({ id: item._id, isVisible: !item.isVisible })}
                  className="p-1 hover:bg-muted rounded"
                  title={item.isVisible ? "Hide" : "Show"}
                  disabled={!canEdit}
                >
                  {item.isVisible !== false ? (
                    <Eye className="h-3.5 w-3.5" />
                  ) : (
                    <EyeOff className="h-3.5 w-3.5 opacity-50" />
                  )}
                </button>
                {canEdit && (
                  <>
                    <button
                      type="button"
                      onClick={() => setEditing(item)}
                      className="p-1 hover:bg-muted rounded"
                      title="Edit"
                    >
                      <Pencil className="h-3.5 w-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={async () => {
                        if (confirm(`Delete "${item.label}"?`)) {
                          await deleteItem({ id: item._id })
                        }
                      }}
                      className="p-1 hover:bg-muted rounded text-destructive"
                      title="Delete"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </>
                )}
              </li>
            ))}
          </ul>
        )}
      </div>

      <MenuItemDialog
        open={addOpen}
        onOpenChange={setAddOpen}
        title="Add menu item"
        onSubmit={async ({ label, route, icon }) => {
          await createItem({
            menuSetId: menuSet._id,
            label,
            route: route || undefined,
            icon: icon || undefined,
          })
          setAddOpen(false)
        }}
      />
      <MenuItemDialog
        open={editing !== null}
        onOpenChange={(o) => !o && setEditing(null)}
        title="Edit menu item"
        initial={editing ?? undefined}
        onSubmit={async ({ label, route, icon }) => {
          if (!editing) return
          await updateItem({
            id: editing._id,
            label,
            route: route || undefined,
            icon: icon || undefined,
          })
          setEditing(null)
        }}
      />
    </section>
  )
}

interface MenuItemDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  title: string
  initial?: { label: string; route?: string; icon?: string }
  onSubmit: (data: { label: string; route?: string; icon?: string }) => Promise<void>
}

function MenuItemDialog({
  open,
  onOpenChange,
  title,
  initial,
  onSubmit,
}: MenuItemDialogProps) {
  const [label, setLabel] = React.useState(initial?.label ?? "")
  const [route, setRoute] = React.useState(initial?.route ?? "")
  const [icon, setIcon] = React.useState(initial?.icon ?? "")
  const [saving, setSaving] = React.useState(false)

  React.useEffect(() => {
    if (open && initial) {
      setLabel(initial.label)
      setRoute(initial.route ?? "")
      setIcon(initial.icon ?? "")
    } else if (open) {
      setLabel("")
      setRoute("")
      setIcon("")
    }
  }, [open, initial])

  const handleSave = async () => {
    if (!label.trim()) return
    setSaving(true)
    try {
      await onSubmit({ label: label.trim(), route, icon })
    } finally {
      setSaving(false)
    }
  }

  return (
    <ResponsiveDialog open={open} onOpenChange={onOpenChange}>
      <ResponsiveDialog.Header>
        <ResponsiveDialog.Title>{title}</ResponsiveDialog.Title>
      </ResponsiveDialog.Header>
      <ResponsiveDialog.Body className="space-y-3">
        <div className="space-y-2">
          <Label htmlFor="mi-label">Label</Label>
          <Input id="mi-label" value={label} onChange={(e) => setLabel(e.target.value)} autoFocus />
        </div>
        <div className="space-y-2">
          <Label htmlFor="mi-route">Route (optional)</Label>
          <Input id="mi-route" value={route} onChange={(e) => setRoute(e.target.value)} placeholder="/dashboard/foo" />
        </div>
        <div className="space-y-2">
          <Label htmlFor="mi-icon">Icon name (Lucide, optional)</Label>
          <Input id="mi-icon" value={icon} onChange={(e) => setIcon(e.target.value)} placeholder="Home" />
        </div>
      </ResponsiveDialog.Body>
      <ResponsiveDialog.Footer>
        <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
        <Button onClick={handleSave} disabled={!label.trim() || saving}>
          {saving ? "Saving…" : "Save"}
        </Button>
      </ResponsiveDialog.Footer>
    </ResponsiveDialog>
  )
}

function CreateMenuSetDialog({
  open,
  onOpenChange,
  workspaceId,
  onCreated,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  workspaceId: Id<"workspaces">
  onCreated: (id: Id<"workspaceShell_menuSets">) => void
}) {
  const createSet = useMutation((api as any).features.workspaceShell.mutations.createMenuSet)
  const [name, setName] = React.useState("")
  const [ownerType, setOwnerType] = React.useState<"workspace" | "user">("workspace")
  const [saving, setSaving] = React.useState(false)

  const handleSave = async () => {
    if (!name.trim()) return
    setSaving(true)
    try {
      const slug = name.trim().toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") + "-" + Date.now()
      const id = await createSet({
        workspaceId,
        name: name.trim(),
        slug,
        ownerType,
      })
      onCreated(id as Id<"workspaceShell_menuSets">)
      setName("")
    } finally {
      setSaving(false)
    }
  }

  return (
    <ResponsiveDialog open={open} onOpenChange={onOpenChange}>
      <ResponsiveDialog.Header>
        <ResponsiveDialog.Title>New menu set</ResponsiveDialog.Title>
      </ResponsiveDialog.Header>
      <ResponsiveDialog.Body className="space-y-3">
        <div className="space-y-2">
          <Label htmlFor="ms-name">Name</Label>
          <Input id="ms-name" value={name} onChange={(e) => setName(e.target.value)} autoFocus />
        </div>
        <div className="flex items-center justify-between">
          <Label htmlFor="ms-personal" className="cursor-pointer">Personal (only you can edit)</Label>
          <Switch
            id="ms-personal"
            checked={ownerType === "user"}
            onCheckedChange={(v) => setOwnerType(v ? "user" : "workspace")}
          />
        </div>
      </ResponsiveDialog.Body>
      <ResponsiveDialog.Footer>
        <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
        <Button onClick={handleSave} disabled={!name.trim() || saving}>
          {saving ? "Creating…" : "Create"}
        </Button>
      </ResponsiveDialog.Footer>
    </ResponsiveDialog>
  )
}
