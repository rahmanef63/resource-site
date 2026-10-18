// @vitest-environment node
import { describe, expect, it } from "vitest";
import { readAiJson } from "./ai-request";

function streamRequest(chunks: Uint8Array[], length = "1") {
  return new Request("http://localhost", {
    method: "POST", duplex: "half", headers: { "content-length": length },
    body: new ReadableStream({ start(controller) {
      for (const chunk of chunks) controller.enqueue(chunk);
      controller.close();
    } }),
  } as RequestInit & { duplex: string });
}

describe("bounded AI JSON reader", () => {
  it("counts UTF-8 bytes even when content-length understates the body", async () => {
    const chunk = new TextEncoder().encode(JSON.stringify("😀😀"));
    const result = await readAiJson(streamRequest([chunk]), 8);
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.response.status).toBe(413);
  });

  it("decodes a multibyte character split across chunks at the exact byte limit", async () => {
    const chunk = new TextEncoder().encode(JSON.stringify("😀"));
    expect(await readAiJson(streamRequest([chunk.slice(0, 3), chunk.slice(3)]), chunk.length))
      .toEqual({ ok: true, value: "😀" });
  });

  it.each([new Uint8Array([255]), new TextEncoder().encode("{")])("returns 400 for invalid UTF-8 or JSON", async (chunk) => {
    const result = await readAiJson(streamRequest([chunk]));
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.response.status).toBe(400);
  });
});
