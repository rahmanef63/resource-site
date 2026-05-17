"use client"

import { useEffect, useRef, useState } from "react"
import { useSearchParams } from "next/navigation"
import { Globe, ScrollText } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { cn } from "@/lib/utils"
import type {
  CountryTemplateBindings,
  TemplateDoc,
  TemplateFull,
  TemplateSummary,
} from "./country-template-types"
import { TemplatePreviewDialog } from "./TemplatePreviewDialog"

export type {
  CountryTemplateBindings,
  TemplateDoc,
  TemplateFull,
  TemplateSummary,
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
