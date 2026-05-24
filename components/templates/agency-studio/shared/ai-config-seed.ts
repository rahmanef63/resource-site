import type { AiConfig, AiTone } from "./types";

export const AI_MODELS = [
  { id: "claude-opus-4-7", label: "Claude Opus 4.7", vendor: "Anthropic" },
  { id: "claude-sonnet-4-7", label: "Claude Sonnet 4.7", vendor: "Anthropic" },
  { id: "gpt-4o", label: "GPT-4o", vendor: "OpenAI" },
  { id: "gpt-4o-mini", label: "GPT-4o mini", vendor: "OpenAI" },
  { id: "mistral-large", label: "Mistral Large 2", vendor: "Mistral" },
] as const;

export const AI_TONES: { value: AiTone; label: string; hint: string }[] = [
  { value: "Executive",   label: "Executive",   hint: "Ringkas, KPI-first, untuk audiens C-level." },
  { value: "Friendly",    label: "Friendly",    hint: "Hangat, second-person, cocok untuk newsletter." },
  { value: "Concise",     label: "Concise",     hint: "Fragment-OK, satu ide per kalimat." },
  { value: "Storyteller", label: "Storyteller", hint: "Naratif, ada hook + tiga babak + closing." },
  { value: "Field-notes", label: "Field-notes", hint: "Kalem, voice studio principal, anti-jargon." },
];

export const DEFAULT_AI_CONFIG: AiConfig = {
  model: "claude-sonnet-4-7",
  tone: "Field-notes",
  temperature: 0.55,
  systemPrompt: `You are the editorial assistant for an Indonesian B2B design studio. Voice: studio principal — observational, no jargon, mixes ID + EN naturally. Always frame advice as trade-offs (not best practices). When drafting client-facing copy: lead with the outcome, end with one open question. Reject hype, marketing fluff, em-dash overuse.`,
  playgroundDraft: "Tulis hook untuk artikel: 'Brand system adalah kontrak operasional, bukan deck.'",
  playgroundResponse: "",
};
