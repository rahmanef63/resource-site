"use client"

import { ConvexAuthProvider } from "@convex-dev/auth/react"
import { ConvexReactClient } from "convex/react"
import { ConvexHttpClient } from "convex/browser"
import { useState, type ReactNode } from "react"

// Read at module top so Next inlines value at build time.
const CONVEX_URL = process.env.NEXT_PUBLIC_CONVEX_URL

function MissingEnvFallback() {
  return (
    <div className="flex min-h-screen items-center justify-center p-6">
      <div className="w-full max-w-md rounded-lg border border-destructive/40 bg-card p-6 shadow-sm">
        <h2 className="mb-2 font-semibold text-destructive">Configuration missing</h2>
        <p className="text-sm text-muted-foreground">
          <code className="font-mono">NEXT_PUBLIC_CONVEX_URL</code> is not set on this
          deployment. Add it to the environment and redeploy.
        </p>
      </div>
    </div>
  )
}

/**
 * Convex provider with the CRITICAL si-coder fix: `auth:*` actions are routed
 * through the HTTP client instead of the WebSocket-backed ReactClient.
 *
 * Why: behind a reverse proxy (Dokploy, Nginx, Cloudflare), idle WebSocket
 * connections get killed. When the WS reconnects mid-action, `@convex-dev/auth`
 * client calls `requestManager.restart()` which aborts every in-flight action.
 * Symptom: "Connection lost while action was in flight" — user appears in DB
 * but browser never receives the response.
 *
 * Routing auth:* actions over HTTP bypasses the WS entirely for the auth path.
 */
export function ConvexClientProvider({ children }: { children: ReactNode }) {
  const [convex] = useState(() => {
    if (!CONVEX_URL) return null
    const client = new ConvexReactClient(CONVEX_URL)
    const http = new ConvexHttpClient(CONVEX_URL)
    const origAction = client.action.bind(client)
    type ActionFn = (ref: unknown, args?: unknown) => unknown
    const patched = client as unknown as { action: ActionFn }
    patched.action = (ref, args) => {
      const name = (ref as { _name?: string } | null)?._name ?? String(ref)
      if (typeof name === "string" && name.startsWith("auth:")) {
        return (http.action as ActionFn)(ref, args)
      }
      return (origAction as ActionFn)(ref, args)
    }
    return client
  })
  if (!convex) return <MissingEnvFallback />
  return <ConvexAuthProvider client={convex}>{children}</ConvexAuthProvider>
}
