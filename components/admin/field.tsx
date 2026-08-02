"use client";

import * as React from "react";
import { X } from "lucide-react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

export function Field({
  label,
  hint,
  children,
  className,
}: {
  label: string;
  hint?: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("space-y-1.5", className)}>
      <Label className="text-xs font-medium">{label}</Label>
      {children}
      {hint && <p className="text-[10px] text-muted-foreground">{hint}</p>}
    </div>
  );
}

export function TextField({
  label,
  value,
  onChange,
  hint,
  placeholder,
  mono,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  hint?: string;
  placeholder?: string;
  mono?: boolean;
}) {
  return (
    <Field label={label} hint={hint}>
      <Input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className={mono ? "font-mono text-xs" : ""}
      />
    </Field>
  );
}

export function TextAreaField({
  label,
  value,
  onChange,
  hint,
  rows = 4,
  placeholder,
  mono,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  hint?: string;
  rows?: number;
  placeholder?: string;
  mono?: boolean;
}) {
  return (
    <Field label={label} hint={hint}>
      <Textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        rows={rows}
        placeholder={placeholder}
        className={cn("min-h-0", mono ? "font-mono text-xs" : "font-sans text-sm")}
      />
    </Field>
  );
}

export function TagField({
  label,
  value,
  onChange,
  hint,
  placeholder = "press enter to add",
}: {
  label: string;
  value: string[];
  onChange: (v: string[]) => void;
  hint?: string;
  placeholder?: string;
}) {
  const [draft, setDraft] = React.useState("");
  return (
    <Field label={label} hint={hint}>
      <div className="flex flex-wrap items-center gap-1 rounded-md border border-input bg-background p-1.5">
        {value.map((t, i) => (
          <Badge key={`${t}-${i}`} variant="secondary" className="h-6 gap-1 rounded-full pr-1 text-xs">
            {t}
            <button
              type="button"
              onClick={() => onChange(value.filter((_, j) => j !== i))}
              className="rounded-full p-0.5 hover:bg-foreground/10"
              aria-label={`Remove ${t}`}
            >
              <X className="size-3" />
            </button>
          </Badge>
        ))}
        <input
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === ",") {
              e.preventDefault();
              const v = draft.trim().replace(/,$/, "");
              if (v && !value.includes(v)) onChange([...value, v]);
              setDraft("");
            }
            if (e.key === "Backspace" && !draft && value.length) {
              onChange(value.slice(0, -1));
            }
          }}
          placeholder={placeholder}
          className="h-6 flex-1 min-w-[100px] bg-transparent px-1 text-xs outline-none placeholder:text-muted-foreground"
        />
      </div>
    </Field>
  );
}
