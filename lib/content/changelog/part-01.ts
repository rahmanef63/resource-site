import type { ChangelogEntry } from "@/features/changelog-feed";

export const entries: ChangelogEntry[] = [
  {
    "id": "APP-SERVER-HUNT",
    "version": "site@app-server-hunt",
    "date": 1782604800000,
    "kind": "fix",
    "title": "Live-site server surface — open redirect in proxy.ts closed; build-chat 500 on malformed input fixed",
    "body": "Security + correctness sweep of the deployed app's server surface (admin auth, the two LLM endpoints, external proxies, proxy.ts host rewriting, server actions), each finding adversarially verified — a speculative unsplash length-cap was correctly rejected (already rate-limited, hardcoded upstream host, percent-encoded query). 2 real bugs fixed: (1) SECURITY — proxy.ts built the external-demo redirect via new URL(request.nextUrl.pathname + search, external), putting the attacker-controlled path as the URL INPUT rather than mutating the trusted base. Empirically verified against the repo's Next 16.2.6: a request to a valid demo subdomain with path //evil.com/x yields nextUrl.pathname === '//evil.com/x' (Next does not normalize the leading //), and new URL('//evil.com/x', vercelOrigin) resolves to https://evil.com — a 307 OPEN REDIRECT off the allowlisted origin to any host (phishing / OAuth-token-leak). Now the dest is built from the trusted base first, then pathname/search assigned, so '//evil.com' collapses onto the allowlisted origin (verified: crafted // and backslash paths all stay on the Vercel host; normal paths preserved). (2) build-chat route did (body.messages ?? []).filter(...) before its try/catch — a non-array messages ({\"messages\":\"x\"}) passes the ?? guard but throws TypeError on .filter, returning a raw 500 instead of the clean 400 the surrounding validation produces; replaced with Array.isArray(...), matching the sibling agent-stream route. tsc + slices:check green.",
    "groups": [
      {
        "heading": "Fixes",
        "bullets": [
          "proxy.ts — open redirect closed: external-demo dest built from the trusted base, so a crafted //host path can't escape the allowlisted Vercel origin",
          "build-chat — malformed messages (non-array) returns a clean 400 instead of an unhandled 500"
        ]
      }
    ]
  },
  {
    "id": "ASYNC-ERROR-HUNT",
    "version": "slices@async-error-hunt",
    "date": 1782604800000,
    "kind": "fix",
    "title": "Async error handling — 6 unhandled rejections / silent failures + blob leaks fixed (image-editor, notion-shell)",
    "body": "Swept slice components for unhandled errors on user-triggered async paths + floating promises, each adversarially verified (0 rejected). 6 real bugs fixed, all P3 but reachable: image-editor menu-bar + top-bar openImage/openFile awaited loadImage() with no try/catch — an undecodable picked image (corrupt, truncated, HEIC) rejected with an unhandled promise, no layer added, no feedback, AND the createObjectURL blob leaked; now wrapped with a catch that revokes the blob. image-editor removeBg() (both bars) called removeImageBackground() — which dynamically downloads an ONNX model + WASM on first run — with try/finally but NO catch, so an offline/unsupported first use escaped as an unhandled rejection (busy reset, but the error was lost with zero feedback); added the catch. notion-shell CodeBlock copy + NotionBlock copy-link awaited navigator.clipboard.writeText with no guard — rejects in an insecure context / when the document isn't focused / on denied permission, leaving an unhandled rejection and (for CodeBlock) the copied state never set; both guarded. These slices have no error-surface channel, so the fixes prevent the unhandled rejection / stuck state / blob leak (gate-permitted swallow). slices:check 70 ok + tsc green.",
    "groups": [
      {
        "heading": "Fixes",
        "bullets": [
          { "text": "image-editor — open-image (loadImage) and remove-background now catch rejections + revoke leaked blob URLs", "slug": "image-editor" },
          { "text": "notion-shell — code-block copy + block copy-link clipboard writes guarded against unhandled rejection", "slug": "notion-shell" }
        ]
      }
    ]
  },
  {
    "id": "PKG-DEFECT-HUNT",
    "version": "cli@1.14.1 · mcp@1.2.4",
    "date": 1782604800000,
    "kind": "fix",
    "title": "CLI + MCP defect hunt — reflected XSS in the MCP OAuth consent page closed; CLI boolean-flag parsing fixed",
    "body": "First defect sweep of the published packages (packages/cli + packages/mcp — bugs here ship to every npx rr / MCP user). 10 module groups audited, every finding adversarially verified; 8 candidates surfaced, 6 correctly rejected as unreachable/dev-only (dead removeSkill, conflict-gated compose accepted-set, curated-archive dna, quote-free sync-skills regex, gen-manifest write-ordering, self-inflicted init path). 2 real bugs fixed: (1) SECURITY — the MCP OAuth 2.1 consent page rendered the attacker-influenced redirect_uri inside an onclick JS-string sink (window.location='…'); its esc() HTML-encodes the apostrophe to &#39;, which the HTML parser decodes back to a literal ' before the JS runs, so a redirect_uri like https://localhost/'-alert(document.domain)-' (valid https URL, passes the protocol check) breaks out and executes arbitrary JS on the MCP origin when the victim clicks Deny — reflected XSS. The Deny button is now an <a href> (navigation context where HTML-escaping is correct), styled to match. (2) CLI — parseFlags consumed the next token as a value for EVERY --flag (no boolean notion), so `rr add my-slice --force ./apps/web` swallowed ./apps/web as the value of --force and silently installed into the cwd instead. Replaced with a value-flag allowlist (target/template/category/at/skills/features for cli.js; from/to/repo-root for the duplicate parser in migrate-load.mjs) so boolean flags before a positional no longer eat it. Verified: XSS render check + parseFlags behavioral check + CLI vitest 57 pass. CLI 1.14.0→1.14.1, MCP 1.2.3→1.2.4 (publish pending OTP).",
    "groups": [
      {
        "heading": "Fixes",
        "bullets": [
          "MCP — reflected XSS in the OAuth consent page Deny control closed (onclick JS-string sink → <a href>)",
          "CLI — boolean flag before a positional no longer swallows it (value-flag allowlist in both parseFlags copies)"
        ]
      }
    ]
  },
  {
    "id": "A11Y-DEPTH-2",
    "version": "slices@a11y-depth-2",
    "date": 1782604800000,
    "kind": "fix",
    "title": "a11y depth pass 2 — 22 fixes: form controls labelled + click-only tabs/rows made keyboard-accessible",
    "body": "Second deep a11y sweep (form controls without labels + click handlers on non-interactive elements), each finding adversarially verified, 0 rejected. FORM LABELS: 15 inputs/textareas that exposed only a placeholder (not an accessible name) got aria-labels — landing-sections newsletter, vector-search, data-table filter, comments reply, assistant composer + the agent/skill/automation Field forms, browser omnibar, ai-chat + ai-router chat fabs, user-management members search, reel-editor + image-editor AI panels, image-editor properties panel (11 transform/stroke/brush fields whose visible <Label> had no htmlFor), app-store create form, file-explorer rename. KEYBOARD ACCESS: controls that were click-only (no role/tabIndex/onKeyDown) and thus unusable by keyboard or screen-reader users got proper key handling — code-editor + browser tab strips (role=tab + Enter/Space → select), media-studio + image-editor layer rows (role=button + guarded Enter/Space → select), and file-explorer's list-view row was converted from a bare <div> to a <Button> mirroring its own grid branch (native keyboard access, layout unchanged). One control skipped: skill-form's \"Allowed tools\" wraps a custom ToolPicker (not a labelable input). slices:check 70 ok + tsc green.",
    "groups": [
      {
        "heading": "Keyboard access (was mouse-only)",
        "bullets": [
          { "text": "code-editor + browser — file/browser tab switching now keyboard-operable (role=tab, Enter/Space)", "slug": "code-editor" },
          { "text": "file-explorer — list-view row converted to a Button (keyboard select/open) + rename field labelled", "slug": "file-explorer" },
          { "text": "media-studio + image-editor — layer rows selectable via keyboard (guarded so nested inputs still work)", "slug": "image-editor" }
        ]
      },
      {
        "heading": "Form labels (placeholder-only → aria-label)",
        "bullets": [
          { "text": "landing-sections, vector-search, data-table, comments, browser, ai-chat, ai-router, user-management, reel-editor, app-store — input/textarea accessible names added", "slug": "landing-sections" },
          { "text": "assistant — agent/skill/automation Field forms + image-editor properties panel (11 fields) labelled", "slug": "assistant" }
        ]
      }
    ]
  },
  {
    "id": "DEFECT-HUNT-R3",
    "version": "slices@defect-hunt-r3",
    "date": 1782604800000,
    "kind": "fix",
    "title": "Call-graph + a11y depth — aiChat dead nonexistent-module ref removed, 6 more icon-button/dialog-title a11y misses",
    "body": "Two more verified passes. CALL-GRAPH (convex/** excluded from root tsc, so gate-invisible): swept every ctx.run*/scheduler call against its target validator. ai-chat chat action called api.aiConfig.get — a module that exists NOWHERE in the tree (a leftover from the source project's agencyAiConfig singleton, referenced only in that one file); on the ANTHROPIC_API_KEY-set path (the real use case, outside the try) it threw 'Could not find public function'. Removed the dead runQuery + now-unused api import, inlined the existing default system prompt. (Noted but deliberately NOT changed: seo slice's generate action references api.slices.auth.me / api.slices.seo.* — the whole action targets the consumer-side `slices.*` codegen namespace, not rr's `features.*`, so it's a consumer-composition contract, not an rr-repo bug.) A11Y depth (round 1 only scratched this, capped at 10): 5 more icon-only controls with no accessible name got aria-labels — code-editor tab close (dynamic label w/ unsaved state), assistant glyph picker (matching its sibling ColorPick), appshell window-overview reveal + dock app links, notion editor toggle block; and icon-picker's dialog-fallback DialogContent had no DialogTitle (Radix a11y violation + runtime warning) — added an sr-only title. slices:check 70 ok + tsc green.",
    "groups": [
      {
        "heading": "Runtime correctness",
        "bullets": [
          { "text": "ai-chat — chat action no longer calls a nonexistent api.aiConfig.get module (threw on every keyed request); default prompt inlined", "slug": "ai-chat" }
        ]
      },
      {
        "heading": "Accessibility depth",
        "bullets": [
          { "text": "code-editor — tab close button labelled (with unsaved-changes state)", "slug": "code-editor" },
          { "text": "assistant — glyph picker buttons labelled", "slug": "assistant" },
          { "text": "appshell — window-overview reveal + dock app links labelled", "slug": "appshell" },
          { "text": "notion — editor toggle-block collapse/expand labelled", "slug": "notion" },
          { "text": "icon-picker — dialog-fallback gets a required (sr-only) DialogTitle", "slug": "icon-picker" }
        ]
      }
    ]
  },
  {
    "id": "DEFECT-HUNT-R2",
    "version": "slices@defect-hunt-r2",
    "date": 1782604800000,
    "kind": "fix",
    "title": "Convex security sweep R2 — 3 runtime null-throws (wrong internal API path), tenant priv-esc + owner-write IDOR, private-row leak",
    "body": "Per-feature-dir security sweep across all 20 convex/features handlers, each finding adversarially verified. CORRECTNESS (these crashed at runtime and shipped broken to every consumer — convex/** is excluded from root tsc so neither typecheck nor the import-gate caught them): ai callModel, bookings calWebhook, and the whole newsletter broadcast fanout referenced internal.features.<x>.MUTATIONS/QUERIES.fn (plural) but every module file is mutation.ts / query.ts (singular), so the generated API node was undefined and each ctx.runMutation/runQuery threw 'Cannot read properties of undefined' — for ai, AFTER the paid generateText() spend; for bookings, on every Cal.com webhook; for newsletter, before a single email sent. Fixed plural→singular (7 refs) + the same typo in a testimonials operator doc-comment. SECURITY: user-management hierarchy linkTenant gated members.manage only on the parent tenant while childTenantId was an arbitrary string — a tenant admin could attach ANY victim tenant as a child and then read its members (getAccessMatrix) or inject a privileged invite (sendHierarchyInvite); now requires members.manage on BOTH ends. payment recordDokuPending patched an existing order's amount + let the caller hijack its checkoutUrl with no owner check; now blocks cross-owner patch (guest + owner re-creates still pass). activity get was a public query returning private rows by id, bypassing the slice's own public-only contract (listAll is internal, listPublic filters) — now returns null for non-public rows. Deliberately SKIPPED: pages-cms listAll draft-visibility (non-tenant/actor data on a documented copy-source public read where the consumer owns the auth model — same call left as-is for the library twin).",
    "groups": [
      {
        "heading": "Runtime null-throws (shipped broken)",
        "bullets": [
          { "text": "ai-router — callModel logged usage via a plural internal API path → threw after paid spend; fixed to singular", "slug": "ai-router" },
          { "text": "cal-com-booking — calWebhook crashed on every delivery (plural mutations path); fixed to singular", "slug": "cal-com-booking" },
          { "text": "resend-newsletter — broadcast fanout threw before sending (4 plural query/mutation paths); fixed to singular", "slug": "resend-newsletter" }
        ]
      },
      {
        "heading": "Security (copy-source)",
        "bullets": [
          { "text": "user-management — linkTenant now requires members.manage on the child tenant too (closes cross-tenant disclosure + invite priv-esc)", "slug": "user-management" },
          { "text": "doku-payment — recordDokuPending blocks cross-owner amount patch + checkout-URL hijack", "slug": "doku-payment" },
          { "text": "activity — public get no longer returns private rows by id", "slug": "activity" }
        ]
      }
    ]
  },
  {
    "id": "DEFECT-HUNT-R1",
    "version": "slices@defect-hunt-r1",
    "date": 1782604800000,
    "kind": "fix",
    "title": "Defect sweep R1 — 4 cross-tenant IDOR holes closed in copy-source mutations, comment-resolve authz, 8 a11y/leak fixes",
    "body": "Multi-agent defect hunt (a11y / resource-leak / effect-correctness / null-safety / convex-correctness), each finding adversarially verified before fix. SECURITY (copy-source convex, inherited by every consumer via npx rr add): user-management mutations cancelInvite / resendInvite / removeTeam / addTeamMember / removeTeamMember all gated requirePermission on args.tenantId but then operated on a raw inviteId/teamId with no ownership match — a tenant-A admin could delete/rotate/mutate tenant-B invites, teams, and team memberships (cross-tenant IDOR). Each now loads the doc and verifies doc.tenantId === args.tenantId before touching it. comments.resolve only checked authentication, not ownership (unlike update/remove) — any signed-in user could toggle resolvedAt on any thread; now mirrors the c.actorId guard. A11Y: icon-only buttons with no accessible name got aria-labels — browser history close, assistant step reorder/delete, image-editor bold/italic + AI send, notion-database calendar prev/next-month + property rename/delete, media-viewer toolbar (IconBtn now forwards its tooltip label to aria-label). LEAK: image-picker UploadTab created a blob URL per pick and never revoked it — added a cleanup effect keyed on the preview URL. effect-correctness + null-safety dimensions came back clean. slices:check 70 ok + tsc green.",
    "groups": [
      {
        "heading": "Security (copy-source)",
        "bullets": [
          { "text": "user-management — 4 cross-tenant IDOR holes closed: cancel/resend invite + removeTeam + add/removeTeamMember now verify doc.tenantId === args.tenantId", "slug": "user-management" },
          { "text": "comments — resolve now checks thread ownership (c.actorId), matching update/remove", "slug": "comments" }
        ]
      },
      {
        "heading": "Accessibility + leak",
        "bullets": [
          { "text": "browser — history close button labelled", "slug": "browser" },
          { "text": "assistant — step up/down/delete buttons labelled", "slug": "assistant" },
          { "text": "image-editor — bold/italic (+aria-pressed) + AI send button labelled", "slug": "image-editor" },
          { "text": "notion-database — calendar month nav + property rename/delete labelled", "slug": "notion-database" },
          { "text": "media-viewer — IconBtn forwards tooltip label to aria-label (whole toolbar)", "slug": "media-viewer" },
          { "text": "image-picker — UploadTab revokes blob URLs on re-pick/unmount (no leak)", "slug": "image-picker" }
        ]
      }
    ]
  },
  {
    "id": "P7-tour-finisher",
    "version": "tour@finisher",
    "date": 1781827200000,
    "kind": "feature",
    "title": "Grand Tour ships — rr is now a slice picker + ONE /tour showcase; the OS-template catalog is retired",
    "body": "The Grand Tour (P0–P7) lands and replaces the old multi-taxonomy catalog. rr is now a pure slice picker (\"printilan\") plus ONE curated showcase: /tour walks every slice in context across six Acts — I Marketing, II OS & App Shell, III Media, IV AI, V Content, VI Platform/Auth & Commerce — driven by lib/content/tour.ts, with a per-Act rail on the index and a deep-linkable page at /tour/<id>. The content slice (Act V) gains pages-cms, the generalized CMS extracted from the retired OS-template admin surfaces. The /layouts + /templates catalog is decommissioned: lib/content/layouts.ts data is emptied, /layouts + /templates (plus the old /preview/<os-template> full-app and per-section demos) 308-redirect to /tour, and ~871 demo files under app/preview/** + components/templates/** were deleted. The 8 OS demos stay live EXTERNALLY at demo-*.rahmanef.com, served from their own Vercel dev-lab repos via the untouched proxy.ts host rewriter. Finisher pass adds a /tour smoke test to the Playwright e2e suite, rewrites the prose docs that still described /layouts + the T1–T5 OS templates as live (README, STRUCTURE, PROGRESS, eject-spec, subdomain-routing), and deletes the per-template playbook set under docs/templates/ in favour of one docs/tour.md pointer. validate:all stays green.",
    "groups": [
      {
        "heading": "Highlights",
        "bullets": [
          "/tour — 6 Acts: Marketing, OS & App Shell, Media, AI, Content, Platform/Auth & Commerce (each Act deep-linkable at /tour/<id>)",
          { "text": "pages-cms — generalized CMS slice (Act V), extracted from the retired OS-template admin surfaces", "slug": "pages-cms" },
          "/layouts + /templates decommissioned: layouts.ts emptied, routes 308→/tour, ~871 demo files deleted",
          "8 OS demos stay live externally at demo-*.rahmanef.com (proxy.ts untouched)",
          "docs reflow: stale /layouts + T1–T5 prose rewritten; docs/templates/ playbooks deleted → docs/tour.md; /tour e2e smoke test added"
        ]
      }
    ]
  },
  {
    "id": "COPY-SOURCE-HARDEN-A",
    "version": "slices@copy-source-hardening",
    "date": 1781136000000,
    "kind": "fix",
    "title": "Track A — copy-source security: callModel key-guard, payment status proxy closed, listAll internal; catalog versions synced",
    "body": "Final track of the 2026-06-11 audit. These functions are copy-source (never on rr's own backend — deploy allowlist keeps them off), but every consumer inherits them via npx rr add. ai-router 0.5.0: callModel was the one paid-AI action with a non-null-asserted OPENROUTER_API_KEY and no guard — now key-guarded like its sibling aiChat ({ ok:false, notice } when unset; success is { ok:true, text }), with documented rate-limit wiring (ai: prefix consume) left to composition to avoid a hard peer coupling. doku-payment 0.4.0: getPaymentStatus proxied DOKU's status API for ANY orderId — cross-tenant order probing plus upstream creds burn. It now requires the order to exist locally first (owned orders → caller must be the owner; guest orders → the unguessable orderId stays the capability, same rule as getOrderByOrderId); unknown/unauthorized/unconfigured all return null. activity 0.3.0: listAll returned private-visibility rows as a public query — now an internalQuery the consumer wraps in their own auth-gated query, the same pattern as the slice's mutations. notion-shell: KaTeX parse errors echo the user's TeX source — the error span is now HTML-escaped before dangerouslySetInnerHTML (self-XSS hygiene). Plus the durable catalog fix: all 50 drifted lib/content/slices.ts versions synced to slice.json (report-slices-drift now reads zero), with gen-manifest already sourcing versions from slice.json directly.",
    "groups": []
  },
  {
    "id": "BUILDER-UX-B",
    "version": "site@builder-ux",
    "date": 1781136000000,
    "kind": "improvement",
    "title": "Bundle Builder — compat notes get a path forward; project form validates inline",
    "body": "Track B of the 2026-06-11 audit. Compatibility notes in the command panel now tell the user what to DO: every warning carries an action line (incompatible → drop the slice or re-pick the template; warn → wire manually after scaffolding) plus a View-slice link to the docs page. An incompatible pair escalates the whole box to blocker-red — it was rendering as a soft amber note while the emitted command was broken. Project form: the emitted command always uses a sanitized app name, so typing 'My App!' silently scaffolded 'my-app-' — the form now shows the actual folder name when it differs, and flags malformed owner emails (aria-invalid + inline error) before they land in a scaffold. Pre-push vitest gate also retries once now: a known environmental flake exits 1 with all 468 tests green (~1/4 of hook runs); a real failure stays red on both runs.",
    "groups": []
  },
  {
    "id": "CLI-MCP-DX",
    "version": "mcp@1.2.3",
    "date": 1781136000000,
    "kind": "improvement",
    "title": "CLI network errors + MCP structured errors, stale-loader fix, manifest version SSOT",
    "body": "Track C continued (docs/audit-2026-06-11.md). CLI: every tiged clone now goes through cloneWithRetry — one silent retry on transient network errors, then an actionable message (ENOTFOUND → check connectivity; 404/ENOENT → verify slug + repo is public) instead of a raw git stack trace. MCP 1.2.3: rr_get / rr_get_slice return structured not_found payloads ({ error, message, didYouMean, try }) so a calling LLM can branch and recover instead of echoing a string; the whole tool dispatcher is try/catch-wrapped (a throwing handler — e.g. bad workflow kind — becomes a tool error, not a dead stdio server); tool descriptions rewritten with explicit use-when guidance disambiguating the three composers (init vs add vs compose_app) and rr_get vs rr_get_slice; stray kitab terminology dropped. Two real bugs found while smoking it: the data-loader preferred an installed rahman-resources over the sibling monorepo CLI — a stale 0.9.2 snapshot (8 slices) silently shadowed the 68-slice source of truth in local dev (now sibling-first); and gen-manifest took versions from the hand-curated catalog, shipping stale versions in the distributed manifest — it now reads each slice.json (the version SSOT) directly. report-slices-drift pairing fixed (entry-window matching): true catalog drift is 50/68, previously misattributed.",
    "groups": []
  },
  {
    "id": "VERSION-SSOT-GATE",
    "version": "site@version-ssot",
    "date": 1781136000000,
    "kind": "improvement",
    "title": "Version SSOT — slice.json authoritative; contract + manifest now gated in lockstep",
    "body": "Second audit-followup batch (docs/audit-2026-06-11.md, Track C). slice.json.version is now the declared version SSOT: audit:slices errors if slice.contract.ts or slice.manifest.json disagree. Reconciled the existing drift — 12 contracts (notion-shell was 19 minors stale at 0.5.0 vs 0.24.0; all migrations-empty so the bump is safe) and 4 manifests — so the snapshot/migration system (which prefers contract.version) and the install tag stop mislabelling. The hand-curated catalog (lib/content/slices.ts) carries a display-only version that nobody bumps; rather than wedge commits behind ~34 hand-edits, a warn-only report-slices-drift.mjs now surfaces it at validate:all tail (34 entries drifted, 1 catalog-only). Durable fix is to generate the catalog version from slice.json — tracked, not yet done.",
    "groups": []
  },
  {
    "id": "POLISH-A11Y-DX",
    "version": "site@audit-followups",
    "date": 1781136000000,
    "kind": "improvement",
    "title": "Audit follow-ups — SSE streaming fix, copy-button a11y, search/⌘K polish, CONTRIBUTING + skills gate",
    "body": "First batch of fixes from the 2026-06-11 full-surface audit (docs/audit-2026-06-11.md). The live assistant SSE route now sends X-Accel-Buffering: no, so per-delta streaming no longer collapses into a single end-of-turn flush behind the Dokploy/Traefik proxy. CopyButton gained aria-pressed + a state-aware aria-label and now surfaces a toast on clipboard failure instead of swallowing it silently. The catalog search placeholder is English (\"Search…\" not \"Cari…\"), and the ⌘K hint is hidden on mobile where it can't fire. A new CONTRIBUTING.md documents the three-surface sync, slice-authoring flow, validation tiers, and git hooks. pre-commit now gates skills SSOT drift (sync-skills --check) so the site can't advertise a skill the CLI doesn't ship.",
    "groups": []
  },
  {
    "id": "VP-TABS",
    "version": "site@variant-previews",
    "date": 1781049600000,
    "kind": "fix",
    "title": "Variant previews — consistent shadcn Tabs knobs + remount-on-change",
    "body": "The variant selector on every slice's Live tab (and in the Bundle Builder) is now a compact shadcn Tabs strip instead of a hand-rolled button group — one identical control across all 48 preview slices, with keyboard navigation from radix for free. Also fixes a real knob bug: axes that only feed a widget's INITIAL state did nothing on change, because the widget re-rendered without remounting. First seen on convex-auth — its defaultPasswordMode knob flips the password block's starting tab, but PasswordBlock keeps the mode in useState, so toggling signin/signup was a no-op. LazyWidget now keys the widget on the variant selection: every knob change remounts, so every declared axis takes effect on every slice.",
    "groups": []
  },
  {
    "id": "AGENTIC-BYOK",
    "version": "site@agentic-kit",
    "date": 1781049600000,
    "kind": "feature",
    "title": "Agentic kit — every slice ships a BYOK tool collection (47 collections)",
    "body": "A slice is NOT an agent — it exports a COLLECTION of function-calling tools, and ONE shared agent aggregates collections across slices. The shared kit (@/shared/agentic) ships the registry (namespaced tool aggregation + anthropicTools()), the single agent loop (runAgentLoop), a global host with mount-time self-registration (useAgentTools — remount-safe ctx rebinding), schema builders, and composable custom instructions (registry.systemPrompt() = BASE_AGENT_SYSTEM + each collection's guidance). rr holds NO model key anywhere: per slice it ships exactly (1) a custom instruction and (2) a function list; consumers bring their own key + transport — docs/agentic-byok-binding.md is the complete copy-paste binding. Safety seam: tools flag dangerous:true, runAgentLoop's confirm event runs BEFORE execution (decline = the model gets a denied tool_result), agent.md marks each one ⚠ destructive, and requirePerm() offers RBAC defense-in-depth. Coverage: 10 OS apps, 9 admin collections, 20 data/ui collections, landing-sections as the page-builder (list/add/update/remove over its LandingStore), and thin configure tools on the presentational slices — 47 total, each documented under \"Tools (agentic surface)\" + \"Agent guidance\" in its agent.md.",
    "groups": [
      {
        "heading": "Highlights",
        "bullets": [
          "landing-sections 0.3.0 — page-builder collection: compose the landing page by tool calls (13 section kinds; remove is dangerous-gated)",
          "assistant 1.1.x — central chat host runs the loop across every registered collection",
          "createSseAgentStream(url, system?) — BYOK system prompt now actually reaches the model route",
          "audit gate: a slice exporting a collection with empty contract provides.tools fails audit:slices"
        ]
      }
    ]
  },
  {
    "id": "HARDEN-W6",
    "version": "site@deferred-audit-sweep",
    "date": 1781049600000,
    "kind": "improvement",
    "title": "Hardening W6 — standalone Docker image, CSP, super-admin verified-email, lazy KaTeX, DateField",
    "body": "Closes every item deferred as riskier/design-level from the 2026-06-09 audit sweep. The site's Dockerfile is now a multi-stage standalone build (output gated behind NEXT_OUTPUT_STANDALONE=1 so local next start keeps working; outputFileTracingIncludes covers every runtime fs walk — without it the standalone image silently serves empty slice Code tabs). Site-wide CSP lands (frame-ancestors 'self'; object-src 'none'; base-uri 'self'; admin surfaces get frame-ancestors 'none'). The super-admin gate now requires a VERIFIED email on top of address equality — an unverified password sign-up of the admin address no longer owns the deployment (escape hatch env for dev). The Anonymous auth provider left the default copy-source (it made every requireUser gate satisfiable in one click). KaTeX (~280kB) lazy-loads at all four former static-import sites with a raw-TeX fallback that upgrades in place (markdown 0.3.1, notion 1.1.1, notion-shell 0.23.x). And the DateField primitive the hard rules referenced finally exists (Popover + Calendar), replacing the last input type=date.",
    "groups": []
  },
  {
    "id": "OS-UPSTREAM-SYNC",
    "version": "os-apps@upstream-sync",
    "date": 1781049600000,
    "kind": "improvement",
    "title": "os-vps upstream sync wave — shell framework + 12 OS app upgrades + 3 new slices",
    "body": "Backfilled entry for the big upstream sync (landed 2026-06-10 alongside the agentic waves). appshell 1.4.0 rebuilds the Android (Material-You) shell — wallpaper clock, pull-down Control Center, Spotlight pill — and bundles a single-pane Dashboard shell; browser 1.1.0 gains a Chrome-style multitab strip + screencast hook; os-terminal puts a PTY surface behind an injectable configurePty seam with a LIVE/MOCK banner; file-explorer 1.2.0, assistant 1.1.0, reel-editor 1.1.0 (container-first compact mode), image-editor 2.1.0, app-store 1.1.0, media-viewer 1.1.0, system-monitor 1.1.0, image-picker 0.2.0 (debounced Unsplash search + CSS-escaped url() values), code-editor 1.1.0 all sync responsive/touch upgrades from upstream. New lifts: media-studio 1.0.0 (standalone canvas studio on a configureMediaStudio seam), quicklinks 1.0.0 (injectable QuicklinksStore), shell-settings 1.0.0 (settings-app UI primitives over an AppearanceAdapter).",
    "groups": []
  },
  {
    "id": "MOTION-W1",
    "version": "slices@motion-kit-0.1.0",
    "date": 1781049600000,
    "kind": "feature",
    "title": "Motion Kit slice — scroll reveals + carousel + accordion lifted from the fleet",
    "body": "New motion-kit slice (0.1.0): zero-dependency scroll-motion layer (IntersectionObserver + CSS) plus embla Carousel and radix Accordion. Ships Reveal (fade-up/fade/fade-left/fade-right/zoom), Stagger (incremental per-child reveal for grids), CountUp (rAF count-to-value, locale-aware), Marquee (infinite logo strip, hover-pause), useInView hook, Carousel*, Accordion*. All reveal/keyframe motion gated behind prefers-reduced-motion. Consumers append globals-motion.css to app/globals.css. Lifted from the _templates fleet where 8 standalone website templates already ship a byte-identical copy (motion pass 2026-06-10); this rr slice is now the SSOT for future scaffolds. carousel.tsx split into carousel.tsx + carousel-context.tsx to stay under the 200-LOC gate. Pairs with landing-sections (its kind renderers consume these primitives).",
    "groups": []
  },
  {
    "id": "ECOM-W1",
    "version": "slices@storefront-checkout-0.1.0",
    "date": 1781049600000,
    "kind": "feature",
    "title": "E-commerce wave 1 — storefront-checkout slice + doku-payment 0.2.0 guest checkout, proven on wirausaha-os",
    "body": "First REAL consumption of the payment base — and it found real bugs. New storefront-checkout slice (0.1.0): guest cart (CartProvider + localStorage), CartWidget header sheet with qty steppers, CheckoutSummary — props-driven R3, host re-prices server-side (client subtotal is display-only). doku-payment 0.2.0: paymentOrders.userId now optional with guest buyer contact, create actions key-guarded ({ok:false,notice} when DOKU creds unset — fresh clones never crash), status query guest-readable via unguessable orderId, DokuDirectForm's raw <select> replaced with themed shadcn Select (same white-dropdown class bug onboarding-wizard fixed) and supports server-generated orderIds. Fixed broken _generated paths that proved the base was never consumed: internal.features.payment.mutations.* → .mutation.* (file is mutation.ts) in doku/midtrans actions + webhook handlers, api.features.payment.queries.* → .query.*. Payment feature README rewritten to match the ACTUAL shared-table schema (the namespace-split tables it described were never applied). End-to-end host wiring (catalog → cart → server-priced placeOrder → DOKU Direct instructions → webhook) shipped live on wirausaha-os as the reference implementation.",
    "groups": [
      {
        "heading": "Consumption-found fixes",
        "bullets": [
          "internal.features.payment.mutations.* → .mutation.* (6 webhook refs + 2 actions) — base never compiled in a consumer before",
          "doku config.ts category 'integrations' invalid in fleet defineFeature unions — consumers adjust (wirausaha used 'payment')",
          "midtrans-client npm missing in doku-only consumers breaks convex bundling — delete actions/midtrans.ts or install it",
          "payment README claimed namespace-split tables (doku_orders/midtrans_orders) that were never in _schema.ts"
        ]
      }
    ]
  },
  {
    "id": "HARDEN-W5",
    "version": "site@behavioral-tests",
    "date": 1780790400000,
    "kind": "improvement",
    "title": "Behavioral tests land — sidebar interactions, badge anchors, changelog gate, CLI aliases + coverage baseline",
    "body": "Hardening W5, closing the report's core critique: structural gates were strong but nothing verified behavior — the U7 dead-toggle shipped without a single failing test. New targeted suites (+22 tests, 425 total): nav-parts interaction tests click the actual Collapsible triggers (toggle works, collapsed-by-default, and the group/* class sits on the data-state carrier — the exact U7 chevron regression); recently-updated-badge asserts the card variant renders NO anchor (the W2 nested-<a> regression) and that deep links are page-aware; validate-changelog gets fixture-driven unit tests (future date, dup id, wrong epoch unit) via a new optional dir arg; and an offline CLI e2e spawns `rr info blog-section` to pin the U3 alias fall-through ('superseded by landing-sections'). Coverage measurement exists for the first time: vitest --coverage via @vitest/coverage-v8, baseline 35% statements / 38% lines — a number to move, not a gate (yet).",
    "groups": [
      {
        "heading": "Tests (new)",
        "bullets": [
          "docs-sidebar nav-parts: 7 interaction tests (toggle, default-collapsed, data-state carrier)",
          "recently-updated-badge: card renders no anchor; badge href page-aware; changelogHref + page math",
          "validate-changelog: 5 fixture tests (clean, future, dup, epoch, real data)",
          "CLI alias e2e: rr info <old-slug> resolves with superseded warning, offline",
          "test:coverage script — baseline 35.1% stmts / 38.5% lines"
        ]
      }
    ]
  },
  {
    "id": "HARDEN-W4",
    "version": "mcp@1.2.0",
    "date": 1780790400000,
    "kind": "improvement",
    "title": "Gates actually gate — agent.md + changelog checks in pre-commit, vitest in pre-push, MCP↔CLI version coupling",
    "body": "Hardening W4. The drift checks existed (gen:agent-md:check, slices:check) but were never wired to a hook — agent.md drifted across three waves before anyone noticed. pre-commit now runs gen:agent-md:check + validate:changelog (verified: a deliberately corrupted agent.md fails the commit); pre-push runs vitest before the build (the audits are structural — no audit ever caught a dead click). MCP's rahman-resources dependency had drifted to ^1.9.1 while the CLI sat at 1.12.x — published MCP installs silently served a stale catalog; bumped to ^1.13.0 and a new prepublishOnly check-peer gate fails any future publish whose range lags the sibling CLI. DX: typecheck script carries the 4GB heap bump (cold tsc OOMs default Node), allowedDevOrigins unblocks 127.0.0.1 dev browsing (the silent no-hydrate trap), dev:alt serves port 3457 for parallel sessions, and a warn-only ui-drift report (41 drifted primitives, 13 site-only, 5 template-only) runs at the tail of validate:all so the dual shadcn trees diverge by decision, not accident.",
    "groups": [
      {
        "heading": "Gates",
        "bullets": [
          "pre-commit: + gen:agent-md:check + validate:changelog",
          "pre-push: + vitest (~12s) before the production build",
          "packages/mcp prepublishOnly: check-peer.mjs — dependency range must admit the sibling CLI version (was ^1.9.1 vs CLI 1.12.x)"
        ]
      },
      {
        "heading": "DX",
        "bullets": [
          "typecheck script bakes NODE_OPTIONS=--max-old-space-size=4096; validate:all uses it",
          "next.config allowedDevOrigins: 127.0.0.1 dev pages hydrate again",
          "dev:alt script (port 3457) for concurrent sessions",
          "report-ui-drift.mjs — warn-only components/ui vs template-base diff at validate:all tail"
        ]
      }
    ]
  },
  {
    "id": "HARDEN-W3",
    "version": "site@debt-sweep",
    "date": 1780790400000,
    "kind": "improvement",
    "title": "Debt sweep — bidir block removed (generalization promoted), files joins the metadata system, 3.3MB orphan assets purged",
    "body": "Hardening W3. The BSDL-era bidir block survived in 20 slice contracts as pure noise — syncPolicy died with BSDL, but its nested generalization payload (level / forbiddenTerms / requiredProps) still feeds check-forbidden-terms.mjs, so it was promoted to a top-level contract field instead of deleted: all 20 contracts rewritten, SliceSyncPolicy + SliceBidirContract types and validateBidir dropped from the contract DSL, validateGeneralization replaces it. The files slice was the only catalog entry without a slice.json (the parity gate silently skipped it) — authored from its contract + catalog entry, versions aligned at 0.2.1, parity now checks 63/63 with zero skips. public/brand-assets/ carried PNG+WebP twins of every banner with no code references — 10 orphans deleted (4.4MB → 1.1MB), keeping the og:image PNG, icons, and the SVGs the footer actually uses.",
    "groups": [
      {
        "heading": "Slices",
        "bullets": [
          {
            "text": "files 0.2.1 — slice.json authored; parity gate now covers all 63 slices (0 skipped)",
            "slug": "files",
            "kind": "slice"
          }
        ]
      },
      {
        "heading": "Site + CLI lib",
        "bullets": [
          "contract DSL: bidir removed; generalization is a top-level field (forbidden-terms audit keeps its data)",
          "20 slice.contract.ts rewritten — zero bidir blocks remain",
          "brand-assets: 10 orphaned banner/wordmark files deleted (-3.3MB static weight)"
        ]
      }
    ]
  },
  {
    "id": "HARDEN-W2",
    "version": "site@changelog-integrity",
    "date": 1780790400000,
    "kind": "fix",
    "title": "Nested-anchor hydration fix + changelog data integrity (page-aware badge links, date validator)",
    "body": "Hardening W2. Three site bugs: (1) RecentlyUpdatedBadge's card variant rendered a <Link> inside CatalogCard's own <Link> — invalid HTML, confirmed hydration error, and the inner anchor sat under pointer-events-none so it was unreachable anyway; the card variant now renders the bare pill. (2) Four changelog entries were future-dated (a miscomputed UTC-midnight epoch landed on Jun 8) which made badges read 'Updated today' for a day that hadn't happened — dates corrected. (3) Badge deep links pointed at /changelog#id, but the feed paginates 10/page and anchors on later pages never scroll — PAGE_SIZE moved to changelog-helpers as SSOT, getLatestUpdate now reports the entry's page, and links carry ?page=N. New gate: scripts/validation/validate-changelog.mjs (unique ids + no future dates + epoch sanity) wired into validate:changelog and slices:check so both data bugs stay fixed.",
    "groups": [
      {
        "heading": "Site (fixed)",
        "bullets": [
          "RecentlyUpdatedBadge card variant: no more anchor-in-anchor (hydration error gone)",
          "Badge deep links are page-aware: /changelog?page=N#id via changelogHref()",
          "Four future-dated entries corrected to their real dates",
          "validate-changelog gate: unique ids, no future dates, epoch sanity (123 entries checked)"
        ]
      }
    ]
  },
  {
    "id": "HARDEN-W1",
    "version": "rate-limit@0.2.0",
    "date": 1780790400000,
    "kind": "fix",
    "title": "Security hardening W1 — touchToken bearer-proof, rate-limit policy map, Convex-backed admin login gate",
    "body": "Security audit follow-up. Two public Convex mutations were anonymously abusable: touchToken took a row id (anyone could enumerate token ids and tamper lastUsedAt) and rate-limit consume took caller-supplied limit/windowMs (anyone could forge a loose window and bypass the limit, or burn a victim key's budget). Neither can become internalMutation — ConvexHttpClient callers can't reach internal functions — so both are hardened in place: touchToken now takes the bearer token VALUE and resolves it via by_token (possession = authorization, no-op on miss); consume's limits moved to an in-code per-prefix POLICY map (unknown prefix rejected) plus an optional RATE_LIMIT_SERVER_KEY env gate compared constant-time. Admin login now uses the Convex-backed limiter when a deployment is configured (replica-safe, fail-open) with the in-memory bucket as dev fallback — and success no longer resets the counter, so a correct guess can't refund an attacker's budget. Session-token trade-off (signed-not-encrypted payload) documented in admin-auth.",
    "groups": [
      {
        "heading": "Slices (hardened)",
        "bullets": [
          {
            "text": "rate-limit 0.2.0 — consume({ key, serverKey? }) + in-code POLICY map; README documents the forged-window and budget-burn vectors",
            "slug": "rate-limit",
            "kind": "slice"
          },
          {
            "text": "create-your-mcp — touchToken({ token }) by_token lookup replaces enumerable { id }; route template passes the bearer",
            "slug": "create-your-mcp",
            "kind": "slice"
          }
        ]
      },
      {
        "heading": "Site",
        "bullets": [
          "admin login rate-limit: Convex consume when NEXT_PUBLIC_CONVEX_URL set (fail-open), memory bucket fallback; reset-on-success dropped",
          "admin-auth: session payload signed-not-encrypted trade-off documented"
        ]
      }
    ]
  },
  {
    "id": "OS-STATUS-TOKENS",
    "version": "os-apps@status-tokens",
    "date": 1780790400000,
    "kind": "improvement",
    "title": "Semantic status tokens + responsive guards — backported from os-vps across 5 slices",
    "body": "The os-vps de-gaudy sweep lands in the lifted slices: every raw Tailwind palette class used for STATUS meaning (bg-red-500, text-emerald-500, bg-amber-400, bg-sky-500, …) now reads the semantic tokens the site palette already defines — bg-success / bg-destructive / bg-warning / bg-info — so notification dots, toast icons, taskbar activity pips, error states, mute buttons and mask-edit banners all follow the active theme preset instead of fighting it. Intentionally colorful surfaces (app-icon gradients, file-type icon colors, avatar palettes) are untouched. Same wave adds responsive guards to the three fixed-width panels that could overflow small viewports: notification center (340px), inspector (300px) and the image-editor side panel (312px) now carry max-w clamps. Consumers on older copies: `npx rr update <slug>` — the slices assume --success/--warning/--info/--destructive tokens in globals.css (the rr init template ships them).",
    "groups": [
      {
        "heading": "Slices (updated)",
        "bullets": [
          {
            "text": "appshell 1.3.1 — app-badge, mobile-notification dots, notification-center (+max-w guard), window close-confirm, Windows-taskbar pips, toast-host, dynamic-island, inspector max-w guard → status tokens",
            "slug": "appshell",
            "kind": "slice"
          },
          {
            "text": "image-editor 2.0.2 — brush warning chip + mask-edit banner → warning token; side panel max-w clamp",
            "slug": "image-editor",
            "kind": "slice"
          },
          {
            "text": "reel-editor 1.0.2 — mute toggle, delete action, error states, out-of-clip indicator → status tokens",
            "slug": "reel-editor",
            "kind": "slice"
          },
          {
            "text": "browser 1.0.2 — omnibar secure-lock indicator → success token",
            "slug": "browser",
            "kind": "slice"
          },
          {
            "text": "code-editor 1.0.2 — status-bar save-error indicator → warning token",
            "slug": "code-editor",
            "kind": "slice"
          }
        ]
      }
    ]
  },
  {
    "id": "LIFT-APPSHELL-130",
    "version": "appshell@1.3.0",
    "date": 1780790400000,
    "kind": "feature",
    "title": "appshell 1.3.0 — 20-feature window-manager wave: command registry, Spaces, window tabs, Quick Look, clipboard, share, lock screen + more",
    "body": "The F1–F20 productivity wave lands from app-shell (app.rahmanef.com), where every feature shipped behind its own e2e gate (21-check headless harness, 13 vitest suites ride along in the slice). The multiplier seam is a dynamic command registry — registerCommands(source, cmds) — that Spotlight merges at runtime; nearly every other feature self-registers its palette commands through it (shells too: switching surfaces is a command). Window manager grew: always-on-top pinning, tiling presets incl. ⅓/⅔ thirds snap zones, virtual desktops (Spaces 1–4 with per-window spaceId), window tabs (merge an app's windows into one tabbed frame), saved layouts, session profiles (windows + shell prefs as one unit), and a work-area-clamped spawn cascade (windows can no longer open off-screen). New bundled features (DEFAULT_FEATURES 5 → 10): Quick Look (Space-bar previewer registry), clipboard history (⌘⇧V overlay, pin survives clear, monotonic ids), share sheet (target registry + copy/download built-ins), shortcut cheat-sheet (⌘/, source-keyed hint registry), lock screen (privacy curtain, idle auto-lock, consumer unlock guard). Notifications gained inline actions + per-app icon badges (count pill / dot / progress ring on every shell's icons, auto-driven by unread appId toasts). Plus: cross-app drag & drop (typed payloads → per-app drop handlers), focus mode (toasts go log-only), recents, a11y-ready font/contrast seams, desktop wallpaper-layer widgets (new desktopWidgets slot region), and document.title sync (\"App — Brand\", manifest.titleSync opt-out). Framework stays brand-free — the one hardcoded brand string found in review (notification cards) now reads useBrand().",
    "groups": [
      {
        "heading": "Slices (updated)",
        "bullets": [
          {
            "text": "appshell 1.3.0 — dynamic command registry, badges, layouts, recents, notification actions, pin/tiling-thirds, Spaces, window tabs, Quick Look, clipboard, share, DnD, focus mode, ⌘/ help, profiles, lock screen, desktop widgets, title sync, cascade clamp; 13 vitest suites in-slice",
            "slug": "appshell",
            "kind": "slice"
          }
        ]
      }
    ]
  },
  {
    "id": "LIFT-LIBRARY",
    "version": "library@0.1.0",
    "date": 1780099200000,
    "kind": "feature",
    "title": "library slice — resource hub (prompts · visuals · snippets · links), lifted from rahmanef.com",
    "body": "Backfilled entry for lift commit 2c3b745 (2026-05-30) — the slice landed in the catalog but skipped its changelog entry, so RecentlyUpdatedBadge never fired. One polymorphic libraryItems table holds six kinds (prompt, image, video, link, download, snippet) with per-kind payload fields switched on kind — no joins. Attribution-first (source/license/tools on every item), collections, Convex-backed with index-bounded queries (no bare .collect()). Public surface: filterable card grid + per-item detail with copy-to-clipboard for prompts/snippets and an opt-in upvote control (consumer-owned backend). Brought to project bar before landing: six raw <button> converted to shadcn <Button>, className branches cn-merged, 200-LOC cap splits on mutations + detail view. Peers the seo slice for override fields.",
    "groups": [
      {
        "heading": "Slices (new)",
        "bullets": [
          {
            "text": "library 0.1.0 — polymorphic 6-kind resource hub: Convex schema + queries/mutations, filterable grid, detail + copy + upvote",
            "slug": "library",
            "kind": "slice"
          }
        ]
      }
    ]
  },
  {
    "id": "UX-U8",
    "version": "loading-states@0.1.0",
    "date": 1780790400000,
    "kind": "feature",
    "title": "loading-states slice — skeleton + spinner SSOT, adopted across the site",
    "body": "UX wave U8. A repo-wide grep found loading UI hand-rolled everywhere: bespoke animate-pulse divs (notion hosts), raw Loader2 spans (preview-kit, admin-login), and a one-off docs body skeleton. New loading-states slice centralizes the pattern: LoadingSkeleton composes the shadcn Skeleton primitive with seven kind presets (text / card / list / table / form / page / block, count + columns overridable), and LoadingState composes the shadcn Spinner for in-flight work (inline / block / overlay). The page kind drops straight into a route loading.tsx. The site now eats its own dog food: DocsLoadingSkeleton keeps only the docs-shell chrome strips and delegates its body to kind=\"page\"; the notion database/notes hosts swap pulse divs for kind=\"block\"; preview-kit chat + composer and admin-login swap Loader2 for the Spinner primitive. Per-slice skeletons (icon-picker, notion editor) stay put — slice self-containment beats DRY across slice boundaries.",
    "groups": [
      {
        "heading": "Slices (new)",
        "bullets": [
          {
            "text": "loading-states 0.1.0 — LoadingSkeleton (7 kinds) + LoadingState (3 variants) on shadcn Skeleton/Spinner; previews for every kind",
            "slug": "loading-states",
            "kind": "slice"
          }
        ]
      },
      {
        "heading": "Site (adopted)",
        "bullets": [
          "DocsLoadingSkeleton body now renders LoadingSkeleton kind=\"page\" — chrome strips stay bespoke",
          "Notion database/notes hosts: ad-hoc animate-pulse divs → LoadingSkeleton kind=\"block\"",
          "preview-kit chat/composer + admin-login: raw Loader2 → shadcn Spinner primitive",
          "agent.md regen catch-up for admin + the five U6 slices (titles/taglines drifted since U5–U7)"
        ]
      }
    ]
  },
  {
    "id": "UX-U7",
    "version": "site@sidebar-tree",
    "date": 1780790400000,
    "kind": "fix",
    "title": "Docs sidebar tree actually folds — dead chevrons fixed, sections collapsed by default",
    "body": "UX wave U7. Three compounding bugs killed the docs-sidebar tree: (1) category branches never toggled at all — SidebarMenuButton's tooltip prop wraps the button in a Tooltip root, and CollapsibleTrigger's asChild Slot merged its onClick onto that non-DOM wrapper, silently dropping the handler; (2) section chevrons never rotated — the group/section class sat on SidebarGroupLabel, which Radix never stamps data-state on, so the group-data-[state=open] selector could not match; (3) every section defaulted to open, rendering the whole catalog as one wall. Fixes: tooltip dropped from the trigger (sidebar is always full-width — it added nothing), group classes moved to the Collapsible roots that actually carry data-state, and only the section containing the active path starts open (navigation re-opens, manual toggles stick). Also: publish gate caught template-base/contact-form-resend still on the removed \"email\" category — moved to integrations.",
    "groups": [
      {
        "heading": "Site (fixed)",
        "bullets": [
          "Branch toggle: tooltip-in-CollapsibleTrigger swallowed clicks — removed",
          "Chevron rotation: group/* classes now live on the data-state-carrying Collapsible roots",
          "Sections collapsed by default except the one holding the active path"
        ]
      },
      {
        "heading": "Slices (fixed)",
        "bullets": [
          {
            "text": "contact-form-resend (template-base copy): category email → integrations (unblocks CLI publish gate)",
            "slug": "contact-form-resend",
            "kind": "slice"
          }
        ]
      }
    ]
  },
  {
    "id": "OS-HOOKS-V6-SYNC",
    "version": "os-apps@hooks-v6",
    "date": 1780790400000,
    "kind": "improvement",
    "title": "react-hooks v6 compliance sweep backported from os-vps + macOS-style app icons",
    "body": "The os-vps lint sweep (55 compiler-era react-hooks warnings → 0, rules promoted to error) lands in every lifted slice so both repos are line-identical outside seams again. Pattern conversions, no blanket disables: latest-ref mirrors move into effects, effect-driven resets become request/prop-keyed derived state (window-content, file-tree, use-konva-image, favicon, omnibar, remote-view, NumBox, waveform, spotlight), dynamic icon lookups render via createElement (useMemo does NOT satisfy static-components — probed), inline components hoist to module scope, the image-editor co-locates selection+mask in one state so the mask-exit invariant is atomic, history snapshots canUndo/canRedo at mutation time, and the inspector AI thread resets via key= remount. Bonus: the appshell AppIcon drops the hard iOS-glass sheen for a macOS Ventura treatment — soft full-height luminance ramp, hairline edge ring, layered drop shadow, shadowed glyph — mirrored in the app-store icon preview + card tiles.",
    "groups": [
      {
        "heading": "Slices (changed)",
        "bullets": [
          { "text": "appshell 1.2.1 — hooks-v6 clean (window-content keyed loader, url-sync/app-switcher ref mirrors, spotlight mounts per open, inspector key= remount) + Ventura AppIcon", "slug": "appshell", "kind": "slice" },
          { "text": "image-editor 2.0.1 — atomic selection+mask state, mutation-time history flags, paintBox memo, derived dirty, un-curried overlay drags", "slug": "image-editor", "kind": "slice" },
          { "text": "reel-editor 1.0.1 — frameRef mirror, keyed NumBox draft, .then-form imports browser, lazy layout init, map-derived waveform", "slug": "reel-editor", "kind": "slice" },
          { "text": "browser 1.0.1 — keyed favicon error, keyed omnibar draft, lazy usePersistent", "slug": "browser", "kind": "slice" },
          { "text": "app-store 1.0.1 — createElement glyph tiles + ramp sheen; assistant 1.0.1, media-viewer 1.0.1, code-editor 1.0.1 (file-tree keyed listing), os-terminal 1.0.1 ref mirrors", "slug": "app-store", "kind": "slice" }
        ]
      }
    ]
  },
  {
    "id": "UX-U6",
    "version": "rahman-resources@1.12.0",
    "date": 1780790400000,
    "kind": "feature",
    "title": "Five basics every app needs — data-table, empty-states, marketing-chrome, settings-page, notifications-center",
    "body": "UX wave U6. The catalog had editors, payments and an OS shell — but no data table, no 404 page, no footer. Five foundational slices land, all pure-UI, adapter-driven where state is involved, each with variant previews + smoke coverage (registry 37 → 42): data-table (generic DataTable<TData> on TanStack Table v8 + shadcn Table — sorting, search, pagination, row selection, column visibility; density/selectable axes), empty-states (six presets 404/500/403/no-results/empty-list/first-use on the shadcn Empty primitive + ErrorPage drop-in for app/not-found.tsx + error.tsx), marketing-chrome (config-driven MarketingHeader split/centered/minimal + mobile sheet menu, MarketingFooter columns/slim — the chrome every template hand-rolled), settings-page (Profile/Preferences/Notifications/Danger-zone shell over a two-method SettingsAdapter with optimistic save), notifications-center (bell + unread badge + popover/sheet inbox over a NotificationsAdapter; enhances appshell + dashboard-shell). CLI 1.12.0 carries them plus the U2 category enum + U3 alias resolution.",
    "groups": [
      {
        "heading": "Slices (NEW)",
        "bullets": [
          { "text": "data-table — TanStack v8 + shadcn Table; sorting / search / pagination / selection / column visibility", "slug": "data-table", "kind": "slice" },
          { "text": "empty-states — 404/500/403/no-results/empty-list/first-use presets + ErrorPage drop-in", "slug": "empty-states", "kind": "slice" },
          { "text": "marketing-chrome — MarketingHeader (3 layouts, sheet menu) + MarketingFooter (2 layouts)", "slug": "marketing-chrome", "kind": "slice" },
          { "text": "settings-page — adapter-driven settings shell, 4 sections, optimistic save", "slug": "settings-page", "kind": "slice" },
          { "text": "notifications-center — bell + inbox, adapter-driven, enhances appshell/dashboard-shell", "slug": "notifications-center", "kind": "slice" }
        ]
      },
      {
        "heading": "CLI",
        "bullets": [
          "1.12.0 — 62 slices in manifest, integrations/data category enum, alias resolution, @tanstack/react-table dep guidance"
        ]
      }
    ]
  },
  {
    "id": "UX-U5",
    "version": "site@shell-hierarchy",
    "date": 1780790400000,
    "kind": "improvement",
    "title": "Shell hierarchy made explicit — one chrome, inner surfaces mount inside it",
    "body": "UX wave U5. Six shell-family slices (appshell, dashboard-shell, workspace-shell, admin-panel, admin, platform-admin) had no documented composition story — consumers couldn't tell which renders chrome and which mounts inside it. Now: /architecture gains a \"Shell hierarchy — who composes whom\" section (one rule: exactly one outer chrome, never nest two); admin-panel + platform-admin declare dashboard-shell as a peer with the mount direction in the reason; the admin slice's description states upfront that it is HEADLESS (nav-from-registry scaffold, no chrome); AdminShell's docblock spells out that it is the INNER section nav. Investigation note: AdminShell composing DashboardShell directly would nest two chromes — wrong by the hierarchy's own rule — so the DRY here is the contract, not a forced refactor.",
    "groups": [
      {
        "heading": "Site (changed)",
        "bullets": [
          "/architecture: shell hierarchy section (appshell → dashboard-shell → inner surfaces)"
        ]
      },
      {
        "heading": "Slices (changed)",
        "bullets": [
          { "text": "admin-panel + platform-admin: dashboard-shell peer with mount-direction reason", "slug": "admin-panel", "kind": "slice" },
          { "text": "admin: description repositioned as headless scaffold (pair with dashboard-shell)", "slug": "admin", "kind": "slice" }
        ]
      }
    ]
  },
  {
    "id": "UX-U4",
    "version": "site@consistency",
    "date": 1780790400000,
    "kind": "improvement",
    "title": "UI consistency pass — one header family, one spacing rhythm, detail-page parity",
    "body": "UX wave U4. Docs pages had three header patterns (PageHeader, inline text-3xl copies, a custom text-lg bar on /build) and four page-spacing values. Now: PageHeader gains a compact bar variant (used by /build); /control-room, /audit-chain and /agents/[slug] swap their hand-rolled headers for PageHeader; page root spacing standardized to space-y-8; section h2 standardized to text-2xl (audit-chain, best-practice); DocCard bakes in p-4 default padding (twMerge keeps explicit overrides working); ShotThumbnail's aspect-[8/5] normalized to the same aspect-[16/10] string everyone else uses (identical 1.6 ratio, one spelling). Slice detail pages gain the prev/next arrows the layout detail header already had — both detail chromes now match.",
    "groups": [
      {
        "heading": "Site (changed)",
        "bullets": [
          "PageHeader compact variant; adopted on /build, /control-room, /audit-chain, /agents/[slug]",
          "space-y-8 page rhythm + text-2xl section h2 everywhere",
          "DocCard default p-4; ShotThumbnail aspect-[16/10]",
          "Slice detail header: prev/next catalog navigation (parity with layouts)"
        ]
      }
    ]
  },
  {
    "id": "UX-U3",
    "version": "cli@aliases",
    "date": 1780790400000,
    "kind": "improvement",
    "title": "Superseded slugs stay installable — CLI aliases + URL redirects for the merged landing sections",
    "body": "UX wave U3. The seven landing-page section slices (blog-section, faq-section, portfolio-section, changelog-feed, feature-grid, testimonials-grid, pricing-page) were merged into landing-sections as kind-variants back in v0.2.0 — but their old slugs just errored in the CLI and 404'd on the site. Now: lib/content/slice-aliases.json is the SSOT; gen-manifest embeds it as manifest.aliases; the CLI's findEntry falls through to the alias with a \"superseded by\" warning, so npx rahman-resources add blog-section installs landing-sections; /slices/<old-slug> redirects to /slices/landing-sections; each old slice.json carries deprecated: \"landing-sections\" (new optional schema field). Also fixed: landing-sections was miscategorized as infra — it's content.",
    "groups": [
      {
        "heading": "CLI (changed)",
        "bullets": [
          "manifest.aliases — superseded slug → successor; findEntry resolves through it with a warning",
          "slice-schema.json: optional \"deprecated\" field (successor slug)"
        ]
      },
      {
        "heading": "Site (changed)",
        "bullets": [
          { "text": "/slices/<old-section-slug> → redirect to landing-sections; category fixed infra → content", "slug": "landing-sections", "kind": "slice" }
        ]
      }
    ]
  },
  {
    "id": "UX-U2",
    "version": "site@taxonomy-ssot",
    "date": 1780790400000,
    "kind": "improvement",
    "title": "Taxonomy SSOT — 8 categories, one label map, no more sidebar drift",
    "body": "UX wave U2. Category order + labels were duplicated in four components and drifted: docs-sidebar showed \"Ai\"/\"Ui\" (naive capitalize), the /build picker was missing \"os\" entirely (OS slices invisible in the group list), the /slices tab row was missing OS too, and an empty \"Storage\" group sat in the sidebar. New lib/content/taxonomy.ts is the single source; all four consumers import it. Categories merged 12 → 8: payment+email → integrations, search+realtime → data, storage dropped (was empty). Moved: doku-payment, midtrans-payment, resend-newsletter, contact-form-resend → integrations; vector-search, broadcast-channel-sync → data. Sidebar label \"Website templates\" → \"Templates — full apps\" and both catalog heroes now state what they are NOT (layouts = single page shapes; templates = complete apps) — killing the layouts-vs-templates confusion.",
    "groups": [
      {
        "heading": "Site (changed)",
        "bullets": [
          "lib/content/taxonomy.ts — SLICE/LAYOUT category order + label SSOT (4 duplicates deleted)",
          "Categories 12 → 8: integrations (payment+email), data absorbs search+realtime, storage removed",
          "Fixed: /build picker + /slices tabs missing the os group; \"Ai\"/\"Ui\" labels",
          "Templates vs Layouts disambiguated in sidebar labels + catalog hero subtitles"
        ]
      },
      {
        "heading": "Slices (changed)",
        "bullets": [
          { "text": "doku-payment, midtrans-payment, resend-newsletter, contact-form-resend → integrations", "slug": "doku-payment", "kind": "slice" },
          { "text": "vector-search, broadcast-channel-sync → data", "slug": "vector-search", "kind": "slice" }
        ]
      }
    ]
  },
  {
    "id": "UX-U1",
    "version": "site@terminology",
    "date": 1780790400000,
    "kind": "improvement",
    "title": "One name for one thing — \"Slices\" everywhere, \"kitab\" retired from copy",
    "body": "UX wave U1. The catalog had two names for the same artifact: nav said Slices while the homepage hero, /docs intro, breadcrumbs, command palette and detail titles said Modules — and the live site description still said \"kitab\" (pre-2026-05-16 internal codename). All user-facing copy now says Slices; kitab → catalog/resources in site.ts, /build, /mcp and /directory copy. Dead code out: the orphaned /recipes/[slug] route (parent already redirects to /slices) and the never-used \"template\" layout category (union + LAYOUT_CATEGORY_TITLE entry).",
    "groups": [
      {
        "heading": "Site (changed)",
        "bullets": [
          "Modules → Slices: hero, /docs intro + card, showcase heading, command palette, slice detail breadcrumb + meta title, /agents copy",
          "kitab → catalog: site description, /build subtitle, /mcp pages, /directory footer",
          "Removed orphan app/(docs)/recipes/[slug] + dead \"template\" layout category"
        ]
      }
    ]
  },
  {
    "id": "MULTISHELL",
    "version": "appshell@1.2.0",
    "date": 1780704000000,
    "kind": "feature",
    "title": "appshell 1.2.0 — switchable multi-shell OS: macOS / Windows 11 / Android / iOS + consumer shells",
    "body": "The shell framework grows a shell REGISTRY: chrome is now pluggable while the window store stays single. registry/shells.tsx holds ShellDescriptor (id/surface/group/windowed/wallpaper/render) + per-surface user prefs (a desktop shell AND a mobile shell, resolved by live form factor; sv:shell). Built-ins register on import: macOS (existing DesktopChrome), Windows 11 (centered taskbar + Start menu + Snap-Assist + caption-button windows via Window variant=windows), Android Material-You (status-bar shade w/ quick tiles, at-a-glance home, swipe-up App Drawer, gesture nav, Recents deck) and iOS (existing MobileShell, now with a left-half pull-down Notification Center + app long-press quick-actions). Consumers register their own (os-vps adds a single-pane Dashboard cockpit). Geometry became chrome-aware: WindowState.snapZone persists the snapped zone and applyChromeInsets() re-tiles snapped/maximized windows when a shell with different chrome mounts. Desktop fidelity pass rides along: dock magnification (gaussian, width-conserving) + dock right-click menus, macOS Notification Center backed by a persistent toast log (lib/toast), Cmd+Tab app switcher, Window Overview (Mission Control), desktop context menus, menu-bar Window/Help system menus, and wallpaper=auto resolving to the active shell's native backdrop (wp-win11/material/ios presets). Lifted from os-vps (Topside) after a two-way merge with app-rahmanef's fork — close guards + winId, dock Link deep-links and the shadcn Button sweep all kept. Every file under the 200-LOC gate (dock/menu-bar/mobile-home/store/android split into *-parts).",
    "groups": [
      {
        "heading": "appshell (NEW)",
        "bullets": [
          { "text": "registry/shells.tsx — ShellDescriptor registry + per-surface prefs (setShell/useShellPrefs/resolveShell)", "slug": "appshell", "kind": "slice" },
          { "text": "components/shells/windows/* — Windows 11 taskbar / Start menu / Snap-Assist / shell", "slug": "appshell", "kind": "slice" },
          { "text": "components/shells/android/* — Material-You shell (shade / drawer / recents / gesture nav)", "slug": "appshell", "kind": "slice" },
          { "text": "components/shells/{context-menu,window-overview}.tsx — shared chrome", "slug": "appshell", "kind": "slice" },
          { "text": "components/{notification-center,app-switcher,mobile-notifications}.tsx — macOS NC, Cmd+Tab, iOS NC", "slug": "appshell", "kind": "slice" },
          { "text": "lib/store-snap.ts — snapZone + applyChromeInsets/retileSnapped + Snap-Assist onSnap pulse", "slug": "appshell", "kind": "slice" }
        ]
      },
      {
        "heading": "appshell (changed)",
        "bullets": [
          { "text": "window.tsx variant=macos|windows; desktop.tsx resolveShell + PhoneFrame preview + Cmd+Arrow snap keys", "slug": "appshell", "kind": "slice" },
          { "text": "menu-bar Window/Help menus; menu-bar-status clock -> Notification Center with unread dot", "slug": "appshell", "kind": "slice" },
          { "text": "wallpaper auto -> ShellDescriptor.wallpaper; appshell.css wp-win11/material/ios/auto presets", "slug": "appshell", "kind": "slice" },
          { "text": "lib/toast.ts persistent notification log (useNotifications/dismiss/clear/markRead)", "slug": "appshell", "kind": "slice" }
        ]
      }
    ]
  },
  {
    "id": "SHOTS",
    "version": "shots@layouts",
    "date": 1780790400000,
    "kind": "improvement",
    "title": "Screenshot pipeline — /layouts cards go from 36 live iframes to 36 static webps",
    "body": "Last VP-wave leftover. scripts/capture-shots.mjs drives the VPS headless Chromium (the os-browser service) over the deployed site, captures every layout previewPath at 1280×800, downscales to 800×500 webp via PIL (~18KB each, 656KB total) and writes public/shots/layouts/* plus the lib/preview/shots.gen.json manifest. /layouts catalog cards now render the captured shot first (one <Image>, accurate, instant), keep the live-iframe path only for slugs without a capture, and the procedural mock as last resort — previously every card booted a full Next page in a scaled iframe. Operator-run via npm run shots:capture (all / single slug / SHOTS_BASE override) — screenshots drift slowly, so it's not a CI gate. /templates keeps its existing poster system.",
    "groups": [
      {
        "heading": "Infra",
        "bullets": [
          { "text": "scripts/capture-shots.mjs + npm run shots:capture — capture → PIL webp → manifest, per-slug filter + failure exit" },
          { "text": "components/site/catalog/shot-thumbnail.tsx — static <Image> thumbnail + layoutShot() lookup" },
          { "text": "app/(docs)/layouts/page.tsx — shot → iframe → mock fallback chain" }
        ]
      }
    ]
  },
  {
    "id": "OS-CATEGORY",
    "version": "taxonomy@os-category",
    "date": 1780790400000,
    "kind": "improvement",
    "title": "New \"OS Apps\" category — 11 os-vps slices leave the UI junk drawer",
    "body": "The UI cluster had ballooned to 24 slices, 11 of them the os-vps app family. New `os` category across the taxonomy (SliceCategory union, slice-schema enum, sidebar order + \"OS Apps\" label, /build picker groups automatically): appshell, file-explorer, image-editor, reel-editor, code-editor, media-viewer, system-monitor, os-terminal, assistant (moved from AI — it is the OS assistant app; ai tag stays), browser, app-store. Category is metadata-only — no version bumps, `npx rr add <slug>` unchanged. Sidebar now: UI 13, OS Apps 11.",
    "groups": [
      {
        "heading": "Slices touched",
        "bullets": [
          { "text": "appshell, file-explorer, image-editor, reel-editor, code-editor, media-viewer, system-monitor, os-terminal, assistant, browser, app-store — category ui/ai → os", "slug": "appshell" }
        ]
      },
      {
        "heading": "Infra",
        "bullets": [
          { "text": "defineFeature SliceCategory + slice-schema enum + site-sidebar ORDER/LABEL + build-sections — \"os\" wired end to end" }
        ]
      }
    ]
  },
  {
    "id": "VP-DETAIL",
    "version": "variant-previews@detail-pages",
    "date": 1780790400000,
    "kind": "improvement",
    "title": "Live variant previews on /slices detail pages",
    "body": "Site-simplify follow-up: variant previews were only reachable inside the Bundle Builder, so the catalog detail pages still read as static docs. Every /slices/<slug> page whose slug is in the preview registry now gets a \"Live\" tab next to Preview/Code/Details — the same auto-knob VariantPreview widget the builder mounts, fed by the same rr-demo localStorage data. 37 slices become interactive where people actually evaluate them.",
    "groups": [
      {
        "heading": "Infra",
        "bullets": [
          { "text": "app/(docs)/slices/[slug]/slice-detail-client.tsx — \"Live\" tab via PREVIEW_SLUGS registry membership; renders <VariantPreview slug> in the docs-shell tab chrome" }
        ]
      }
    ]
  },
  {
    "id": "VP-TB",
    "version": "variant-previews@template-base",
    "date": 1780790400000,
    "kind": "improvement",
    "title": "dashboard-shell + admin-panel join the preview registry (template-base root)",
    "body": "gen-preview-registry now scans template-base/frontend/slices too — with a twist the smoke gate caught before production: template-base ships its OWN node_modules (a second react), so any .tsx living there crashes hooks when bundled. Render files for template-base slices therefore live SITE-SIDE at components/templates/_shared/previews/<slug>.preview.tsx (importing only site-compiled code) while the previews declaration stays in the slice's slice.json. dashboard-shell previews the real _shared DashboardShell all 8 OS templates mount (flat-nav / grouped-nav scenarios); admin-panel previews the 17-block operational overview grid. Registry: 37 slugs. Honest boundary documented in the spec: motion-primitives, responsive-dialog, three-column and workspace-shell are facades over @/frontend/shared/* — their implementations exist only in consumer projects, so rr cannot preview them truthfully; contact-form-resend is convex-bound.",
    "groups": [
      {
        "heading": "Slices touched",
        "bullets": [
          { "text": "dashboard-shell — flat-nav / grouped-nav scenarios over the real _shared shell", "slug": "dashboard-shell" },
          { "text": "admin-panel — operational-blocks overview, density axis", "slug": "admin-panel" }
        ]
      },
      {
        "heading": "Infra",
        "bullets": [
          { "text": "gen-preview-registry — second scan root + per-root render-file location + slug-collision guard" },
          { "text": "docs/SLICE-PREVIEW-SPEC.md — template-base rules + smoke-gate + not-previewable boundary" }
        ]
      }
    ]
  },
  {
    "id": "OS-APPS-WAVE",
    "version": "os-apps@wave-1",
    "date": 1780704000000,
    "kind": "feature",
    "title": "Five more os-vps apps land: system-monitor, os-terminal, assistant, browser, app-store",
    "body": "The big lift wave — every remaining os-vps app that could stand alone now does. Each follows the established host-seam recipe: lib/host.ts is the ONLY coupling point, with an injectable adapter and an honest offline default, so all five render alive with zero backend. system-monitor runs on a wavy telemetry mock until configureSysmon points at a real host; os-terminal's 17 built-ins run on its in-memory FsModel, with configureTerminal flipping ls/cat live and passing unknown commands to one-shot exec; assistant answers with a typing demo stream until configureAssistantStream brings any async text-delta generator; browser fakes its viewport with a canvas demo renderer until configureBrowser drives a real headless Chromium; app-store (with the Create-App flow bundled in — rr forbids cross-slice imports) manages a localStorage app registry whose useInstalledApps() feeds any appshell-style launcher. Skipped on purpose: os-settings (host-specific devices/server panels). The catalog now carries 9 of the 10 os-vps user apps.",
    "groups": [
      {
        "heading": "Slices touched",
        "bullets": [
          { "text": "system-monitor — NEW 1.0.0: gauges + sparklines + process table; SysMonAdapter seam", "slug": "system-monitor" },
          { "text": "os-terminal — NEW 1.0.0: shell emulator, in-memory FsModel, live fs/exec passthrough", "slug": "os-terminal" },
          { "text": "assistant — NEW 1.0.0: streaming chat + agents/skills/automations library; bring-your-own LLM stream", "slug": "assistant" },
          { "text": "browser — NEW 1.0.0: remote-browser chrome; BrowserAdapter seam + offline canvas demo renderer", "slug": "browser" },
          { "text": "app-store — NEW 1.0.0: storefront + Create-App over one localStorage registry; useInstalledApps() descriptors", "slug": "app-store" },
        ],
      },
    ],
  },
  {
    "id": "VP-SMOKE",
    "version": "variant-previews@smoke-gate",
    "date": 1780790400000,
    "kind": "improvement",
    "title": "Preview smoke gate + honest no-preview cards in the builder",
    "body": "Investigating a \"previews are missing\" report: every one of the 35 registered previews renders clean (verified live on production via headless Chromium + a new happy-dom smoke test). The real gap was silence — selected slices WITHOUT a preview (headless/server slices, opt-outs, template-base slices outside the registry) rendered nothing at all in /build, which reads as broken. The SlicePreviews panel now shows coverage (n/total) and an explicit \"No live preview — headless / server-side, or preview not yet authored\" card listing those slugs. New permanent gate: lib/preview/preview-smoke.test.tsx mounts EVERY registered preview with default variants in happy-dom on `npm test` (pre-push) — catches mount crashes and declared-component drift that tsc + the generator can't. vitest aliases now mirror tsconfig paths (@/features, @/shared dual-mapping) so tests can import through the registry.",
    "groups": [
      {
        "heading": "Infra",
        "bullets": [
          { "text": "lib/preview/preview-smoke.test.tsx — 35 previews mount-tested in happy-dom (now 357 tests total)" },
          { "text": "components/build/variant-preview.tsx — coverage header + dashed no-preview card for previewless selections" },
          { "text": "vitest.config.mts — @/features + @/shared alias parity with tsconfig (custom dual-dir resolver)" }
        ]
      }
    ]
  },
  {
    "id": "NOTION-1",
    "version": "notion@1.0.0",
    "date": 1780790400000,
    "kind": "feature",
    "title": "notion 1.0.0 — the block editor port is COMPLETE and in the catalog",
    "body": "M2c+M3+M4 land in one wave, closing the port that started 2026-06-03. M2c composes the working editor: BlockEditor + PageEditor orchestrators (dnd-kit drag with column layouts, slash menu, markdown triggers, per-block undo, paste-markdown import via a synthesized insertBlocksAfter over the seam's block CRUD), PageActionsMenu (font/width/lock/copy/duplicate/move/trash + md/html/txt export through the vendored export libs), SelectionToolbar (inline formatting), MentionTypeahead (async adapter search), DatabasePicker (delegates to adapter.database.pickDatabase), TocBlock, PageRefBlock, the page-editor chrome (title, breadcrumbs, actions, subpages, cover strip, skeleton/not-found) and a props-driven RowPropertiesPanel. M3 ports the pure convex block helpers (_blocks/_blockOps, 31 unit tests) into convex/features/notion. M4 flips the slice off WIP: version 1.0.0, public catalog entry (npx rr add notion), and a live variant preview — the full PageEditor running on a localStorage-backed in-memory EditorDataAdapter (two scenarios, every edit persists). Mount with adapter `{}` for a plain markdown block editor; wire data/selection/comments/ai/database/mention/page adapters to light up host capabilities. Source app peers that don't cross the seam (sharing, snapshots, wiki, analytics, notifications, presence) stay host-side by design.",
    "groups": [
      {
        "heading": "Slices touched",
        "bullets": [
          { "text": "notion — M2c compose (28 new files) + M3 convex helpers + M4 catalog entry, preview, 1.0.0", "slug": "notion" },
          { "text": "markdown — unchanged, but the bridge note now points both ways: same grammar, blocksToMarkdown/markdownToBlocks", "slug": "markdown" }
        ]
      },
      {
        "heading": "Infra",
        "bullets": [
          { "text": "vitest now scans convex/features/**/*.test.ts — 322 tests total (was 291)" },
          { "text": "@notion/shared vendors: database/property types, exportContext, html, databaseTable, csvCells (page → md/html export with embedded-database tables)" }
        ]
      }
    ]
  },
  {
    "id": "QA-MANIFEST",
    "version": "manifests@schema-a",
    "date": 1780790400000,
    "kind": "improvement",
    "title": "Manifest debt zeroed + previews for the freshly lifted editors",
    "body": "validate:manifests had 23 long-standing (warn-only) errors: 7 slices still shipped the legacy {name, deps, notes} manifest shape and user-management used a stability value outside the enum. All 7 are converted to Schema A (slug/version/tier/distribution/files/imports — file lists from git, imports scanned from source; preview.tsx excluded), user-management moves alpha → experimental, and the validator now reports 0 errors. The two os-vps editors lifted this morning also join the variant-preview registry (33 slugs total): code-editor with three mock-fs scenarios and media-viewer with the offline sample gallery + a data-URI remote payload.",
    "groups": [
      {
        "heading": "Manifests → Schema A",
        "bullets": [
          { "text": "image-picker, notion-database, notion-shell, notion-sidebar, selection, theme-presets — legacy shape converted; versions sourced from slice.json", "slug": "notion-database" },
          { "text": "files — converted with distribution.method \"manual\" (no slice.json yet; consumed by the notion template + image-picker page)" },
          { "text": "user-management — stability \"alpha\" → \"experimental\" (schema enum)", "slug": "user-management" }
        ]
      },
      {
        "heading": "New previews",
        "bullets": [
          { "text": "code-editor — sample-tree / markdown-doc / python-script scenarios over the writable mock fs", "slug": "code-editor" },
          { "text": "media-viewer — sample-gallery / remote-image scenarios, fully offline", "slug": "media-viewer" }
        ]
      }
    ]
  },
  {
    "id": "CODE-EDITOR",
    "version": "code-editor@1.0.0",
    "date": 1780704000000,
    "kind": "feature",
    "title": "code-editor 1.0.0 — overlay syntax editor lifted from os-vps",
    "body": "Fourth os-vps app in the catalog. A lightweight editor — transparent textarea over a highlighted pre (regex tokenizer for JS/TS/JSON/CSS), tabs with dirty dots, Cmd/Ctrl+S, status bar — plus a lazy per-directory explorer tree with inline create affordances. The lift bundles the previously app-shared file-tree into the slice and ships slice-local AppSidebar (rail ⇄ Sheet) and FormDrawer (dialog ⇄ bottom drawer) shims, so the only coupling point is lib/host.ts: configureCodeFs injects a real filesystem (list/read/write/mkdir) over the bundled writable in-memory mock. Pairs with file-explorer (onOpenFile → payload) the same way os-vps wires Files → Code.",
    "groups": [
      {
        "heading": "Slices touched",
        "bullets": [
          { "text": "code-editor — NEW 1.0.0: overlay highlighting, tab strip, lazy explorer tree, injectable CodeFsAdapter + writable mock", "slug": "code-editor" },
        ],
      },
    ],
  },
  {
    "id": "MEDIA-VIEWER",
    "version": "media-viewer@1.0.0",
    "date": 1780704000000,
    "kind": "feature",
    "title": "media-viewer 1.0.0 — quick-look media viewer lifted from os-vps",
    "body": "Third os-vps app to land in the catalog, and the lightest: a macOS-Preview-style quick-look surface for image/video/audio/pdf/text. The lift follows the editors' host-seam recipe — lib/host.ts is the ONLY coupling point, with two injectable seams: configureMediaSource maps fs paths to fetchable URLs (identity default, so public URLs need zero wiring) and configureMediaOpener routes the Open-in-editor handoff to whatever shell hosts it. Launched bare it runs a fully offline sample gallery. Pairs naturally with file-explorer (onOpenFile → payload) and the image/reel editors.",
    "groups": [
      {
        "heading": "Slices touched",
        "bullets": [
          { "text": "media-viewer — NEW 1.0.0: zoomable image stage, audio/video transport players, pdf embed, editor handoff + media source seams", "slug": "media-viewer" },
        ],
      },
    ],
  },
  {
    "id": "VP6",
    "version": "variant-previews@full-catalog",
    "date": 1780790400000,
    "kind": "feature",
    "title": "Preview backfill — 31 slices in the variant-preview registry + coverage gate + Vercel demo links",
    "body": "VP-6 closes the VP wave. 28 new preview.tsx files land across the catalog (31 total in the generated registry): every marketing section, UI utility, content/data surface and previewable subsystem now renders live in the Bundle Builder with auto-generated knobs. Headless / embed / no-seam slices (ai-router, audit-log, cal-com-booking, resend-newsletter, reel-editor, seo, vector-search) explicitly opt out with `\"previews\": []` — a new audit:slices rule warns when a component-bearing slice neither declares nor opts out, and gen-preview-registry errors on an opt-out that still ships a preview.tsx. layouts.ts gains demoUrl: all 8 OS templates now link their own Vercel deployments (the dev-lab repos, always ahead of rr's snapshot) from the detail page, overriding the demo-subdomain rewrite.",
    "groups": [
      {
        "heading": "Marketing sections (variants)",
        "bullets": [
          { "text": "blog-section — layout cards/list/featured-split × columns × align", "slug": "blog-section" },
          { "text": "faq-section — layout single/two-column/grouped × align", "slug": "faq-section" },
          { "text": "feature-grid — layout cards/minimal/alternating/grouped × columns × align", "slug": "feature-grid" },
          { "text": "testimonials-grid — layout cards/quote-stack/masonry × columns × align", "slug": "testimonials-grid" },
          { "text": "portfolio-section — layout uniform/masonry/asymmetric × columns × align", "slug": "portfolio-section" },
          { "text": "pricing-page — columns 2-4 × featuredVariant ring/scale/tint", "slug": "pricing-page" },
          { "text": "changelog-feed — layout timeline/cards/list", "slug": "changelog-feed" }
        ]
      },
      {
        "heading": "UI utilities",
        "bullets": [
          { "text": "icon-picker — twemoji/native render style, picked icon previews live", "slug": "icon-picker" },
          { "text": "image-picker — Button variant × size (gallery/link/upload zero-config)", "slug": "image-picker" },
          { "text": "command-menu — palette rendered inline/open with live cmdk filtering", "slug": "command-menu" },
          { "text": "theme-presets — ThemePresetSwitcher sm/mobile under real providers", "slug": "theme-presets" },
          { "text": "selection — live marquee rubber-band select over demo rows", "slug": "selection" },
          { "text": "appshell — AppFrame scenarios: collapsed/expanded/with-topbar", "slug": "appshell" }
        ]
      },
      {
        "heading": "Content + data",
        "bullets": [
          { "text": "comments — density × resolved axes, replies persist via demo store", "slug": "comments" },
          { "text": "library — all-kinds/prompts-only/empty scenarios", "slug": "library" },
          { "text": "activity — with-stats/feed-only/empty scenarios", "slug": "activity" },
          { "text": "landing-sections — hero-only/hero-features/full-page scaled scenarios", "slug": "landing-sections" },
          { "text": "markdown + notion-database + full-width-toggle — pilots from VP-3", "slug": "markdown" }
        ]
      },
      {
        "heading": "Auth + admin + subsystems",
        "bullets": [
          { "text": "convex-auth — AuthCard methods × defaultPasswordMode, mock handlers", "slug": "convex-auth" },
          { "text": "rbac-roles — PermissionMatrix role seeds × readOnly", "slug": "rbac-roles" },
          { "text": "user-management — members/roles/teams/access scenarios, edits persist", "slug": "user-management" },
          { "text": "admin — AdminPage default/saas/blog presets", "slug": "admin" },
          { "text": "file-explorer — root/documents/projects, in-memory adapter CRUD", "slug": "file-explorer" },
          { "text": "notion-shell — CalloutBlock kind axis, editable seeded block", "slug": "notion-shell" },
          { "text": "notion-sidebar — nested-tree/with-icons/flat-list, live page CRUD", "slug": "notion-sidebar" },
          { "text": "ai-chat — with-mock-bot/unconfigured scenarios (canned reply)", "slug": "ai-chat" },
          { "text": "doku-payment — VA/QRIS/e-wallet/retail sandbox instructions", "slug": "doku-payment" },
          { "text": "midtrans-payment — single-item/cart/subscription checkout amounts", "slug": "midtrans-payment" },
          { "text": "image-editor — square/wide blank Konva docs, client-only stage", "slug": "image-editor" }
        ]
      },
      {
        "heading": "Infra",
        "bullets": [
          { "text": "gen-preview-registry — `\"previews\": []` opt-out support + stray-preview.tsx error" },
          { "text": "audit:slices — preview-coverage warning for component-bearing slices (advisory, flips to error at sustained 100%)" },
          { "text": "layouts.ts demoUrl — 8 OS templates link their Vercel dev-lab deployments; template-detail prefers it over the demo subdomain" }
        ]
      }
    ]
  },
  {
    "id": "SHELL-SYNC1",
    "version": "appshell@1.1.0 + file-explorer@1.1.0",
    "date": 1780617600000,
    "kind": "improvement",
    "title": "appshell + file-explorer synced with os-vps upstream fixes",
    "body": "Drift burn-down after the editors lift. appshell 1.1.0 ports the per-window close guard (setCloseGuard + AppProps.winId — apps can block close on unsaved work); audit confirmed multi-window, snap-grid geometry and stable capability refs were already in the rr copy. file-explorer 1.1.0 ports the Files-app UX fixes: the details panel always renders (selected entry or current folder) with a copy-path button, and mutation errors surface the REAL backend message through a friendly() mapper instead of a generic mask.",
    "groups": [
      {
        "heading": "Slices touched",
        "bullets": [
          {
            "text": "appshell — setCloseGuard close guard + AppProps.winId plumbing (from os-vps 6644ae3)",
            "slug": "appshell"
          },
          {
            "text": "file-explorer — copy-path in details panel + honest error surfacing (lib/errors.ts friendly mapper)",
            "slug": "file-explorer"
          }
        ]
      }
    ]
  },
  {
    "id": "VP1",
    "version": "variant-previews",
    "date": 1780704000000,
    "kind": "feature",
    "title": "Variant previews + AI builder — slices preview like shadcn primitives",
    "body": "VP wave. Slices now declare a machine-readable `previews` block in slice.json (enum variant axes for leaf slices, scenario presets for subsystems) rendered by a sibling preview.tsx fed by localStorage demo data (createDemoStore, rr-demo:<slug> — client-only, zero VPS compute). gen-preview-registry.mjs emits lib/preview/{registry.gen.ts, preview-meta.gen.json} — one code-split dynamic import per slug, nothing hardcoded. The Bundle Builder mounts <VariantPreview> with auto-generated knobs for every selected slice, and a Builder AI panel (key-guarded /api/build-chat) function-calls the dynamic tool surface (list_slices / get_slice / preview_slice / compose_bundle — tool defs built at request time from the catalog + preview metadata) and renders validated preview_slice calls live. Pilots: full-width-toggle (variants), markdown (tabs × content axes), notion-database (table/board/list/chart scenarios). preview.tsx is rr-internal — `rr add` strips it. Spec: docs/SLICE-PREVIEW-SPEC.md.",
    "groups": [
      {
        "heading": "Slices touched",
        "bullets": [
          {
            "text": "full-width-toggle — pilot leaf preview (variant axis: icon/button/segment)",
            "slug": "full-width-toggle"
          },
          {
            "text": "markdown — pilot medium preview (tabs read/crud × content basic/rich)",
            "slug": "markdown"
          },
          {
            "text": "notion-database — pilot subsystem scenarios (table/board/list/chart)",
            "slug": "notion-database"
          }
        ]
      }
    ]
  },
  {
    "id": "EDITORS-LIFT",
    "version": "image-editor@2.0.0 + reel-editor@1.0.0",
    "date": 1780617600000,
    "kind": "feature",
    "title": "Video editor lifted + image editor v2 — both self-contained, every file ≤200 LOC",
    "body": "Two os-vps creative apps land as catalog slices. reel-editor (NEW): a complete in-browser NLE — layered multi-track timeline (top row renders frontmost), one Canvas-2D draw path shared by preview AND realtime WebM exporter (real mixed audio), keyframes/easing/presets, transitions, text styling, color grading, 6 resizable workspace layouts, quick-import files pane on an injectable fs adapter (configureReelFs, in-memory mock default), sonner toasts. image-editor v2 (BREAKING): rebuilt editor replaces v1 — AI function-calling command registry (EDITOR_COMMANDS + useEditorCommands + in-editor chat) with an injectable stream bridge (configureAgentStream; chat optional), headless server.ts command runner, layer styles, tool rail chrome. Both slices were refactored upstream so every file passes the 200-LOC gate. dashboard-ide layout preview rebuilt as a real IDE: lazy explorer (per-folder fetch on expand, listing + DOM dropped on collapse — node_modules costs nothing until opened), open-file tabs, one-body editor, status bar.",
    "groups": [
      {
        "heading": "Slices touched",
        "bullets": [
          {
            "text": "reel-editor — lifted from os-vps; self-contained host seam (sonner / no-op shell buses / injectable fs adapter); slice-local Segmented + native-range Slider primitives",
            "slug": "reel-editor"
          },
          {
            "text": "image-editor — v2.0.0 BREAKING: AI command registry + injectable configureAgentStream + headless server.ts; replaces the react-konva v1 surface",
            "slug": "image-editor"
          }
        ]
      },
      {
        "heading": "Templates touched",
        "bullets": [
          {
            "text": "dashboard-ide — real-IDE recipe: lazy explorer (RAM ≈ visible rows), tabs, breadcrumb, status bar; production swap = file-explorer FileExplorerAdapter",
            "slug": "dashboard-ide",
            "kind": "template"
          }
        ]
      }
    ]
  },
  {
    "id": "PUBGATE1",
    "version": "rahman-resources@1.10.0",
    "date": 1780617600000,
    "kind": "fix",
    "title": "Unblock CLI 1.10.0 publish — slice.json drift + structure violations",
    "body": "prepublishOnly gates were red. Fixed: image-picker deps.env string → typed object (UNSPLASH_ACCESS_KEY, scope server, optional); slice-schema gains optional deps.sharedFiles (notion-database / notion-shell already used it); version/title parity synced for resend-newsletter (0.1.3), ai-chat (0.2.0), landing-sections (0.2.0), markdown title; deleted stale template-base/frontend/slices/notion port-staging copy (R1 dual-home); AiChatFab refactored props-driven — convex/react import replaced with injected `chat` prop (R3).",
    "groups": [
      {
        "heading": "Slices touched",
        "bullets": [
          {
            "text": "image-picker — env dep typed (server-scoped, optional)",
            "slug": "image-picker"
          },
          {
            "text": "ai-chat — AiChatFab props-driven (`chat` prop, exported AiChatSend types)",
            "slug": "ai-chat"
          }
        ]
      }
    ]
  },
  {
    "id": "MARKDOWN2",
    "version": "markdown",
    "date": 1780531200000,
    "kind": "feature",
    "title": "markdown slice — CRUD tabs (Read/Write/Review) + mermaid diagrams + charts",
    "body": "md-reader renamed to `markdown` and maximised. <MarkdownPage> adds optional surfaces: Read (rich text), Write (raw source editor with snippet toolbar + live preview), Review (block-anchored comments with add/resolve — controlled callbacks or internal fallback). Fenced ```mermaid blocks render as SVG diagrams (dynamic-imported mermaid) and ```chart blocks as recharts bar/line/area/pie from a JSON spec. Notion sync grammar unchanged.",
    "groups": [
      {
        "heading": "Slices touched",
        "bullets": [
          {
            "text": "markdown — MarkdownPage tabs + MermaidBlock + ChartBlock + comments model",
            "slug": "markdown"
          }
        ]
      }
    ]
  },
  {
    "id": "MD-READER1",
    "version": "md-reader",
    "date": 1780531200000,
    "kind": "feature",
    "title": "Markdown Reader slice — notion-synced rich-text page container",
    "body": "New read-only surface that renders a markdown string as a clean document (headings, lists, todo, callouts, fenced code, KaTeX, tables, images, toggles, inline marks). Sync with the notion block editor is by shared grammar: a new notion bridge (blocksToMarkdown / markdownToBlocks) serialises blocks ↔ the exact markdown this reader parses — so anything readable as a notion page is readable here, and back. Self-contained (own parser + inline renderer, no notion runtime dep). 21 tests.",
    "groups": [
      {
        "heading": "Slices touched",
        "bullets": [
          {
            "text": "md-reader — new: MarkdownReader container + parseMarkdown + inline renderer",
            "slug": "markdown"
          },
          {
            "text": "notion — added shared/lib/markdown bridge (blocksToMarkdown / markdownToBlocks)",
            "slug": "markdown"
          }
        ]
      }
    ]
  },
  {
    "id": "DB-DATE7",
    "version": "notion-database",
    "date": 1780444800000,
    "kind": "fix",
    "title": "Date cell: back to the custom grid + range click-sequence",
    "body": "Reverting to the shadcn Calendar broke picking again (it's the unreliable part here); the self-contained DateCalendar grid is what works. Restored it and added Notion-style range picking: with End date on, click 1 = start, click 2 = end (the earlier of the two is always kept as start, so clicking before the start swaps them); clicking once a full range exists starts a fresh range.",
    "groups": [
      {
        "heading": "Slices touched",
        "bullets": [
          {
            "text": "notion-database — custom date grid + range click-sequence",
            "slug": "notion-database"
          }
        ]
      }
    ]
  },
  {
    "id": "DB-DATE6",
    "version": "notion-database",
    "date": 1780444800000,
    "kind": "fix",
    "title": "Date picking — pin react-day-picker to v9 (shadcn Calendar's target)",
    "body": "Root cause: the repo pinned react-day-picker ^10.0.0, but this shadcn Calendar component is generated for rdp v9; v10's breaking changes silently stopped the controlled mode/selected/onSelect path from registering day clicks (same bug in notion-page-clone). Fix: pin react-day-picker to ^9.14.0 (what the shadcn Calendar targets) and restore the canonical Popover + Calendar date picker (mode=single / mode=range).",
    "groups": [
      {
        "heading": "Slices touched",
        "bullets": [
          {
            "text": "notion-database — custom DateCalendar (drop react-day-picker)",
            "slug": "notion-database"
          }
        ]
      }
    ]
  },
  {
    "id": "DB-DATE5",
    "version": "notion-database",
    "date": 1780444800000,
    "kind": "fix",
    "title": "Date picking — decouple from react-day-picker v10 selection state",
    "body": "Dates couldn't be picked (same in notion-page-clone) — the controlled mode/selected/onSelect path broke under react-day-picker v10. The calendar now handles clicks via onDayClick and drives the selected-day + range highlight purely from `modifiers`, both fed by our own value, so it no longer relies on rdp's internal selection state machine.",
    "groups": [
      {
        "heading": "Slices touched",
        "bullets": [
          {
            "text": "notion-database — date picking via onDayClick (rdp-v10-proof)",
            "slug": "notion-database"
          }
        ]
      }
    ]
  },
  {
    "id": "NB-M2B2B",
    "version": "notion M2b.2b",
    "date": 1780444800000,
    "kind": "feature",
    "title": "notion-editor M2b.2b — nested-rendering subtree (M2b complete)",
    "body": "Ported the recursive nested-block tree behind the adapter seam: NestedBlock (self-registering dispatcher) + NestedContent (by-type renderer — database via adapter.database, page nav via adapter.page, page icon via a built-in PageIcon, code via SimpleCodeBlock) + ToggleBlock + ColumnBlockEditor (split into column/panes) + SyncedBlock (split into synced/views + ChildrenList, cross-page source via pages/workspaceId) + NestedBlockControls. Completes M2b — chrome + nested rendering done. Next: M2c BlockEditor/page shell.",
    "groups": [
      {
        "heading": "Slices touched",
        "bullets": [
          {
            "text": "notion — M2b.2b nested rendering (WIP cluster)",
            "slug": "notion"
          }
        ]
      }
    ]
  },
  {
    "id": "DB-DATE4",
    "version": "notion-database",
    "date": 1780444800000,
    "kind": "fix",
    "title": "Date picking reliable again — single-mode calendar + active field",
    "body": "react-day-picker range mode wasn't registering clicks. Switched the calendar to single mode (the proven path) for both modes: range now uses an active-field model (two fields, click to choose which the calendar edits — matching Notion's blue active field) with the start→end span shaded via modifiers. Picking works again.",
    "groups": [
      {
        "heading": "Slices touched",
        "bullets": [
          {
            "text": "notion-database — date picking fix (single-mode active field)",
            "slug": "notion-database"
          }
        ]
      }
    ]
  },
  {
    "id": "DB-DATE3",
    "version": "notion-database",
    "date": 1780444800000,
    "kind": "fix",
    "title": "Date range picking + End-date toggle synced with the column header",
    "body": "Fixed: dates couldn't be picked in range mode (an empty cell passed a {from:undefined} range that broke react-day-picker's first click — now passes undefined). The cell's End-date toggle now patches prop.dateRange, the same switch the column header's edit-property panel toggles, so the two stay in sync.",
    "groups": [
      {
        "heading": "Slices touched",
        "bullets": [
          {
            "text": "notion-database — range pick fix + End-date toggle sync",
            "slug": "notion-database"
          }
        ]
      }
    ]
  },
  {
    "id": "NB-M2B2A",
    "version": "notion M2b.2a",
    "date": 1780444800000,
    "kind": "feature",
    "title": "notion-editor M2b.2a — block toolbar wired to the adapters",
    "body": "Ported the per-block toolbar (BlockControls hub + MenuHierarchy action menu + QuickButtons/GripButton) against the frozen seam: data CRUD + selection via useEditorData/useSelection, comments via useComments (popover + count), AI panel via optional useAi. The nested-rendering subtree (toggle/columns/synced) is the next slice (M2b.2b).",
    "groups": [
      {
        "heading": "Slices touched",
        "bullets": [
          {
            "text": "notion — M2b.2a block toolbar (WIP cluster)",
            "slug": "notion"
          }
        ]
      }
    ]
  },
  {
    "id": "DB-DATE2",
    "version": "notion-database",
    "date": 1780444800000,
    "kind": "fix",
    "title": "Date range: side-by-side start/end over one range calendar + clickable end time",
    "body": "Range mode now shows two date fields side by side over a single range-highlighting calendar (was two stacked calendars), matching Notion. Toggling End date seeds end=start so the end-time field is immediately enabled — fixes end time being unclickable.",
    "groups": [
      {
        "heading": "Slices touched",
        "bullets": [
          {
            "text": "notion-database — range date layout + end-time fix",
            "slug": "notion-database"
          }
        ]
      }
    ]
  },
  {
    "id": "DB-DATE",
    "version": "notion-database",
    "date": 1780444800000,
    "kind": "improvement",
    "title": "Date cell editor relaid out to match notion-page-clone",
    "body": "The date-type cell popover now mirrors NCP: a date+time header row, one calendar, an inline End-date section, then the options list — so start/end time sit beside their date instead of stacked. Uses a formatted display + shadcn time input (no native date input).",
    "groups": [
      {
        "heading": "Slices touched",
        "bullets": [
          {
            "text": "notion-database — date cell editor relayout",
            "slug": "notion-database"
          }
        ]
      }
    ]
  },
  {
    "id": "CL-LINKS",
    "version": "changelog",
    "date": 1780444800000,
    "kind": "fix",
    "title": "Changelog bullets no longer link to dead slugs",
    "body": "Bullets pointing at a slug that isn't in the catalog (renamed, merged, deleted, or WIP like notion) now render as plain text instead of linking to a 404. Valid slugs — including ones that ship later — still link.",
    "groups": [
      {
        "heading": "Site",
        "bullets": [
          "changelog — sanitize bullet links against the live catalog"
        ]
      }
    ]
  },
  {
    "id": "NB-M2B1",
    "version": "notion M2b.1",
    "date": 1780444800000,
    "kind": "feature",
    "title": "notion-editor M2b.1 — block-CRUD + selection/comments/AI adapter seam",
    "body": "Expanded the EditorAdapter seam: EditorDataAdapter (block + page CRUD, no-op fallback), revised SelectionAdapter, CommentsAdapter (hook + popover with no-op default), AiAdapter, plus useEditorData/useSelection/useComments/useAi context hooks. BlockShell wired to selection. Sets up the chrome port (M2b.2).",
    "groups": [
      {
        "heading": "Slices touched",
        "bullets": [
          {
            "text": "notion — M2b.1 adapter seam + BlockShell (WIP cluster)",
            "slug": "notion"
          }
        ]
      }
    ]
  },
  {
    "id": "RM-MDX",
    "version": "cleanup",
    "date": 1780444800000,
    "kind": "chore",
    "title": "Remove deprecated mdx-blog slice",
    "body": "Deleted mdx-blog (superseded by the notion editor). Unwired from catalog, registry, family-map, and the saas-marketing-os template copy.",
    "groups": [
      {
        "heading": "Slices touched",
        "bullets": [
          "mdx-blog — removed"
        ]
      }
    ]
  },
  {
    "id": "NB-M2A",
    "version": "notion M2a",
    "date": 1780444800000,
    "kind": "feature",
    "title": "notion-editor M2a — block rendering + editing behind the adapter",
    "body": "Block render (BlockBody, registry, built-in code block) + editing layer (slash menu, key/input/slash handlers) ported behind the EditorAdapter seam. Uploads route through the adapter; raw file inputs → FilePicker.",
    "groups": [
      {
        "heading": "Slices touched",
        "bullets": [
          {
            "text": "notion — M2a block render + edit (WIP cluster)",
            "slug": "notion"
          }
        ]
      }
    ]
  },
  {
    "id": "NB-M1",
    "version": "notion M1",
    "date": 1780444800000,
    "kind": "feature",
    "title": "notion-editor M1 — cluster scaffold + decoupled pure core",
    "body": "New notion block-editor cluster (slice-of-slices). Vendored block model, 151-test pure core, and the EditorAdapter seam that inverts 13 cross-slice deps to optional host adapters.",
    "groups": [
      {
        "heading": "Slices touched",
        "bullets": [
          {
            "text": "notion — new cluster + pure core (WIP)",
            "slug": "notion"
          }
        ]
      }
    ]
  },
  {
    "id": "PV-OVR",
    "version": "preview overhaul",
    "date": 1780358400000,
    "kind": "improvement",
    "title": "Content-slice previews + mdx-blog deprecation",
    "body": "Rebuilt seo/comments previews responsive; added services + testimonials previews (public + admin). mdx-blog deprecated in favour of the notion-editor.",
    "groups": [
      {
        "heading": "Slices touched",
        "bullets": [
          {
            "text": "seo, comments — responsive previews",
            "slug": "seo"
          },
          {
            "text": "services, testimonials — new previews",
            "slug": "services"
          },
          {
            "text": "mdx-blog — deprecated",
            "slug": "mdx-blog"
          }
        ]
      }
    ]
  },
  {
    "id": "CM-THR",
    "version": "comments threading",
    "date": 1780358400000,
    "kind": "feature",
    "title": "comments — real reply threading + content-slice cleanup",
    "body": "comments gains real parentId threading + buildThread tree. Best-practice pass across mdx-blog/seo/comments (barrels, kitab purge, as-any removal).",
    "groups": [
      {
        "heading": "Slices touched",
        "bullets": [
          {
            "text": "comments — parentId + buildThread",
            "slug": "comments"
          }
        ]
      }
    ]
  },
  {
    "id": "WS-07",
    "version": "workspace-shell",
    "date": 1780358400000,
    "kind": "feature",
    "title": "workspace-shell — clean sidebar-07 dashboard preview",
    "body": "Rebuilt the workspace-shell preview as a shadcn sidebar-07 dashboard: team switcher = atomic workspace×menuSet context, collapsible nav, nav-user footer.",
    "groups": [
      {
        "heading": "Slices touched",
        "bullets": [
          {
            "text": "workspace-shell — sidebar-07 preview",
            "slug": "workspace-shell"
          }
        ]
      }
    ]
  },
  {
    "id": "CK1P",
    "version": "CK-1P",
    "date": 1780185600000,
    "kind": "feature",
    "title": "appshell — manifest-driven desktop + mobile OS shell, lifted from os-vps",
    "body": "New tier-3 slice: a generic, brand-free OS-style shell framework. One <AppShell manifest> wrapper provider gives any project a macOS-style window manager (drag/snap/maximize, dock with macOS click-to-focus + hover window switcher, menu bar, ⌘K Spotlight) AND an iOS-style mobile surface (home pager, app library, control center, widgets). Everything project-specific arrives through the manifest: brand, apps, features, surface regions, capabilities (data/auth/AI injection seam), persistence, keymap. The five shell features (search, inspector, notifications, control-center, widgets) ship bundled inside the slice as defineFeature() contributions that mount into named <Slot>s — `rr add appshell` installs the whole shell as one unit. Responsiveness is a single ResponsiveProvider + 4 DRY primitives (AppFrame, MasterDetail, ResponsiveToolbar, TouchList). Lift hardening: the slice was made fully self-contained (imports nothing but @/components/ui/* + @/lib/utils — ResponsiveDialog and a graceful useIsMobile were pulled in-slice), and four oversized files were split under the 200-LOC cap (store, responsive-dialog, menu-bar, mobile-app-library). Source: os-vps (Topside).",
    "groups": [
      {
        "heading": "Slices touched",
        "bullets": [
          {
            "text": "appshell — lifted from os-vps; desktop+mobile shell, 5 features bundled (new, 0.1.0)",
            "slug": "appshell"
          }
        ]
      }
    ]
  },
  {
    "id": "CK1O",
    "version": "CK-1O",
    "date": 1779926400000,
    "kind": "fix",
    "title": "Empties the CK-1L deferred list: newsletter rate-limit + orphaned checkEmail removed",
    "body": "Closes the last two CK-1L (Lane A) deferrals. (1) newsletter.subscribe — the lite subscribe mutation had no abuse defense beyond an email-shape check, so it now mirrors the hardened `subscribers` slice: a honeypot field (`website`), a per-email windowed rate-limit (new `newsletterSubscribeAttempts` table + `by_email_time` index, 3 attempts/hour), and an explicit `returns` validator. Idempotency + status flow unchanged; the new optional `website` arg is non-breaking. resend-newsletter 0.1.1 -> 0.1.2 (its slice.manifest.json was also stale at 0.1.0 and is corrected). (2) convex-auth — removed `convex/features/auth/checkEmail.ts`, an orphaned httpAction port (anti-enumeration email check + signin-attempt throttle) that imported non-existent `_shared/clientIp` + `_shared/origin` and queried a `loginCheckIpEvents` table defined in no schema. It was wired into no http router and called by no frontend, yet shipped to every consumer through the convex-auth `convexFiles` glob — breaking their `convex dev`. Removed rather than restored: nothing consumes it, and restoring would build an unused speculative feature (the design survives in git history if ever wanted). convex-auth 0.2.0 -> 0.2.1. Note: true per-IP rate-limiting would need an httpAction (Convex mutations can't read request headers); per-email + honeypot matches the production-grade subscribers pattern. convex/** is outside the root typecheck, so the new table's _generated types land on the next `convex dev` — code mirrors deployed slice patterns to stay correct-by-construction.",
    "groups": [
      {
        "heading": "Slices touched",
        "bullets": [
          {
            "text": "resend-newsletter — honeypot + per-email rate-limit + returns validator on subscribe (0.1.1 -> 0.1.2)",
            "slug": "resend-newsletter"
          },
          {
            "text": "convex-auth — removed orphaned/broken checkEmail.ts (0.2.0 -> 0.2.1)",
            "slug": "convex-auth"
          }
        ]
      },
      {
        "heading": "CK-1L deferred list",
        "bullets": [
          "All three CK-1L follow-ups now closed — admin.stats gate (CK-1N), newsletter rate-limit + checkEmail (here)."
        ]
      }
    ]
  },
  {
    "id": "CK1N",
    "version": "CK-1N",
    "date": 1779926400000,
    "kind": "fix",
    "title": "Closes CK-1L deferral: admin.stats now requireAdmin-gated",
    "body": "Follow-up to CK-1L (Lane A) closing the highest-severity deferred item: `convex/features/admin/query.ts:stats` was a public, unauthenticated `query` returning dashboard counts plus the 12 most-recent activity rows across every table — including contact-submission names/emails — so any caller could read it over WebSocket. The `admin` slice already advertised \"Gated by requireAdmin on Convex side\" in its slice.json, README, agent recipe, and catalog entry, so this is a documented-contract drift rather than a behaviour change: the handler now calls `await requireAdmin(ctx)` first (the same gate used by services/subscribers/testimonials/create-your-mcp, honouring the `SUPER_ADMIN_EMAIL` bypass). No call site in this repo is affected — the rr site's own /admin is cookie-gated and reads a local filesystem loader, never the Convex query; only consumer projects that `rr add admin` and wire `api.admin.stats` were exposed. admin slice patch bump 0.2.0 → 0.2.1. The two remaining CK-1L deferrals (newsletter per-IP rate-limit table; auth/checkEmail.ts missing `_shared` siblings) need a Convex dev loop to verify and are left for a focused pass.",
    "groups": [
      {
        "heading": "Slices touched",
        "bullets": [
          {
            "text": "admin — stats query now requireAdmin-gated, matching its documented contract (0.2.0 → 0.2.1)",
            "slug": "admin"
          }
        ]
      },
      {
        "heading": "Follow-ups (deferred)",
        "bullets": [
          "newsletter/subscribe per-IP rate-limit still needs a schema table (CK-1L item 1)",
          "auth/checkEmail.ts missing `_shared/clientIp` + `_shared/origin` + `loginCheckIpEvents` schema — restore-or-delete needs Convex verification (CK-1L item 2)"
        ]
      }
    ]
  },
  {
    "id": "CK1M",
    "version": "CK-1M",
    "date": 1779926400000,
    "kind": "improvement",
    "title": "Lane B+C: catalog→install UX + responsive + a11y P0 fixes",
    "body": "Eight P0 findings from the post-Phase-6 UI/UX + user-flow audit, shipped as one site wave (no consumer-slice API change beyond two preview pages). Flow: (1) catalog grid cards now carry a `RecentlyUpdatedBadge` corner overlay so freshness is scannable from /slices without opening each detail page — added a generic `cornerBadge` slot to `CatalogCard` (reusable by templates/layouts/recipes). (2) slice-detail HeroStrip gained a `CopyButton` next to the install command (was a truncated, un-copyable code chip — the page's primary CTA) plus an 'Already installed?' secondary line showing `npx rahman-resources update <slug>` so returning users find the update verb. (3) Branded `not-found.tsx` + `error.tsx` under `app/(docs)/` — typos/deleted-slice links + uncaught route errors now land on on-brand pages with recovery CTAs instead of the raw Next default (covers 60+ routes). Responsive + a11y: (4) slice-detail header strip stacks `flex-col` on mobile (was overflowing the action cluster below the h1 at ≤480px). (5) KIND_CLASS badge colors switched to dual-mode `text-{c}-700 dark:text-{c}-300` (were dark-only 300-level = WCAG contrast fail on light bg). Hard-rule compliance: (6) contact-form-resend preview raw `<input>/<select>/<textarea>` → shadcn `Input`/`Select`/`Textarea`/`Label` (this is the canonical contact slice consumers copy). (7) ai-router preview raw `<textarea>` → shadcn `Textarea`. (8) image-gallery block-renderer raw `<img>` (w/ eslint-disable) → `next/image` (unoptimized, since URLs are consumer-supplied). Deferred to a focused pass: /build mobile collapse (needs ThreeColumn→Tabs refactor + browser verification).",
    "groups": [
      {
        "heading": "Site",
        "bullets": [
          "CatalogCard — new `cornerBadge` slot; /slices grid shows RecentlyUpdatedBadge per card",
          "HeroStrip — CopyButton on install command + 'Already installed?' update-command line",
          "app/(docs)/not-found.tsx + error.tsx — branded 404 + error boundary with recovery CTAs",
          "slice-detail-header — flex-col mobile stack + dual-mode KIND_CLASS badge colors (WCAG)"
        ]
      },
      {
        "heading": "Slices touched",
        "bullets": [
          {
            "text": "contact-form-resend — preview page raw form inputs → shadcn primitives",
            "slug": "resend-newsletter"
          },
          {
            "text": "ai-router — preview page raw textarea → shadcn Textarea",
            "slug": "ai-router"
          }
        ]
      },
      {
        "heading": "Follow-ups (deferred)",
        "bullets": [
          "/build mobile: collapse nested ThreeColumnLayoutAdvanced to Tabs at <md (needs browser verification)",
          "version-pin selector on install command (--ref vX.Y.Z)"
        ]
      }
    ]
  },
  {
    "id": "CK1L",
    "version": "CK-1L",
    "date": 1779926400000,
    "kind": "fix",
    "title": "Lane A: P0 security patch — 7 fixes across 8 backend slices",
    "body": "Cross-slice security batch from the post-Phase-6 audit. Zero P0 surfaced, but seven P1 findings warranted same-day patches before more slices accreted around the same patterns. Per-slice changes: (1) `payment.markPaid` now verifies `order.userId === requireUser(ctx)` so a logged-in user can no longer flip another user's order to paid by guessing the (string) orderId. (2) `payment.get` and `payment.getOrderByOrderId` are now owner-only — anon callers + non-owner authenticated callers get null instead of full order detail (amount, channel, instructions). (3) `comments.listForTarget` flipped from public `query` to `_listForTarget` `internalQuery` with default-deny semantics — consumers MUST wrap with their own target-visibility gate; ships with doc-comment example. (4) `newsletter.broadcastPublic` admin gate is now enforced (`isAdminUser` internalQuery checks `userProfiles.role==='admin'` or `SUPER_ADMIN_EMAIL`) instead of the TODO comment that any-logged-in could bypass. (5) `newsletter.subscribe` validates email shape (`^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$`) + length cap (200 chars) + normalises before insert — partial defense; per-IP rate-limit table deferred to follow-up since it needs schema migration. The canonical `subscribers` slice already has the full hardened pattern (honeypot + windowed rate-limit + unsubscribe token); recommended for production. (6) Unbounded `.collect()` on public/internal queries replaced with explicit caps: `services.listAll` 500, `socials.listAll/listVisible` 200, `testimonials.listAll` 500, `seo.callsInWindow` 1000, `newsletter.activeSubscribers` 10000. Defense-in-depth — these tables would otherwise grow unboundedly on adopted projects with no read-time guard. Eight slice patch bumps: doku-payment 0.1.1, midtrans-payment 0.1.1, resend-newsletter 0.1.1, comments 0.2.1, services 0.1.1, socials 0.1.1, testimonials 0.1.1, seo 0.2.1.",
    "groups": [
      {
        "heading": "Slices touched",
        "bullets": [
          {
            "text": "doku-payment + midtrans-payment — markPaid owner-check + get/getOrderByOrderId owner-only (0.1.0 → 0.1.1)",
            "slug": "doku-payment"
          },
          {
            "text": "resend-newsletter — broadcastPublic admin gate + subscribe email validation (0.1.0 → 0.1.1)",
            "slug": "resend-newsletter"
          },
          {
            "text": "comments — listForTarget flipped to internalQuery default-deny (0.2.0 → 0.2.1)",
            "slug": "comments"
          },
          {
            "text": "services — listAll bounded to 500 (0.1.0 → 0.1.1)",
            "slug": "services"
          },
          {
            "text": "socials — listAll/listVisible bounded to 200 (0.1.0 → 0.1.1)",
            "slug": "socials"
          },
          {
            "text": "testimonials — listAll bounded to 500 (0.1.0 → 0.1.1)",
            "slug": "testimonials"
          },
          {
            "text": "seo — callsInWindow .collect() bounded to 1000 (0.2.0 → 0.2.1)",
            "slug": "seo"
          }
        ]
      },
      {
        "heading": "Follow-ups (deferred)",
        "bullets": [
          "newsletter/subscribe needs a `newsletterSubscribeAttempts` schema table for per-IP rate-limit on par with subscribers/mutation.ts",
          "auth/checkEmail.ts references missing `_shared/clientIp` + `_shared/origin` — restore or delete (file is functional, just unwired)",
          "convex/features/admin/query.ts:stats unauthenticated — gate for production-grade deployments"
        ]
      }
    ]
  }
];
