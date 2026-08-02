"use client";

import * as React from "react";
import { Sparkles, Zap, Eye, Wrench, FileText, type LucideIcon } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectSeparator,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

export type ModelCapability = "vision" | "tools" | "long-context" | "fast" | "reasoning";

const CAP_ICON: Record<ModelCapability, LucideIcon> = {
  vision: Eye,
  tools: Wrench,
  "long-context": FileText,
  fast: Zap,
  reasoning: Sparkles,
};

export type ModelOption = {
  id: string;
  label: string;
  capabilities?: ModelCapability[];
  /** Optional cost-per-Mtok display (e.g. "$3 / $15"). */
  pricing?: string;
};

export type ProviderGroup = {
  provider: string;
  /** Optional icon component for the group label. */
  icon?: LucideIcon;
  models: ModelOption[];
};

export type ModelPickerProps = {
  value: string;
  onValueChange: (id: string) => void;
  groups: ProviderGroup[];
  /** Trigger sizing — defaults to "md". */
  size?: "sm" | "md";
  className?: string;
};

/** Grouped model picker. Composes shadcn Select with provider headings
 *  and per-row capability badges + pricing chip. */
export function ModelPicker({ value, onValueChange, groups, size = "md", className }: ModelPickerProps) {
  return (
    <Select value={value} onValueChange={onValueChange}>
      <SelectTrigger
        className={cn(
          "w-full",
          size === "sm" ? "h-8 text-xs" : "h-9 text-sm",
          className,
        )}
      >
        <SelectValue placeholder="Choose model…" />
      </SelectTrigger>
      <SelectContent className="max-h-[60vh]">
        {groups.map((g, gi) => (
          <React.Fragment key={g.provider}>
            {gi > 0 && <SelectSeparator />}
            <SelectGroup>
              <SelectLabel className="flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                {g.icon && <g.icon className="size-3" />}
                {g.provider}
              </SelectLabel>
              {g.models.map((m) => (
                <SelectItem key={m.id} value={m.id} className="text-xs">
                  <div className="flex w-full items-center gap-2">
                    <span className="flex-1 font-medium">{m.label}</span>
                    {m.capabilities?.map((cap) => {
                      const Icon = CAP_ICON[cap];
                      return (
                        <Icon
                          key={cap}
                          className="size-3 text-muted-foreground"
                          aria-label={cap}
                        />
                      );
                    })}
                    {m.pricing && (
                      <Badge
                        variant="outline"
                        className="h-4 px-1 font-mono text-[9px] font-normal"
                      >
                        {m.pricing}
                      </Badge>
                    )}
                  </div>
                </SelectItem>
              ))}
            </SelectGroup>
          </React.Fragment>
        ))}
      </SelectContent>
    </Select>
  );
}
