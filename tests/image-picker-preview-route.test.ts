// @vitest-environment node
import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";

describe("image-picker public preview route", () => {
  it("hosts canonical preview.tsx without a second file-upload-backed demo", () => {
    const source = readFileSync("app/preview/slices/image-picker/page.tsx", "utf8");
    expect(source).toContain('import preview from "@/features/image-picker/preview"');
    expect(source).toContain("preview.ImagePickerButton");
    expect(source).not.toContain("@/features/file-upload");
    expect(source).not.toContain("unsplashSearchVia");
  });
});
