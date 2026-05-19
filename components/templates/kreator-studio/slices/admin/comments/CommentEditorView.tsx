"use client";

import * as React from "react";
import { CrudFormView } from "@/components/templates/_shared/crud/CrudFormView";
import type { CrudController, EntityMeta, FieldDef } from "@/components/templates/_shared/crud/types";
import { useStore } from "../../../shared/store";
import { ADMIN_BASE } from "../../../shared/nav-config";
import type { CommentDraft } from "../../../shared/types";

const META: EntityMeta = { label: "Comment", labelPlural: "Comment Drafts" };

export const FIELDS: FieldDef<CommentDraft>[] = [
  {
    kind: "select",
    key: "channel",
    label: "Channel",
    options: [
      { value: "instagram", label: "Instagram" },
      { value: "tiktok", label: "TikTok" },
      { value: "youtube", label: "YouTube" },
      { value: "twitter", label: "Twitter" },
      { value: "newsletter", label: "Newsletter" },
      { value: "linkedin", label: "LinkedIn" },
    ],
  },
  { kind: "text", key: "postRef", label: "Post reference", placeholder: "@user / post URL" },
  { kind: "textarea", key: "comment", label: "Comment from audience", rows: 3 },
  { kind: "textarea", key: "reply", label: "Draft reply", rows: 4 },
  {
    kind: "select",
    key: "status",
    label: "Status",
    options: [
      { value: "draft", label: "Draft" },
      { value: "sent", label: "Sent" },
    ],
  },
  { kind: "date", key: "ts", label: "Timestamp" },
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

export function CommentEditorView({ id }: { id: string }) {
  const controller = useCommentsController();
  return (
    <CrudFormView
      id={id}
      meta={META}
      controller={controller}
      fields={FIELDS}
      backHref={`${ADMIN_BASE}/comments`}
    />
  );
}
