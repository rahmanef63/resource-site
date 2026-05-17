"use client"

import { useState } from "react"
import { Loader2, MapPin } from "lucide-react"
import { toast } from "sonner"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Skeleton } from "@/components/ui/skeleton"
import type { CountryTemplateBindings } from "./country-template-types"

interface PreviewDialogProps {
  country: string | null
  onClose: () => void
  getTemplate: CountryTemplateBindings["getTemplate"]
  instantiate: CountryTemplateBindings["instantiate"]
}

export function TemplatePreviewDialog({
  country,
  onClose,
  getTemplate,
  instantiate,
}: PreviewDialogProps) {
  const template = getTemplate(country)
  const [importing, setImporting] = useState(false)

  const handleImport = async () => {
    if (!country) return
    setImporting(true)
    try {
      const r = await instantiate({ country })
      toast.success(
        `${r.inserted} dokumen baru diimpor · ${r.preserved} status lama dipertahankan`,
      )
      onClose()
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Gagal impor template"
      toast.error(msg)
    } finally {
      setImporting(false)
    }
  }

  return (
    <Dialog open={country !== null} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <span className="text-2xl">{template?.flag ?? "🌐"}</span>
            <span>{template?.countryLabel ?? "Template Negara"}</span>
            {template && (
              <Badge variant="outline" className="ml-1 text-[10px]">
                {template.documents.length} dokumen
              </Badge>
            )}
          </DialogTitle>
          <DialogDescription>
            {template?.description ??
              "Daftar dokumen master untuk negara ini. Impor untuk membuat checklist personal."}
          </DialogDescription>
        </DialogHeader>

        <div className="max-h-[60dvh] space-y-1.5 overflow-y-auto pr-1">
          {!template ? (
            <Skeleton className="h-32 w-full rounded-lg" />
          ) : (
            template.documents.map((d) => (
              <div
                key={d.id}
                className="rounded-md border border-border bg-card p-2.5 text-xs"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="font-semibold">{d.title}</div>
                  {d.required ? (
                    <Badge
                      variant="destructive"
                      className="shrink-0 text-[9px]"
                    >
                      Wajib
                    </Badge>
                  ) : (
                    <Badge variant="outline" className="shrink-0 text-[9px]">
                      Opsional
                    </Badge>
                  )}
                </div>
                <p className="mt-1 text-[11px] text-muted-foreground">
                  {d.description}
                </p>
                <div className="mt-1 flex flex-wrap items-center gap-1.5 text-[10px] text-muted-foreground">
                  <Badge variant="outline" className="text-[9px]">
                    {d.category}
                  </Badge>
                  {d.issuingAuthority && (
                    <span className="flex items-center gap-0.5">
                      <MapPin className="h-2.5 w-2.5" />
                      {d.issuingAuthority}
                    </span>
                  )}
                  {d.validityYears !== undefined && (
                    <span>· Berlaku {d.validityYears} thn</span>
                  )}
                </div>
              </div>
            ))
          )}
        </div>

        <DialogFooter>
          <Button type="button" variant="outline" onClick={onClose}>
            Tutup
          </Button>
          <Button
            type="button"
            onClick={handleImport}
            disabled={importing || !template}
            className="gap-2 bg-brand hover:bg-brand"
          >
            {importing ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" /> Mengimpor…
              </>
            ) : (
              <>Impor ke Checklist Saya</>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
