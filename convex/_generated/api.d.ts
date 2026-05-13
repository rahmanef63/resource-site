// Codegen stub for the kitab. Consumer projects MUST run
// `npx convex dev --once` to overwrite this with real types.
// Until codegen runs, calls are typed as `any` — runtime still resolves
// via Convex function references when the consumer wires their backend.

declare module "@convex/_generated/api" {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  export const api: any
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  export const internal: any
}

declare module "@/convex/_generated/api" {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  export const api: any
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  export const internal: any
}
