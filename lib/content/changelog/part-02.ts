import type { ChangelogEntry } from "@/features/changelog-feed";

export const entries: ChangelogEntry[] = [
  {
    "id": "CK1K",
    "version": "CK-1K",
    "date": 1779840000000,
    "kind": "improvement",
    "title": "notion-database 0.13.0 — typed AST formula engine (CK-1D Phase 6)",
    "body": "Last big CK-1D phase. Replaces the flat single-file regex evaluator (`lib/formula.ts`) with a typed AST engine under `lib/formulaEngine/` ported from notion-page-clone. Eight focused submodules, each ≤200 LOC: `types` (FormulaValue union + AST node shapes + FormulaError), `coerce` (toString/toNumber/toBoolean/toDate/isEmpty), `dateUtils` (UTC addUnit/diffUnit/formatDate), `ParserClass` (Pratt-style recursive-descent w/ source positions), `parser` (top-level dispatch — template / `=math` / bare call), `functions` (29-fn dispatch w/ arity throws), `evaluator` (AST walker w/ circular-ref guard + memoisation cache), `deps` (static `collectDeps` walker). New typed FormulaValue (string/number/boolean/date/null/list) replaces string-only returns — host gets exact runtime types. Circular-reference detection via visited-set throws FormulaError before infinite recursion. Per-call memoisation cache reuses evaluated formula values across an eval tree. New fn surface: `substring`, `dateAdd`, `dateSubtract`, `dateBetween`, `formatDate`, `count`, `sum`, `join` — on top of every existing fn (concat/lower/upper/length/contains/replace/if/and/or/not/empty/round/floor/ceil/abs/min/max/now/today). Relation refs (`{{Tasks}}`) now resolve to a `list` of target-page titles when `pages` is passed through NotionDatabase. FormulaCell upgraded — popover surfaces parse-error message + source position; cell display flips to destructive style + tooltip on invalid expression; preview line updates live as the user types. Legacy `evaluateFormula()` string wrapper preserved (back-compat) but routes through the new engine. New imports: `evalFormula`, `formatFormulaValue`, `collectDeps`, `parseFormula`, plus typed exports `FormulaValue`, `EvalContext`, `EvalResult`, `FormulaError`, `Node`, `ExprNode` from `@/features/notion-database`. Parity tracker: rr ↔ open-silong now ~88% (Phase 6 closes the formula gap; remaining deferred: SubItemsPicker, table-dnd column/row reorder, PropertyFormInput, RowActionsMenu keyboard nav).",
    "groups": [
      {
        "heading": "Slices touched",
        "bullets": [
          {
            "text": "notion-database — typed AST formula engine + 8 new fns + circular-ref guard (0.12.0 → 0.13.0)",
            "slug": "notion-database"
          }
        ]
      },
      {
        "heading": "New files",
        "bullets": [
          "frontend/slices/notion-database/lib/formulaEngine/{types,coerce,dateUtils,ParserClass,parser,functions,evaluator,deps,index}.ts — 9-file typed AST engine"
        ]
      },
      {
        "heading": "Touched files",
        "bullets": [
          "lib/formula.ts — slimmed to barrel + legacy evaluateFormula() wrapper",
          "components/cells/FormulaCell.tsx — inline parse-error + live preview + relation-pages prop",
          "components/property-cells.tsx — passes `pages` through to FormulaCell"
        ]
      }
    ]
  },
  {
    "id": "CK1J",
    "version": "CK-1J",
    "date": 1779840000000,
    "kind": "feature",
    "title": "activity 0.1.0 — public productivity log + MCP-friendly Convex backend, lifted from rahmanef.com",
    "body": "First 'now-page' / productivity-log slice in the catalog. Public-facing weekly activity log grouped by ISO week with schema.org-friendly markup, designed to maximise SEO so the question 'what is <person> working on this week?' lands here. Convex-backed: schema (`activities` table + `by_visibility_occurredAt` index), queries (`listAll`, `listPublic`, `get`, `statsThisWeek`), unauthenticated mutations (`create`, `update`, `remove`, `seed`) the consumer wraps. MCP-friendly — designed so AI workflows (Claude / GPT / custom agents) can append entries via the consumer's MCP server. ActivityFeed view split from a 225-LOC monolith into 1 view + 2 sub-components (`StatsPanel`, `ActivityItem`) + 4 lib helpers (`grouping`, `format`, `types`, `defaults`) for the 200-LOC cap. All user-facing copy + per-category labels + date/time locale are prop-driven with English defaults — original Indonesian strings + project-specific MCP-integration copy lifted out. Custom `<Section>`/`<Heading>` primitives + brutalist Tailwind utilities (`tracking-brutal-sm`, `border-foreground`) stripped — replaced with raw semantic elements + stock utilities (`tracking-wider`, `border-2`). Project-specific `seedDefaults` mutation (3 hardcoded rahmanef.com seed rows) dropped in favour of generic `seed`. Cross-slice `requireAdmin` import dropped — mutations ship as `internalMutation` and the consumer wraps them.",
    "groups": [
      {
        "heading": "Slices touched",
        "bullets": [
          {
            "text": "activity — first release, lifted from rahmanef.com (0.0.0 → 0.1.0)",
            "slug": "activity"
          }
        ]
      },
      {
        "heading": "New files",
        "bullets": [
          "convex/features/activity/{_schema,queries,mutations,index}.ts — Convex backend",
          "frontend/slices/activity/views/ActivityFeed.tsx — top-level view (~90 LOC)",
          "frontend/slices/activity/components/{StatsPanel,ActivityItem}.tsx — view sub-components",
          "frontend/slices/activity/lib/{types,defaults,grouping,format}.ts — helpers + prop types + English copy defaults",
          "frontend/slices/activity/{slice.json,slice.contract.ts,slice.manifest.json,README.md,config.ts,index.ts}"
        ]
      },
      {
        "heading": "Dependencies",
        "bullets": [
          "convex ^1.17 (schema + queries + mutations)",
          "lucide-react ^0.400.0 (ArrowUpRight, Clock, Tag icons in ActivityItem)",
          "next ^15 (next/link in ActivityItem)",
          "react ^18"
        ]
      }
    ]
  },
  {
    "id": "CK1I",
    "version": "CK-1I",
    "date": 1779840000000,
    "kind": "feature",
    "title": "i18n-translate 0.1.0 — Google Translate widget, lifted from rahmanef.com",
    "body": "First on-the-fly localization slice in the catalog. Drop `<GoogleTranslate />` anywhere — no API key, no Google Cloud billing, no hand-maintained dictionaries. Auto-detect browser language on first visit (cookie set BEFORE Google's script loads so first paint is already translated), persist user choice via localStorage, click-to-reload language switching with router-refresh + best-effort-in-place fallback strategies. Source was a 510-LOC monolith at rahmanef.com `slices/i18n-translate/components/GoogleTranslate.tsx`; split during lift into 8 sub-files (`components/GoogleTranslate.tsx`, `hooks/useGoogleTranslate.ts`, `lib/{widget,cookie,storage,styles,defaults,types}.ts`) for the 200-LOC cap. Project-specific Tailwind utilities (`tracking-brutal-sm`, `border-[length:var(--border-width,2px)]`) stripped from defaults — replaced with stock `tracking-wider` + `border-2` so the slice renders cleanly without a brutalism preset. Consumer must add the CSP allowlist in README.md to their middleware/proxy for Google's script to load.",
    "groups": [
      {
        "heading": "Slices touched",
        "bullets": [
          {
            "text": "i18n-translate — first release, lifted from rahmanef.com (0.0.0 → 0.1.0)",
            "slug": "i18n-translate"
          }
        ]
      },
      {
        "heading": "New files",
        "bullets": [
          "frontend/slices/i18n-translate/components/GoogleTranslate.tsx — dropdown UI (110 LOC)",
          "frontend/slices/i18n-translate/hooks/useGoogleTranslate.ts — stateful hook (87 LOC)",
          "frontend/slices/i18n-translate/lib/widget.ts — Google widget plumbing (script + combo dispatch) (102 LOC)",
          "frontend/slices/i18n-translate/lib/{cookie,storage,styles,defaults,types}.ts — sub-module split for 200-LOC cap",
          "frontend/slices/i18n-translate/{slice.json,slice.contract.ts,slice.manifest.json,README.md,config.ts,index.ts}"
        ]
      },
      {
        "heading": "Dependencies",
        "bullets": [
          "lucide-react ^0.400.0 (ChevronDown icon in trigger button)",
          "next ^15 (useRouter for the \"router\" refresh strategy)",
          "react ^18"
        ]
      }
    ]
  },
  {
    "id": "CK1H",
    "version": "CK-1H",
    "date": 1779667200000,
    "kind": "feature",
    "title": "icon-picker 0.3.0 — Phosphor fill variant + smart positioning + dialog fallback",
    "body": "Lifted from open-silong. The picker gains a second icon variant (Phosphor fill, color-aware) parallel to Lucide outline, surfaced via a two-tab layout (Emoji | Icon) with sub-variant pills (Native | Twemoji / Lucide | Phosphor). Storage adds a new `phosphor:Name?c=hex` form parallel to `lucide:Name?c=hex` — back-compat with every existing emoji + lucide value. Smart positioning: PopoverContent now caps height to Radix's `--radix-popover-content-available-height` CSS var and falls back to a centered Dialog when neither side fits ≥340px usable vertical (or viewport <360px wide) — fixes off-screen clipping on tight viewports + small mobile screens. Inline picker restructured to flex column with `min-h-0` so it adapts to either container. `style-pref.ts` renamed its localStorage key `nosion:iconStyle` → `icon-picker:style` with one-shot legacy migration so existing consumers keep their Twemoji/native preference.",
    "groups": [
      {
        "heading": "Slices touched",
        "bullets": [
          {
            "text": "icon-picker — phosphor variant, smart popover positioning, flex-resizable inline body (0.2.0 → 0.3.0)",
            "slug": "icon-picker"
          }
        ]
      },
      {
        "heading": "New files",
        "bullets": [
          "frontend/slices/icon-picker/lib/phosphor-catalog.ts — 190 phosphor names grouped by category",
          "frontend/slices/icon-picker/lib/phosphor-icons.ts — curated named-import surface for @phosphor-icons/react (tree-shake-safe)",
          "frontend/slices/icon-picker/components/picker-parts/IconTab.tsx — combined Lucide+Phosphor tab (replaces LucideTab.tsx)"
        ]
      },
      {
        "heading": "Dependencies",
        "bullets": [
          "@phosphor-icons/react@^2.1.10 added to dependencies",
          "deps.shadcn += dialog (smart fallback uses it)"
        ]
      }
    ]
  },
  {
    "id": "CK1G",
    "version": "CK-1G",
    "date": 1779494400000,
    "kind": "feature",
    "title": "AI prompts everywhere — per-slice agent.md, /agents/<slug> route, llms.txt expansion, copyable detail block",
    "body": "Surfaces the existing agentRecipe metadata (already on all 56 slices + 56 features + 36 layouts) in four new places so AI coding agents have a one-stop install surface. (1) Per-slice detail page now renders the recipe inside a copyable CodeBlock + Install-with-AI-agent dialog + link to the dedicated prompt page, replacing the prior plain-text paragraph. (2) /llms.txt expanded so each slice entry now includes `agent recipe:` + `prompt:` link. (3) gen-slice-agent-md.mjs writes `agent.md` inside every slice dir (53 files written); the file ships with the slice when consumers run `npx rr add <slug>`, so the install prompt is available offline + in-tree alongside the code. Generation wired into slices:check pre-push gate. (4) New /agents/<slug> dedicated route resolves against slices OR layouts; renders full prompt + copy + install button + source link. /agents/ index now lists all 44 slices + 36 layouts (was only first 4 layouts).",
    "groups": [
      {
        "heading": "New",
        "bullets": [
          "lib/slice-agent-prompt.ts — buildSliceAgentPrompt + buildLayoutAgentPrompt formatters",
          "scripts/features/gen-slice-agent-md.mjs — generator (run + --check modes)",
          "package.json scripts: gen:agent-md, gen:agent-md:check",
          "slices:check chain now includes gen:agent-md:check (drift gate)",
          "app/(docs)/agents/[slug]/page.tsx — dedicated prompt page per slice/layout",
          "frontend/slices/<slug>/agent.md × 53 — auto-generated, ships with `npx rr add`"
        ]
      },
      {
        "heading": "Updated",
        "bullets": [
          "app/(docs)/slices/[slug]/details-tab.tsx — agentRecipe block becomes CodeBlock + InstallWithAgent + dedicated-page link",
          "app/llms.txt/route.ts — each slice gets `agent recipe:` + `prompt:` lines",
          "app/(docs)/agents/page.tsx — full index of all slices + layouts (was only first 4)"
        ]
      }
    ]
  },
  {
    "id": "CK1F",
    "version": "CK-1F",
    "date": 1779494400000,
    "kind": "feature",
    "title": "theme-presets v0.2 — one unified switcher; registry bundled inside slice",
    "body": "Consolidates the theme-preset surface in three directions. (1) Two switcher components → one: TweakcnSwitcher + ThemePicker merged into a single ThemePresetSwitcher (Palette-icon Popover with sticky light/dark/system mode tabs + sticky preset-count row with Default reset + scrollable grouped color list with hover-preview + click-commit). Pattern lifted from CareerPack production switcher. (2) ThemePresetProvider context added — wraps state so deeply-nested consumers read `useThemePreset()` instead of mounting the switcher directly. Bootstrap on first client mount, single registry load, exposes setPreset/preview/restore/isReady. (3) Catalog cleanup — dropped phantom `theme-preset-switcher` entry (pointed at template-base/frontend/shared/theme which doesn't exist on disk; was a legacy stub from rahmanef.com source map). User-requested extra: the ~240KB tweakcn registry now ships INSIDE the slice as registry-data.json and loads lazily via dynamic import — code-splits into its own chunk, no consumer public/ setup, no network roundtrip. HIDDEN_PRESETS filter drops gimmicky themes (Doom 64, Cyberpunk, Neo Brutalism, Bubblegum, Candyland, Pastel Dreams). Indonesian group labels (Profesional / Bold / Hangat / Artistik / Gelap / Lainnya). Slice count: 45 → 44 (net -1 after dropping phantom).",
    "groups": [
      {
        "heading": "New files",
        "bullets": [
          "components/ThemePresetSwitcher.tsx — single unified switcher (~190 LOC)",
          "components/ThemePresetProvider.tsx — context + useThemePreset() hook + DEFAULT_PRESET_NAME",
          "lib/tweakcn/registry-data.json — bundled tweakcn registry (~240KB, lazy-loaded)",
          "slice.json + slice.contract.ts — slice now has full metadata trio"
        ]
      },
      {
        "heading": "Removed",
        "bullets": [
          "components/ThemePicker.tsx (4-grid picker, replaced)",
          "components/TweakcnSwitcher.tsx (replaced by ThemePresetSwitcher)",
          "components/tweakcn/{ModeRow,PresetList}.tsx (inlined into switcher)",
          "useThemePreset.ts (old hook, replaced by context-backed one in Provider)",
          "presets.ts + presets/ (old THEME_PRESETS path, never used externally)",
          "app/preview/slices/theme-preset-switcher/* (phantom slice preview)"
        ]
      },
      {
        "heading": "Updated",
        "bullets": [
          "lib/tweakcn/registry.ts — dynamic import of registry-data.json (was fetch /r/registry.json)",
          "lib/tweakcn/groups.ts — added HIDDEN_PRESETS + Indonesian group labels",
          "lib/tweakcn/types.ts — dropped REGISTRY_URL constant (no longer needed)",
          "index.ts barrel — new exports (drop ThemePicker, TweakcnSwitcher)",
          "app/preview/slices/theme-presets/page.tsx — uses new ThemePresetSwitcher"
        ]
      },
      {
        "heading": "Catalog",
        "bullets": [
          {
            "text": "theme-presets v0.1.0 → v0.2.0",
            "slug": "theme-presets",
            "kind": "slice"
          },
          "DROPPED theme-preset-switcher (phantom, never on disk)",
          "Slice count: 45 → 44"
        ]
      }
    ]
  },
  {
    "id": "CK1E",
    "version": "CK-1E",
    "date": 1779408000000,
    "kind": "feature",
    "title": "database-io merged slice — CSV + JSON + dynamic template in one dropdown; catalog gains family sub-grouping",
    "body": "Two consolidations. (1) database-csv + database-json hard-merged into a single `database-io` slice. One DatabaseIOActions dropdown ships six items: Export CSV / Export JSON / Import CSV / Import JSON / Download CSV template / Download JSON template. Templates are generated dynamically from the live db.properties — header row (CSV) or wire-format v1 schema (JSON) reflects the current column set, with one placeholder row hinting at the expected format per property type (date → `2026-01-01`, multi_select → `Option1; Option2`, computed → `(computed — ignored on import)`). Single onImport callback still serves both formats because result shape stayed identical. Both legacy slugs hard-removed; consumers wanting CSV-only or JSON-only now install database-io and ignore the items they don't need (zero overhead — same shadcn deps). Slice count: 46 → 45. (2) /slices catalog UI gains second-level family sub-grouping. Within each category tab (or the All tab's category sections), slices that share a family slug-prefix (notion-*, ai-*, database-*, theme-*) or a manual override (payment, landing, admin, content) cluster under a labeled sub-header. Singletons fall back to the flat row — no `family of 1` labels.",
    "groups": [
      {
        "heading": "New slice files",
        "bullets": [
          "frontend/slices/database-io/{slice.json, slice.manifest.json, slice.contract.ts, index.ts, types.ts}",
          "components/DatabaseIOActions.tsx — single combined dropdown (6 items + 2 dialogs)",
          "components/CsvImportDialog.tsx + csv-mapping.tsx — column mapper (lifted from database-csv)",
          "components/JsonImportDialog.tsx — file picker + preview (lifted from database-json)",
          "lib/csv.ts — exportDatabaseToCsv + parseCsv + downloadCsv + valueFromString (lifted)",
          "lib/serialize.ts — exportDatabase + parseExport + diffSchema + buildImportResult + downloadJson (lifted)",
          "lib/template.ts — NEW buildCsvTemplate + buildJsonTemplate (per-type placeholder hints)"
        ]
      },
      {
        "heading": "Removed (hard delete)",
        "bullets": [
          "frontend/slices/database-csv/* (replaced by database-io)",
          "frontend/slices/database-json/* (replaced by database-io)",
          "app/preview/slices/database-csv/page.tsx (replaced by /preview/slices/database-io)",
          "app/preview/slices/database-json/page.tsx (replaced by /preview/slices/database-io)"
        ]
      },
      {
        "heading": "Catalog UI — family sub-grouping",
        "bullets": [
          "components/site/catalog/catalog-tabs-parts.tsx — new CatalogGroupedGrid + FamilyOf type",
          "components/site/catalog/catalog-tabs.tsx — accepts optional familyOf + familyLabel props",
          "app/(docs)/slices/family-map.ts — FAMILY_OVERRIDES + FAMILY_LABEL + familyOfSlug()",
          "app/(docs)/slices/page.tsx — passes familyOf to CatalogTabs",
          "Singleton families fall back to flat row (no `family of 1` headers)"
        ]
      },
      {
        "heading": "Catalog",
        "bullets": [
          {
            "text": "NEW database-io 0.1.0 — peer of notion-database ^0.3",
            "slug": "database-io",
            "kind": "slice"
          },
          "REMOVED database-csv 0.1.0",
          "REMOVED database-json 0.1.0",
          "Slice count: 46 → 45 (net -1 after merge)"
        ]
      }
    ]
  }
];
