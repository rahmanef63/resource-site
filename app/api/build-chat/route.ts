/**
 * Builder AI chat (VP wave) — POST { messages } → { text, actions, notice? }.
 *
 * Server-side manual tool loop over the dynamic tool surface in
 * lib/preview/ai-tools.ts (tools generated from the catalog + preview
 * metadata at request time — no hardcoded slices). Data tools execute here;
 * validated preview_slice calls come back as `actions` for the client to
 * render with <VariantPreview/>.
 *
 * Key-guarded like convex/features/aiChat: no ANTHROPIC_API_KEY → friendly
 * notice, never a build/runtime throw.
 */

import Anthropic from "@anthropic-ai/sdk";
import { extractIp, rateLimit } from "@/lib/rate-limit-memory";
import {
  buildBuilderTools,
  executeBuilderTool,
  type PreviewAction,
} from "@/lib/preview/ai-tools";

// Node runtime is the Next 16 default for route handlers — the explicit
// `export const runtime` segment config trips Turbopack here.

const MODEL = process.env.RR_BUILDER_MODEL ?? "claude-opus-4-8";
const MAX_LOOPS = 6;
// Each request can fan out to MAX_LOOPS upstream model calls — without a
// per-IP gate this is anonymous unbounded Anthropic spend.
const RATE = { limit: 10, windowMs: 10 * 60_000 };
const MAX_MESSAGE_CHARS = 4_000;

const SYSTEM = `You are the Rahman Resources bundle-builder assistant. Help the
user discover slices, preview them, and compose an install bundle.
- Use list_slices / get_slice to look things up — never invent slugs.
- When the user wants to SEE a slice, call preview_slice (the widget renders
  live in the builder UI next to your reply).
- When they have picked slices, call compose_bundle and relay the commands.
- Be terse. Plain text only, no markdown headings.`;

interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

export async function POST(req: Request) {
  const key = process.env.ANTHROPIC_API_KEY;
  if (!key) {
    return Response.json({
      text: "",
      actions: [],
      notice:
        "Builder AI is not configured — the site owner must set ANTHROPIC_API_KEY on the deployment.",
    });
  }

  const gate = rateLimit(`build-chat:${extractIp(req)}`, RATE);
  if (!gate.ok) {
    return Response.json(
      { error: "rate limited" },
      { status: 429, headers: { "Retry-After": String(gate.retryAfterSec) } },
    );
  }

  let body: { messages?: ChatMessage[] };
  try {
    body = await req.json();
  } catch {
    return Response.json({ error: "invalid JSON body" }, { status: 400 });
  }
  const history = (body.messages ?? [])
    .filter(
      (m) =>
        (m.role === "user" || m.role === "assistant") &&
        typeof m.content === "string",
    )
    .slice(-20);
  if (history.some((m) => m.content.length > MAX_MESSAGE_CHARS)) {
    return Response.json({ error: "message too long" }, { status: 413 });
  }
  if (history.length === 0 || history[history.length - 1].role !== "user") {
    return Response.json({ error: "last message must be from the user" }, { status: 400 });
  }

  const client = new Anthropic({ apiKey: key });
  const tools = buildBuilderTools();
  const messages: Anthropic.MessageParam[] = history.map((m) => ({
    role: m.role,
    content: m.content,
  }));

  const actions: PreviewAction[] = [];
  const texts: string[] = [];

  try {
    for (let i = 0; i < MAX_LOOPS; i++) {
      const response = await client.messages.create({
        model: MODEL,
        max_tokens: 2048,
        system: SYSTEM,
        tools,
        messages,
      });

      const toolUses = response.content.filter(
        (b): b is Anthropic.ToolUseBlock => b.type === "tool_use",
      );
      for (const block of response.content) {
        if (block.type === "text" && block.text.trim()) texts.push(block.text);
      }

      if (response.stop_reason !== "tool_use" || toolUses.length === 0) break;

      messages.push({ role: "assistant", content: response.content });
      const results: Anthropic.ToolResultBlockParam[] = toolUses.map((tu) => {
        const out = executeBuilderTool(tu.name, tu.input as Record<string, unknown>);
        if (out.action) actions.push(out.action);
        return {
          type: "tool_result",
          tool_use_id: tu.id,
          content: out.result,
          is_error: out.isError ?? false,
        };
      });
      messages.push({ role: "user", content: results });
    }
  } catch (e) {
    return Response.json({
      text: "",
      actions,
      notice: `Builder AI request failed: ${(e as Error).message}`,
    });
  }

  return Response.json({ text: texts.join("\n\n"), actions });
}
