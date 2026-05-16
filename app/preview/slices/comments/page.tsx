"use client";

import * as React from "react";
import { MessageSquare, MoreHorizontal, CornerDownRight, Check } from "lucide-react";

const COMMENTS = [
  {
    id: "c1", author: "Alice", initials: "A", color: "from-violet-500 to-fuchsia-500",
    text: "Should we split this section out? It's reading long.", ts: "2h ago",
    replies: [
      { id: "r1", author: "Bob", initials: "B", color: "from-sky-500 to-emerald-500", text: "Agree — let's pull it into its own page.", ts: "1h ago" },
      { id: "r2", author: "Carol", initials: "C", color: "from-amber-500 to-rose-500", text: "Could just hide behind a disclosure too.", ts: "55m ago" },
    ],
  },
  { id: "c2", author: "Bob", initials: "B", color: "from-sky-500 to-emerald-500", text: "Typo in the heading — \"protable\" should be portable.", ts: "30m ago", resolved: true, replies: [] },
  { id: "c3", author: "Carol", initials: "C", color: "from-amber-500 to-rose-500", text: "Love the new diagram. Could we add caption text for screen readers?", ts: "8m ago", replies: [] },
];

function Avatar({ initials, color, size = "size-7" }: { initials: string; color: string; size?: string }) {
  return <div className={`${size} grid place-items-center rounded-full bg-gradient-to-br ${color} text-[10px] font-bold text-white`}>{initials}</div>;
}

export default function Page() {
  return (
    <main className="min-h-screen bg-background p-8">
      <header className="mb-6 flex items-center gap-3">
        <div className="grid size-10 place-items-center rounded-lg bg-primary/10"><MessageSquare className="size-5 text-primary" /></div>
        <div>
          <h1 className="text-xl font-bold">Comments</h1>
          <p className="text-xs text-muted-foreground">Polymorphic target. Threaded replies. Renderless adapter API.</p>
        </div>
      </header>
      <div className="mx-auto max-w-2xl space-y-4">
        {COMMENTS.map((c) => (
          <article key={c.id} className={`rounded-2xl border bg-card p-5 ${c.resolved ? "opacity-60" : ""}`}>
            <div className="flex items-start gap-3">
              <Avatar initials={c.initials} color={c.color} />
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-semibold">{c.author}</span>
                  <span className="text-[10px] text-muted-foreground">·{c.ts}</span>
                  {c.resolved && <span className="ml-auto inline-flex items-center gap-1 rounded-full bg-emerald-500/10 px-2 py-0.5 text-[10px] font-medium text-emerald-600 dark:text-emerald-400"><Check className="size-3" /> Resolved</span>}
                  {!c.resolved && <button className="ml-auto text-muted-foreground hover:text-foreground"><MoreHorizontal className="size-3.5" /></button>}
                </div>
                <p className="mt-1.5 text-sm text-foreground">{c.text}</p>
                {c.replies && c.replies.length > 0 && (
                  <div className="mt-4 space-y-3 border-l-2 border-border/40 pl-4">
                    {c.replies.map((r) => (
                      <div key={r.id} className="flex items-start gap-2">
                        <CornerDownRight className="mt-1 size-3 shrink-0 text-muted-foreground/60" />
                        <Avatar initials={r.initials} color={r.color} size="size-6" />
                        <div className="min-w-0 flex-1">
                          <div className="text-xs"><span className="font-semibold">{r.author}</span> <span className="text-muted-foreground">·{r.ts}</span></div>
                          <p className="text-xs">{r.text}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
                {!c.resolved && (
                  <div className="mt-4 flex items-center gap-3 text-xs">
                    <button className="text-muted-foreground hover:text-foreground">Reply</button>
                    <button className="text-muted-foreground hover:text-foreground">Resolve</button>
                  </div>
                )}
              </div>
            </div>
          </article>
        ))}
      </div>
    </main>
  );
}
