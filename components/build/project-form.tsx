"use client";

import * as React from "react";
import { Box, Package, Settings2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { FRAMEWORK_PROFILES, PACKAGE_MANAGER_PROFILES } from "@/lib/content/framework-matrix";
import type { ProjectForm as ProjectFormShape } from "@/lib/build/types";

function sanitizeAppName(s: string) {
  return s.trim().replace(/[^a-z0-9-_]/gi, "-").toLowerCase();
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function ProjectForm({ value, onChange }: { value: ProjectFormShape; onChange: (v: ProjectFormShape) => void }) {
  const patch = (p: Partial<ProjectFormShape>) => onChange({ ...value, ...p });
  const sanitized = sanitizeAppName(value.appName);
  const appNameDiffers = value.appName.trim() !== "" && sanitized !== value.appName;
  const emailInvalid = value.ownerEmail.trim() !== "" && !EMAIL_RE.test(value.ownerEmail.trim());

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <Settings2 className="size-4 text-muted-foreground" />
        <div>
          <h3 className="text-sm font-semibold">Project environment</h3>
          <p className="text-[10px] text-muted-foreground">Framework and package manager are independent.</p>
        </div>
      </div>

      <ChoiceGroup icon={<Box className="size-3" />} label="Framework">
        {FRAMEWORK_PROFILES.map((item) => (
          <Button
            key={item.id}
            type="button"
            size="sm"
            variant={value.framework === item.id ? "default" : "outline"}
            aria-pressed={value.framework === item.id}
            className="h-auto min-h-11 flex-1 justify-start px-3 py-2 text-left"
            onClick={() => patch({ framework: item.id })}
          >
            <span><span className="block text-[11px] font-semibold">{item.label}</span><span className="block text-[9px] opacity-70">{item.renderer}</span></span>
          </Button>
        ))}
      </ChoiceGroup>

      <ChoiceGroup icon={<Package className="size-3" />} label="Package manager">
        {PACKAGE_MANAGER_PROFILES.map((item) => (
          <Button
            key={item.id}
            type="button"
            size="sm"
            variant={value.packageManager === item.id ? "default" : "outline"}
            aria-pressed={value.packageManager === item.id}
            className="h-10 flex-1 text-xs"
            onClick={() => patch({ packageManager: item.id })}
          >
            {item.label}
          </Button>
        ))}
      </ChoiceGroup>

      <div className="space-y-2">
        <Field label="App name" hint="becomes folder + slug">
          <Input value={value.appName} onChange={(e) => patch({ appName: e.target.value })} placeholder="my-app" className="h-10" aria-describedby={appNameDiffers ? "app-name-note" : undefined} />
          {appNameDiffers && <p id="app-name-note" className="text-[10px] text-amber-700 dark:text-amber-300">will be scaffolded as <code className="font-mono">{sanitized || "my-app"}</code></p>}
        </Field>
        <Field label="Brand name" hint="optional project copy">
          <Input value={value.brandName} onChange={(e) => patch({ brandName: e.target.value })} placeholder="Atelier Studio" className="h-10" />
        </Field>
        <Field label="Owner email" hint="optional contact metadata">
          <Input type="email" value={value.ownerEmail} onChange={(e) => patch({ ownerEmail: e.target.value })} placeholder="halo@example.com" className="h-10" aria-invalid={emailInvalid || undefined} aria-describedby={emailInvalid ? "owner-email-error" : undefined} />
          {emailInvalid && <p id="owner-email-error" className="text-[10px] text-red-600 dark:text-red-400">doesn&apos;t look like a valid email</p>}
        </Field>
      </div>
    </div>
  );
}

function ChoiceGroup({ icon, label, children }: { icon: React.ReactNode; label: string; children: React.ReactNode }) {
  return <div className="space-y-1"><div className="flex items-center gap-1 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">{icon}{label}</div><div className="flex gap-1.5">{children}</div></div>;
}

function Field({ label, hint, children }: { label: string; hint?: string; children: React.ReactNode }) {
  return <div className="space-y-1"><div className="flex items-baseline gap-2"><Label className="text-xs">{label}</Label>{hint && <span className="text-[10px] text-muted-foreground">{hint}</span>}</div>{children}</div>;
}
