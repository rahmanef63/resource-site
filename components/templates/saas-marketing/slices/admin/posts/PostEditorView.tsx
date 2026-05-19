"use client";

import * as React from "react";
import { CrudFormView } from "@/components/templates/_shared/crud/CrudFormView";
import type {
  CrudController,
  EntityMeta,
  FieldDef,
} from "@/components/templates/_shared/crud/types";
import { useStore } from "../../../shared/store";
import { ADMIN_BASE, PUBLIC_BASE } from "../../../shared/nav-config";
import type { BlogPost } from "../../../shared/types";

const META: EntityMeta = {
  label: "Post",
  labelPlural: "Posts",
  publicHref: (row) => `${PUBLIC_BASE}/blog/${(row as BlogPost).slug}`,
};

export const FIELDS: FieldDef<BlogPost>[] = [
  { kind: "text", key: "title", label: "Title" },
  { kind: "text", key: "slug", label: "Slug", mono: true },
  { kind: "textarea", key: "excerpt", label: "Excerpt", rows: 2 },
  { kind: "textarea", key: "body", label: "Body (markdown OK)", rows: 12 },
  { kind: "text", key: "author", label: "Author" },
  { kind: "tags", key: "tags", label: "Tags (comma-separated)" },
  {
    kind: "select",
    key: "status",
    label: "Status",
    options: [
      { value: "draft", label: "draft" },
      { value: "scheduled", label: "scheduled" },
      { value: "published", label: "published" },
    ],
  },
];

export function usePostsController(): CrudController<BlogPost> {
  const { state, dispatch } = useStore();
  return React.useMemo(
    () => ({
      items: state.posts,
      getId: (p) => p.id,
      blank: () => ({
        id: `post-${Math.random().toString(36).slice(2, 10)}`,
        slug: `untitled-${Date.now().toString(36)}`,
        title: "Untitled",
        excerpt: "",
        body: "",
        author: "Maya K.",
        publishedAt: Date.now(),
        tags: [],
        status: "draft",
      }),
      create: (post) => dispatch({ type: "POST_CREATE", payload: post }),
      update: (id, patch) =>
        dispatch({
          type: "POST_UPDATE",
          payload: {
            id,
            patch: {
              slug: patch.slug,
              title: patch.title,
              excerpt: patch.excerpt,
              body: patch.body,
              author: patch.author,
              tags: patch.tags,
              status: patch.status,
            },
          },
        }),
      remove: (id) => dispatch({ type: "POST_DELETE", payload: { id } }),
    }),
    [state.posts, dispatch],
  );
}

export function PostEditorView({ id }: { id: string }) {
  const controller = usePostsController();
  return (
    <CrudFormView
      id={id}
      meta={META}
      controller={controller}
      fields={FIELDS}
      backHref={`${ADMIN_BASE}/posts`}
    />
  );
}
