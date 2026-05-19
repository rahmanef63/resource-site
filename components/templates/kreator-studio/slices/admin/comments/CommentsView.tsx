"use client";

import * as React from "react";
import { CrudListView } from "@/components/templates/_shared/crud/CrudListView";
import { FIELDS } from "./CommentEditorView";
import type { ColumnDef, CrudController, EntityMeta } from "@/components/templates/_shared/crud/types";
import { useStore } from "../../../shared/store";
import { ADMIN_BASE } from "../../../shared/nav-config";
import type { CommentDraft } from "../../../shared/types";

const META: EntityMeta = { label: "Comment", labelPlural: "Comment Drafts" };

const COLUMNS: ColumnDef<CommentDraft>[] = [
  { key: "comment", header: "Comment", width: "w-[36%]" },
  { key: "reply", header: "Reply draft", width: "w-[30%]" },
  { key: "channel", header: "Channel", width: "w-[10%]", badge: "outline" },
  { key: "status", header: "Status", width: "w-[10%]", badge: "secondary" },
];

function useCommentsController(): CrudController<CommentDraft> {
  const { state, dispatch } = useStore();
  return React.useMemo(
    () => ({
      items: state.commentDrafts,
      getId: (c) => c.id,
      blank: () => ({
        id: `cd-${Math.random().toString(36).slice(2, 10)}`,
        channel: "instagram",
        postRef: "",
        comment: "",
        reply: "",
        status: "draft",
        ts: Date.now(),
      }),
      create: (draft) => dispatch({ type: "comment.upsert", draft }),
      update: (id, patch) => {
        const cur = state.commentDrafts.find((c) => c.id === id);
        if (!cur) return;
        dispatch({ type: "comment.upsert", draft: { ...cur, ...patch, id } });
      },
      remove: (id) => dispatch({ type: "comment.delete", id }),
    }),
    [state.commentDrafts, dispatch],
  );
}

export function CommentsView() {
  const controller = useCommentsController();
  const pending = controller.items.filter((d) => d.status === "draft").length;
  return (
    <CrudListView
      meta={META}
      controller={controller}
      columns={COLUMNS}
      fields={FIELDS}
      editPath={(id) => `${ADMIN_BASE}/comments/${id}`}
      description={`${pending} menunggu kirim`}
    />
  );
}
