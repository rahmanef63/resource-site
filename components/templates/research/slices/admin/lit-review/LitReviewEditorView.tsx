"use client";

import * as React from "react";
import { ArrowLeft, Plus, Save, Trash2 } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import type { FieldDef } from "@/components/templates/_shared/crud/types";
import { ADMIN_BASE } from "../../../shared/nav-config";
import type { LitReview } from "../../../shared/types";
import { useLitReviewController } from "./LitReviewView";

/** Quick-edit dialog fields (matrix omitted — too rich for inline dialog;
 *  use deep-link page below for matrix editing). */
export const FIELDS: FieldDef<LitReview>[] = [
  { kind: "text", key: "topic", label: "Topik" },
  { kind: "tags", key: "docIds", label: "Document IDs", hint: "Edit matrix di halaman deep-link." },
  { kind: "textarea", key: "question", label: "Pertanyaan riset", rows: 3 },
];

export function LitReviewEditorView({ id }: { id: string }) {
  const controller = useLitReviewController();
  const entity = controller.items.find((it) => it.id === id);
  const [draft, setDraft] = React.useState<LitReview | null>(entity ?? null);

  React.useEffect(() => setDraft(entity ?? null), [entity]);

  if (!entity || !draft) {
    return (
      <div className="space-y-3">
        <Back />
        <p className="text-sm text-muted-foreground">Review tidak ditemukan.</p>
      </div>
    );
  }

  const dirty = JSON.stringify(draft) !== JSON.stringify(entity);

  function patch<K extends keyof LitReview>(key: K, value: LitReview[K]) {
    setDraft((d) => (d ? { ...d, [key]: value } : d));
  }
  function addRow() {
    if (!draft) return;
    patch("matrix", [...draft.matrix, { docId: "", method: "", finding: "", gap: "" }]);
  }
  function updateRow(i: number, key: "docId" | "method" | "finding" | "gap", value: string) {
    if (!draft) return;
    const next = draft.matrix.map((r, idx) => (idx === i ? { ...r, [key]: value } : r));
    patch("matrix", next);
  }
  function removeRow(i: number) {
    if (!draft) return;
    patch("matrix", draft.matrix.filter((_, idx) => idx !== i));
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-2">
        <Back />
        <Button size="sm" className="gap-1.5" disabled={!dirty} onClick={() => controller.update(id, draft)}>
          <Save className="size-3.5" /> Simpan{dirty ? " (belum disimpan)" : ""}
        </Button>
      </div>

      <div className="grid gap-3 rounded-lg border bg-card p-5 sm:grid-cols-2">
        <Field label="Topik">
          <Input value={draft.topic} onChange={(e) => patch("topic", e.target.value)} />
        </Field>
        <Field label="Document IDs (pisah koma)">
          <Input
            value={draft.docIds.join(", ")}
            onChange={(e) =>
              patch(
                "docIds",
                e.target.value.split(",").map((t) => t.trim()).filter(Boolean),
              )
            }
          />
        </Field>
        <div className="sm:col-span-2">
          <Label className="text-xs">Pertanyaan riset</Label>
          <Textarea
            rows={3}
            value={draft.question}
            onChange={(e) => patch("question", e.target.value)}
            className="mt-1.5"
          />
        </div>
      </div>

      <div className="rounded-lg border bg-card p-5">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-sm font-medium">Matrix sintesis</h2>
          <Button size="sm" variant="outline" className="gap-1" onClick={addRow}>
            <Plus className="size-3.5" /> Baris baru
          </Button>
        </div>
        <div className="space-y-2">
          {draft.matrix.map((row, i) => (
            <div key={i} className="grid gap-2 rounded-md border border-border/60 p-3 sm:grid-cols-[1fr_1fr_1fr_1fr_auto]">
              <Input placeholder="Doc ID" value={row.docId} onChange={(e) => updateRow(i, "docId", e.target.value)} className="font-mono text-xs" />
              <Input placeholder="Metode" value={row.method} onChange={(e) => updateRow(i, "method", e.target.value)} />
              <Input placeholder="Temuan" value={row.finding} onChange={(e) => updateRow(i, "finding", e.target.value)} />
              <Input placeholder="Gap" value={row.gap} onChange={(e) => updateRow(i, "gap", e.target.value)} />
              <Button size="icon" variant="ghost" className="size-8 text-destructive" onClick={() => removeRow(i)}>
                <Trash2 className="size-3.5" />
              </Button>
            </div>
          ))}
          {draft.matrix.length === 0 && (
            <p className="py-4 text-center text-xs text-muted-foreground">Belum ada baris.</p>
          )}
        </div>
      </div>
    </div>
  );
}

function Back() {
  return (
    <Link href={`${ADMIN_BASE}/lit-review`} className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground">
      <ArrowLeft className="size-3" /> Semua review
    </Link>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <Label className="text-xs">{label}</Label>
      {children}
    </div>
  );
}
