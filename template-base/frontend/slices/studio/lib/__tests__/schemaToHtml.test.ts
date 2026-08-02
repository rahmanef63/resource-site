import { describe, expect, it } from "vitest";

import { schemaToHtml } from "@/frontend/slices/studio/lib/schemaToHtml";
import type { Schema } from "@/frontend/slices/studio/ui/types";

describe("schemaToHtml", () => {
  it("preserves className and semantic tag output", () => {
    const schema: Schema = {
      version: "0.5",
      root: ["hero"],
      nodes: {
        hero: {
          type: "div",
          props: {
            tag: "section",
            className: "min-h-screen bg-gray-50 flex items-center justify-center",
          },
          children: [],
        },
      },
    };

    const html = schemaToHtml(schema);

    expect(html).toContain('<section data-studio-node-id="hero"');
    expect(html).toContain('class="min-h-screen bg-gray-50 flex items-center justify-center"');
  });

  it("normalises legacy text props for export", () => {
    const schema: Schema = {
      version: "0.5",
      root: ["hero"],
      nodes: {
        hero: {
          type: "div",
          props: {},
          children: ["headline"],
        },
        headline: {
          type: "text",
          props: {
            tag: "h1",
            text: "Launch faster",
            backgroundColor: "#111827",
          },
          children: [],
        },
      },
    };

    const html = schemaToHtml(schema);

    expect(html).toContain(">Launch faster</h1>");
    expect(html).toContain('color:#111827');
    expect(html).not.toContain('background-color:#111827');
  });

  it("includes design-mode bridge markup for iframe preview", () => {
    const schema: Schema = {
      version: "0.5",
      root: ["hero"],
      nodes: {
        hero: {
          type: "div",
          props: {},
          children: [],
        },
      },
    };

    const html = schemaToHtml(schema, {
      designMode: true,
      selectedNodeId: "hero",
    });

    expect(html).toContain('data-studio-selected="true"');
    expect(html).toContain('source: "studio-preview-frame"');
  });

  it("renders inline icon nodes and avoids duplicating mixed-content text", () => {
    const schema: Schema = {
      version: "0.5",
      root: ["page"],
      nodes: {
        page: {
          type: "div",
          props: {},
          children: ["headline"],
        },
        headline: {
          type: "text",
          props: { tag: "h2", className: "flex items-center gap-2" },
          children: ["headline-icon", "headline-copy"],
        },
        "headline-icon": {
          type: "icon",
          props: { name: "hub", size: 20, className: "text-blue-500" },
          children: [],
        },
        "headline-copy": {
          type: "text",
          props: { tag: "span", content: "Dashboard" },
          children: [],
        },
      },
      metadata: {
        name: "Imported Layout",
        createdAt: "2026-04-08T00:00:00.000Z",
        updatedAt: "2026-04-08T00:00:00.000Z",
        externalAssets: {
          links: [
            JSON.stringify({
              href: "https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap",
              rel: "stylesheet",
              crossorigin: null,
            }),
          ],
        },
      },
    };

    const html = schemaToHtml(schema);

    expect(html).toContain('class="material-symbols-outlined text-blue-500"');
    expect(html).toContain(">hub</span>");
    expect(html.match(/Dashboard/g)?.length ?? 0).toBe(1);
    expect(html).toContain('family=Material+Symbols+Outlined');
  });

  // ─── Avatar ──────────────────────────────────────────────────────────────

  it("avatar with src renders an <img> element", () => {
    const schema: Schema = {
      version: "0.5",
      root: ["av"],
      nodes: {
        av: {
          type: "avatar",
          props: { src: "https://example.com/pic.jpg", alt: "Test user" },
          children: [],
        },
      },
    };
    const html = schemaToHtml(schema);
    expect(html).toContain('<img src="https://example.com/pic.jpg"');
    expect(html).toContain('alt="Test user"');
    expect(html).toContain("border-radius:50%");
  });

  it("avatar with empty src renders fallback circle, not broken <img>", () => {
    const schema: Schema = {
      version: "0.5",
      root: ["av"],
      nodes: {
        av: {
          type: "avatar",
          props: { src: "", fallback: "JD" },
          children: [],
        },
      },
    };
    const html = schemaToHtml(schema);
    // Must NOT emit <img> for empty src
    expect(html).not.toContain('<img src=""');
    // Must show initials
    expect(html).toContain("JD");
    // Must be a circle div
    expect(html).toContain("border-radius:50%");
    expect(html).toContain("inline-flex");
  });

  it("avatar with no src or fallback renders empty circle", () => {
    const schema: Schema = {
      version: "0.5",
      root: ["av"],
      nodes: { av: { type: "avatar", props: {}, children: [] } },
    };
    const html = schemaToHtml(schema);
    expect(html).not.toContain('<img src=""');
    expect(html).toContain("border-radius:50%");
  });

  // ─── Image placeholder ───────────────────────────────────────────────────

  it("image with src renders <img>", () => {
    const schema: Schema = {
      version: "0.5",
      root: ["img"],
      nodes: {
        img: {
          type: "image",
          props: { src: "https://picsum.photos/400/200", alt: "Demo" },
          children: [],
        },
      },
    };
    const html = schemaToHtml(schema);
    expect(html).toContain('<img src="https://picsum.photos/400/200"');
    expect(html).toContain('alt="Demo"');
  });

  it("image with empty src renders placeholder box, not broken <img>", () => {
    const schema: Schema = {
      version: "0.5",
      root: ["img"],
      nodes: { img: { type: "image", props: { src: "" }, children: [] } },
    };
    const html = schemaToHtml(schema);
    expect(html).not.toContain('<img src=""');
    expect(html).toContain("[ image ]");
    expect(html).toContain("background:#f3f4f6");
  });

  // ─── metricCardBlock ─────────────────────────────────────────────────────

  it("metricCardBlock renders title, value, and trend arrow", () => {
    const schema: Schema = {
      version: "0.5",
      root: ["mc"],
      nodes: {
        mc: {
          type: "metricCardBlock",
          props: {
            title: "Revenue",
            value: "$45,231",
            description: "vs last month",
            trend: { value: 12.5, direction: "up" },
          },
          children: [],
        },
      },
    };
    const html = schemaToHtml(schema);
    expect(html).toContain("Revenue");
    expect(html).toContain("$45,231");
    expect(html).toContain("vs last month");
    expect(html).toContain("↑");
    expect(html).toContain("#10b981"); // green for up
    expect(html).toContain("12.5%");
  });

  it("metricCardBlock with direction=down uses red color", () => {
    const schema: Schema = {
      version: "0.5",
      root: ["mc"],
      nodes: {
        mc: {
          type: "metricCardBlock",
          props: { title: "Churn", value: "3.2%", trend: { value: 0.5, direction: "down" } },
          children: [],
        },
      },
    };
    const html = schemaToHtml(schema);
    expect(html).toContain("↓");
    expect(html).toContain("#ef4444"); // red for down
  });

  // ─── kanbanBlock ─────────────────────────────────────────────────────────

  it("kanbanBlock with structured columns renders column titles and card titles", () => {
    const schema: Schema = {
      version: "0.5",
      root: ["kb"],
      nodes: {
        kb: {
          type: "kanbanBlock",
          props: {
            title: "Sprint Board",
            columns: [
              {
                id: "todo", title: "To Do",
                items: [
                  { id: "t1", title: "Design onboarding", priority: "high", tags: ["design"], dueDate: "Apr 8" },
                ],
              },
              { id: "done", title: "Done", items: [] },
            ],
          },
          children: [],
        },
      },
    };
    const html = schemaToHtml(schema);
    expect(html).toContain("Sprint Board");
    expect(html).toContain("To Do");
    expect(html).toContain("Design onboarding");
    expect(html).toContain("design"); // tag
    expect(html).toContain("Apr 8");  // due date
    expect(html).toContain("Done");
    // Card count badges
    expect(html).toContain("1"); // todo count
  });

  it("kanbanBlock with string array columns renders column headers only", () => {
    const schema: Schema = {
      version: "0.5",
      root: ["kb"],
      nodes: {
        kb: {
          type: "kanbanBlock",
          props: { title: "Board", columns: ["Backlog", "In Progress", "Done"] },
          children: [],
        },
      },
    };
    const html = schemaToHtml(schema);
    expect(html).toContain("Backlog");
    expect(html).toContain("In Progress");
    expect(html).toContain("Done");
  });

  // ─── Tailwind CDN ────────────────────────────────────────────────────────

  it("includes Tailwind CDN script in <head>", () => {
    const schema: Schema = {
      version: "0.5",
      root: ["r"],
      nodes: { r: { type: "div", props: {}, children: [] } },
    };
    const html = schemaToHtml(schema);
    expect(html).toContain("cdn.tailwindcss.com");
  });
});
