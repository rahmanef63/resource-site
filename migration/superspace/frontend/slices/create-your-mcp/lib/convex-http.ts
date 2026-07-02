// NON-FUNCTIONAL STUB — replaces the rr `@/shared/lib/convex-http` import that
// does not exist in superspace. The two route templates (routes/*.route.ts)
// import `convexHttp` from here so the slice compiles as a scaffold.
//
// To go live: swap this for a real Convex HTTP client. superspace already uses
// `new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!)` from
// "convex/browser" (see app/api/ai/execute-tool/route.ts). Point the query /
// mutation names at the vendored backend, e.g.:
//   convexHttp.query("features/createYourMcp/query:findToken", { token })
//   convexHttp.mutation("features/createYourMcp/mutation:exchangeCode", {...})
//
// Until wired, every call throws so nothing silently half-works.

const notWired = (): never => {
  throw new Error(
    "create-your-mcp: convexHttp is a non-functional scaffold stub — wire a real ConvexHttpClient before using the MCP/OAuth routes.",
  )
}

export const convexHttp = {
  async query<T = unknown>(
    _name: string,
    _args?: Record<string, unknown>,
  ): Promise<T> {
    return notWired()
  },
  async mutation<T = unknown>(
    _name: string,
    _args?: Record<string, unknown>,
  ): Promise<T> {
    return notWired()
  },
}
