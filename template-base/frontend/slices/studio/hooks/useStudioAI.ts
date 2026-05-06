"use client";

import { useCallback, useState } from "react";
import { useAISettingsStorage } from "@/frontend/shared/ai/settings";
import { useLLMSettings } from "@/frontend/slices/studio/settings/useLLMSettings";
import { resolveStudioAIConfig, type ResolvedStudioAIConfig } from "@/frontend/slices/studio/lib/aiConfig";

interface GenerateOptions {
  prompt: string;
  systemPrompt?: string;
  maxTokens?: number;
  overrides?: Partial<Pick<ResolvedStudioAIConfig, "provider" | "model" | "apiKey" | "baseUrl" | "maxTokens">>;
}

export function useStudioAI() {
  const { settings: sharedAISettings } = useAISettingsStorage();
  const { settings: studioSettings } = useLLMSettings();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const resolvedConfig = resolveStudioAIConfig(sharedAISettings);

  const generate = useCallback(
    async ({ prompt, systemPrompt, maxTokens, overrides }: GenerateOptions): Promise<string | null> => {
      if (!resolvedConfig.enabled) {
        setError("AI Builder is not enabled. Go to /dashboard/ai or Studio Settings → AI Builder to enable it.");
        return null;
      }

      setIsLoading(true);
      setError(null);

      const provider = overrides?.provider || resolvedConfig.provider;
      const model = overrides?.model || resolvedConfig.model;
      const apiKey = overrides?.apiKey ?? resolvedConfig.apiKey;
      const baseUrl = overrides?.baseUrl ?? resolvedConfig.baseUrl;
      const effectiveMaxTokens = overrides?.maxTokens ?? maxTokens ?? resolvedConfig.maxTokens;
      const system =
        studioSettings.systemPromptOverride ||
        systemPrompt ||
        "You are a helpful UI content generator. Return only the requested content, no explanations.";

      try {
        const res = await fetch("/api/ai/chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            provider,
            model,
            apiKey,
            baseUrl,
            maxTokens: effectiveMaxTokens,
            messages: [
              { role: "system", content: system },
              { role: "user", content: prompt },
            ],
          }),
        });

        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "AI generation failed");
        return data.content ?? null;
      } catch (err) {
        const msg = err instanceof Error ? err.message : "Unknown error";
        setError(msg);
        return null;
      } finally {
        setIsLoading(false);
      }
    },
    [resolvedConfig, studioSettings.systemPromptOverride]
  );

  return { generate, isLoading, error, isConfigured: resolvedConfig.enabled, resolvedConfig };
}
