"use client"

import * as React from "react"
import { useCallback, useEffect, useMemo, useRef, useState } from "react"
import { ArrowRight, Check, LayoutList, RefreshCw, Send, Sparkles } from "lucide-react"
import { z } from "zod"

import { Button } from "@/components/ui/button"
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area"
import { cn } from "@/lib/utils"
import {
  getProviderModels,
  useAISettingsStorage,
  type AIApiKeyConfig,
} from "@/frontend/shared/ai/settings/useAISettings"
import {
  getMergedBundleEnabledFeatures,
  usePublicBundles,
} from "@/frontend/shared/foundation/workspaces/hooks/useBundles"
import {
  CORE_FEATURES,
  type AvailableFeatureId,
} from "@/frontend/shared/foundation/workspaces/constants"
import { WORKSPACE_ICONS } from "@/frontend/shared/workspace/constants"
import { getAllFeatures } from "@/frontend/shared/lib/features/registry"
import {
  GrokAIMessage,
  GrokChatContainer,
  GrokTypingIndicator,
  GrokUserMessage,
} from "@/frontend/shared/communications/components/grok-chat"

type Stage = 1 | 2
type Role = "ai" | "user"
type WorkspaceType = "organization" | "institution" | "group" | "family" | "personal"

export interface WorkspaceAIDraft {
  name: string
  description?: string
  type: WorkspaceType
  bundleId?: string | null
  enabledFeatures: AvailableFeatureId[]
  icon?: string
  color?: string
  isPublic: boolean
  reasoning: string[]
}

interface ChatMessage {
  id: string
  role: Role
  text: string
}

interface Question {
  id: string
  question: string
  placeholder: string
  presets?: string[]
  multi?: boolean
}

const WORKSPACE_TYPE_VALUES = [
  "organization",
  "institution",
  "group",
  "family",
  "personal",
] as const

const draftSchema = z.object({
  name: z.string().min(1),
  description: z.string().optional(),
  type: z.enum(WORKSPACE_TYPE_VALUES).optional(),
  bundleId: z.string().nullable().optional(),
  enabledFeatures: z.array(z.string()).optional(),
  icon: z.string().optional(),
  color: z.string().optional(),
  isPublic: z.boolean().optional(),
  reasoning: z.array(z.string()).optional(),
})

const STAGE_1_QUESTIONS: Question[] = [
  {
    id: "workspaceType",
    question: "What kind of workspace do you want to create?",
    placeholder: "e.g. Operations hub, client portal, team project...",
    presets: ["Operations Hub", "Project Workspace", "Client Portal", "Personal HQ", "Community Space"],
  },
  {
    id: "workspaceName",
    question: "What should the workspace be called?",
    placeholder: "e.g. Project Alpha, Zian Ops...",
    presets: ["Project Alpha", "Ops Center", "Growth HQ", "Client Portal"],
  },
  {
    id: "audience",
    question: "Who is the primary audience for this workspace?",
    placeholder: "e.g. Just me, small team, clients plus internal staff...",
    presets: ["Solo", "Founder + Admin", "Small Team", "Manager + Staff", "Client + Internal Team"],
  },
  {
    id: "purpose",
    question: "What is the main purpose of this workspace?",
    placeholder: "e.g. Monitor projects, approvals, client collaboration...",
    presets: ["Task & project tracking", "Operations monitoring", "Client collaboration", "Knowledge base"],
  },
  {
    id: "features",
    question: "Which core features should be active at launch?",
    placeholder: "Select below or type your own",
    multi: true,
    presets: ["Dashboard", "Tasks", "Projects", "Calendar", "Files", "Knowledge Base", "Approvals", "Chat", "AI Agent"],
  },
]

const STAGE_2_QUESTIONS: Question[] = [
  {
    id: "iconStyle",
    question: "What icon or visual identity fits this workspace?",
    placeholder: "e.g. modern ops, folder, briefcase, rocket...",
    presets: ["Folder", "Briefcase", "Building2", "Users", "Rocket", "Brain", "Palette"],
  },
  {
    id: "theme",
    question: "What visual theme are you looking for?",
    placeholder: "e.g. clean admin, dark ops, premium blue...",
    presets: ["Ops Dark", "Blue Premium", "Teal Clean", "Warm Neutral", "Minimal"],
  },
  {
    id: "privacy",
    question: "What should the default privacy be?",
    placeholder: "e.g. private invite-only, internal only...",
    presets: ["Private Invite-Only", "Internal Only", "Public Read / Private Write"],
  },
  {
    id: "starterData",
    question: "Do you need starter data, templates, or automations?",
    placeholder: "e.g. starter tasks, KPI widgets, project board...",
    presets: ["Starter Tasks", "KPI Widgets", "Project Board", "Docs Skeleton"],
  },
  {
    id: "notes",
    question: "Any additional details or special requirements?",
    placeholder: "e.g. bilingual support, weekly reports, approval rules...",
    presets: ["Requires Manager Approval", "Auto-create Weekly Report", "Bilingual Support"],
  },
]

function AiBubble({ text }: { text: string }) {
  return (
    <GrokAIMessage>
      <span>{text}</span>
    </GrokAIMessage>
  )
}

function UserBubble({ text }: { text: string }) {
  return <GrokUserMessage>{text}</GrokUserMessage>
}

function normalizeHexColor(value?: string, fallback = "#6366f1") {
  if (!value) return fallback
  const trimmed = value.trim()
  if (/^#[0-9a-fA-F]{6}$/.test(trimmed)) return trimmed
  return fallback
}

function cleanJsonResponse(value: string) {
  return value
    .replace(/^```json\s*/i, "")
    .replace(/^```\s*/i, "")
    .replace(/```\s*$/i, "")
    .trim()
}

function inferWorkspaceType(rawValue?: string): WorkspaceType {
  const value = (rawValue ?? "").toLowerCase()

  if (value.includes("family")) return "family"
  if (value.includes("school") || value.includes("education") || value.includes("campus")) {
    return "institution"
  }
  if (value.includes("personal") || value.includes("solo") || value.includes("just me")) {
    return "personal"
  }
  if (value.includes("community") || value.includes("group") || value.includes("team")) {
    return "group"
  }

  return "organization"
}

function LivePreview({
  answers,
  selectedMulti,
  draft,
  bundleLabel,
}: {
  answers: Record<string, unknown>
  selectedMulti: string[]
  draft: WorkspaceAIDraft | null
  bundleLabel?: string | null
}) {
  const previewFeatures = draft?.enabledFeatures?.length
    ? draft.enabledFeatures
    : Array.isArray(answers.features)
      ? (answers.features as string[])
      : selectedMulti

  return (
    <div className="flex flex-col gap-4 p-4">
      <div className="space-y-3 rounded-2xl border border-border/60 bg-gradient-to-br from-primary/10 via-primary/5 to-transparent p-4">
        <div className="flex flex-wrap items-center gap-2">
          <span className="inline-flex rounded-full border border-primary/20 bg-primary/10 px-2 py-0.5 text-xs font-bold uppercase tracking-wide text-primary">
            {draft?.type ?? inferWorkspaceType(String(answers.workspaceType ?? ""))}
          </span>
          {bundleLabel ? (
            <span className="inline-flex rounded-full border border-border/70 bg-background/80 px-2 py-0.5 text-xs text-muted-foreground">
              {bundleLabel}
            </span>
          ) : null}
        </div>
        <div>
          <h2 className="text-lg font-bold leading-tight">
            {draft?.name || String(answers.workspaceName ?? "Untitled Workspace")}
          </h2>
          <p className="mt-0.5 text-sm leading-relaxed text-muted-foreground">
            {draft?.description || String(answers.purpose ?? "Waiting for more context...")}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2">
        <div className="rounded-xl border bg-card p-3">
          <div className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
            Features
          </div>
          <div className="mt-1 text-lg font-bold">{previewFeatures.length}</div>
        </div>
        <div className="rounded-xl border bg-card p-3">
          <div className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
            Privacy
          </div>
          <div className="mt-1 text-sm font-medium">
            {draft?.isPublic ? "Public" : String(answers.privacy ?? "Private")}
          </div>
        </div>
      </div>

      {previewFeatures.length > 0 ? (
        <div className="space-y-1.5">
          <div className="text-xs font-medium text-muted-foreground">Enabled Features</div>
          <div className="flex flex-wrap gap-1.5">
            {previewFeatures.map((featureId) => (
              <span
                key={featureId}
                className="inline-flex items-center rounded-md border border-primary/30 bg-primary/10 px-2 py-1 text-xs font-medium text-primary"
              >
                {featureId}
              </span>
            ))}
          </div>
        </div>
      ) : null}

      {draft?.reasoning?.length ? (
        <div className="space-y-1.5">
          <div className="text-xs font-medium text-muted-foreground">AI Notes</div>
          <div className="space-y-2">
            {draft.reasoning.slice(0, 3).map((reason, index) => (
              <div key={`${reason}-${index}`} className="rounded-xl border bg-card px-3 py-2 text-xs text-muted-foreground">
                {reason}
              </div>
            ))}
          </div>
        </div>
      ) : null}
    </div>
  )
}

export interface AiOnboardingFlowProps {
  onCreateWorkspace?: (draft: WorkspaceAIDraft) => Promise<void> | void
  onComplete?: (draft: WorkspaceAIDraft) => Promise<void> | void
  actionLabel?: string
}

export function AiOnboardingFlow({
  onCreateWorkspace,
  onComplete,
  actionLabel,
}: AiOnboardingFlowProps) {
  const [stage, setStage] = useState<Stage>(1)
  const [currentIndex, setCurrentIndex] = useState(0)
  const [answers, setAnswers] = useState<Record<string, unknown>>({})
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [inputValue, setInputValue] = useState("")
  const [selectedMulti, setSelectedMulti] = useState<string[]>([])
  const [generatedDraft, setGeneratedDraft] = useState<WorkspaceAIDraft | null>(null)
  const [isTyping, setIsTyping] = useState(false)
  const [isGenerating, setIsGenerating] = useState(false)
  const [isCreating, setIsCreating] = useState(false)
  const [generationError, setGenerationError] = useState<string | null>(null)
  const [created, setCreated] = useState(false)
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const { settings } = useAISettingsStorage()
  const { bundles } = usePublicBundles()

  const features = useMemo(() => getAllFeatures(), [])
  const featureLookup = useMemo(
    () => new Map(features.map((feature) => [feature.id, feature])),
    [features],
  )
  const allowedFeatureIds = useMemo(
    () => new Set(features.map((feature) => feature.id)),
    [features],
  )
  const bundleLookup = useMemo(
    () => new Map(bundles.map((bundle) => [bundle.id, bundle])),
    [bundles],
  )
  const allowedBundleIds = useMemo(
    () => new Set(bundles.map((bundle) => bundle.id)),
    [bundles],
  )

  const commitDraft = onCreateWorkspace ?? onComplete
  const currentQuestions = stage === 1 ? STAGE_1_QUESTIONS : STAGE_2_QUESTIONS
  const isStage1Done = stage === 1 && currentIndex >= STAGE_1_QUESTIONS.length
  const q = currentQuestions[currentIndex]
  const totalAnswered = Object.keys(answers).length
  const totalQuestions = STAGE_1_QUESTIONS.length + STAGE_2_QUESTIONS.length
  const progress = Math.min((totalAnswered / totalQuestions) * 100, 100)
  const buttonLabel = actionLabel ?? (onCreateWorkspace ? "Create Workspace" : "Use AI Draft")
  const bundleLabel = generatedDraft?.bundleId ? bundleLookup.get(generatedDraft.bundleId)?.name ?? generatedDraft.bundleId : null

  const addAiMessage = useCallback((text: string) => {
    setMessages((prev) => [...prev, { id: `ai-${Date.now()}-${Math.random()}`, role: "ai", text }])
  }, [])

  const addUserMessage = useCallback((text: string) => {
    setMessages((prev) => [...prev, { id: `user-${Date.now()}-${Math.random()}`, role: "user", text }])
  }, [])

  useEffect(() => {
    if (messages.length > 0) return

    addAiMessage("I can turn your answers into a real workspace plan using the configured AI provider. Let's start with 5 core questions.")
    const timer = window.setTimeout(() => {
      addAiMessage(STAGE_1_QUESTIONS[0].question)
    }, 600)

    return () => window.clearTimeout(timer)
  }, [addAiMessage, messages.length])

  useEffect(() => {
    if (!textareaRef.current) return
    textareaRef.current.style.height = "auto"
    textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 120)}px`
  }, [inputValue])

  const handleNextQuestion = useCallback((nextQuestions: Question[], nextIndex: number) => {
    if (nextIndex >= nextQuestions.length) return

    setIsTyping(true)
    window.setTimeout(() => {
      setIsTyping(false)
      addAiMessage(nextQuestions[nextIndex].question)
    }, 450)
  }, [addAiMessage])

  const sanitizeDraft = useCallback((rawDraft: z.infer<typeof draftSchema>, sourceAnswers: Record<string, unknown>) => {
    const fallbackType = inferWorkspaceType(String(sourceAnswers.workspaceType ?? ""))
    const bundleId = rawDraft.bundleId && allowedBundleIds.has(rawDraft.bundleId) ? rawDraft.bundleId : "custom"
    const bundleFeatures = bundleId && bundleLookup.has(bundleId)
      ? getMergedBundleEnabledFeatures(bundleLookup.get(bundleId)!)
      : []

    const normalizedFeatures = Array.from(
      new Set([
        ...CORE_FEATURES,
        ...(rawDraft.enabledFeatures ?? []).filter((featureId) => allowedFeatureIds.has(featureId)),
        ...bundleFeatures.filter((featureId) => allowedFeatureIds.has(featureId)),
      ]),
    )

    return {
      name: rawDraft.name.trim() || String(sourceAnswers.workspaceName ?? "New Workspace"),
      description: rawDraft.description?.trim() || String(sourceAnswers.purpose ?? ""),
      type: rawDraft.type ?? fallbackType,
      bundleId,
      enabledFeatures: normalizedFeatures,
      icon: rawDraft.icon?.trim() || String(sourceAnswers.iconStyle ?? "Folder"),
      color: normalizeHexColor(rawDraft.color, bundleLookup.get(bundleId)?.theme?.primaryColor ?? "#6366f1"),
      isPublic: rawDraft.isPublic ?? false,
      reasoning: (rawDraft.reasoning ?? []).filter(Boolean).slice(0, 4),
    } satisfies WorkspaceAIDraft
  }, [allowedBundleIds, allowedFeatureIds, bundleLookup])

  const generateDraft = useCallback(async (sourceAnswers: Record<string, unknown>) => {
    setGenerationError(null)
    setGeneratedDraft(null)
    setIsGenerating(true)
    setIsTyping(true)
    addAiMessage("I'm generating a real workspace plan from your answers now.")

    const providerRaw = settings?.defaultProvider || "openrouter"
    const provider = providerRaw === "z-ai" ? "glm" : providerRaw
    const configuredModel = settings?.defaultModel || "google/gemini-2.5-flash"
    const availableModels = getProviderModels(provider)
    const model =
      availableModels.length > 0 && !availableModels.some((candidate) => candidate.id === configuredModel)
        ? availableModels[0].id
        : configuredModel

    const apiKeyConfig =
      settings?.apiKeys?.find((key: AIApiKeyConfig) => key.providerId === provider && key.isEnabled) ||
      settings?.apiKeys?.find((key: AIApiKeyConfig) => key.providerId === providerRaw && key.isEnabled)

    const bundleSummary = bundles.map((bundle) => {
      const featureSummary = getMergedBundleEnabledFeatures(bundle).slice(0, 10).join(", ")
      return `${bundle.id}: ${bundle.name} [${bundle.category}] recommendedFor=${bundle.recommendedFor.join(",")} features=${featureSummary}`
    }).join("\n")

    const featureSummary = features
      .map((feature) => `${feature.id}: ${feature.name} - ${feature.description ?? "No description"}`)
      .join("\n")

    const iconSummary = WORKSPACE_ICONS
      .slice(0, 24)
      .map((icon) => icon.name)
      .join(", ")

    const answerSummary = Object.entries(sourceAnswers)
      .map(([key, value]) => `- ${key}: ${Array.isArray(value) ? value.join(", ") : String(value)}`)
      .join("\n")

    try {
      const response = await fetch("/api/ai/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          provider,
          model,
          apiKey: apiKeyConfig?.apiKey ?? "",
          baseUrl: apiKeyConfig?.baseUrl,
          temperature: 0.2,
          maxTokens: 1400,
          messages: [
            {
              role: "system",
              content: `You are a workspace planner for SuperSpace.

Return ONLY raw JSON. No markdown fences. No prose before or after the JSON.

Schema:
{
  "name": string,
  "description": string,
  "type": "organization" | "institution" | "group" | "family" | "personal",
  "bundleId": string | null,
  "enabledFeatures": string[],
  "icon": string,
  "color": "#RRGGBB",
  "isPublic": boolean,
  "reasoning": string[]
}

Rules:
- Only use bundleId values from the allowed bundle list.
- Only use feature ids from the allowed feature list.
- Always produce a practical workspace name and concise description.
- enabledFeatures must include the core feature ids: ${CORE_FEATURES.join(", ")}.
- Prefer a recommended bundle when there is a strong fit, otherwise use "custom".
- Keep enabledFeatures to 4-12 relevant feature ids.
- icon should be one of these Lucide icon names when possible: ${iconSummary}.
- color must be a valid 6-digit hex value.
- reasoning should contain 2-4 short bullets explaining the choices.`,
            },
            {
              role: "user",
              content: `User answers:
${answerSummary}

Allowed bundles:
${bundleSummary}

Allowed features:
${featureSummary}`,
            },
          ],
        }),
      })

      const payload = await response.json()
      if (!response.ok) {
        throw new Error(payload?.error || "The AI provider could not generate a workspace plan.")
      }

      const parsed = draftSchema.parse(JSON.parse(cleanJsonResponse(String(payload?.content ?? ""))))
      const draft = sanitizeDraft(parsed, sourceAnswers)
      setGeneratedDraft(draft)

      const summaryBits = [
        `I drafted "${draft.name}"`,
        draft.bundleId ? `using the ${bundleLookup.get(draft.bundleId)?.name ?? draft.bundleId} bundle` : null,
        `with ${draft.enabledFeatures.length} enabled features.`,
      ].filter(Boolean)

      addAiMessage(summaryBits.join(" "))
      draft.reasoning.forEach((reason) => addAiMessage(reason))
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to generate an AI workspace draft."
      setGenerationError(message)
      addAiMessage(`I couldn't generate the workspace draft: ${message}`)
    } finally {
      setIsTyping(false)
      setIsGenerating(false)
    }
  }, [addAiMessage, bundleLookup, bundles, features, sanitizeDraft, settings?.apiKeys, settings?.defaultModel, settings?.defaultProvider])

  const handleCommitDraft = useCallback(async () => {
    if (!generatedDraft || !commitDraft) return

    setIsCreating(true)
    setGenerationError(null)

    try {
      await commitDraft(generatedDraft)
      setCreated(true)
      addAiMessage(`Workspace "${generatedDraft.name}" has been created.`)
    } catch (error) {
      const message = error instanceof Error ? error.message : "Workspace creation failed."
      setGenerationError(message)
      addAiMessage(`I couldn't create the workspace: ${message}`)
    } finally {
      setIsCreating(false)
    }
  }, [addAiMessage, commitDraft, generatedDraft])

  const submitAnswer = useCallback((overrideValue?: string) => {
    if (!q || isGenerating) return

    const raw = (overrideValue ?? inputValue).trim()
    let finalValue: string | string[] = raw || "No preference"

    if (q.multi) {
      finalValue = selectedMulti.length > 0
        ? selectedMulti
        : raw
          ? [raw]
          : ["No preference"]
    }

    addUserMessage(Array.isArray(finalValue) ? finalValue.join(", ") : finalValue)
    const nextAnswers = { ...answers, [q.id]: finalValue }
    setAnswers(nextAnswers)
    setInputValue("")
    setSelectedMulti([])
    setGeneratedDraft(null)
    setGenerationError(null)

    const nextIndex = currentIndex + 1

    if (stage === 1) {
      if (nextIndex < STAGE_1_QUESTIONS.length) {
        setCurrentIndex(nextIndex)
        handleNextQuestion(STAGE_1_QUESTIONS, nextIndex)
        return
      }

      setCurrentIndex(STAGE_1_QUESTIONS.length)
      setIsTyping(true)
      window.setTimeout(() => {
        setIsTyping(false)
        addAiMessage("I have enough context to draft the workspace now. You can keep going for a more detailed plan, or generate immediately.")
      }, 500)
      return
    }

    if (nextIndex < STAGE_2_QUESTIONS.length) {
      setCurrentIndex(nextIndex)
      handleNextQuestion(STAGE_2_QUESTIONS, nextIndex)
      return
    }

    setCurrentIndex(STAGE_2_QUESTIONS.length)
    void generateDraft(nextAnswers)
  }, [addAiMessage, addUserMessage, answers, currentIndex, generateDraft, handleNextQuestion, inputValue, isGenerating, q, selectedMulti, stage])

  const handleProceedStage2 = useCallback(() => {
    setStage(2)
    setCurrentIndex(0)
    addAiMessage("Let's add a few details so I can shape the bundle, privacy, and visual setup more accurately.")
    window.setTimeout(() => addAiMessage(STAGE_2_QUESTIONS[0].question), 350)
  }, [addAiMessage])

  const handleFinishEarly = useCallback(() => {
    void generateDraft(answers)
  }, [answers, generateDraft])

  const handleToggleMulti = useCallback((value: string) => {
    setSelectedMulti((prev) =>
      prev.includes(value)
        ? prev.filter((item) => item !== value)
        : [...prev, value],
    )
  }, [])

  const handleReset = useCallback(() => {
    setStage(1)
    setCurrentIndex(0)
    setAnswers({})
    setMessages([])
    setInputValue("")
    setSelectedMulti([])
    setGeneratedDraft(null)
    setGenerationError(null)
    setIsTyping(false)
    setIsGenerating(false)
    setIsCreating(false)
    setCreated(false)
  }, [])

  const handleKeyDown = useCallback((event: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault()
      if (!(isStage1Done && stage === 1)) {
        submitAnswer()
      }
    }
  }, [isStage1Done, stage, submitAnswer])

  return (
    <div className="flex h-full min-h-[500px] flex-col gap-4 overflow-hidden lg:flex-row">
      <aside className="hidden w-[280px] shrink-0 flex-col overflow-hidden rounded-2xl border border-border/70 bg-card/95 shadow-sm lg:flex xl:w-[300px]">
        <div className="flex items-center gap-2 border-b border-white/5 bg-accent/20 px-4 py-3">
          <Sparkles className="h-4 w-4 shrink-0 text-primary" />
          <div>
            <h3 className="text-sm font-semibold">AI Workspace Draft</h3>
            <p className="text-[11px] text-muted-foreground">Live answers plus generated plan</p>
          </div>
        </div>
        <ScrollArea className="flex-1">
          <LivePreview
            answers={answers}
            selectedMulti={selectedMulti}
            draft={generatedDraft}
            bundleLabel={bundleLabel}
          />
        </ScrollArea>
        <div className="border-t border-white/5 px-4 py-3">
          <div className="mb-1.5 flex items-center justify-between text-xs text-muted-foreground">
            <span>{totalAnswered} of {totalQuestions} answered</span>
            <span>{Math.round(progress)}%</span>
          </div>
          <div className="h-1.5 overflow-hidden rounded-full bg-muted">
            <div
              className="h-full bg-gradient-to-r from-primary to-cyan-500 transition-all duration-500"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col overflow-hidden rounded-2xl border border-border/70 bg-card/95 shadow-sm">
        <div className="flex shrink-0 items-center justify-between border-b border-white/5 bg-accent/20 px-4 py-3">
          <div>
            <h2 className="text-sm font-semibold">
              {generatedDraft ? "AI Draft Ready" : "AI Workspace Assistant"}
            </h2>
            <p className="text-xs text-muted-foreground">
              {stage === 1 ? "Core questions" : "Detailed questions"} · Step {Math.min(currentIndex + 1, currentQuestions.length)} of {currentQuestions.length}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1.5 lg:hidden">
              <div className="h-1.5 w-20 overflow-hidden rounded-full bg-muted">
                <div
                  className="h-full bg-gradient-to-r from-primary to-cyan-500 transition-all"
                  style={{ width: `${progress}%` }}
                />
              </div>
              <span className="text-[10px] text-muted-foreground">{Math.round(progress)}%</span>
            </div>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-muted-foreground hover:text-foreground"
              onClick={handleReset}
              title="Reset"
            >
              <RefreshCw className="h-4 w-4" />
            </Button>
          </div>
        </div>

        <GrokChatContainer className="flex-1 min-h-0">
          {messages.map((message) =>
            message.role === "ai"
              ? <AiBubble key={message.id} text={message.text} />
              : <UserBubble key={message.id} text={message.text} />,
          )}
          {(isTyping || isGenerating || isCreating) ? <GrokTypingIndicator /> : null}

          {generationError ? (
            <div className="rounded-2xl border border-destructive/20 bg-destructive/5 p-4 text-xs text-destructive">
              {generationError}
            </div>
          ) : null}

          {generatedDraft ? (
            <div className="space-y-3 rounded-2xl border border-primary/20 bg-primary/5 p-4">
              <div className="flex items-center gap-2 font-medium text-primary">
                <Check className="h-5 w-5" />
                {generatedDraft.name}
              </div>
              <p className="text-xs leading-relaxed text-muted-foreground">
                {generatedDraft.description || "The AI draft is ready for creation."}
              </p>
              <div className="flex flex-wrap gap-1.5">
                {generatedDraft.enabledFeatures.slice(0, 8).map((featureId) => (
                  <span key={featureId} className="rounded-full border border-primary/20 bg-background/80 px-2 py-1 text-[11px] text-muted-foreground">
                    {featureLookup.get(featureId)?.name ?? featureId}
                  </span>
                ))}
              </div>
              {commitDraft ? (
                <Button
                  size="sm"
                  className="w-full gap-2"
                  onClick={handleCommitDraft}
                  disabled={isCreating}
                >
                  <ArrowRight className="h-4 w-4" />
                  {isCreating ? "Creating..." : buttonLabel}
                </Button>
              ) : null}
              {created ? (
                <div className="text-xs text-emerald-600">
                  Workspace created successfully.
                </div>
              ) : null}
            </div>
          ) : null}
        </GrokChatContainer>

        {!generatedDraft && !created ? (
          <div className="shrink-0 space-y-2.5 border-t border-white/5 bg-background/80 p-3">
            {isStage1Done && stage === 1 ? (
              <div className="flex flex-col gap-2 sm:flex-row">
                <Button
                  variant="outline"
                  className="flex-1 gap-2 text-sm"
                  onClick={handleProceedStage2}
                  disabled={isGenerating}
                >
                  <LayoutList className="h-4 w-4 shrink-0" />
                  Continue with 5 more questions
                </Button>
                <Button
                  className="flex-1 gap-2 text-sm"
                  onClick={handleFinishEarly}
                  disabled={isGenerating}
                >
                  <Sparkles className="h-4 w-4 shrink-0" />
                  {isGenerating ? "Generating..." : "Generate workspace now"}
                </Button>
              </div>
            ) : (
              <>
                {q?.presets?.length ? (
                  <ScrollArea
                    className="w-full whitespace-nowrap"
                    data-testid="ai-onboarding-presets-scroll"
                  >
                    <div
                      className="flex w-max gap-1.5 pb-2 pr-3 [touch-action:pan-x]"
                      data-testid="ai-onboarding-presets-row"
                    >
                      {q.presets.map((preset) => {
                        const isSelected = q.multi ? selectedMulti.includes(preset) : inputValue === preset
                        return (
                          <button
                            key={preset}
                            type="button"
                            onClick={() => q.multi ? handleToggleMulti(preset) : setInputValue(preset)}
                            className={cn(
                              "shrink-0 whitespace-nowrap rounded-full border px-3 py-1.5 text-xs transition-colors",
                              isSelected
                                ? "border-primary bg-primary/20 text-primary"
                                : "border-border bg-accent/50 text-muted-foreground hover:bg-accent",
                            )}
                          >
                            {preset}
                          </button>
                        )
                      })}
                    </div>
                    <ScrollBar
                      orientation="horizontal"
                      data-testid="ai-onboarding-presets-scrollbar"
                    />
                  </ScrollArea>
                ) : null}

                <div className="relative flex items-end gap-2">
                  <div className="relative flex-1 rounded-xl border border-input bg-secondary/50 transition-all focus-within:border-primary/60 focus-within:ring-2 focus-within:ring-primary/20">
                    <textarea
                      ref={textareaRef}
                      value={inputValue}
                      onChange={(event) => setInputValue(event.target.value)}
                      onKeyDown={handleKeyDown}
                      placeholder={q?.placeholder || "Type your answer..."}
                      className="min-h-[42px] max-h-[120px] w-full resize-none bg-transparent px-4 py-3 text-sm outline-none placeholder:text-muted-foreground"
                      rows={1}
                    />
                  </div>
                  <Button
                    size="icon"
                    className="h-[42px] w-[42px] shrink-0 rounded-xl"
                    onClick={() => submitAnswer()}
                    disabled={isGenerating || (!inputValue.trim() && selectedMulti.length === 0)}
                    aria-label="Send answer"
                  >
                    <Send className="h-4 w-4" />
                  </Button>
                </div>

                <div className="flex items-center justify-between px-1">
                  <span className="text-[10px] text-muted-foreground">
                    <kbd className="rounded border bg-muted px-1 font-sans">Enter</kbd> to send
                  </span>
                  <button
                    type="button"
                    onClick={() => submitAnswer("Skip")}
                    className="text-[11px] text-muted-foreground transition-colors hover:text-foreground hover:underline"
                  >
                    Skip
                  </button>
                </div>
              </>
            )}
          </div>
        ) : null}
      </div>
    </div>
  )
}
