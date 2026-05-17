// merge3-diff.mjs — per-element 3-way diff functions.
//
// Extracted from merge3.mjs. Each function classifies one slice element
// (file or contract set member) into one of: identical, auto-merged,
// kitab-wins-clean, consumer-wins-clean, conflict.

export function diffFile(pathRel, baseVal, kitabVal, consumerVal) {
  const bExists = baseVal !== undefined;
  const kExists = kitabVal !== undefined;
  const cExists = consumerVal !== undefined;

  // Normalize to null when absent for the report payload, since `undefined`
  // round-trips poorly through JSON.
  const out = {
    element: `files/${pathRel}`,
    kind: "identical",
    baseValue: bExists ? baseVal : null,
    kitabValue: kExists ? kitabVal : null,
    consumerValue: cExists ? consumerVal : null,
  };

  if (!bExists && !kExists && !cExists) {
    out.mergedValue = null;
    return out;
  }

  // Case: only kitab has it → kitab added (consumer never saw it).
  if (!bExists && kExists && !cExists) {
    out.kind = "auto-merged";
    out.mergedValue = kitabVal;
    return out;
  }
  // Case: only consumer has it → consumer added locally.
  if (!bExists && !kExists && cExists) {
    out.kind = "consumer-wins-clean";
    out.mergedValue = consumerVal;
    return out;
  }
  // Case: kitab and consumer both added it (no base). Identical adds → ok,
  // differing adds → conflict.
  if (!bExists && kExists && cExists) {
    if (kitabVal === consumerVal) {
      out.kind = "identical";
      out.mergedValue = kitabVal;
      return out;
    }
    out.kind = "conflict";
    out.conflictHint = `both kitab and consumer added "${pathRel}" with different contents`;
    return out;
  }
  // Case: kitab removed (base had it, kitab doesn't).
  if (bExists && !kExists) {
    if (!cExists) {
      out.kind = "identical";
      out.mergedValue = null;
      return out;
    }
    if (consumerVal === baseVal) {
      out.kind = "auto-merged";
      out.mergedValue = null;
      return out;
    }
    out.kind = "conflict";
    out.conflictHint = `kitab removed "${pathRel}"; consumer modified it — keep or drop?`;
    return out;
  }
  // Case: consumer removed (base had it, kitab still does, consumer dropped).
  if (bExists && kExists && !cExists) {
    if (kitabVal === baseVal) {
      out.kind = "consumer-wins-clean";
      out.mergedValue = null;
      return out;
    }
    out.kind = "conflict";
    out.conflictHint = `consumer removed "${pathRel}"; kitab modified it — re-add or drop?`;
    return out;
  }
  // Case: all three exist. Classic 3-way diff.
  if (baseVal === kitabVal && baseVal === consumerVal) {
    out.kind = "identical";
    out.mergedValue = baseVal;
    return out;
  }
  if (baseVal !== kitabVal && baseVal === consumerVal) {
    out.kind = "auto-merged";
    out.mergedValue = kitabVal;
    return out;
  }
  if (baseVal === kitabVal && baseVal !== consumerVal) {
    out.kind = "consumer-wins-clean";
    out.mergedValue = consumerVal;
    return out;
  }
  // Both differ from base — coincidentally equal? then identical-merge.
  if (kitabVal === consumerVal) {
    out.kind = "identical";
    out.mergedValue = kitabVal;
    return out;
  }
  out.kind = "conflict";
  out.conflictHint = `both kitab and consumer modified "${pathRel}"; review needed`;
  return out;
}

export function diffSetMember(elementKey, member, inBase, inKitab, inConsumer) {
  const out = {
    element: elementKey,
    kind: "identical",
    baseValue: inBase ? member : null,
    kitabValue: inKitab ? member : null,
    consumerValue: inConsumer ? member : null,
  };

  if (inBase && inKitab && inConsumer) {
    out.kind = "identical";
    out.mergedValue = member;
    return out;
  }
  if (!inBase && !inKitab && !inConsumer) {
    out.mergedValue = null;
    return out;
  }
  if (!inBase && inKitab && !inConsumer) {
    out.kind = "auto-merged";
    out.mergedValue = member;
    return out;
  }
  if (!inBase && !inKitab && inConsumer) {
    out.kind = "consumer-wins-clean";
    out.mergedValue = member;
    return out;
  }
  if (!inBase && inKitab && inConsumer) {
    out.kind = "identical";
    out.mergedValue = member;
    return out;
  }
  if (inBase && !inKitab && inConsumer) {
    out.kind = "conflict";
    out.conflictHint = `kitab dropped "${member}" (${elementKey.split(":")[0]}); consumer still relies on it`;
    return out;
  }
  if (inBase && inKitab && !inConsumer) {
    out.kind = "consumer-wins-clean";
    out.mergedValue = null;
    return out;
  }
  if (inBase && !inKitab && !inConsumer) {
    out.kind = "identical";
    out.mergedValue = null;
    return out;
  }
  // Fallback (shouldn't reach)
  out.kind = "conflict";
  out.conflictHint = `unexpected set-membership pattern for "${member}"`;
  return out;
}

export function toSet(arr) {
  if (!Array.isArray(arr)) return new Set();
  return new Set(arr.filter((x) => typeof x === "string"));
}

// Set-typed contract surface keys. Each entry: [report-element key, accessor].
export const SET_KEYS = [
  ["contract.requires.env", (c) => c?.requires?.env],
  ["contract.requires.rbac", (c) => c?.requires?.rbac],
  ["contract.requires.deps", (c) => c?.requires?.deps],
  ["contract.provides.tables", (c) => c?.provides?.tables],
  ["contract.provides.routes", (c) => c?.provides?.routes],
  ["contract.provides.hooks", (c) => c?.provides?.hooks],
  ["contract.provides.components", (c) => c?.provides?.components],
  ["contract.provides.events", (c) => c?.provides?.events],
];

// Mapping from report-element key → ["requires"|"provides", subkey] for
// rebuilding contract from merged set memberships in buildMergedSnapshot.
export const SET_PATHS = {
  "contract.requires.env": ["requires", "env"],
  "contract.requires.rbac": ["requires", "rbac"],
  "contract.requires.deps": ["requires", "deps"],
  "contract.provides.tables": ["provides", "tables"],
  "contract.provides.routes": ["provides", "routes"],
  "contract.provides.hooks": ["provides", "hooks"],
  "contract.provides.components": ["provides", "components"],
  "contract.provides.events": ["provides", "events"],
};
