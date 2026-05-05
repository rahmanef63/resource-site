"use client";

import * as React from "react";
import { Filter } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { toast } from "sonner";
import { rel, useComments, useStore } from "../../../shared/store";
import type { CommentStatus } from "../../../shared/types";

export function CommentsView() {
  const comments = useComments();
  const { dispatch } = useStore();
  const [filter, setFilter] = React.useState<"all" | CommentStatus>("pending");

  const filtered = filter === "all" ? comments : comments.filter((c) => c.status === filter);
  const counts = {
    all: comments.length,
    pending: comments.filter((c) => c.status === "pending").length,
    approved: comments.filter((c) => c.status === "approved").length,
    spam: comments.filter((c) => c.status === "spam").length,
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Comments</h1>
          <p className="text-sm text-muted-foreground">
            {counts.pending} pending · {counts.approved} approved · {counts.spam} spam
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          disabled={counts.spam === 0}
          onClick={() => {
            comments.filter((c) => c.status === "spam").forEach((c) => {
              dispatch({ type: "comment.moderate", id: c.id, status: "spam" });
            });
            toast.success("Spam dibersihkan");
          }}
        >
          Clear all spam ({counts.spam})
        </Button>
      </div>

      <div className="flex flex-wrap gap-1">
        {(["pending", "approved", "spam", "all"] as const).map((s) => (
          <button
            key={s}
            onClick={() => setFilter(s)}
            className={
              "rounded-full border px-3 py-1 text-xs capitalize transition " +
              (filter === s ? "border-foreground bg-foreground text-background" : "border-border/60 text-muted-foreground hover:bg-accent")
            }
          >
            {s} ({counts[s as keyof typeof counts]})
          </button>
        ))}
        <Filter className="ml-auto size-3.5 self-center text-muted-foreground" />
      </div>

      <Card className="border-border/60">
        <CardContent className="p-0">
          {filtered.length === 0 ? (
            <p className="p-10 text-center text-sm text-muted-foreground">
              Tidak ada komentar di kategori ini. Buka tab Public — buka post detail dan tulis komentar untuk demo.
            </p>
          ) : (
            <ul className="divide-y divide-border/60">
              {filtered.map((c) => (
                <li key={c.id} className="flex flex-wrap items-start gap-3 p-4 md:gap-4">
                  <div className="grid size-8 shrink-0 place-items-center rounded-full bg-muted text-[11px]">
                    {c.author.slice(0, 2).toUpperCase()}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-xs text-muted-foreground">
                      on <span className="text-foreground">{c.postTitle}</span> by <span className="text-foreground">{c.author}</span>
                      <span> · {rel(c.ts)}</span>
                    </p>
                    <p className="mt-1 text-sm">{c.body}</p>
                    {c.aiFlag && (
                      <Badge
                        className={
                          "mt-2 rounded-full text-[10px] " +
                          (c.aiFlag === "spam"
                            ? "bg-rose-500/15 text-rose-300 hover:bg-rose-500/15"
                            : "bg-amber-500/15 text-amber-300 hover:bg-amber-500/15")
                        }
                      >
                        AI flag: {c.aiFlag}
                      </Badge>
                    )}
                  </div>
                  <div className="flex w-full shrink-0 gap-1 sm:w-auto">
                    {c.status !== "approved" && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => dispatch({ type: "comment.moderate", id: c.id, status: "approved" })}
                      >
                        Approve
                      </Button>
                    )}
                    {c.status !== "spam" && (
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => dispatch({ type: "comment.moderate", id: c.id, status: "spam" })}
                      >
                        Spam
                      </Button>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
