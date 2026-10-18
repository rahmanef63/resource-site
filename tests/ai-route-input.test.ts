// @vitest-environment node
import { afterEach, describe, expect, it, vi } from "vitest";

const upstream = vi.hoisted(() => ({ create: vi.fn(), stream: vi.fn() }));
vi.mock("@anthropic-ai/sdk", () => ({
  default: class { messages = upstream; },
}));
import { POST as agent } from "@/app/api/agent-stream/route";
import { POST as builder } from "@/app/api/build-chat/route";

let ip = 0;
function request(body: unknown) {
  return new Request("http://localhost/api/chat", {
    method: "POST",
    headers: { "x-real-ip": `test-${ip++}` },
    body: JSON.stringify(body),
  });
}

afterEach(() => { vi.unstubAllEnvs(); vi.clearAllMocks(); });

for (const [name, post, valid] of [
  ["agent", agent, { messages: [{ role: "user", text: "Hello" }] }],
  ["builder", builder, { messages: [{ role: "user", content: "Hello" }] }],
] as const) {
  describe(`${name} input boundary`, () => {
    for (const body of [null, [], { messages: null }, { messages: {} }, { messages: [null] }]) {
      it(`returns 400 for ${JSON.stringify(body)}`, async () => {
        vi.stubEnv("ANTHROPIC_API_KEY", "test-only");
        expect((await post(request(body))).status).toBe(400);
        expect(upstream.create).not.toHaveBeenCalled();
        expect(upstream.stream).not.toHaveBeenCalled();
      });
    }

    it("stops reading an oversized stream before buffering the full body", async () => {
      vi.stubEnv("ANTHROPIC_API_KEY", "test-only");
      let chunks = 0;
      let cancelled = false;
      const body = new ReadableStream<Uint8Array>({
        pull(controller) {
          chunks++;
          controller.enqueue(new Uint8Array(64_000).fill(32));
          if (chunks === 20) controller.close();
        },
        cancel() { cancelled = true; },
      });
      const req = new Request("http://localhost/api/chat", {
        method: "POST", body, duplex: "half",
        headers: { "x-real-ip": `test-${ip++}` },
      } as RequestInit & { duplex: string });
      expect((await post(req)).status).toBe(413);
      expect(chunks).toBeLessThan(20);
      expect(cancelled).toBe(true);
      expect(upstream.create).not.toHaveBeenCalled();
      expect(upstream.stream).not.toHaveBeenCalled();
    });

    it("preserves the configured-off response", async () => {
      vi.stubEnv("ANTHROPIC_API_KEY", "");
      expect((await post(request(valid))).status).toBe(200);
    });
  });
}

it("passes valid builder history to the model", async () => {
  vi.stubEnv("ANTHROPIC_API_KEY", "test-only");
  upstream.create.mockResolvedValue({ content: [{ type: "text", text: "Hello" }], stop_reason: "end_turn" });
  const response = await builder(request({ messages: [{ role: "user", content: "Hi" }] }));
  expect(await response.json()).toMatchObject({ text: "Hello", actions: [] });
  expect(upstream.create).toHaveBeenCalledWith(expect.objectContaining({ messages: [{ role: "user", content: "Hi" }] }));
});

it("rejects invalid agent tools and nested tool results", async () => {
  vi.stubEnv("ANTHROPIC_API_KEY", "test-only");
  for (const body of [
    { messages: [{ role: "user", text: 123 }] },
    { messages: [{ role: "tool", results: [null] }] },
    { messages: [{ role: "assistant", toolUses: [null] }] },
    { messages: [{ role: "user", text: "Hi" }], tools: {} },
    { messages: [{ role: "user", text: "Hi" }], tools: [null] },
  ]) expect((await agent(request(body))).status).toBe(400);
  expect(upstream.stream).not.toHaveBeenCalled();
});

it("preserves a valid agent tool round trip and custom system prompt", async () => {
  vi.stubEnv("ANTHROPIC_API_KEY", "test-only");
  upstream.stream.mockReturnValue({
    on: vi.fn(),
    finalMessage: vi.fn().mockResolvedValue({
      content: [{ type: "text", text: "Done" }], stop_reason: "end_turn",
    }),
  });
  const response = await agent(request({
    messages: [
      { role: "user", text: "Hi" },
      { role: "assistant", toolUses: [{ id: "tool-1", name: "read", input: {} }] },
      { role: "tool", results: [{ id: "tool-1", content: "result" }] },
    ],
    tools: [{ name: "read", description: "Read", input_schema: { type: "object", properties: {} } }],
    system: "Custom system",
  }));
  expect(response.headers.get("content-type")).toContain("text/event-stream");
  expect(await response.text()).toContain('"text":"Done"');
  expect(upstream.stream).toHaveBeenCalledWith(expect.objectContaining({ system: "Custom system" }));
});
