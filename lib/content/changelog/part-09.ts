import type { ChangelogEntry } from "@/features/changelog-feed";

export const entries: ChangelogEntry[] = [
  {
    "id": "BI",
    "version": "BI-wave",
    "date": 1779235200000,
    "kind": "feature",
    "title": "notion-shell database depth — 6 views (Table/Board/List/Gallery/Calendar/Feed) + view tabs + sort/filter/search + column header menu + 10 property cells",
    "body": "notion-shell databases level up from a single-table surface to a 6-view dispatcher matching Notion's view canon. (1) ViewTabs — horizontal tab strip + add-view dropdown (Table/Board/List/Gallery/Calendar/Feed), double-click tab to remove. (2) ViewOptions — popover with sort (multi-prop, asc/desc), filter (contains/equals/empty/checked + 6 ops), search (any-prop substring). (3) ColumnHeaderMenu — per-column dropdown: rename + change type + sort asc/desc + hide + delete. (4) 6 view components — TableView (Notion-canonical), BoardView (kanban grouped by select/status), ListView (compact), GalleryView (3-up card grid), CalendarView (month grid bucketed by date prop), FeedView (chronological by updatedAt). All views share the ViewProps contract; host can override via VIEW_REGISTRY. (5) property-cells.tsx — 10 cell renderers extracted into a single switch helper: text/number/checkbox/select/status/multi_select/date/url/email/phone. NotionProperty delegates rendering to it. (6) lib/viewData.ts — pure applyView() (filter + sort + search), groupBy() (board), bucketByDate() (calendar). (7) NotionDatabase rewritten as orchestrator — owns header + ViewTabs + ViewOptions + ColumnHeaderMenu wiring; dispatches the active view via VIEW_REGISTRY. (8) Template wired — DatabaseView passes the 4 new onView* callbacks; seed.ts gains 3 default views on the Roadmap DB (All table / Board / Feed); reducer gains db.view.activate/add/remove/config split into notion-db-reducer.ts to stay under the 200-LOC cap. Bumps notion-shell to v0.3.0.",
    "groups": [
      {
        "heading": "notion-shell (NEW components)",
        "bullets": [
          {
            "text": "components/ViewTabs.tsx — horizontal tab strip + add-view dropdown",
            "slug": "notion-shell",
            "kind": "slice"
          },
          {
            "text": "components/ViewOptions.tsx — sort + filter + search popover",
            "slug": "notion-shell",
            "kind": "slice"
          },
          {
            "text": "components/ColumnHeaderMenu.tsx — per-column dropdown (rename/type/sort/hide/delete)",
            "slug": "notion-shell",
            "kind": "slice"
          },
          {
            "text": "components/property-cells.tsx — 10 per-type cell renderers",
            "slug": "notion-shell",
            "kind": "slice"
          },
          {
            "text": "components/views/{Table,Board,List,Gallery,Calendar,Feed}View.tsx — 6 view components",
            "slug": "notion-shell",
            "kind": "slice"
          },
          {
            "text": "components/views/index.ts — VIEW_REGISTRY default map + barrel",
            "slug": "notion-shell",
            "kind": "slice"
          },
          {
            "text": "components/views/types.ts — shared ViewProps contract",
            "slug": "notion-shell",
            "kind": "slice"
          }
        ]
      },
      {
        "heading": "notion-shell (NEW lib)",
        "bullets": [
          {
            "text": "lib/viewData.ts — applyView (filter + sort + search) + groupBy + bucketByDate",
            "slug": "notion-shell",
            "kind": "slice"
          }
        ]
      },
      {
        "heading": "notion-shell (rewritten)",
        "bullets": [
          {
            "text": "components/NotionDatabase.tsx — orchestrator: header + ViewTabs + ViewOptions + active view dispatch via VIEW_REGISTRY; 4 new onView* callbacks (activate/add/remove/configChange) + onPropertyUpdate",
            "slug": "notion-shell",
            "kind": "slice"
          },
          {
            "text": "components/NotionProperty.tsx — delegates value rendering to renderPropertyCell (10 types)",
            "slug": "notion-shell",
            "kind": "slice"
          },
          {
            "text": "index.ts + slice.contract + slice.json + slice.manifest — bump v0.3.0; export 9 new components + 7 new utils + 5 new types",
            "slug": "notion-shell",
            "kind": "slice"
          }
        ]
      },
      {
        "heading": "Template touched — notion-page-clone-os",
        "bullets": [
          {
            "text": "slices/notion-app/DatabaseView.tsx — wire onViewActivate/Add/Remove/ConfigChange + onPropertyUpdate",
            "slug": "notion-page-clone-os",
            "kind": "template"
          },
          {
            "text": "shared/seed.ts — Roadmap DB ships 3 default views (All/Board/Feed)",
            "slug": "notion-page-clone-os",
            "kind": "template"
          },
          {
            "text": "shared/types.ts — Action gains db.view.activate/add/remove/config variants",
            "slug": "notion-page-clone-os",
            "kind": "template"
          },
          {
            "text": "shared/notion-reducer.ts — refactored; db.* cases moved to notion-db-reducer.ts to stay under 200-LOC cap",
            "slug": "notion-page-clone-os",
            "kind": "template"
          },
          {
            "text": "shared/notion-db-reducer.ts — NEW; all db.* reducer cases (property/row/view CRUD)",
            "slug": "notion-page-clone-os",
            "kind": "template"
          }
        ]
      },
      {
        "heading": "Catalog",
        "bullets": [
          "lib/content/slices.ts — notion-shell v0.3.0 (6 views + 10 cells + view tabs/options/column menu)",
          "lib/content/layouts.ts — files list adds shared/notion-db-reducer.ts"
        ]
      },
      {
        "heading": "Up next (BJ)",
        "bullets": [
          "BJ-wave — polish: DnD-kit drag handle, cover image revive, image/embed block renderers, page actions menu, slash-key trigger inline"
        ]
      }
    ]
  },
  {
    "id": "BH",
    "version": "BH-wave",
    "date": 1779235200000,
    "kind": "feature",
    "title": "notion-shell page-editor depth — slash menu, actions menu, live inline-markdown decorator, toggle + callout renderers",
    "body": "notion-shell wrappers level up from barebones contentEditable to a Notion-grade editing surface. (1) <SlashMenu> — searchable block-type picker with keyboard nav (↑↓ Enter Esc), 18-spec baseline (text / h1-h3 / todo / bullet / numbered / toggle / quote / callout / code / equation / image / divider / page / database / table / embed). (2) <BlockActionsMenu> — popover with turn-into submenu + duplicate + delete, current type marker. (3) <InsertBlockButton> — \"+ Add block\" trigger wrapping SlashMenu in a popover with search input. (4) Live inline-markdown decorator — caret-preserving, IME-safe DOM pass that wraps **bold** _italic_ ~~strike~~ `code` $math$ [label](url) markers in semantic tags inside the contentEditable. Source-of-truth stays plain text (innerText round-trips verbatim) so the host store reads source markers, not decorated HTML. Headings hide markers visually via zero-size span. (5) NotionBlock extended — hover reveals \"⋯\" actions handle when onTurnInto provided; runs decorator on mount + every input (skipping composition); composition-end handler for IME. (6) Template wired — DocView's fixed +paragraph/+h2/+list buttons replaced with one InsertBlockButton; toggle + callout block-renderers added (ChevronRight expand + Lightbulb callout); notion-reducer gains doc.block.duplicate + doc.block.turnInto actions; types.ts adds matching Action variants. Slash-key trigger (`/` in block → menu opens at caret) deferred to BJ-wave alongside drag handle + cover + image/embed renderers. Bumps notion-shell to v0.2.0.",
    "groups": [
      {
        "heading": "notion-shell (NEW components)",
        "bullets": [
          {
            "text": "components/SlashMenu.tsx — searchable block-type picker w/ keyboard nav",
            "slug": "notion-shell",
            "kind": "slice"
          },
          {
            "text": "components/BlockActionsMenu.tsx — turn-into / duplicate / delete popover",
            "slug": "notion-shell",
            "kind": "slice"
          },
          {
            "text": "components/InsertBlockButton.tsx — `+` trigger w/ SlashMenu + search input",
            "slug": "notion-shell",
            "kind": "slice"
          }
        ]
      },
      {
        "heading": "notion-shell (NEW lib)",
        "bullets": [
          {
            "text": "lib/blockSpecs.ts — 18-spec BLOCK_SPECS registry + specFor() lookup",
            "slug": "notion-shell",
            "kind": "slice"
          },
          {
            "text": "lib/inlineMd.ts — pure tokenizer (Slack model: **bold** _it_ ~~s~~ `code` $math$ links)",
            "slug": "notion-shell",
            "kind": "slice"
          },
          {
            "text": "lib/inline-decorator/caret.ts — getCaretOffset / setCaretAtOffset (DOM-walk, BR-aware)",
            "slug": "notion-shell",
            "kind": "slice"
          },
          {
            "text": "lib/inline-decorator/decorate.ts — decorateLineToFragment (pure DOM construction)",
            "slug": "notion-shell",
            "kind": "slice"
          },
          {
            "text": "lib/inlineDecorator.ts — decorateInPlace facade (caret save → mutate → restore)",
            "slug": "notion-shell",
            "kind": "slice"
          }
        ]
      },
      {
        "heading": "notion-shell (extended)",
        "bullets": [
          {
            "text": "components/NotionBlock.tsx — decorator pass on mount + input, IME-safe, hover \"⋯\" actions handle",
            "slug": "notion-shell",
            "kind": "slice"
          },
          {
            "text": "index.ts + slice.contract + slice.json + slice.manifest — bump v0.2.0, export 3 new components + 8 new utils + 2 new types",
            "slug": "notion-shell",
            "kind": "slice"
          }
        ]
      },
      {
        "heading": "Template touched — notion-page-clone-os",
        "bullets": [
          {
            "text": "slices/notion-app/DocView.tsx — InsertBlockButton replaces fixed +block bar; NotionBlock wired with onTurnInto + onDuplicate",
            "slug": "notion-page-clone-os",
            "kind": "template"
          },
          {
            "text": "slices/notion-app/block-renderers.tsx — toggle + callout specialised renderers added",
            "slug": "notion-page-clone-os",
            "kind": "template"
          },
          {
            "text": "shared/types.ts + shared/notion-reducer.ts — doc.block.duplicate + doc.block.turnInto actions",
            "slug": "notion-page-clone-os",
            "kind": "template"
          }
        ]
      },
      {
        "heading": "Catalog",
        "bullets": [
          "lib/content/slices.ts — notion-shell v0.2.0 description + tags + recipe (slash-menu / decorator / wysiwyg)",
          "lib/content/layouts.ts — notion-page-clone-os files list adds shared/notion-reducer.ts"
        ]
      },
      {
        "heading": "Up next (BI + BJ)",
        "bullets": [
          "BI-wave — database depth: view tabs + Board/List/Gallery/Calendar/Feed + sort/filter/search + column-header menu + multi-select/date/status/url/email/phone cells",
          "BJ-wave — polish: DnD-kit drag handle, cover image revive, image/embed block renderers, page actions menu, slash-key trigger in NotionBlock"
        ]
      }
    ]
  }
];
