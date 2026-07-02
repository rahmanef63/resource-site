"use client"

import { useMemo, useState } from "react"
import Image from "next/image"
import {
  Image as ImageIcon,
  Upload,
  Trash2,
  Grid,
  List,
  Download,
  ExternalLink,
  Copy,
} from "lucide-react"
import { useMutation, useQuery } from "convex/react"
import type { Id } from "@/convex/_generated/dataModel"
import { api } from "@/frontend/shared/foundation/utils/convex/any-api"

import { Button } from "@/components/ui/button"
import { useToast } from "@/hooks/use-toast"
import { useWorkspaceContext } from "@/frontend/shared/foundation"
import { FileUpload } from "@/components/FileUpload"
import { ResponsiveDialog } from "@/frontend/shared/ui/components/ResponsiveDialog"

import { SearchBar } from "../components/SearchBar"
import ErrorBoundary from "../../../shared/components/ErrorBoundary"

interface MediaItem {
  fileId: Id<"fileAttachments">
  storageId: Id<"_storage">
  url: string | null
  fileName: string
  fileType: string
  fileSize: number
  createdAt: number
}

function formatFileSize(bytes?: number): string {
  if (!bytes) return "Unknown"
  const kb = bytes / 1024
  if (kb < 1024) return `${kb.toFixed(1)} KB`
  const mb = kb / 1024
  return `${mb.toFixed(1)} MB`
}

function isImageType(type: string): boolean {
  return type.startsWith("image/")
}

export default function AdminMediaLibrary() {
  const { toast } = useToast()
  const { workspaceId } = useWorkspaceContext()

  const rows = useQuery(
    api.files.listWorkspaceFiles,
    workspaceId ? { workspaceId, limit: 200 } : "skip",
  ) as
    | Array<{
        _id: Id<"fileAttachments">
        storageId: Id<"_storage">
        url: string | null
        fileName: string
        fileType: string
        fileSize: number
        createdAt: number
      }>
    | undefined

  const deleteFile = useMutation(api.files.deleteFile)

  const [searchQuery, setSearchQuery] = useState("")
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid")
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())
  const [uploadOpen, setUploadOpen] = useState(false)
  const [detailItem, setDetailItem] = useState<MediaItem | null>(null)

  const items: MediaItem[] = useMemo(
    () =>
      (rows ?? []).map((r) => ({
        fileId: r._id,
        storageId: r.storageId,
        url: r.url,
        fileName: r.fileName,
        fileType: r.fileType,
        fileSize: r.fileSize,
        createdAt: r.createdAt,
      })),
    [rows],
  )

  const filteredItems = useMemo(() => {
    if (!searchQuery.trim()) return items
    const q = searchQuery.toLowerCase()
    return items.filter((item) => item.fileName.toLowerCase().includes(q))
  }, [items, searchQuery])

  const isLoading = rows === undefined

  const toggleSelection = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  const selectAll = () => setSelectedIds(new Set(filteredItems.map((i) => i.storageId)))
  const clearSelection = () => setSelectedIds(new Set())

  const handleDelete = async (storageId: string) => {
    if (!confirm("Yakin hapus file ini?")) return
    try {
      await deleteFile({ storageId: storageId as Id<"_storage"> })
      toast({ title: "File terhapus" })
    } catch (e) {
      toast({
        title: "Gagal menghapus file",
        description: e instanceof Error ? e.message : undefined,
        variant: "destructive",
      })
    }
  }

  const handleBulkDelete = async () => {
    if (selectedIds.size === 0) return
    if (!confirm(`Hapus ${selectedIds.size} file?`)) return
    const ids = Array.from(selectedIds)
    let ok = 0
    let fail = 0
    await Promise.all(
      ids.map(async (id) => {
        try {
          await deleteFile({ storageId: id as Id<"_storage"> })
          ok++
        } catch {
          fail++
        }
      }),
    )
    setSelectedIds(new Set())
    toast({
      title: `${ok} terhapus${fail > 0 ? `, ${fail} gagal` : ""}`,
      variant: fail > 0 ? "destructive" : "default",
    })
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    toast({ title: "URL disalin" })
  }

  if (!workspaceId) {
    return (
      <ErrorBoundary>
        <div className="rounded-lg border p-6 text-sm text-muted-foreground">
          Tidak ada workspace aktif.
        </div>
      </ErrorBoundary>
    )
  }

  return (
    <ErrorBoundary>
      <div>
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Media Library</h1>
            {selectedIds.size > 0 && (
              <p className="mt-1 text-sm text-muted-foreground">
                {selectedIds.size} file dipilih
              </p>
            )}
          </div>

          <div className="flex gap-2">
            {selectedIds.size > 0 ? (
              <>
                <Button variant="ghost" size="sm" onClick={handleBulkDelete}>
                  <Trash2 className="mr-1.5 h-4 w-4 text-red-600" />
                  Hapus Terpilih
                </Button>
                <Button variant="secondary" size="sm" onClick={clearSelection}>
                  Batalkan Pilihan
                </Button>
              </>
            ) : (
              <Button onClick={() => setUploadOpen(true)}>
                <Upload className="mr-1.5 h-4 w-4" />
                Unggah File
              </Button>
            )}
          </div>
        </div>

        <div className="mb-6 flex gap-4">
          <div className="flex-1">
            <SearchBar onSearch={setSearchQuery} placeholder="Cari file..." />
          </div>

          <div className="flex gap-2 rounded-lg border p-1">
            <Button aria-label="Grid view"
              variant={viewMode === "grid" ? "default" : "ghost"}
              size="icon"
              onClick={() => setViewMode("grid")}
            >
              <Grid className="h-4 w-4" />
            </Button>
            <Button aria-label="List view"
              variant={viewMode === "list" ? "default" : "ghost"}
              size="icon"
              onClick={() => setViewMode("list")}
            >
              <List className="h-4 w-4" />
            </Button>
          </div>

          {filteredItems.length > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={selectedIds.size > 0 ? clearSelection : selectAll}
            >
              {selectedIds.size > 0 ? "Batalkan Semua" : "Pilih Semua"}
            </Button>
          )}
        </div>

        {isLoading ? (
          <div className="rounded-lg border p-12 text-center text-sm text-muted-foreground">
            Memuat…
          </div>
        ) : filteredItems.length === 0 ? (
          <div className="rounded-lg border-2 border-dashed p-12 text-center">
            <ImageIcon className="mx-auto mb-4 h-16 w-16 text-muted-foreground/30" />
            <h3 className="mb-2 text-lg font-medium">Belum ada file</h3>
            <p className="mb-4 text-sm text-muted-foreground">
              Unggah file pertama untuk memulai.
            </p>
            <Button onClick={() => setUploadOpen(true)}>
              <Upload className="mr-1.5 h-4 w-4" />
              Unggah File
            </Button>
          </div>
        ) : viewMode === "grid" ? (
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
            {filteredItems.map((item) => {
              const isImg = isImageType(item.fileType)
              const isSelected = selectedIds.has(item.storageId)
              return (
                <div
                  key={item.storageId}
                  className={`group relative aspect-square cursor-pointer overflow-hidden rounded-lg border transition-all ${
                    isSelected ? "ring-2 ring-primary" : ""
                  }`}
                  onClick={() => setDetailItem(item)}
                >
                  {isImg && item.url ? (
                    <Image
                      src={item.url}
                      alt={item.fileName}
                      fill
                      className="object-cover"
                      sizes="(max-width: 768px) 50vw, 20vw"
                      unoptimized
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center bg-muted text-muted-foreground">
                      <ImageIcon className="h-10 w-10" />
                    </div>
                  )}

                  <div className="absolute left-2 top-2">
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={(e) => {
                        e.stopPropagation()
                        toggleSelection(item.storageId)
                      }}
                      onClick={(e) => e.stopPropagation()}
                      className="h-5 w-5 cursor-pointer"
                    />
                  </div>

                  <div className="absolute inset-0 flex items-center justify-center gap-2 bg-black/60 opacity-0 transition-opacity group-hover:opacity-100">
                    {item.url && (
                      <Button aria-label="Copy"
                        variant="ghost"
                        size="icon"
                        onClick={(e) => {
                          e.stopPropagation()
                          copyToClipboard(item.url!)
                        }}
                        className="bg-white/20 backdrop-blur-sm hover:bg-white/30"
                      >
                        <Copy className="h-4 w-4 text-white" />
                      </Button>
                    )}
                    <Button aria-label="Delete"
                      variant="destructive"
                      size="icon"
                      onClick={(e) => {
                        e.stopPropagation()
                        void handleDelete(item.storageId)
                      }}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>

                  <div className="absolute bottom-0 left-0 right-0 truncate bg-black/60 p-2 text-xs text-white opacity-0 transition-opacity group-hover:opacity-100">
                    {item.fileName}
                  </div>
                </div>
              )
            })}
          </div>
        ) : (
          <div className="overflow-hidden rounded-lg border">
            <table className="w-full">
              <thead className="bg-muted">
                <tr>
                  <th className="w-12 p-4"></th>
                  <th className="p-4 text-left">Pratinjau</th>
                  <th className="p-4 text-left">Nama</th>
                  <th className="p-4 text-left">Tipe</th>
                  <th className="p-4 text-left">Ukuran</th>
                  <th className="p-4 text-left">Diunggah</th>
                  <th className="p-4 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody>
                {filteredItems.map((item) => {
                  const isImg = isImageType(item.fileType)
                  return (
                    <tr key={item.storageId} className="border-t hover:bg-muted/50">
                      <td className="p-4">
                        <input
                          type="checkbox"
                          checked={selectedIds.has(item.storageId)}
                          onChange={() => toggleSelection(item.storageId)}
                          className="h-5 w-5 cursor-pointer"
                        />
                      </td>
                      <td className="p-4">
                        {isImg && item.url ? (
                          <Image
                            src={item.url}
                            alt={item.fileName}
                            width={48}
                            height={48}
                            className="h-12 w-12 rounded object-cover"
                            sizes="48px"
                            unoptimized
                          />
                        ) : (
                          <div className="flex h-12 w-12 items-center justify-center rounded bg-muted">
                            <ImageIcon className="h-5 w-5 text-muted-foreground" />
                          </div>
                        )}
                      </td>
                      <td className="p-4">
                        <p className="font-medium">{item.fileName}</p>
                      </td>
                      <td className="p-4">
                        <span className="rounded bg-muted px-2 py-1 text-xs">
                          {item.fileType}
                        </span>
                      </td>
                      <td className="p-4 text-sm text-muted-foreground">
                        {formatFileSize(item.fileSize)}
                      </td>
                      <td className="p-4 text-sm text-muted-foreground">
                        {new Date(item.createdAt).toLocaleDateString()}
                      </td>
                      <td className="p-4">
                        <div className="flex items-center justify-end gap-2">
                          {item.url && (
                            <Button aria-label="Copy"
                              variant="ghost"
                              size="icon"
                              onClick={() => copyToClipboard(item.url!)}
                            >
                              <Copy className="h-4 w-4" />
                            </Button>
                          )}
                          <Button aria-label="Open in new tab"
                            variant="ghost"
                            size="icon"
                            onClick={() => setDetailItem(item)}
                          >
                            <ExternalLink className="h-4 w-4" />
                          </Button>
                          <Button aria-label="Delete"
                            variant="ghost"
                            size="icon"
                            onClick={() => void handleDelete(item.storageId)}
                            className="text-red-500 hover:bg-red-500/10 hover:text-red-500"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}

        <ResponsiveDialog
          open={uploadOpen}
          onOpenChange={setUploadOpen}
          variant="modal"
          size="md"
        >
          <ResponsiveDialog.Header>
            <ResponsiveDialog.Title>Unggah file</ResponsiveDialog.Title>
            <ResponsiveDialog.Description>
              Gambar (JPG / PNG / WebP) akan dikonversi ke WebP otomatis. PDF disimpan apa adanya.
            </ResponsiveDialog.Description>
          </ResponsiveDialog.Header>
          <ResponsiveDialog.Body>
            <FileUpload
              workspaceId={workspaceId}
              onUploaded={() => {
                toast({ title: "File terunggah" })
                setUploadOpen(false)
              }}
            />
          </ResponsiveDialog.Body>
        </ResponsiveDialog>

        {detailItem && (
          <ResponsiveDialog
            open={true}
            onOpenChange={(v) => {
              if (!v) setDetailItem(null)
            }}
            variant="modal"
            size="lg"
          >
            <ResponsiveDialog.Header>
              <ResponsiveDialog.Title>Detail file</ResponsiveDialog.Title>
              <ResponsiveDialog.Description className="sr-only">
                Metadata dan aksi untuk {detailItem.fileName}
              </ResponsiveDialog.Description>
            </ResponsiveDialog.Header>
            <ResponsiveDialog.Body>
              <div className="space-y-4">
                {isImageType(detailItem.fileType) && detailItem.url ? (
                  <div className="overflow-hidden rounded-lg border">
                    <Image
                      src={detailItem.url}
                      alt={detailItem.fileName}
                      width={1200}
                      height={800}
                      className="h-auto w-full"
                      sizes="(max-width: 768px) 100vw, 672px"
                      unoptimized
                    />
                  </div>
                ) : (
                  <div className="flex h-48 items-center justify-center rounded-lg border bg-muted">
                    <ImageIcon className="h-16 w-16 text-muted-foreground/30" />
                  </div>
                )}

                <div className="space-y-3 text-sm">
                  <div>
                    <label className="text-xs text-muted-foreground">Nama</label>
                    <p className="font-medium">{detailItem.fileName}</p>
                  </div>
                  <div>
                    <label className="text-xs text-muted-foreground">URL</label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={detailItem.url ?? ""}
                        readOnly
                        className="flex-1 rounded-lg border bg-muted px-3 py-2 text-sm"
                      />
                      {detailItem.url && (
                        <Button aria-label="Copy"
                          size="sm"
                          onClick={() => copyToClipboard(detailItem.url!)}
                        >
                          <Copy className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </div>
                  <div className="grid grid-cols-3 gap-3">
                    <div>
                      <label className="text-xs text-muted-foreground">Tipe</label>
                      <p className="font-medium">{detailItem.fileType}</p>
                    </div>
                    <div>
                      <label className="text-xs text-muted-foreground">Ukuran</label>
                      <p className="font-medium">{formatFileSize(detailItem.fileSize)}</p>
                    </div>
                    <div>
                      <label className="text-xs text-muted-foreground">Diunggah</label>
                      <p className="font-medium">
                        {new Date(detailItem.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </ResponsiveDialog.Body>
            <ResponsiveDialog.Footer className="flex-col-reverse sm:flex-row">
              {detailItem.url && (
                <Button
                  variant="secondary"
                  onClick={() => {
                    const link = document.createElement("a")
                    link.href = detailItem.url!
                    link.download = detailItem.fileName
                    link.click()
                  }}
                >
                  <Download className="mr-1.5 h-4 w-4" />
                  Unduh
                </Button>
              )}
              <Button
                variant="destructive"
                onClick={async () => {
                  const storageId = detailItem.storageId
                  setDetailItem(null)
                  await handleDelete(storageId)
                }}
              >
                <Trash2 className="mr-1.5 h-4 w-4" />
                Hapus
              </Button>
            </ResponsiveDialog.Footer>
          </ResponsiveDialog>
        )}
      </div>
    </ErrorBoundary>
  )
}
