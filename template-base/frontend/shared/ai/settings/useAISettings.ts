"use client"

/**
 * AI Settings Hook
 * Provides persistent storage for AI feature settings
 */

import { createFeatureSettingsHook } from "@/frontend/shared/settings/hooks/useSettingsStorage"

/**
 * AI Provider Configuration
 * Defines available AI providers with their SDK info and models
 */
export interface AIProviderConfig {
  id: string
  name: string
  description: string
  website: string
  docsUrl: string
  sdkPackage: string
  tier: "premium" | "opensource" | "enterprise"
  models: {
    id: string
    name: string
    description: string
    contextWindow: number
    maxOutput: number
  }[]
}

/**
 * Top-tier and open-source AI providers
 */
export const AI_PROVIDERS: AIProviderConfig[] = [
  // Premium/Enterprise Providers
  {
    id: "openai",
    name: "OpenAI",
    description: "GPT-4, GPT-4 Turbo, GPT-3.5 Turbo, and DALL-E models",
    website: "https://openai.com",
    docsUrl: "https://platform.openai.com/docs",
    sdkPackage: "openai",
    tier: "premium",
    models: [
      { id: "gpt-4o", name: "GPT-4o", description: "Most capable multimodal model", contextWindow: 128000, maxOutput: 16384 },
      { id: "gpt-4o-mini", name: "GPT-4o Mini", description: "Fast and affordable", contextWindow: 128000, maxOutput: 16384 },
      { id: "gpt-4-turbo", name: "GPT-4 Turbo", description: "Latest GPT-4 with vision", contextWindow: 128000, maxOutput: 4096 },
      { id: "gpt-4", name: "GPT-4", description: "Most capable GPT-4 model", contextWindow: 8192, maxOutput: 8192 },
      { id: "gpt-3.5-turbo", name: "GPT-3.5 Turbo", description: "Fast and cost-effective", contextWindow: 16385, maxOutput: 4096 },
      { id: "o1-preview", name: "o1 Preview", description: "Advanced reasoning model", contextWindow: 128000, maxOutput: 32768 },
      { id: "o1-mini", name: "o1 Mini", description: "Fast reasoning model", contextWindow: 128000, maxOutput: 65536 },
    ],
  },
  {
    id: "anthropic",
    name: "Anthropic",
    description: "Claude 3.5, Claude 3 family - safe and capable AI",
    website: "https://anthropic.com",
    docsUrl: "https://docs.anthropic.com",
    sdkPackage: "@anthropic-ai/sdk",
    tier: "premium",
    models: [
      { id: "claude-3-5-sonnet-20241022", name: "Claude 3.5 Sonnet", description: "Best balance of speed and intelligence", contextWindow: 200000, maxOutput: 8192 },
      { id: "claude-3-5-haiku-20241022", name: "Claude 3.5 Haiku", description: "Fastest Claude model", contextWindow: 200000, maxOutput: 8192 },
      { id: "claude-3-opus-20240229", name: "Claude 3 Opus", description: "Most powerful Claude model", contextWindow: 200000, maxOutput: 4096 },
      { id: "claude-3-sonnet-20240229", name: "Claude 3 Sonnet", description: "Balanced performance", contextWindow: 200000, maxOutput: 4096 },
      { id: "claude-3-haiku-20240307", name: "Claude 3 Haiku", description: "Fast and lightweight", contextWindow: 200000, maxOutput: 4096 },
    ],
  },
  {
    id: "google",
    name: "Google AI",
    description: "Gemini Pro, Gemini Ultra, PaLM 2 models",
    website: "https://ai.google.dev",
    docsUrl: "https://ai.google.dev/docs",
    sdkPackage: "@google/generative-ai",
    tier: "premium",
    models: [
      { id: "gemini-2.0-flash-exp", name: "Gemini 2.0 Flash", description: "Latest experimental model", contextWindow: 1000000, maxOutput: 8192 },
      { id: "gemini-1.5-pro", name: "Gemini 1.5 Pro", description: "Best for complex tasks", contextWindow: 2000000, maxOutput: 8192 },
      { id: "gemini-1.5-flash", name: "Gemini 1.5 Flash", description: "Fast multimodal model", contextWindow: 1000000, maxOutput: 8192 },
      { id: "gemini-1.0-pro", name: "Gemini 1.0 Pro", description: "Balanced performance", contextWindow: 32760, maxOutput: 8192 },
    ],
  },
  {
    id: "mistral",
    name: "Mistral AI",
    description: "European AI with open and commercial models",
    website: "https://mistral.ai",
    docsUrl: "https://docs.mistral.ai",
    sdkPackage: "@mistralai/mistralai",
    tier: "premium",
    models: [
      { id: "mistral-large-latest", name: "Mistral Large", description: "Flagship model for complex tasks", contextWindow: 128000, maxOutput: 8192 },
      { id: "mistral-medium-latest", name: "Mistral Medium", description: "Balanced performance", contextWindow: 32000, maxOutput: 8192 },
      { id: "mistral-small-latest", name: "Mistral Small", description: "Fast and efficient", contextWindow: 32000, maxOutput: 8192 },
      { id: "codestral-latest", name: "Codestral", description: "Optimized for code", contextWindow: 32000, maxOutput: 8192 },
      { id: "open-mixtral-8x22b", name: "Mixtral 8x22B", description: "Open-weight MoE model", contextWindow: 65536, maxOutput: 8192 },
    ],
  },
  {
    id: "cohere",
    name: "Cohere",
    description: "Enterprise-ready language AI with Command models",
    website: "https://cohere.com",
    docsUrl: "https://docs.cohere.com",
    sdkPackage: "cohere-ai",
    tier: "enterprise",
    models: [
      { id: "command-r-plus", name: "Command R+", description: "Most powerful for RAG", contextWindow: 128000, maxOutput: 4096 },
      { id: "command-r", name: "Command R", description: "Balanced RAG model", contextWindow: 128000, maxOutput: 4096 },
      { id: "command", name: "Command", description: "General-purpose model", contextWindow: 4096, maxOutput: 4096 },
      { id: "command-light", name: "Command Light", description: "Fast and efficient", contextWindow: 4096, maxOutput: 4096 },
    ],
  },
  {
    id: "xai",
    name: "xAI",
    description: "Grok models from xAI",
    website: "https://x.ai",
    docsUrl: "https://docs.x.ai",
    sdkPackage: "openai", // Uses OpenAI-compatible API
    tier: "premium",
    models: [
      { id: "grok-beta", name: "Grok Beta", description: "Latest Grok model", contextWindow: 131072, maxOutput: 4096 },
      { id: "grok-vision-beta", name: "Grok Vision", description: "Multimodal Grok", contextWindow: 8192, maxOutput: 4096 },
    ],
  },
  // Open-source Providers
  {
    id: "groq",
    name: "Groq",
    description: "Ultra-fast inference for open models (Llama, Mixtral)",
    website: "https://groq.com",
    docsUrl: "https://console.groq.com/docs",
    sdkPackage: "groq-sdk",
    tier: "opensource",
    models: [
      { id: "llama-3.3-70b-versatile", name: "Llama 3.3 70B", description: "Latest Llama model", contextWindow: 128000, maxOutput: 32768 },
      { id: "llama-3.1-70b-versatile", name: "Llama 3.1 70B", description: "Powerful open model", contextWindow: 128000, maxOutput: 8000 },
      { id: "llama-3.1-8b-instant", name: "Llama 3.1 8B", description: "Fast and efficient", contextWindow: 128000, maxOutput: 8000 },
      { id: "mixtral-8x7b-32768", name: "Mixtral 8x7B", description: "Open MoE model", contextWindow: 32768, maxOutput: 8000 },
      { id: "gemma2-9b-it", name: "Gemma 2 9B", description: "Google's open model", contextWindow: 8192, maxOutput: 8000 },
    ],
  },
  {
    id: "together",
    name: "Together AI",
    description: "Open-source model hosting and fine-tuning",
    website: "https://together.ai",
    docsUrl: "https://docs.together.ai",
    sdkPackage: "together-ai",
    tier: "opensource",
    models: [
      { id: "meta-llama/Llama-3.2-90B-Vision-Instruct-Turbo", name: "Llama 3.2 90B Vision", description: "Multimodal Llama", contextWindow: 128000, maxOutput: 4096 },
      { id: "meta-llama/Meta-Llama-3.1-405B-Instruct-Turbo", name: "Llama 3.1 405B", description: "Largest open model", contextWindow: 128000, maxOutput: 4096 },
      { id: "meta-llama/Meta-Llama-3.1-70B-Instruct-Turbo", name: "Llama 3.1 70B", description: "Fast 70B model", contextWindow: 128000, maxOutput: 4096 },
      { id: "Qwen/Qwen2.5-72B-Instruct-Turbo", name: "Qwen 2.5 72B", description: "Alibaba's best model", contextWindow: 32768, maxOutput: 4096 },
      { id: "deepseek-ai/DeepSeek-V3", name: "DeepSeek V3", description: "Powerful reasoning model", contextWindow: 65536, maxOutput: 8192 },
    ],
  },
  {
    id: "fireworks",
    name: "Fireworks AI",
    description: "Fast inference for open-source models",
    website: "https://fireworks.ai",
    docsUrl: "https://docs.fireworks.ai",
    sdkPackage: "openai", // Uses OpenAI-compatible API
    tier: "opensource",
    models: [
      { id: "accounts/fireworks/models/llama-v3p1-405b-instruct", name: "Llama 3.1 405B", description: "Largest Llama model", contextWindow: 131072, maxOutput: 16384 },
      { id: "accounts/fireworks/models/llama-v3p1-70b-instruct", name: "Llama 3.1 70B", description: "Balanced performance", contextWindow: 131072, maxOutput: 16384 },
      { id: "accounts/fireworks/models/mixtral-8x22b-instruct", name: "Mixtral 8x22B", description: "Large MoE model", contextWindow: 65536, maxOutput: 16384 },
      { id: "accounts/fireworks/models/qwen2p5-72b-instruct", name: "Qwen 2.5 72B", description: "Alibaba's top model", contextWindow: 32768, maxOutput: 16384 },
    ],
  },
  {
    id: "perplexity",
    name: "Perplexity",
    description: "AI search with real-time web access",
    website: "https://perplexity.ai",
    docsUrl: "https://docs.perplexity.ai",
    sdkPackage: "openai", // Uses OpenAI-compatible API
    tier: "premium",
    models: [
      { id: "llama-3.1-sonar-huge-128k-online", name: "Sonar Huge", description: "Most capable with web search", contextWindow: 128000, maxOutput: 4096 },
      { id: "llama-3.1-sonar-large-128k-online", name: "Sonar Large", description: "Balanced with web search", contextWindow: 128000, maxOutput: 4096 },
      { id: "llama-3.1-sonar-small-128k-online", name: "Sonar Small", description: "Fast with web search", contextWindow: 128000, maxOutput: 4096 },
    ],
  },
  {
    id: "deepseek",
    name: "DeepSeek",
    description: "Advanced reasoning and code models from China",
    website: "https://deepseek.com",
    docsUrl: "https://platform.deepseek.com/docs",
    sdkPackage: "openai", // Uses OpenAI-compatible API
    tier: "opensource",
    models: [
      { id: "deepseek-chat", name: "DeepSeek Chat", description: "General-purpose chat model", contextWindow: 65536, maxOutput: 8192 },
      { id: "deepseek-coder", name: "DeepSeek Coder", description: "Optimized for coding", contextWindow: 65536, maxOutput: 8192 },
      { id: "deepseek-reasoner", name: "DeepSeek Reasoner", description: "Advanced reasoning (R1)", contextWindow: 65536, maxOutput: 8192 },
    ],
  },
  {
    id: "glm",
    name: "Z.AI (GLM)",
    description: "GLM models via Z.AI HTTP API",
    website: "https://z.ai",
    docsUrl: "https://docs.z.ai/guides/develop/http/introduction",
    sdkPackage: "zai-sdk (Python) / ai.z.openapi:zai-sdk (Java) / OpenAI-compatible HTTP",
    tier: "opensource",
    models: [
      { id: "glm-4.6", name: "GLM-4.6", description: "Latest GLM model", contextWindow: 200000, maxOutput: 128000 },
      { id: "glm-4", name: "GLM-4", description: "Latest generation GLM model", contextWindow: 128000, maxOutput: 8192 },
      { id: "glm-4v", name: "GLM-4V", description: "Multimodal GLM with vision capabilities", contextWindow: 8192, maxOutput: 4096 },
      { id: "glm-3-turbo", name: "GLM-3 Turbo", description: "Fast and efficient GLM model", contextWindow: 128000, maxOutput: 4096 },
      { id: "glm-4-flash", name: "GLM-4 Flash", description: "Lightweight GLM for quick responses", contextWindow: 32768, maxOutput: 2048 },
      { id: "glm-4-long", name: "GLM-4 Long", description: "Extended context GLM model", contextWindow: 1000000, maxOutput: 16384 },
    ],
  },
  {
    id: "openrouter",
    name: "OpenRouter",
    description: "Access 100+ AI models from one API - Claude, GPT-4, Gemini, Llama, etc.",
    website: "https://openrouter.ai",
    docsUrl: "https://openrouter.ai/docs",
    sdkPackage: "openai", // Uses OpenAI-compatible API
    tier: "premium",
    models: [
      // Anthropic Models
      { id: "anthropic/claude-3.5-sonnet", name: "Claude 3.5 Sonnet", description: "Best balance of speed and intelligence", contextWindow: 200000, maxOutput: 8192 },
      { id: "anthropic/claude-3.5-haiku", name: "Claude 3.5 Haiku", description: "Fastest Claude model", contextWindow: 200000, maxOutput: 8192 },
      { id: "anthropic/claude-3-opus", name: "Claude 3 Opus", description: "Most powerful Claude", contextWindow: 200000, maxOutput: 4096 },
      // OpenAI Models
      { id: "openai/gpt-4o", name: "GPT-4o", description: "Most capable multimodal", contextWindow: 128000, maxOutput: 16384 },
      { id: "openai/gpt-4o-mini", name: "GPT-4o Mini", description: "Fast and affordable", contextWindow: 128000, maxOutput: 16384 },
      { id: "openai/o1-preview", name: "o1 Preview", description: "Advanced reasoning", contextWindow: 128000, maxOutput: 32768 },
      { id: "openai/o1-mini", name: "o1 Mini", description: "Fast reasoning", contextWindow: 128000, maxOutput: 65536 },
      // Google Models
      { id: "google/gemini-2.0-flash-exp:free", name: "Gemini 2.0 Flash (Free)", description: "Latest free Gemini", contextWindow: 1000000, maxOutput: 8192 },
      { id: "google/gemini-pro-1.5", name: "Gemini 1.5 Pro", description: "Best for complex tasks", contextWindow: 2000000, maxOutput: 8192 },
      // Meta Llama Models
      { id: "meta-llama/llama-3.3-70b-instruct", name: "Llama 3.3 70B", description: "Latest powerful Llama", contextWindow: 128000, maxOutput: 4096 },
      { id: "meta-llama/llama-3.1-405b-instruct", name: "Llama 3.1 405B", description: "Largest open model", contextWindow: 128000, maxOutput: 4096 },
      // DeepSeek Models
      { id: "deepseek/deepseek-chat", name: "DeepSeek V3", description: "Powerful reasoning model", contextWindow: 65536, maxOutput: 8192 },
      { id: "deepseek/deepseek-r1", name: "DeepSeek R1", description: "Best reasoning model", contextWindow: 65536, maxOutput: 8192 },
      // Qwen Models
      { id: "qwen/qwen-2.5-72b-instruct", name: "Qwen 2.5 72B", description: "Alibaba's best", contextWindow: 32768, maxOutput: 8192 },
      { id: "qwen/qwen-2.5-coder-32b-instruct", name: "Qwen 2.5 Coder 32B", description: "Best open-source coder", contextWindow: 32768, maxOutput: 8192 },
      // Mistral Models
      { id: "mistralai/mistral-large-2411", name: "Mistral Large", description: "Latest flagship", contextWindow: 128000, maxOutput: 8192 },
      { id: "mistralai/codestral-2501", name: "Codestral", description: "Best for coding", contextWindow: 256000, maxOutput: 8192 },
      // Featured Models (curated)
      { id: "openai/gpt-5-nano", name: "GPT-5 Nano (OpenAI)", description: "Fast nano model from OpenAI via OpenRouter", contextWindow: 128000, maxOutput: 8192 },
      { id: "z-ai/glm-5", name: "GLM-5 (Z.AI)", description: "Latest GLM model via OpenRouter", contextWindow: 128000, maxOutput: 8192 },
      { id: "google/gemini-2.5-flash", name: "Gemini 2.5 Flash (Google)", description: "Google's fast 2.5 model via OpenRouter", contextWindow: 1000000, maxOutput: 8192 },
      { id: "moonshotai/kimi-k2.5", name: "Kimi K2.5 (Moonshot)", description: "Moonshot Kimi K2.5 via OpenRouter", contextWindow: 128000, maxOutput: 8192 },
      // Free Models
      { id: "nousresearch/hermes-3-llama-3.1-405b:free", name: "Hermes 3 405B (Free)", description: "Free powerful model", contextWindow: 16000, maxOutput: 4096 },
      { id: "microsoft/phi-4:free", name: "Phi-4 (Free)", description: "Microsoft's efficient model", contextWindow: 16000, maxOutput: 4096 },
    ],
  },
  {
    id: "ollama",
    name: "Ollama (Local)",
    description: "Run open-source models locally on your machine",
    website: "https://ollama.ai",
    docsUrl: "https://github.com/ollama/ollama/blob/main/docs/api.md",
    sdkPackage: "ollama",
    tier: "opensource",
    models: [
      { id: "llama3.2", name: "Llama 3.2", description: "Latest Llama for local", contextWindow: 128000, maxOutput: 4096 },
      { id: "qwen2.5", name: "Qwen 2.5", description: "Powerful local model", contextWindow: 32768, maxOutput: 4096 },
      { id: "mistral", name: "Mistral 7B", description: "Fast local model", contextWindow: 32768, maxOutput: 4096 },
      { id: "codellama", name: "Code Llama", description: "Optimized for code", contextWindow: 16384, maxOutput: 4096 },
      { id: "phi3", name: "Phi-3", description: "Microsoft's small model", contextWindow: 4096, maxOutput: 4096 },
    ],
  },
]

/**
 * API Key configuration for each provider
 */
export interface AIApiKeyConfig {
  providerId: string
  apiKey: string
  baseUrl?: string // For custom endpoints (Ollama, Azure, etc.)
  isEnabled: boolean
  lastValidated?: string
}

/**
 * Schema for AI Settings
 */
export interface AISettingsSchema {
  // General settings
  aiEnabled: boolean
  defaultModel: string
  defaultProvider: string
  streamResponses: boolean
  saveHistory: boolean
  historyRetentionDays: "7" | "30" | "90" | "365" | "forever"

  // API Keys (stored separately for security, but referenced here)
  apiKeys: AIApiKeyConfig[]

  // Behavior settings
  temperature: number
  maxTokens: "512" | "1024" | "2048" | "4096" | "8192"
  contextWindow: boolean
  contextMessages: number
  topP: number

  // Privacy settings
  shareDataForImprovement: boolean
  anonymizeData: boolean
  localProcessingOnly: boolean

  // Personalization settings
  usePersonality: boolean
  personalityTone: "professional" | "Contactly" | "casual" | "formal"
  autoSuggest: boolean
  suggestFrequency: "always" | "sometimes" | "rarely"
  learnFromHistory: boolean
}

/**
 * Default values for AI settings
 */
export const defaultAISettings: AISettingsSchema = {
  // General settings
  aiEnabled: true,
  defaultModel: "google/gemini-2.5-flash", // OpenRouter default (env key used server-side)
  defaultProvider: "openrouter",
  streamResponses: true,
  saveHistory: true,
  historyRetentionDays: "30",

  // API Keys
  apiKeys: [],

  // Behavior settings
  temperature: 0.7,
  maxTokens: "2048",
  contextWindow: true,
  contextMessages: 10,
  topP: 1.0,

  // Privacy settings
  shareDataForImprovement: false,
  anonymizeData: true,
  localProcessingOnly: false,

  // Personalization settings
  usePersonality: true,
  personalityTone: "professional",
  autoSuggest: true,
  suggestFrequency: "sometimes",
  learnFromHistory: true,
}

/**
 * Hook for managing AI settings with persistence
 */
export const useAISettingsStorage = createFeatureSettingsHook<AISettingsSchema>(
  "ai",
  defaultAISettings
)

/**
 * Helper to get provider by ID
 */
export function getAIProvider(providerId: string): AIProviderConfig | undefined {
  const normalized = providerId === "z-ai" ? "glm" : providerId
  return AI_PROVIDERS.find((p) => p.id === normalized)
}

/**
 * Helper to get all models across all providers
 */
export function getAllAIModels() {
  return AI_PROVIDERS.flatMap((provider) =>
    provider.models.map((model) => ({
      ...model,
      providerId: provider.id,
      providerName: provider.name,
    }))
  )
}

/**
 * Helper to get models for a specific provider
 */
export function getProviderModels(providerId: string) {
  const provider = getAIProvider(providerId)
  return provider?.models || []
}
