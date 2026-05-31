# seo (convex feature)

AI-assisted SEO metadata generation. An action calls the model to draft
title/description/keywords; calls are rate-limited per window and logged.

**Tables:** `seoGeneratorCalls`
**Functions:** `query.ts`, `mutation.ts`, `action.ts` · field validators in
`_fields.ts`, helpers in `_seo-helpers.ts`, prompt in `_seo-prompt.ts`, types in
`_seo-types.ts`

Schema composes into the root via `seoTables` in `_schema.ts`.
Part of Rahman Resources.
