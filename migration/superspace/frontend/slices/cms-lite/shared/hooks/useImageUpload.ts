"use client"

import { useCallback, useState } from "react"
import { useFileUpload } from "@/hooks/useFileUpload"
import { useWorkspaceContext } from "@/frontend/shared/foundation"
import type { CompressionOptions, ImageMetadata } from "../utils/imageCompression"

/**
 * Legacy cms-lite image-upload adapter over the canonical useFileUpload hook.
 *
 * Preserves the original `upload(file) => Promise<string>` surface used by
 * BulkImageUpload / ImageEditor / ImageUrlInput so those components don't
 * need structural rewrites. Under the hood the real pipeline now runs:
 *
 *   validate → convert to WebP → POST → saveFile (with RBAC + audit) → URL
 *
 * `CompressionOptions` are accepted for API compatibility but ignored —
 * the canonical pipeline produces WebP@0.9 preserving dimensions.
 * `ImageMetadata` is synthesised from the UploadedFile result for callers
 * that read it (dimensions are not re-measured here to keep scope thin;
 * consumers that need them should measure via a separate Image() decode).
 */

interface UploadProgress {
  loaded: number
  total: number
  percentage: number
}

interface UploadOptions extends CompressionOptions {
  maxRetries?: number
  retryDelay?: number
}

interface UseImageUploadReturn {
  upload: (file: File, options?: UploadOptions) => Promise<string>
  isUploading: boolean
  progress: UploadProgress | null
  error: string | null
  metadata: ImageMetadata | null
  retryCount: number
}

export function useImageUpload(): UseImageUploadReturn {
  const { workspaceId } = useWorkspaceContext()
  const {
    upload: fileUpload,
    isUploading,
    progress: rawProgress,
    error,
  } = useFileUpload(workspaceId)

  const [metadata, setMetadata] = useState<ImageMetadata | null>(null)

  const upload = useCallback(
    async (file: File): Promise<string> => {
      const result = await fileUpload(file)
      if (!result) {
        throw new Error(error ?? "Upload gagal")
      }
      if (!result.url) {
        throw new Error("Storage URL belum tersedia.")
      }
      setMetadata({
        originalSize: result.originalSize,
        size: result.fileSize,
        compressionRatio:
          result.originalSize > 0
            ? (result.originalSize - result.fileSize) / result.originalSize
            : 0,
        // Dimensions aren't tracked by the canonical pipeline — callers
        // that need them can decode separately via an Image() probe.
        width: 0,
        height: 0,
        type: result.fileType,
      })
      return result.url
    },
    [error, fileUpload],
  )

  const progress: UploadProgress | null =
    isUploading && rawProgress > 0
      ? {
          loaded: rawProgress,
          total: 100,
          percentage: rawProgress,
        }
      : null

  return {
    upload,
    isUploading,
    progress,
    error,
    metadata,
    // The canonical hook delegates network retry to Convex's client;
    // legacy callers that rendered "attempt X of Y" see 0 here.
    retryCount: 0,
  }
}
