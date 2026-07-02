"use client"

import React, { useState, useRef, useEffect } from "react"
import {
  Sparkles,
  Send,
  Image as ImageIcon,
  Video,
  Music,
  Loader2,
  Bot,
  User,
  ChevronDown,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible"
import { subAgentRegistry } from "@/frontend/shared/ai/agent/registry"
import type { AiSource } from "../hooks/useContentLibrary"

interface Message {
  id: string
  role: "user" | "assistant"
  content: string
  timestamp: number
  generationType?: "image" | "video" | "audio"
  generationSource?: AiSource
  status?: "pending" | "generating" | "completed" | "failed"
}

interface ContentAIChatProps {
  onGenerate: (params: {
    source: AiSource
    prompt: string
    type: "image" | "video" | "audio"
  }) => Promise<void>
  isGenerating?: boolean
}

const aiSources: {
  type: "image" | "video" | "audio"
  sources: { value: AiSource; label: string; description: string }[]
}[] = [
  {
    type: "image",
    sources: [
      { value: "nano-banana", label: "Nano Banana", description: "Fast, creative image generation" },
      { value: "openai-dalle", label: "DALL-E", description: "OpenAI's image model" },
      { value: "midjourney", label: "Midjourney", description: "Artistic image generation" },
      { value: "stable-diffusion", label: "Stable Diffusion", description: "Open-source image model" },
    ],
  },
  {
    type: "video",
    sources: [
      { value: "veo", label: "Veo", description: "Google's video generation" },
    ],
  },
  {
    type: "audio",
    sources: [
      { value: "eleven-labs", label: "ElevenLabs", description: "Voice synthesis" },
    ],
  },
]

export function ContentAIChat({ onGenerate, isGenerating = false }: ContentAIChatProps) {
  // SSOT — quick prompts come from the content agent's SubAgent.suggestions.
  // Registered at frontend/slices/content/agent/index.ts.
  const quickPrompts = React.useMemo(
    () => subAgentRegistry.getSuggestions("content").map((s) => s.prompt),
    [],
  )
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "welcome",
      role: "assistant",
      content: "Hi! I can help you generate content using AI. Choose a type and describe what you need.",
      timestamp: Date.now(),
    },
  ])
  const [input, setInput] = useState("")
  const [generationType, setGenerationType] = useState<"image" | "video" | "audio">("image")
  const [selectedSource, setSelectedSource] = useState<AiSource>("nano-banana")
  const [showQuickPrompts, setShowQuickPrompts] = useState(true)
  const scrollRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLTextAreaElement>(null)

  // Auto-scroll to bottom on new messages
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [messages])

  // Update source when type changes
  useEffect(() => {
    const sourcesForType = aiSources.find((s) => s.type === generationType)
    if (sourcesForType && sourcesForType.sources.length > 0) {
      setSelectedSource(sourcesForType.sources[0].value)
    }
  }, [generationType])

  const handleSend = async () => {
    if (!input.trim() || isGenerating) return

    const userMessage: Message = {
      id: `user-${Date.now()}`,
      role: "user",
      content: input,
      timestamp: Date.now(),
      generationType,
      generationSource: selectedSource,
    }

    const assistantMessage: Message = {
      id: `assistant-${Date.now()}`,
      role: "assistant",
      content: `Generating ${generationType} using ${selectedSource}...`,
      timestamp: Date.now(),
      status: "generating",
    }

    setMessages((prev) => [...prev, userMessage, assistantMessage])
    setInput("")
    setShowQuickPrompts(false)

    try {
      await onGenerate({
        source: selectedSource,
        prompt: input,
        type: generationType,
      })

      setMessages((prev) =>
        prev.map((m) =>
          m.id === assistantMessage.id
            ? {
                ...m,
                content: `✅ Successfully created ${generationType} request! Check the "AI Jobs" section for progress.`,
                status: "completed",
              }
            : m
        )
      )
    } catch (error) {
      setMessages((prev) =>
        prev.map((m) =>
          m.id === assistantMessage.id
            ? {
                ...m,
                content: `❌ Failed to generate: ${error instanceof Error ? error.message : "Unknown error"}`,
                status: "failed",
              }
            : m
        )
      )
    }
  }

  const handleQuickPrompt = (prompt: string) => {
    setInput(prompt)
    inputRef.current?.focus()
  }

  const currentSources = aiSources.find((s) => s.type === generationType)?.sources || []

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex-shrink-0 p-4 border-b">
        <div className="flex items-center gap-2 mb-3">
          <Sparkles className="h-5 w-5 text-purple-500" />
          <h3 className="font-medium">AI Content Generator</h3>
        </div>

        {/* Generation Type Selection */}
        <div className="flex gap-2 mb-3">
          <Button
            variant={generationType === "image" ? "default" : "outline"}
            size="sm"
            className="flex-1"
            onClick={() => setGenerationType("image")}
          >
            <ImageIcon className="h-4 w-4 mr-1" />
            Image
          </Button>
          <Button
            variant={generationType === "video" ? "default" : "outline"}
            size="sm"
            className="flex-1"
            onClick={() => setGenerationType("video")}
          >
            <Video className="h-4 w-4 mr-1" />
            Video
          </Button>
          <Button
            variant={generationType === "audio" ? "default" : "outline"}
            size="sm"
            className="flex-1"
            onClick={() => setGenerationType("audio")}
          >
            <Music className="h-4 w-4 mr-1" />
            Audio
          </Button>
        </div>

        {/* Source Selection */}
        <Select value={selectedSource} onValueChange={(v) => setSelectedSource(v as AiSource)}>
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Select AI source" />
          </SelectTrigger>
          <SelectContent>
            {currentSources.map((source) => (
              <SelectItem key={source.value} value={source.value}>
                <div>
                  <div className="font-medium">{source.label}</div>
                  <div className="text-xs text-muted-foreground">{source.description}</div>
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Messages */}
      <ScrollArea className="flex-1" ref={scrollRef}>
        <div className="p-4 space-y-4">
          {messages.map((message) => (
            <div
              key={message.id}
              className={cn(
                "flex gap-3",
                message.role === "user" ? "flex-row-reverse" : "flex-row"
              )}
            >
              <div
                className={cn(
                  "h-8 w-8 rounded-full flex items-center justify-center flex-shrink-0",
                  message.role === "user"
                    ? "bg-primary text-primary-foreground"
                    : "bg-purple-500/10 text-purple-500"
                )}
              >
                {message.role === "user" ? (
                  <User className="h-4 w-4" />
                ) : (
                  <Bot className="h-4 w-4" />
                )}
              </div>
              <div
                className={cn(
                  "rounded-lg px-3 py-2 max-w-[80%]",
                  message.role === "user"
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted"
                )}
              >
                <p className="text-sm">{message.content}</p>
                {message.status === "generating" && (
                  <div className="flex items-center gap-2 mt-2">
                    <Loader2 className="h-3 w-3 animate-spin" />
                    <span className="text-xs">Processing...</span>
                  </div>
                )}
                {message.generationType && message.role === "user" && (
                  <div className="flex gap-1 mt-2">
                    <Badge variant="secondary" className="text-xs capitalize">
                      {message.generationType}
                    </Badge>
                    <Badge variant="outline" className="text-xs">
                      {message.generationSource}
                    </Badge>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </ScrollArea>

      {/* Quick Prompts */}
      {showQuickPrompts && (
        <Collapsible open={showQuickPrompts} onOpenChange={setShowQuickPrompts}>
          <div className="px-4 py-2 border-t">
            <CollapsibleTrigger asChild>
              <Button variant="ghost" size="sm" className="w-full justify-between text-xs">
                Quick prompts
                <ChevronDown className="h-3 w-3" />
              </Button>
            </CollapsibleTrigger>
            <CollapsibleContent className="mt-2 space-y-1">
              {quickPrompts.map((prompt, i) => (
                <Button
                  key={i}
                  variant="outline"
                  size="sm"
                  className="w-full justify-start text-xs h-auto py-2 whitespace-normal text-left"
                  onClick={() => handleQuickPrompt(prompt)}
                >
                  {prompt}
                </Button>
              ))}
            </CollapsibleContent>
          </div>
        </Collapsible>
      )}

      {/* Input */}
      <div className="flex-shrink-0 p-4 border-t">
        <div className="flex gap-2">
          <Textarea
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={`Describe the ${generationType} you want to generate...`}
            className="min-h-[60px] resize-none"
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault()
                handleSend()
              }
            }}
          />
          <Button aria-label="Send"
            onClick={handleSend}
            disabled={!input.trim() || isGenerating}
            className="h-auto"
          >
            {isGenerating ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Send className="h-4 w-4" />
            )}
          </Button>
        </div>
      </div>
    </div>
  )
}
