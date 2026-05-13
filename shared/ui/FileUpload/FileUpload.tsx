"use client"

import * as React from "react"
import { useCallback, useState } from "react"
import { useDropzone, type Accept } from "react-dropzone"
import { File as FileIcon, FileText, Image as ImageIcon, Upload, Video, X } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { cn } from "@/lib/utils"

export type FileUploadStatus = "idle" | "uploading" | "success" | "error"

export interface FileUploadItem {
  id: string
  file: File
  progress: number
  status: FileUploadStatus
  error?: string
  result?: unknown
}

export interface FileUploadProps {
  /** Async callback invoked per accepted file. Resolve with anything serializable
   * (e.g. uploaded URL, storage id). Reject to surface error. */
  onUpload: (file: File, onProgress: (pct: number) => void) => Promise<unknown>
  accept?: Accept
  maxFiles?: number
  maxSize?: number
  multiple?: boolean
  className?: string
  /** Override the default drop zone copy. */
  prompt?: React.ReactNode
}

function iconFor(mime: string) {
  if (mime.startsWith("image/")) return ImageIcon
  if (mime.startsWith("video/")) return Video
  if (mime.startsWith("text/") || mime === "application/pdf") return FileText
  return FileIcon
}

function uid() {
  return `${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`
}

/**
 * Backend-agnostic file upload zone. Consumer supplies `onUpload` — wire your
 * Convex storage / S3 / R2 / whatever inside the callback. UI handles dropzone,
 * progress bar, per-file status, dismiss.
 */
export function FileUpload({
  onUpload,
  accept,
  maxFiles = 10,
  maxSize,
  multiple = true,
  className,
  prompt,
}: FileUploadProps) {
  const [items, setItems] = useState<FileUploadItem[]>([])

  const update = useCallback(
    (id: string, patch: Partial<FileUploadItem>) => {
      setItems((prev) => prev.map((it) => (it.id === id ? { ...it, ...patch } : it)))
    },
    [],
  )

  const onDrop = useCallback(
    async (accepted: File[]) => {
      const next: FileUploadItem[] = accepted.map((f) => ({
        id: uid(),
        file: f,
        progress: 0,
        status: "idle",
      }))
      setItems((prev) => [...prev, ...next])

      await Promise.all(
        next.map(async (item) => {
          update(item.id, { status: "uploading" })
          try {
            const result = await onUpload(item.file, (pct) =>
              update(item.id, { progress: pct }),
            )
            update(item.id, { status: "success", progress: 100, result })
          } catch (err) {
            update(item.id, {
              status: "error",
              error: err instanceof Error ? err.message : String(err),
            })
          }
        }),
      )
    },
    [onUpload, update],
  )

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept,
    maxFiles,
    maxSize,
    multiple,
  })

  return (
    <div className={cn("flex flex-col gap-3", className)}>
      <Card
        {...getRootProps()}
        className={cn(
          "flex cursor-pointer flex-col items-center justify-center gap-2 border-2 border-dashed p-8 transition-colors",
          isDragActive ? "border-primary bg-primary/5" : "border-muted-foreground/25",
        )}
      >
        <input {...getInputProps()} />
        <Upload className="size-8 text-muted-foreground" aria-hidden />
        <div className="text-sm text-muted-foreground">
          {prompt ?? (
            <>
              <strong>Drop files here</strong> or click to browse
            </>
          )}
        </div>
      </Card>

      {items.length > 0 && (
        <ul className="flex flex-col gap-2">
          {items.map((item) => {
            const Icon = iconFor(item.file.type)
            return (
              <li
                key={item.id}
                className="flex items-center gap-3 rounded-md border bg-card px-3 py-2"
              >
                <Icon className="size-5 shrink-0 text-muted-foreground" aria-hidden />
                <div className="min-w-0 flex-1">
                  <div className="truncate text-sm font-medium">{item.file.name}</div>
                  {item.status === "uploading" && (
                    <Progress value={item.progress} className="mt-1 h-1" />
                  )}
                  {item.status === "error" && (
                    <div className="mt-1 text-xs text-destructive">{item.error}</div>
                  )}
                  {item.status === "success" && (
                    <div className="mt-1 text-xs text-muted-foreground">Uploaded</div>
                  )}
                </div>
                <Button
                  type="button"
                  size="icon"
                  variant="ghost"
                  onClick={() => setItems((prev) => prev.filter((p) => p.id !== item.id))}
                  aria-label={`Remove ${item.file.name}`}
                >
                  <X className="size-4" />
                </Button>
              </li>
            )
          })}
        </ul>
      )}
    </div>
  )
}
