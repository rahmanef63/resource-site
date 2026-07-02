"use client"

import React, { useState, useCallback } from "react"
import {
    Folder,
    FolderPlus,
    MoreHorizontal,
    Pencil,
    Trash2,
    ChevronRight,
    ChevronDown,
    Check,
    X,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
    Collapsible,
    CollapsibleContent,
    CollapsibleTrigger,
} from "@/components/ui/collapsible"
import { ResponsiveDialog } from "@/frontend/shared/ui"

interface FolderManagerProps {
    folders: string[]
    selectedFolder: string | null
    onSelectFolder: (folder: string | null) => void
    onCreateFolder?: (name: string) => Promise<void>
    onRenameFolder?: (oldName: string, newName: string) => Promise<void>
    onDeleteFolder?: (name: string) => Promise<void>
}

export function FolderManager({
    folders,
    selectedFolder,
    onSelectFolder,
    onCreateFolder,
    onRenameFolder,
    onDeleteFolder,
}: FolderManagerProps) {
    const [isExpanded, setIsExpanded] = useState(true)
    const [isCreating, setIsCreating] = useState(false)
    const [newFolderName, setNewFolderName] = useState("")
    const [editingFolder, setEditingFolder] = useState<string | null>(null)
    const [editingName, setEditingName] = useState("")
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
    const [folderToDelete, setFolderToDelete] = useState<string | null>(null)
    const [isLoading, setIsLoading] = useState(false)

    const handleCreateFolder = async () => {
        if (!newFolderName.trim() || !onCreateFolder) return
        setIsLoading(true)
        try {
            await onCreateFolder(newFolderName.trim())
            setNewFolderName("")
            setIsCreating(false)
        } catch (error) {
            console.error("Failed to create folder:", error)
        } finally {
            setIsLoading(false)
        }
    }

    const handleRenameFolder = async () => {
        if (!editingFolder || !editingName.trim() || !onRenameFolder) return
        if (editingFolder === editingName.trim()) {
            setEditingFolder(null)
            return
        }
        setIsLoading(true)
        try {
            await onRenameFolder(editingFolder, editingName.trim())
            setEditingFolder(null)
        } catch (error) {
            console.error("Failed to rename folder:", error)
        } finally {
            setIsLoading(false)
        }
    }

    const handleDeleteFolder = async () => {
        if (!folderToDelete || !onDeleteFolder) return
        setIsLoading(true)
        try {
            await onDeleteFolder(folderToDelete)
            if (selectedFolder === folderToDelete) {
                onSelectFolder(null)
            }
            setDeleteDialogOpen(false)
            setFolderToDelete(null)
        } catch (error) {
            console.error("Failed to delete folder:", error)
        } finally {
            setIsLoading(false)
        }
    }

    const startRenaming = (folder: string) => {
        setEditingFolder(folder)
        setEditingName(folder)
    }

    const cancelRenaming = () => {
        setEditingFolder(null)
        setEditingName("")
    }

    const confirmDelete = (folder: string) => {
        setFolderToDelete(folder)
        setDeleteDialogOpen(true)
    }

    return (
        <>
            <Collapsible open={isExpanded} onOpenChange={setIsExpanded}>
                <div className="flex items-center justify-between px-2 py-1">
                    <CollapsibleTrigger asChild>
                        <Button variant="ghost" size="sm" className="h-6 px-1 gap-1 text-xs font-semibold text-muted-foreground hover:text-foreground">
                            {isExpanded ? (
                                <ChevronDown className="h-3 w-3" />
                            ) : (
                                <ChevronRight className="h-3 w-3" />
                            )}
                            <Folder className="h-3 w-3" />
                            Folders
                            <span className="ml-1 text-muted-foreground">({folders.length})</span>
                        </Button>
                    </CollapsibleTrigger>
                    {onCreateFolder && (
                        <Button
                            variant="ghost"
                            size="sm"
                            className="h-6 w-6 p-0"
                            onClick={() => setIsCreating(true)}
                            title="New Folder"
                        >
                            <FolderPlus className="h-3 w-3" />
                        </Button>
                    )}
                </div>

                <CollapsibleContent>
                    <div className="space-y-0.5 px-2">
                        {/* All items option */}
                        <Button
                            variant={selectedFolder === null ? "secondary" : "ghost"}
                            size="sm"
                            className="w-full justify-start h-7 px-2 text-xs"
                            onClick={() => onSelectFolder(null)}
                        >
                            All Folders
                        </Button>

                        {/* New folder input */}
                        {isCreating && (
                            <div className="flex items-center gap-1 px-1">
                                <Input
                                    value={newFolderName}
                                    onChange={(e) => setNewFolderName(e.target.value)}
                                    placeholder="Folder name"
                                    className="h-6 text-xs flex-1"
                                    autoFocus
                                    onKeyDown={(e) => {
                                        if (e.key === "Enter") handleCreateFolder()
                                        if (e.key === "Escape") {
                                            setIsCreating(false)
                                            setNewFolderName("")
                                        }
                                    }}
                                />
                                <Button aria-label="Confirm"
                                    size="sm"
                                    className="h-6 w-6 p-0"
                                    onClick={handleCreateFolder}
                                    disabled={isLoading || !newFolderName.trim()}
                                >
                                    <Check className="h-3 w-3" />
                                </Button>
                                <Button aria-label="Close"
                                    variant="ghost"
                                    size="sm"
                                    className="h-6 w-6 p-0"
                                    onClick={() => {
                                        setIsCreating(false)
                                        setNewFolderName("")
                                    }}
                                >
                                    <X className="h-3 w-3" />
                                </Button>
                            </div>
                        )}

                        {/* Folder list */}
                        {folders.map((folder) => (
                            <div
                                key={folder}
                                className={cn(
                                    "group flex items-center gap-1 rounded-md px-1",
                                    selectedFolder === folder && "bg-accent"
                                )}
                            >
                                {editingFolder === folder ? (
                                    <div className="flex items-center gap-1 flex-1 py-0.5">
                                        <Input
                                            value={editingName}
                                            onChange={(e) => setEditingName(e.target.value)}
                                            className="h-6 text-xs flex-1"
                                            autoFocus
                                            onKeyDown={(e) => {
                                                if (e.key === "Enter") handleRenameFolder()
                                                if (e.key === "Escape") cancelRenaming()
                                            }}
                                        />
                                        <Button aria-label="Confirm"
                                            size="sm"
                                            className="h-6 w-6 p-0"
                                            onClick={handleRenameFolder}
                                            disabled={isLoading}
                                        >
                                            <Check className="h-3 w-3" />
                                        </Button>
                                        <Button aria-label="Close"
                                            variant="ghost"
                                            size="sm"
                                            className="h-6 w-6 p-0"
                                            onClick={cancelRenaming}
                                        >
                                            <X className="h-3 w-3" />
                                        </Button>
                                    </div>
                                ) : (
                                    <>
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            className={cn(
                                                "flex-1 justify-start h-7 px-2 text-xs",
                                                selectedFolder === folder && "bg-transparent hover:bg-transparent"
                                            )}
                                            onClick={() => onSelectFolder(folder)}
                                        >
                                            <Folder className="h-3 w-3 mr-1.5" />
                                            {folder}
                                        </Button>
                                        {(onRenameFolder || onDeleteFolder) && (
                                            <DropdownMenu>
                                                <DropdownMenuTrigger asChild>
                                                    <Button aria-label="More options"
                                                        variant="ghost"
                                                        size="sm"
                                                        className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100"
                                                    >
                                                        <MoreHorizontal className="h-3 w-3" />
                                                    </Button>
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent align="end" className="w-32">
                                                    {onRenameFolder && (
                                                        <DropdownMenuItem onClick={() => startRenaming(folder)}>
                                                            <Pencil className="h-3 w-3 mr-2" />
                                                            Rename
                                                        </DropdownMenuItem>
                                                    )}
                                                    {onDeleteFolder && (
                                                        <DropdownMenuItem
                                                            className="text-destructive"
                                                            onClick={() => confirmDelete(folder)}
                                                        >
                                                            <Trash2 className="h-3 w-3 mr-2" />
                                                            Delete
                                                        </DropdownMenuItem>
                                                    )}
                                                </DropdownMenuContent>
                                            </DropdownMenu>
                                        )}
                                    </>
                                )}
                            </div>
                        ))}

                        {folders.length === 0 && !isCreating && (
                            <p className="text-xs text-muted-foreground text-center py-2">
                                No folders yet
                            </p>
                        )}
                    </div>
                </CollapsibleContent>
            </Collapsible>

            {/* Delete confirmation dialog */}
            <ResponsiveDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen} variant="alert" size="md">
                <ResponsiveDialog.Header>
                    <ResponsiveDialog.Title>Delete Folder</ResponsiveDialog.Title>
                    <ResponsiveDialog.Description>
                        Are you sure you want to delete the folder &quot;{folderToDelete}&quot;?
                        Content in this folder will not be deleted, but will no longer be organized.
                    </ResponsiveDialog.Description>
                </ResponsiveDialog.Header>
                <ResponsiveDialog.Footer className="flex-col-reverse sm:flex-row">
                    <Button
                        variant="outline"
                        onClick={() => setDeleteDialogOpen(false)}
                        disabled={isLoading}
                    >
                        Cancel
                    </Button>
                    <Button
                        variant="destructive"
                        onClick={handleDeleteFolder}
                        disabled={isLoading}
                    >
                        Delete
                    </Button>
                </ResponsiveDialog.Footer>
            </ResponsiveDialog>
        </>
    )
}
