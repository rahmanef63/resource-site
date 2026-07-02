"use client"

export type BlogPostStatus = "draft" | "scheduled" | "published" | "archived"

const STYLES: Record<BlogPostStatus, string> = {
  published: "bg-emerald-500/10 text-emerald-500 border-emerald-500/20",
  draft: "bg-zinc-500/10 text-zinc-500 border-zinc-500/20",
  scheduled: "bg-blue-500/10 text-blue-500 border-blue-500/20",
  archived: "bg-rose-500/10 text-rose-500 border-rose-500/20",
}

const LABELS: Record<BlogPostStatus, string> = {
  published: "Diterbitkan",
  draft: "Draft",
  scheduled: "Terjadwal",
  archived: "Diarsipkan",
}

export function StatusBadge({ status }: { status: BlogPostStatus }) {
  return (
    <span
      className={`inline-flex items-center rounded-md border px-2 py-0.5 text-xs font-medium ${STYLES[status]}`}
    >
      {LABELS[status]}
    </span>
  )
}
