# CHANGELOG

Release history for the Rahman Resources monorepo. Tracks the rr site,
canonical slices, templates, CLI, and MCP server.

Format: keep-a-changelog-ish. Per-release sections list **CLI**, **Slices**,
**Templates**, and **Site** changes where applicable. The CLI version is
the user-facing handle (`npx rahman-resources@x.y.z`).

---

## [Unreleased]

### 2026-05-31 — user-management: invite flow (P2 of the epic) v0.2.0

- **Invite flow added to `user-management`.** `<InviteDialog>` (email + role
  select + optional message, shadcn Dialog) and `<PendingInvites>` (pending
  list with resend / cancel) — both permission-gated on `members.invite`.
  `<MembersPanel>` now owns the dialog state (toolbar invite button opens it)
  and renders the pending list above the table. New props: `onInvite(input)`,
  `invites`, `onCancelInvite`, `onResendInvite`. New types `Invite` /
  `InviteInput` / `InviteStatus`.
- **Convex** (`convex/features/user-management/`): `um_invites` table
  (tenant-scoped, by_token index) + `listInvites` (soft-denied without
  members.invite/manage) + `sendInvite` (7-day crypto token, rejects
  duplicate pending) / `cancelInvite` / `resendInvite` (all gated
  members.invite) + `acceptInvite(token)` (public; creates/reactivates the
  membership for the signed-in user).
- Preview wires the full flow with the Admin/Manager view-as toggle. Slice +
  catalog bumped 0.1.0 → 0.2.0; `dialog` + `textarea` + `label` added to
  shadcn deps.

### 2026-05-31 — user-management: Members surface (P1 of the epic) v0.1.0

- **New `user-management` slice** — the members surface, ported from
  superspace. `<MembersPanel>`: searchable / role-filterable / sortable
  member table (avatar + name + email), inline role dropdown, soft-remove,
  and a permission-gated invite button. Sub-parts `MembersTable`,
  `MembersToolbar`, `MemberRowActions`, `RoleChip`, `useMembersView`.
- **Props-driven + RBAC-agnostic.** The slice imports no other slice's
  frontend (per the slice-boundary rule audit-slices enforces): it takes
  `roles` (options) + `currentPerms` (resolved permission strings) + CRUD
  callbacks as props. Cross-slice wiring (rbac-roles → roles + perms) happens
  at the app level — see the preview, which composes both. Local `can()` /
  `RoleChip` keep it self-contained.
- **Convex template** (`convex/features/user-management/`): `um_members`
  table (generic `tenantId`), `listMembers` (joins `users` for profile
  fields), `addMember` / `updateMemberRole` / `removeMember` (soft-delete) —
  all gated via rbac-roles' `requirePermission`.
- Preview: live members table with an Admin/Manager "view as" toggle showing
  permission gating. slice.json + contract + manifest; catalog +1 (new
  `user-management` entry); `registers: []`.
- **Fixed P0 debt:** wrapped the raw `<button>` in the rbac-roles preview in
  shadcn `<Button>`.

### 2026-05-31 — rbac-roles: real RBAC engine (P0 of user-management epic) v0.2.0

- **rbac-roles upgraded from config-only stub to a real RBAC engine**, ported
  from superspace. First of a split: this is the engine; a future
  `user-management` slice (peers this) carries the members/invites/roles-admin
  UI. Full superspace parity is the multi-phase goal (P0–P4).
- **Engine (pure, props-driven):**
  - `lib/permissions.ts` — `PERMS` (~30 curated dot-namespaced keys, open
    union) + `matchPermission` (`*` | exact | `feature.*`).
  - `lib/roles.ts` — the 6 system role presets (owner/admin/manager/staff/
    client/guest, levels 0–90, colors) + `ROLE_MAP`.
  - `lib/check.ts` — `resolvePermissions` / `hasPermission` /
    `roleHasPermission` / `roleLevel` / `isAtLeast`.
  - `lib/permission-catalog.ts` — grouped catalog for the matrix.
  - `hooks/usePermissions` — feed it the actor's resolved permissions →
    `{ can, canAny, canAll }`.
  - `components/` — `<PermissionGate>`, `<RoleBadge>`, `<PermissionMatrix>`.
- **Convex template** (`convex/features/rbac-roles/`): `rbac_roles` table
  (generic `tenantId`), `listRoles`, `seedSystemRoles` / `upsertRole` /
  `removeRole` (system roles immutable), and `checkPermission` /
  `requirePermission` / `getActorPermissions` helpers with a
  `PLATFORM_ADMIN_EMAILS` superadmin bypass. Reads `um_members` (provided by
  the upcoming user-management slice).
- Preview rebuilt as a live engine demo (pick a role → resolved permission
  matrix + PermissionGate/usePermissions reactions). slice.json + manifest +
  contract added; catalog bumped 0.1.0 → 0.2.0 (kind backend → full).
  `registers: []` (pure engine, no nav route).

### 2026-05-31 — convex-auth: props-driven AuthCard + tabbed preview (v0.3.0)

- **New `<AuthCard>`** — a presentational, props-driven sign-in card in the
  convex-auth slice. Pick `methods` (`google`, `github`, `magic-link`,
  `password` with signin/signup tabs, `phone` OTP, `anonymous`); order =
  render order; layout is OAuth row → divider → one field method → optional
  anonymous. Every handler is optional and defaults to a mock that resolves
  `{ ok: true }`, so the card is fully interactive in previews/modals with
  zero Convex wiring; real apps pass handlers wired to `useAuthFlow()`.
  Reuses the existing `GoogleButton` / `MagicLinkForm` / `AnonymousButton`
  blocks; adds `GithubButton` (inline SVG — lucide dropped brand icons),
  `PasswordBlock` (signin/signup Tabs), and `PhoneForm` (2-step phone →
  6-digit OTP via `input-otp`). New files `components/AuthCard.tsx` +
  `components/auth-card-blocks.tsx`; barrel exports `AuthCard` / `AuthCardProps`
  / `AuthMethod`. The production full-page `SignInPage` is unchanged.
- **convex-auth preview** rebuilt as Tabs over AuthCard variants — Magic
  link · Email + password · Google · Phone · Combined — each tab is the same
  `<AuthCard>` with a different `methods` prop.
- slice + catalog bumped 0.2.1 → 0.3.0; `input-otp` added to shadcn deps.

### 2026-05-31 — merge database-cell-selection into notion-database + warning sweep

- **`database-cell-selection` merged into `notion-database` v0.16.0** (NPC
  parity). The `useDragFill` hook + `SelectableCell` component now live in
  `notion-database` (`hooks/useDragFill.ts`, `components/cells/SelectableCell.tsx`)
  and are **wired into `TableView`**: click a cell to select it, drag the
  bottom-right handle up/down to copy its value into the spanned rows via the
  `onRowUpdate` callback. Active only when interactive (not `readOnly` +
  `onRowUpdate` supplied). `brand` token swapped for `primary` to match the
  existing row-selection styling. Barrel re-exports `useDragFill` / `FillSource`
  / `SelectableCell`; `notion-blocks` re-points its drag-fill re-export at
  `notion-database`. Standalone slice dir + catalog entry + preview route
  removed; `layouts.ts` ref dropped. Catalog 44 → 43.
- **Swept the pre-existing audit warnings.**
  - `config.ts` titles aligned to `slice.json` for `code-block`, `equation`,
    `notifications`, `notion-shell` (audit:slices now 0 warnings).
  - Raw `<button>` in `app/preview/slices/theme-presets/page.tsx` wrapped in
    shadcn `<Button>`.
  - `audit-convex-features`: documented the two intentional `@convex-dev/auth`
    deviations as carve-outs (`auth.ts` is the convexAuth entry by convention;
    `auth/_schema.ts` exports `authTablesExt` because it *extends* the library's
    own `authTables`). Audit now reports "all features canonical".

### 2026-05-31 — catalog prune: cut generic/dead slices + merge sections

- **Catalog 59 → 44.** Removed commodity slices that are widely available
  elsewhere (shadcnblocks / magicui / tailwindui) or are dead/niche, keeping
  the differentiators (notion-database, ai-stack, create-your-mcp, ID
  payments).
- **Hard-deleted** (dir + catalog + backend where present): `database-io`
  (deprecated re-export shim), `i18n-translate` (Google-Translate widget),
  `hero`, `cta`, `socials` (-6 convex fns), `document-checklist` (-7 convex
  fns; niche job-search tracker). Dropped dead convex scaffolds
  `audit-log` / `search` (0 endpoints) + `example-feature` (demo).
- **Merged into `landing-sections` v0.2.0** (dropped standalone catalog
  entries): the generic section renderers. Dirs that in-repo templates still
  import (`blog-section`, `pricing-page`, `portfolio-section`,
  `testimonials-grid`, `faq-section`, `feature-grid`, `changelog-feed`)
  keep their code (keep-dir / drop-catalog precedent), so template builds are
  unaffected — they're just no longer sold as separate slices.
- **Merged `subscribers` → `resend-newsletter` v0.1.3.** Standalone
  `subscribers` slice + catalog entry removed; its list backend
  (`convex/features/subscribers`) is retained and now documented as part of
  resend-newsletter.
- **Dropped `full-width-toggle` from catalog** (kept dir — `dashboard-shell`
  imports it; nulled its dangling peer).
- Regenerated `registry.generated.ts`, `manifest.json`, per-slice `agent.md`;
  pruned `family-map.ts`. Typecheck + audit:slices + validate:slices +
  audit:convex-features + gen checks all green.

### 2026-05-31 — notion-database date-range cell fix + catalog tidy

- **DateCell range now visible in the column.** `dateRange` was derived
  only at mount, so toggling the date property's End-date switch left
  already-rendered cells unchanged. Range is now derived live (`!!v.end
  || !!prop.dateRange`) and the cell shows a `Start → End date` slot
  whenever range is active — so the End-date toggle visibly affects the
  column. Per-cell override (popover Switch) still wins for one row.
- **Catalog tidy.** `notion-database` title/description were a multi-
  paragraph wall — trimmed to a short title ("Notion Database") + a
  one-paragraph description; release history stays here in CHANGELOG.
  `manifest.json` regenerated (was stale at v0.13 with the old title).
- **"Doubled" slice — not a bug.** Every slice appears in both the
  manifest's `features[]` and `slices[]` arrays because `loadFeatures()`
  derives features 1:1 from slices (legacy back-compat for old
  `--features` CLI + MCP `rr_list_features`; `features.ts` was deleted
  2026-05-09). The site catalog reads `slices.ts` directly — one entry.

### 2026-05-31 — notion-database per-type Edit-property config panel + date ranges in views

Follow-up to the config-driven menu: the dropdown now differs **per
property type** in a second dimension — an "Edit property" submenu whose
body is type-specific. Plus the date example the user asked for: an
End-date toggle that actually feeds Calendar + Timeline.

**Shipped (notion-database v0.14.0 → v0.15.0, notion-shell v0.7.1 → v0.7.2):**
- `components/column-header/panels/` — `PROPERTY_TYPE_PANEL` registry +
  per-type config panels:
  - `NumberPanel` — format (number/decimal/percent/currency) · decimals · currency code.
  - `DatePanel` — date format · include-time · time format · **End date (range)** toggle (editable `date` only).
  - `FormulaPanel` — expression input. `UniqueIdPanel` — prefix. `SelectPanel` — options summary.
  - `RelationPanel` — target database. `RollupPanel` — relation prop · target prop · aggregate.
  - `EditPropertyPanel` router — shared Name + Description + the routed type panel; every edit flows through one `onPatch(Partial<Property>)`.
- Menu: `edit_property` replaces the standalone `rename` item (Name lives
  in the panel now). `MenuItemContext` gained `prop` / `db` / `databases`;
  `ColumnHeaderActions.patch` replaces `rename`.
- `ColumnHeaderMenu` props: `onPatch` replaces `onRename`; added optional
  `db` + `databases` (relation/rollup pickers; degrade to a hint when
  absent). Re-pull on `rr update`.
- **notion-shell `Property.dateRange`** (new field) — date column defaults
  to a start→end range. `DateCell` opens in range mode when set.
- **Date ranges now drive views** (the user's ask):
  - `bucketByDate` spans every day from `date`→`end` → `CalendarView`
    renders multi-day bars (no view edit needed).
  - `TimelineView` falls back to the start column's own `end` when no
    separate end-prop is configured → a single range column draws the bar.

tsc green · audit:slices + file-size + docs-primitives clean · build green.

### 2026-05-31 — notion-database config-driven column-header menu (nosion parity)

Live `/slices/notion-database` had a flat per-column menu identical for
every property type; notion-page-clone's is config-driven and adapts to
the column. Rebuilt rr's to match the structure (prop-driven, no
`useDbAdapter`).

**Shipped (notion-database v0.13.0 → v0.14.0):**
- `components/column-header/menu-config.ts` — `PROPERTY_TYPE_MENU_CONFIG`
  maps every `PropertyType` → an ordered `mainMenu` of item keys (number →
  Calculate, select/status → Group, computed types drop irrelevant ops).
  `sectionOf` drives automatic separator placement; `inferFilterOp` seeds
  the right filter op per type.
- `components/column-header/items.tsx` — `MenuItemKey → renderer`
  registry: rename · change-type submenu (full dynamic type list) ·
  filter · sort submenu · group · calculate submenu · hide · duplicate ·
  insert-left/right · move-left/right · delete. Each self-hides when its
  host callback is absent.
- `components/column-header/actions.ts` — pure prop-driven stand-in for
  upstream's `useColumnHeaderActions` hook; closes over callbacks instead
  of a store, computes `flags` (filtered / currentSort / grouped /
  groupable / currentCalc / calcs / isTable / canMove*).
- `components/column-header/types.ts` — `MenuItemKey`, `ColumnHeaderActions`,
  `ColumnHeaderFlags`, `MenuItemContext`, `PropertyTypeMenuConfig`.
- `ColumnHeaderMenu.tsx` rewritten as a config render loop; **props
  changed** — now `view` + `index` + `propertyCount` + the new callbacks
  instead of the old flat `onSortAsc/onSortDesc/onSetCalc`. Re-pull on
  `rr update`.
- `NotionDatabase` gained optional `onPropertyDuplicate` /
  `onPropertyInsert` / `onPropertyMove` (items appear only when wired).
- Preview (`/preview/slices/notion-database`) wires all three via new
  `previewColumnOps.ts` transforms — duplicate copies per-row values,
  insert adds an adjacent text column, move reorders one slot.

tsc green · audit:slices + file-size + docs-primitives clean.

### CK-1D Phase 4 — 2026-05-26 — notion-database DB-level menu + full-page shell (silong port)

Final big functional gap from the upstream audit. Closes the "0% on
database-level operations" finding without dragging Convex coupling
into rr.

**Shipped (notion-database v0.11.0 → v0.12.0, notion-shell v0.6.0 → v0.7.0):**
- `components/database-shell/DatabaseMenu.tsx` (130 LOC) — popover w/
  rename / duplicate (structure-only OR with rows) / lock-toggle /
  delete (window.confirm fallback). Every action hidden when its
  callback is omitted, so the same component serves read-only viewers
  and full-edit admins.
- `components/database-shell/DatabasePage.tsx` (75 LOC) — full-page
  wrapper composing a big header (icon slot + inline title input +
  DatabaseMenu) over a NotionDatabase body. Use for canonical
  `/db/[id]` routes.
- `components/notion-database-helpers.tsx` (43 LOC NEW) —
  `buildColumnHeader` extracted from NotionDatabase to keep the
  orchestrator under the 200-LOC cap after adding the `headerActions`
  slot.
- NotionDatabase grew a `headerActions?: ReactNode` slot — hosts can
  drop a DatabaseMenu inline without switching to DatabasePage.
  NotionDatabase 205 → 192 LOC after helpers extraction.

**Type model extension (notion-shell):**
- Database += `locked?: boolean` — read by DatabaseMenu's lock-toggle.

**Architectural strip vs upstream:**
- `useDbAdapter` (Convex hooks bundle) — host wires data + mutations.
- SubItemsPicker (sub-items tree relation) — needs
  `subItemsParentPropId` schema field + `subItemsTree.ts` lib. Tracked
  as a sub-phase.
- IconPickerPopover — lives in rr's separate `icon-picker` slice;
  DatabasePage exposes `iconSlot` so host wires it explicitly.
- DataMenu — lives in the deferred `database-json` slice (export /
  template builders are in notion-database itself but no menu yet).
- PropertiesMenu (inline visibility toggles) — already covered by the
  per-column ColumnHeaderMenu.
- Native window.confirm + window.prompt — keeps zero new dialog deps.

**Parity uplift:** notion-database ~75% → ~83% vs upstream.

### CK-2D — 2026-05-26 — slice + template status tags (beta / wip / deprecated / experimental / coming-soon)

Catalog UX upgrade. Surface readiness signals on slice + template
detail pages so users can tell at a glance whether a resource is
production-ready, mid-port, or on the way out.

**Status taxonomy** (one badge per resource, defaults silently to
"stable"):

| Status | Color | Semantics |
|---|---|---|
| stable | none rendered | production-ready, default (available) |
| beta | blue | feature-complete, polishing |
| wip | amber | in-develop — visible but flagged not-ready |
| draft | zinc | hidden from default catalog (truly unfinished) |
| experimental | fuchsia | research preview, may break |
| deprecated | red strike-through | scheduled for removal |
| coming-soon | cyan | announced, not yet shipped (templates only) |

**Shipped:**
- `lib/content/slices.ts` — `Maturity` union widened from
  `"draft"|"beta"|"stable"` to add `wip`, `experimental`, `deprecated`.
- `lib/content/layouts.ts` — `LayoutStatus` widened similarly,
  preserving `coming-soon`.
- `components/site/maturity-badge.tsx` (47 LOC NEW) — single component
  handles every value across both unions. `stable` renders nothing
  (silent default to keep noise low).
- `app/(docs)/slices/[slug]/slice-detail-header.tsx` — renders
  `<MaturityBadge status={slice.maturity} />` in the header strip.
- `components/site/template-detail.tsx` — same render point. Status
  threaded through `TemplateDetailData.status` from the layout
  detail page server prop.
- `components/build/template-picker.tsx` — `TemplateOption.status`
  union widened to match.

**Seeded values:**
- `notion-database` → `beta` (active multi-phase CK-1D port)
- `notion-shell` → `beta` (Property + DatabaseViewConfig shape
  evolving alongside notion-database)
- `database-io` → `deprecated` (shim — merged into notion-database
  v0.6; slated for removal in v1.0)

Other entries remain default-stable. Future port waves can seed
`beta` / `wip` as they touch each slice.

### CK-1D Phase 7 — 2026-05-26 — notion-database Intl number + date formatters (silong port)

Lifted Intl-based formatters from notion-page-clone. Single source of
truth so cells / cards / charts / rollups render identically and
respect locale + currency-code preferences.

**Shipped (notion-database v0.10.0 → v0.11.0, notion-shell v0.5.0 → v0.6.0):**
- `lib/numberFormat.ts` (83 LOC) — resolveNumberFormat, formatPropertyNumber,
  COMMON_CURRENCIES (USD/EUR/GBP/JPY/CNY/IDR/SGD/MYR/AUD/CAD/CHF/INR/KRW/THB/VND/PHP).
- `lib/dateFormat.ts` (107 LOC) — parseYmdToLocal, formatYmd (6 patterns:
  full/short/mdy/dmy/ymd/relative), formatTime (12h/24h), formatDateValue
  (combined date + optional time + range), label maps.
- NumberCell: currency renderer now reads `prop.numberCurrencyCode` (was
  hardcoded "USD"). Backwards-compatible — defaults to "USD" when unset.
- DateCell: now accepts optional `prop` — routes through `formatDateValue`
  when any of `dateFormat` / `timeFormat` / `dateIncludeTime` is set,
  otherwise falls back to the previous date-fns "LLL d, yyyy" output.
  Wired from property-cells dispatcher.

**Type model extension (notion-shell):**
- Property += `numberCurrencyCode?: string`
- Property += `dateFormat?: "full" | "short" | "mdy" | "dmy" | "ymd" | "relative"`
- Property += `timeFormat?: "12h" | "24h"`
- Property += `dateIncludeTime?: boolean`
- `DatabaseViewConfig` extracted to `./view-config-types.ts` so
  `types.ts` stays under the 200-LOC cap.

**Strip vs upstream:** `dateNotification` field omitted — rr's
notion-database doesn't ship a calendar reminder runtime, so the
related labels stay in the editor slice when that lands.

**Parity uplift:** notion-database ~70% → ~75% vs upstream.

### CK-1D Phase 5 — 2026-05-26 — notion-database checkbox gutter + calendarDrag helpers

Light polish wave. Two additions, both wire into existing pieces
without breaking the public API.

**Shipped (notion-database v0.9.0 → v0.10.0):**
- `components/row-selection/Checkboxes.tsx` (74 LOC) —
  HeaderCheckboxGutter (tri-state select-all / clear with
  `aria-checked="mixed"` indeterminate state) + RowCheckbox (per-row
  toggle, stops propagation so it doesn't fight cell click-to-edit).
  Both require RowSelectionProvider in scope. Raw `<button>` used
  intentionally — wrapping in shadcn Button erases `role="checkbox"`
  context and breaks screen reader announcements.
- `lib/calendarDrag.ts` (75 LOC, pure, verbatim) — parseExistingDate,
  formatDateValue, shiftYmd, computeDateShift, parseDropTargetId.
  Hosts wire these inside their own DndContext to enable calendar /
  timeline drag-to-move without taking on @dnd-kit coupling inside
  the slice itself.
- TableView updated 83 → 97 LOC — automatically renders a leading
  checkbox gutter column when a RowSelectionProvider is in scope.
  `colSpan` math adjusted; visual diff is invisible without provider.

**Scope-down (deferred):**
- SortableHeader (column drag-reorder) + SortableRow (row
  drag-reorder) — upstream's implementations are tightly coupled to
  a flexbox-table refactor + InlineRowTitle + SelectableCell. Porting
  forces a TableView rewrite that blows the 200-LOC view cap. Tracked
  for a future "table-dnd" sub-slice.
- CalcFooter wiring — already active in rr's TableView since v0.6.

**Slice metadata:**
- shadcn deps unchanged (no new primitives)
- packages/cli/lib/manifest.json regenerated
- lib/content/slices.ts SSOT synced
- CHANGELOG appended Unreleased § CK-1D Phase 5

**Parity uplift:** notion-database ~66% → ~70% vs upstream.

### CK-1D Phase 3 — 2026-05-26 — notion-database row multi-select (silong port)

Lifted **row-selection** subsystem from notion-page-clone. Third
biggest gap from the upstream audit (multi-select + bulk delete +
marquee drag-band were all 0% in rr).

**Shipped (notion-database v0.8.0 → v0.9.0, 11 files, 617 LOC):**
- `components/row-selection/RowSelectionProvider.tsx` (82) — Context
  + state w/ stale-id pruning
- `components/row-selection/RowMarqueeOverlay.tsx` (41) — selects
  rows whose bounding rect intersects the band
- `components/row-selection/RowSelectionToolbar.tsx` (78) — floating
  bottom-center action bar
- `components/row-selection/RowSelectionKeyboard.tsx` (68) — Esc
  clear + Del/Backspace bulk delete
- `components/row-selection/Marquee.tsx` (29) — portal-mounted rect
  renderer
- `components/row-selection/useMarqueeDrag.ts` (189) — gesture hook
  w/ AutoCAD window/crossing modes + long-press text activation
- `components/row-selection/marquee-collect.ts` (61) — pure DOM
  hit-test (extracted to keep hook under cap)
- `components/row-selection/marquee-predicates.ts` (21) — interactive
  + text-target bail conditions
- `components/row-selection/marquee-types.ts` (30) — primitive types
- `components/row-selection/index.ts` (18) — barrel
- TableView updated (66 → 83 LOC) — rows now carry
  `data-row-shell-id` + render primary-tinted ring when wrapped

**Architectural strip vs upstream:**
- Toolbar: dropped "Edit property across selection" popover (depends
  on PropertyFormInput, deferred slice). Host injects custom bulk-edit
  UI via `extraSlot` prop.
- Keyboard: replaced `useDbAdapter().deleteRow` with `onDelete`
  callback prop.
- Marquee primitive lifted in-tree (rr didn't have a shared marquee
  helper); split into 5 sibling files to honour the 200-LOC cap.

**Slice metadata:**
- shadcn deps += `separator`
- packages/cli/lib/manifest.json regen
- lib/content/slices.ts SSOT synced
- CHANGELOG appended Unreleased § CK-1D Phase 3

**Parity uplift:** notion-database ~58% → ~66% vs upstream.

### CK-1D Phase 2 — 2026-05-26 — notion-database relation + rollup cells (silong port)

Lifted **relation + rollup** subsystem from notion-page-clone. Closes
the second-biggest gap from the upstream audit (linked-data + computed
aggregates were both 0% in rr — host couldn't model cross-database
references at all).

**Shipped (notion-database v0.7.0 → v0.8.0, notion-shell v0.4.0 → v0.5.0):**
- `cells/RelationCell.tsx` (182 LOC) — popover link picker w/ search,
  inline target-db selector, stale-link healing ("Remove N stale
  links"), optional "+ Create new row in <db>" affordance.
- `cells/RollupCell.tsx` (155 LOC) — read-only aggregate display with
  inline relation / aggregate / target-property pickers and
  graceful "property removed" recovery.
- `lib/relationCandidates.ts` (59 LOC) — pure candidate filter,
  lifted verbatim from upstream.
- `lib/computeRollup.ts` (95 LOC) — pure aggregator (count /
  count_unique / values / sum / avg / min / max / earliest / latest /
  checked / percent_checked). Stripped vs upstream: nested formula
  recursion omitted (returns "—" for formula targets).

**Type model extension (notion-shell):**
- `PropertyType` += `"relation"` `"rollup"` (was 18 → now 20)
- `RollupAggregate` new export
- `Property` extended with `relationDatabaseId`, `rollupRelationPropertyId`,
  `rollupTargetPropertyId`, `rollupAggregate`
- `PROPERTY_TYPE_META` += 2 entries (relation = advanced/non-CSV;
  rollup = computed)

**Dispatcher wiring:**
- `property-cells.tsx` adds 2 cases + 3 new optional `CellArgs`
  fields (`pages`, `databases`, `onCreateRelatedRow`).
- `NotionDatabase.tsx` surfaces matching 3 new top-level props so
  the host stays the source of truth for cross-database state.

**Architectural strip vs upstream:**
- No `useDbAdapter()` — host wires mutations via `onPropertyChange` +
  `onCreateRelatedRow` callbacks.
- No `DynamicIcon` — minimal text fallback inside chips.
- `<select>` swapped for shadcn `<Select>` (matches rest of rr).
- Formula recursion in rollup stripped — keeps lib/computeRollup
  pure and dependency-free (95 LOC vs upstream's ~50 LOC subset of
  a 700+ LOC formula engine).

**Parity uplift:** notion-database ~53% → ~58% vs upstream.

### CK-1D Phase 1 — 2026-05-26 — notion-database row-detail peek (silong port)

Lifted **row-detail subsystem** from notion-page-clone (`row/components/Row*`)
into `frontend/slices/notion-database/components/row-detail/` — 6 files,
409 LOC total, max 92 LOC/file (well under audit cap). Closes biggest
parity gap surfaced in the upstream audit (row-detail was 0% in rr —
host had to build its own sheet/dialog from scratch).

**Shipped (notion-database v0.6.0 → v0.7.0):**
- `useRowOpenMode` — localStorage-persisted "sheet"|"dialog" pref with
  cross-tab sync (storage event). Lifted verbatim from upstream.
- `RowOpenModeSwitcher` — three-button toggle (sheet / dialog /
  open-as-page). Page button only renders when host passes
  `onOpenAsPage` (no router → no button).
- `RowDetailBody` — shared chrome: header (switcher + close) + icon
  slot + editable title + properties slot + blocks slot. Pure /
  slot-driven — upstream's `useDbAdapter` / `useNotionAdapter` /
  `useDatabasesComponents` / `PageCommentsProvider` couplings ALL
  stripped. Host supplies icon picker, properties form, and block
  editor via render slots.
- `RowDetailSheet` — right-side drawer wrapper around Body.
- `RowDetailDialog` — centered modal wrapper around Body.
- `RowPeek` — orchestrator: reads `useRowOpenMode`, picks Sheet or
  Dialog, injects switcher into header, wires `onOpenAsPage` one-shot.

**API exports (additive — no breaking changes):**
- `RowPeek`, `RowDetailSheet`, `RowDetailDialog`, `RowDetailBody`
- `RowOpenModeSwitcher`, `useRowOpenMode`
- types: `RowPeekProps`, `RowDetailSheetProps`, `RowDetailDialogProps`,
  `RowOpenMode`

**Slice deps bumped:** shadcn list extended with `sheet`, `dialog`,
`toggle-group`, `tooltip` (consumer's `npx rr add notion-database`
will now scaffold these primitives if missing).

**Audit parity uplift:** notion-database 45% → ~53% vs upstream (closes
the row-detail gap, 4 files, ~1k upstream LOC — rr ships equivalent
in 409 LOC by slot-decoupling the heavy editor/comments/Convex deps).

### v0.6.0 (open-silong sync) — 2026-05-22 — notion-database mega-merge (Phase 7.10)

Single-slice install path for full Notion-like database table. Closes
the "2-slice install friction" reported by upstream consumer: previously
required `npx rr add notion-database` + `npx rr add database-io` for
the complete experience. Now just `npx rr add notion-database`.

**Merged into notion-database (v0.5.3 → v0.6.0):**
- `components/io/DatabaseIOActions.tsx` (was database-io/components/)
- `components/io/CsvImportDialog.tsx` + `csv-mapping.tsx`
- `components/io/JsonImportDialog.tsx`
- `lib/io/csv.ts` + `serialize.ts` + `template.ts`
- Re-exported from `@/features/notion-database` barrel

**API fix:** `CsvNewProperty` + `JsonImportResult.newProperties[]` now
expose `tempId: string` (was missing — host couldn't remap rowProps
keys when persisting). Single import handler now serves both formats
with proper id remapping.

**Catalog renames:** notion-database title bumped to "Notion-like
Database Table — full table with import/export (11 views · 16 cells
· CSV + JSON)". Tags + csv, json, import, export, template, data,
backup.

**`database-io` slice DEPRECATED:**
- `frontend/slices/database-io/index.ts` reduced to a thin re-export
  shim from `@/features/notion-database` (back-compat).
- Catalog entry marked `[DEPRECATED]` in title + tagline + description.
- `previewPath` redirects to `/preview/slices/notion-database`.
- Old `app/preview/slices/database-io/page.tsx` deleted.
- Scheduled for full removal in v1.0.

**Preview improvements:**
- `InstallCTA` removed from `/preview/slices/notion-database/page.tsx`
  (install info already lives in `/(docs)/slices/notion-database`
  detail page header + Code tab — no duplication).
- New `useLocalStorageState` hook in `previewState.ts` — demo state
  rehydrates on page reload (was reset every refresh). Namespace key:
  `silong-preview:notion-database:v1:{db,rows}`.
- `DatabaseIOActions` toolbar mounted above NotionDatabase — CSV +
  JSON import/export demoable end-to-end from the preview.
- Reset button clears localStorage in addition to resetting state.

**No CK conflict:** changes scoped to notion-database + database-io +
their preview. CK agent's other work (workspace-shell, family-map,
catalog-tabs RSC fix) untouched.

### v0.5.2 (open-silong sync) — 2026-05-22 — PROPERTY_TYPE_META SSOT registry

Closes type-list drift discovered during cross-slice audit. Three
places hardcoded `PropertyType[]` arrays with mismatched counts
(ColumnHeaderMenu: 10, csv-mapping NEW_TYPES: 12, types.ts union: 16).
Adding a new type (v0.6 relation/rollup) would have required syncing
all 3 sites — high drift risk.

- **New** `notion-shell/property-type-meta.ts` (65 LOC) — `PropertyTypeMeta` interface + `PROPERTY_TYPE_META` registry (one entry per type with `label / category / userAddable / csvImportable / computed` flags) + derived `PROPERTY_TYPES_USER_ADDABLE` (16) + `PROPERTY_TYPES_CSV_IMPORTABLE` (12) constants.
- **Refactored** `notion-database/components/ColumnHeaderMenu.tsx` — drops local `PROPERTY_TYPES` array; reads `PROPERTY_TYPES_USER_ADDABLE` + `PROPERTY_TYPE_META[t].label` from `@/features/notion-shell`. Now exposes ALL 16 user-addable types (was 10) — users can now add files / person / formula / created_time / last_edited_time / unique_id columns via the menu.
- **Refactored** `database-io/components/csv-mapping.tsx` — `NEW_TYPES` const stays as deprecated re-export of `PROPERTY_TYPES_CSV_IMPORTABLE` (back-compat); render loop reads from canonical list + uses `PROPERTY_TYPE_META[t].label` (was raw type name).
- **Adding new type** (e.g. v0.6 relation) now requires one edit (`property-type-meta.ts`) + the cell impl — every picker auto-discovers.
- Cell editor SSOT unchanged: `notion-database/components/cells/` is still the only source. database-io re-uses via `renderPropertyCell` re-export, no duplication.
- Open-silong typecheck + rr typecheck green. All files ≤ 200 LOC (types.ts split forced a sibling file to stay under the pre-commit gate).

### CK-1D — 2026-05-20 — workspace-shell slice (NavContext primitive)

New canonical slice `frontend/slices/workspace-shell/` + `convex/features/workspaceShell/` — atomic `(workspaceId, menuSetId)` NavContext, supersedes silo'd `menu-store` + `workspace-store` editors.

- **7 Convex tables** prefixed `workspaceShell_`: `menuSets`, `menuItems`, `itemComponents`, `wsAssignments`, `userAssignments`, `rolePerms`, `navContext`.
- **Resolver chain** (server): user cache → user assignment → workspace default → system default. Single round-trip via `getNavContext`.
- **Editor** at `/dashboard/workspace-shell?tab=menus|tree|settings` — FeatureShell.tabs primitive, URL-routed.
- **WorkspaceSwitcher v2** — 2-tier dropdown (workspace × menuSet) + inline `ForkMenuSetDialog`. Mounts via `<NavContextMount>` inside `WorkspaceProvider`.
- **Sidebar dual-read** — `useNavItems` prefers NavContext via `toLegacyMenuItems` adapter; falls back to legacy when empty (zero break for consumers w/o migration).
- **Tiered RBAC** — `menus.manage` (admin set/CRUD) + `menus.fork` (user fork-from-system).
- **Idempotent migration** `migrations/menusToWorkspaceShell:up` — in-memory map to dodge Convex 4096 read-op limit. Tested: 56 menuSets + 1106 menuItems + 56 wsAssignments. Rerun = all skipped via `metadata.__legacyId` stamp.
- **30-day deprecation shims** — legacy `/dashboard/menu-store` + `/dashboard/workspace-store` wrapped w/ `DeprecationBanner` countdown. Hard-removal runbook at consumer's `docs/cleanup/2026-06-19-workspace-shell-cleanup.md`.
- Catalog: 46 → 47 slices.

**Consumer-test findings (2026-05-22, content-rahmanef-com)**:

- 🐛 **CLI install empty** — `npx rahman-resources add workspace-shell` created empty dirs because template-base mirror not yet pushed to remote rr. CLI fetches from GitHub `main`; local catalog edits don't reach `gen-manifest` until commit lands. *Fix: stage `template-base/frontend/slices/workspace-shell/` + `template-base/convex/features/workspaceShell/` then push.*
- 🐛 **8 hard SuperSpace deps** — slice imports `@/frontend/shared/{lib/features/defineFeature, foundation/provider/WorkspaceProvider, ui/components/ResponsiveDialog, ui/layout/feature-shell/FeatureShell, foundation/utils/convex/any-api, preview, settings, ai/agent}`. Consumer without a `frontend/shared/` tree = unmountable.
- ✅ **3 working deps** — `@/lib/utils` (`cn`), `@/components/ui/{dropdown-menu, button, input, label, switch}` (standard shadcn paths).
- ✅ **Migration consumer-safe** — idempotent + legacy tables untouched + shim banner preserves old URLs.

**Lift-up work pending** (P0 for portability):
1. Inline or slice-local `defineFeature` helper.
2. Replace `WorkspaceProvider` with prop `workspaceId: Id<...>`.
3. Drop `FeatureShell` wrapper — emit plain `<Tabs>` (one less primitive dep).
4. Drop `any-api` cast — consumer Convex types may differ; ship slice-local `api.d.ts` shim or accept TS2589 risk.
5. Drop `defineFeaturePreview` registration (SuperSpace-only registry).
6. Drop `subAgentRegistry` (`agent/index.ts`) — SuperSpace-only AI surface.
7. RHF + Zod check on `ForkMenuSetDialog` — currently no validator.

Status: shipped to SSOT (superspace, commits `be72cd99`…`ee7dd006`). Catalog entry shipped (`lib/content/slices.ts` + `lib/content/changelog.ts`). Template-base mirror **uncommitted** — pre-commit hook blocked by pre-existing tsc errors in `lib/shared/store/*` (`a0d1f3f` database-json sweep) referencing `@convex/_generated/*` which tsconfig excludes. **Resolve upstream before pushing mirror.**

### CK-J — 2026-05-21 — database-json standalone slice

- New peer slice `frontend/slices/database-json/` — JSON wire format v1 (schema + rows) for notion-database.
- **JsonActions** — dropdown w/ Export (Blob-URL download) + Import.
- **JsonImportDialog** — file picker → schema diff preview → submit.
- **lib/serialize.ts** — exportDatabase / parseExport / diffSchema / buildImportResult / downloadJson.
- Schema match: property name (case-insensitive) + exact type. Mismatched listed as new.
- **Result shape MIRRORS CsvImportResult** — single host onImport handler can serve both formats.
- Dropped vs upstream: AI assist (AIAssistDialog + lib/ai.ts), cover, blocks, sub-items, templates.
- Preview `/preview/slices/database-json` — 3-row demo + Export downloads .json + Import + collapsible wire-format viewer.
- Catalog: 45 → 46. JSON 0% → 100%. Database adaptation ~80% → ~82%.

### CK-1C — 2026-05-21 — notion-database FormView (11/11 views)

- **FormView** lifted — title input + per-property inputs via reused `renderPropertyCell` (no separate PropertyFormInput widget), submit → `onRowCreate({title, rowProps})` callback. Settings panel (show/required toggles + title + description + success message).
- **ViewProps** + **NotionDatabaseProps** + **DatabaseViewConfig** extended (onRowCreate / formTitle / formDescription).
- VIEW_REGISTRY now has all 11 entries.
- notion-database `0.3.0` → `0.4.0`. Coverage: views 10/11 → 11/11 (100%). Adaptation ~76% → ~80%.
- Preview /preview/slices/notion-database uses React state so Form submit actually appends a row.

### CK-4 — 2026-05-21 — database-csv standalone slice

- New peer slice `frontend/slices/database-csv/` — Notion-style CSV import + export for `notion-database`.
- **CsvActions** — dropdown w/ Export (Blob-URL download) + Import items.
- **CsvImportDialog** — file picker → auto-map columns → user re-pick (existing prop / Title / skip / + New of 12 types) → submit emits single `onImport({newProperties, rows})` callback. Host owns persistence.
- **csv.ts** — `parseCsv` / `valueFromString` / `exportDatabaseToCsv` / `downloadCsv` helpers exported standalone.
- Auto-seeds select / multi_select / status options from CSV values. Computed types (formula / created_time / last_edited_time / unique_id) recognised + never written.
- Preview `/preview/slices/database-csv` — 3-row demo w/ working in-memory Export + Import.
- Catalog: 44 → 45 slices. CSV coverage 0% → 100%. Database adaptation ~72% → ~76%.

### CK-3 — 2026-05-21 — notion-database +6 property cells

- New cells: **FilesCell** (paste-URL chips), **PersonCell** (initials avatars), **FormulaCell** (expression engine w/ live preview), **CreatedTimeCell** + **LastEditedTimeCell** (readonly system timestamps), **UniqueIdCell** (auto-derived).
- New `lib/formula.ts` — `{{title}}` / `{{prop}}` interpolation + fn(arg, …) + `=expr` math. Pure, no backend.
- PropertyType: 10 → 16 (+ person, files, formula, created_time, last_edited_time, unique_id).
- Property: + formulaExpression?, + uniqueIdPrefix?. Database: + uniqueIdCounter?.
- Existing select / multi_select extracted to dedicated cells for ≤200 LOC budget.
- notion-database `0.2.0` → `0.3.0`. Coverage: 16/17 property types (94%). Adaptation ~65% → ~72%.
- Deferred: relation + rollup (need cross-DB context — wait for upstream mega-bundle).

### CK-wave — 2026-05-21 — notion-database 10/11 views + Filter/Sort builders

- **CK-1A** (`a7532da`) — Lifted **ChartView** (recharts) + **DashboardView**. Views 6→8/11. DatabaseViewConfig extended with chart/dashboard fields. ChartKind + ChartAggregate exported.
- **CK-1B** (`e742c10`) — Lifted **MapView** (SVG world + lat/lng pins) + **TimelineView** (Gantt drag-to-shift). Views 8→10/11 (91%). New helpers: visibility / format / keyboard / timeline-helpers / map-svg.
- **CK-2** (`7b81d41`) — Lifted **FilterBuilder** + **SortBuilder** (shadcn-Select-based). ViewOptions refactored to delegate. Coverage: filter/sort UI 0→100%.
- **CK-final** — notion-database `0.1.0` → `0.2.0`. recharts npm dep added. Catalog title/description/tagline/tags refreshed.
- **Adaptation**: notion-database ~35% → ~65% upstream parity.
- **Deferred**: CK-1C (FormView), CK-3 (file/person/timestamp cells), CK-4 (database-csv standalone). All wait for upstream mega-bundle (Phase 5, ~3wk).

### CJ-wave — 2026-05-21 — Catalog cleanup

- **Deleted** `frontend/slices/pages/` — dead `defineFeature` skeleton (routes:[], zero live imports).
- **Dropped** `notion-blocks` catalog entry — pure re-export aggregator of 4 atoms (equation / code-block / notifications / database-cell-selection). Atoms remain individually catalogued; slice dir + barrel kept so consumer imports still resolve.
- **Deleted** `app/preview/slices/notion-blocks/page.tsx` preview route.
- **Retitled** `theme-presets` → "tweakcn Theme Loader (30+ presets)" — disambiguate from `theme-preset-switcher` (Convex-backed OKLch). No file moves.
- **Template** `notion-page-clone/shared/nav-config.ts` link `/slices/notion-blocks` → `/slices/notion-shell` to avoid catalog detail 404.
- Catalog count: 45 → 44 slices.
- **Deferred**: notion atom consolidation waits for upstream `notion/` mega-bundle (open-silong Phase 5, ~3wk per `docs/rr-sync/2026-05-21-notion-mega-lift-plan.md`).

---

## [1.7.0] — 2026-05-18

Live on npm: `rahman-resources@1.7.0`, `rahman-resources-mcp@1.1.0`,
`rahman-shared@0.2.0`.

### Slices — 7 new canonical UI slices

R + S + T waves added the missing marketing-page primitives so every
template consumes one SSOT per surface (pricing, features, FAQ,
testimonials, blog, changelog, portfolio).

- **`pricing-page`** — `PricingSection` + tiers + optional FAQ. Three
  `featuredVariant` styles (`ring` | `scale` | `tint`).
- **`feature-grid`** — `FeatureGridSection` with 4 layouts: `cards`,
  `minimal`, `alternating` (image+text rows), `grouped` (sub-categorized).
- **`faq-section`** — `FAQSection` accordion with `single`, `two-column`,
  `grouped` layouts + optional footer CTA.
- **`testimonials-grid`** — `TestimonialsGridSection` with `cards`,
  `quote-stack`, `masonry` layouts. Star ratings + avatars + featured ring.
- **`blog-section`** — `BlogListSection` (cards/list/featured-split) +
  `BlogPostView` (cover/meta/body/related). Routing left to consumer via
  `hrefFor`.
- **`changelog-feed`** — `ChangelogFeedSection` with timeline / cards /
  list layouts. 5 entry kinds (feature/improvement/fix/chore/breaking) +
  optional sub-grouped bullets per entry.
- **`portfolio-section`** — `PortfolioListSection` (uniform/masonry/
  asymmetric) + `PortfolioDetailView` (cover/sections/gallery/related).

### Slices — slot extensions (U-wave)

Each canonical section now accepts a render-slot to keep template-specific
customization without forking the slice:

- `PricingSection.renderTierCta(tier)` — replace default Link CTA with a
  modal trigger, custom button, etc.
- `PortfolioItem.sections[]` — structured `{ heading, body }[]`. Auto-grid
  by length (2→2col, 3→3col).
- `BlogPostView.afterContent` — comments / newsletter signup slot.
- `BlogPostView.extraMeta` — view counter / read-time next to author.
- `BlogPostView.related` + `hrefForRelated` — related-posts strip.

### Templates — full SSOT migration

All 4 marketing templates now consume the canonical slices end-to-end:

| Template | Pages migrated |
|---|---|
| `saas-marketing-os` | /pricing, /features, /blog, /blog/[slug], /changelog, home sub-sections |
| `agency-studio-os` | /services (→ pricing-page), /portfolio, /portfolio/[slug] (sections) |
| `personal-brand-os` | /services (renderTierCta), /portfolio, /portfolio/[slug] (sections), /blog, /blog/[slug] (afterContent), inline FAQ → faq-section |
| `wirausaha-os` | /services (→ feature-grid grouped) |

Templates retained as intentionally bespoke (would lose semantic
information on migration): `konsultan-os` (newsletter archive),
`kreator-studio-os` (progress-bar UI), `riset-kit` (document library).

### Layout — three-column V-wave

Ported `ThreeColumnLayoutAdvanced` updates from superspace:

- **PanelSection compound** (Header / Items / Footer) + `PanelGroup` /
  `PanelGroupLabel` / `PanelMenu` / `PanelMenuItem` / `PanelMenuButton` /
  `PanelSeparator` primitives. Models shadcn sidebar API.
- **Trigger ≠ Header rule** — collapse trigger always renders when
  enabled; `leftHeader` chrome row now renders BELOW the trigger instead
  of replacing it.
- **Footer slots** — `leftFooter`, `centerFooter`, `rightFooter` props on
  `ThreeColumnLayoutAdvanced` + `sidebarFooter` / `mainFooter` /
  `inspectorFooter` on `FeatureThreeColumnLayout`.
- **Mobile drawer** — `MobileInspectorDrawer` accepts `header` + `footer`
  slot props so mobile path mirrors desktop chrome.
- Both copies kept in sync — template-base canonical (verbatim from
  superspace) + components/previews superset (`tone="layout"|"feature"`
  blue/muted variants preserved).
- Doc: `docs/architecture/three-column-layout.md`.

### Site — live previews (W-wave)

Each of the 7 new slices now has `/preview/slices/<slug>` with a layout
toggle and realistic seed data. The catalog page `/slices/<slug>` shows
an iframe instead of metadata-only.

### CLI

- Bumped to **1.7.0**.
- Manifest regenerated — 45 slices total (up from 32).
- MCP server bumped to **1.1.0** with refreshed slice resources.

---

## [1.6.x] — Q-wave (May 2026)

### Slices — generic CRUD primitives

`<CrudListView>` + `<CrudFormView>` + typed `CrudController<T>` /
`ColumnDef<T>` / `FieldDef<T>`. Replaced per-template bespoke admin tables
with shared primitives.

### Templates — 25 entities migrated

- saas-marketing: 6 CRUD + 2 new admin views + hybrid propagation
- konsultan-os, wirausaha-os: 6 entities each
- riset-kit: 5 entities
- agency-studio: Clients + Leads
- personal-brand: Leads + Newsletter + Comments + Chatbot
- kreator-studio: Comments + Performance

---

## [1.5.x] — P + O waves (Apr 2026)

### Templates — Pages CRUD on all 7

Shared `_shared/pages/` infra + `PagesView` + `PageEditorView` propagated
to every website template. `audit-templates.mjs` hard-errors if a
website-template ships without Pages CRUD.

### Posts editor

Full route + reducer + form for `saas-marketing-os`. Background fix:
sidebar bg color loss in split preview.

---

## [1.4.x] — M + N waves (Apr 2026)

### Site — security + infra (M-A)

- Rate-limit on public mutations.
- Strict CSP / `X-Content-Type-Options` / `Referrer-Policy` /
  `Permissions-Policy` headers.
- `isHidden` admin wiring.
- Env-var hygiene (no NEXT_PUBLIC_ leak of sensitive values).

### Site — Next.js primitives (M-B)

`next/link` everywhere, `next/image`, typed `catch (e: unknown)`,
`DateField` for date inputs across template-base.

### Site — preview design-system canon (M-C)

Single SSOT for preview chrome — zero drift between `/preview/*` pages.

### Site — UI/UX overwhelm reduction (M-D)

Sidebar grouping — 38 flat slices → 11 collapsible categories.

### Convex — per-feature canonical shape (N-C)

`_schema.ts` + `query.ts` + `mutation.ts` + `action.ts` per feature.

### Templates — defaults sweep (N-A)

90% zoom + public default for 7 website templates.

---

## [1.3.x] — L + K waves (Mar 2026)

- CLI publish prep — bumped 1.5 → 1.6 with audit chain self-doc.
- Consumer install REAL test (local CLI → /tmp).
- `.env.example` per-slice augment in CLI add flow.
- Schema unification (`oneOf SchemaA SchemaB`).
- pre-commit hook expanded to run full audit chain.
- `/llms.txt` + `agentPrompt` verification + catalog completeness audit.

---

## [1.2.x] — H + I + J waves (Feb 2026)

- Modernized install snippet → `npx rr init` flow.
- Fixed `template-base/package.json` `$HOME` leak.
- Catalog drift fixes (5 ai-* + platform-admin + 2 landing).
- `sync-slice-manifests` handles both schemas.
- 75 lint warnings → 0.

---

## [1.1.x] — E + F + G waves (Feb 2026)

- **200-LOC modularity rule** + `audit-file-size.mjs` guard.
- Refactored 8 top shipped-code offenders + drove grandfather list 35 → 0.
- Expanded `audit-file-size` SCAN_ROOTS + refactored 7 newly-discovered
  offenders.
- 15 missing slice/template READMEs written.
- F4: TEMPLATE/SLICE distinction in audit guard.
- F3: backfilled validators on all public Convex fns. Bounded
  `admin/queries.ts` with `.take(LIMIT)`.

---

## [1.0.x] — D + B waves (Jan 2026)

- D-wave: site-level raw-HTML audit. Convex authn+authz audit on every
  public mutation. Server Action authn+authz audit. Schema index validity.
  Extended `audit-templates` to cookbook + convex-templates.
- B-wave: fixed title-mismatch warnings, wrapped 39 raw `<button>` →
  shadcn `Button` across block-demo templates + 8 in slices. Pre-push hook
  installed. Extracted hardcoded MCP URL → env.

---

## Pre-1.0 — Initial scaffolding

Initial wave: 30+ slices, 12+ templates, MCP server scaffold, BSDL
(removed in P+ waves), validation chain, copy-first CLI install pattern.

---

## Conventions

- Versions are CLI versions on npm (`rahman-resources@x.y.z`).
- MCP versions advance independently — see `packages/mcp/package.json`.
- Wave letters (A-Z) are internal session labels — not user-facing
  identifiers. Use the CLI version above when referencing a release.
- Auto-ship policy: main is always shippable. Tags are cut at CLI publish
  time, not per wave.
