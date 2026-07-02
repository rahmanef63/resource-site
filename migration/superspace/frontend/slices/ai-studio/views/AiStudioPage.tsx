"use client"

/**
 * AiStudioPage — non-functional generation canvas scaffold.
 *
 * UX target: single big prompt input → streaming output with a 4-up variation
 * grid + version tree. Suno / Midjourney / Lovable pattern.
 *
 * This is a SCAFFOLD: `runGeneration` is stubbed and produces a placeholder
 * generation locally — no provider/SDK call is made. When wired for real, the
 * generation dispatch belongs on the relocated router backend
 * (`api.features.aiRouter`, NOT the untouched `api.features.ai` engine), gated
 * by ensureUser + requirePermission("ai-studio.generate") + logAuditEvent.
 */

import { useCallback, useMemo, useState } from "react"
import {
  WandSparkles,
  Image as ImageIcon,
  Type as TypeIcon,
  Code2,
  AudioLines,
  GitBranch,
  Loader2,
  Sparkles,
} from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
import { ScrollArea } from "@/components/ui/scroll-area"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

import type { Generation, GenerationVariant, OutputKind } from "../types"

const OUTPUT_KINDS: { value: OutputKind; label: string; icon: typeof ImageIcon }[] = [
  { value: "image", label: "Image", icon: ImageIcon },
  { value: "text", label: "Text", icon: TypeIcon },
  { value: "code", label: "Code", icon: Code2 },
  { value: "audio", label: "Audio", icon: AudioLines },
]

const VARIATION_COUNT = 4

/** Local id helper — scaffold only, not persisted. */
function localId(prefix: string): string {
  return `${prefix}_${Math.random().toString(36).slice(2, 10)}`
}

/**
 * Stub generation. Returns a resolved `Generation` with placeholder variants.
 * No provider/SDK call — replace with a mutation on `api.features.aiRouter`
 * when the slice is wired for real.
 */
function runGeneration(input: {
  prompt: string
  kind: OutputKind
  parentId?: string
}): Generation {
  const id = localId("gen")
  const variants: GenerationVariant[] = Array.from({ length: VARIATION_COUNT }, (_, index) => ({
    id: localId("var"),
    index,
    outputInline: `[stub ${input.kind} variant ${index + 1}] "${input.prompt.slice(0, 48)}"`,
  }))
  return {
    id,
    workspaceId: "local",
    userId: "local",
    prompt: input.prompt,
    kind: input.kind,
    modelId: "stub-model",
    parentId: input.parentId,
    variants,
    status: "done",
    createdAt: Date.now(),
  }
}

export default function AiStudioPage() {
  const [prompt, setPrompt] = useState("")
  const [kind, setKind] = useState<OutputKind>("image")
  const [isGenerating, setIsGenerating] = useState(false)
  const [history, setHistory] = useState<Generation[]>([])
  const [activeId, setActiveId] = useState<string | null>(null)

  const active = useMemo(
    () => history.find((generation) => generation.id === activeId) ?? null,
    [history, activeId],
  )

  const generate = useCallback(
    (parentId?: string) => {
      const trimmed = prompt.trim()
      if (!trimmed || isGenerating) return
      setIsGenerating(true)
      // Simulated latency — no real request is made.
      window.setTimeout(() => {
        const generation = runGeneration({ prompt: trimmed, kind, parentId })
        setHistory((prev) => [generation, ...prev])
        setActiveId(generation.id)
        setIsGenerating(false)
      }, 400)
    },
    [prompt, kind, isGenerating],
  )

  const ActiveKindIcon =
    OUTPUT_KINDS.find((entry) => entry.value === (active?.kind ?? kind))?.icon ?? ImageIcon

  return (
    <div className="flex h-[calc(100dvh-9rem)] flex-col gap-4 lg:flex-row">
      {/* Version tree / prompt history */}
      <aside className="flex w-full shrink-0 flex-col rounded-lg border bg-card lg:w-64">
        <div className="flex items-center gap-2 border-b px-4 py-3 text-sm font-medium">
          <GitBranch className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
          Version tree
        </div>
        <ScrollArea className="flex-1">
          {history.length === 0 ? (
            <p className="px-4 py-6 text-center text-xs text-muted-foreground">
              No generations yet. Write a prompt to start.
            </p>
          ) : (
            <ul className="space-y-1 p-2">
              {history.map((generation) => (
                <li key={generation.id}>
                  <button
                    type="button"
                    onClick={() => setActiveId(generation.id)}
                    aria-label={`Open generation: ${generation.prompt}`}
                    className={cn(
                      "w-full rounded-md px-2 py-2 text-left text-xs transition-colors hover:bg-accent",
                      generation.id === activeId && "bg-accent",
                    )}
                  >
                    <span className="flex items-center gap-1.5">
                      {generation.parentId ? (
                        <GitBranch className="h-3 w-3 text-muted-foreground" aria-hidden="true" />
                      ) : (
                        <Sparkles className="h-3 w-3 text-muted-foreground" aria-hidden="true" />
                      )}
                      <span className="truncate">{generation.prompt}</span>
                    </span>
                    <span className="mt-1 block text-[10px] uppercase tracking-wide text-muted-foreground">
                      {generation.kind}
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </ScrollArea>
      </aside>

      {/* Canvas */}
      <section className="flex min-h-0 flex-1 flex-col gap-4">
        <div className="flex flex-1 flex-col overflow-hidden rounded-lg border bg-card">
          <div className="flex items-center justify-between border-b px-4 py-3">
            <div className="flex items-center gap-2 text-sm font-medium">
              <ActiveKindIcon className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
              {active ? active.prompt : "Generation canvas"}
            </div>
            <Badge variant="secondary" className="text-[10px]">
              scaffold
            </Badge>
          </div>

          <ScrollArea className="flex-1">
            {active ? (
              <div className="grid grid-cols-1 gap-3 p-4 sm:grid-cols-2">
                {active.variants.map((variant) => (
                  <Card
                    key={variant.id}
                    className="flex min-h-40 flex-col justify-between gap-2 p-4 text-sm"
                  >
                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                      <span>Variant {variant.index + 1}</span>
                      <Badge variant="outline" className="text-[10px]">
                        {active.kind}
                      </Badge>
                    </div>
                    <p className="text-muted-foreground">{variant.outputInline}</p>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="justify-start gap-1.5 text-xs"
                      onClick={() => generate(active.id)}
                    >
                      <GitBranch className="h-3.5 w-3.5" aria-hidden="true" />
                      Branch from this
                    </Button>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="flex h-full min-h-64 flex-col items-center justify-center gap-2 p-8 text-center">
                <WandSparkles className="h-10 w-10 text-muted-foreground" aria-hidden="true" />
                <p className="text-sm font-medium">Start a generation</p>
                <p className="max-w-sm text-xs text-muted-foreground">
                  Describe what you want and pick an output kind. This scaffold returns placeholder
                  variants — no model is called.
                </p>
              </div>
            )}
          </ScrollArea>
        </div>

        {/* Prompt bar */}
        <div className="rounded-lg border bg-card p-3">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-end">
            <Textarea
              value={prompt}
              onChange={(event) => setPrompt(event.target.value)}
              placeholder="Describe what you want to generate…"
              aria-label="Generation prompt"
              className="min-h-16 flex-1 resize-none"
            />
            <div className="flex items-center gap-2">
              <Select value={kind} onValueChange={(value) => setKind(value as OutputKind)}>
                <SelectTrigger className="w-32" aria-label="Output kind">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {OUTPUT_KINDS.map((entry) => (
                    <SelectItem key={entry.value} value={entry.value}>
                      <span className="flex items-center gap-2">
                        <entry.icon className="h-4 w-4" aria-hidden="true" />
                        {entry.label}
                      </span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button
                type="button"
                onClick={() => generate()}
                disabled={!prompt.trim() || isGenerating}
                className="gap-1.5"
              >
                {isGenerating ? (
                  <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
                ) : (
                  <WandSparkles className="h-4 w-4" aria-hidden="true" />
                )}
                Generate
              </Button>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
