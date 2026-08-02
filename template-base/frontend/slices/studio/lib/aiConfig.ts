"use client";

import { getProviderModels, type AIApiKeyConfig, type AISettingsSchema } from "@/frontend/shared/ai/settings";

export interface ResolvedStudioAIConfig {
  enabled: boolean;
  provider: string;
  model: string;
  apiKey: string;
  baseUrl?: string;
  maxTokens: number;
  source: "features-ai";
}

export function resolveStudioAIConfig(settings: AISettingsSchema): ResolvedStudioAIConfig {
  const providerRaw = settings.defaultProvider || "openrouter";
  const provider = providerRaw === "z-ai" ? "glm" : providerRaw;
  const availableModels = getProviderModels(provider);
  const configuredModel = settings.defaultModel || availableModels[0]?.id || "google/gemini-2.5-flash";

  const model =
    availableModels.length > 0 && !availableModels.some((candidate) => candidate.id === configuredModel)
      ? availableModels[0].id
      : configuredModel;

  const apiKeyConfig =
    settings.apiKeys?.find((candidate: AIApiKeyConfig) => candidate.providerId === provider && candidate.isEnabled) ||
    settings.apiKeys?.find(
      (candidate: AIApiKeyConfig) => candidate.providerId === (provider === "glm" ? "z-ai" : provider) && candidate.isEnabled
    );

  return {
    enabled: settings.aiEnabled,
    provider,
    model,
    apiKey: apiKeyConfig?.apiKey || "",
    baseUrl: apiKeyConfig?.baseUrl,
    maxTokens: Number(settings.maxTokens || "2048"),
    source: "features-ai",
  };
}
