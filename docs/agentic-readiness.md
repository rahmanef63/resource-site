# Agentic Readiness Audit — rr slices

**Goal:** every feature slice exposes an LLM-callable **tool surface** (function
calling) so an agent can drive it. Status as of 2026-06-10.

**Reference standard = `image-editor`** (the only fully-agentic slice). Its
"agentic kit" is the pattern every Tier-A slice must reach:

| Part | File | Role |
|---|---|---|
| 1 | `commands/types.ts` | `EditorCommand {name, description, parameters:JsonSchema, run(ctx,args)→string}` + `AnthropicTool` |
| 2 | `commands/schema.ts` | schema builders (`str/num/bool/obj`) + state read-back (`describeDoc`) |
| 3 | `commands/*.commands.ts` | domain command arrays |
| 4 | `commands/registry.ts` | spread → `EDITOR_COMMANDS`, derive `EDITOR_TOOLS` (Anthropic `tools`) |
| 5 | `commands/use-editor-commands.ts` | `invoke(call) → ToolOutcome {ok,result}` |
| 6 | `lib/ai-agent.ts` | function-calling loop: stream turn → run `tool_use` locally → feed `tool_result` → repeat (turn cap) |
| 7 | `lib/host.ts` | injectable model seam (`streamAgentTurn`); demo until consumer wires LLM |

---

## Systemic gaps (block ALL slices)

- **G1 — Contract DSL has no `tools` block.** `packages/cli/lib/contract-types.ts`
  `SliceContractProvides` exposes routes/hooks/tables/events/components — **no
  `tools`**. No way to declare agentic surface, no CI gate. → add
  `tools?: { name, description, params, scope? }[]` to `provides`, gate in
  `audit:slices`.
- **G2 — No shared agentic primitive.** image-editor's kit is bespoke, not
  reusable. → lift parts 1,2,5,6,7 to `shared/lib/agentic/` (`defineTool`,
  `buildToolRegistry`, `runAgentLoop`, `configureAgentStream`, schema builders).
  Then a slice "becomes agentic" = write only its `*.commands.ts` + register.
- **G3 — No central tool bus.** `assistant/lib/tools.ts` has `OS_TOOLS` but it's
  a **declarative catalog** (`params: string[]`, "narrate only", no JSON-schema,
  no `invoke`). One composed assistant can't actually call any slice's tools.
  → registry that aggregates `EDITOR_TOOLS`-style exports across installed slices.
- **G4 — AI-infra slices don't dispatch.** `ai-agents` `RunnerBindings = unknown`
  (no execution); `ai-router`/`ai-studio`/`ai-admin`/`create-your-mcp` not wired
  to a tool bus. These should be the *hosts* of G2/G3.
- **G5 — `agent.md` per slice doesn't list callable tools** (it documents the
  slice, not its tool API). → add a `## Tools` section generated from the registry.

---

## Per-slice checklist

Legend — **State:** ✅ done · ◑ partial · ✗ none. **Tier:** A=must be agentic
(interactive/stateful) · B=agentic infra (must *dispatch*) · C=presentational
(thin insert/configure tool optional).

### Tier A — interactive apps / stateful (need full kit)

| Slice | Cat | State | Missing | Proposed tools |
|---|---|---|---|---|
| image-editor | os | ✅ | — (reference) | layer/transform/adjust/style/export (~30) |
| reel-editor | os | ✗ | full kit | `clip.add/split/trim`, `track.add`, `title.add`, `effect.apply`, `render` |
| code-editor | os | ✗ | full kit | `file.open/save`, `edit.apply`, `search`, `goto`, `format` |
| file-explorer | os | ✗ | full kit | `list`, `create_file/folder`, `rename`, `move`, `delete`, `search`, `open` |
| os-terminal | os | ✗ | full kit | `run`, `cwd`, `env.get/set` (gated) |
| browser | os | ✗ | full kit | `open`, `new_tab`, `back/forward`, `bookmark`, `read_page` |
| media-viewer | os | ✗ | full kit | `open`, `next/prev`, `zoom`, `rotate`, `info` |
| system-monitor | os | ✗ | full kit (read-only) | `stats`, `processes`, `kill` (gated) |
| app-store | os | ✗ | full kit | `search`, `install`, `uninstall`, `list` |
| appshell | os | ✗ | full kit | `app.launch/close/list`, `window.focus/move`, `theme.set` |
| data-table | data | ✗ | full kit | `filter`, `sort`, `paginate`, `select`, `export`, `column.toggle` |
| files | data | ✗ | full kit | mirror file-explorer over data adapter |
| library | data | ◑ | schema+invoke+loop | `search`, `get`, `add`, `tag`, `remove` |
| vector-search | data | ✗ | full kit | `query`, `upsert`, `delete`, `topK` |
| activity | data | ✗ | read-only kit | `list`, `filter`, `since` |
| cal-com-booking | data | ✗ | full kit | `availability`, `book`, `cancel`, `reschedule` |
| notion | content | ✗ | full kit | `page.create/get/update`, `block.insert`, `db.query`, `search` |
| notion-database | ui | ✗ | full kit | `row.add/update/delete`, `view.switch`, `filter`, `sort` |
| comments | content | ✗ | full kit | `add`, `reply`, `resolve`, `delete`, `list` |
| storefront-checkout | content | ✗ | full kit | `cart.add/remove`, `apply_coupon`, `checkout`, `status` |
| command-menu | ui | ✗ | full kit | `search`, `run_command`, `list_commands` |
| settings-page | ui | ✗ | full kit | `get`, `set`, `reset`, `list` |
| theme-presets | ui | ✗ | full kit | `set_preset`, `set_accent`, `set_mode`, `list_presets` |
| onboarding-wizard | ui | ✗ | full kit | `next/prev`, `goto_step`, `set_field`, `complete` |
| notifications-center | ui | ✗ | full kit | `list`, `mark_read`, `dismiss`, `mute` |
| icon-picker | ui | ✗ | thin kit | `search`, `pick` |
| image-picker | ui | ✗ | thin kit | `search`, `pick`, `upload` |
| markdown | content | ✗ | thin kit | `render`, `toc`, `insert` |
| seo | content | ✗ | thin kit | `set_meta`, `gen_og`, `audit` |
| broadcast-channel-sync | data | ✗ | thin kit | `publish`, `subscribe`, `peers` |

### Tier A* — admin/backend (full kit, **server-gated** via RBAC)

| Slice | Cat | State | Proposed tools (require `requirePermission`) |
|---|---|---|---|
| user-management | auth | ✗ | `list`, `invite`, `disable`, `set_role`, `delete` |
| rbac-roles | auth | ✗ | `role.create`, `grant`, `revoke`, `list_perms` |
| platform-admin | infra | ✗ | `metrics`, `feature_flag.set`, `impersonate` (gated) |
| audit-log | infra | ✗ | `query`, `export`, `since` (read-only) |
| event-tracking | data | ✗ | `track`, `query`, `funnel` |
| doku-payment | integrations | ✗ | `create_invoice`, `status`, `refund` (gated) |
| midtrans-payment | integrations | ✗ | `create_invoice`, `status`, `refund` (gated) |
| resend-newsletter | integrations | ✗ | `subscribe`, `send_campaign` (gated), `list` |
| rate-limit | infra | ✗ | `check`, `reset` (admin-gated; this is rr's live backend) |

### Tier B — agentic infrastructure (must *dispatch* tools, not just list)

| Slice | State | Missing |
|---|---|---|
| assistant | ◑ | `OS_TOOLS` is catalog-only → needs JSON-schema + `invoke` + agent loop (G3) |
| ai-agents | ◑ | `RunnerBindings=unknown` → wire real tool execution + step streaming (G4) |
| ai-chat | ✗ | add `tool_use` round-trip to chat stream |
| ai-router | ✗ | route model+tools per request; expose `route` tool |
| ai-studio | ✗ | tool playground: register/test slice tools |
| ai-admin | ◑ | surface tool registry + usage metrics |
| create-your-mcp | ◑ | emit MCP server from slice tool registries (natural G2 consumer) |

### Tier C — presentational (tools optional; thin `configure`/`insert` only)

`blog-section, changelog-feed, faq-section, feature-grid, full-width-toggle,
landing-sections, loading-states, empty-states, marketing-chrome, pricing-page,
portfolio-section, selection, testimonials, testimonials-grid, services,
notion-shell, notion-sidebar, admin, convex-auth` — no agentic requirement;
optionally one `configure(props)` tool so a page-builder agent can place them.

---

## Priority order

1. **G2 — ship `shared/lib/agentic/` kit** (lift from image-editor). Unblocks all.
2. **G1 — add `tools` to contract + `audit:slices` gate.** Makes it enforceable.
3. **G3 — central tool bus in `assistant`.** Makes composed apps actually drivable.
4. **Tier A os apps** (reel/code/file-explorer/terminal/browser…) — highest user value.
5. **G4 — ai-agents/ai-router real dispatch.**
6. Tier A* admin (gated), Tier A ui/data, then Tier C as needed.

**Scorecard:** 1/66 agentic-ready (image-editor). 6 partial (assistant, ai-agents,
ai-admin, create-your-mcp, library + ai-chat infra). 59 with zero tool surface.

---

## Architecture decision (2026-06-10)

> A slice is **NOT an agent**. A slice exports a **collection of function-calling
> tools**. ONE agent aggregates collections from many slices and drives them —
> the agent already speaks function calling; each slice only declares WHAT it
> can do + HOW to run it (bound to its own live state).

### Shared kit — `lib/shared/agentic/` (import `@/shared/agentic`)

| File | Export | Role |
|---|---|---|
| `types.ts` | `Tool`, `ToolCollection`, `ToolHost`, `AgentMsg`… | one vocabulary for every slice |
| `schema.ts` | `str/num/bool/arr/obj/noArgs` | JSON-schema builders |
| `define.ts` | `defineTool`, `defineToolCollection` | authoring factories (Ctx inference) |
| `registry.ts` | `createToolRegistry()` | **aggregates collections → 1 agent**: namespaces names, unifies `anthropicTools()`, dispatches `invoke()` to each tool's bound ctx |
| `host.ts` | `configureAgentStream`, `streamAgentTurn` | **the ONE model seam** (was per-slice) |
| `agent-loop.ts` | `runAgentLoop(history, host, ev)` | **the ONE agent loop** (was per-slice) |

Make a slice agentic = write `*.tools.ts` → `export const fooTools =
defineToolCollection<FooCtx>({ namespace:"foo", tools:[…] })`, declare names in
`provides.tools`, done. No agent, no model wiring, no loop inside the slice.

### Consistency findings (the "tidak konsisten" audit)

| # | Inconsistency | Status |
|---|---|---|
| C1 | **image-editor owned a private agent loop** (`lib/ai-agent.ts`) + model seam (`lib/host.ts`) = per-slice agent | ✅ fixed — lifted to `@/shared/agentic`; slice re-exports + delegates |
| C2 | image-editor redefined `JsonSchema`/`AnthropicTool` locally | ✅ fixed — `commands/types.ts` re-exports shared; `EditorCommand = Tool<EditorCtx>` |
| C3 | No `<slice>.<action>` naming convention (image-editor used bare `layer.add`) | ✅ fixed — registry namespaces on register; contract `validateTools` enforces `<id>.` prefix |
| C4 | Contract DSL had no `tools` → agentic surface undeclared/ungated | ✅ fixed — `provides.tools` (G1) + `validateTools` + image-editor declares 34 |
| C5 | **assistant** uses a different tool model: `OS_TOOLS` with `params: string[]`, "narrate only", **no JSON-schema, no invoke**, own `configureAssistantStream` seam + demo streamer | ⏳ pending — convert OS_TOOLS to real collections + make assistant THE central host (`createToolRegistry` + `runAgentLoop`); drop its private seam |
| C6 | **ai-agents** has its own `RunStep`/`RunnerBindings = unknown` (third agent model, no execution) | ⏳ pending — back its runner with the shared registry + loop |
| C7 | ai-router / ai-studio / ai-chat / ai-admin / create-your-mcp don't consume the registry | ⏳ pending — Tier-B wiring |

### Proof

`lib/shared/agentic/agentic.test.ts` — two slices (`counter`, `notes`) both
export an `add` tool; one registry namespaces them apart, `runAgentLoop` drives
both against their separate live ctx in one conversation. 7 tests green.

### Next (in order)

1. **C5 — assistant = central host.** Convert each referenced OS op to a real
   slice collection; assistant registers them all → one drivable agent. Biggest
   unlock (turns the catalog into reality).
2. **Tier-A os apps** (reel/code/file-explorer/terminal/browser/media-viewer)
   each ship a `*.tools.ts` collection.
3. **C6 — ai-agents** runner on the shared loop.
4. Tier-A* admin (gated), Tier-A data/ui, Tier-C `configure` tools.
