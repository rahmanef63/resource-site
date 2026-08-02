# admin-console — Execution Roadmap (PLAN.md)

**State (2026-07-02):** admin-console v0.1.0 is built and committed as `67299896` on `slices/os-apps-port` — NOT pushed. Slice = gated 2-col shell (`components/AdminConsole.tsx`) over a 26-section registry (`lib/sections.ts`); reuse sections mount peer rr slices via consumer-supplied `components` map (no slice→slice imports); 5 owned sections (Analytics, AuditLog, NavConfig, Leads, SeoHealth) with in-memory mocks; `lib/access.ts` 7/7 tests; `hooks/useAdminSection.ts` URL sync. Convex copy-source `convex/features/admin_console` (ac_leads + ac_nav_items, requireAdmin; `ac_leads.create` public). slices:check green (79 slices), catalog entry live. **Known gaps:** CLI manifest never synced (`npx rr add admin-console` fails), previewPath `/preview/slices/admin-console` 404s today, `67299896` sits on ANOTHER session's branch (4 os-apps commits, only `640f85c0` unmerged to main — landing strategy is Decision D1).

Legend: effort S/M. All paths relative to `/home/rahman/projects/resources` unless noted.

---

## Wave 0 — Decision gate (BLOCKS Wave 4+; Waves 1–3 can start now)

Goal: user picks the landing path; verify git state hasn't moved.

| id | task | files | effort | acceptance |
|---|---|---|---|---|
| gate-640-ownership | Ask user/other session: is `640f85c0` (command-menu/quicklinks/rbac-roles/settings-page/user-management deltas, already on origin/slices/os-apps-port) shippable? YES → **Path A** (ff-ride whole branch). NO/unknown → **Path B** (cherry-pick in worktree). | repo root | S | User explicitly picked A or B; `git log origin/main..slices/os-apps-port` shows exactly `67299896` + `640f85c0` |

```bash
cd /home/rahman/projects/resources && git fetch origin && git log --oneline origin/main..slices/os-apps-port
# if origin/main moved since 5562556d, re-verify cherry-pick cleanliness:
git merge-tree --write-tree --merge-base=67299896^ origin/main 67299896
```

---

## Wave 1 — Quick wins on the branch (no gate; all S)

Goal: close cheap DESIGN.md §6–7 seams + the live preview 404, docs-first per lazy mandate.

| id | task | files | effort | acceptance |
|---|---|---|---|---|
| header-slot-prop | Add optional `headerSlot?: React.ReactNode` to AdminConsoleProps; section header becomes `flex items-center justify-between` row (~6 lines, header ~line 132-136). NO default bell — consumer passes `<NotificationBell/>`. Closes §6 step 8 without a peer dep. | frontend/slices/admin-console/components/AdminConsole.tsx | S | tsc green; preview.tsx unchanged (prop optional) |
| command-group-builder | New `lib/commandGroup.ts`: `adminConsoleCommandGroup(sections, navigate)` returning duck-typed `{id:"admin-console", heading:"Admin", items:[...]}`. Do NOT import command-menu types (structural typing at consumer call site). Caller passes ALREADY-FILTERED sections so ⌘K never leaks gated sections. Export via lib/index.ts + slice barrel; add vitest assertions. Closes §6 step 7 as a library seam. | lib/commandGroup.ts, lib/index.ts, index.ts, lib/access.test.ts | S | vitest green; audit:slices green (no peer import) |
| preview-page | Create `app/preview/slices/admin-console/page.tsx` — fixes live 404 (catalog declares previewPath, iframe blank today). Thin scenario-addressable client page mirroring preview.tsx: 3-entry ACCESS map (platform-admin/content-owner/denied), `?scenario=` via useSearchParams (wrap in `<Suspense>`, Next 16). **Ponytail call: this thin page ships now; the rich 4-peer demo-composition page is deferred (Decision D6).** | app/preview/slices/admin-console/page.tsx | S | `npm run build` green; /preview/slices/admin-console 200; ?scenario=denied shows "Admin console unavailable"; detail-page iframe renders |
| unit-useadminsection | Test the only untested stateful logic: `hooks/useAdminSection.test.tsx` via renderHook — (1) ?section=leads adopted, (2) ?section=bogus → first visible, (3) navigate() writes URL, (4) popstate adoption. Skip everything else (covered by preview-smoke + e2e). | hooks/useAdminSection.test.tsx | S | npm test green, zero config changes |
| leads-inbox-recipe | RECIPE (no code — backend complete): README "Wire LeadsInbox" section: `useQuery(api.features.admin_console.leads.list)`, `Doc<'ac_leads'>`→`Lead` map (id:_id, rest 1:1), updateStatus/addNote mutations, string-id cast seam. No private paths in README. | frontend/slices/admin-console/README.md | S | Snippet uses verified export names; slices:check green |
| nav-config-recipe | RECIPE: NavConfigManager emits FULL list with temp ids; document debounced diff → upsert (no id = insert) / upsert(id) / remove / final `reorder({ids})` with temp-id→returned-Convex-id handoff; note UI omits icon/parentId/target (upsert accepts optionals); public `list` powers site nav (why unauth). | frontend/slices/admin-console/README.md | S | Covers insert/update/delete/reorder; names match navConfig.ts |
| media-doc-close | Close §7 media question as DOCS, not code (lazy): README note — mount `<MediaStudio/>` via `components={{media}}` OR bring your own grid; MediaLibraryAdapter deferred until a consumer needs browse-only. Strike §7 bullet with date. | README.md, docs/admin-panel/DESIGN.md | S | Both docs updated; zero registry/code change |

---

## Wave 2 — Backend hardening + adapter recipes (branch; recipe-first)

Goal: every owned section gets a documented wire-up; only code where a recipe cannot suffice.

| id | task | files | effort | acceptance |
|---|---|---|---|---|
| leads-rate-limit-front | CODE (2 lines) + RECIPE: add `leads: { limit: 5, windowMs: 60*60_000 }` to POLICY in convex/features/rate_limit/mutation.ts (else recipe throws unknown-prefix); bump rate-limit pair 0.3.0→0.3.1. README recipe: Next ingestion route copied from app/api/admin/login/route.ts pattern (extractIp → `consume({key:\`leads:${ip}\`, serverKey})` → on ok call leads:create; else 429 + Retry-After). State explicitly: limiter only holds with route + serverkey gate (cross-ref). Update convex/features/admin_console/README.md pointer. | convex/features/rate_limit/mutation.ts, frontend/slices/rate-limit/slice.{json,manifest.json}, both READMEs | M | POLICY has leads; pair bumped; tsc green; function-ref strings verbatim from login route |
| leads-serverkey-gate | **Decision-gated (D2).** Close direct-Convex bypass: optional `serverKey` arg on ac_leads.create; when `AC_LEADS_SERVER_KEY` env set require constantTimeEqual (import ../../_shared/crypto like rate_limit), unset = warn + accept (fail-open, same as RATE_LIMIT_SERVER_KEY). Add env to slice.json deps.env (required:false). | convex/features/admin_console/leads.ts, slice.{json,manifest.json} | S | Rejects wrong key when env set; warns+accepts unset; audit:slices green |
| audit-log-copy-source | CODE — recipe cannot paper over a nonexistent table: audit-log slice.json ALREADY promises `audit_events` + a convex dir that does not exist (dangling contract = bug fix, not enhancement). Create `convex/features/audit_log/` (SNAKE_CASE — convex rejects hyphens): _schema.ts (audit_events matching slice AuditEvent type + indexes by_at, by_entityType_at), mutation.ts logEvent (internalMutation), query.ts list (requireAdmin, `.take(min(limit??50,500))`, never bare .collect()), README. Fix audit-log slice.json schemaPath/rootPaths → audit_log, bump pair 0.3.0→0.4.0 (Decision D3 on ownership; default: audit-log slice owns it). Do NOT compose into rr's own convex/schema.ts. | convex/features/audit_log/* , frontend/slices/audit-log/slice.{json,manifest.json} | M | Dir exists, validators + requireAdmin; paths real; tsc + slices:check green |
| audit-viewer-recipe | RECIPE (dep: audit-log-copy-source): README AuditEvent→AuditEntry mapping (actor:actorId, target:`${entityType}/${entityId}`, before/after from diff JSON.stringify), `useQuery(api.features.audit_log.query.list,{limit:200})`, createAuditLogger write side. **Call out `audit.view` (section registry) vs `audit.read` (audit-log contract) token mismatch — grant both or alias.** | frontend/slices/admin-console/README.md | S | Mapping typechecks against both slices' types; mismatch documented |
| analytics-recipe | RECIPE only (lazy — no portable events table to own; real one lives in template-base): README (1) AnalyticsData contract doc (any source → metrics+funnel), (2) copy-paste `analyticsSummary` Convex query for template-base analyticsEvents consumers: requirePermission('events.read') like existing events.ts `recent`, index by_workspace_timestamp, `.take(10_000)` cap, DISTINCT-sessionId funnel counts, WoW deltas. Include honest limitation sentence: scan-based, needs pre-aggregation at volume (out of scope). | frontend/slices/admin-console/README.md | M | Verified names only; validators; distinct-session logic; limitation survives review |
| seo-score-lib | CODE (small, in-slice — recipe alone would make every consumer reinvent scoring, defeating the panel): pure `lib/seoScore.ts` `scoreSeoPage(input): SeoPage` deriving checks from seo slice HARD_RULES (title 45-60, description 140-160, keywords 5-10, keyphrase in title+desc, og:image, canonical); weighted issues from 100. Unit-test (pure module). Export via barrels + slice.json provides. README recipe: rows → scoreSeoPage → `components={{'seo-health': ...}}`; optional consumer 'Generate' via api.features.seo.action.generateAndApply. | lib/seoScore.ts + .test.ts, lib/index.ts, index.ts, slice.{json,manifest.json}, README.md | M | vitest green (perfect page = 100; each rule → its issue string); ≤200 LOC; no forbidden terms |

---

## Wave 3 — Version, manifest, local gates (branch; after Waves 1–2)

Goal: one version bump, one canonical manifest:sync, full local verification.

| id | task | files | effort | acceptance |
|---|---|---|---|---|
| version-bump | Single bump admin-console 0.1.0→**0.2.0** (headerSlot + commandGroup + seoScore + optional serverKey all fold in) in BOTH slice.json + slice.manifest.json (pair SSOT gate); CHANGELOG.md 0.2.0 entry; `npm run gen:catalog`. | slice.json, slice.manifest.json, CHANGELOG.md | S | slices:check green (version parity + changelog + catalog) |
| manifest-sync | **Canonical task (4 planners flagged it).** `npm run manifest:sync` AFTER version-bump so CLI manifest picks up 0.2.0 + bumped peers (rate-limit 0.3.1, audit-log 0.4.0). WARNING: script has NO --check mode, rewrites in place; regen can suck in the other session's WIP — review diff, stage ONLY relevant entries or flag. Commit `chore(cli): sync manifest for admin-console slice` (+ Co-Authored-By). `git add packages/cli/lib/manifest.json` only — NEVER `git add .`. | packages/cli/lib/manifest.json | S | grep admin-console hits @0.2.0; validate:manifests green; `node packages/cli/bin/cli.js info admin-console` resolves incl. convex rootPaths (admin_console + audit_log) |
| e2e-smoke-specs | New tests/e2e/admin-console.spec.ts, site.spec.ts style (stable copy/roles): (1) renders — h2 Overview + nav groups; (2) nav switch — click Leads → h2 + mock row + `section=leads` in URL; click Users → "not mounted" hint naming user-management; (3) denied — fallback copy, Analytics nav NOT visible. Default 30s timeout. | tests/e2e/admin-console.spec.ts | S | `npm run e2e` 10 flows green locally (7+3); budget 5-10 min (full prod build + known 30s login-test quirk) |
| verify-gates | `npx vitest run frontend/slices/admin-console` → `npx tsc --noEmit` → `npm run slices:check` → `npm run dev` eyeball. Do NOT run e2e:staging yet (nothing pushed); NEVER pkill next-server on this VPS. | package.json | S | All gates green |
| manual-checklist | One dev-server pass: 3 scenarios; groups + "new" badges + not-mounted hints correct; LeadsInbox status select; NavConfig reorder/toggle/add/delete; AuditLog sheet diff; Analytics+SeoHealth render; content-owner deep-link `?section=leads` falls back (no leak); back/forward walks history; console clean. Record results in commit body — no report file. | (slice components) | S | 9/9 pass; failures become fix commits before landing |

---

## Wave 4 — Land to main (BLOCKED BY Wave 0 decision + Wave 3 green)

Goal: code on main + staging verified. Never `git checkout` in the shared tree — ref-spec pushes or worktree only. NEVER force-push.

**Path A (640f85c0 shippable — least motion, recommended if yes):**

| id | task | effort | acceptance |
|---|---|---|---|
| a-backup-push | `git push origin slices/os-apps-port` (ff only, protects everything) | S | `git status -sb` no "ahead" |
| a-staging-verify | `git push origin slices/os-apps-port:staging` (clean ff; origin/staging is ancestor) → wait Dokploy `resource-site-staging` build → **confirm admin-console visible on staging catalog FIRST** (else false-green vs old image) → `npm run e2e:staging` | M | staging build green; e2e:staging green; curl -sI both staging URLs → 200 |
| a-ship-main | `git push origin slices/os-apps-port:main` (strict-descendant ff; no checkout of shared tree). Then `git fetch origin` only. No Convex deploy (rr backend allowlist = rate_limit only). Wait Dokploy prod build, spot-check live catalog, report SHA. | S | `git ls-remote origin main` = branch tip; prod catalog live; SHA reported |

**Path B (640f85c0 must NOT ship):**

| id | task | effort | acceptance |
|---|---|---|---|
| b-cherry-pick-worktree | `git worktree add <scratchpad>/wt-admin-console -b slices/admin-console origin/main && git cherry-pick 67299896` (+ Wave 1–3 commits). Pre-verified conflict-free (merge-tree 3db78ef3 — valid only for main@5562556d, re-check). CRITICAL: re-run `npm run manifest:sync` + gen:catalog ON THIS BASE (regenerated files differ without 640f85c0) — trust the worktree's output, don't copy the branch's. Leave slices/os-apps-port untouched. Cleanup worktree after landing. | M | Worktree = origin/main + admin-console commits; zero conflicts; shared checkout untouched |
| b-staging-ship-main | `git push origin slices/admin-console` (backup) → `:staging` → wait build → e2e:staging → `:main` → verify live, report SHA. **Notify other session main moved** (they fetch/rebase; duplicated diff merges clean, content-identical). | M | Same as Path A acceptance + other session informed |

**Rollback (both paths):** git-driven Dokploy — never force-push. Prod break: worktree off origin/main → `git revert --no-edit <sha>` → push main (Dokploy rebuilds); or Dokploy UI redeploy previous build for instant relief. Slice is additive, single revert restores clean. Staging break = non-blocking (fix on branch, re-push :staging). No Convex rollback exists or is needed.

---

## Wave 5 — Distribution + publish (BLOCKED BY Wave 4)

| id | task | files | effort | acceptance |
|---|---|---|---|---|
| consumer-dry-run | tiged pulls from github main (no local-path mode) — post-land only. Scratch app in session scratchpad → `node packages/cli/bin/cli.js add admin-console` → verify: full slice lands (preview.tsx STRIPPED — expected, cli.js:1169), shared/* cascades, convex/features/admin_console + audit_log copied, mount `<AdminConsole access={...}/>` and `npx tsc --noEmit` green, README rate-limit warning survives into copy. Delete scratch after. | packages/cli/bin/cli.js, scratchpad | M | rr add exits 0; zero missing-file warnings; scratch tsc green |
| publish-cli | **Decision D7.** Published 1.14.2 predates the WHOLE os-apps wave — one publish unblocks booking, content-loops, 5 ported os slices, deltas AND admin-console. Bump packages/cli 1.14.2→1.15.0 (minor), typecheck, commit+push main, `cd packages/cli && npm publish`. ORDER: publish only AFTER main is pushed (else manifest advertises slugs whose GitHub pulls 404). MCP publish not required (^1.14.0 resolves). | packages/cli/package.json | S | `npm view rahman-resources version` = 1.15.0; clean-dir `npx -y rahman-resources@latest add admin-console` works |
| record-followups | Track deferred DESIGN.md §6–7 items (D6 demo page, command-menu app mount, notifications header mount, media adapter, broadcast) + Wave 6 backlog in todo/docs note. | docs/admin-panel/DESIGN.md | S | Follow-ups tracked |

---

## Wave 6 — Optional debt (backlog unless user pulls forward, Decision D8/D6)

| id | task | effort | note |
|---|---|---|---|
| preview-debt-sweep | Fix 4 pre-existing previewPath 404s (publisher-clean-html, content-loops, motion-kit, storefront-checkout): thin wrapper pages or null previewPath | M | Same defect class admin-console had |
| gate-manifest-freshness | Add `--check` mode to gen-manifest.mjs (pattern: gen-preview-registry.mjs) + append to slices:check chain; optionally a previewPath-resolves check | M | Root-causes both drifts that actually shipped green |
| demo-composition-page | Upgrade thin preview page to full demo: mount UserManagementPanel/PermissionMatrix/SettingsShell/NotificationList + CommandPalette(adminConsoleCommandGroup) + bell in headerSlot; ai-admin stays unmounted as the honest "not mounted" showcase | M | DESIGN.md §6 steps 9–10; deferred by ponytail call in Wave 1 |

---

## Decision points (user)

1. **D1 — Landing path:** Path A (ff whole branch, ships other session's `640f85c0` to prod) vs Path B (cherry-pick onto fresh branch in worktree, keeps peer work unpublished). Blocks Wave 4+.
2. **D2 — serverkey gate on ac_leads.create:** ship the optional-arg code (backward-compatible fail-open, changes copy-source API surface) vs recipe-only and accept the direct-Convex bypass.
3. **D3 — audit_events ownership:** audit-log slice 0.4.0 owns convex/features/audit_log (recommended — its contract already promises the table) vs park under admin_console.
4. **D4 — Media library:** accept lazy doc resolution (recommended) vs build MediaLibraryAdapter grid now.
5. **D5 — Broadcast section:** defer (recommended — resend-newsletter covers send, no consumer for segmentation) vs add 27th registry entry.
6. **D6 — Demo composition page:** thin scenario page now + full demo later (ponytail recommendation) vs build the 4-peer demo this wave.
7. **D7 — CLI publish:** 1.15.0 minor now (recommended — unblocks entire os-apps wave for npx users) vs 1.14.3 patch vs defer; MCP bump 1.2.5→1.2.6 cosmetic only. You run `npm publish --otp` yourself.
8. **D8 — Debt this wave or backlog:** preview-debt-sweep + manifest-freshness/previewPath CI gates.
9. **D9 — rate_limit POLICY `leads` row** ships to rr's own live backend (api-resource) on next deploy:convex (additive/inert) — OK, or gate the deploy until reviewed?

## Risks (consolidated)

- **Shared single checkout:** another session works this tree. Never `git checkout`/`git switch` in place (use ref-spec pushes / worktree); every `git add` file-scoped, NEVER `git add .`; never force-push or rebase slices/os-apps-port.
- **Path A ships a peer's commit** to prod — if `640f85c0` is actually half-done, prod carries it; hence the hard user gate (D1).
- **origin/main may move** before landing — re-run `git log origin/main..branch` + merge-tree simulation immediately before pushing; today's clean result is valid only for main@5562556d.
- **Regenerated files** (CLI manifest, gen:catalog, preview registry) can absorb the other session's WIP on a shared tree, and differ per base (Path B: regen in worktree, trust that output). Review diffs, stage selectively.
- **ac_leads.create is a public unauth Convex mutation:** until D2 ships, any client bypasses the Next-route limiter (only length guards). Same trap class as the patsi store-authz incident. README warning must survive into consumer copies.
- **audit-log slice contract is dangling TODAY** (advertises nonexistent convex/features/audit-log) — Wave 2 fix is a bug fix, not scope creep. Convex dirs must be snake_case (audit_log); verify how the CLI maps rate-limit's hyphenated schemaPath too.
- **e2e:staging false-green:** Dokploy build must finish first — confirm admin-console renders on staging before running Playwright. Never reuseExistingServer; never pkill next-server (prior prod kill).
- **Publish-before-push hazard:** npm ships a manifest snapshot; publish only after main has the files or `rr add` 404s at tiged.
- **Ungated drifts recur:** nothing gates CLI-manifest freshness or previewPath resolution (both shipped green while broken) — Wave 6 fixes.
- **Public-file hygiene:** no /home/rahman paths or private sibling refs in READMEs; forbiddenTerms gate applies to seoScore.ts.
- **Preview page ships DEMO_ACCESS full-admin mock publicly** — fine while all adapters are in-memory; never wire a real adapter into the slice's page.tsx.
- **Analytics recipe is intentionally scan-based** (.take(10_000)) — the honest-limitation sentence must survive review.

## Quick wins (S-effort, safe on the branch right now)

1. header-slot-prop — ~6 lines, optional prop
2. command-group-builder — pure lib + tests, no peer import
3. preview-page — fixes a LIVE 404 on the docs site
4. unit-useadminsection — 4 assertions, zero config
5. leads-inbox-recipe — README only
6. nav-config-recipe — README only
7. media-doc-close — two doc edits, closes a DESIGN.md open question
