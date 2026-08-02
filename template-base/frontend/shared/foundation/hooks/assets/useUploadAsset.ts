
import { useState, useCallback } from "react"
import { useMutation } from "convex/react"
import { api } from "@/convex/_generated/api"
import type { Id } from "@/convex/_generated/dataModel"

interface UseUploadAssetResult {
    uploadAsset: (file: File, workspaceId: Id<"workspaces">) => Promise<string>
    isUploading: boolean
    error: Error | null
    progress: number
}

/**
 * Hook to upload an asset
 * Used for file storage, chat attachments, etc.
 */
export function useUploadAsset(): UseUploadAssetResult {
    const [isUploading, setIsUploading] = useState(false)
    const [error, setError] = useState<Error | null>(null)
    const [progress, setProgress] = useState(0)

    // Placeholder: backend mutation for getting upload URL
    // const generateUploadUrl = useMutation(api.assets.generateUploadUrl)

    const uploadAsset = useCallback(async (file: File, workspaceId: Id<"workspaces">): Promise<string> => {
        setIsUploading(true)
        setError(null)
        setProgress(0)

        try {
            // 1. Get upload URL
            // const postUrl = await generateUploadUrl({ workspaceId })

            // 2. Upload file
            // const result = await fetch(postUrl, {
            //   method: "POST",
            //   headers: { "Content-Type": file.type },
            //   body: file,
            // })
            // const { storageId } = await result.json()

            // 3. Save metadata (if needed, or handled by backend trigger)

            console.warn("File upload not implemented yet - backend needed")

            // key is mock
            const mockStorageId = `mock_storage_id_${Date.now()}`

            // Simulate progress
            let p = 0
            const interval = setInterval(() => {
                p += 10
                if (p > 100) {
                    clearInterval(interval)
                    setIsUploading(false)
                    setProgress(100)
                } else {
                    setProgress(p)
                }
            }, 100)

            return mockStorageId

        } catch (err) {
            const uploadError = err instanceof Error ? err : new Error("Upload failed")
            setError(uploadError)
            setIsUploading(false)
            throw uploadError
        }
    }, [])

    return { uploadAsset, isUploading, error, progress }
}
