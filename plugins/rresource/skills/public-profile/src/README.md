# public-profile

SSR `/[slug]` public page w/ OG meta. Read-only Convex query (no auth).

## Install
1. Copy `app/[slug]/` to consumer's `app/`.
2. Copy `convex/profile.ts` + add schema fragment.
3. Copy `components/PublicProfileView.tsx`.

## Slug uniqueness
Enforce in your editor mutation via `.withIndex("by_slug", q => q.eq("slug", slug)).unique()` check before insert.
