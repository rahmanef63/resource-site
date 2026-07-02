"use client"

// AI Router — provider-proxy config UI (scaffolded NON-FUNCTIONAL).
//
// Renders the tier-routing table that the relocated convex action
// `api.features.aiRouter.action.callModel({ feature, prompt, tier })` proxies
// through OpenRouter. No live provider/SDK call is made from this page — it is
// adopted alongside the untouched first-party AI engine (`convex/features/ai`)
// and stays inert until a supervised follow-up wires auth + RBAC + audit.

import { Waypoints, Info } from "lucide-react"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"

type Tier = {
  id: "nano" | "mid" | "flagship"
  model: string
  useFor: string
}

const TIERS: Tier[] = [
  { id: "nano", model: "claude-haiku-4-5", useFor: "Classification, spam-flag, headline-suggest" },
  { id: "mid", model: "claude-sonnet-4-6", useFor: "Chat, draft, summarize" },
  { id: "flagship", model: "claude-opus-4-7", useFor: "Methodology review, deep reasoning" },
]

export default function AiRouterPage() {
  return (
    <div className="mx-auto w-full max-w-3xl space-y-6 p-6">
      <header className="flex items-start gap-3">
        <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-muted">
          <Waypoints className="size-5 text-foreground/70" />
        </div>
        <div className="space-y-1">
          <h1 className="text-xl font-semibold tracking-tight">AI Router</h1>
          <p className="text-sm text-muted-foreground">
            Provider-proxy config for tier-routed LLM access via OpenRouter.
          </p>
        </div>
      </header>

      <div className="flex items-start gap-2 rounded-lg border border-border/60 bg-muted/40 px-4 py-3 text-sm text-muted-foreground">
        <Info className="mt-0.5 size-4 shrink-0" />
        <p>
          Scaffolded non-functional. This UI is inert — wire{" "}
          <code className="rounded bg-muted px-1 py-0.5 text-xs">
            api.features.aiRouter.action.callModel
          </code>{" "}
          (with auth + RBAC + audit) and set{" "}
          <code className="rounded bg-muted px-1 py-0.5 text-xs">OPENROUTER_API_KEY</code>{" "}
          on the Convex deployment to enable live replies.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Routing tiers</CardTitle>
          <CardDescription>
            Pick the cheapest tier that fits — each route is a paid model call.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {TIERS.map((tier) => (
            <div
              key={tier.id}
              className="flex flex-col gap-2 rounded-lg border border-border/60 p-3 sm:flex-row sm:items-center sm:justify-between"
            >
              <div className="flex items-center gap-3">
                <Badge
                  variant="secondary"
                  className={cn(
                    "uppercase tracking-wider",
                    tier.id === "flagship" && "bg-foreground text-background",
                  )}
                >
                  {tier.id}
                </Badge>
                <span className="font-mono text-sm">{tier.model}</span>
              </div>
              <span className="text-sm text-muted-foreground">{tier.useFor}</span>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  )
}
