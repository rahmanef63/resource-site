"use client";

import * as React from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import type { SettingsProfile } from "../../lib/adapter";

function initials(name: string): string {
  return (
    name
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 2)
      .map((w) => w[0]?.toUpperCase() ?? "")
      .join("") || "?"
  );
}

export interface ProfileSectionProps {
  value: SettingsProfile;
  saving?: boolean;
  onSave: (profile: SettingsProfile) => void | Promise<void>;
}

export function ProfileSection({ value, saving, onSave }: ProfileSectionProps) {
  const [draft, setDraft] = React.useState<SettingsProfile>(value);
  React.useEffect(() => setDraft(value), [value]);

  const dirty = JSON.stringify(draft) !== JSON.stringify(value);
  const set = (patch: Partial<SettingsProfile>) =>
    setDraft((d) => ({ ...d, ...patch }));

  return (
    <Card>
      <CardHeader>
        <CardTitle>Profile</CardTitle>
        <CardDescription>Your public identity and contact details.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex items-center gap-4">
          <Avatar className="size-16">
            {draft.avatarUrl ? <AvatarImage src={draft.avatarUrl} alt={draft.name} /> : null}
            <AvatarFallback className="text-lg">{initials(draft.name)}</AvatarFallback>
          </Avatar>
          <div className="flex-1 space-y-1.5">
            <Label htmlFor="sp-avatar">Avatar URL</Label>
            <Input
              id="sp-avatar"
              value={draft.avatarUrl ?? ""}
              placeholder="https://…"
              onChange={(e) => set({ avatarUrl: e.target.value || undefined })}
            />
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-1.5">
            <Label htmlFor="sp-name">Name</Label>
            <Input
              id="sp-name"
              value={draft.name}
              onChange={(e) => set({ name: e.target.value })}
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="sp-email">Email</Label>
            <Input
              id="sp-email"
              type="email"
              value={draft.email}
              onChange={(e) => set({ email: e.target.value })}
            />
          </div>
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="sp-bio">Bio</Label>
          <Textarea
            id="sp-bio"
            rows={3}
            value={draft.bio ?? ""}
            placeholder="A short bio…"
            onChange={(e) => set({ bio: e.target.value || undefined })}
          />
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
