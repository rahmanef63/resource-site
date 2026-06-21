// validate-contract-shape.mjs — shape checks for a folded slice contract.
//
// Replicates the runtime invariants of `defineSliceContract()` so the CI gate
// flags a malformed contract block in slice.json. Kept regex-in-sync with
// packages/cli/lib/contract-validate.ts. (The contract reader itself is the
// shared adapter packages/cli/lib/load-contract.mjs since the Phase-2 fold.)

// ---------------------------------------------------------------------------
// Regex set — kept in sync with packages/cli/lib/contract-validate.ts.
// ---------------------------------------------------------------------------
const KEBAB_CASE = /^[a-z][a-z0-9]*(?:-[a-z0-9]+)*$/;
const SEMVER =
  /^\d+\.\d+\.\d+(?:-[0-9A-Za-z-]+(?:\.[0-9A-Za-z-]+)*)?(?:\+[0-9A-Za-z-]+(?:\.[0-9A-Za-z-]+)*)?$/;
const PREFIX = /^[a-z][a-z0-9_]*_$/;
// Aligned to contract-validate.ts L21 — includes `tools` + dotted value paths.
const CONFLICT_RE =
  /^[a-z][a-z0-9-]*:(routes|hooks|tables|events|components|tools)\.[A-Za-z0-9_\-\/.]+$/;
const PERMISSION = /^[^.]+\.[^.]+$/;

/**
 * Replicates defineSliceContract's runtime invariants for the validator.
 * Returns array of human-readable error strings (empty on success).
 */
export function shapeCheck(c) {
  const errs = [];
  if (!c || typeof c !== "object") {
    errs.push("contract is not an object");
    return errs;
  }
  if (typeof c.id !== "string" || !KEBAB_CASE.test(c.id)) {
    errs.push(`id "${String(c.id)}" must be kebab-case`);
  }
  if (typeof c.version !== "string" || !SEMVER.test(c.version)) {
    errs.push(`version "${String(c.version)}" is not semver`);
  }
  const requires = c.requires || {};
  const provides = c.provides || {};

  if (Array.isArray(requires.rbac)) {
    for (const p of requires.rbac) {
      if (typeof p !== "string" || !PERMISSION.test(p)) {
        errs.push(`rbac entry "${String(p)}" must be "<domain>.<action>"`);
      }
    }
  }

  const cx = requires.convex;
  if (cx) {
    if (typeof cx.prefix !== "string" || !PREFIX.test(cx.prefix)) {
      errs.push(`convex.prefix "${String(cx.prefix)}" must match /^[a-z][a-z0-9_]*_$/`);
    } else {
      if (!Array.isArray(cx.tables)) {
        errs.push("convex.tables must be an array");
      } else {
        for (const t of cx.tables) {
          if (typeof t !== "string" || !t.startsWith(cx.prefix)) {
            errs.push(`convex.tables entry "${String(t)}" must start with prefix "${cx.prefix}"`);
          }
        }
      }
      if (Array.isArray(provides.tables)) {
        for (const t of provides.tables) {
          if (typeof t !== "string" || !t.startsWith(cx.prefix)) {
            errs.push(
              `provides.tables entry "${String(t)}" must start with prefix "${cx.prefix}"`,
            );
          }
        }
      }
    }
  }

  if (c.conflicts) {
    if (!Array.isArray(c.conflicts)) {
      errs.push("conflicts must be an array");
    } else {
      for (const cf of c.conflicts) {
        if (typeof cf !== "string" || !CONFLICT_RE.test(cf)) {
          errs.push(
            `conflicts entry "${String(cf)}" must match "<slug>:<routes|hooks|tables|events|components|tools>.<value>"`,
          );
        }
      }
    }
  }

  return errs;
}
