// Vendored in plugins/rresource. Self-contained — no cross-slice imports.
// Default state = localStorage. Optional Convex schema + fns under ./convex/.

"use client";
import * as React from "react";
import type { ZodObject, ZodTypeAny, z } from "zod";
import { useZodForm } from "../hooks/useZodForm";

type Props<S extends ZodObject<any>> = {
  schema: S;
  defaults?: Partial<z.infer<S>>;
  onSubmit: (values: z.infer<S>) => void | Promise<void>;
  submitLabel?: string;
  className?: string;
};

export function AutoForm<S extends ZodObject<any>>({
  schema, defaults, onSubmit, submitLabel = "Submit", className,
}: Props<S>) {
  const form = useZodForm(schema, { defaultValues: defaults as any });
  const fields = Object.entries(schema.shape) as [string, ZodTypeAny][];
  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className={className}>
      {fields.map(([name, field]) => {
        const desc = (field as any)._def?.typeName ?? "";
        const isBool = desc === "ZodBoolean";
        const isNum = desc === "ZodNumber";
        return (
          <label key={name} className="mb-3 block">
            <span className="mb-1 block text-xs font-medium capitalize">{name}</span>
            <input
              {...form.register(name as any, { valueAsNumber: isNum })}
              type={isBool ? "checkbox" : isNum ? "number" : "text"}
              className="w-full rounded border px-2 py-1.5 text-sm"
            />
            {form.formState.errors[name] && (
              <span className="mt-0.5 block text-xs text-red-500">
                {String((form.formState.errors as any)[name]?.message ?? "Invalid")}
              </span>
            )}
          </label>
        );
      })}
      <button type="submit" disabled={form.formState.isSubmitting} className="rounded bg-primary px-3 py-1.5 text-sm text-primary-foreground">
        {form.formState.isSubmitting ? "Saving…" : submitLabel}
      </button>
    </form>
  );
}
