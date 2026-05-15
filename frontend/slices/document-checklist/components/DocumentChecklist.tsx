"use client"

import { useState, type ReactNode } from "react"
import { AlertCircle, Bell, Building2, Globe, Plane } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import type { ChecklistItem } from "../types"
import {
  useChecklistData,
  type ChecklistBindings,
} from "../hooks/useChecklistData"
import { PageContainer, PageHeader } from "../lib/layout"
import { CategorySection } from "./document-checklist/CategorySection"
import { ItemDetailDialog } from "./document-checklist/ItemDetailDialog"

export interface DocumentChecklistProps {
  /** Convex bindings — see `useChecklistData` README for reference adapter. */
  bindings: ChecklistBindings
  /** When false, hook short-circuits seed/queries (e.g., signed-out). */
  enabled?: boolean
  /** Optional country-template picker — render `<CountryTemplateCard ... />` here. */
  countryTemplateSlot?: ReactNode
  /** Page title — defaults to "Ceklis Dokumen". */
  title?: string
  /** Page description. */
  description?: string
}

/**
 * Top-level slice component. Renders the page shell, local/international
 * tabs, and the per-item detail dialog. Convex wiring is injected via
 * `bindings` so the slice stays portable.
 */
export function DocumentChecklist({
  bindings,
  enabled,
  countryTemplateSlot,
  title = "Ceklis Dokumen",
  description = "Kelola semua dokumen yang diperlukan untuk melamar pekerjaan",
}: DocumentChecklistProps) {
  const [selectedItem, setSelectedItem] = useState<ChecklistItem | null>(null)
  const [filterCategory, setFilterCategory] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState("local")

  const {
    items,
    toggleItem,
    updateItem,
    getFilteredItems,
    getProgress,
    getSubcategories,
  } = useChecklistData(bindings, { enabled })

  const localProgress = getProgress("local")
  const internationalProgress = getProgress("international")

  return (
    <PageContainer size="lg">
      <PageHeader title={title} description={description} />

      {countryTemplateSlot}

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="local" className="flex items-center gap-2">
            <Building2 className="w-4 h-4" />
            Kerja Lokal
          </TabsTrigger>
          <TabsTrigger
            value="international"
            className="flex items-center gap-2"
          >
            <Globe className="w-4 h-4" />
            Kerja Luar Negeri
          </TabsTrigger>
        </TabsList>

        <TabsContent value="local" className="space-y-6">
          <CategorySection
            category="local"
            filterCategory={filterCategory}
            setFilterCategory={setFilterCategory}
            progress={localProgress}
            filteredItems={getFilteredItems("local", filterCategory)}
            subcategories={getSubcategories("local")}
            items={items}
            onToggle={toggleItem}
            onSelect={setSelectedItem}
            sidebarExtra={
              <Card className="border-border bg-gradient-to-br from-brand-muted to-brand-muted">
                <CardContent className="pt-6">
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-lg bg-brand flex items-center justify-center flex-shrink-0">
                      <Bell className="w-5 h-5 text-brand-foreground" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-brand">Pengingat</h4>
                      <p className="text-sm text-brand mt-1">
                        SKCK perlu diperpanjang setiap 6 bulan. Atur pengingat!
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            }
          />
        </TabsContent>

        <TabsContent value="international" className="space-y-6">
          <CategorySection
            category="international"
            filterCategory={filterCategory}
            setFilterCategory={setFilterCategory}
            progress={internationalProgress}
            filteredItems={getFilteredItems("international", filterCategory)}
            subcategories={getSubcategories("international")}
            items={items}
            onToggle={toggleItem}
            onSelect={setSelectedItem}
            notice={
              <Card className="border-warning/30 bg-warning/10">
                <CardContent className="pt-6">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-xl bg-warning flex items-center justify-center flex-shrink-0">
                      <AlertCircle className="w-6 h-6 text-brand-foreground" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-warning">
                        Penting untuk Kerja Luar Negeri
                      </h4>
                      <p className="text-warning mt-1">
                        Persyaratan bervariasi sesuai negara. Selalu periksa
                        persyaratan spesifik negara tujuan Anda. Beberapa
                        dokumen mungkin memerlukan apostille atau legalisasi.
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            }
            sidebarExtra={
              <Card className="border-border bg-gradient-to-br from-info/20 to-info/20">
                <CardContent className="pt-6">
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-lg bg-info flex items-center justify-center flex-shrink-0">
                      <Plane className="w-5 h-5 text-brand-foreground" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-info">
                        Destinasi Populer
                      </h4>
                      <div className="flex flex-wrap gap-2 mt-2">
                        <Badge variant="secondary" className="bg-card text-info">
                          Singapura
                        </Badge>
                        <Badge variant="secondary" className="bg-card text-info">
                          Australia
                        </Badge>
                        <Badge variant="secondary" className="bg-card text-info">
                          Jepang
                        </Badge>
                        <Badge variant="secondary" className="bg-card text-info">
                          UAE
                        </Badge>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            }
          />
        </TabsContent>
      </Tabs>

      <ItemDetailDialog
        selectedItem={selectedItem}
        onClose={() => setSelectedItem(null)}
        onToggle={toggleItem}
        onUpdate={updateItem}
      />
    </PageContainer>
  )
}
