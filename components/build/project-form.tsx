"use client";

import * as React from "react";
import { Settings2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { ProjectForm as ProjectFormShape } from "@/lib/build/types";

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
          />
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
          />
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
