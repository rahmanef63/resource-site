// Vendored in plugins/rresource. Self-contained — no cross-slice imports.
// Default state = localStorage. Optional Convex schema + fns under ./convex/.

import { v } from "convex/values";
import { mutation } from "./_generated/server";

// Idempotent per-user starter data. Call after signUp.
//
// Schema additions are domain-specific; example shows a "checklist" seed.

export const seedForCurrentUser = mutation({
  args: {},
  handler: async (ctx) => {
    const id = await ctx.auth.getUserIdentity();
    if (!id) throw new Error("Tidak terautentikasi");
    const u = await ctx.db.query("users")
      .withIndex("by_token", (q) => q.eq("tokenIdentifier", id.tokenIdentifier)).unique();
    if (!u) throw new Error("User tidak ditemukan");

    // example check — bail if seeded
    const existing = await ctx.db.query("checklists")
      .withIndex("by_user", (q) => q.eq("userId", u._id)).first();
    if (existing) return { seeded: false };

    await ctx.db.insert("checklists", {
      userId: u._id,
      title: "Selamat datang",
      items: [{ label: "Lengkapi profil", done: false }],
      createdAt: Date.now(),
    });
    return { seeded: true };
  },
});
