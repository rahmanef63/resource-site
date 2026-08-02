"use client";
/** Variant preview (VP wave) — rr-internal, stripped on `rr add`. */
import type { SlicePreviewModule } from "@/shared/preview/types";
import { AiChatFab, type AiChatSend } from "./components/AiChatFab";

const CANNED: Record<string, string> = {
  default:
    "Tentu! Aku bisa bantu jelaskan layanan, kisaran harga, dan langkah memulai. Mau mulai dari yang mana?",
  harga: "Estimasi mulai dari Rp 5jt; final tergantung scope. Mau aku breakdown per paket?",
};

const mockChat: AiChatSend = async ({ prompt }) => {
  await new Promise((r) => setTimeout(r, 500));
  const key = /harga|biaya|price/i.test(prompt) ? "harga" : "default";
  return { ok: true, text: CANNED[key] };
};

const preview: SlicePreviewModule = {
  AiChatFab: ({ variant }) => {
    const scenario = variant.scenario ?? "with-mock-bot";
    const wired = scenario !== "unconfigured";
    return (
      <div className="p-4">
        {/* `transform` on the wrapper anchors the FAB's `fixed` chrome to this
            card instead of the viewport. */}
        <div className="relative h-[28rem] overflow-hidden rounded-lg border bg-muted/20 [transform:translateZ(0)]">
          <AiChatFab brand="Acme" chat={wired ? mockChat : undefined} />
        </div>
      </div>
    );
  },
};
export default preview;
