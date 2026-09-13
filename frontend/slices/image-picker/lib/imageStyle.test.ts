import { describe, expect, it } from "vitest";
import { imageStyle } from "./imageStyle";

describe("imageStyle", () => {
  it("keeps focal-point CSS for URLs", () => {
    expect(imageStyle({ type: "link", value: "https://example.com/a.jpg", positionY: 27 })).toEqual({
      backgroundImage: 'url("https://example.com/a.jpg")',
      backgroundSize: "cover",
      backgroundPosition: "center 27%",
      backgroundRepeat: "no-repeat",
    });
  });

  it("escapes quote/backslash characters and strips newlines before entering url()", () => {
    const value = 'https://example.com/a"\\b\nnext.jpg';
    const style = imageStyle({ type: "link", value });
    expect(style.backgroundImage).toBe('url("https://example.com/a\\"\\\\bnext.jpg")');
    expect(style.backgroundImage).not.toContain("\n");
  });

  it("passes CSS colour/gradient data through as background", () => {
    expect(imageStyle({ type: "gradient", value: "linear-gradient(red, blue)" })).toEqual({
      background: "linear-gradient(red, blue)",
    });
  });
});
