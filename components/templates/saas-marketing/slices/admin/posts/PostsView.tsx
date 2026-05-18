"use client";

import * as React from "react";
import Link from "next/link";
import { ExternalLink, Pencil, Plus, Trash2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { fmtDate, useStore } from "../../../shared/store";
import { ADMIN_BASE, PUBLIC_BASE } from "../../../shared/nav-config";
import type { BlogPost } from "../../../shared/types";

function blankPost(): BlogPost {
  const id = `post-${Math.random().toString(36).slice(2, 10)}`;
  return {
    id,
    slug: `untitled-${Date.now().toString(36)}`,
    title: "Untitled",
    excerpt: "",
    body: "",
    author: "Maya K.",
    publishedAt: Date.now(),
    tags: [],
    status: "draft",
  };
}

export function PostsView() {
  const { state, dispatch } = useStore();
  const drafts = state.posts.filter((p) => p.status === "draft").length;

  function createPost() {
    const post = blankPost();
    dispatch({ type: "POST_CREATE", payload: post });
    if (typeof window !== "undefined") {
      window.location.href = `${ADMIN_BASE}/posts/${post.id}`;
    }
  }

  function deletePost(id: string, title: string) {
    if (confirm(`Delete "${title}"?`)) {
      dispatch({ type: "POST_DELETE", payload: { id } });
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-2">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Posts</h1>
          <p className="text-xs text-muted-foreground">
            {state.posts.length} total · {drafts} draft
          </p>
        </div>
        <Button size="sm" className="gap-1.5" onClick={createPost}>
          <Plus className="size-3.5" /> New post
        </Button>
      </div>

      <div className="overflow-x-auto rounded-lg border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Title</TableHead>
              <TableHead className="w-[16%]">Author</TableHead>
              <TableHead className="w-[10%]">Status</TableHead>
              <TableHead className="w-[14%]">Published</TableHead>
              <TableHead className="w-[14%] text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {state.posts.map((p) => (
              <TableRow key={p.id}>
                <TableCell className="text-xs">
                  <div className="line-clamp-1 font-medium">{p.title}</div>
                  <div className="line-clamp-1 text-muted-foreground">{p.excerpt}</div>
                </TableCell>
                <TableCell className="text-xs text-muted-foreground">{p.author}</TableCell>
                <TableCell>
                  <Badge
                    variant={p.status === "draft" ? "secondary" : "outline"}
                    className="text-[10px]"
                  >
                    {p.status ?? "published"}
                  </Badge>
                </TableCell>
                <TableCell className="text-xs text-muted-foreground tabular-nums">
                  {fmtDate(p.publishedAt)}
                </TableCell>
                <TableCell>
                  <div className="flex items-center justify-end gap-1">
                    <Button
                      asChild
                      size="icon"
                      variant="ghost"
                      className="size-7"
                      title="View public"
                    >
                      <Link href={`${PUBLIC_BASE}/blog/${p.slug}`} target="_blank">
                        <ExternalLink className="size-3.5" />
                      </Link>
                    </Button>
                    <Button asChild size="icon" variant="ghost" className="size-7" title="Edit">
                      <Link href={`${ADMIN_BASE}/posts/${p.id}`}>
                        <Pencil className="size-3.5" />
                      </Link>
                    </Button>
                    <Button
                      size="icon"
                      variant="ghost"
                      className="size-7 text-destructive hover:text-destructive"
                      title="Delete"
                      onClick={() => deletePost(p.id, p.title)}
                    >
                      <Trash2 className="size-3.5" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
            {state.posts.length === 0 && (
              <TableRow>
                <TableCell colSpan={5} className="py-8 text-center text-xs text-muted-foreground">
                  No posts yet. Click <span className="font-medium">New post</span>.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
