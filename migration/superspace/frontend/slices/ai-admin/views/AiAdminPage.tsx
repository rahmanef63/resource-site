"use client"

/**
 * AiAdminPage — operator console for the AI stack.
 *
 * NON-FUNCTIONAL SCAFFOLD (0.1.0). Renders the tab shell + empty-state
 * placeholders only. No provider/model/agent data is fetched: the rr convex
 * backend was not vendored, and the live engine at `convex/features/ai` is
 * intentionally left untouched. Wiring RBAC-gated CRUD over the aiRouter
 * registries is a supervised sp-backend follow-up.
 */

import type { LucideIcon } from "lucide-react"
import { Bot, BrainCircuit, Boxes, Cpu, ScrollText, Sparkles, Wrench } from "lucide-react"

import { FeatureShell, type ShellTabItem } from "@/frontend/shared/ui/layout/feature-shell"
import { Badge } from "@/components/ui/badge"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"

type TabScaffold = {
  value: string
  label: string
  icon: LucideIcon
  title: string
  description: string
  emptyLabel: string
}

const TAB_SCAFFOLDS: TabScaffold[] = [
  {
    value: "providers",
    label: "Providers",
    icon: Boxes,
    title: "Providers",
    description:
      "API sources (Anthropic / OpenAI / Google / Mistral / Ollama). Keys encrypted at rest.",
    emptyLabel: "No providers configured yet.",
  },
  {
    value: "models",
    label: "Models",
    icon: Cpu,
    title: "Models",
    description:
      "Per-provider model catalog: capabilities, context window, pricing, active flag.",
    emptyLabel: "No models registered yet.",
  },
  {
    value: "instructions",
    label: "Instructions",
    icon: ScrollText,
    title: "Instructions",
    description: "Reusable system prompts and instruction presets shared across agents.",
    emptyLabel: "No instruction presets yet.",
  },
  {
    value: "skills",
    label: "Skills",
    icon: Sparkles,
    title: "Skills",
    description: "Named prompt + tool + model defaults (chatbot / copilot / first-app personas).",
    emptyLabel: "No skills defined yet.",
  },
  {
    value: "tools",
    label: "Tools",
    icon: Wrench,
    title: "Tools",
    description: "JSON-schema'd function specs + impl wiring (http / convex / shell). Sandbox per tool.",
    emptyLabel: "No tools registered yet.",
  },
  {
    value: "agents",
    label: "Agents",
    icon: Bot,
    title: "Agents",
    description: "Skill + Model + Tool subset + max-iter definitions consumed by the agent runner.",
    emptyLabel: "No agents defined yet.",
  },
]

function TabPanel({ scaffold }: { scaffold: TabScaffold }) {
  const Icon = scaffold.icon
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Icon className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
          {scaffold.title}
          <Badge variant="outline" className="ml-auto text-xs font-normal">
            Scaffold
          </Badge>
        </CardTitle>
        <CardDescription>{scaffold.description}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col items-center justify-center gap-2 rounded-md border border-dashed px-6 py-12 text-center">
          <Icon className="h-8 w-8 text-muted-foreground/60" aria-hidden="true" />
          <p className="text-sm text-muted-foreground">{scaffold.emptyLabel}</p>
          <p className="text-xs text-muted-foreground/70">
            Non-functional preview — backend wiring pending.
          </p>
        </div>
      </CardContent>
    </Card>
  )
}

export default function AiAdminPage() {
  const tabs: ShellTabItem[] = TAB_SCAFFOLDS.map((scaffold) => ({
    value: scaffold.value,
    label: scaffold.label,
    icon: scaffold.icon,
    content: <TabPanel scaffold={scaffold} />,
  }))

  return (
    <FeatureShell featureId="ai-admin" tabs={tabs} defaultTab="providers">
      <Card className="border-dashed">
        <CardHeader className="flex flex-row items-center gap-3 space-y-0">
          <BrainCircuit className="h-5 w-5 text-muted-foreground" aria-hidden="true" />
          <div>
            <CardTitle className="text-base">AI Admin</CardTitle>
            <CardDescription>
              Central operator console for the AI stack. Scaffold preview — not yet functional.
            </CardDescription>
          </div>
        </CardHeader>
      </Card>
    </FeatureShell>
  )
}
