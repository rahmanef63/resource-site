// @vitest-environment node
import { describe, expect, it } from "vitest";
import { readFileSync, readdirSync } from "node:fs";
import path from "node:path";

const svelteRoot = path.join(process.cwd(), "frontend/slices/image-picker-svelte");
const sharedFiles = [
  "frontend/slices/image-picker/types.ts",
  "frontend/slices/image-picker/lib/core.ts",
  "frontend/slices/image-picker/lib/galleryPresets.ts",
  "frontend/slices/image-picker/lib/imageStyle.ts",
  "frontend/slices/image-picker/lib/parseImage.ts",
  "frontend/slices/image-picker/lib/tools.ts",
  "frontend/slices/image-picker/lib/unsplashCurated.ts",
  "frontend/slices/image-picker/lib/unsplashSearch.ts",
];

function sourceFiles(dir: string): string[] {
  return readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const file = path.join(dir, entry.name);
    return entry.isDirectory() ? sourceFiles(file) : /\.(svelte|ts)$/.test(entry.name) ? [file] : [];
  });
}

describe("image-picker Svelte distribution", () => {
  it("keeps native Svelte + portable shared files free of React/Next/Lucide/shadcn imports", () => {
    const source = [...sourceFiles(svelteRoot), ...sharedFiles]
      .map((file) => readFileSync(file, "utf8"))
      .join("\n");
    expect(source).not.toMatch(/from ["']react["']/);
    expect(source).not.toMatch(/from ["']next(?:\/|["'])/);
    expect(source).not.toContain("lucide-react");
    expect(source).not.toContain("@/components/ui/");
    expect(source).not.toContain("@/shared/ui/FilePicker");
  });

  it("preserves gallery/upload/link/Unsplash/dialog/banner and focal-point semantics", () => {
    const dialog = readFileSync(path.join(svelteRoot, "components/ImagePickerDialog.svelte"), "utf8");
    const banner = readFileSync(path.join(svelteRoot, "components/ImageBanner.svelte"), "utf8");
    const upload = readFileSync(path.join(svelteRoot, "components/UploadTab.svelte"), "utf8");
    const link = readFileSync(path.join(svelteRoot, "components/LinkTab.svelte"), "utf8");
    const unsplash = readFileSync(path.join(svelteRoot, "components/UnsplashTab.svelte"), "utf8");
    expect(dialog).toContain("pickerTabs");
    expect(dialog).toContain("GalleryTab");
    expect(dialog).toContain("UploadTab");
    expect(dialog).toContain("LinkTab");
    expect(dialog).toContain("UnsplashTab");
    expect(banner).toContain("positionYFromClient");
    expect(banner).toContain("<svelte:window");
    expect(banner).toContain("{@attach captureBanner}");
    expect(upload).toContain("validateUploadFile");
    expect(link).toContain("validateImageLink");
    expect(unsplash).toContain("toUnsplashImageValue");
    expect(unsplash).toContain("$state.raw");
  });

  it("shares exactly the framework-neutral image picker files", () => {
    const slice = JSON.parse(readFileSync("frontend/slices/image-picker/slice.json", "utf8"));
    expect(slice.frontend.frameworks["svelte-sveltekit"].deps.sharedFiles).toEqual(sharedFiles);
  });
});
