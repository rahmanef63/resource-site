// Pure version helpers for the update channel. The standalone repo owns the
// actual version constants (its lib/headless-core/version.ts imports the repo
// root version.json); this util stays here so the props-driven UpdateCard can
// compare without importing repo-specific modules.

/** semver-ish compare: returns >0 if a>b, <0 if a<b, 0 if equal. Tolerates "1.2.3". */
export function compareVersions(a: string, b: string): number {
  const pa = a.split(".").map((n) => parseInt(n, 10) || 0);
  const pb = b.split(".").map((n) => parseInt(n, 10) || 0);
  for (let i = 0; i < Math.max(pa.length, pb.length); i++) {
    const d = (pa[i] ?? 0) - (pb[i] ?? 0);
    if (d !== 0) return d > 0 ? 1 : -1;
  }
  return 0;
}
