# Shared Foundation

Common substrate. Built once before R1 (T4). Every template extends.

## Module list

| ID | Lives in | Purpose | Used by |
|---|---|---|---|
| `auth` | `convex/auth.ts` + `frontend/shared/auth/` | `@convex-dev/auth` email magic-link | All |
| `ai-router` | `convex/shared/ai/router.ts` | OpenRouter wrapper, model tiers, retry, cost log | All |
| `convex-base` | `convex/schema.ts` (base) | `users`, `workspaces`, `memberships`, `audit_log` | All |
| `design-system` | `frontend/shared/ui/` | shadcn primitives + theme presets + motion | All |
| `i18n` | `frontend/shared/i18n/` | `next-intl`, `id` default, `en` toggle | All |
| `shell` | `frontend/shared/ui/layout/dashboard/` | ResponsiveDashboardShell (desktop sidebar / mobile dock) | T2, T3, T4, T5 admin |
| `three-column` | `frontend/shared/ui/layout/container/three-column/` | Resizable left/main/right | T2, T4, T5 admin |
| `billing-id` | `convex/shared/billing/midtrans.ts` | Midtrans payment-link, webhook | T4, T5 |
| `resend` | `convex/shared/email/resend.ts` | Transactional + newsletter | T1, T3, T4 |
| `pdf-extract` | `convex/shared/pdf/` | PDF text extraction + OCR fallback | T2, T5 |
| `vector-search` | `convex/shared/vector/` | Convex vector index util | T1, T2, T3, T5 |
| `whatsapp-bot` | `convex/shared/whatsapp/` | WA Business API send + webhook | T4 |

## Source map (where to copy from)

Per `CLAUDE.md` Source Map. Aggregated here for quick reference:

| Foundation module | Source |
|---|---|
| Vertical slice arch | `superspace/frontend/slices/_templates/` |
| Feature registry | `superspace/frontend/shared/lib/features/` |
| Three-column layout | `superspace/frontend/shared/ui/layout/container/three-column/` |
| ResponsiveDashboardShell | `superspace/frontend/shared/ui/layout/dashboard/` |
| AppSidebar | `superspace/frontend/shared/ui/layout/sidebar/primary/AppSidebar.tsx` |
| Slice CLI | `superspace/scripts/features/` |
| Validators | `superspace/scripts/validation/` |
| Motion primitives | `rahmanef.com/frontend/shared/ui/` (marquee, kinetic-heading, magnetic, cursor-spotlight, stat-counter, reading-progress, grain, lightbox) |
| OKLch theme presets | `rahmanef.com/frontend/shared/lib/{theme-presets,preset-fonts,preset-groups}.ts` + `app/globals.css` |
| Asymmetric masonry | `rahmanef.com/frontend/slices/portfolio/components/PortfolioGrid.tsx` |
| Hero carousel | `cescadesigns/components/cummon/hero-section.tsx` |
| ContactForm + Resend | `cescadesigns/app/contact/` |
| Block editor + slash menu | `notion-page-clone/src/slices/editor/` |
| Page tree dnd sidebar | `notion-page-clone/src/slices/workspace-sidebar/` |
| Multi-block selection | `notion-page-clone/src/slices/block-selection/` |
| Database views (11) | `notion-page-clone/src/slices/databases/` |
| Command palette | `notion-page-clone/src/slices/command-palette/` |
| Comments threaded | `notion-page-clone/src/slices/comments/` |

## Convex base schema

```ts
// convex/schema.ts (base — every template extends)
defineSchema({
  users: defineTable({
    email: v.string(),
    name: v.string(),
    avatar: v.optional(v.string()),
    locale: v.union(v.literal("id"), v.literal("en")),
    createdAt: v.number(),
  }).index("by_email", ["email"]),

  workspaces: defineTable({
    slug: v.string(),
    name: v.string(),
    ownerId: v.id("users"),
    plan: v.union(v.literal("free"), v.literal("pro"), v.literal("hosted")),
    createdAt: v.number(),
  }).index("by_slug", ["slug"]).index("by_owner", ["ownerId"]),

  memberships: defineTable({
    userId: v.id("users"),
    workspaceId: v.id("workspaces"),
    role: v.union(v.literal("owner"), v.literal("admin"), v.literal("member"), v.literal("viewer")),
    createdAt: v.number(),
  }).index("by_user_workspace", ["userId", "workspaceId"])
    .index("by_workspace", ["workspaceId"]),

  audit_log: defineTable({
    workspaceId: v.id("workspaces"),
    actorId: v.id("users"),
    action: v.string(),       // e.g. "booking.create"
    entity: v.string(),       // e.g. "bookings:abc123"
    diff: v.optional(v.any()),
    createdAt: v.number(),
  }).index("by_workspace_time", ["workspaceId", "createdAt"]),
});
```

Per-template tables defined in `convex/features/<slug>/schema.ts` and merged via composition.

## AI router contract

```ts
// convex/shared/ai/router.ts
export const callModel = action({
  args: {
    workspaceId: v.id("workspaces"),
    feature: v.string(),                // "sop-search" | "report-narration" | ...
    prompt: v.string(),
    tier: v.union(v.literal("nano"), v.literal("mid"), v.literal("flagship")),
    schema: v.optional(v.any()),        // for structured output
  },
  handler: async (ctx, args) => {
    // 1. Resolve model from tier (configurable per workspace via admin panel)
    // 2. Call OpenRouter
    // 3. Log cost to audit_log + ai_usage table
    // 4. Return text or structured object
  },
});
```

Tiers (default mapping; override per workspace):

- `nano` → `claude-haiku-4-5` / `gpt-4o-mini` (fast classification, autocomplete)
- `mid` → `claude-sonnet-4-6` / `gpt-4o` (drafting, summaries)
- `flagship` → `claude-opus-4-7` (deep reasoning, methodology check)

## Hard rules (carried from CLAUDE.md)

- No Clerk
- shadcn-only UI
- copy-first, never greenfield
- `next/link` + `next/image`
- no bare `.collect()` on Convex queries
- public Convex fn must have `args:` validator
- no `NEXT_PUBLIC_*` for sensitive
- Next 16 → `proxy.ts`, not `middleware.ts`

## Open knobs

- Vector embedding provider: OpenAI text-embedding-3-small vs Voyage vs local? (cost vs quality)
- File storage: Convex storage (limit) vs R2 (more setup, cheaper at scale)?
- Multi-tenancy isolation: per-workspace Convex deployment vs shared with row-level filter? (start shared, audit later)
