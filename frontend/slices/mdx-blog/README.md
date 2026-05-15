# `mdx-blog` slice

File-based MDX content collection. No Convex. Wire `next.config.mjs` with `withMDX(...)` + `pageExtensions: ['ts','tsx','mdx']`. Posts live at `${contentDir}/*.mdx` (default `content/blog`). Configure via `defineMdxBlog({ basePath, contentDir, labels, nav })` from `./config`.

v0.2.0 — portable factory. 4 optional props (all defaulted): `basePath`, `contentDir`, `labels.list`, `nav.{group,order}`. Per `docs/contract-negotiations-2026-05-15.md` §2 — MDX-only; non-MDX consumers must pick a different slug.
