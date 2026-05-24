"use client";

import * as React from "react";
import { Sparkles, Trash2, X } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

const HERO_EMOJIS = ["🧭", "📐", "⚡️", "🎛️", "🚀", "🛠️", "📊", "🎯", "✨", "📓", "💡", "🔬"];
const TAG_SUGGESTIONS = ["case-study", "essay", "field-notes", "studio-ops", "process", "B2B", "outcomes", "workshop", "AI", "design-system"];

export function JournalEditorSidebar({
  status, setStatus,
  category, setCategory,
  heroEmoji, setHeroEmoji,
  tags, setTags,
  featured, setFeatured,
  hasExisting, onDelete, onAiOutline,
}: {
  status: "draft" | "published";
  setStatus: (s: "draft" | "published") => void;
  category: "case-study" | "essay" | "field-notes";
  setCategory: (c: "case-study" | "essay" | "field-notes") => void;
  heroEmoji: string;
  setHeroEmoji: (e: string) => void;
  tags: string[];
  setTags: (t: string[]) => void;
  featured: boolean;
  setFeatured: (b: boolean) => void;
  hasExisting: boolean;
  onDelete: () => void;
  onAiOutline: () => void;
}) {
  const [tagDraft, setTagDraft] = React.useState("");

  const addTag = (t: string) => {
    const clean = t.trim().toLowerCase();
    if (!clean || tags.includes(clean)) return;
    setTags([...tags, clean]);
    setTagDraft("");
  };

  return (
    <Card className="border-border/60 bg-card/60">
      <CardContent className="space-y-5 p-5 text-sm">
        <div className="space-y-2">
          <p className="text-xs uppercase tracking-wider text-muted-foreground">Status</p>
          <div className="flex gap-1.5">
            {(["draft", "published"] as const).map((s) => (
              <Button
                key={s}
                variant={status === s ? "secondary" : "outline"}
                size="sm"
                onClick={() => setStatus(s)}
                className="h-7 flex-1 rounded-full px-3 text-[11px] uppercase tracking-wider"
              >
                {s}
              </Button>
            ))}
          </div>
        </div>

        <div className="space-y-2">
          <p className="text-xs uppercase tracking-wider text-muted-foreground">Category</p>
          <div className="flex flex-wrap gap-1.5">
            {(["case-study", "essay", "field-notes"] as const).map((c) => (
              <Button
                key={c}
                variant={category === c ? "secondary" : "outline"}
                size="sm"
                onClick={() => setCategory(c)}
                className="h-7 rounded-full px-3 text-[11px] uppercase tracking-wider"
              >
                {c}
              </Button>
            ))}
          </div>
        </div>

        <div className="space-y-2">
          <p className="text-xs uppercase tracking-wider text-muted-foreground">Hero emoji</p>
          <div className="grid grid-cols-6 gap-1.5">
            {HERO_EMOJIS.map((e) => (
              <Button
                key={e}
                variant={heroEmoji === e ? "secondary" : "outline"}
                size="sm"
                onClick={() => setHeroEmoji(e)}
                className="h-9 rounded-md p-0 text-lg"
              >
                {e}
              </Button>
            ))}
          </div>
        </div>

        <div className="space-y-2">
          <p className="text-xs uppercase tracking-wider text-muted-foreground">Tags</p>
          <div className="flex flex-wrap gap-1.5">
            {tags.map((t) => (
              <Badge key={t} variant="secondary" className="gap-1 rounded-full pl-2 pr-1 text-[10px]">
                {t}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setTags(tags.filter((x) => x !== t))}
                  className="h-4 w-4 rounded-full p-0 hover:bg-background/40"
                >
                  <X className="size-3" />
                </Button>
              </Badge>
            ))}
          </div>
          <div className="flex gap-1.5">
            <Input
              value={tagDraft}
              onChange={(e) => setTagDraft(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addTag(tagDraft))}
              placeholder="Add tag…"
              className="h-7 text-xs"
            />
          </div>
          <div className="flex flex-wrap gap-1">
            {TAG_SUGGESTIONS.filter((s) => !tags.includes(s)).slice(0, 6).map((s) => (
              <Button
                key={s}
                variant="outline"
                size="sm"
                onClick={() => addTag(s)}
                className="h-6 rounded-full px-2 text-[10px] text-muted-foreground"
              >
                + {s}
              </Button>
            ))}
          </div>
        </div>

        <div className="flex items-center justify-between rounded-md border border-border/60 bg-muted/30 px-3 py-2">
          <span className="text-xs">Featured on homepage</span>
          <Button
            size="sm"
            variant={featured ? "secondary" : "outline"}
            onClick={() => setFeatured(!featured)}
            className="h-7 rounded-full px-3 text-[10px] uppercase tracking-wider"
          >
            {featured ? "on" : "off"}
          </Button>
        </div>

        <div className="space-y-1.5">
          <Button size="sm" variant="outline" onClick={onAiOutline} className="w-full gap-1.5">
            <Sparkles className="size-3.5" /> AI outline
          </Button>
          {hasExisting && (
            <Button size="sm" variant="ghost" onClick={onDelete} className="w-full gap-1.5 text-rose-400 hover:text-rose-300">
              <Trash2 className="size-3.5" /> Delete article
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
