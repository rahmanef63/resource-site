"use client";

import * as React from "react";
import { Plus, Save } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";

type Field = {
  id: string;
  label: string;
  kind?: "text" | "textarea";
  placeholder?: string;
  defaultValue?: string;
};

function CreateWizard({
  trigger,
  title,
  fields,
  saveLabel = "Save",
}: {
  trigger: React.ReactNode;
  title: string;
  fields: Field[];
  saveLabel?: string;
}) {
  return (
    <Dialog>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>
        <div className="space-y-3 py-2">
          {fields.map((f) => (
            <div key={f.id} className="space-y-1.5">
              <Label className="text-xs uppercase tracking-wider text-muted-foreground">{f.label}</Label>
              {f.kind === "textarea" ? (
                <Textarea rows={4} placeholder={f.placeholder} defaultValue={f.defaultValue} />
              ) : (
                <Input placeholder={f.placeholder} defaultValue={f.defaultValue} />
              )}
            </div>
          ))}
        </div>
        <DialogFooter>
          <Button size="sm" className="gap-1.5">
            <Save className="size-3.5" /> {saveLabel}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export function CreateInstructionDialog() {
  return (
    <CreateWizard
      title="Create instruction"
      saveLabel="Save instruction"
      trigger={<Button size="sm" className="gap-1.5"><Plus className="size-3" /> New instruction</Button>}
      fields={[
        { id: "name", label: "Name", placeholder: "House style" },
        { id: "slug", label: "Slug", placeholder: "house-style" },
        { id: "body", label: "Body", kind: "textarea", placeholder: "Reply in user's language. Cite docs. Refuse off-topic." },
      ]}
    />
  );
}

export function CreateSkillDialog() {
  return (
    <CreateWizard
      title="Create skill"
      saveLabel="Save skill"
      trigger={<Button size="sm" className="gap-1.5"><Plus className="size-3" /> New skill</Button>}
      fields={[
        { id: "name", label: "Name", placeholder: "Coder" },
        { id: "instruction", label: "Instruction", placeholder: "house-style" },
        { id: "modelDefault", label: "Default model", placeholder: "claude-opus-4-7" },
        { id: "toolDefaults", label: "Default tools (comma-sep)", placeholder: "shell, code-interp, git" },
      ]}
    />
  );
}

export function CreateToolDialog() {
  return (
    <CreateWizard
      title="Register tool"
      saveLabel="Register tool"
      trigger={<Button size="sm" className="gap-1.5"><Plus className="size-3" /> Register tool</Button>}
      fields={[
        { id: "name", label: "Name", placeholder: "Web search" },
        { id: "slug", label: "Slug", placeholder: "web-search" },
        { id: "impl", label: "Impl (http / convex / shell)", placeholder: "http" },
        { id: "endpoint", label: "Endpoint / function", placeholder: "https://api.tavily.com/search" },
        { id: "jsonSchema", label: "JSON Schema", kind: "textarea", placeholder: '{ "type": "object", "properties": {...} }' },
      ]}
    />
  );
}

export function CreateAgentDialog() {
  return (
    <CreateWizard
      title="Create agent"
      saveLabel="Save agent"
      trigger={<Button size="sm" className="gap-1.5"><Plus className="size-3" /> New agent</Button>}
      fields={[
        { id: "name", label: "Name", placeholder: "audit-bp" },
        { id: "skill", label: "Skill", placeholder: "coder" },
        { id: "model", label: "Model", placeholder: "claude-opus-4-7" },
        { id: "tools", label: "Allowed tools (comma-sep)", placeholder: "shell, rag, code-interp" },
        { id: "maxIter", label: "Max iterations", placeholder: "8" },
      ]}
    />
  );
}
