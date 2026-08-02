import { describe, expect, it } from "vitest";

import {
  analyzeStudioDocumentPublishSafety,
  isNodePublishCertified,
  isWidgetPublishCertified,
} from "@/frontend/slices/studio/publishing";

describe("Studio publish safety", () => {
  it("marks approved widgets and nodes as publish-certified", () => {
    expect(isWidgetPublishCertified("section")).toBe(true);
    expect(isNodePublishCertified("trigger.manual")).toBe(true);
  });

  it("flags unsupported widgets and nodes", () => {
    const report = analyzeStudioDocumentPublishSafety({
      $schema: "https://superspace.app/schemas/studio/v1.0",
      studioVersion: "1.0",
      kind: "unified",
      metadata: {
        id: "doc-1",
        name: "Unsafe Feature",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      ui: {
        version: "0.5",
        root: ["page-root"],
        nodes: {
          "page-root": {
            type: "kanbanBlock",
            props: {},
            children: [],
          },
        },
      },
      flow: {
        version: "1.0",
        nodes: [
          {
            id: "n1",
            name: "Webhook Trigger",
            type: "trigger.webhook",
            position: { x: 0, y: 0 },
            parameters: {},
          },
        ],
        edges: [],
      },
    });

    expect(report.unsupportedWidgets).toContain("kanbanBlock");
    expect(report.unsupportedNodes).toContain("trigger.webhook");
  });
});
