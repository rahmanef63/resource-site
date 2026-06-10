# Agentic Wave 3 — Execution Plan

**Audience:** the executing model (Opus) picking this up cold.
**Prereq reading:** `docs/agentic-readiness.md` (audit + architecture decision + waves 1–2).
**Written:** 2026-06-10, after auditing commits `301614a` (shared kit), `879d68d` (C5–C7
central host), `a4ec99a` (os-vps sync wave) **plus** uncommitted wave-3a WIP in the tree.

---

## ADDENDUM 2026-06-10 (evening) — status + handoff. READ THIS FIRST.

Waves landed on `main` — do not redo any of this:

| Commit | Scope | Plan phase |
|---|---|---|
| `14551cd7` wave-3a | global host + `useAgentTools` wiring + G5 agent.md `## Tools (agentic surface)` generator | P0 + Phase 4 item 1 ✅ |
| `229c338c` wave-3b | live model bridge: `/api/agent-stream` + `sse-client` + `AgentBridge` in `app/preview/layout.tsx` + tests | Phase 1 ✅ |
| `21ac35c0` wave-3c | 9 Tier-A* admin collections | Phase 2 ✅ (exceeded plan — see corrections) |
| `4d3dd668` wave-3d | 20 Tier-A data/ui collections + motion-kit | Phase 3 ✅ |

**Remaining = wave-3e only:**

1. **Audit gate (§5 item 2)** — a ready, verified patch is parked OUTSIDE the tree at
   `/home/rahman/projects/_agentic-audit-gate.patch` (`git apply` from repo root; tested
   green against all collections on 2026-06-10). Clarification vs the §5 text: detect
   collections via a `defineToolCollection` usage regex across the slice's ts files, NOT
   by `lib/tools.ts` existence — some slices define collections elsewhere. The patch
   already does this; prefer applying it over rewriting.
2. **chat-fab dewire (§5 item 3)** — clarified: keep `stubReply` as the fallback when
   `!isAgentStreamConfigured()`. The FAB ships into consumer templates and must stay
   inert without the bridge. Route through `createAgenticChatSend(globalToolRegistry())`
   only when the stream is configured.
3. **`requirePerm` (§3.1)** — now optional defense-in-depth: wave-3c collections forward
   to consumer-supplied server-gated ctx bindings instead of gating in the tool layer.
   Either build `gated.ts` + tests as specced, or close the item in
   `docs/agentic-readiness.md` with that rationale. Do not leave it ambiguous.
4. **Live acceptance (§2.4) never ran against a real key.** Closeout step: set
   `ANTHROPIC_API_KEY` locally, run the appshell + image-editor smoke prompts, record the
   result in the readiness doc. The `toAnthropic` translation has unit tests only — a
   live round-trip is the remaining risk.

**Plan corrections (lines below are stale):**

- §0 scorecard "10/66 slices have collections" → 39/68 after 3c+3d.
- §3.2 "skip doku/midtrans/platform-admin/event-tracking" → superseded: wave-3c shipped
  them safely (tools only forward to server-gated bindings; payment secrets never reach
  the tool layer; catalog previews use mocks). Keep that posture for any new tool.

**Operational notes:**

- Push can print "Connection to github.com closed by remote host" with exit 0 while the
  commit did NOT land. After every push: `git fetch && git rev-parse origin/main` and
  compare. Retry with `--no-verify` only when gates already passed for that exact commit.
- Single writer from now on: the rahmanef.com session withdrew from this tree
  (2026-06-10). This repo is yours; coordinate via this doc + `agentic-readiness.md`.

---

## 0. State snapshot (what is DONE — do not redo)

| Layer | Status |
|---|---|
| Shared kit `lib/shared/agentic/` (types/schema/define/registry/host/agent-loop) | ✅ shipped, 7 tests green |
| Contract `provides.tools` + `validateTools` (`packages/cli/lib/contract-validate.ts:134`) | ✅ enforces `<slug>.` prefix |
| 10 tool collections (image-editor 34, reel-editor 11, browser 11, code-editor 9, file-explorer 8, app-store 4, media-viewer 4, os-terminal 3, system-monitor 2, appshell 12) | ✅ shipped (879d68d + a4ec99a) |
| assistant = central host: chat runs `runAgentLoop(history, getAssistantRegistry(), …)` when stream configured (`assistant/components/chat-panel.tsx:85-92`); `assistantCatalog()` lists live registry | ✅ |
| ai-infra wired: ai-agents `createAgentRunner`, ai-chat `createAgenticChatSend`, ai-router `aiRouterTools`, ai-studio `aiStudioTools`, ai-admin `toolRegistryRows`, create-your-mcp `toolDefsFromHost` | ✅ |
| **Wave 3a — mount-time host wiring** (`lib/shared/agentic/global-host.ts` + `use-agent-tools.ts`, `useAgentTools(<x>Tools, ctx)` in ALL 10 app components + `appshell/provider/app-shell.tsx`; `registerAssistantTools` now delegates to the global host) | 🔶 **IN FLIGHT in a CONCURRENT session** — uncommitted working-tree WIP as of this writing |

**The one hard gap left:** `configureAgentStream` (`lib/shared/agentic/host.ts:34`) is
defined but **never called anywhere in the repo**. Every agentic UI therefore runs the
demo fallback (`isAgentStreamConfigured() === false`). Tools are registered, visible in
catalogs, and dispatchable — but no model ever drives them. Closing that is the
centerpiece of this wave.

Scorecard: 10/66 slices have collections. Tier-A* admin 0/9. Tier-A data/ui 0/20. Tier-C 0.

---

## 1. P0 — Preconditions (do these checks FIRST)

1. **Quiet tree.** This repo runs concurrent agent sessions. `git status --short` must be
   clean (or contain only files you created) before you commit anything. If wave-3a WIP
   (`global-host.ts`, `use-agent-tools.ts`, the 11 wired components) is still uncommitted,
   **stop and wait / coordinate** — do not commit over it, do not redo it.
2. **Wave-3a landed check:** `git grep -l useAgentTools HEAD -- frontend/slices` must list
   ~11 files. If empty, wave 3a has not landed; everything below depends on it.
3. **Tests for the new primitives** (add if the wave-3a session didn't):
   `lib/shared/agentic/global-host.test.ts` — covers: (a) strict-mode double register is
   safe, (b) remount REBINDS the ctx getter (new state visible, no stale closure),
   (c) invoking a namespace after `ctxGetters` lost it throws the "unregistered" error.
4. Gates baseline green: `npm test`, `npm run validate:contracts`,
   `npm run validate:manifests`, `npm run audit:slices`, `npm run audit:file-size`.

---

## 2. Phase 1 — Live model bridge (highest value, do first)

Goal: open a preview page, chat with the assistant, watch it actually drive the mounted
apps (⚙ tool lines with real results, real model text).

### 2.1 Server route — `app/api/agent-stream/route.ts`

- **Reference implementation:** `app/api/build-chat/route.ts` (already uses
  `@anthropic-ai/sdk`, `process.env.ANTHROPIC_API_KEY`, streaming, function calling).
  Copy its auth/env/abort patterns; do NOT reuse its builder system prompt.
- Contract: `POST { messages: AgentMsg[], tools: AnthropicTool[], system?: string }` →
  SSE stream of `{ type: "delta", text }` events, terminated by
  `{ type: "turn", turn: AgentTurn }`.
- Translation `AgentMsg[]` → Anthropic `messages[]` (shapes in
  `lib/shared/agentic/types.ts`):
  - `{ role: "user", text }` → `{ role: "user", content: text }`
  - `{ role: "assistant", text?, toolUses? }` → content blocks: optional `text` block +
    one `tool_use` block per entry (`{ id, name, input }`)
  - `{ role: "tool", results }` → `{ role: "user", content: [{ type: "tool_result",
    tool_use_id, content, is_error }] }`
  - `AgentTurn.stopReason` ← the response `stop_reason`.
- Model: `process.env.RR_AGENT_MODEL ?? "claude-sonnet-4-6"` (tool loops are many cheap
  turns; opus is overkill — build-chat keeps its own env knob).
- Guards: 401 when `ANTHROPIC_API_KEY` unset; cap `messages.length` (e.g. 60) and total
  payload size; `max_tokens` ~2048; pass request `AbortSignal` through to the SDK call.

### 2.2 Client adapter — `lib/shared/agentic/sse-client.ts`

- `export function createSseAgentStream(url = "/api/agent-stream"): AgentStreamFn` —
  POSTs, reads the SSE body, calls `onDelta(chunk)` per delta event, resolves the final
  `AgentTurn`. Zero React, zero slice imports. Export from `lib/shared/agentic/index.ts`.
- Unit test with a mocked `fetch` returning a ReadableStream of SSE frames.

### 2.3 Wiring point — `components/agent-bridge.tsx` (site-level, NOT a slice)

- `"use client"`; `useEffect(() => { if (!isAgentStreamConfigured())
  configureAgentStream(createSseAgentStream()); }, [])`; renders `null`.
- Mount it in `app/preview/layout.tsx` (or the shared preview wrapper) so every
  `/preview/slices/*` page gets the live bridge. Do not mount on public marketing pages.
- Cost control: route is the gate (key + caps). Optionally skip mounting unless
  `process.env.NEXT_PUBLIC_AGENT_BRIDGE !== "0"`.

### 2.4 Acceptance

- `/preview/slices/appshell`: assistant chat → "open the app store, then list windows"
  → two ⚙ tool lines (`appshell.app.launch` ✓, `appshell.window.list` ✓) + sensible text.
- `/preview/slices/image-editor`: "add a text layer saying hello" → layer appears.
- Assistant automations run real executions (not narration) on these pages.
- With `ANTHROPIC_API_KEY` unset: UI falls back to the typing demo exactly as today
  (route 401 must NOT poison `isAgentStreamConfigured` — configure only wires the fn;
  a failing call surfaces in chat as an error message, acceptable).

---

## 3. Phase 2 — RBAC gating primitive + Tier-A* admin collections

### 3.1 Shared primitive first — `lib/shared/agentic/gated.ts`

- `export function requirePerm<Ctx extends { can(perm: string): boolean }>(perm: string,
  tool: Tool<Ctx>): Tool<Ctx>` — wraps `run`; if `!ctx.can(perm)` → `throw new
  Error("permission denied: " + perm)` (registry already converts throws into
  model-readable `ok:false` outcomes). Test it.
- Permission strings come from each slice's contract `requires.rbac[]`. The `can`
  implementation is consumer-supplied at registration (pattern exists:
  `user-management/lib/can.ts`, engine in `rbac-roles/lib/{permissions,check,roles}.ts`).

### 3.2 Slice order (easiest/safest first)

| # | Slice | Tools | Binding | Gate |
|---|---|---|---|---|
| 1 | audit-log | `query`, `since`, `export` (read-only) | `audit_events` Convex queries / logger from `lib/index.ts` | `audit.read` |
| 2 | rbac-roles | `role.list`, `role.create`, `grant`, `revoke`, `list_perms` | `lib/roles.ts` presets + `rbac_roles` table | role-admin perms |
| 3 | user-management | `list`, `invite`, `set_role`, `disable` | `useMembersView` / `um_*` mutations | member perms; NO `delete` tool this wave |
| 4 | rate-limit | `check`, `reset` | server mutations over `rateLimits` | admin-gated |
| 5 | resend-newsletter | `list`, `subscribe` | `newsletter_*` tables | `newsletter.*`; NO `send_campaign` this wave |
| — | event-tracking | skip — slice is a config stub, no runtime surface yet | | |
| — | platform-admin | skip — scaffold phase, consumer adapters not built | | |
| — | doku-payment / midtrans-payment | **skip money-moving tools entirely** (create_invoice/refund are irreversible + key-guarded). Optional read-only `status` tool only. | | |

Each slice: `lib/tools.ts` (`defineToolCollection`, namespace = slug), contract
`provides.tools` (namespaced names), version bump, **changelog entry** (mandatory),
register via `useAgentTools` in the slice's admin panel component, files ≤200 LOC.

---

## 4. Phase 3 — Tier-A data/ui collections (20 slices)

Same per-slice recipe. Batches by binding readiness (audit notes):

- **Batch 1 — real state to bind today:** command-menu (`lib/cmdkHistory.ts` + command
  set: `search/run_command/list_commands`), settings-page (`lib/adapter.ts`:
  `get/set/reset/list`), theme-presets (`lib/tweakcn.ts`:
  `set_preset/set_accent/set_mode/list_presets`), notifications-center (`lib/adapter.ts`:
  `list/mark_read/dismiss/mute`), storefront-checkout (`lib/cart.tsx`:
  `cart.add/remove/apply_coupon/status` — NOT `checkout`), data-table
  (`filter/sort/paginate/select/column.toggle` over table state), library
  (`search/get/add/tag` over `libraryItems` queries+mutations), files
  (`useFileUpload`/`useFileUrl`: `list/upload/url`).
- **Batch 2 — needs small ctx adapters:** onboarding-wizard, comments
  (`buildThread` + mutations), notion-database, activity (read-only `list/filter/since`),
  cal-com-booking (adapter dispatch), vector-search, notion (consumer-client seam —
  injectable like browser's).
- **Batch 3 — thin kits (2–3 tools each):** icon-picker, image-picker, markdown
  (`render/toc`), seo (`set_meta/audit`), broadcast-channel-sync (`publish/peers`).

---

## 5. Phase 4 — G5 generator + CI gate + leftovers

1. **`## Tools` in agent.md** — `scripts/features/gen-slice-agent-md.mjs` reads
   `packages/cli/lib/manifest.json`; extend `gen-manifest.mjs` to carry
   `contract.provides.tools`, then emit a `## Tools` section (one bullet per namespaced
   tool name; pull descriptions from `lib/tools.ts` via regex if cheap, else names only).
2. **Audit gate** — in `scripts/validation/audit-slice.mjs`: if
   `frontend/slices/<slug>/lib/tools.ts` exists, contract `provides.tools` must be
   non-empty and every entry must pass the existing `validateTools` prefix rule.
   (Static name match tools.ts ↔ contract is a stretch goal; regex `name: "…"`.)
3. **ai-router FAB stub** — `ai-router/components/chat-fab.tsx` still echoes
   "(stub) Received…". Route it through ai-chat's `createAgenticChatSend(globalToolRegistry())`
   so the FAB gets real function calling once the bridge is live.
4. Update `docs/agentic-readiness.md` scorecard + "Next" after each phase ships.

---

## 6. Hard constraints (every commit)

- **Concurrent sessions:** quiet-tree check before staging; stage only your files.
- **Gates:** `npm test` + `validate:contracts` + `validate:manifests` + `audit:slices` +
  `audit:file-size` (≤200 LOC per slice file) all green before push.
- **Changelog:** every touched catalog slice gets a `ChangelogEntry` in
  `lib/content/changelog.ts` BEFORE pushing (rr mandatory rule).
- **Isolation:** slices import only `@/shared/agentic` for the kit — never another slice.
  Namespace = slice slug; registry enforces `<slug>.<action>`.
- **Security:** `ANTHROPIC_API_KEY` server-side only; no money-moving or destructive
  admin tools this wave (no payments create/refund, no user delete, no `send_campaign`);
  gated tools must check `ctx.can(perm)` server-of-truth, not UI state.
- **Tool `run` returns SHORT strings** — they go straight into model context.

## 7. Suggested commit slicing

| Commit | Scope |
|---|---|
| wave-3a | (concurrent session) global host + useAgentTools wiring — already in flight |
| wave-3b | agent-stream route + sse-client + AgentBridge + tests |
| wave-3c | `requirePerm` + audit-log/rbac-roles/user-management/rate-limit/resend-newsletter collections |
| wave-3d.1–3 | Tier-A data/ui batches 1–3 |
| wave-3e | agent.md `## Tools` + audit gate + chat-fab dewire-stub |
