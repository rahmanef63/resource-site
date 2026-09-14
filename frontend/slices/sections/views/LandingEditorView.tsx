"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import { LandingFieldsForm } from "../components/LandingFieldsForm";
import { useLandingStore } from "../landing-context";
import { blankSection } from "../lib/core";
import type { LandingSection } from "../types";

export function LandingEditorView({ id }: { id: string }) {
  const store = useLandingStore();
  const entity = store.items.find((item) => item.id === id);
  const [draft, setDraft] = React.useState<LandingSection>(() => structuredClone(entity ?? blankSection(store.items.at(-1)?.order ?? 0, id)));
  React.useEffect(() => setDraft(structuredClone(entity ?? blankSection(store.items.at(-1)?.order ?? 0, id))), [entity, id, store.items]);
  const positions = React.useMemo(() => Array.from({ length: Math.max(1, store.items.length + (entity ? 0 : 1)) }, (_, i) => i + 1), [entity, store.items.length]);

  function patch(key: keyof LandingSection, value: unknown) { setDraft((current) => ({ ...current, [key]: value } as LandingSection)); }
  function save() { if (entity) { const { id: _id, ...next } = draft; store.update(draft.id, next); } else store.create(draft); }

  return <div className="mx-auto max-w-3xl space-y-4">
    <div className="flex flex-wrap items-center justify-between gap-3"><Button asChild variant="outline" size="sm"><a href={`${store.adminBase}/landing`}>← All landing sections</a></Button><Button asChild variant="outline" size="sm"><a href={store.publicBase} target="_blank">View public</a></Button></div>
    <div className="rounded-lg border bg-card p-4 sm:p-5"><LandingFieldsForm value={draft} onChange={patch} positions={positions} /></div>
    <div className="flex justify-end"><Button onClick={save}>Save section</Button></div>
  </div>;
}

export { blankSection } from "../lib/core";
