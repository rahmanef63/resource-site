/**
 * Builder AI tool factory (VP wave) — Anthropic tool definitions generated at
 * request time from the slice catalog + the GENERATED preview metadata.
 * Nothing here is hardcoded per slice: a new catalog entry or previews block
 * is callable on the next request.
 */

import type Anthropic from "@anthropic-ai/sdk";
import { slices } from "@/lib/content/slices";
import { isHidden } from "@/lib/content/hidden-slugs";
import { EMPTY_SELECTION } from "@/lib/build/types";
import { buildCommands } from "@/lib/build/command-builder";
import { collectWarnings } from "@/lib/build/compat";
import previewMeta from "./preview-meta.gen.json";
import type { SlicePreviewMeta } from "@/shared/preview/types";

const META = previewMeta as SlicePreviewMeta[];
const CATALOG = slices.filter((s) => !isHidden(s.slug));

/** Client-side action emitted by a validated preview_slice call. */
export interface PreviewAction {
  slug: string;
  component: string;
  variant: Record<string, string>;
}

function previewHint(): string {
  return META.map((m) =>
    m.previews
      .map((p) =>
        p.kind === "variants"
          ? `${m.slug}.${p.component}: axes ${(p.axes ?? [])
              .map((a) => `${a.prop}=[${a.values.join("|")}]`)
              .join(" ")}`
          : `${m.slug}.${p.component}: scenario=[${(p.scenarios ?? [])
              .map((s) => s.id)
              .join("|")}]`,
      )
      .join("; "),
  ).join("\n");
}

export function buildBuilderTools(): Anthropic.Tool[] {
  return [
    {
      name: "list_slices",
      description:
        "List the rr slice catalog. Optionally filter by category. Returns slug, title, category, version and whether a live preview exists.",
      input_schema: {
        type: "object",
        properties: {
          category: { type: "string", description: "Optional category filter (e.g. ui, ai, content, payment)." },
        },
      },
    },
    {
      name: "get_slice",
      description: "Get one slice's full catalog entry: description, deps, peers, preview axes.",
      input_schema: {
        type: "object",
        properties: { slug: { type: "string" } },
        required: ["slug"],
      },
    },
    {
      name: "preview_slice",
      description:
        `Render a live widget preview of a slice in the builder UI. Only slices with declared previews work. Valid components + variant axes:\n${previewHint()}`,
      input_schema: {
        type: "object",
        properties: {
          slug: { type: "string", enum: META.map((m) => m.slug) },
          component: { type: "string" },
          variant: {
            type: "object",
            description: "Axis prop → value (or { scenario: id }). Values must come from the declared enums.",
          },
        },
        required: ["slug", "component"],
      },
    },
    {
      name: "compose_bundle",
      description:
        "Compose selected slices into install commands (npx rr add …) plus compatibility warnings.",
      input_schema: {
        type: "object",
        properties: {
          slices: { type: "array", items: { type: "string" }, description: "Slice slugs to install." },
        },
        required: ["slices"],
      },
    },
  ];
}

/** Server-side execution of the data tools. preview_slice returns a client
 *  action instead (validated here so the model only renders real variants). */
export function executeBuilderTool(
  name: string,
  input: Record<string, unknown>,
): { result: string; isError?: boolean; action?: PreviewAction } {
  if (name === "list_slices") {
    const cat = typeof input.category === "string" ? input.category : null;
    const items = CATALOG.filter((s) => !cat || s.category === cat).map((s) => ({
      slug: s.slug,
      title: s.title,
      category: s.category,
      version: s.version,
      hasPreview: META.some((m) => m.slug === s.slug),
    }));
    return { result: JSON.stringify(items) };
  }

  if (name === "get_slice") {
    const s = CATALOG.find((x) => x.slug === input.slug);
    if (!s) return { result: `unknown slug "${input.slug}"`, isError: true };
    const meta = META.find((m) => m.slug === s.slug);
    return {
      result: JSON.stringify({
        slug: s.slug, title: s.title, category: s.category, version: s.version,
        description: s.description, npm: s.npm, shadcn: s.shadcn, peers: s.peers,
        previews: meta?.previews ?? [],
      }),
    };
  }

  if (name === "preview_slice") {
    const meta = META.find((m) => m.slug === input.slug);
    if (!meta) return { result: `no preview for "${input.slug}"`, isError: true };
    const decl = meta.previews.find((p) => p.component === input.component);
    if (!decl) {
      return {
        result: `unknown component — valid: ${meta.previews.map((p) => p.component).join(", ")}`,
        isError: true,
      };
    }
    const variant = (input.variant ?? {}) as Record<string, string>;
    if (decl.kind === "variants") {
      for (const [prop, value] of Object.entries(variant)) {
        const ax = (decl.axes ?? []).find((a) => a.prop === prop);
        if (!ax) return { result: `unknown axis "${prop}" — valid: ${(decl.axes ?? []).map((a) => a.prop).join(", ")}`, isError: true };
        if (!ax.values.includes(value)) return { result: `invalid value "${value}" for ${prop} — valid: ${ax.values.join(", ")}`, isError: true };
      }
    } else if (variant.scenario && !(decl.scenarios ?? []).some((s) => s.id === variant.scenario)) {
      return { result: `unknown scenario — valid: ${(decl.scenarios ?? []).map((s) => s.id).join(", ")}`, isError: true };
    }
    return {
      result: "rendered in the builder UI",
      action: { slug: meta.slug, component: decl.component, variant },
    };
  }

  if (name === "compose_bundle") {
    const slugs = Array.isArray(input.slices) ? (input.slices as string[]) : [];
    const blocks = buildCommands({ ...EMPTY_SELECTION, slices: slugs });
    const warnings = collectWarnings(null, slugs);
    return { result: JSON.stringify({ commands: blocks, warnings }) };
  }

  return { result: `unknown tool "${name}"`, isError: true };
}
