// migration-plan.mjs — Phase E of the Slice Composition Compiler.
//
// Given two versions of a slice contract (or just one when synthesising a
// fresh migration), produce a structured diff + a concrete migration plan
// with risk + reversibility scoring and pre-rendered artifacts the operator
// can paste into Convex schema files, .env.example, or the project's RBAC
// config.
//
// Public API + types live in migration-plan.d.ts.
//
// Runtime contract:
//   - `diffContracts(from, to)` is pure. No fs, no env. Returns a fresh
//     {@link ContractDiff}.
//   - `planMigration(diff)` is pure. Returns a fresh {@link MigrationPlan}.
//   - The CLI dispatcher (../bin/migrate.mjs) is the only side-effecting
//     consumer — it loads contracts via git + writes files into
//     `convex/migrations/`.

// ---------------------------------------------------------------------------
// Public — diffContracts
// ---------------------------------------------------------------------------

/**
 * Compute the structural diff between two versions of a slice contract.
 *
 * Rename detection runs only when `to.migrationFrom?.[from.version]` is set.
 * When the marker is present the planner tries to pair entries that exist
 * only on one side via a stable index match — same-position entries become
 * a renamed pair, the rest stay as added/removed. This conservative pairing
 * keeps the output deterministic without parsing the marker string itself.
 *
 * @param {import("./contract").SliceContract} from
 * @param {import("./contract").SliceContract} to
 * @returns {import("./migration-plan").ContractDiff}
 */
export function diffContracts(from, to) {
  if (!from || typeof from !== "object") {
    throw new Error("diffContracts: `from` contract is required");
  }
  if (!to || typeof to !== "object") {
    throw new Error("diffContracts: `to` contract is required");
  }
  if (from.id !== to.id) {
    throw new Error(
      `diffContracts: contract ids differ — "${from.id}" vs "${to.id}"`,
    );
  }

  const fromTables = unique(from.provides?.tables ?? []);
  const toTables = unique(to.provides?.tables ?? []);
  const fromRoutes = unique(from.provides?.routes ?? []);
  const toRoutes = unique(to.provides?.routes ?? []);
  const fromEnv = unique(from.requires?.env ?? []);
  const toEnv = unique(to.requires?.env ?? []);
  const fromRbac = unique(from.requires?.rbac ?? []);
  const toRbac = unique(to.requires?.rbac ?? []);

  /** @type {string[]} */
  let addedTables = diffArr(toTables, fromTables);
  /** @type {string[]} */
  let removedTables = diffArr(fromTables, toTables);
  /** @type {{ from: string; to: string }[]} */
  const renamedTables = [];

  // Rename detection — only when migrationFrom[from.version] is set.
  const hasRenameMarker =
    to.migrationFrom &&
    typeof to.migrationFrom === "object" &&
    typeof to.migrationFrom[from.version] === "string";

  if (hasRenameMarker && removedTables.length > 0 && addedTables.length > 0) {
    // Pair by position in the original `provides.tables` arrays — covers the
    // most common case ("rename every table at once") without trying to
    // parse the marker string. Anything unpaired stays in added/removed.
    const removedInOrder = fromTables.filter((t) => removedTables.includes(t));
    const addedInOrder = toTables.filter((t) => addedTables.includes(t));
    const pairs = Math.min(removedInOrder.length, addedInOrder.length);
    for (let i = 0; i < pairs; i++) {
      renamedTables.push({ from: removedInOrder[i], to: addedInOrder[i] });
    }
    const pairedFrom = new Set(renamedTables.map((r) => r.from));
    const pairedTo = new Set(renamedTables.map((r) => r.to));
    removedTables = removedTables.filter((t) => !pairedFrom.has(t));
    addedTables = addedTables.filter((t) => !pairedTo.has(t));
  }

  /** @type {import("./migration-plan").ContractDiff} */
  const diff = {
    slug: from.id,
    fromVersion: from.version,
    toVersion: to.version,
    added: pruneEmpty({
      tables: addedTables,
      routes: diffArr(toRoutes, fromRoutes),
      env: diffArr(toEnv, fromEnv),
      rbac: diffArr(toRbac, fromRbac),
    }),
    removed: pruneEmpty({
      tables: removedTables,
      routes: diffArr(fromRoutes, toRoutes),
      env: diffArr(fromEnv, toEnv),
      rbac: diffArr(fromRbac, toRbac),
    }),
    renamed: pruneEmpty({
      tables: renamedTables,
    }),
  };

  return diff;
}

// ---------------------------------------------------------------------------
// Public — planMigration
// ---------------------------------------------------------------------------

/**
 * Turn a {@link ContractDiff} into a concrete, risk-scored migration plan.
 *
 * Step id format: `M{NNN}-{kind-suffix}-{name}` — stable + sortable so the
 * CLI can write files in execution order. NNN is zero-padded to 3 digits.
 *
 * @param {import("./migration-plan").ContractDiff} diff
 * @returns {import("./migration-plan").MigrationPlan}
 */
export function planMigration(diff) {
  if (!diff || typeof diff !== "object" || !diff.slug) {
    throw new Error("planMigration: diff with slug is required");
  }

  /** @type {import("./migration-plan").MigrationStep[]} */
  const steps = [];
  /** @type {string[]} */
  const warnings = [];
  let counter = 1;

  const nextId = (suffix) => {
    const id = `M${String(counter).padStart(3, "0")}-${suffix}`;
    counter += 1;
    return id;
  };

  // 1) Renames first (they precede plain adds, since rename is "move data")
  for (const pair of diff.renamed.tables ?? []) {
    steps.push({
      id: nextId(`rename-table-${pair.from}-to-${pair.to}`),
      kind: "convex-schema-rename-table",
      description: `Rename Convex table "${pair.from}" → "${pair.to}". Convex has no in-place rename — data must be copied via a migration mutation.`,
      reversible: true,
      risk: "medium",
      artifacts: {
        convexSchema: renderRenameSchemaSnippet(diff.slug, pair.from, pair.to),
        convexMigration: renderRenameMigration(diff.slug, pair.from, pair.to),
        note:
          'Convex does not support table rename in-place; data copy required. Run the migration as a one-shot mutation, then drop the old table once verified.',
      },
    });
  }

  // 2) Adds — tables, env, rbac, routes (info-only).
  for (const name of diff.added.tables ?? []) {
    steps.push({
      id: nextId(`add-table-${name}`),
      kind: "convex-schema-add-table",
      description: `Add new Convex table "${name}" to convex/features/${diff.slug}/schema.ts.`,
      reversible: true,
      risk: "low",
      artifacts: {
        convexSchema: renderAddTableSnippet(diff.slug, name),
        note: `Spread \`${camelCase(diff.slug)}Tables\` into convex/schema.ts so the new table is registered with the deployment.`,
      },
    });
  }
  for (const name of diff.added.env ?? []) {
    steps.push({
      id: nextId(`env-add-${name}`),
      kind: "env-add",
      description: `Declare required env var "${name}".`,
      reversible: true,
      risk: "low",
      artifacts: {
        envExample: `${name}=  # set in .env.local before deploy`,
        note: `Append to .env.example so consumers see the requirement. Set the real value in .env.local.`,
      },
    });
  }
  for (const perm of diff.added.rbac ?? []) {
    steps.push({
      id: nextId(`rbac-add-${perm}`),
      kind: "rbac-add-permission",
      description: `Add RBAC permission "${perm}" to the project's permissions config.`,
      reversible: true,
      risk: "low",
      artifacts: {
        rbacPatch: renderRbacAddSnippet(perm),
        note: `Add the permission to convex/workspace/permissions.ts (or the project equivalent), then grant it to the relevant role presets.`,
      },
    });
  }
  for (const route of diff.added.routes ?? []) {
    steps.push({
      id: nextId(`route-add-${slugifyForId(route)}`),
      kind: "route-add",
      description: `Slice mounts new route "${route}" — wire it up in the consumer's app router.`,
      reversible: true,
      risk: "low",
      artifacts: {
        note: `Route is provided by the slice; this step is informational. Verify no consumer-side route already collides.`,
      },
    });
  }

  // 3) Removes — tables (high risk), env / rbac / routes (low-medium).
  for (const name of diff.removed.tables ?? []) {
    steps.push({
      id: nextId(`drop-table-${name}`),
      kind: "convex-schema-drop-table",
      description: `Drop Convex table "${name}". DATA LOSS — back up before running.`,
      reversible: false,
      risk: "high",
      artifacts: {
        convexMigration: renderDropMigration(diff.slug, name),
        note:
          'Backup data before drop. Consider rename-then-deprecate instead of a hard drop — that path is reversible.',
      },
    });
    warnings.push(
      `Drop of "${name}" is irreversible. Backup data before drop. Consider rename-then-deprecate.`,
    );
  }
  for (const name of diff.removed.env ?? []) {
    steps.push({
      id: nextId(`env-remove-${name}`),
      kind: "env-remove",
      description: `Env var "${name}" is no longer required by the slice — remove from .env.example.`,
      reversible: true,
      risk: "low",
      artifacts: {
        note: `Removing an env declaration is safe; the runtime simply ignores it. Drop the line from .env.example.`,
      },
    });
  }
  for (const perm of diff.removed.rbac ?? []) {
    steps.push({
      id: nextId(`rbac-remove-${perm}`),
      kind: "rbac-remove-permission",
      description: `RBAC permission "${perm}" is no longer required — consider deprecating in the project's permissions config.`,
      reversible: true,
      risk: "medium",
      artifacts: {
        rbacPatch: renderRbacRemoveSnippet(perm),
        note: `Removing a permission may strand roles that still reference it. Audit role presets before deleting.`,
      },
    });
  }
  for (const route of diff.removed.routes ?? []) {
    steps.push({
      id: nextId(`route-remove-${slugifyForId(route)}`),
      kind: "route-remove",
      description: `Slice no longer provides route "${route}" — remove dangling links in the consumer.`,
      reversible: true,
      risk: "low",
      artifacts: {
        note: `Route is no longer mounted by the slice; this step is informational. Audit navigation + sitemap entries.`,
      },
    });
  }

  const highRisk = steps.filter((s) => s.risk === "high").length;
  const irreversible = steps.filter((s) => !s.reversible).length;

  return {
    slug: diff.slug,
    fromVersion: diff.fromVersion,
    toVersion: diff.toVersion,
    steps,
    summary: {
      totalSteps: steps.length,
      highRisk,
      irreversible,
    },
    warnings,
  };
}

// ---------------------------------------------------------------------------
// Internal — artifact renderers
// ---------------------------------------------------------------------------

function renderAddTableSnippet(slug, table) {
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

function renderRenameSchemaSnippet(slug, fromName, toName) {
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

function renderRenameMigration(slug, fromName, toName) {
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

function renderDropMigration(slug, table) {
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

function renderRbacAddSnippet(perm) {
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

function renderRbacRemoveSnippet(perm) {
  return [
    `// convex/workspace/permissions.ts (or project equivalent)`,
    `// Remove "${perm}" once no role preset still references it.`,
  ].join("\n");
}

// ---------------------------------------------------------------------------
// Internal — helpers
// ---------------------------------------------------------------------------

function diffArr(a, b) {
  const setB = new Set(b);
  return a.filter((x) => !setB.has(x));
}

function unique(a) {
  return Array.from(new Set(a));
}

function pruneEmpty(obj) {
  /** @type {Record<string, unknown>} */
  const out = {};
  for (const [k, v] of Object.entries(obj)) {
    if (Array.isArray(v) && v.length === 0) continue;
    if (v == null) continue;
    out[k] = v;
  }
  return out;
}

function camelCase(slug) {
  return String(slug).replace(/-([a-z0-9])/g, (_, c) => c.toUpperCase());
}

function slugifyForId(s) {
  return String(s).replace(/[^a-zA-Z0-9]+/g, "-").replace(/^-+|-+$/g, "").toLowerCase() || "x";
}
