"use client";

import * as React from "react";
import Link from "next/link";
import { ArrowLeft, ExternalLink, Save } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { PageEditorBlocks } from "./PageEditorBlocks";
import { usePage, usePagesStore } from "./pages-context";
import { emptyBlock, type PageBlock, type PageBlockKind, type PageEntry } from "./types";

export function PageEditorView({
  id,
  publicBase,
  adminBase,
}: {
  id: string;
  publicBase: string;
  adminBase: string;
}) {
  const page = usePage(id);
  const { update, reorderBlock } = usePagesStore();
  const [draft, setDraft] = React.useState<PageEntry | null>(page);
  const [addKind, setAddKind] = React.useState<PageBlockKind>("hero");

  React.useEffect(() => {
    setDraft(page);
  }, [page]);

  if (!page) return <NotFound adminBase={adminBase} />;
  if (page.systemPage) return <SystemPageNotice adminBase={adminBase} />;
  if (!draft) return null;

  const dirty = JSON.stringify(draft) !== JSON.stringify(page);

  function patchDraft(patch: Partial<PageEntry>) {
    setDraft((d) => (d ? { ...d, ...patch } : d));
  }

  const patchBlock = (idx: number, next: PageBlock) =>
    setDraft((d) => (d ? { ...d, blocks: d.blocks.map((b, i) => (i === idx ? next : b)) } : d));
  const removeBlock = (idx: number) =>
    setDraft((d) => (d ? { ...d, blocks: d.blocks.filter((_, i) => i !== idx) } : d));
  const addBlock = () =>
    setDraft((d) => (d ? { ...d, blocks: [...d.blocks, emptyBlock(addKind)] } : d));

  function save() {
    if (!draft) return;
    update(draft.id, {
      slug: draft.slug,
      title: draft.title,
      description: draft.description,
      status: draft.status,
      blocks: draft.blocks,
    });
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-2">
        <Link
          href={`${adminBase}/pages`}
          className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="size-3" /> All pages
        </Link>
        <div className="flex items-center gap-2">
          <Button asChild variant="outline" size="sm" className="gap-1.5">
            <Link href={`${publicBase}/${draft.slug}`} target="_blank">
              <ExternalLink className="size-3.5" /> View public
            </Link>
          </Button>
          <Button size="sm" className="gap-1.5" disabled={!dirty} onClick={save}>
            <Save className="size-3.5" /> Save{dirty ? " (unsaved)" : ""}
          </Button>
        </div>
      </div>

      <div className="rounded-lg border bg-card p-5">
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Slug" mono>
            <Input
              value={draft.slug}
              onChange={(e) => patchDraft({ slug: e.target.value })}
              className="font-mono text-xs"
            />
            <p className="mt-1 text-[10px] text-muted-foreground">
              Renders at <span className="font-mono">{publicBase}/{draft.slug}</span>
            </p>
          </Field>
          <Field label="Title">
            <Input value={draft.title} onChange={(e) => patchDraft({ title: e.target.value })} />
          </Field>
          <div className="sm:col-span-2">
            <Field label="Description">
              <Textarea
                value={draft.description}
                onChange={(e) => patchDraft({ description: e.target.value })}
                rows={2}
              />
            </Field>
          </div>
          <Field label="Status">
            <Select
              value={draft.status}
              onValueChange={(v: "draft" | "published") => patchDraft({ status: v })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="draft">draft</SelectItem>
                <SelectItem value="published">published</SelectItem>
              </SelectContent>
            </Select>
          </Field>
          <div className="flex items-end">
            {draft.duplicatedFrom && (
              <Badge variant="outline" className="text-[10px]">
                duplicated from {draft.duplicatedFrom.slice(0, 12)}…
              </Badge>
            )}
          </div>
        </div>
      </div>

      <PageEditorBlocks
        blocks={draft.blocks}
        addKind={addKind}
        setAddKind={setAddKind}
        onAdd={addBlock}
        onPatch={patchBlock}
        onRemove={removeBlock}
        onMoveUp={(i) => reorderBlock(draft.id, i, i - 1)}
        onMoveDown={(i) => reorderBlock(draft.id, i, i + 1)}
      />
    </div>
  );
}

function Field({ label, mono, children }: { label: string; mono?: boolean; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <Label className={mono ? "text-[10px] font-mono uppercase" : "text-xs"}>{label}</Label>
      {children}
    </div>
  );
}

function NotFound({ adminBase }: { adminBase: string }) {
  return (
    <div className="space-y-3">
      <Link
        href={`${adminBase}/pages`}
        className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="size-3" /> Pages
      </Link>
      <p className="text-sm text-muted-foreground">Page not found.</p>
    </div>
  );
}

function SystemPageNotice({ adminBase }: { adminBase: string }) {
  return (
    <div className="space-y-3">
      <Link
        href={`${adminBase}/pages`}
        className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="size-3" /> Pages
      </Link>
      <div className="rounded-lg border border-amber-500/40 bg-amber-500/5 p-4 text-sm">
        <p className="font-medium">System page — read-only.</p>
        <p className="mt-1 text-xs text-muted-foreground">
          This page is rendered from JSX in the template source. To customize, duplicate
          it from the Pages list and edit the copy.
        </p>
      </div>
    </div>
  );
}
