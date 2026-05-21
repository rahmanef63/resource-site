"use client";

import * as React from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { LANGUAGES, TIMEZONES } from "./seed";
import type { WorkspaceIdentity } from "./types";

export function IdentityForm({
  identity,
  setIdentity,
}: {
  identity: WorkspaceIdentity;
  setIdentity: React.Dispatch<React.SetStateAction<WorkspaceIdentity>>;
}) {
  return (
    <div className="grid gap-3 md:grid-cols-2">
      <Field label="Workspace name">
        <Input
          value={identity.name}
          onChange={(e) => setIdentity((p) => ({ ...p, name: e.target.value }))}
          className="text-xs"
        />
      </Field>
      <Field label="URL slug" hint={`/w/${identity.slug || "…"}`}>
        <Input
          value={identity.slug}
          onChange={(e) =>
            setIdentity((p) => ({
              ...p,
              slug: e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, "-"),
            }))
          }
          className="font-mono text-xs"
        />
      </Field>
      <Field label="Timezone">
        <Select
          value={identity.timezone}
          onValueChange={(v) => setIdentity((p) => ({ ...p, timezone: v }))}
        >
          <SelectTrigger className="text-xs">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {TIMEZONES.map((tz) => (
              <SelectItem key={tz} value={tz}>
                {tz}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </Field>
      <Field label="Language">
        <Select
          value={identity.language}
          onValueChange={(v) => setIdentity((p) => ({ ...p, language: v }))}
        >
          <SelectTrigger className="text-xs">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {LANGUAGES.map((l) => (
              <SelectItem key={l.code} value={l.code}>
                {l.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </Field>
      <Field label="Contact email" hint="Used for billing + ops alerts">
        <Input
          type="email"
          value={identity.contactEmail}
          onChange={(e) => setIdentity((p) => ({ ...p, contactEmail: e.target.value }))}
          className="font-mono text-xs"
        />
      </Field>
    </div>
  );
}

function Field({
  label,
  hint,
  children,
}: {
  label: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-1">
      <Label className="text-[10px] uppercase text-muted-foreground">{label}</Label>
      {children}
      {hint && <p className="text-[10px] text-muted-foreground">{hint}</p>}
    </div>
  );
}
