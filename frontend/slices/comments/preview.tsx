"use client";
/** Variant preview (VP wave) — rr-internal, stripped on `rr add`. */
import * as React from "react";
import type { SlicePreviewModule } from "@/shared/preview/types";
import { createDemoStore } from "@/shared/preview/demo-store";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { CommentsThread } from "./components/CommentsThread";
import type { CommentsBindings } from "./hooks/useComments";
import type { CommentNode } from "./lib/buildThread";
import type { Comment, TargetRef } from "./types";

const TARGET: TargetRef = { kind: "page", id: "demo" };
const now = () => Date.now();

const SEED: { items: Comment[] } = {
  items: [
    { id: "c1", target: TARGET, text: "Ship the slice this week?", authorName: "Mara", authorIcon: "🦊", resolved: false, createdAt: 1, updatedAt: 1 },
    { id: "c2", target: TARGET, text: "Yes — adapters are wired.", authorName: "Ravi", authorIcon: "🐧", resolved: false, createdAt: 2, updatedAt: 2, parentId: "c1" },
    { id: "c3", target: TARGET, text: "Old typo, fixed.", authorName: "Mara", authorIcon: "🦊", resolved: true, createdAt: 3, updatedAt: 3 },
  ],
};

const { useDemoStore } = createDemoStore({ slug: "comments", seed: SEED });

function Node({ node, density }: { node: CommentNode; density: "comfortable" | "compact" }) {
  return (
    <div className={cn("border-l-2 border-border pl-3", density === "compact" ? "py-1" : "py-2")}>
      <div className="flex items-baseline gap-2">
        <span>{node.authorIcon}</span>
        <span className="text-sm font-medium">{node.authorName}</span>
        {node.resolved ? <span className="text-[10px] uppercase tracking-wide text-muted-foreground">resolved</span> : null}
      </div>
      <p className="text-sm text-muted-foreground">{node.text}</p>
      {node.replies.length ? (
        <div className={cn("mt-1 space-y-1", density === "compact" ? "ml-2" : "ml-4")}>
          {node.replies.map((r) => <Node key={r.id} node={r} density={density} />)}
        </div>
      ) : null}
    </div>
  );
}

const preview: SlicePreviewModule = {
  CommentsThread: ({ variant }) => {
    const [state, setState, { ready }] = useDemoStore();
    const [draft, setDraft] = React.useState("");
    const density = (variant.density as "comfortable" | "compact") ?? "comfortable";
    const showResolved = (variant.resolved ?? "show") !== "hide";

    const bindings = React.useMemo<CommentsBindings>(() => ({
      list: () => state.items.filter((c) => showResolved || !c.resolved),
      create: ({ text, parentId }) =>
        setState((s) => ({
          items: [...s.items, { id: `c${s.items.length + 1}-${now()}`, target: TARGET, text, authorName: "You", authorIcon: "🐙", resolved: false, createdAt: now(), updatedAt: now(), ...(parentId ? { parentId } : {}) }],
        })),
      update: () => {},
      resolve: () => {},
      remove: () => {},
    }), [state.items, showResolved, setState]);

    if (!ready) return null;
    return (
      <div className="p-4">
        <CommentsThread target={TARGET} bindings={bindings}>
          {({ tree, openCount, create }) => (
            <div className={cn(density === "compact" ? "space-y-1" : "space-y-2")}>
              <div className="text-xs text-muted-foreground">{openCount} open</div>
              {tree.map((n) => <Node key={n.id} node={n} density={density} />)}
              <div className="flex gap-2 pt-2">
                <Textarea value={draft} onChange={(e) => setDraft(e.target.value)} placeholder="Add a reply…" className="min-h-9 text-sm" />
                <Button size="sm" disabled={!draft.trim()} onClick={() => { create({ target: TARGET, text: draft.trim() }); setDraft(""); }}>Post</Button>
              </div>
            </div>
          )}
        </CommentsThread>
      </div>
    );
  },
};
export default preview;
