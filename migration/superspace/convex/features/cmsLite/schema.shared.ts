import { v } from "convex/values";

// Shared field validators for cms_lite feature tables
export const userFields = {
  // Allow legacy users without a Clerk ID; link/populate later as needed.
  clerkId: v.optional(v.string()),
  email: v.string(),
  name: v.optional(v.string()),
  // Legacy/alternate user fields sometimes present on user documents
  // (some data used `image` and `isAnonymous` on the users doc). Accept them
  // as optional to allow the existing DB to pass schema validation.
  bio: v.optional(v.string()),
  image: v.optional(v.string()),
  isAnonymous: v.optional(v.boolean()),
  avatarUrl: v.optional(v.string()),
  // Treat status as optional for legacy documents. Application logic
  // should treat missing status appropriately (e.g. assume "active").
  status: v.optional(
    v.union(v.literal("active"), v.literal("inactive"), v.literal("blocked")),
  ),
  metadata: v.optional(v.record(v.string(), v.any())),
};

// Provide a default export for environments that prefer default imports
// and to ensure the file is always treated as a module.
export default userFields;
