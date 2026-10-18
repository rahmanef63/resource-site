import { z } from "zod";

// Limit bytes as they arrive; Content-Length can be absent or dishonest.
export async function readAiJson(req: Request, maxBytes = 200_000): Promise<
  { ok: true; value: unknown } | { ok: false; response: Response }
> {
  const reader = req.body?.getReader();
  if (!reader) return { ok: false, response: Response.json({ error: "invalid JSON body" }, { status: 400 }) };
  const decoder = new TextDecoder("utf-8", { fatal: true });
  let bytes = 0;
  let text = "";
  try {
    while (true) {
      const { value, done } = await reader.read();
      if (done) break;
      bytes += value.byteLength;
      if (bytes > maxBytes) {
        await reader.cancel().catch(() => {});
        return { ok: false, response: Response.json({ error: "payload too large" }, { status: 413 }) };
      }
      text += decoder.decode(value, { stream: true });
    }
    text += decoder.decode();
    return { ok: true, value: JSON.parse(text) as unknown };
  } catch {
    await reader.cancel().catch(() => {});
    return { ok: false, response: Response.json({ error: "invalid JSON body" }, { status: 400 }) };
  } finally {
    reader.releaseLock();
  }
}

const record = z.record(z.string(), z.unknown());
const toolUse = z.object({ id: z.string(), name: z.string(), input: record });
const agentMessage = z.discriminatedUnion("role", [
  z.object({ role: z.literal("user"), text: z.string() }),
  z.object({ role: z.literal("assistant"), text: z.string().optional(), toolUses: z.array(toolUse).optional() }),
  z.object({ role: z.literal("tool"), results: z.array(z.object({
    id: z.string(), content: z.string(), isError: z.boolean().optional(),
  })) }),
]);

export const agentBodySchema = z.object({
  messages: z.array(agentMessage).min(1),
  tools: z.array(z.object({
    name: z.string(), description: z.string(),
    input_schema: z.object({
      type: z.literal("object"), properties: record,
      required: z.array(z.string()).optional(), additionalProperties: z.boolean().optional(),
    }).passthrough(),
  })).optional(),
  system: z.string().optional(),
});

export const builderBodySchema = z.object({
  messages: z.array(z.object({ role: z.enum(["user", "assistant"]), content: z.string() })).min(1),
});
