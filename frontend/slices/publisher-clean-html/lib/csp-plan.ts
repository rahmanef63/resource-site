// Content-Security-Policy as data. A CspPlan is a Map<directive, Set<source>>;
// every stage mutates it as data and serializeCsp emits a deterministic
// (sorted) string, so identical inputs always produce a byte-identical policy
// (stable content-hashing). Lifted from Instatic `src/core/publisher/cspPlan.ts`
// (dropped the server-side parse/rewrite helpers — host concern).

/** A CSP policy modelled as data: directive name -> set of source expressions. */
export interface CspPlan {
  directives: Map<string, Set<string>>;
}

/** Replace a directive's source list outright. */
export function setCspDirective(
  plan: CspPlan,
  directive: string,
  sources: Iterable<string>,
): void {
  plan.directives.set(directive, new Set(sources));
}

/**
 * Union extra sources into a directive (creating it if absent). Adding a real
 * source drops `'none'` — `'none'` is only valid as the sole value.
 */
export function addCspSources(
  plan: CspPlan,
  directive: string,
  sources: Iterable<string>,
): void {
  const set = plan.directives.get(directive) ?? new Set<string>();
  set.delete("'none'");
  for (const source of sources) set.add(source);
  plan.directives.set(directive, set);
}

/**
 * Base policy for a published page. `script-src`/`worker-src` default to
 * `'none'` and relax to `'self'` once the page carries any script tag.
 */
export function createBaseCspPlan(opts: { anyScriptTag: boolean }): CspPlan {
  const plan: CspPlan = { directives: new Map() };
  setCspDirective(plan, "default-src", ["'self'"]);
  setCspDirective(plan, "script-src", opts.anyScriptTag ? ["'self'"] : ["'none'"]);
  setCspDirective(plan, "style-src", ["'self'", "'unsafe-inline'"]);
  setCspDirective(plan, "img-src", ["'self'", "data:", "https:"]);
  setCspDirective(plan, "frame-src", ["'none'"]);
  setCspDirective(plan, "worker-src", opts.anyScriptTag ? ["'self'", "blob:"] : ["'none'"]);
  return plan;
}

/**
 * Serialize a plan with deterministic ordering: directives sorted by name,
 * sources sorted within each. Empty directives dropped; '' for an empty plan.
 */
export function serializeCsp(plan: CspPlan): string {
  const directives = [...plan.directives.entries()]
    .filter(([, sources]) => sources.size > 0)
    .sort(([a], [b]) => (a < b ? -1 : a > b ? 1 : 0));
  if (directives.length === 0) return "";
  return (
    directives
      .map(([name, sources]) => `${name} ${[...sources].sort().join(" ")}`)
      .join("; ") + ";"
  );
}

/** Render a plan as a complete CSP `<meta>` tag. */
export function cspMetaTag(plan: CspPlan): string {
  return `<meta http-equiv="Content-Security-Policy" content="${serializeCsp(plan)}">`;
}
