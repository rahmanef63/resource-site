"use client";

import * as React from "react";
import Link from "next/link";
import { ArrowLeft, ExternalLink, Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { CrudFieldInput } from "./CrudFieldInput";
import type { CrudController, EntityMeta, FieldDef } from "./types";

/**
 * Generic editor for one entity row. Field-schema driven — pass FieldDef[]
 * + the entity id + a CrudController. Dirty state tracked locally; Save
 * dispatches update(id, draft). Public link auto-shown via meta.publicHref.
 */
export function CrudFormView<T>({
  id,
  meta,
  controller,
  fields,
  backHref,
}: {
  id: string;
  meta: EntityMeta;
  controller: CrudController<T>;
  fields: FieldDef<T>[];
  /** /admin/<entity> list URL. */
  backHref: string;
}) {
  const entity = controller.items.find((it) => controller.getId(it) === id);
  const [draft, setDraft] = React.useState<T | null>(entity ?? null);

  React.useEffect(() => setDraft(entity ?? null), [entity]);

  if (!entity || !draft) {
    return (
      <div className="space-y-3">
        <BackLink href={backHref} label={meta.labelPlural} />
        <p className="text-sm text-muted-foreground">{meta.label} not found.</p>
      </div>
    );
  }

  const dirty = JSON.stringify(draft) !== JSON.stringify(entity);
  const publicHref = meta.publicHref?.(draft as unknown);

  function patch<K extends keyof T>(key: K, value: T[K]) {
    setDraft((d) => (d ? { ...d, [key]: value } : d));
  }

  function save() {
    if (!draft) return;
    controller.update(id, draft);
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-2">
        <BackLink href={backHref} label={meta.labelPlural} />
        <div className="flex items-center gap-2">
          {publicHref && (
            <Button asChild variant="outline" size="sm" className="gap-1.5">
              <Link href={publicHref} target="_blank">
                <ExternalLink className="size-3.5" /> View public
              </Link>
            </Button>
          )}
          <Button size="sm" className="gap-1.5" disabled={!dirty} onClick={save}>
            <Save className="size-3.5" /> Save{dirty ? " (unsaved)" : ""}
          </Button>
        </div>
      </div>

      <div className="rounded-lg border bg-card p-5">
        <div className="grid gap-4 sm:grid-cols-2">
          {fields.map((f) => (
            <FieldRender
              key={f.key}
              field={f}
              value={(draft as Record<string, unknown>)[f.key]}
              onChange={(v) => patch(f.key as keyof T, v as T[keyof T])}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

function BackLink({ href, label }: { href: string; label: string }) {
  return (
    <Link
      href={href}
      className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground"
    >
      <ArrowLeft className="size-3" /> All {label.toLowerCase()}
    </Link>
  );
}

function FieldRender<T>({
  field,
  value,
  onChange,
}: {
  field: FieldDef<T>;
  value: unknown;
  onChange: (next: unknown) => void;
}) {
  const wrapper = field.kind === "textarea" || field.kind === "tags" ? "sm:col-span-2" : "";
  return (
    <div className={`space-y-1.5 ${wrapper}`}>
      <Label className="text-xs">{field.label}</Label>
      <CrudFieldInput field={field} value={value} onChange={onChange} />
      {"hint" in field && field.hint && (
        <p className="text-[10px] text-muted-foreground">{field.hint}</p>
      )}
    </div>
  );
}
