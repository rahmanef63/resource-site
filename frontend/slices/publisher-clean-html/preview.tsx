"use client";
/** Variant preview (VP wave) — rr-internal, stripped on `rr add`. */
import type { SlicePreviewModule } from "@/shared/preview/types";
import { PublishPreview } from "./components/PublishPreview";
import { publishPage } from "./lib/publish-page";
import { createModuleRegistry } from "./lib/module-registry";
import type { ModuleDefinition, NodeTree } from "./lib/types";

// A consumer brings their own modules; these demo ones prove the engine env-free.
const modules: ModuleDefinition[] = [
  { id: "base.body", render: (_p, children) => ({ html: children.join("") }) },
  {
    id: "demo.section",
    render: (_p, children) => ({
      html: `<section>${children.join("")}</section>`,
      css: "section{max-width:42rem;margin:0 auto;padding:2rem}",
    }),
  },
  {
    id: "demo.heading",
    schema: { text: { type: "text" } },
    render: (p) => ({
      html: `<h1>${String(p.text ?? "")}</h1>`,
      css: "h1{font-size:1.5rem;font-weight:700;margin-bottom:.5rem}",
    }),
  },
  {
    id: "demo.text",
    schema: { body: { type: "text" }, href: { type: "url" } },
    render: (p) => ({
      html: `<p>${String(p.body ?? "")}${p.href ? ` <a href="${String(p.href)}">link</a>` : ""}</p>`,
      css: "p{color:#555;line-height:1.6;margin:.25rem 0}",
    }),
  },
];

const tree: NodeTree = {
  rootNodeId: "root",
  nodes: {
    root: { id: "root", moduleId: "base.body", children: ["sec"] },
    sec: { id: "sec", moduleId: "demo.section", children: ["h", "p1", "p2", "p3"] },
    h: { id: "h", moduleId: "demo.heading", props: { text: "Clean HTML output" } },
    p1: { id: "p1", moduleId: "demo.text", props: { body: "No framework runtime. One deduped CSS bundle." } },
    p2: {
      id: "p2",
      moduleId: "demo.text",
      // The <script> is HTML-escaped by escapeProps (plain text prop) → inert.
      props: { body: "Props escaped by schema type — XSS attempt: <script>alert(1)</script>" },
    },
    p3: { id: "p3", moduleId: "demo.text", props: { body: "Safe link", href: "https://example.com" } },
  },
};

const registry = createModuleRegistry(modules);

const preview: SlicePreviewModule = {
  PublishPreview: ({ variant }) => {
    const emission = (variant.cssEmission as "inline" | "external") ?? "inline";
    const { html, css } = publishPage(tree, registry, {
      title: "Demo",
      description: "Clean HTML publisher demo",
      cssEmission: emission,
      cssHref: "/styles.css",
    });
    // External mode returns css separately; re-inline it for the iframe preview.
    const doc =
      emission === "external" ? html.replace("</head>", `<style>${css}</style></head>`) : html;
    return (
      <div className="p-4">
        <PublishPreview html={doc} height={360} className="rounded-lg border border-border" />
      </div>
    );
  },
};
export default preview;
