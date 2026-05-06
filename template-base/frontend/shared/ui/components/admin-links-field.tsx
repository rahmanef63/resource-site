"use client";

import * as React from "react";
import { ArrowDown, ArrowUp, ExternalLink, Link as LinkIcon, Plus, X } from "lucide-react";
import { cn } from "@/shared/lib/cn";

export type AdminLinkItem = { label: string; url: string };

type Props = {
  value: AdminLinkItem[] | undefined | null;
  onChange: (next: AdminLinkItem[]) => void;
  className?: string;
};

/**
 * List-of-links editor for AdminCrud. Each row is { label, url }.
 * Add / remove / reorder. URL validation is inline (not blocking save
 * — AdminCrud can validate at coerce time if strict).
 */
export function AdminLinksField({ value, onChange, className }: Props) {
  const items = value ?? [];

  const updateAt = (i: number, patch: Partial<AdminLinkItem>) => {
    const next = items.map((it, idx) => (idx === i ? { ...it, ...patch } : it));
    onChange(next);
  };

  const removeAt = (i: number) => {
    onChange(items.filter((_, idx) => idx !== i));
  };

  const move = (i: number, direction: -1 | 1) => {
    const next = items.slice();
    const target = i + direction;
    if (target < 0 || target >= next.length) return;
    [next[i], next[target]] = [next[target], next[i]];
    onChange(next);
  };

  const add = () => {
    onChange([...items, { label: "", url: "" }]);
  };

  return (
    <div className={cn("space-y-2", className)}>
      {items.length === 0 ? (
        <div className="flex items-center gap-2 border-2 border-dashed border-foreground/60 rounded-md bg-background px-3 py-4 text-xs uppercase tracking-brutal-sm text-muted-foreground">
          <LinkIcon className="size-3.5" />
          Belum ada tautan
        </div>
      ) : (
        <ul className="space-y-2">
          {items.map((it, i) => {
            const urlLooksValid = /^https?:\/\//.test(it.url) || it.url.startsWith("/");
            const canOpen = urlLooksValid && it.url.length > 0;
            return (
              <li
                key={i}
                className="flex flex-col sm:flex-row gap-2 border-2 border-foreground rounded-md bg-card p-2"
              >
                <input
                  type="text"
                  value={it.label}
                  onChange={(e) => updateAt(i, { label: e.target.value })}
                  placeholder="Label (mis. Lihat situs)"
                  className="sm:flex-[1] border-2 border-foreground rounded-md bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
                />
                <input
                  type="url"
                  value={it.url}
                  onChange={(e) => updateAt(i, { url: e.target.value })}
                  placeholder="https://…"
                  className={cn(
                    "sm:flex-[2] border-2 rounded-md bg-background px-3 py-2 text-sm font-mono focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background",
                    urlLooksValid || it.url.length === 0
                      ? "border-foreground"
                      : "border-destructive",
                  )}
                />
                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => move(i, -1)}
                    disabled={i === 0}
                    title="Naik"
                    className="inline-flex items-center justify-center size-8 border-2 border-foreground rounded-md hover:bg-foreground hover:text-background transition-colors disabled:opacity-40 disabled:pointer-events-none"
                  >
                    <ArrowUp className="size-3" />
                  </button>
                  <button
                    type="button"
                    onClick={() => move(i, 1)}
                    disabled={i === items.length - 1}
                    title="Turun"
                    className="inline-flex items-center justify-center size-8 border-2 border-foreground rounded-md hover:bg-foreground hover:text-background transition-colors disabled:opacity-40 disabled:pointer-events-none"
                  >
                    <ArrowDown className="size-3" />
                  </button>
                  {canOpen && (
                    <a
                      href={it.url}
                      target="_blank"
                      rel="noreferrer noopener"
                      title="Buka di tab baru"
                      className="inline-flex items-center justify-center size-8 border-2 border-foreground rounded-md hover:bg-foreground hover:text-background transition-colors"
                    >
                      <ExternalLink className="size-3" />
                    </a>
                  )}
                  <button
                    type="button"
                    onClick={() => removeAt(i)}
                    title="Hapus"
                    className="inline-flex items-center justify-center size-8 border-2 border-destructive text-destructive rounded-md hover:bg-destructive hover:text-destructive-foreground transition-colors"
                  >
                    <X className="size-3" />
                  </button>
                </div>
              </li>
            );
          })}
        </ul>
      )}

      <button
        type="button"
        onClick={add}
        className="inline-flex items-center gap-2 border-2 border-foreground rounded-md bg-background px-3 py-2 text-[11px] uppercase tracking-brutal-sm font-medium hover:bg-foreground hover:text-background transition-colors"
      >
        <Plus className="size-3.5" />
        Tambah tautan
      </button>
    </div>
  );
}
