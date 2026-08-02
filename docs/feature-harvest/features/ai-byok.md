# AI subsystem (BYOK conversations/credentials/usage)

The persistence + governance layer under Instatic's AI Agent: a per-user **bring-your-own-key** credential vault, persisted **conversations + messages** with a denormalised token/cost ledger, per-scope **defaults**, a **model-pricing** catalogue cache, and **usage rollups** for an audit dashboard. This is the *data engine* — NOT the model-calling runtime (HTTP drivers, tool loop, system prompt) which is a separate harvest. Think of it as "the five Convex tables and their functions that make AI chat durable, multi-provider, and cost-accountable."

## What it does (flow)

End-to-end control/data flow (Instatic):

1. **Connect a provider (BYOK).** Admin opens `/admin/ai` → Providers tab → adds a credential: `{ providerId, authMode: 'apiKey'|'baseUrl', displayLabel, apiKey|baseUrl }`. The Bun server's credential repository (`server/ai/credentials/store.ts`) **encrypts** the secret with AES-256-GCM using a server master key, producing `{ ciphertext, iv }` (base64) + a `key_fingerprint`. It calls `api.aiCredentials.create` — Convex stores only the base64 ciphertext/iv and never sees the master key (crypto stays host-side, V8 runtime stays key-blind). Uniqueness on `(user_id, provider_id, display_label)` is enforced by a pre-write index read (no SQL unique index in Convex).
2. **Set a per-scope default.** Defaults tab → picks `(credentialId, modelId)` for a scope (`site`/`content`/`data`/`plugin`). `api.aiDefaults.setForScope` upserts the singleton row for that scope. The chat panel calls `loadScopeDefault()` on open so the model picker shows the configured model immediately.
3. **Chat → persist.** When the Agent Panel sends a message, a conversation row is lazily created (`api.aiConversations.create` with the resolved `credentialId`+`modelId`). Every model turn appends a message via `api.aiConversations.appendMessage` (atomic: compute next `position` → insert message → bump the parent conversation's denormalised `*_total` token/cost counters + `updated_at`). When the runtime resolves a turn's final usage, `updateMessageTokens` overwrites that message's per-call tokens AND propagates the delta onto the conversation totals + the `context_tokens` meter snapshot.
4. **Cost attribution.** `appendMessage`/`updateMessageTokens` carry `prompt_tokens`, `completion_tokens`, `cost_usd`, `cache_read_tokens`, `cache_creation_tokens`. `cost_usd` is resolved by the pricing layer: `api.aiPricing.list` feeds a `ModelCatalogue` (input/output/cache per-Mtok), refreshed wholesale via `saveCatalogue` (delete-all + re-insert, ~tens of rows). Native-cost providers (OpenRouter) supply cost directly.
5. **Audit.** `/admin/ai` → Audit tab (and a dashboard "AI usage this month" widget) call `GET /admin/api/ai/audit?since=&tz=` → `api.aiUsage.enrichedMessagesSince` returns every `ai_messages` row in the window **joined** to its conversation (scope, user, model) + credential (provider). The Bun audit store buckets those rows into five rollups: totals, byUser, byScope, byModel, byDay (calendar-day binned in the viewer's IANA timezone, JS-side — not SQL date-trunc).
6. **Lifecycle.** Conversations soft-delete (`softDelete` stamps `deleted_at`); a retention job hard-deletes old soft-deleted rows + their messages via `purgeSoftDeleted` (explicit cascade — Convex has none). Deleting a credential is FK-guarded: `remove` returns `'in_use'` if any `ai_defaults` row still references it.

personal-brand-os has **no BYOK** — it ships the simple "template" variant: a singleton AI config (`adminPanel_aiConfig.ts`: model id, system prompt, temperature, maxOutputTokens + moderation toggles) and a single-env-key Anthropic action (`features/aiChat/action.ts` reads `process.env.ANTHROPIC_API_KEY`), plus visitor chat-session logging (`chat.ts`: `chatSessions`/`chatMessages`, no tokens/cost). No per-user credentials, no encryption, no usage ledger.

## Where it lives

**Instatic** (`/home/rahman/projects/Instatic-convex`) — the full engine:
- `convex/aiCredentials.ts` — BYOK credential CRUD (`listForUser`, `readForUser`, `create`, `update`, `remove`, `touchLastUsed`)
- `convex/aiConversations.ts` — conversations + messages (`listForUserScope`, `readForUser`, `listMessages`, `create`, `update`, `softDelete`, `appendMessage`, `updateMessageTokens`, `purgeSoftDeleted`)
- `convex/aiDefaults.ts` — per-scope defaults (`list`, `setForScope`, `clearForScope`)
- `convex/aiPricing.ts` — model pricing cache (`list`, `saveCatalogue`)
- `convex/aiUsage.ts` — usage ledger join (`enrichedMessagesSince`)
- `convex/schema.ts` lines 467–557 — the five `ai_*` tables + indexes
- `server/ai/credentials/store.ts` — **the crypto seam** (host-side AES-256-GCM via `server/secrets/encryption.ts` + `server/secrets/masterKey.ts`; `toCredentialView()` is the only wire-safe projection; gated by `ai-credentials-never-leak.test.ts`)
- `server/ai/conversations/store.ts` + `server/ai/runtime/persister.ts` — thin repository adapters (row↔record mapping, TypeBox validation kept out of V8)
- `server/ai/audit/store.ts` — the five rollup aggregators (`getUsageTotals/ByUser/ByScope/ByModel/ByDay`)
- `server/ai/pricing/{index,store,openrouterCatalogue}.ts` — catalogue cache + 6h in-memory cache + DB fallback
- `server/ai/handlers/{credentials,defaults,audit,models}.ts` — REST handlers (capability-gated)
- `src/admin/pages/ai/` — `AiPage.tsx` (3 tabs) + `tabs/{ProvidersTab,DefaultsTab,AuditTab,UsageTablePanel}.tsx` + `tabs/usageFormat.ts`
- `src/admin/pages/site/panels/AgentPanel/` — `ModelPicker.tsx`, `ConversationHistory.tsx`, `ContextMeter.tsx` (consume the credentials/defaults/conversations API)
- `docs/features/agent.md` — full feature doc (lines 30–48, 105–113, 247–269 cover this BYOK layer)

**personal-brand-os** (`/home/rahman/projects/_templates/personal-brand-os`) — the simple template variant:
- `convex/adminPanel_aiConfig.ts` — singleton model/sampling config + moderation rules (no BYOK)
- `convex/features/aiChat/action.ts` — single-env-key Anthropic action (`"use node"`)
- `convex/chat.ts` — visitor `chatSessions`/`chatMessages` (no token/cost ledger)
- `components/ai-chat-fab.tsx` — floating chat UI consuming the action

## Data model

Five Convex tables (Instatic `convex/schema.ts`). All use app-generated nanoid PKs in an indexed `v.string() id` field (the `by_app_id` dialect), `*_json` columns stay opaque strings, ISO-string timestamps.

```ts
ai_provider_credentials {
  id, user_id, provider_id,
  auth_mode: 'apiKey' | 'baseUrl',
  display_label,
  ciphertext: string|null,   // base64 AES-256-GCM (host-encrypted; V8 never decrypts)
  iv: string|null,           // base64
  base_url: string|null,     // for 'baseUrl' mode (Ollama / self-hosted)
  key_fingerprint: string|null,
  created_at, updated_at, last_used_at: string|null
}  // .index by_app_id[id], by_user[user_id], by_user_label[user_id,provider_id,display_label]

ai_defaults {                // per-scope singleton (credential+model)
  scope: 'site'|'content'|'data'|'plugin',
  credential_id, model_id, updated_at, updated_by: string|null
}  // .index by_scope[scope], by_credential[credential_id]   ← FK-restrict guard

ai_conversations {
  id, user_id, scope, title,
  credential_id: string|null, model_id,
  prompt_tokens_total, completion_tokens_total, cost_usd_total,   // denormalised
  cache_read_tokens_total, cache_creation_tokens_total,
  context_tokens,            // meter snapshot of last turn's input
  created_at, updated_at, deleted_at: string|null                 // soft delete
}  // .index by_app_id[id], by_user_scope_updated[user_id,scope,updated_at], by_deleted[deleted_at]

ai_messages {
  id, conversation_id, position,            // dense per-conversation ordering
  role: 'user'|'assistant'|'tool',
  content_json: string,                     // opaque JSON block array (AiContentBlock[])
  tool_call_id: string|null, tool_name: string|null,
  prompt_tokens, completion_tokens, cost_usd,    // per-call ledger
  cache_read_tokens, cache_creation_tokens, created_at
}  // .index by_app_id[id], by_conversation_position[conversation_id,position], by_created[created_at]

ai_model_pricing {                          // catalogue cache, replaced wholesale
  pricing_key, input_per_mtok, output_per_mtok,
  cache_read_per_mtok: number|null, cache_write_per_mtok: number|null,
  context_window: number|null, refreshed_at
}  // .index by_pricing_key[pricing_key]
```

Key denormalisation: conversation totals are bumped on every `appendMessage`/`updateMessageTokens` so list views never aggregate. `enrichedMessagesSince` re-derives audit rollups from the raw `ai_messages` ledger (`by_created` window scan) because cross-user/cross-scope/by-day grouping can't be denormalised onto a single row.

## Public API

Convex functions (all declare `args` **and** `returns` validators):

| Module | Function | Kind | Purpose |
|---|---|---|---|
| aiCredentials | `listForUser{userId}` | query | per-user credentials, newest-first |
| | `readForUser{userId,credentialId}` | query | single, cross-user guarded |
| | `create{userId,providerId,authMode,displayLabel,ciphertext,iv,baseUrl,keyFingerprint}` | mutation | `{ok,row}` \| `{ok:false,reason:'duplicate'}` |
| | `update{…}` | mutation | patch label/secret; `'duplicate'`\|`'not_found'` |
| | `remove{userId,credentialId}` | mutation | `'deleted'`\|`'not_found'`\|`'in_use'` (FK guard) |
| | `touchLastUsed{credentialId}` | mutation | best-effort last-used stamp |
| aiConversations | `listForUserScope{userId,scope}` | query | non-deleted, updated_at desc |
| | `readForUser{userId,conversationId}` | query | single, guarded |
| | `listMessages{conversationId}` | query | position-ordered |
| | `create{id?,userId,scope,title,credentialId,modelId}` | mutation | new conversation (totals=0) |
| | `update{userId,conversationId,title,credentialId,modelId}` | mutation | retitle / repoint model |
| | `softDelete{userId,conversationId}` | mutation | stamp deleted_at |
| | `appendMessage{conversationId,role,content,toolCallId,toolName,…tokens}` | mutation | atomic insert + total bump |
| | `updateMessageTokens{messageId,…tokens,contextTokens}` | mutation | overwrite per-call + propagate |
| | `purgeSoftDeleted{cutoffIso}` | mutation | cascade hard-delete, returns count |
| aiDefaults | `list{}` | query | all scope defaults |
| | `setForScope{scope,credentialId,modelId,updatedBy}` | mutation | upsert singleton |
| | `clearForScope{scope}` | mutation | delete default |
| aiPricing | `list{}` | query | pricing rows → ModelCatalogue |
| | `saveCatalogue{entries[]}` | mutation | wholesale replace |
| aiUsage | `enrichedMessagesSince{sinceIso}` | query | per-message ledger + joins |

REST surface that wraps them (Instatic Bun handlers, capability-gated): `GET/POST/PUT/DELETE /admin/api/ai/credentials`, `GET/PUT/DELETE /admin/api/ai/defaults`, `GET /admin/api/ai/audit?since=&tz=`, `GET /admin/api/ai/providers/:id/models`. Capabilities: `ai.providers.manage` (credentials+defaults), `ai.audit.read` (audit).

## UI surface

**Admin (Instatic):** `/admin/ai` workspace (`AiPage.tsx`) with three tabs — **ProvidersTab** (credential CRUD: provider picker, apiKey/baseUrl form, label, fingerprint badge), **DefaultsTab** (per-scope `credential+model` picker), **AuditTab** (totals strip + byModel/byUser/byScope tables via shared `UsageTablePanel` + a byDay bar chart). In the editor: **ModelPicker** (credential+model dropdown with setup/chooseModel lock states), **ConversationHistory** (browse/restore/delete past threads), **ContextMeter** ("context used / window" bar fed by `context_tokens`).

**Admin (personal-brand-os):** a much simpler AI-config block (model/temperature/maxTokens/systemPrompt + moderation rule toggles) — no credential vault.

**Public:** the AgentPanel composer / chat FAB (`ai-chat-fab.tsx`) sends prompts and renders the persisted message stream.

## Dependencies

- **npm:** none for the data layer itself. Crypto uses Node's built-in `crypto` (AES-256-GCM) host-side; `nanoid` for app PKs (replaced by Convex `_id` / convex-auth in a portable slice). The model-calling SDKs (`ai`, `@ai-sdk/*`, `@openrouter/ai-sdk-provider`) belong to the **runtime** harvest, not here. personal-brand-os's action variant pulls `ai` + `@ai-sdk/anthropic`.
- **rr-slice deps:** `convex-auth` (identity → `user_id`), `rbac-roles` (`ai.providers.manage`, `ai.audit.read` capability gates), `audit-log` (usage/audit pairs naturally). Consumed by `ai-admin` (console UI) + `ai-chat` (workbench/FAB). Pricing fetch optionally pairs with `ai-router` for native-cost providers.

## rr coverage

**partial** — proposed slug **`ai-byok`** (net-new backend engine; UI partially covered by existing slices).

Reasoning (verified, the "covered" hint is **wrong** for the engine):
- **`ai-admin`** *declares* the territory — its contract lists `ProvidersTable`, `ModelsGrid`, `BudgetsCard`, `AuditTable` and an `AI_ADMIN_ENCRYPTION_KEY` env, and `types.ts` has `AIProvider`/`AIModel`/`Budget`/`AuditEntry` shapes. But its convex backend is a **stub**: `convex/features/ai-admin/_schema.ts` does not exist / is empty. There is no credential encryption, no conversation persistence, no usage ledger. It is a frontend console shell with no engine behind it.
- **`ai-chat`** is explicitly **stateless** — its own `aiChat/_schema.ts` says "stateless today… tables land with the W5 workbench (threads/messages/attachments)." No persisted conversations, no token ledger.
- **`ai-router`** is the **opposite of BYOK** — one shared server-side `OPENROUTER_API_KEY`, tier-routed, with a flat `aiUsage{feature,tier,tokens}` log. No per-user credentials, no conversation join, no by-day/by-user/by-scope rollups, no pricing cache.
- **`ai-studio` / `ai-agents`** are generation-canvas / autonomous-worker UIs — unrelated to the credential/conversation/usage data layer.

So the working BYOK engine (encrypted multi-provider per-user credentials + persisted conversations with a denormalised token/cost ledger + per-scope defaults + pricing-catalogue cache + joined usage rollups) is **net-new**; it is the backend `ai-admin` was always meant to sit on and the durability layer `ai-chat` defers to "W5". Honest single label: **partial** (UI surface exists; engine does not).

## Slice plan

**Action:** build-new `ai-byok` (a convex-backed vertical slice — the engine — wired so `ai-admin`'s console + `ai-chat`'s workbench bind to it instead of their stub/stateless backends).

**Laziest correct path (ponytail):** lift the five Convex modules almost verbatim — they are already clean, fully-validated (`args`+`returns`), indexed, and atomic. The 80% of the work is *the seams*, not new logic:
1. **Crypto seam.** Don't port Instatic's Bun `server/secrets/masterKey` coupling. Move encryption into a Convex `"use node"` action (`convex/features/ai-byok/crypto.ts`) using Node `crypto` AES-256-GCM keyed by an injected `AI_BYOK_ENCRYPTION_KEY` env (mirror personal-brand-os's `"use node"` action pattern). Credential `create`/`update` become actions that encrypt, then `runMutation` the storage mutation with base64 ciphertext/iv. `readForUser` stays key-blind by default; only the runtime action decrypts. Keep `toCredentialView()` (never return ciphertext to the client) as the wire-safe projection — this is the one rule worth porting wholesale.
2. **Identity seam.** Replace the caller-supplied `userId: v.string()` (Instatic trusts the arg + does `row.user_id !== userId`) with server-derived identity: `const userId = await requireUser(ctx)` from convex-auth, indexed on `v.id("users")` (or keep `v.string()` for session-managed hosts). This is the **security-relevant** change — the rr baseline forbids trusting a passed-in user id.
3. **Scope seam.** The `'site'|'content'|'data'|'plugin'` enum is Instatic-CMS-specific. Make `scope` a consumer-provided `v.string()` (or a slice-config enum) so the slice isn't bolted to CMS editor scopes.

**Portability blockers to strip:**
- Host-side master-key crypto coupling (`server/secrets/*`) → injectable env-keyed Convex `"use node"` cipher.
- Caller-trusted `userId` arg → server-side `requireUser`/`requireAdmin` in every fn (also add `requireAdmin` to `saveCatalogue`/`purgeSoftDeleted`/audit reads).
- Hardcoded scope enum + `*_json`/nanoid `by_app_id` Instatic dialect → convex-auth `_id` baseline (or document the session-managed alternative).
- Two-layer Bun-repository ↔ Convex split (row→record mapping + TypeBox in the repo) → collapse: validate + own logic inside the Convex fn (rr bp).
- `.collect()` + JS sort/filter in `listForUser`/`listForUserScope` → use the ordered index `.order('desc').take(n)`/paginate; flag `enrichedMessagesSince`/`purgeSoftDeleted` full-window `.collect()` for pagination as the ledger grows.
- REST `/admin/api/ai/*` handlers + IANA-tz JS day-binning → keep the rollup math, but expose it as a Convex query the slice UI calls directly.

**Effort:** **L** — five tables + ~21 functions + a crypto action seam + usage-rollup query + identity/scope generalisation + wiring two consumer slices. The logic is liftable; the seams (crypto, auth, scope) are the real work.

**Proposed `slice.json` shape:**
```jsonc
{
  "slug": "ai-byok",
  "category": "ai",
  "kind": "full",
  "title": "AI BYOK — Credentials · Conversations · Usage",
  "description": "Per-user bring-your-own-key credential vault (AES-256-GCM, multi-provider), persisted conversations + messages with a denormalised token/cost ledger, per-scope defaults, model-pricing cache, and joined usage rollups for an audit dashboard. The durable engine ai-admin's console and ai-chat's workbench bind to.",
  "namespace": "@/features/ai-byok",
  "convex": {
    "tablesExport": "aiByokTables",
    "schemaPath": "convex/features/ai-byok/_schema.ts",
    "rootPaths": ["convex/features/ai-byok"]
  },
  "frontend": { "slicePath": "frontend/slices/ai-byok", "configExport": "aiByokConfig" },
  "deps": {
    "npm": [],
    "shadcn": ["card","button","badge","table","dialog","input","label","select","switch","tabs"],
    "env": [{ "name": "AI_BYOK_ENCRYPTION_KEY", "scope": "convex", "required": true }],
    "peers": [
      { "slug": "convex-auth", "range": "^0.1" },
      { "slug": "rbac-roles", "range": "^0.1" },
      { "slug": "audit-log", "range": "^0.1" }
    ]
  },
  "contract": {
    "requires": {
      "auth": "convex",
      "rbac": ["ai.providers.manage","ai.audit.read"],
      "env": ["AI_BYOK_ENCRYPTION_KEY"],
      "convex": {
        "prefix": "ai_byok_",
        "tables": ["ai_byok_credentials","ai_byok_defaults","ai_byok_conversations","ai_byok_messages","ai_byok_pricing"]
      },
      "deps": ["convex-auth","rbac-roles","audit-log"]
    },
    "provides": {
      "queries": ["listCredentials","listConversations","listMessages","listDefaults","usageSince","listPricing"],
      "mutations": ["createCredential","updateCredential","removeCredential","createConversation","appendMessage","updateMessageTokens","softDeleteConversation","setDefault","clearDefault","saveCatalogue"],
      "components": ["ProvidersPanel","DefaultsPanel","UsageAuditPanel","ConversationHistory","ContextMeter"],
      "config": "aiByokConfig"  // { scopes, providers, encrypt() seam }
    },
    "generalization": { "level": "needs-adapter", "forbiddenTerms": ["rahmanef","instatic"] }
  }
}
```
Backend folder mirrors the lift: `convex/features/ai-byok/{_schema.ts, credentials.ts, conversations.ts, defaults.ts, pricing.ts, usage.ts, crypto.ts}`. Frontend slice: `frontend/slices/ai-byok/{components/{ProvidersPanel,DefaultsPanel,UsageAuditPanel,ConversationHistory,ContextMeter}.tsx, config.ts, types.ts, index.ts}` + the metadata trio.
