// @vitest-environment jsdom

import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

const readSource = (relPath: string) =>
  readFileSync(resolve(process.cwd(), relPath), "utf8");

// Strips // line-comments and /* block-comments */ so assertions only match
// live JSX/source, not prose that mentions removed symbols.
const stripComments = (src: string) =>
  src.replace(/\/\*[\s\S]*?\*\//g, "").replace(/^\s*\/\/.*$/gm, "");

describe("Overview page shell contract", () => {
  it("mounts the unified FeatureShell with the overview featureId", () => {
    const source = stripComments(readSource("frontend/slices/overview/page.tsx"));

    expect(source).toMatch(/<FeatureShell[\s/>]/);
    expect(source).toContain('featureId="overview"');
    expect(source).not.toMatch(/<FeatureLayout[\s/>]/);
  });

  it("no longer renders a dedicated FeatureHeader/OverviewHeader bar", () => {
    const blocks = stripComments(
      readSource("frontend/slices/overview/OverviewViewBlocks.tsx"),
    );

    expect(blocks).not.toMatch(/<OverviewHeader[\s/>]/);
    expect(blocks).not.toMatch(/<FeatureHeader[\s/>]/);
  });

  it("leaves AI integration to FeatureShell — no per-view panel plumbing", () => {
    const blocks = stripComments(
      readSource("frontend/slices/overview/OverviewViewBlocks.tsx"),
    );

    expect(blocks).not.toContain("isAIPanelOpen");
    expect(blocks).not.toContain("ResizablePanelGroup");
  });
});
