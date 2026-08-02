"use client";

import { useState, useEffect, useCallback } from "react";

const STORAGE_KEY = "studio-llm-settings-v2";

export type LLMProvider = "openrouter" | "anthropic" | "openai";

export interface LLMSettingsSchema {
    enabled: boolean;
    provider: LLMProvider;
    model: string;
    apiKey: string;
    customModel: string;
    maxTokens: number;
    systemPromptOverride: string;
}

export const DEFAULT_LLM_SETTINGS: LLMSettingsSchema = {
    enabled: true,
    provider: "openrouter",
    model: "google/gemini-2.5-flash",
    apiKey: "",
    customModel: "",
    maxTokens: 2048,
    systemPromptOverride: "",
};

function load(): LLMSettingsSchema {
    if (typeof window === "undefined") return DEFAULT_LLM_SETTINGS;
    try {
        const raw = localStorage.getItem(STORAGE_KEY);
        if (!raw) return DEFAULT_LLM_SETTINGS;
        return { ...DEFAULT_LLM_SETTINGS, ...JSON.parse(raw) };
    } catch {
        return DEFAULT_LLM_SETTINGS;
    }
}

function save(settings: LLMSettingsSchema) {
    if (typeof window === "undefined") return;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
}

export function useLLMSettings() {
    const [settings, setSettings] = useState<LLMSettingsSchema>(DEFAULT_LLM_SETTINGS);

    useEffect(() => {
        setSettings(load());
    }, []);

    const update = useCallback(<K extends keyof LLMSettingsSchema>(key: K, value: LLMSettingsSchema[K]) => {
        setSettings((prev) => {
            const next = { ...prev, [key]: value };
            save(next);
            return next;
        });
    }, []);

    return { settings, update };
}
