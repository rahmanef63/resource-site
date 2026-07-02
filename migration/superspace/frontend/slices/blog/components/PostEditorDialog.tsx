"use client"

import { useState } from "react"
import { Loader2 } from "lucide-react"
import { toast } from "sonner"

import type { Id } from "@/convex/_generated/dataModel"
import { ResponsiveDialog } from "@/frontend/shared/ui"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { useBlogPostMutations } from "../hooks"
import type { BlogPostStatus } from "./StatusBadge"

interface PostEditorDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  workspaceId: Id<"workspaces">
  defaultLocale?: string
}

export function PostEditorDialog({
  open,
  onOpenChange,
  workspaceId,
  defaultLocale = "id",
}: PostEditorDialogProps) {
  const { createPost } = useBlogPostMutations()
  const [title, setTitle] = useState("")
  const [excerpt, setExcerpt] = useState("")
  const [body, setBody] = useState("")
  const [category, setCategory] = useState("")
  const [tagsInput, setTagsInput] = useState("")
  const [status, setStatus] = useState<BlogPostStatus>("draft")
  const [isSubmitting, setIsSubmitting] = useState(false)

  const reset = () => {
    setTitle("")
    setExcerpt("")
    setBody("")
    setCategory("")
    setTagsInput("")
    setStatus("draft")
  }

  const handleSubmit = async (publish = false) => {
    if (!title.trim()) {
      toast.error("Judul wajib diisi")
      return
    }
    if (!body.trim()) {
      toast.error("Isi artikel wajib diisi")
      return
    }
    setIsSubmitting(true)
    try {
      const finalStatus: BlogPostStatus = publish ? "published" : status
      const tags = tagsInput
        .split(",")
        .map((t) => t.trim())
        .filter(Boolean)
      await createPost({
        workspaceId,
        title: title.trim(),
        body: body.trim(),
        excerpt: excerpt.trim() || undefined,
        locale: defaultLocale,
        status: finalStatus,
        category: category.trim() || undefined,
        tags,
      })
      toast.success(publish ? "Artikel diterbitkan" : "Draft tersimpan")
      reset()
      onOpenChange(false)
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Gagal menyimpan artikel"
      toast.error(msg)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <ResponsiveDialog
      open={open}
      onOpenChange={onOpenChange}
      variant="panel"
      sheetSide="right"
      contentClassName="sm:max-w-[640px]"
    >
      <ResponsiveDialog.Header>
        <ResponsiveDialog.Title>Tulis artikel</ResponsiveDialog.Title>
        <ResponsiveDialog.Description>
          Simpan sebagai draft atau langsung terbitkan ke workspace.
        </ResponsiveDialog.Description>
      </ResponsiveDialog.Header>

      <ResponsiveDialog.Body className="px-4 py-6 sm:px-6">
        <div className="space-y-5">
          <div className="space-y-2">
            <Label htmlFor="blog-title">Judul</Label>
            <Input
              id="blog-title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Misal: Update pekan ini"
              maxLength={200}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="blog-excerpt">Excerpt (opsional)</Label>
            <Textarea
              id="blog-excerpt"
              value={excerpt}
              onChange={(e) => setExcerpt(e.target.value)}
              placeholder="Ringkasan singkat 1–2 kalimat"
              rows={2}
              maxLength={500}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="blog-body">Isi artikel</Label>
            <Textarea
              id="blog-body"
              value={body}
              onChange={(e) => setBody(e.target.value)}
              placeholder="Tulis isi artikel di sini (markdown didukung)"
              rows={10}
            />
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="blog-category">Kategori (opsional)</Label>
              <Input
                id="blog-category"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                placeholder="general"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="blog-tags">Tags (pisah koma)</Label>
              <Input
                id="blog-tags"
                value={tagsInput}
                onChange={(e) => setTagsInput(e.target.value)}
                placeholder="news, update"
              />
            </div>
          </div>
        </div>
      </ResponsiveDialog.Body>

      <ResponsiveDialog.Footer className="flex-col-reverse sm:flex-row">
        <Button
          variant="outline"
          onClick={() => onOpenChange(false)}
          disabled={isSubmitting}
        >
          Batal
        </Button>
        <Button
          variant="secondary"
          onClick={() => handleSubmit(false)}
          disabled={isSubmitting}
        >
          {isSubmitting && status !== "published" ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : null}
          Simpan draft
        </Button>
        <Button onClick={() => handleSubmit(true)} disabled={isSubmitting}>
          {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
          Terbitkan
        </Button>
      </ResponsiveDialog.Footer>
    </ResponsiveDialog>
  )
}
