"use client";

import * as React from "react";
import { ArrowLeft, ExternalLink, Save } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { PageEditorBlocks } from "./PageEditorBlocks";
import { Field, PageNotFound, SystemPageNotice } from "./page-editor-helpers";
import { usePage, usePagesStore } from "./pages-context";
import { emptyBlock, type PageBlock, type PageBlockKind, type PageEntry } from "../types";
import { editablePageSnapshot, moveBlock, pageHref, removeBlock as removeBlockAt, replaceBlock as replaceBlockAt } from "../lib/core";

/**
 * Page editor — metadata form + the block editor. A page is composed of
 * an ordered list of `PageBlock`s (blocks-only; the section bridge was
 * severed when this engine became a standalone slice). System pages are
 * read-only.
 */
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
  const { update } = usePagesStore();
  const [draft, setDraft] = React.useState<PageEntry | null>(page);
  const [addKind, setAddKind] = React.useState<PageBlockKind>("hero");

  React.useEffect(() => {
    setDraft(page);
  }, [page]);

  if (!page) return <PageNotFound adminBase={adminBase} />;
  if (page.systemPage) return <SystemPageNotice adminBase={adminBase} />;
  if (!draft) return null;

  const dirty = editablePageSnapshot(draft) !== editablePageSnapshot(page);

  function patchDraft(patch: Partial<PageEntry>) {
    setDraft((d) => (d ? { ...d, ...patch } : d));
  }

  const patchBlock = (idx: number, next: PageBlock) =>
    setDraft((d) => (d ? { ...d, blocks: replaceBlockAt(d.blocks, idx, next) } : d));
  const removeBlock = (idx: number) =>
    setDraft((d) => (d ? { ...d, blocks: removeBlockAt(d.blocks, idx) } : d));
  const addBlock = () =>
    setDraft((d) => (d ? { ...d, blocks: [...d.blocks, emptyBlock(addKind)] } : d));

  function saveMeta() {
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
        <a
          href={`${adminBase}/pages`}
          className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="size-3" /> All pages
        </a>
        <div className="flex items-center gap-2">
          <Button asChild variant="outline" size="sm" className="gap-1.5">
            <a href={pageHref(publicBase, draft.slug)} target="_blank" rel="noreferrer">
              <ExternalLink className="size-3.5" /> View public
            </a>
          </Button>
          <Button size="sm" className="gap-1.5" disabled={!dirty} onClick={saveMeta}>
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
          <div className="flex items-end gap-2">
            {draft.isLanding && (
              <Badge variant="default" className="bg-emerald-500/20 text-emerald-300">
                landing
              </Badge>
            )}
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
        onMoveUp={(i) => patchDraft({ blocks: moveBlock(draft.blocks, i, i - 1) })}
        onMoveDown={(i) => patchDraft({ blocks: moveBlock(draft.blocks, i, i + 1) })}
      />
    </div>
  );
}
