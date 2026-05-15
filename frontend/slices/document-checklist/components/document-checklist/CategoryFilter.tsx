"use client"

import { FileCheck, FileText, Filter } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { indonesianCategoryLabels } from "../../data/indonesianData"
import type { ChecklistItem } from "../../types"
import { categoryIcons } from "../../constants/icons"

interface Props {
  filterCategory: string | null
  setFilterCategory: (s: string | null) => void
  subcategories: string[]
  items: ChecklistItem[]
  category: "local" | "international"
}

export function CategoryFilter({
  filterCategory,
  setFilterCategory,
  subcategories,
  items,
  category,
}: Props) {
  return (
    <Card className="border-border">
      <CardHeader>
        <CardTitle className="text-lg flex items-center gap-2">
          <Filter className="w-5 h-5" />
          Filter Kategori
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          <Button
            type="button"
            variant={filterCategory === null ? "secondary" : "ghost"}
            onClick={() => setFilterCategory(null)}
            className={cn(
              "w-full justify-start gap-3 px-3 py-3 h-auto rounded-lg text-left",
              filterCategory === null && "bg-brand-muted text-brand",
            )}
          >
            <FileCheck className="w-5 h-5" />
            Semua Dokumen
          </Button>
          {subcategories.map((subcat) => {
            const Icon = categoryIcons[subcat] || FileText
            const count = items.filter(
              (i) => i.category === category && i.subcategory === subcat,
            ).length
            return (
              <Button
                key={subcat}
                type="button"
                variant={filterCategory === subcat ? "secondary" : "ghost"}
                onClick={() => setFilterCategory(subcat)}
                className={cn(
                  "w-full justify-between gap-3 px-3 py-3 h-auto rounded-lg text-left",
                  filterCategory === subcat && "bg-brand-muted text-brand",
                )}
              >
                <span className="flex items-center gap-3">
                  <Icon className="w-5 h-5" />
                  {indonesianCategoryLabels[subcat] ?? subcat}
                </span>
                <Badge variant="secondary" className="bg-muted">
                  {count}
                </Badge>
              </Button>
            )
          })}
        </div>
      </CardContent>
    </Card>
  )
}
