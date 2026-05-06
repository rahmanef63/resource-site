"use client";

import * as React from "react";
import { Check, ChevronsUpDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { ModelSelectorLogo } from "@/frontend/shared/communications/components/ai";
import { AI_PROVIDERS, useAISettingsStorage } from "@/frontend/shared/ai/settings";

interface StudioAIModelPickerProps {
  compact?: boolean;
  className?: string;
}

function normalizeProviderId(providerId: string) {
  return providerId === "glm" ? "z-ai" : providerId;
}

export function StudioAIModelPicker({
  compact = false,
  className,
}: StudioAIModelPickerProps) {
  const { settings, updateSetting, isLoading } = useAISettingsStorage();
  const [open, setOpen] = React.useState(false);

  const providers = React.useMemo(() => {
    const enabledIds = new Set((settings.apiKeys || []).filter((k) => k.isEnabled).map((k) => normalizeProviderId(k.providerId)));
    const enabledProviders = AI_PROVIDERS.filter((provider) => enabledIds.has(normalizeProviderId(provider.id)));
    return enabledProviders.length > 0 ? enabledProviders : AI_PROVIDERS;
  }, [settings.apiKeys]);

  const currentProvider = React.useMemo(
    () => providers.find((provider) => provider.id === normalizeProviderId(settings.defaultProvider)) ?? providers[0],
    [providers, settings.defaultProvider]
  );

  const currentModel = React.useMemo(
    () => currentProvider?.models.find((model) => model.id === settings.defaultModel) ?? currentProvider?.models[0],
    [currentProvider, settings.defaultModel]
  );

  const handleSelect = React.useCallback(
    (providerId: string, modelId: string) => {
      updateSetting("defaultProvider", providerId as any);
      updateSetting("defaultModel", modelId as any);
      setOpen(false);
    },
    [updateSetting]
  );

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          disabled={isLoading}
          className={cn(
            compact
              ? "h-7 max-w-[220px] justify-between gap-2 px-2 text-xs"
              : "h-8 w-full justify-between gap-2 text-xs",
            className
          )}
        >
          <div className="flex min-w-0 items-center gap-2">
            {currentProvider ? (
              <ModelSelectorLogo provider={normalizeProviderId(currentProvider.id)} />
            ) : null}
            <span className="truncate">
              {currentModel?.name ?? "Select model"}
            </span>
          </div>
          <ChevronsUpDown className="h-3.5 w-3.5 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[420px] max-w-[calc(100vw-2rem)] p-0" align="start">
        <Command>
          <CommandInput placeholder="Search models..." className="h-9 text-xs" />
          <CommandList>
            <CommandEmpty>No model found.</CommandEmpty>
          {providers.map((provider) => (
            <CommandGroup key={provider.id} heading={provider.name}>
              {provider.models.map((model) => {
                const isSelected =
                  normalizeProviderId(settings.defaultProvider) === normalizeProviderId(provider.id) &&
                  settings.defaultModel === model.id;

                return (
                  <CommandItem
                    key={`${provider.id}:${model.id}`}
                    value={`${provider.name} ${model.name} ${model.id} ${model.description}`}
                    onSelect={() => handleSelect(provider.id, model.id)}
                    className="gap-2 text-xs"
                  >
                    <ModelSelectorLogo provider={normalizeProviderId(provider.id)} />
                    <div className="flex min-w-0 flex-1 flex-col">
                      <span className="truncate font-medium">{model.name}</span>
                      <span className="truncate text-[10px] text-muted-foreground">
                        {model.description}
                      </span>
                    </div>
                    <Check
                      className={cn(
                        "ml-auto h-3.5 w-3.5 shrink-0",
                        isSelected ? "opacity-100" : "opacity-0"
                      )}
                    />
                  </CommandItem>
                );
              })}
            </CommandGroup>
          ))}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
