"use client";

import * as React from "react";
import { Settings2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { ProjectForm as ProjectFormShape } from "@/lib/build/types";

// Mirror of command-builder's sanitize() — the emitted command always uses
// this form, so show the user the actual folder name instead of silently
// scaffolding something different from what they typed.
function sanitizeAppName(s: string) {
  return s.trim().replace(/[^a-z0-9-_]/gi, "-").toLowerCase();
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function ProjectForm({
  value,
  onChange,
}: {
  value: ProjectFormShape;
  onChange: (v: ProjectFormShape) => void;
}) {
  function patch(p: Partial<ProjectFormShape>) {
    onChange({ ...value, ...p });
  }
  const sanitized = sanitizeAppName(value.appName);
  const appNameDiffers = value.appName.trim() !== "" && sanitized !== value.appName;
  const emailInvalid = value.ownerEmail.trim() !== "" && !EMAIL_RE.test(value.ownerEmail.trim());
  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <Settings2 className="size-4 text-muted-foreground" />
        <h3 className="text-sm font-semibold">Project</h3>
      </div>
      <div className="space-y-2">
        <Field label="App name" hint="becomes folder + slug">
          <Input
            value={value.appName}
            onChange={(e) => patch({ appName: e.target.value })}
            placeholder="my-app"
            className="h-8"
            aria-describedby={appNameDiffers ? "app-name-note" : undefined}
          />
          {appNameDiffers && (
            <p id="app-name-note" className="text-[10px] text-amber-700 dark:text-amber-300">
              will be scaffolded as <code className="font-mono">{sanitized || "my-app"}</code>
            </p>
          )}
        </Field>
        <Field label="Brand name" hint="shown in nav, footer, og-image">
          <Input
            value={value.brandName}
            onChange={(e) => patch({ brandName: e.target.value })}
            placeholder="Atelier Studio"
            className="h-8"
          />
        </Field>
        <Field label="Owner email" hint="contact form / footer">
          <Input
            type="email"
            value={value.ownerEmail}
            onChange={(e) => patch({ ownerEmail: e.target.value })}
            placeholder="halo@example.com"
            className="h-8"
            aria-invalid={emailInvalid || undefined}
            aria-describedby={emailInvalid ? "owner-email-error" : undefined}
          />
          {emailInvalid && (
            <p id="owner-email-error" className="text-[10px] text-red-600 dark:text-red-400">
              doesn&apos;t look like a valid email
            </p>
          )}
        </Field>
      </div>
    </div>
  );
}

function Field({ label, hint, children }: { label: string; hint?: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1">
      <div className="flex items-baseline gap-2">
        <Label className="text-xs">{label}</Label>
        {hint && <span className="text-[10px] text-muted-foreground">{hint}</span>}
      </div>
      {children}
    </div>
  );
}
