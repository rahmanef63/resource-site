"use client";

import * as React from "react";
import { CrudListView } from "@/components/templates/_shared/crud/CrudListView";
import type {
  ColumnDef,
  EntityMeta,
} from "@/components/templates/_shared/crud/types";
import { fmtDate } from "../../../shared/store";
import { ADMIN_BASE, PUBLIC_BASE } from "../../../shared/nav-config";
import type { BlogPost } from "../../../shared/types";
import { FIELDS, usePostsController } from "./PostEditorView";

const META: EntityMeta = {
  label: "Post",
  labelPlural: "Posts",
  publicHref: (row) => `${PUBLIC_BASE}/blog/${(row as BlogPost).slug}`,
};

const COLUMNS: ColumnDef<BlogPost>[] = [
  { key: "title", header: "Title" },
  { key: "author", header: "Author", width: "w-[16%]", hideOnMobile: true },
  { key: "status", header: "Status", width: "w-[10%]", badge: "secondary" },
  {
    key: "publishedAt",
    header: "Published",
    width: "w-[14%]",
    hideOnMobile: true,
    render: (v) => fmtDate(Number(v)),
  },
];

export function PostsView() {
  const controller = usePostsController();
  const drafts = controller.items.filter((p) => p.status === "draft").length;
  return (
    <CrudListView
      meta={META}
      controller={controller}
      columns={COLUMNS}
      fields={FIELDS}
      editPath={(id) => `${ADMIN_BASE}/posts/${id}`}
      description={`${drafts} draft`}
    />
  );
}
