# Recipe: comments-threaded

Page + block-level threaded comments with resolved state. Source: notion-page-clone comments.

Already at `template-base/frontend/slices/notion/slices/comments/` + `convex/features/notion/features/comments/`.

## Anchoring

- `pageId` required, `blockId` optional
- Block-level when `blockId` present, page-level otherwise

## Threading

- Top-level comments + replies (one level deep, by design)
- Resolved state for marking threads done
- Real-time via Convex subscriptions

## UI

- `BlockCommentsPopover` opens on click of comment-grip in BlockShell controls
- Counts shown next to grip
- `useComments(blockId)` hook fetches reactive comment list
