/**
 * Live model bridge for the shared agentic kit — ONE-turn streaming proxy.
 *
 * The agent LOOP runs client-side (lib/shared/agentic/agent-loop.ts): tools
 * bind to LIVE React state (useEditor, useFiles…), so they can only execute in
 * the browser. This route is therefore a single Anthropic turn — translate the
 * shared `AgentMsg[]` history → Anthropic messages, stream text deltas back as
 * SSE, and emit a final `turn` event carrying {text, toolUses, stopReason}.
 * The client dispatches the tool_uses against the registry, then calls again
 * with the tool_results. The host wires this via `createSseAgentStream`.
 *
 * Key-guarded like app/api/build-chat: no ANTHROPIC_API_KEY → a friendly SSE
 * turn, never a build/runtime throw. Per-IP rate limited (each chat turn is an
 * upstream model call).
 *
 * @module app/api/agent-stream/route
 */

import Anthropic from "@anthropic-ai/sdk";
import { extractIp, rateLimit } from "@/lib/rate-limit-memory";
import { BASE_AGENT_SYSTEM, type AgentMsg, type AnthropicTool, type ToolUse } from "@/shared/agentic";

const MODEL = process.env.RR_AGENT_MODEL ?? "claude-sonnet-4-6";
const MAX_TURN_MESSAGES = 60;
const MAX_BODY_CHARS = 200_000;
const RATE = { limit: 20, windowMs: 10 * 60_000 };

// rr's own preview desktop demo. The base rules are the shared, copy-safe
// custom instruction (lib/shared/agentic/prompt.ts); a real BYOK consumer
// sends its own `system` (e.g. registry.systemPrompt()) in the request body.
const SYSTEM = `${BASE_AGENT_SYSTEM}\n\nContext: you are inside Rahman OS, a web desktop; the open apps expose the tools.`;

type Body = { messages?: AgentMsg[]; tools?: AnthropicTool[]; system?: string };

/** Shared AgentMsg[] → Anthropic MessageParam[]. */
function toAnthropic(messages: AgentMsg[]): Anthropic.MessageParam[] {
  const out: Anthropic.MessageParam[] = [];
  for (const m of messages) {
    if (m.role === "user") {
      out.push({ role: "user", content: m.text });
    } else if (m.role === "assistant") {
      const content: Anthropic.ContentBlockParam[] = [];
      if (m.text) content.push({ type: "text", text: m.text });
      for (const tu of m.toolUses ?? [])
        content.push({ type: "tool_use", id: tu.id, name: tu.name, input: tu.input });
      if (content.length) out.push({ role: "assistant", content });
    } else {
      out.push({
        role: "user",
        content: m.results.map((r) => ({
          type: "tool_result" as const,
          tool_use_id: r.id,
          content: r.content,
          is_error: r.isError ?? false,
        })),
      });
    }
  }
  return out;
}

function sse(payload: unknown): Uint8Array {
  return new TextEncoder().encode(`data: ${JSON.stringify(payload)}\n\n`);
}

function oneTurn(text: string, toolUses: ToolUse[], stopReason: string | null) {
  return { type: "turn", turn: { text, toolUses, stopReason } };
}

/** Always-SSE response from a ready-made event list (no-key / config states). */
function staticStream(events: unknown[]): Response {
  const body = new ReadableStream({
    start(controller) {
      for (const e of events) controller.enqueue(sse(e));
      controller.close();
    },
  });
  return new Response(body, { headers: SSE_HEADERS });
}

const SSE_HEADERS = {
  "Content-Type": "text/event-stream; charset=utf-8",
  "Cache-Control": "no-cache, no-transform",
  Connection: "keep-alive",
};

export async function POST(req: Request) {
  const key = process.env.ANTHROPIC_API_KEY;
  if (!key) {
    return staticStream([
      oneTurn(
        "The assistant is not configured — the site owner must set ANTHROPIC_API_KEY on the deployment.",
        [],
        "end_turn",
      ),
    ]);
  }

  const gate = rateLimit(`agent-stream:${extractIp(req)}`, RATE);
  if (!gate.ok) {
    return Response.json(
      { error: "rate limited" },
      { status: 429, headers: { "Retry-After": String(gate.retryAfterSec) } },
    );
  }

  const raw = await req.text();
  if (raw.length > MAX_BODY_CHARS)
    return Response.json({ error: "payload too large" }, { status: 413 });
  let body: Body;
  try {
    body = JSON.parse(raw) as Body;
  } catch {
    return Response.json({ error: "invalid JSON body" }, { status: 400 });
  }

  const history = (body.messages ?? []).slice(-MAX_TURN_MESSAGES);
  const tools = body.tools ?? [];
  if (!Array.isArray(history) || history.length === 0)
    return Response.json({ error: "messages required" }, { status: 400 });

  const client = new Anthropic({ apiKey: key });
  const messages = toAnthropic(history);
  const system = typeof body.system === "string" ? body.system : SYSTEM;

  const stream = new ReadableStream({
    async start(controller) {
      try {
        const turn = client.messages.stream({
          model: MODEL,
          max_tokens: 2048,
          system,
          tools: tools as Anthropic.Tool[],
          messages,
        });
        turn.on("error", () => {}); // surfaced via finalMessage rejection
        turn.on("text", (delta) => controller.enqueue(sse({ type: "delta", text: delta })));
        const final = await turn.finalMessage();
        const text = final.content
          .filter((b): b is Anthropic.TextBlock => b.type === "text")
          .map((b) => b.text)
          .join("");
        const toolUses: ToolUse[] = final.content
          .filter((b): b is Anthropic.ToolUseBlock => b.type === "tool_use")
          .map((b) => ({ id: b.id, name: b.name, input: b.input as Record<string, unknown> }));
        controller.enqueue(sse(oneTurn(text, toolUses, final.stop_reason)));
      } catch (e) {
        controller.enqueue(
          sse(oneTurn(`AI request failed: ${(e as Error).message}`, [], "error")),
        );
      } finally {
        controller.close();
      }
    },
  });

  return new Response(stream, { headers: SSE_HEADERS });
}
