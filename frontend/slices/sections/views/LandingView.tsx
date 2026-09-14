"use client";

import * as React from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { LandingFieldsForm } from "../components/LandingFieldsForm";
import { useLandingStore } from "../landing-context";
import { blankSection, LANDING_KIND_LABEL, moveLandingSection, sortedLandingSections, visibleLandingCount } from "../lib/core";
import type { LandingSection } from "../types";

export function LandingView() {
  const store = useLandingStore();
  const items = sortedLandingSections(store.items);
  const [openId, setOpenId] = React.useState<string | null>(null);
  const entity = items.find((item) => item.id === openId) ?? null;
  const [draft, setDraft] = React.useState<LandingSection | null>(null);
  React.useEffect(() => setDraft(entity ? structuredClone(entity) : null), [entity]);

  const positions = React.useMemo(() => Array.from({ length: Math.max(1, items.length) }, (_, i) => i + 1), [items.length]);
  function createNew() {
    const next = blankSection(items.at(-1)?.order ?? 0);
    store.create(next);
    setOpenId(next.id);
  }
  function patch(key: keyof LandingSection, value: unknown) {
    setDraft((current) => current ? ({ ...current, [key]: value } as LandingSection) : current);
  }
  function save() {
    if (!draft) return;
    const { id, ...next } = draft;
    store.update(id, next);
    setOpenId(null);
  }

  return <div className="space-y-4">
    <div className="flex flex-wrap items-end justify-between gap-3">
      <div><h1 className="text-xl font-semibold tracking-tight sm:text-2xl">Landing sections</h1><p className="text-xs text-muted-foreground">{visibleLandingCount(items)}/{items.length} sections visible</p></div>
      <div className="flex gap-2"><Button asChild size="sm" variant="outline"><a href={store.publicBase}>View public</a></Button><Button size="sm" onClick={createNew}>New section</Button></div>
    </div>
    <div className="overflow-x-auto rounded-lg border bg-card">
      <Table>
        <TableHeader><TableRow><TableHead>Title</TableHead><TableHead className="hidden md:table-cell">Kind</TableHead><TableHead className="hidden md:table-cell">#</TableHead><TableHead>Visible</TableHead><TableHead className="text-right">Actions</TableHead></TableRow></TableHeader>
        <TableBody>
          {items.map((item, index) => <TableRow key={item.id} className="cursor-pointer" onClick={() => setOpenId(item.id)}>
            <TableCell><div className="font-medium">{item.title}</div><div className="max-w-sm truncate text-xs text-muted-foreground">{item.subtitle}</div></TableCell>
            <TableCell className="hidden md:table-cell"><Badge variant="outline">{LANDING_KIND_LABEL[item.kind]}</Badge></TableCell>
            <TableCell className="hidden font-mono text-xs md:table-cell">{String(item.order).padStart(2, "0")}</TableCell>
            <TableCell><Badge variant={item.enabled ? "default" : "outline"}>{item.enabled ? "on" : "off"}</Badge></TableCell>
            <TableCell onClick={(event) => event.stopPropagation()}><div className="flex justify-end gap-1"><Button size="icon" variant="outline" disabled={index === 0} onClick={() => moveLandingSection(store, item.id, -1)}>↑</Button><Button size="icon" variant="outline" disabled={index === items.length - 1} onClick={() => moveLandingSection(store, item.id, 1)}>↓</Button><Button size="sm" variant="ghost" onClick={() => setOpenId(item.id)}>Edit</Button><Button size="sm" variant="ghost" className="text-destructive" onClick={() => store.remove(item.id)}>Delete</Button></div></TableCell>
          </TableRow>)}
          {items.length === 0 ? <TableRow><TableCell colSpan={5} className="py-8 text-center text-xs text-muted-foreground">No landing sections yet.</TableCell></TableRow> : null}
        </TableBody>
      </Table>
    </div>

    <Dialog open={Boolean(openId)} onOpenChange={(open) => { if (!open) setOpenId(null); }}>
      <DialogContent className="max-h-[85dvh] overflow-y-auto sm:max-w-2xl">
        <DialogHeader><DialogTitle>Edit section</DialogTitle><DialogDescription>Content, ordering, visibility, images, and renderer config.</DialogDescription></DialogHeader>
        {draft ? <LandingFieldsForm value={draft} onChange={patch} positions={positions} /> : null}
        <DialogFooter>{draft ? <Button variant="outline" className="mr-auto text-destructive" onClick={() => { store.remove(draft.id); setOpenId(null); }}>Delete</Button> : null}<Button variant="outline" onClick={() => setOpenId(null)}>Cancel</Button><Button onClick={save}>Save</Button></DialogFooter>
      </DialogContent>
    </Dialog>
  </div>;
}
