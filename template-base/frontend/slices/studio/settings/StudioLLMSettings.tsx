/**
 * Studio LLM Settings
 *
 * Studio now uses the shared AI feature provider/model configuration.
 * This panel keeps only Studio-specific behavior such as prompt overrides.
 */
"use client";

import React from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui";
import { Switch } from "@/components/ui/switch";
import { Sparkles } from "lucide-react";
import { useAISettingsStorage } from "@/frontend/shared/ai/settings";
import { useLLMSettings } from "./useLLMSettings";
import { StudioAIModelPicker } from "../components/StudioAIModelPicker";
import { resolveStudioAIConfig } from "../lib/aiConfig";

export function StudioLLMSettings() {
    const { settings: aiSettings, updateSetting } = useAISettingsStorage();
    const { settings: studioSettings, update } = useLLMSettings();
    const resolvedConfig = resolveStudioAIConfig(aiSettings);

    return (
        <div className="p-4 space-y-5">
            <div className="flex items-center gap-2 mb-1">
                <Sparkles size={14} className="text-primary" />
                <h3 className="text-sm font-semibold">AI Builder Configuration</h3>
            </div>
            <p className="text-xs text-muted-foreground">
                Studio generation uses the shared AI feature configuration.
                Pick the provider/model here, and manage API keys from <span className="font-mono">/dashboard/ai</span>.
            </p>

            <div className="flex items-center justify-between">
                <Label className="text-sm">Enable AI Builder</Label>
                <Switch
                    checked={aiSettings.aiEnabled}
                    onCheckedChange={(value) => updateSetting("aiEnabled", value)}
                />
            </div>

            {aiSettings.aiEnabled && (
                <>
                    <div className="space-y-1.5">
                        <Label className="text-xs">Provider + Model</Label>
                        <StudioAIModelPicker />
                        <p className="text-[11px] text-muted-foreground">
                            Current selection: <span className="font-mono">{resolvedConfig.provider}</span> / <span className="font-mono">{resolvedConfig.model}</span>
                        </p>
                    </div>

                    <div className="space-y-1.5">
                        <Label className="text-xs">Max Tokens</Label>
                        <Input
                            type="number"
                            value={aiSettings.maxTokens}
                            onChange={(e) => updateSetting("maxTokens", e.target.value as any)}
                            min={256}
                            max={8192}
                            step={256}
                            className="h-8 text-xs"
                        />
                    </div>

                    <div className="space-y-1.5">
                        <Label className="text-xs">System Prompt Override (optional)</Label>
                        <textarea
                            value={studioSettings.systemPromptOverride}
                            onChange={(e) => update("systemPromptOverride", e.target.value)}
                            placeholder="Leave empty to use the built-in Studio JSON schema prompt…"
                            rows={3}
                            className="w-full text-xs rounded-md border border-border bg-background px-3 py-2 resize-none focus:outline-none focus:ring-1 focus:ring-ring"
                        />
                    </div>

                    <Button
                        variant="outline"
                        size="sm"
                        className="w-full text-xs"
                        onClick={() => update("systemPromptOverride", "")}
                    >
                        Reset Studio Prompt Override
                    </Button>
                </>
            )}
        </div>
    );
}
