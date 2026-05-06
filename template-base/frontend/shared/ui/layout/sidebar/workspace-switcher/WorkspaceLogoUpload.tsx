/**
 * WorkspaceLogoUpload Component
 * 
 * Upload and manage workspace logo images.
 */

"use client"

import React, { useRef, useState } from "react"
import { useMutation } from "convex/react"
import { api } from "@convex/_generated/api"
import { Id } from "@convex/_generated/dataModel"
import { Button } from "@/components/ui/button"
import { Upload, Trash2, Loader2 } from "lucide-react"
import { WorkspaceIcon } from "./WorkspaceIcon"
import { cn } from "@/lib/utils"

interface WorkspaceLogoUploadProps {
    workspaceId: Id<"workspaces">
    currentLogoUrl?: string | null
    workspaceName?: string
    onUploadComplete?: () => void
    className?: string
}

const MAX_SIZE = 1 * 1024 * 1024 // 1MB
const ALLOWED_TYPES = ["image/png", "image/jpeg", "image/jpg", "image/svg+xml", "image/webp"]

export function WorkspaceLogoUpload({
    workspaceId,
    currentLogoUrl,
    workspaceName = "W",
    onUploadComplete,
    className,
}: WorkspaceLogoUploadProps) {
    const fileInputRef = useRef<HTMLInputElement>(null)
    const [isUploading, setIsUploading] = useState(false)
    const [error, setError] = useState<string | null>(null)

    const generateUploadUrl = useMutation(api.workspace.storage.generateLogoUploadUrl)
    const savelogo = useMutation(api.workspace.storage.saveWorkspaceLogo)
    const deleteLogo = useMutation(api.workspace.storage.deleteWorkspaceLogo)

    const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (!file) return

        setError(null)

        // Validate file type
        if (!ALLOWED_TYPES.includes(file.type)) {
            setError("Invalid file type. Use PNG, JPEG, SVG, or WebP.")
            return
        }

        // Validate file size
        if (file.size > MAX_SIZE) {
            setError("File too large. Max 1MB.")
            return
        }

        setIsUploading(true)

        try {
            // Get upload URL
            const uploadUrl = await generateUploadUrl({ workspaceId })

            // Upload file
            const response = await fetch(uploadUrl, {
                method: "POST",
                headers: { "Content-Type": file.type },
                body: file,
            })

            if (!response.ok) {
                throw new Error("Upload failed")
            }

            const { storageId } = await response.json()

            // Save to workspace
            await savelogo({ workspaceId, storageId })

            onUploadComplete?.()
        } catch (err) {
            setError("Failed to upload logo")
            console.error(err)
        } finally {
            setIsUploading(false)
            if (fileInputRef.current) {
                fileInputRef.current.value = ""
            }
        }
    }

    const handleDelete = async () => {
        setIsUploading(true)
        try {
            await deleteLogo({ workspaceId })
            onUploadComplete?.()
        } catch (err) {
            setError("Failed to delete logo")
            console.error(err)
        } finally {
            setIsUploading(false)
        }
    }

    return (
        <div className={cn("space-y-3", className)}>
            <div className="flex items-center gap-4">
                {/* Current Logo Preview */}
                <WorkspaceIcon
                    workspaceId={workspaceId}
                    logoUrl={currentLogoUrl}
                    name={workspaceName}
                    size="lg"
                    className="border"
                />

                {/* Upload Controls */}
                <div className="flex gap-2">
                    <input
                        ref={fileInputRef}
                        type="file"
                        accept={ALLOWED_TYPES.join(",")}
                        onChange={handleFileSelect}
                        className="hidden"
                    />

                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => fileInputRef.current?.click()}
                        disabled={isUploading}
                    >
                        {isUploading ? (
                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        ) : (
                            <Upload className="h-4 w-4 mr-2" />
                        )}
                        {currentLogoUrl ? "Change" : "Upload"}
                    </Button>

                    {currentLogoUrl && (
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={handleDelete}
                            disabled={isUploading}
                        >
                            <Trash2 className="h-4 w-4" />
                        </Button>
                    )}
                </div>
            </div>

            {error && (
                <p className="text-sm text-destructive">{error}</p>
            )}

            <p className="text-xs text-muted-foreground">
                PNG, JPEG, SVG, or WebP. Max 1MB.
            </p>
        </div>
    )
}

export default WorkspaceLogoUpload
