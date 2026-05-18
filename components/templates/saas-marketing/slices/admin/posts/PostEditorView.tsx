"use client";

import * as React from "react";
import Link from "next/link";
import { ArrowLeft, ExternalLink, Save } from "lucide-react";
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
import { useStore } from "../../../shared/store";
import {
  ADMIN_BASE,
  PUBLIC_BASE,
} from "../../../shared/nav-config";
import type { BlogPost } from "../../../shared/types";

const STATUSES: BlogPost["status"][] = ["draft", "scheduled", "published"];

export function PostEditorView({ id }: { id: string }) {
  const { state, dispatch } = useStore();
  const post = state.posts.find((p) => p.id === id);
  const [draft, setDraft] = React.useState<BlogPost | null>(post ?? null);

  React.useEffect(() => {
    setDraft(post ?? null);
  }, [post]);

  if (!post || !draft) {
    return (
      <div className="space-y-3">
        <Link
          href={`${ADMIN_BASE}/posts`}
          className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="size-3" /> Posts
        </Link>
        <p className="text-sm text-muted-foreground">Post not found.</p>
      </div>
    );
  }

  const dirty = JSON.stringify(draft) !== JSON.stringify(post);

  function patch(p: Partial<BlogPost>) {
    setDraft((d) => (d ? { ...d, ...p } : d));
  }

  function save() {
    if (!draft) return;
    dispatch({
      type: "POST_UPDATE",
      payload: {
        id: draft.id,
        patch: {
          slug: draft.slug,
          title: draft.title,
          excerpt: draft.excerpt,
          body: draft.body,
          author: draft.author,
          tags: draft.tags,
          status: draft.status,
        },
      },
    });
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-2">
        <Link
          href={`${ADMIN_BASE}/posts`}
          className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="size-3" /> All posts
        </Link>
        <div className="flex items-center gap-2">
          <Button asChild variant="outline" size="sm" className="gap-1.5">
            <Link href={`${PUBLIC_BASE}/blog/${draft.slug}`} target="_blank">
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
          <Field label="Title">
            <Input value={draft.title} onChange={(e) => patch({ title: e.target.value })} />
          </Field>
          <Field label="Slug" mono>
            <Input
              value={draft.slug}
              onChange={(e) => patch({ slug: e.target.value })}
              className="font-mono text-xs"
            />
          </Field>
          <div className="sm:col-span-2">
            <Field label="Excerpt">
              <Textarea
                value={draft.excerpt}
                onChange={(e) => patch({ excerpt: e.target.value })}
                rows={2}
              />
            </Field>
          </div>
          <div className="sm:col-span-2">
            <Field label="Body (markdown OK)">
              <Textarea
                value={draft.body}
                onChange={(e) => patch({ body: e.target.value })}
                rows={12}
                className="font-mono text-xs"
              />
            </Field>
          </div>
          <Field label="Author">
            <Input value={draft.author} onChange={(e) => patch({ author: e.target.value })} />
          </Field>
          <Field label="Tags (comma-separated)">
            <Input
              value={draft.tags.join(", ")}
              onChange={(e) =>
                patch({ tags: e.target.value.split(",").map((t) => t.trim()).filter(Boolean) })
              }
            />
          </Field>
          <Field label="Status">
            <Select
              value={draft.status ?? "draft"}
              onValueChange={(v: string) => patch({ status: v as BlogPost["status"] })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {STATUSES.map((s) => (
                  <SelectItem key={s} value={s as string}>
                    {s}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </Field>
        </div>
      </div>
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
