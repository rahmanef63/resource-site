import type { ChangelogEntry } from "@/features/changelog-feed";

export const entries: ChangelogEntry[] = [
  {
    "id": "CKJ",
    "version": "CK-J",
    "date": 1779321600000,
    "kind": "feature",
    "title": "database-json standalone slice — JSON import + export, twin of database-csv",
    "body": "Lifted JSON wire format companion from upstream notion-page-clone. Mirrors database-csv API surface so a single host onImport handler can serve both formats — same {newProperties, rows} result shape. Wire format v1 carries database schema (name + icon + properties + views) + rows (title + icon + rowProps). On import: parses + diffs incoming property list against existing db.properties (case-insensitive name + exact type match); matched props keep existing ids, mismatched listed as `newProperties`; row values remapped through the id table. NEW slice frontend/slices/database-json/ at version 0.1.0, peer of notion-database ^0.4. Dropped vs upstream: lib/ai.ts + AIAssistDialog (needs AI router separately), cover + blocks + sub-items + templates wire fields (not in rr Page/Database minimal shape), DataMenu (consumer composes CsvActions + JsonActions themselves). Slice count 45 → 46. Preview /preview/slices/database-json: 3-row demo + working Export downloads .json + Import file picker + collapsible wire-format JSON viewer at bottom.",
    "groups": [
      {
        "heading": "New slice files",
        "bullets": [
          "frontend/slices/database-json/{slice.json, slice.manifest.json, slice.contract.ts, index.ts, types.ts}",
          "components/JsonActions.tsx — Export + Import dropdown trigger",
          "components/JsonImportDialog.tsx — file picker + preview + submit",
          "lib/serialize.ts — exportDatabase + parseExport + diffSchema + buildImportResult + downloadJson"
        ]
      },
      {
        "heading": "API",
        "bullets": [
          "JsonActions: { db, rows, onImport, className? }",
          "JsonImportDialog: { db, open, onOpenChange, onImport }",
          "onImport: ({ newProperties, rows, importedDb }) => Promise<void> | void",
          "Result shape MIRRORS CsvImportResult — single host handler works for both",
          "Lower-level: exportDatabase / parseExport / diffSchema / buildImportResult exported standalone"
        ]
      },
      {
        "heading": "Catalog",
        "bullets": [
          {
            "text": "NEW database-json 0.1.0 — peer of notion-database ^0.4",
            "slug": "database-json",
            "kind": "slice"
          },
          "Slice count: 45 → 46. JSON import/export 0% → 100%.",
          "Database adaptation: ~80% → ~82%"
        ]
      },
      {
        "heading": "Deferred (post upstream mega-bundle)",
        "bullets": [
          "AI-assisted row generation (AIAssistDialog + lib/ai.ts — separate AI router peer)",
          "Cover + blocks + sub-items + templates wire fields (need cross-block + cross-DB context)"
        ]
      }
    ]
  },
  {
    "id": "CK1C",
    "version": "CK-1C",
    "date": 1779321600000,
    "kind": "feature",
    "title": "notion-database completes 11/11 views — FormView lifted",
    "body": "Final view (FormView) lifted from upstream. Was deferred from CK-1B because of PropertyFormInput + FormSettings + addRow-with-values complexity. Resolved by REUSING the existing renderPropertyCell helper (already covers all 16 property types) instead of lifting a separate input widget — form-context just adds a label wrapper. PropertyFormInput is NOT lifted as a peer; renderPropertyCell is the single source. New files: FormView.tsx (155 LOC — title input + per-property labels + Submit button + success state), form-settings.tsx (102 LOC — show / required checkboxes per formable property + form title + description + success message editor), form-helpers.ts (32 LOC — isFormableProperty / emptyDraft / isEmptyValue / READ_ONLY_PROPERTY_TYPES). ViewProps extended with onRowCreate?: (draft: {title, rowProps}) => Promise<void>|void. NotionDatabase forwards it through. DatabaseViewConfig extended with formTitle? + formDescription? (existing formRequiredProps / formShownProps / formSuccessMessage already added in CK-1A). VIEW_REGISTRY now has all 11 entries — db.views.type === 'form' resolves to FormView. Coverage: views 10/11 → 11/11 (100%). Adaptation ~76% → ~80%. notion-database 0.3.0 → 0.4.0. Preview /preview/slices/notion-database: 8 view tabs (added Form view), preview now uses React state so Form submit actually appends a row to the table — round-trip demonstrable.",
    "groups": [
      {
        "heading": "New files",
        "bullets": [
          "components/views/FormView.tsx — main form (155 LOC)",
          "components/views/form-settings.tsx — settings panel (102 LOC)",
          "components/views/form-helpers.ts — predicates + draft factory (32 LOC)"
        ]
      },
      {
        "heading": "API",
        "bullets": [
          "ViewProps.onRowCreate — new optional callback",
          "NotionDatabaseProps.onRowCreate — forwarded to view",
          "DatabaseViewConfig.formTitle + formDescription — new optional fields",
          "FormView reuses renderPropertyCell for per-property inputs — no separate widget"
        ]
      },
      {
        "heading": "Coverage",
        "bullets": [
          "Views: 10/11 → 11/11 (100%)",
          "Property types: 16/17 (94%, unchanged)",
          "Filter/Sort UI: 100% (unchanged)",
          "CSV import/export: 100% (database-csv slice, CK-4)",
          {
            "text": "notion-database 0.3.0 → 0.4.0",
            "slug": "notion-database",
            "kind": "slice"
          },
          "Database adaptation: ~76% → ~80%"
        ]
      },
      {
        "heading": "Deferred (post upstream mega-bundle)",
        "bullets": [
          "relation + rollup property types — need cross-DB context",
          "JSON import — same pattern as CSV but lower demand"
        ]
      }
    ]
  },
  {
    "id": "CK4",
    "version": "CK-4",
    "date": 1779321600000,
    "kind": "feature",
    "title": "database-csv standalone slice — import + export for notion-database",
    "body": "Continuation of CK-wave (database completion). Lifted pre-staged database-csv from template-base/notion/slices/database-csv/ as new standalone slice frontend/slices/database-csv/. Simplified contract vs upstream: ONE onImport callback (was 5 useStore methods) — receives {newProperties, rows} and lets host translate to its own adapter calls. CsvActions = dropdown trigger w/ Export (Blob URL download) + Import. CsvImportDialog = file picker → auto-map columns (case-insensitive name match against db.properties) → user re-pick mapping (existing prop / Title / skip / + New of 12 supported types) → submit. Supports auto-seeding select/multi_select/status options from CSV value names. Computed types (formula / created_time / last_edited_time / unique_id) recognised as readonly — never written from CSV. Dropped vs upstream: relation cross-DB lookups (no pages reference exposed), created_by / last_edited_by / rollup branches (not in rr PropertyType). New peer slice in catalog: database-csv 0.1.0 with notion-database ^0.3 peer dep. Preview /preview/slices/database-csv demo: 3-row DB w/ working in-memory Export + Import (refresh clears state). Slice count 44 → 45.",
    "groups": [
      {
        "heading": "New slice files",
        "bullets": [
          "frontend/slices/database-csv/{slice.json, slice.manifest.json, slice.contract.ts, index.ts}",
          "components/CsvActions.tsx — dropdown trigger (Export + Import items)",
          "components/CsvImportDialog.tsx — file picker + mapping submit",
          "components/csv-mapping.tsx — extracted column-mapping table (≤200 LOC budget)",
          "lib/csv.ts — parseCsv + valueFromString + exportDatabaseToCsv + downloadCsv"
        ]
      },
      {
        "heading": "API surface",
        "bullets": [
          "Single `onImport({newProperties, rows})` callback — host owns persistence",
          "CsvNewProperty: { type, name, options? } (options auto-seeded for select-family)",
          "CsvRowDraft: { title, rowProps }",
          "All exports also available as utility fns for custom toolbars"
        ]
      },
      {
        "heading": "Catalog",
        "bullets": [
          {
            "text": "NEW database-csv 0.1.0 — peer of notion-database ^0.3",
            "slug": "database-csv",
            "kind": "slice"
          },
          "Slice count: 44 → 45. CSV import/export coverage: 0% → 100%.",
          "Database adaptation: ~72% → ~76%"
        ]
      },
      {
        "heading": "Deferred",
        "bullets": [
          "JSON import (similar pattern, lower demand — defer to mega-bundle)",
          "Relation column type via CSV (needs cross-DB scope — same blocker)",
          "CK-1C FormView — still pending"
        ]
      }
    ]
  },
  {
    "id": "CK3",
    "version": "CK-3",
    "date": 1779321600000,
    "kind": "feature",
    "title": "notion-database +6 property cells (files / person / formula / created_time / last_edited_time / unique_id)",
    "body": "Continuation of CK-wave. PropertyType union extended from 10 → 16 types. Lifted the pre-staged property cells from template-base/notion/slices/databases/ into frontend/slices/notion-database/components/cells/, plus the formula evaluation engine into lib/formula.ts (simplified — drops relation / rollup branches since those need cross-DB context that the standalone slice doesn't expose). Each cell is a self-contained component (≤105 LOC) with prop-driven mutations. NEW CELLS: (1) FilesCell — popover w/ chip list + paste-URL input, no upload UX (host plugs `files` slice adapter at a higher level). (2) PersonCell — initials avatar chips + comma-separated text picker (no user directory lookup vs upstream). (3) FormulaCell — readonly evaluated expression display + popover editor with live preview; expression syntax via {{title}}/{{prop_name}}/now/today + fn(arg, ...) (concat/upper/lower/length/if/and/or/not/empty/contains/replace/round/floor/ceil/abs/min/max) + `=expr` arithmetic. (4) CreatedTimeCell — readonly row.createdAt formatted. (5) LastEditedTimeCell — readonly row.updatedAt. (6) UniqueIdCell — auto-derived from row index + optional prefix (e.g. TASK-001). Existing multi_select + select/status cases extracted to MultiSelectCell + SelectCell to keep property-cells.tsx ≤200 LOC. CellArgs extended with optional row + db + onPropertyChange so the heavier cells can read metadata + write back formula expressions. NotionDatabase.renderCell wires all three through. Property type coverage: 10/17 (59%) → 16/17 (94%; only relation/rollup remain deferred). Adaptation ~65% → ~72%. Version 0.2.0 → 0.3.0. Preview demo extended with 6 new columns (Owners, Files, Summary formula, ID, Created, Edited).",
    "groups": [
      {
        "heading": "New cells",
        "bullets": [
          "FilesCell — popover list + paste-URL (no upload UX)",
          "PersonCell — initials chips + comma text picker (no directory)",
          "FormulaCell — evaluated display + popover editor w/ live preview",
          "CreatedTimeCell — readonly row.createdAt",
          "LastEditedTimeCell — readonly row.updatedAt",
          "UniqueIdCell — derived from row index + optional prefix"
        ]
      },
      {
        "heading": "Refactor",
        "bullets": [
          "components/cells/ subfolder created",
          "MultiSelectCell + SelectCell extracted from property-cells.tsx",
          "renderPropertyCell now takes row + db + onPropertyChange (optional)",
          "lib/formula.ts lifted (simplified, no relation/rollup branches)",
          "All new files ≤200 LOC; property-cells.tsx trimmed to 185 LOC"
        ]
      },
      {
        "heading": "Types (notion-shell)",
        "bullets": [
          "PropertyType: 10 → 16 (+ person, files, formula, created_time, last_edited_time, unique_id)",
          "Property: + formulaExpression? + uniqueIdPrefix?",
          "Database: + uniqueIdCounter?"
        ]
      },
      {
        "heading": "Catalog",
        "bullets": [
          {
            "text": "notion-database 0.2.0 → 0.3.0 — title says '10 views · 16 cells', tags include files/person/formula/timestamp/unique-id",
            "slug": "notion-database",
            "kind": "slice"
          },
          "Property type coverage: 10/17 → 16/17 (94%); database adaptation ~65% → ~72%"
        ]
      },
      {
        "heading": "Deferred",
        "bullets": [
          "relation + rollup — need cross-DB context (lift via upstream notion mega-bundle)",
          "CK-1C FormView — still pending",
          "CK-4 database-csv — still pending"
        ]
      }
    ]
  },
  {
    "id": "CK",
    "version": "CK-wave",
    "date": 1779321600000,
    "kind": "feature",
    "title": "notion-database completion — 10/11 views + FilterBuilder + SortBuilder lifted",
    "body": "User report: 'mari fokus menyelesaikan database'. Calculated current notion-database adaptation at ~35% (6 views / 11 + zero filter or sort UI + 10/17 property types). Goal: get database close to upstream parity in standalone slice form (the upstream open-silong mega-bundle is still ~3wk away per docs/rr-sync/2026-05-21-notion-mega-lift-plan.md Phase 5). EXECUTED in 3 commits: (1) CK-1A (commit a7532da) — lifted ChartView (recharts bar/line/area/pie/donut + inline picker for kind / X axis / aggregate / Y value + chartPalette/Decimals/TopN view-config fields) and DashboardView (KPI strip + group breakdowns by select/status + recent updates feed). 7 new files including chart-data.ts (pure aggregation helpers) and dashboard-parts.tsx (GroupBreakdown + Stat split out for ≤200 LOC). DatabaseViewConfig extended with 16 chart fields + dashboard fields. ChartKind + ChartAggregate types exported from notion-shell. (2) CK-1B (commit e742c10) — lifted MapView (SVG world projection w/ row pins read from lat/lng number-properties; optional select/status property maps to pin color — no leaflet, pure SVG) and TimelineView (Gantt-style horizontal timeline w/ drag-to-shift + drag-to-resize bars via pointer events; ChevronLeft/Right pan; auto-detects first date property). 5 new files including map-svg.tsx, timeline-bar.tsx, timeline-helpers.ts (TimelineView split because upstream was 354 LOC), lib/keyboard.ts (focusSiblingBySelector helper). Views now 10/11 (91%) — only FormView deferred (heavy PropertyFormInput + FormSettings + addRow-with-values plumbing). (3) CK-2 (commit 7b81d41) — lifted FilterBuilder + SortBuilder as standalone components (shadcn Select-based UI). ViewOptions refactored to delegate to them inside Sort / Filter popovers — replaces previous inline native-<select> builders. Exported from notion-database barrel for toolbar embedding. (FINAL CK) — notion-database version 0.1.0 → 0.2.0. Catalog title + description + tags updated. recharts@^2.13.0 added to npm deps. shadcn deps add Select. Adaptation moves 35% → ~65%. CK-3 (property type cells for file/person/timestamps), CK-4 (database-csv standalone), CK-1C (FormView) deferred to future waves.",
    "groups": [
      {
        "heading": "Views lifted",
        "bullets": [
          "ChartView — recharts bar/line/area/pie/donut + inline kind/X/agg/Y pickers",
          "DashboardView — KPI strip + select-grouped breakdowns + recent updates feed",
          "MapView — SVG world projection + lat/lng pins, optional color property",
          "TimelineView — Gantt drag-to-shift / drag-to-resize bars",
          "Views 6/11 → 10/11 (91%). FormView deferred to CK-1C."
        ]
      },
      {
        "heading": "Filter + Sort UI",
        "bullets": [
          "FilterBuilder + SortBuilder — props-driven, shadcn Select-based",
          "ViewOptions refactored — delegates to the new builders in its popovers",
          "Coverage: filter/sort UI 0% → 100%"
        ]
      },
      {
        "heading": "Type extensions (notion-shell types.ts)",
        "bullets": [
          "DbView union: 6 → 11 (table/board/list/gallery/calendar/feed/chart/dashboard/form/map/timeline)",
          "ChartKind + ChartAggregate types added",
          "DatabaseViewConfig: 25 new optional view-specific fields (chart*, map*, form*, dashboard*, feed*, timeline*, hiddenPropIds)",
          "ViewProps: onViewConfigChange + onOpenRow added (optional callbacks)"
        ]
      },
      {
        "heading": "Catalog",
        "bullets": [
          {
            "text": "notion-database 0.1.0 → 0.2.0 — title + description + tagline + tags updated, recharts npm dep added",
            "slug": "notion-database",
            "kind": "slice"
          },
          "Database adaptation: ~35% → ~65%"
        ]
      },
      {
        "heading": "Deferred",
        "bullets": [
          "CK-1C — FormView (PropertyFormInput + FormSettings + addRow-with-values plumbing)",
          "CK-3 — property type cells (file/person/created_time/last_edited_time)",
          "CK-4 — database-csv as standalone peer slice",
          "Per docs/rr-sync/2026-05-21-notion-mega-lift-plan.md, upstream open-silong Phase 5 (~3wk) will land the full adapter-driven `notion/` mega-bundle that subsumes these gaps."
        ]
      }
    ]
  }
];
