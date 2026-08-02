// HAND-WRITTEN STUB for `convex/_generated/api`.
//
// Real codegen is produced by `npx convex dev --once` once a Convex
// backend URL is configured. Until then this stub satisfies two needs:
//
//   1. Type-side: `api.d.ts` types `api` as `any` so callers compile.
//   2. Runtime-side: `useQuery(api.X.Y, args)` from React tests must not
//      throw on dot-access — vitest needs the `api.X.Y` reference to
//      resolve to *something* that survives `vi.mock("convex/react")`.
//
// We use a proxy chain that returns the same proxy on every property
// read, plus a no-op apply trap so accidental calls don't blow up the
// process. The real codegen is byte-incompatible — that's the point.

const noop = () => undefined;
const handler = {
  get(target, prop) {
    if (prop === Symbol.toPrimitive || prop === "toString" || prop === "Symbol(Symbol.toPrimitive)") {
      return () => "[convex stub]";
    }
    return makeProxy();
  },
  apply: noop,
};
function makeProxy() {
  return new Proxy(noop, handler);
}

export const api = makeProxy();
export const internal = makeProxy();
export const components = makeProxy();
