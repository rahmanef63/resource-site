export const AI_MODELS = {
  GPT_4: "gpt-4",
  GPT_3_5: "gpt-3.5-turbo",
  CLAUDE: "claude-3",
  LLAMA: "llama-2",
} as const

export const OPENROUTER_MODELS = [
  { id: "openai/gpt-5-nano", name: "GPT-5 Nano (OpenAI)" },
  { id: "z-ai/glm-5", name: "GLM-5 (Z.AI)" },
  { id: "google/gemini-2.5-flash", name: "Gemini 2.5 Flash (Google)" },
  { id: "moonshotai/kimi-k2.5", name: "Kimi K2.5 (Moonshot)" },
] as const

export const AI_PROVIDERS = [
  {
    id: "openrouter",
    name: "OpenRouter",
    models: OPENROUTER_MODELS.map((m) => m.id),
    isAvailable: true,
    getApiKeyUrl: "https://openrouter.ai/keys",
  },
  {
    id: "openai",
    name: "OpenAI",
    models: [AI_MODELS.GPT_4, AI_MODELS.GPT_3_5],
    isAvailable: true,
    getApiKeyUrl: "https://platform.openai.com/api-keys",
  },
  {
    id: "anthropic",
    name: "Anthropic",
    models: [AI_MODELS.CLAUDE],
    isAvailable: true,
    getApiKeyUrl: "https://console.anthropic.com/settings/keys",
  },
  {
    id: "google",
    name: "Google",
    models: ["gemini-pro"],
    isAvailable: true,
    getApiKeyUrl: "https://aistudio.google.com/app/apikey",
  },
  {
    id: "groq",
    name: "Groq",
    models: ["llama-3.3-70b-versatile", "mixtral-8x7b-32768"],
    isAvailable: true,
    getApiKeyUrl: "https://console.groq.com/keys",
  },
  {
    id: "mistral",
    name: "Mistral",
    models: ["mistral-large-latest"],
    isAvailable: true,
    getApiKeyUrl: "https://console.mistral.ai/api-keys",
  },
  {
    id: "cohere",
    name: "Cohere",
    models: ["command-r"],
    isAvailable: true,
    getApiKeyUrl: "https://dashboard.cohere.com/api-keys",
  },
  {
    id: "perplexity",
    name: "Perplexity",
    models: ["pplx-7b-online"],
    isAvailable: true,
    getApiKeyUrl: "https://www.perplexity.ai/settings/api",
  },
]

export const DEFAULT_PROVIDER = "openrouter"
export const DEFAULT_MODEL_ID = "google/gemini-2.5-flash"

export const DEFAULT_AI_SETTINGS = {
  model: DEFAULT_MODEL_ID,
  temperature: 0.7,
  maxTokens: 2048,
  systemPrompt: "You are a helpful AI assistant.",
}

export const MESSAGE_TYPES = {
  TEXT: "text",
  IMAGE: "image",
  FILE: "file",
} as const

export const AI_TOPICS = [
  "General",
  "Programming",
  "Cooking",
  "Travel",
  "Fitness",
  "Education",
  "Business",
  "Creative",
] as const

export const DEFAULT_SUGGESTIONS = [
  "Explain how this codebase is structured",
  "What are the main features of this project?",
  "Help me write a function that...",
  "Debug this error...",
]

export const MAX_MESSAGE_LENGTH = 4000
export const MAX_CONVERSATIONS = 100
export const AUTO_SAVE_DELAY = 1000
