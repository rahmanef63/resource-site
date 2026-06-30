"use client";
/* Toolbar for the HTML Studio — title input, view segmented control, visibility
   toggle, new / saved-list / save / copy-link. Presentational: explicit props,
   no hooks. */
import { Save, Copy, Plus, Clock, Code2, Columns2, Eye, Globe, Lock } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cx } from "../lib/util";
import type { View } from "../lib/util";

type ToolbarProps = {
  title: string;
  onTitle: (v: string) => void;
  view: View;
  narrow: boolean;
  onView: (v: View) => void;
  isPrivate: boolean;
  onToggleVisibility: () => void;
  onNewPage: () => void;
  listOpen: boolean;
  rowCount: number;
  onToggleList: () => void;
  onSave: () => void;
  saving: boolean;
  canSave: boolean;
  hasList: boolean;
  onCopyLink: () => void;
  slug: string | null;
};

export function Toolbar(p: ToolbarProps) {
  return (
    <header className="flex shrink-0 flex-wrap items-center gap-1.5 border-b border-border bg-card px-2 py-2">
      <Input
        value={p.title}
        onChange={(e) => p.onTitle(e.target.value)}
        placeholder="Page title"
        className="h-8 min-w-[7rem] flex-1"
      />

      <div className="flex items-center gap-0.5 rounded-md border border-border bg-background p-0.5">
        <SegButton active={p.view === "code"} onClick={() => p.onView("code")} icon={Code2} label="Code" />
        {!p.narrow && <SegButton active={p.view === "split"} onClick={() => p.onView("split")} icon={Columns2} label="Split" />}
        <SegButton active={p.view === "preview"} onClick={() => p.onView("preview")} icon={Eye} label="Preview" />
      </div>

      <Button
        size="sm"
        variant="ghost"
        className="h-8 gap-1.5 px-2"
        onClick={p.onToggleVisibility}
        title={p.isPrivate ? "Private — only you (click to make public)" : "Public — anyone with the link (click to make private)"}
      >
        {p.isPrivate ? <Lock className="size-4" /> : <Globe className="size-4" />}
        <span className="hidden text-xs sm:inline">{p.isPrivate ? "Private" : "Public"}</span>
      </Button>

      <Button size="sm" variant="ghost" className="h-8 px-2" onClick={p.onNewPage} title="New page">
        <Plus className="size-4" />
      </Button>

      {p.hasList && (
        <Button
          size="sm"
          variant="ghost"
          className={cx("h-8 gap-1 px-2", p.listOpen && "bg-muted")}
          onClick={p.onToggleList}
          title="Saved pages"
        >
          <Clock className="size-4" />
          {p.rowCount ? <span className="text-xs">{p.rowCount}</span> : null}
        </Button>
      )}

      {p.canSave && (
        <Button size="sm" className="h-8 gap-1.5" onClick={p.onSave} disabled={p.saving}>
          <Save className="size-4" /> {p.saving ? "…" : "Save"}
        </Button>
      )}

      <Button size="icon" variant="outline" className="size-8" title="Copy link" onClick={p.onCopyLink} disabled={!p.slug}>
        <Copy className="size-4" />
      </Button>
    </header>
  );
}

export function SegButton({ active, onClick, icon: Icon, label }: { active: boolean; onClick: () => void; icon: LucideIcon; label: string }) {
  return (
    <Button
      type="button"
      size="sm"
      variant={active ? "default" : "ghost"}
      onClick={onClick}
      title={label}
      className="h-7 gap-1 px-2 text-xs"
    >
      <Icon className="size-3.5" />
      <span className="hidden sm:inline">{label}</span>
    </Button>
  );
}
