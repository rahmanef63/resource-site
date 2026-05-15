"use client"

import { useEffect, useRef, useState } from "react"
import { useSearchParams } from "next/navigation"
import { Globe, Loader2, MapPin, ScrollText } from "lucide-react"
import { toast } from "sonner"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Skeleton } from "@/components/ui/skeleton"
import { cn } from "@/lib/utils"

export interface TemplateSummary {
  _id: string
  country: string
  countryLabel: string
  flag?: string
  description?: string
  documentCount: number
  requiredCount: number
}

export interface TemplateDoc {
  id: string
  title: string
  description: string
  category: string
  required: boolean
  issuingAuthority?: string
  validityYears?: number
}

export interface TemplateFull {
  country: string
  countryLabel: string
  flag?: string
  description?: string
  documents: TemplateDoc[]
}

/**
 * Bindings for the country-template card. Consumer wires Convex
 * queries + mutations into these slots — slice stays portable.
 */
export interface CountryTemplateBindings {
  /** `undefined` = loading, list otherwise. */
  templates: TemplateSummary[] | undefined
  /** Full payload for the previewed country, or `null` when none / loading. */
  getTemplate: (country: string | null) => TemplateFull | null | undefined
  /** Idempotent — merges template into user's checklist row. */
  instantiate: (args: {
    country: string
  }) => Promise<{ inserted: number; preserved: number }>
}

/**
 * Country template picker — surfaces per-country master lists as a
 * one-click "import to my checklist" flow. Preserves prior completion
 * state when re-importing.
 */
export function CountryTemplateCard({
  bindings,
}: {
  bindings: CountryTemplateBindings
}) {
  const { templates } = bindings
  const [previewCountry, setPreviewCountry] = useState<string | null>(null)

  // Deep-link from upstream — open preview if ?country=<code> matches
  // a loaded template.
  const sp = useSearchParams()
  const appliedRef = useRef(false)
  useEffect(() => {
    if (appliedRef.current) return
    if (!templates) return
    const country = sp?.get("country")
    if (country && templates.some((t) => t.country === country)) {
      setPreviewCountry(country)
      appliedRef.current = true
    }
  }, [sp, templates])

  return (
    <>
      <Card className="border-border">
        <CardHeader className="pb-2">
          <CardTitle className="text-base flex items-center gap-2">
            <Globe className="h-4 w-4 text-brand" />
            Template Dokumen per Negara
            <Badge variant="outline" className="ml-1 text-[10px]">
              engine seed
            </Badge>
          </CardTitle>
          <CardDescription className="text-xs">
            Pilih negara tujuan kerja/migrasi — impor master list dokumen
            yang dibutuhkan jadi checklist personal kamu. Progres item yang
            sudah selesai tetap dipertahankan saat re-import.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {!templates ? (
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
              {[0, 1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-20 rounded-md" />
              ))}
            </div>
          ) : templates.length === 0 ? (
            <p className="rounded-md border border-dashed border-amber-300/50 bg-amber-500/5 p-3 text-xs text-amber-700 dark:text-amber-400">
              Template belum di-seed. Admin perlu jalankan Engine Seed dulu.
            </p>
          ) : (
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-5">
              {templates.map((t) => (
                <Button
                  key={t._id}
                  type="button"
                  variant="outline"
                  onClick={() => setPreviewCountry(t.country)}
                  className={cn(
                    "flex h-auto flex-col items-start gap-1 rounded-md border border-border bg-card p-3 text-left transition-colors",
                    "hover:border-brand/50 hover:bg-brand/5",
                  )}
                >
                  <div className="flex items-center gap-1.5">
                    <span className="text-xl">{t.flag ?? "🌐"}</span>
                    <span className="text-xs font-semibold">
                      {t.countryLabel}
                    </span>
                  </div>
                  <div className="flex items-center gap-1 text-[10px] text-muted-foreground">
                    <ScrollText className="h-3 w-3" />
                    {t.documentCount} dok · {t.requiredCount} wajib
                  </div>
                </Button>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <TemplatePreviewDialog
        country={previewCountry}
        onClose={() => setPreviewCountry(null)}
        getTemplate={bindings.getTemplate}
        instantiate={bindings.instantiate}
      />
    </>
  )
}

interface PreviewDialogProps {
  country: string | null
  onClose: () => void
  getTemplate: CountryTemplateBindings["getTemplate"]
  instantiate: CountryTemplateBindings["instantiate"]
}

function TemplatePreviewDialog({
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
