import { describe, expect, it } from "vitest";
import {
  IMAGE_LINK_ERROR,
  IMAGE_UPLOAD_MAX_BYTES,
  clampPositionY,
  pickerTabs,
  positionYFromClient,
  toUnsplashImageValue,
  validateImageLink,
  validateUploadFile,
} from "./core";

const PHOTO = {
  id: "p1",
  regular: "https://images.example/regular.jpg",
  thumb: "https://images.example/thumb.jpg",
  full: "https://images.example/full.jpg",
  width: 2000,
  height: 1200,
  alt: "Mountain",
  photographer: "A",
  photographerUrl: "https://example.com/a",
  source: "https://unsplash.com/photos/p1",
};

describe("image picker portable core", () => {
  it("keeps the canonical tab order and hides upload without an injected uploader", () => {
    expect(pickerTabs(false)).toEqual(["gallery", "link", "unsplash"]);
    expect(pickerTabs(true)).toEqual(["gallery", "upload", "link", "unsplash"]);
  });

  it("validates image links and upload constraints", () => {
    expect(validateImageLink("https://example.com/a.jpg")).toBeNull();
    expect(validateImageLink("ftp://example.com/a.jpg")).toBe(IMAGE_LINK_ERROR);
    expect(validateUploadFile({ type: "image/png", size: IMAGE_UPLOAD_MAX_BYTES })).toBeNull();
    expect(validateUploadFile({ type: "text/plain", size: 10 })).toBe("Images only");
    expect(validateUploadFile({ type: "image/png", size: IMAGE_UPLOAD_MAX_BYTES + 1 })).toBe("Max 8 MB");
  });

  it("clamps banner repositioning and maps Unsplash attribution metadata", () => {
    expect(clampPositionY(-12)).toBe(0);
    expect(clampPositionY(140)).toBe(100);
    expect(positionYFromClient(150, 100, 100)).toBe(50);
    expect(positionYFromClient(10, 100, 100)).toBe(0);
    expect(toUnsplashImageValue(PHOTO)).toMatchObject({
      type: "unsplash",
      value: PHOTO.regular,
      positionY: 50,
      metadata: { id: "p1", photographer: "A", source: PHOTO.source },
    });
  });
});
