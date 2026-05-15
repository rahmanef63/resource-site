"use client"

import { CalendarIcon, CheckCircle2, FileText, Download } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Calendar } from "@/components/ui/calendar"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { cn } from "@/lib/utils"
import { indonesianCategoryLabels } from "../../data/indonesianData"
import type { ChecklistItem } from "../../types"

interface Props {
  selectedItem: ChecklistItem | null
  onClose: () => void
  onToggle: (id: string) => void
  onUpdate: (id: string, updates: Partial<ChecklistItem>) => void
}

/**
 * Item detail dialog — used to edit notes + due date for a single
 * checklist item. Uses kitab's stock <Dialog>; consumer can swap for
 * a Sheet/Drawer if needed.
 */
export function ItemDetailDialog({
  selectedItem,
  onClose,
  onToggle,
  onUpdate,
}: Props) {
  return (
    <Dialog open={!!selectedItem} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-lg">
        {selectedItem && (
          <>
            <DialogHeader>
              <div className="flex items-center gap-3">
                <div
                  className={cn(
                    "w-12 h-12 rounded-xl flex items-center justify-center",
                    selectedItem.completed ? "bg-success" : "bg-brand",
                  )}
                >
                  {selectedItem.completed ? (
                    <CheckCircle2 className="w-6 h-6 text-brand-foreground" />
                  ) : (
                    <FileText className="w-6 h-6 text-brand-foreground" />
                  )}
                </div>
                <div>
                  <DialogTitle className="text-xl">
                    {selectedItem.title}
                  </DialogTitle>
                  <DialogDescription>
                    {selectedItem.description}
                  </DialogDescription>
                </div>
              </div>
            </DialogHeader>

            <div className="space-y-6">
              <div className="flex flex-wrap gap-2">
                <Badge variant="secondary" className="bg-muted">
                  {indonesianCategoryLabels[selectedItem.subcategory] ??
                    selectedItem.subcategory}
                </Badge>
                {selectedItem.required && (
                  <Badge
                    variant="secondary"
                    className="bg-destructive/10 text-destructive"
                  >
                    Wajib
                  </Badge>
                )}
              </div>

              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="checklist-due">Tenggat Waktu (Opsional)</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        id="checklist-due"
                        type="button"
                        variant="outline"
                        className={cn(
                          "w-full justify-start text-left font-normal",
                          !selectedItem.dueDate && "text-muted-foreground",
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {selectedItem.dueDate
                          ? selectedItem.dueDate
                          : "Pilih tenggat"}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent align="start" className="w-auto p-0">
                      <Calendar
                        mode="single"
                        selected={
                          selectedItem.dueDate
                            ? new Date(selectedItem.dueDate)
                            : undefined
                        }
                        onSelect={(d) => {
                          if (!d) {
                            onUpdate(selectedItem.id, { dueDate: undefined })
                            return
                          }
                          const iso = d.toISOString().slice(0, 10)
                          onUpdate(selectedItem.id, { dueDate: iso })
                        }}
                        autoFocus
                      />
                    </PopoverContent>
                  </Popover>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="checklist-notes">Catatan</Label>
                  <Textarea
                    id="checklist-notes"
                    placeholder="Tambahkan catatan tentang dokumen ini..."
                    value={selectedItem.notes || ""}
                    onChange={(e) =>
                      onUpdate(selectedItem.id, { notes: e.target.value })
                    }
                  />
                </div>
              </div>

              <div className="flex gap-3">
                <Button
                  className={cn(
                    "flex-1",
                    selectedItem.completed
                      ? "bg-muted text-foreground hover:bg-muted"
                      : "bg-success hover:bg-success",
                  )}
                  onClick={() => {
                    onToggle(selectedItem.id)
                    onClose()
                  }}
                >
                  {selectedItem.completed ? (
                    "Tandai Belum Selesai"
                  ) : (
                    <>
                      <CheckCircle2 className="w-4 h-4 mr-2" />
                      Tandai Selesai
                    </>
                  )}
                </Button>
                <Button variant="outline" className="flex-1">
                  <Download className="w-4 h-4 mr-2" />
                  Unduh Template
                </Button>
              </div>
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  )
}
