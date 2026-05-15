# Comments Slug Split — Decision Proposal

> Drafted 2026-05-15 (Wave N+3.4) after rahmanef.comments adoption agent surfaced
> an architectural mismatch between kitab `comments@0.2.0` (auth-renderless,
> polymorphic-target) and rahmanef.com's local comments product (anonymous-public,
> 5-level threaded, votes, IP bans, honeypot/dwell/stoplist/homoglyph spam,
> moderation queue, MCP tools, Next API routes).
>
> **Status**: open — operator pick required.
> **Authors**: claude-code (proposal), rahman (decision).

## Context

Two consumer products share the slug `comments` but want very different surfaces:

| Capability | kitab `comments@0.2.0` | rahmanef.com (`comments`) | notion-page-clone (`comments`) |
|---|---|---|---|
| Auth | required (convex-auth) | anonymous-public | required (convex-auth) |
| Threading | flat (1 level) | 5-level nested | flat |
| Voting | — | up/down per comment | — |
| Spam protection | `forbiddenWords` only | honeypot + dwell-time + stoplist + homoglyph + IP bans | — |
| Moderation queue | — | admin queue + status workflow | — |
| Target shape | polymorphic `TargetRef` | enum `targetType` + entity slug | flat `pageId` + `blockId` |
| Hook style | props-driven adapter | direct Convex import | refactored to props-driven (post N+3.4) |
| MCP tools | — | yes | — |
| Next API routes | — | yes | — |

The notion product cleanly adopted v0.2.0 by isolating Convex wiring under
`adapters/nosion.*` (commit `d9413e4`). The rahmanef product cannot — it's a
fundamentally different surface that would require either a destructive prod
schema migration + feature regression OR a consumer-side adapter so heavy it
defeats the point of adopting the kitab slice.

Hence: rahmanef agent flipped its `.kitab.json` to `frozen · needs-adapter`
with a 7-blocker manifest (commit `430c35b`). This is honest divergence
flagged for kitab-side resolution.

## Options

### Option A — Super-contract `comments@0.3.x`

Absorb threading + voting + spam + moderation into the kitab slice. All capabilities
gated behind feature flags so notion (which doesn't want them) opts out via config.

**Surface estimate** (additions to current v0.2.0):

```ts
defineSliceContract({
  id: "comments",
  version: "0.3.0",
  requires: { /* unchanged */ },
  provides: {
    tables: ["comment_threads", "comment_votes", "comment_bans"],
    hooks: ["useComments", "useCommentVotes", "useCommentModeration"],
    components: ["CommentsThread", "CommentsAnchor", "ModerationQueue", "VoteBar"],
  },
  bidir: {
    syncPolicy: "manual",
    generalization: {
      level: "needs-adapter",
      forbiddenTerms: ["pageId", "blockId", "targetType"],
      requiredProps: [
        "target", "bindings", "forbiddenWords", "pathMap",
        "spamPolicy",        // honeypot/dwell/stoplist/homoglyph config
        "moderationAdapter", // queue + status workflow wiring
        "anonymousAuth",     // null = require auth, fn = anon-resolver
      ],
    },
  },
});
```

**Pros**
- Single slug, single contract — easier mental model
- rahmanef can adopt without fork
- Future consumers get the union of capabilities

**Cons**
- Big surface — 9 requiredProps, 3 tables, 4 components
- Notion adoption diff goes from 0 (post-N+3.4) → flag-config to opt out features
- Spam heuristics tightly coupled to anonymous-auth assumption — leaky if mixed with auth

### Option B — Carve `public-comments` as separate slug

Keep `comments@0.2.0` lean (auth + polymorphic). Add new kitab slug
`public-comments` (or `community-comments`) covering anonymous-public surfaces.

**New slug surface**:

```ts
defineSliceContract({
  id: "public-comments",
  version: "0.1.0",
  requires: {
    auth: "anonymous",  // sentinel, no convex-auth dep
    rbac: ["public-comment.create", "public-comment.read", "public-comment.moderate"],
    convex: { prefix: "pcomment_", tables: ["pcomment_threads", "pcomment_votes", "pcomment_bans"] },
    deps: ["audit-log"], // moderation actions logged
  },
  provides: {
    tables: ["pcomment_threads", "pcomment_votes", "pcomment_bans"],
    hooks: ["usePublicComments", "useCommentVotes", "useModerationQueue"],
    components: ["PublicCommentsThread", "ModerationQueue", "VoteBar"],
  },
  bidir: {
    syncPolicy: "manual",
    generalization: {
      level: "needs-adapter",
      requiredProps: [
        "target", "bindings", "forbiddenWords", "pathMap",
        "spamPolicy", "moderationAdapter",
      ],
    },
  },
});
```

rahmanef.com `/rr-send public-comments` → kitab accepts as `public-comments@0.1.0`.

**Pros**
- Each slug stays small + sharp
- Notion never sees moderation/voting code
- Anonymous-auth assumption stays scoped
- rahmanef divergence resolves cleanly via separate slug

**Cons**
- Two slugs to maintain forever
- Some surface duplication (target/bindings/forbiddenWords/pathMap repeated)
- Future consumers must pick — confusion possible

### Option C — Hybrid (super-contract + sub-modules)

Keep `comments@0.2.0` as core. Ship optional submodules `comments/voting`,
`comments/moderation`, `comments/anonymous` that consumers compose.

**Pros**
- Modular, no forced surface
- Notion uses core only

**Cons**
- Slice-of-slices = increased complexity in CLI + scanner + manifest
- BSDL `bidir` block doesn't currently model submodules — schema work needed first

## Recommendation

**Option B — `public-comments` carve**, for these reasons:

1. **Concrete data point**: rahmanef product fits the carved slug exactly. notion product fits current `comments@0.2.0` exactly. Neither needs to adopt the other's surface.
2. **Forbidden-terms scanner stays useful**: each slug has narrower `forbiddenTerms` lists. A super-contract's broad `forbiddenTerms` would over-match.
3. **Spam policy + auth coupling**: anonymous-auth is load-bearing for spam heuristics — bundling under `auth: "anonymous"` sentinel keeps the invariant explicit.
4. **Smaller blast radius**: rahmanef can move from `frozen` to `in-sync · portable` against a fresh slug without rewriting Convex schema. notion stays unaffected.
5. **Future surface** (e.g. CareerPack interview-comments, content blog-comments) will pick whichever slug matches their auth model. Two-option clarity > one-option-plus-9-flags ambiguity.

## Action items if Option B is picked

| # | Action | Owner | Effort |
|---:|---|---|---|
| 1 | Scaffold `frontend/slices/public-comments/` (contract + slice.json + README) | kitab maintainer | 30 min |
| 2 | Land `convex/features/public-comments/{schema,mutations,queries}.ts` based on rahmanef shape | kitab maintainer + rahmanef agent (`/rr-send public-comments`) | 60-90 min |
| 3 | Add `.kitab/lineage/public-comments.dna.json` | kitab maintainer | 5 min |
| 4 | Register in `lib/content/slices.ts` + regen manifests | kitab maintainer | 5 min |
| 5 | rahmanef retag `frontend/slices/comments/.kitab.json` → `kitabSlug: "public-comments"` | rahmanef agent | 10 min |
| 6 | rahmanef refactor blockers per public-comments adapter shape | rahmanef agent | 60-120 min |
| 7 | Update `docs/contract-negotiations-2026-05-15.md` §1 — append slug-split addendum | kitab maintainer | 10 min |
| 8 | Update `docs/kitabsync-aggregate.md` cross-consumer matrix to add `public-comments` row | kitab maintainer | 10 min |

## Action items if Option A is picked

| # | Action | Owner | Effort |
|---:|---|---|---|
| 1 | Bump `comments@0.3.0` contract — 9 requiredProps + 3 tables + 4 components | kitab maintainer | 60 min |
| 2 | Land Convex schema additions: `comment_votes`, `comment_bans` | kitab maintainer | 30 min |
| 3 | Migration script `comments-v0.2.0-to-v0.3.0-spam-mod.ts` (no-op for adopters who don't enable flags) | kitab maintainer | 30 min |
| 4 | notion config update — explicit `spamPolicy: null, moderationAdapter: null, anonymousAuth: null` | notion agent | 15 min |
| 5 | rahmanef refactor against full v0.3.0 surface | rahmanef agent | 90-120 min |
| 6 | Update `docs/contract-negotiations-2026-05-15.md` §1 — append v0.3.0 surface | kitab maintainer | 10 min |

## Action items if Option C is picked

Defer — requires BSDL submodule schema work first. Re-propose after BSDL v2.

## See also

- `frontend/slices/comments/slice.contract.ts` — current v0.2.0 contract
- `docs/contract-negotiations-2026-05-15.md` §1 — original polymorphic-target decision
- `/home/rahman/projects/rahmanef.com/frontend/slices/comments/.kitab.json` — divergence manifest with 7 blockers (commit `430c35b`)
- `/home/rahman/projects/notion-page-clone/frontend/slices/comments/` — clean v0.2.0 adoption (commit `d9413e4`)
