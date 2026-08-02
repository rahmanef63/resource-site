// library slice — schema extension.
//
// Spread `libraryTables` into the consumer's root Convex schema:
//
//   import { libraryTables } from "../features/library/_schema";
//   export default defineSchema({
//     ...libraryTables,
//     // ...your other tables
//   });
//
// Library = grab-bag resource hub: prompts, images, videos, links,
// files, code snippets. Each item is ONE `kind` — the per-kind payload
// fields live as optionals on the same row so the admin form + public
// render switch on `kind` without joins. Attribution-first: every item
// carries optional source/license/tools so re-shares stay correct.
//
// SEO override fields are reused from the `seo` peer slice
// (`convex/features/seo/fields.ts`) so the surface matches blog /
// projects / portfolio rows and the consumer's metadata composer just
// works.

import { defineTable } from "convex/server";
import { v } from "convex/values";
import { seoFieldsShape, seoPatchShape } from "../seo/_fields";

export const kindUnion = v.union(
  v.literal("prompt"),
  v.literal("image"),
  v.literal("video"),
  v.literal("link"),
  v.literal("download"),
  v.literal("snippet"),
);

// Editable item fields — shared by the table def + create mutation args.
export const itemContentShape = {
  slug: v.string(),
  title: v.string(),
  excerpt: v.string(),
  description: v.optional(v.string()),
  kind: kindUnion,
  collectionId: v.optional(v.id("libraryCollections")),
  // payload (only the set matching `kind` is meaningful — validated in mutation)
  promptText: v.optional(v.string()),
  promptModel: v.optional(v.string()),
  imageUrl: v.optional(v.string()),
  imageAlt: v.optional(v.string()),
  videoUrl: v.optional(v.string()),
  videoProvider: v.optional(v.string()),
  linkUrl: v.optional(v.string()),
  fileStorageId: v.optional(v.string()),
  fileName: v.optional(v.string()),
  fileSize: v.optional(v.number()),
  snippetCode: v.optional(v.string()),
  snippetLang: v.optional(v.string()),
  // attribution
  sourceName: v.optional(v.string()),
  sourceUrl: v.optional(v.string()),
  license: v.optional(v.string()),
  tools: v.optional(v.array(v.string())),
  tags: v.optional(v.array(v.string())),
  // surface
  cover: v.optional(v.string()),
  order: v.number(),
  published: v.boolean(),
  featured: v.optional(v.boolean()),
  ...seoFieldsShape,
};

// All-optional mirror for the update patch.
export const itemPatchShape = {
  slug: v.optional(v.string()),
  title: v.optional(v.string()),
  excerpt: v.optional(v.string()),
  description: v.optional(v.string()),
  kind: v.optional(kindUnion),
  collectionId: v.optional(v.id("libraryCollections")),
  promptText: v.optional(v.string()),
  promptModel: v.optional(v.string()),
  imageUrl: v.optional(v.string()),
  imageAlt: v.optional(v.string()),
  videoUrl: v.optional(v.string()),
  videoProvider: v.optional(v.string()),
  linkUrl: v.optional(v.string()),
  fileStorageId: v.optional(v.string()),
  fileName: v.optional(v.string()),
  fileSize: v.optional(v.number()),
  snippetCode: v.optional(v.string()),
  snippetLang: v.optional(v.string()),
  sourceName: v.optional(v.string()),
  sourceUrl: v.optional(v.string()),
  license: v.optional(v.string()),
  tools: v.optional(v.array(v.string())),
  tags: v.optional(v.array(v.string())),
  cover: v.optional(v.string()),
  order: v.optional(v.number()),
  published: v.optional(v.boolean()),
  featured: v.optional(v.boolean()),
  ...seoPatchShape,
};

export const collectionContentShape = {
  slug: v.string(),
  title: v.string(),
  description: v.optional(v.string()),
  cover: v.optional(v.string()),
  order: v.number(),
  published: v.boolean(),
};

export const collectionPatchShape = {
  slug: v.optional(v.string()),
  title: v.optional(v.string()),
  description: v.optional(v.string()),
  cover: v.optional(v.string()),
  order: v.optional(v.number()),
  published: v.optional(v.boolean()),
};

export const libraryTables = {
  libraryItems: defineTable({
    ...itemContentShape,
    views: v.optional(v.number()),
    upvotes: v.optional(v.number()),
    deletedAt: v.optional(v.number()),
    createdAt: v.number(),
  })
    .index("by_order", ["order"])
    .index("by_published", ["published"])
    .index("by_slug", ["slug"])
    .index("by_collection", ["collectionId"])
    .index("by_kind", ["kind"])
    .index("by_featured", ["featured"]),

  libraryCollections: defineTable({
    ...collectionContentShape,
    deletedAt: v.optional(v.number()),
    createdAt: v.number(),
  })
    .index("by_order", ["order"])
    .index("by_slug", ["slug"])
    .index("by_published", ["published"]),
};
