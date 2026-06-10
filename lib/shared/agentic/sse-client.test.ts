import { describe, it, expect, vi, afterEach } from "vitest";
import { createSseAgentStream } from "./sse-client";

/** Build a Response whose body streams the given SSE frames in chunks. */
function sseResponse(frames: string[], status = 200): Response {
  const body = new ReadableStream<Uint8Array>({
    start(controller) {
      const enc = new TextEncoder();
      for (const f of frames) controller.enqueue(enc.encode(f));
      controller.close();
    },
  });
  return new Response(body, { status });
}

afterEach(() => vi.restoreAllMocks());

describe("createSseAgentStream", () => {
  it("streams deltas and resolves the final turn", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValue(
      sseResponse([
        `data: ${JSON.stringify({ type: "delta", text: "Hel" })}\n\n`,
        `data: ${JSON.stringify({ type: "delta", text: "lo" })}\n\n`,
        `data: ${JSON.stringify({
          type: "turn",
          turn: { text: "Hello", toolUses: [{ id: "t1", name: "foo.bar", input: { a: 1 } }], stopReason: "tool_use" },
        })}\n\n`,
      ]),
    );
    const deltas: string[] = [];
    const stream = createSseAgentStream("/x");
    const turn = await stream([{ role: "user", text: "hi" }], [], (c) => deltas.push(c));

    expect(deltas).toEqual(["Hel", "lo"]);
    expect(turn.text).toBe("Hello");
    expect(turn.toolUses).toEqual([{ id: "t1", name: "foo.bar", input: { a: 1 } }]);
    expect(turn.stopReason).toBe("tool_use");
  });

  it("reassembles frames split across chunk boundaries", async () => {
    const frame = `data: ${JSON.stringify({ type: "turn", turn: { text: "ok", toolUses: [], stopReason: "end_turn" } })}\n\n`;
    vi.spyOn(globalThis, "fetch").mockResolvedValue(
      sseResponse([frame.slice(0, 10), frame.slice(10)]),
    );
    const turn = await createSseAgentStream("/x")([{ role: "user", text: "hi" }], [], () => {});
    expect(turn.text).toBe("ok");
  });

  it("throws rate_limited on HTTP 429", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValue(new Response("", { status: 429 }));
    await expect(
      createSseAgentStream("/x")([{ role: "user", text: "hi" }], [], () => {}),
    ).rejects.toThrow("rate_limited");
  });
});
