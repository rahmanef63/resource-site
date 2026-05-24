"use client";

import * as React from "react";
import { AlertTriangle, Check, MessageSquare, Reply, Trash2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { rel, useStore } from "../../../shared/store";
import type { Comment, CommentStatus } from "../../../shared/types";
import { ReplyDialog } from "./ReplyDialog";

type Filter = "all" | "pending" | "approved" | "spam";

export function CommentsView() {
  const { state, dispatch } = useStore();
  const [filter, setFilter] = React.useState<Filter>("pending");
  const [q, setQ] = React.useState("");
  const [replyTarget, setReplyTarget] = React.useState<Comment | null>(null);

  const counts = React.useMemo(() => ({
    all: state.comments.length,
    pending: state.comments.filter((c) => c.status === "pending").length,
    approved: state.comments.filter((c) => c.status === "approved").length,
    spam: state.comments.filter((c) => c.status === "spam").length,
  }), [state.comments]);

  const filtered = React.useMemo(() => {
    return state.comments.filter((c) => {
      if (filter !== "all" && c.status !== filter) return false;
      if (q && !`${c.body} ${c.author} ${c.postTitle}`.toLowerCase().includes(q.toLowerCase())) return false;
      return true;
    });
  }, [state.comments, filter, q]);

  const moderate = (id: string, status: CommentStatus) => {
    dispatch({ type: "comment.moderate", id, status });
    toast.success(`Comment ${status}`);
  };

  const remove = (c: Comment) => {
    if (!confirm(`Hapus komentar dari ${c.author}?`)) return;
    dispatch({ type: "comment.delete", id: c.id });
    toast.success("Comment dihapus");
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Comments</h1>
          <p className="text-sm text-muted-foreground">
            {counts.pending} pending moderation · {counts.approved} approved · {counts.spam} spam
          </p>
        </div>
        <Input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search body / author / post…"
          className="h-9 w-72"
        />
      </div>

      <div className="flex flex-wrap gap-2">
        {(["pending", "approved", "spam", "all"] as Filter[]).map((f) => (
          <Button
            key={f}
            variant={filter === f ? "secondary" : "outline"}
            size="sm"
            onClick={() => setFilter(f)}
            className="h-7 rounded-full px-3 text-[11px] uppercase tracking-wider"
          >
            {f} ({counts[f]})
          </Button>
        ))}
      </div>

      <Card className="border-border/60">
        <CardContent className="p-0">
          {filtered.length === 0 ? (
            <p className="p-10 text-center text-sm text-muted-foreground">
              Tidak ada komentar yang cocok dengan filter ini.
            </p>
          ) : (
            <ul className="divide-y divide-border/60">
              {filtered.map((c) => (
                <li key={c.id} className="space-y-3 p-5">
                  <div className="flex flex-wrap items-start gap-3">
                    <div className="grid size-9 place-items-center rounded-full bg-muted text-xs font-medium">
                      {c.author.slice(0, 2).toUpperCase()}
                    </div>
                    <div className="min-w-0 flex-1 space-y-1">
                      <p className="flex flex-wrap items-center gap-2 text-sm font-medium">
                        {c.author}
                        <span className="font-mono text-[11px] text-muted-foreground">{c.email}</span>
                        <Badge variant="outline" className="rounded-full text-[10px]">{c.status}</Badge>
                        {c.aiFlag && (
                          <Badge
                            className={
                              "rounded-full text-[10px] " +
                              (c.aiFlag === "spam"
                                ? "bg-amber-500/15 text-amber-300 hover:bg-amber-500/15"
                                : "bg-rose-500/15 text-rose-300 hover:bg-rose-500/15")
                            }
                          >
                            <AlertTriangle className="mr-1 size-3" />
                            AI: {c.aiFlag}
                          </Badge>
                        )}
                      </p>
                      <p className="text-[11px] text-muted-foreground">
                        on <span className="text-foreground/80">{c.postTitle}</span> · {rel(c.ts)}
                      </p>
                      <p className="pt-1 text-sm leading-relaxed text-foreground/90">{c.body}</p>
                    </div>
                  </div>
                  <div className="flex flex-wrap items-center gap-2 pl-12">
                    {c.status !== "approved" && (
                      <Button size="sm" variant="outline" onClick={() => moderate(c.id, "approved")} className="h-7 gap-1">
                        <Check className="size-3.5" /> Approve
                      </Button>
                    )}
                    {c.status !== "spam" && (
                      <Button size="sm" variant="outline" onClick={() => moderate(c.id, "spam")} className="h-7 gap-1">
                        <AlertTriangle className="size-3.5" /> Mark spam
                      </Button>
                    )}
                    <Button size="sm" variant="outline" onClick={() => setReplyTarget(c)} className="h-7 gap-1">
                      <Reply className="size-3.5" /> Reply
                    </Button>
                    <Button size="sm" variant="ghost" onClick={() => remove(c)} className="h-7 gap-1 text-rose-400 hover:text-rose-300">
                      <Trash2 className="size-3.5" /> Delete
                    </Button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>

      <p className="flex items-center gap-1 text-[11px] text-muted-foreground">
        <MessageSquare className="size-3" />
        Replies dikirim via email (mailto preview di sandbox). Wire `convex/features/comments/reply.ts` di production.
      </p>

      <ReplyDialog
        target={replyTarget}
        onClose={() => setReplyTarget(null)}
      />
    </div>
  );
}
