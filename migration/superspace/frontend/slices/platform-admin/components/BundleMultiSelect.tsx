/**
 * Bundle Multi-Select Component
 * 
 * A multi-select dropdown for assigning features to bundle categories.
 * Works like Notion's multi-select property - can select existing bundles
 * and create new ones on the fly.
 */

"use client"

import React, { useState, useMemo, useRef, useEffect } from "react"
import {
  X,
  Plus,
  Check,
  ChevronDown,
  Search,
  Loader2,
  Package,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "@/components/ui/command"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  ResponsiveDialog,
} from "@/frontend/shared/ui"
import { Label } from "@/components/ui/label"

export type BundleRole = "core" | "recommended" | "optional"

export interface BundleOption {
  bundleId: string
  name: string
  description?: string
  icon?: string
  primaryColor?: string
  category?: string
}

export interface SelectedBundle {
  bundleId: string
  role: BundleRole
}

interface BundleMultiSelectProps {
  /** Available bundle options */
  options: BundleOption[]
  /** Currently selected bundles with their roles */
  value: SelectedBundle[]
  /** Callback when selection changes */
  onChange: (value: SelectedBundle[]) => void
  /** Whether the component is disabled */
  disabled?: boolean
  /** Placeholder text */
  placeholder?: string
  /** Allow creating new bundles */
  allowCreate?: boolean
  /** Callback when creating a new bundle */
  onCreateBundle?: (bundleId: string, name: string) => Promise<void>
  /** Loading state */
  isLoading?: boolean
  /** Class name for the trigger */
  className?: string
}

const ROLE_COLORS: Record<BundleRole, string> = {
  core: "bg-green-500/10 text-green-500 border-green-500/20",
  recommended: "bg-blue-500/10 text-blue-500 border-blue-500/20",
  optional: "bg-gray-500/10 text-gray-500 border-gray-500/20",
}

const ROLE_LABELS: Record<BundleRole, string> = {
  core: "Core",
  recommended: "Recommended",
  optional: "Optional",
}

export function BundleMultiSelect({
  options,
  value,
  onChange,
  disabled = false,
  placeholder = "Select bundles...",
  allowCreate = true,
  onCreateBundle,
  isLoading = false,
  className,
}: BundleMultiSelectProps) {
  const [open, setOpen] = useState(false)
  const [search, setSearch] = useState("")
  const [createDialogOpen, setCreateDialogOpen] = useState(false)
  const [newBundleId, setNewBundleId] = useState("")
  const [newBundleName, setNewBundleName] = useState("")
  const [isCreating, setIsCreating] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  // Get selected bundle IDs for quick lookup
  const selectedBundleIds = useMemo(
    () => new Set(value.map((v) => v.bundleId)),
    [value]
  )

  // Filter options based on search
  const filteredOptions = useMemo(() => {
    if (!search) return options
    const searchLower = search.toLowerCase()
    return options.filter(
      (opt) =>
        opt.bundleId.toLowerCase().includes(searchLower) ||
        opt.name.toLowerCase().includes(searchLower) ||
        opt.category?.toLowerCase().includes(searchLower)
    )
  }, [options, search])

  // Check if search term could be a new bundle
  const canCreateNew = useMemo(() => {
    if (!allowCreate || !search) return false
    const searchLower = search.toLowerCase().replace(/\s+/g, "-")
    return !options.some((opt) => opt.bundleId.toLowerCase() === searchLower)
  }, [allowCreate, search, options])

  const handleSelect = (bundleId: string, role: BundleRole = "optional") => {
    if (selectedBundleIds.has(bundleId)) {
      // Remove bundle
      onChange(value.filter((v) => v.bundleId !== bundleId))
    } else {
      // Add bundle
      onChange([...value, { bundleId, role }])
    }
  }

  const handleRoleChange = (bundleId: string, role: BundleRole) => {
    onChange(
      value.map((v) => (v.bundleId === bundleId ? { ...v, role } : v))
    )
  }

  const handleRemove = (bundleId: string) => {
    onChange(value.filter((v) => v.bundleId !== bundleId))
  }

  const handleCreateBundle = async () => {
    if (!onCreateBundle || !newBundleId || !newBundleName) return

    setIsCreating(true)
    try {
      await onCreateBundle(newBundleId, newBundleName)
      // Add the new bundle to selection
      onChange([...value, { bundleId: newBundleId, role: "optional" }])
      setCreateDialogOpen(false)
      setNewBundleId("")
      setNewBundleName("")
    } catch (error) {
      console.error("Failed to create bundle:", error)
    } finally {
      setIsCreating(false)
    }
  }

  const openCreateDialog = () => {
    // Convert search to bundleId format
    const bundleId = search.toLowerCase().replace(/\s+/g, "-")
    setNewBundleId(bundleId)
    setNewBundleName(search)
    setCreateDialogOpen(true)
    setOpen(false)
  }

  // Get bundle info by ID
  const getBundleInfo = (bundleId: string): BundleOption | undefined => {
    return options.find((opt) => opt.bundleId === bundleId)
  }

  return (
    <>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button aria-label="Close"
            variant="outline"
            role="combobox"
            aria-expanded={open}
            disabled={disabled || isLoading}
            className={cn(
              "min-h-10 h-auto w-full justify-between font-normal",
              className
            )}
          >
            {isLoading ? (
              <div className="flex items-center gap-2">
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>Loading...</span>
              </div>
            ) : value.length > 0 ? (
              <div className="flex flex-wrap gap-1">
                {value.map((selected) => {
                  const bundle = getBundleInfo(selected.bundleId)
                  return (
                    <Badge
                      key={selected.bundleId}
                      variant="outline"
                      className={cn(
                        "gap-1 pr-1",
                        ROLE_COLORS[selected.role]
                      )}
                      style={
                        bundle?.primaryColor
                          ? { borderColor: bundle.primaryColor + "40" }
                          : undefined
                      }
                    >
                      <span>{bundle?.name || selected.bundleId}</span>
                      <span className="text-[10px] opacity-70">
                        ({ROLE_LABELS[selected.role]})
                      </span>
                      <button aria-label="Close"
                        className="ml-1 rounded-full outline-none ring-offset-background focus:ring-2 focus:ring-ring focus:ring-offset-2 hover:bg-foreground/10"
                        onMouseDown={(e) => {
                          e.preventDefault()
                          e.stopPropagation()
                        }}
                        onClick={(e) => {
                          e.preventDefault()
                          e.stopPropagation()
                          handleRemove(selected.bundleId)
                        }}
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </Badge>
                  )
                })}
              </div>
            ) : (
              <span className="text-muted-foreground">{placeholder}</span>
            )}
            <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-[400px] p-0" align="start">
          <Command shouldFilter={false}>
            <CommandInput
              ref={inputRef}
              placeholder="Search bundles..."
              value={search}
              onValueChange={setSearch}
            />
            <CommandList>
              <CommandEmpty>
                {canCreateNew && allowCreate ? (
                  <button
                    className="w-full flex items-center gap-2 p-2 text-sm cursor-pointer hover:bg-accent rounded-sm"
                    onClick={openCreateDialog}
                  >
                    <Plus className="h-4 w-4" />
                    Create &quot;{search}&quot;
                  </button>
                ) : (
                  <span>No bundles found.</span>
                )}
              </CommandEmpty>
              {filteredOptions.length > 0 && (
                <CommandGroup heading="Available Bundles">
                  {filteredOptions.map((option) => {
                    const isSelected = selectedBundleIds.has(option.bundleId)
                    const selectedValue = value.find(
                      (v) => v.bundleId === option.bundleId
                    )

                    return (
                      <CommandItem
                        key={option.bundleId}
                        value={option.bundleId}
                        onSelect={() => handleSelect(option.bundleId)}
                        className="flex items-center justify-between"
                      >
                        <div className="flex items-center gap-2">
                          <div
                            className={cn(
                              "flex h-4 w-4 items-center justify-center rounded-sm border",
                              isSelected
                                ? "bg-primary border-primary text-primary-foreground"
                                : "border-muted-foreground"
                            )}
                          >
                            {isSelected && <Check className="h-3 w-3" />}
                          </div>
                          <div className="flex flex-col">
                            <span className="font-medium">{option.name}</span>
                            <span className="text-xs text-muted-foreground">
                              {option.bundleId}
                            </span>
                          </div>
                        </div>
                        {isSelected && selectedValue && (
                          <Select
                            value={selectedValue.role}
                            onValueChange={(role) =>
                              handleRoleChange(option.bundleId, role as BundleRole)
                            }
                          >
                            <SelectTrigger
                              className="w-28 h-7 text-xs"
                              onClick={(e) => e.stopPropagation()}
                            >
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="core">Core</SelectItem>
                              <SelectItem value="recommended">Recommended</SelectItem>
                              <SelectItem value="optional">Optional</SelectItem>
                            </SelectContent>
                          </Select>
                        )}
                      </CommandItem>
                    )
                  })}
                </CommandGroup>
              )}
              {canCreateNew && allowCreate && filteredOptions.length > 0 && (
                <>
                  <CommandSeparator />
                  <CommandGroup>
                    <CommandItem onSelect={openCreateDialog}>
                      <Plus className="h-4 w-4 mr-2" />
                      Create &quot;{search}&quot;
                    </CommandItem>
                  </CommandGroup>
                </>
              )}
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>

      {/* Create Bundle Dialog */}
      <ResponsiveDialog open={createDialogOpen} onOpenChange={setCreateDialogOpen} variant="modal" size="sm">
        <ResponsiveDialog.Header>
          <ResponsiveDialog.Title>Create New Bundle Category</ResponsiveDialog.Title>
          <ResponsiveDialog.Description>
            Create a new bundle category to group features.
          </ResponsiveDialog.Description>
        </ResponsiveDialog.Header>
        <ResponsiveDialog.Body className="px-4 py-4 sm:px-6">
          <div className="grid gap-4">
            <div className="grid gap-2">
              <Label htmlFor="bundleId">Bundle ID</Label>
              <Input
                id="bundleId"
                value={newBundleId}
                onChange={(e) =>
                  setNewBundleId(
                    e.target.value.toLowerCase().replace(/\s+/g, "-")
                  )
                }
                placeholder="my-bundle"
                className="font-mono"
              />
              <p className="text-xs text-muted-foreground">
                Unique identifier, lowercase with hyphens
              </p>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="bundleName">Display Name</Label>
              <Input
                id="bundleName"
                value={newBundleName}
                onChange={(e) => setNewBundleName(e.target.value)}
                placeholder="My Bundle"
              />
            </div>
          </div>
        </ResponsiveDialog.Body>
        <ResponsiveDialog.Footer className="flex-col-reverse sm:flex-row">
          <Button
            variant="outline"
            onClick={() => setCreateDialogOpen(false)}
          >
            Cancel
          </Button>
          <Button aria-label="Add"
            onClick={handleCreateBundle}
            disabled={!newBundleId || !newBundleName || isCreating}
          >
            {isCreating ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Creating...
              </>
            ) : (
              <>
                <Plus className="h-4 w-4 mr-2" />
                Create
              </>
            )}
          </Button>
        </ResponsiveDialog.Footer>
      </ResponsiveDialog>
    </>
  )
}

/**
 * Compact version of the bundle selector for table cells
 */
export function BundleBadges({
  bundles,
  options,
  maxShow = 3,
  onClick,
}: {
  bundles: SelectedBundle[]
  options: BundleOption[]
  maxShow?: number
  onClick?: () => void
}) {
  const getBundleInfo = (bundleId: string): BundleOption | undefined => {
    return options.find((opt) => opt.bundleId === bundleId)
  }

  if (bundles.length === 0) {
    return (
      <button
        className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors"
        onClick={onClick}
      >
        <Package className="h-3 w-3" />
        <span>No bundles</span>
      </button>
    )
  }

  const visibleBundles = bundles.slice(0, maxShow)
  const hiddenCount = bundles.length - maxShow

  return (
    <button
      className="flex flex-wrap gap-1 items-center"
      onClick={onClick}
    >
      {visibleBundles.map((selected) => {
        const bundle = getBundleInfo(selected.bundleId)
        return (
          <Badge
            key={selected.bundleId}
            variant="outline"
            className={cn("text-xs", ROLE_COLORS[selected.role])}
            style={
              bundle?.primaryColor
                ? { borderColor: bundle.primaryColor + "40" }
                : undefined
            }
          >
            {bundle?.name || selected.bundleId}
          </Badge>
        )
      })}
      {hiddenCount > 0 && (
        <Badge variant="secondary" className="text-xs">
          +{hiddenCount}
        </Badge>
      )}
    </button>
  )
}

export default BundleMultiSelect
