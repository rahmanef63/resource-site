// compose-solver-resolve.mjs — desired-set normalisation + BFS dep resolution.
//
// Pure functions extracted from compose-solver.mjs. Operate on candidate
// state (Sets + arrays) — no I/O, no mutation of the caller's `contracts`
// map. Returns the new candidate state + an updated `proof`/`notes` log.

/**
 * Fold the user's `desired` list into a candidate set, classifying each entry
 * as contracted (with a known contract) or uncontracted (allowed under
 * `allowUnknownSlices`, otherwise rejected with a `missing-dep` blocker).
 *
 * Side-effects via the `record` callback — caller owns the conflict store.
 */
export function buildInitialCandidates({
  desired,
  contracts,
  allowUnknownSlices,
  record,
  proof,
  notes,
  uncontractedDesired,
}) {
  const candidateOrder = [];
  const candidateSet = new Set();

  for (const slug of desired) {
    if (candidateSet.has(slug)) continue;
    const contract = contracts.get(slug);
    if (!contract) {
      if (allowUnknownSlices) {
        record(
          {
            type: "uncontracted",
            slug,
            detail: `Slice "${slug}" has no registered slice.contract.ts — accepted under allowUnknownSlices, but conflict checks are skipped for it.`,
            severity: "warning",
          },
          slug,
        );
        uncontractedDesired.add(slug);
        candidateSet.add(slug);
        candidateOrder.push(slug);
        notes.set(slug, "uncontracted");
        proof.push(`! ${slug}: accepted as uncontracted (no slice.contract.ts; skipping conflict checks)`);
      } else {
        record(
          {
            type: "missing-dep",
            slug,
            detail: `Contract not found for "${slug}" — no slice.contract.ts registered (strict mode).`,
            severity: "blocker",
          },
          slug,
        );
        proof.push(`- ${slug}: rejected (no contract found, strict mode)`);
      }
      continue;
    }
    candidateSet.add(slug);
    candidateOrder.push(slug);
  }
  return { candidateOrder, candidateSet };
}

/**
 * BFS over `requires.deps`, pulling transitive deps into the candidate set.
 * Throws on cycles. Pushes informational lines to `proof`. Returns nothing —
 * mutates `candidateOrder` / `candidateSet` in place.
 */
export function resolveDependencies({
  candidateOrder,
  candidateSet,
  contracts,
  installed,
  record,
  proof,
}) {
  /** @type {Array<{ slug: string; chain: string[] }>} */
  const queue = candidateOrder
    .filter((s) => contracts.has(s))
    .map((slug) => ({ slug, chain: [slug] }));
  while (queue.length > 0) {
    const { slug, chain } = queue.shift();
    const contract = contracts.get(slug);
    const deps = contract?.requires?.deps ?? [];
    for (const dep of deps) {
      if (chain.includes(dep)) {
        const cyclePath = [...chain.slice(chain.indexOf(dep)), dep].join(" → ");
        throw new Error(`dependency cycle detected: ${cyclePath}`);
      }
      if (installed.has(dep)) continue;
      if (candidateSet.has(dep)) continue;
      const depContract = contracts.get(dep);
      if (!depContract) {
        record(
          {
            type: "missing-dep",
            slug,
            withSlug: dep,
            detail: `Slice "${slug}" requires "${dep}" but no contract is registered for it.`,
            severity: "blocker",
          },
          slug,
        );
        proof.push(`- ${slug}: missing dep "${dep}" (not in candidates, not installed)`);
        continue;
      }
      candidateSet.add(dep);
      candidateOrder.push(dep);
      proof.push(`+ ${dep}: pulled in as transitive dep of ${slug}`);
      queue.push({ slug: dep, chain: [...chain, dep] });
    }
  }
}

/**
 * Without dependency resolution: surface every unmet `requires.deps` entry
 * as a blocker. Used when the caller passed `resolveDeps: false`.
 */
export function reportUnresolvedDeps({
  candidateOrder,
  candidateSet,
  contracts,
  installed,
  record,
}) {
  for (const slug of candidateOrder) {
    const deps = contracts.get(slug)?.requires?.deps ?? [];
    for (const dep of deps) {
      if (installed.has(dep) || candidateSet.has(dep)) continue;
      record(
        {
          type: "missing-dep",
          slug,
          withSlug: dep,
          detail: `Slice "${slug}" requires "${dep}" (resolveDeps disabled — not auto-pulled).`,
          severity: "blocker",
        },
        slug,
      );
    }
  }
}

/**
 * For each candidate, count how many OTHER candidates list it in their
 * `requires.deps[]`. Used for arbitration tiebreaks.
 *
 * @returns {Map<string, number>}
 */
export function computeDependersCount(candidateOrder, contracts) {
  /** @type {Map<string, number>} */
  const dependersCount = new Map();
  for (const slug of candidateOrder) dependersCount.set(slug, 0);
  for (const slug of candidateOrder) {
    const c = contracts.get(slug);
    if (!c) continue;
    for (const d of c.requires?.deps ?? []) {
      if (dependersCount.has(d)) {
        dependersCount.set(d, (dependersCount.get(d) ?? 0) + 1);
      }
    }
  }
  return dependersCount;
}
