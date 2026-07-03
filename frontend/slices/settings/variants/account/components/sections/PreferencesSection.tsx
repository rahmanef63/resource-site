"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import type {
  DensityPref,
  SettingsPreferences,
  ThemePref,
} from "../../lib/adapter";

const LANGUAGES = [
  { value: "en", label: "English" },
  { value: "id", label: "Bahasa Indonesia" },
  { value: "es", label: "Español" },
  { value: "fr", label: "Français" },
  { value: "de", label: "Deutsch" },
  { value: "ja", label: "日本語" },
];

const DENSITIES: DensityPref[] = ["comfortable", "compact"];

export interface PreferencesSectionProps {
  value: SettingsPreferences;
  saving?: boolean;
  onSave: (prefs: SettingsPreferences) => void | Promise<void>;
}

export function PreferencesSection({ value, saving, onSave }: PreferencesSectionProps) {
  const [draft, setDraft] = React.useState<SettingsPreferences>(value);
  React.useEffect(() => setDraft(value), [value]);

  const dirty = JSON.stringify(draft) !== JSON.stringify(value);
  const set = (patch: Partial<SettingsPreferences>) =>
    setDraft((d) => ({ ...d, ...patch }));

  return (
    <Card>
      <CardHeader>
        <CardTitle>Preferences</CardTitle>
        <CardDescription>Appearance and locale for this account.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-1.5">
          <Label>Theme</Label>
          <Select value={draft.theme} onValueChange={(v) => set({ theme: v as ThemePref })}>
            <SelectTrigger className="w-full sm:w-60">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="light">Light</SelectItem>
              <SelectItem value="dark">Dark</SelectItem>
              <SelectItem value="system">System</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-1.5">
          <Label>Language</Label>
          <Select value={draft.language} onValueChange={(v) => set({ language: v })}>
            <SelectTrigger className="w-full sm:w-60">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {LANGUAGES.map((l) => (
                <SelectItem key={l.value} value={l.value}>
                  {l.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-1.5">
          <Label>Density</Label>
          <div className="inline-flex rounded-md border border-input p-0.5">
            {DENSITIES.map((d) => (
              <Button
                key={d}
                type="button"
                variant="ghost"
                onClick={() => set({ density: d })}
                className={cn(
                  "h-auto rounded px-3 py-1 text-xs capitalize",
                  draft.density === d
                    ? "bg-accent font-medium"
                    : "text-muted-foreground hover:text-foreground",
                )}
              >
                {d}
              </Button>
            ))}
          </div>
        </div>

        <div className="flex justify-end">
          <Button disabled={saving || !dirty} onClick={() => onSave(draft)}>
            {saving ? "Saving…" : "Save changes"}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
