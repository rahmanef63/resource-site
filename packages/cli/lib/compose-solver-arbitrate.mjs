// compose-solver-arbitrate.mjs — pair-arbitration helper.
//
// Split from compose-solver-conflicts.mjs to keep both files ≤200 LOC.
// Returns a closure that records the arbitration outcome + appends to
// `proof` for the chosen winner/loser.

/**
 * Pair-conflict arbitration helper factory. Returns a function that records
 * the arbitration outcome + appends a `proof` entry.
 */
export function makeArbitrator({
  installed,
  dependersCount,
  allConflicts,
  arbitrations,
  notes,
  proof,
  record,
}) {
  /**
   * @param {string} a
   * @param {string} b
   * @param {import("./compose-solver").ConflictType} type
   * @param {string} detailA
   * @param {string} detailB
   */
  return function arbitratePair(a, b, type, detailA, detailB) {
    const ca = /** @type {import("./compose-solver").Conflict} */ ({
      type, slug: a, withSlug: b, detail: detailA, severity: "blocker",
    });
    const cb = /** @type {import("./compose-solver").Conflict} */ ({
      type, slug: b, withSlug: a, detail: detailB, severity: "blocker",
    });
    const bothInstalled = installed.has(a) && installed.has(b);
    if (bothInstalled) {
      allConflicts.push({ ...ca, severity: "warning", type: "both-installed-conflict" });
      allConflicts.push({ ...cb, severity: "warning", type: "both-installed-conflict" });
      notes.set(a, notes.get(a) ?? "both-installed-conflict");
      notes.set(b, notes.get(b) ?? "both-installed-conflict");
      proof.push(`! ${a} ↔ ${b}: both already installed — conflict surfaced as warning, neither dropped`);
      return;
    }
    if (installed.has(a) && !installed.has(b)) {
      record(cb, b);
      arbitrations.push({
        conflict: cb, winner: a, loser: b,
        reason: `"${a}" already installed — installed slice wins`,
      });
      proof.push(`- ${b}: arbitrated against ${a} (installed wins)`);
      return;
    }
    if (installed.has(b) && !installed.has(a)) {
      record(ca, a);
      arbitrations.push({
        conflict: ca, winner: b, loser: a,
        reason: `"${b}" already installed — installed slice wins`,
      });
      proof.push(`- ${a}: arbitrated against ${b} (installed wins)`);
      return;
    }
    const depA = dependersCount.get(a) ?? 0;
    const depB = dependersCount.get(b) ?? 0;
    let winner, loser, conflictForLoser, reason;
    if (depA !== depB) {
      if (depA > depB) {
        winner = a; loser = b; conflictForLoser = cb;
        reason = `"${a}" has ${depA} dependers vs "${b}" with ${depB} — most-dependers wins`;
      } else {
        winner = b; loser = a; conflictForLoser = ca;
        reason = `"${b}" has ${depB} dependers vs "${a}" with ${depA} — most-dependers wins`;
      }
    } else {
      const later = a > b ? a : b;
      const earlier = a > b ? b : a;
      winner = earlier;
      loser = later;
      conflictForLoser = later === a ? ca : cb;
      reason = `tie at ${depA} dependers — alphabetical tiebreak drops "${later}"`;
    }
    record(conflictForLoser, loser);
    arbitrations.push({ conflict: conflictForLoser, winner, loser, reason });
    proof.push(`- ${loser}: arbitrated against ${winner} (${reason})`);
  };
}
