/**
 * File Block
 * 
 * Display files and handle uploads.
 */

"use client"

import * as React from "react"
import { FileText, Upload, MoreVertical, Download, Trash2, File as FileIcon, ImageIcon } from "lucide-react"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { BlockCard } from "../shared"
import { cn } from "@/lib/utils"

// ============================================================================
// Types
// ============================================================================

export interface FileItem {
    id: string
    name: string
    size: string
    type: string
    url: string
    uploadedAt: Date | number
    uploader?: string
}

export interface FileBlockProps {
    files: FileItem[]
    title?: string
    description?: string
    allowUpload?: boolean
    onUpload?: (files: File[]) => void
    onDelete?: (fileId: string) => void
    onDownload?: (fileId: string) => void
    className?: string
}

// ============================================================================
// File Block
// ============================================================================

export function FileBlock({
    files,
    title = "Files",
    description,
    allowUpload = true,
    onUpload,
    onDelete,
    onDownload,
    className,
}: FileBlockProps) {
    const inputRef = React.useRef<HTMLInputElement>(null)

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files.length > 0) {
            onUpload?.(Array.from(e.target.files))
        }
    }

    const getIcon = (type: string) => {
        if (type.includes("image")) return ImageIcon
        return FileIcon
    }

    return (
        <BlockCard
            header={{
                title,
                description,
                icon: FileText,
            }}
            className={className}
        >
            <div className="space-y-4">
                {/* Upload Zone */}
                {allowUpload && (
                    <div
                        className="border-2 border-dashed rounded-lg p-6 flex flex-col items-center justify-center text-center cursor-pointer hover:bg-muted/50 transition-colors"
                        onClick={() => inputRef.current?.click()}
                    >
                        <input
                            type="file"
                            ref={inputRef}
                            className="hidden"
                            multiple
                            onChange={handleFileChange}
                        />
                        <div className="h-10 w-10 bg-muted rounded-full flex items-center justify-center mb-2">
                            <Upload className="h-5 w-5 text-muted-foreground" />
                        </div>
                        <p className="text-sm font-medium">Click to upload files</p>
                        <p className="text-xs text-muted-foreground mt-1">or drag and drop</p>
                    </div>
                )}

                {/* File List */}
                <ScrollArea className="max-h-[300px]">
                    <div className="space-y-2">
                        {files.length === 0 ? (
                            <p className="text-center text-sm text-muted-foreground py-4">No files yet.</p>
                        ) : (
                            files.map((file) => {
                                const Icon = getIcon(file.type)
                                return (
                                    <div key={file.id} className="flex items-center gap-3 p-3 bg-card border rounded-lg group">
                                        <div className="h-10 w-10 bg-muted rounded-md flex items-center justify-center shrink-0">
                                            <Icon className="h-5 w-5 text-muted-foreground" />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-sm font-medium truncate">{file.name}</p>
                                            <p className="text-xs text-muted-foreground">
                                                {file.size} • {new Date(file.uploadedAt).toLocaleDateString()}
                                            </p>
                                        </div>
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <Button variant="ghost" size="icon" className="h-8 w-8 opacity-0 group-hover:opacity-100">
                                                    <MoreVertical className="h-4 w-4" />
                                                </Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent align="end">
                                                <DropdownMenuItem onClick={() => onDownload?.(file.id)}>
                                                    <Download className="mr-2 h-4 w-4" /> Download
                                                </DropdownMenuItem>
                                                <DropdownMenuItem className="text-destructive" onClick={() => onDelete?.(file.id)}>
                                                    <Trash2 className="mr-2 h-4 w-4" /> Delete
                                                </DropdownMenuItem>
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    </div>
                                )
                            })
                        )}
                    </div>
                </ScrollArea>
            </div>
        </BlockCard>
    )
}
