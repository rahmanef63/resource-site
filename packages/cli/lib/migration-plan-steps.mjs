// migration-plan-steps.mjs — step generators per diff bucket.
//
// Extracted from migration-plan.mjs. Each function appends to the steps
// array passed in. Keeps the planner glue ≤200 LOC.

import {
  renderAddTableSnippet,
  renderRenameSchemaSnippet,
  renderRenameMigration,
  renderDropMigration,
  renderRbacAddSnippet,
  renderRbacRemoveSnippet,
  camelCase,
  slugifyForId,
} from "./migration-plan-render.mjs";

export function addRenameSteps(steps, diff, nextId) {
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
}

export function addAddSteps(steps, diff, nextId) {
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
}

export function addRemoveSteps(steps, warnings, diff, nextId) {
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
}
