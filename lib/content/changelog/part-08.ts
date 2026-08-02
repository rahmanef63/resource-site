import type { ChangelogEntry } from "@/features/changelog-feed";

export const entries: ChangelogEntry[] = [
  {
    "id": "BK",
    "version": "BK-wave",
    "date": 1779235200000,
    "kind": "feature",
    "title": "Unified PageSectionsEditor (custom pages share landing's section editor) + feature manifest 98% coverage",
    "body": "Re-commit of BI files that didn't land (earlier BI commit cf18fc187 was empty after a parallel agent's interleaved commit reset the working tree). (1) Custom pages and landing share the SAME composition primitive (LandingSection). New PageSectionsEditor renders row-per-section + click-to-open CrudRowDialog. PageEditorView uses it when page.sections is defined OR legacy blocks[] empty; PageEditorBlocks kept for system pages with seeded blocks. Pages reducer learns PAGE_SECTION_UPSERT + PAGE_SECTION_DELETE with auto-shift order algorithm (siblings rebase so chosen position is unique). All 8 PagesAdapters dispatch the new actions. (2) Feature manifest backfilled — 10 slices added (ai-agents, ai-chat, ai-studio, code-block, database-cell-selection, equation, icon-picker, notifications, notion-blocks, notion-shell) + 4 updated (pages, admin-panel, event-tracking, rbac-roles), coverage 77.6% → 98.0% (48/49). scripts/audit-feature-manifest.mjs NEW. Only outlier _templates intentionally skipped (scaffolding, not a functional slice).",
    "groups": [
      {
        "heading": "_shared/pages (NEW components)",
        "bullets": [
          {
            "text": "PageSectionsEditor.tsx — row-per-section + click-to-open dialog; same LandingSection schema as landing surface",
            "slug": "pages",
            "kind": "slice"
          },
          {
            "text": "page-editor-helpers.tsx — extracted Field / PageNotFound / SystemPageNotice (200-LOC cap)",
            "slug": "pages",
            "kind": "slice"
          }
        ]
      },
      {
        "heading": "_shared/pages (extended)",
        "bullets": [
          {
            "text": "types.ts — PageEntry.isLanding + sections forward-compat; PagesAction adds PAGE_SECTION_UPSERT + PAGE_SECTION_DELETE",
            "slug": "pages",
            "kind": "slice"
          },
          {
            "text": "reducer.ts — section CRUD with auto-shift order (upsertWithAutoShift helper)",
            "slug": "pages",
            "kind": "slice"
          },
          {
            "text": "pages-context.tsx — PagesStore adds upsertSection + removeSection callbacks",
            "slug": "pages",
            "kind": "slice"
          },
          {
            "text": "PageEditorView.tsx — renders PageSectionsEditor when page.sections defined OR legacy blocks empty",
            "slug": "pages",
            "kind": "slice"
          },
          {
            "text": "_shared/crud/CrudListView.tsx — editPath now optional (dialog-only flow)",
            "slug": "pages",
            "kind": "slice"
          }
        ]
      },
      {
        "heading": "Templates touched — all 8 PagesAdapter",
        "bullets": [
          {
            "text": "store.tsx — upsertSection + removeSection wired; PAGE_SECTION_UPSERT + PAGE_SECTION_DELETE case labels added",
            "slug": "agency-studio-os",
            "kind": "template"
          },
          {
            "text": "store.tsx — same wiring",
            "slug": "konsultan-os",
            "kind": "template"
          },
          {
            "text": "store.tsx — same wiring",
            "slug": "kreator-studio-os",
            "kind": "template"
          },
          {
            "text": "store.tsx — same wiring (reducer split into store-reducer.ts)",
            "slug": "personal-brand-os",
            "kind": "template"
          },
          {
            "text": "store.tsx — same wiring",
            "slug": "research-os",
            "kind": "template"
          },
          {
            "text": "store.tsx — same wiring",
            "slug": "saas-marketing-os",
            "kind": "template"
          },
          {
            "text": "store.tsx — same wiring",
            "slug": "wirausaha-os",
            "kind": "template"
          },
          {
            "text": "store.tsx — same wiring",
            "slug": "notion-page-clone-os",
            "kind": "template"
          }
        ]
      },
      {
        "heading": "Feature manifest (10 new config.ts)",
        "bullets": [
          "ai-agents, ai-chat, ai-studio — AI surfaces",
          "code-block, equation, notion-blocks — block primitives",
          "database-cell-selection — table cell selection",
          "icon-picker, notifications — UI utilities",
          "notion-shell — outer Notion-clone surface"
        ]
      },
      {
        "heading": "Feature manifest (4 updated to use defineFeature helper)",
        "bullets": [
          "pages, admin-panel, event-tracking, rbac-roles — canonical shape via lib/shared/features/defineFeature"
        ]
      },
      {
        "heading": "Tooling",
        "bullets": [
          "scripts/audit-feature-manifest.mjs — NEW; reports coverage (currently 98.0% / 48 of 49 slices)"
        ]
      }
    ]
  },
  {
    "id": "BJ",
    "version": "BJ-wave",
    "date": 1779235200000,
    "kind": "feature",
    "title": "notion-shell polish — DnD-kit drag handle, cover image, image/embed renderers, page actions menu",
    "body": "Final wave on the notion-shell Notion-clone surface. (1) SortableBlockList — @dnd-kit/core + sortable + utilities render-prop wrapper for block reorder. Pointer + keyboard sensors; emits (fromIndex, toIndex) via onReorder. (2) NotionBlock gains optional dragHandle slot — caller mounts a grip button wired to SortableBlockList's dragProps; renders next to the hover \"⋯\" actions handle. (3) NotionPage gains optional cover prop — 200px image band above header; X button on hover triggers onCoverRemove. (4) ImageRenderer + EmbedRenderer specialised block renderers — Image: URL + caption + preview, click to edit. Embed: URL detection for YouTube/Vimeo/Loom/Figma/CodePen/Spotify with provider-specific rewrites + sandboxed iframe fallback. (5) PageActionsMenu — header dropdown for page-level actions: add cover, favorite toggle, duplicate, export, move to trash. (6) Template wired — DocView wraps blocks in SortableBlockList + passes a GripVertical drag handle button per block; NotionPage receives doc.cover + actions=<PageActionsMenu>; block-renderers maps image/embed to the new shell renderers; types.ts gains doc.block.reorder + doc.duplicate actions; notion-reducer.ts handles them. (7) Inline slash-key trigger (`/` in block → menu opens at caret) intentionally deferred — current ergonomics ride on InsertBlockButton + hover \"⋯\" menu which already cover the new-block + turn-into flows. Bumps notion-shell to v0.4.0. npm deps added: @dnd-kit/core, @dnd-kit/sortable, @dnd-kit/utilities.",
    "groups": [
      {
        "heading": "notion-shell (NEW components)",
        "bullets": [
          {
            "text": "components/SortableBlockList.tsx — @dnd-kit render-prop wrapper for block reorder",
            "slug": "notion-shell",
            "kind": "slice"
          },
          {
            "text": "components/PageActionsMenu.tsx — header dropdown (add cover / favorite / duplicate / export / trash)",
            "slug": "notion-shell",
            "kind": "slice"
          },
          {
            "text": "components/blocks/ImageRenderer.tsx — URL + caption + preview, click to edit",
            "slug": "notion-shell",
            "kind": "slice"
          },
          {
            "text": "components/blocks/EmbedRenderer.tsx — YouTube/Vimeo/Loom/Figma/CodePen/Spotify auto-detect + iframe fallback",
            "slug": "notion-shell",
            "kind": "slice"
          }
        ]
      },
      {
        "heading": "notion-shell (extended)",
        "bullets": [
          {
            "text": "components/NotionPage.tsx — optional `cover` prop (200px image band w/ hover X button via onCoverRemove)",
            "slug": "notion-shell",
            "kind": "slice"
          },
          {
            "text": "components/NotionBlock.tsx — optional `dragHandle` slot prop, mounts next to actions handle",
            "slug": "notion-shell",
            "kind": "slice"
          },
          {
            "text": "types.ts — Page gains optional `cover` field",
            "slug": "notion-shell",
            "kind": "slice"
          },
          {
            "text": "index.ts + slice.contract + slice.json + slice.manifest — bump v0.4.0; export 4 new components + 3 new types; @dnd-kit npm deps declared",
            "slug": "notion-shell",
            "kind": "slice"
          }
        ]
      },
      {
        "heading": "Template touched — notion-page-clone-os",
        "bullets": [
          {
            "text": "slices/notion-app/DocView.tsx — SortableBlockList + per-block GripVertical drag handle; PageActionsMenu in header; cover prompt + remove",
            "slug": "notion-page-clone-os",
            "kind": "template"
          },
          {
            "text": "slices/notion-app/block-renderers.tsx — image + embed renderers mapped to ImageRenderer + EmbedRenderer",
            "slug": "notion-page-clone-os",
            "kind": "template"
          },
          {
            "text": "shared/types.ts — Action gains doc.block.reorder + doc.duplicate variants",
            "slug": "notion-page-clone-os",
            "kind": "template"
          },
          {
            "text": "shared/notion-reducer.ts — reorder splice + duplicate (clone w/ fresh ids)",
            "slug": "notion-page-clone-os",
            "kind": "template"
          }
        ]
      },
      {
        "heading": "npm deps",
        "bullets": [
          "@dnd-kit/core, @dnd-kit/sortable, @dnd-kit/utilities — sortable block list, pointer + keyboard sensors"
        ]
      },
      {
        "heading": "Catalog",
        "bullets": [
          "lib/content/slices.ts — notion-shell v0.4.0 description + tags (drag/cover/embed)",
          "lib/content/layouts.ts — notion-page-clone-os deps + shadcnComponents already cover dnd-kit usage"
        ]
      },
      {
        "heading": "Notion-clone parity status (post-BJ)",
        "bullets": [
          "Page editor: slash menu ✓ · actions menu (turn-into/duplicate/delete) ✓ · inline-markdown decorator ✓ · drag-handle reorder ✓ · cover image ✓ · page actions ✓",
          "Database: 6 views (Table/Board/List/Gallery/Calendar/Feed) ✓ · sort/filter/search ✓ · column header menu ✓ · 10 property cells ✓",
          "Block renderers: equation ✓ · code ✓ · divider ✓ · toggle ✓ · callout ✓ · image ✓ · embed ✓",
          "Deferred (next): inline `/` slash-key trigger in caret-position popover, drag-fill selection grid, comments/mentions/snapshots (covered by separate slices in nosion — lift if needed)"
        ]
      }
    ]
  }
];
