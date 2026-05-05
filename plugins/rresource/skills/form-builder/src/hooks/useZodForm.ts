// Vendored in plugins/rresource. Self-contained — no cross-slice imports.
// Default state = localStorage. Optional Convex schema + fns under ./convex/.

"use client";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, type UseFormProps, type UseFormReturn } from "react-hook-form";
import type { z, ZodType } from "zod";

export function useZodForm<S extends ZodType<any, any, any>>(
  schema: S,
  props?: Omit<UseFormProps<z.infer<S>>, "resolver">,
): UseFormReturn<z.infer<S>> {
  return useForm<z.infer<S>>({ ...props, resolver: zodResolver(schema) });
}
