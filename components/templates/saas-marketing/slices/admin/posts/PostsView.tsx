"use client";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { fmtDate, useStore } from "../../../shared/store";

export function PostsView() {
  const { state } = useStore();
  const drafts = state.posts.filter((p) => p.status === "draft").length;
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Posts</h1>
        <p className="text-sm text-muted-foreground">{state.posts.length} total · {drafts} draft</p>
      </div>
      <Card className="border-border/60">
        <CardContent className="p-0">
          <ul className="divide-y divide-border/60">
            {state.posts.map((p) => (
              <li key={p.id} className="grid grid-cols-1 gap-1 px-5 py-4 text-sm md:grid-cols-12 md:items-center">
                <div className="md:col-span-6">
                  <p className="truncate font-medium">{p.title}</p>
                  <p className="truncate text-xs text-muted-foreground">{p.excerpt}</p>
                </div>
                <p className="text-muted-foreground md:col-span-2">{p.author}</p>
                <Badge variant={p.status === "draft" ? "secondary" : "outline"} className="w-fit md:col-span-2">{p.status ?? "published"}</Badge>
                <p className="text-xs text-muted-foreground md:col-span-2 md:text-right">{fmtDate(p.publishedAt)}</p>
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}
