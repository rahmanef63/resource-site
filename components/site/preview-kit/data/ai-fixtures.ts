import {
  Search, Database, Image as ImageIcon, FileText, Code2, Calculator,
  Globe, Terminal, Mail, GitBranch, Sparkles,
  type LucideIcon,
} from "lucide-react";
import type { ProviderGroup } from "../model-picker";
import type { ToolToggleItem } from "../tool-toggle-list";

/** Shared mock dataset for AI slice previews (chat + admin). DRY so
 *  ai-chat and ai-admin pages render against the same providers /
 *  models / skills / tools / agents catalog. */

export const PROVIDER_GROUPS: ProviderGroup[] = [
  {
    provider: "Anthropic",
    icon: Sparkles,
    models: [
      { id: "claude-opus-4-7", label: "Claude Opus 4.7", capabilities: ["vision", "tools", "long-context", "reasoning"], pricing: "$15 / $75" },
      { id: "claude-sonnet-4-6", label: "Claude Sonnet 4.6", capabilities: ["vision", "tools", "long-context"], pricing: "$3 / $15" },
      { id: "claude-haiku-4-5", label: "Claude Haiku 4.5", capabilities: ["vision", "tools", "fast"], pricing: "$1 / $5" },
    ],
  },
  {
    provider: "OpenAI",
    models: [
      { id: "gpt-5", label: "GPT-5", capabilities: ["vision", "tools", "reasoning"], pricing: "$10 / $40" },
      { id: "gpt-4.1-mini", label: "GPT-4.1 mini", capabilities: ["tools", "fast"], pricing: "$0.4 / $1.6" },
    ],
  },
  {
    provider: "Google",
    models: [
      { id: "gemini-2.5-pro", label: "Gemini 2.5 Pro", capabilities: ["vision", "tools", "long-context"], pricing: "$2.5 / $10" },
      { id: "gemini-2.5-flash", label: "Gemini 2.5 Flash", capabilities: ["vision", "fast"], pricing: "$0.3 / $1.2" },
    ],
  },
  {
    provider: "Local (Ollama)",
    models: [
      { id: "llama-3.3-70b", label: "Llama 3.3 70B", capabilities: ["tools", "long-context"], pricing: "self-host" },
      { id: "qwen-2.5-coder", label: "Qwen 2.5 Coder", capabilities: ["tools"], pricing: "self-host" },
    ],
  },
];

export const DEFAULT_MODEL_ID = "claude-opus-4-7";

export const TOOLS: ToolToggleItem[] = [
  { id: "web-search", name: "Web search", description: "Query the live web. Cites sources.", icon: Search },
  { id: "rag", name: "Retrieval", description: "Pull from the workspace vector index.", icon: Database },
  { id: "shell", name: "Shell exec", description: "Run sandboxed shell commands.", icon: Terminal },
  { id: "code-interp", name: "Code interpreter", description: "Sandboxed Python + JS runner.", icon: Code2 },
  { id: "image-gen", name: "Image generation", description: "Sora / DALL-E / Flux providers.", icon: ImageIcon },
  { id: "browse-pdf", name: "PDF reader", description: "OCR + layout-aware parsing.", icon: FileText },
  { id: "math", name: "Math solver", description: "Symbolic via Sympy bridge.", icon: Calculator },
  { id: "browse", name: "Browser", description: "Headless browser with DOM tools.", icon: Globe },
  { id: "mail", name: "Email send", description: "Send via Resend on user behalf.", icon: Mail },
  { id: "git", name: "Git ops", description: "Read repo + open PRs.", icon: GitBranch },
];

export type AISkill = {
  slug: string;
  name: string;
  systemPrompt: string;
  modelDefault: string;
  toolDefaults: string[];
};

export const SKILLS: AISkill[] = [
  {
    slug: "coder",
    name: "Coder",
    systemPrompt: "You are a senior engineer. Prefer working code over prose. Follow repo conventions.",
    modelDefault: "claude-opus-4-7",
    toolDefaults: ["shell", "code-interp", "git"],
  },
  {
    slug: "writer",
    name: "Writer",
    systemPrompt: "You are a precise technical writer. Short sentences. No filler.",
    modelDefault: "claude-sonnet-4-6",
    toolDefaults: ["web-search", "rag"],
  },
  {
    slug: "researcher",
    name: "Researcher",
    systemPrompt: "Investigate thoroughly. Cite every source. Flag uncertainty.",
    modelDefault: "gpt-5",
    toolDefaults: ["web-search", "rag", "browse"],
  },
  {
    slug: "translator",
    name: "Translator (ID↔EN)",
    systemPrompt: "Faithful, idiomatic translation. Preserve technical terms.",
    modelDefault: "claude-haiku-4-5",
    toolDefaults: [],
  },
];

export type AIAgent = {
  slug: string;
  name: string;
  skill: string;
  model: string;
  maxIter: number;
  status: "active" | "paused" | "draft";
};

export const AGENTS: AIAgent[] = [
  { slug: "audit-bp", name: "audit-bp", skill: "coder", model: "claude-opus-4-7", maxIter: 8, status: "active" },
  { slug: "research", name: "research", skill: "researcher", model: "gpt-5", maxIter: 12, status: "active" },
  { slug: "pr-reviewer", name: "pr-reviewer", skill: "coder", model: "claude-sonnet-4-6", maxIter: 4, status: "active" },
  { slug: "docs-writer", name: "docs-writer", skill: "writer", model: "claude-sonnet-4-6", maxIter: 3, status: "paused" },
  { slug: "i18n", name: "i18n", skill: "translator", model: "claude-haiku-4-5", maxIter: 1, status: "draft" },
];

export type AIProvider = {
  slug: string;
  name: string;
  baseUrl: string;
  status: "connected" | "error" | "missing-key";
  lastTested?: string;
};

export const PROVIDERS: AIProvider[] = [
  { slug: "anthropic", name: "Anthropic", baseUrl: "https://api.anthropic.com", status: "connected", lastTested: "2026-05-16 11:42" },
  { slug: "openai", name: "OpenAI", baseUrl: "https://api.openai.com/v1", status: "connected", lastTested: "2026-05-16 11:42" },
  { slug: "google", name: "Google AI", baseUrl: "https://generativelanguage.googleapis.com", status: "connected", lastTested: "2026-05-16 11:41" },
  { slug: "mistral", name: "Mistral", baseUrl: "https://api.mistral.ai/v1", status: "missing-key" },
  { slug: "ollama", name: "Ollama (local)", baseUrl: "http://localhost:11434", status: "error", lastTested: "2026-05-16 09:18" },
];

export type ChatThread = {
  id: string;
  title: string;
  ts: string;
  unread?: boolean;
};

export const SAMPLE_THREADS: ChatThread[] = [
  { id: "t1", title: "Debug stale TanStack cache", ts: "now" },
  { id: "t2", title: "Migrate Convex schema v3 → v4", ts: "2h ago" },
  { id: "t3", title: "Audit /layouts page", ts: "yesterday" },
  { id: "t4", title: "Slice mesh whitepaper outline", ts: "3d ago" },
  { id: "t5", title: "i18n pass — Indonesian", ts: "1w ago" },
];

export const HISTORY_LABELS = SAMPLE_THREADS.map((t) => t.title);

/** Re-export common icons used by callers so they don't need to import
 *  from lucide-react separately. */
export const AI_ICONS = {
  Search, Database, ImageIcon, FileText, Code2, Calculator, Globe, Terminal, Mail, GitBranch, Sparkles,
} satisfies Record<string, LucideIcon>;
