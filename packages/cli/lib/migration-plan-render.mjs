// migration-plan-render.mjs — artifact renderers for migration steps.
//
// Extracted from migration-plan.mjs. Each function returns a paste-ready
// string the operator can drop into Convex schema files or .env.example.

function camelCase(slug) {
  return String(slug).replace(/-([a-z0-9])/g, (_, c) => c.toUpperCase());
}

export function renderAddTableSnippet(slug, table) {
  const obj = `${camelCase(slug)}Tables`;
  return [
    `// convex/features/${slug}/schema.ts`,
    `// Append the new table to the existing \`${obj}\` export:`,
    `//`,
    `//   export const ${obj} = {`,
    `//     ...existing,`,
    `    ${table}: defineTable({`,
    `      // TODO: declare fields for ${table}`,
    `      createdAt: v.number(),`,
    `    }),`,
    `//   };`,
  ].join("\n");
}

export function renderRenameSchemaSnippet(slug, fromName, toName) {
  const obj = `${camelCase(slug)}Tables`;
  return [
    `// convex/features/${slug}/schema.ts`,
    `// Rename "${fromName}" → "${toName}" inside \`${obj}\`:`,
    `//`,
    `//   export const ${obj} = {`,
    `//     // OLD: ${fromName}: defineTable({...})`,
    `    ${toName}: defineTable({`,
    `      // Carry over the prior shape from ${fromName}.`,
    `    }),`,
    `//   };`,
  ].join("\n");
}

export function renderRenameMigration(slug, fromName, toName) {
  return [
    `// convex/migrations/rename-${fromName}-to-${toName}.ts`,
    `// One-shot data copy — Convex has no in-place table rename.`,
    ``,
    `import { internalMutation } from "../_generated/server";`,
    ``,
    `export default internalMutation({`,
    `  args: {},`,
    `  handler: async (ctx) => {`,
    `    // 1. Copy every row from the old table into the new one.`,
    `    const rows = await ctx.db.query("${fromName}").collect();`,
    `    for (const row of rows) {`,
    `      const { _id, _creationTime, ...rest } = row;`,
    `      await ctx.db.insert("${toName}", rest);`,
    `    }`,
    `    // 2. Once verified, drop the old table in a follow-up migration.`,
    `    //    (Leaving the drop separate keeps this step reversible.)`,
    `    return { copied: rows.length };`,
    `  },`,
    `});`,
    `// slug: ${slug}`,
  ].join("\n");
}

export function renderDropMigration(slug, table) {
  return [
    `// convex/migrations/drop-${table}.ts`,
    `// IRREVERSIBLE — backup ${table} before running. Slice: ${slug}.`,
    ``,
    `import { internalMutation } from "../_generated/server";`,
    ``,
    `export default internalMutation({`,
    `  args: {},`,
    `  handler: async (ctx) => {`,
    `    const rows = await ctx.db.query("${table}").collect();`,
    `    for (const row of rows) {`,
    `      await ctx.db.delete(row._id);`,
    `    }`,
    `    return { deleted: rows.length };`,
    `  },`,
    `});`,
  ].join("\n");
}

export function renderRbacAddSnippet(perm) {
  return [
    `// convex/workspace/permissions.ts (or project equivalent)`,
    `// Append "${perm}" to the permission catalog + grant to relevant roles:`,
    `//`,
    `//   export const PERMISSIONS = [`,
    `//     ...existing,`,
    `    "${perm}",`,
    `//   ] as const;`,
  ].join("\n");
}

export function renderRbacRemoveSnippet(perm) {
  return [
    `// convex/workspace/permissions.ts (or project equivalent)`,
    `// Remove "${perm}" once no role preset still references it.`,
  ].join("\n");
}

// ─── shared helpers (used by the planner) ──────────────────────────────────

export { camelCase };

export function slugifyForId(s) {
  return String(s).replace(/[^a-zA-Z0-9]+/g, "-").replace(/^-+|-+$/g, "").toLowerCase() || "x";
}
