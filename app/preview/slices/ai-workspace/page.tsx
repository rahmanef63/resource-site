"use client";

import { PreviewPage } from "@/components/site/preview-kit";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  AiAgentsPage,
  AiChatFab,
  AiStudioPage,
  type AiChatSend,
} from "@/features/ai-workspace";

// Mock backend for the chat FAB — resolves a canned reply so the preview
// works with no ANTHROPIC_API_KEY wired.
const mockChat: AiChatSend = async ({ prompt }) => {
  await new Promise((r) => setTimeout(r, 400));
  return {
    ok: true,
    text: /harga|biaya|price/i.test(prompt)
      ? "Estimasi mulai Rp 5jt; final tergantung scope."
      : "Halo! Aku bisa bantu chat, studio generation, atau memantau agent runs.",
  };
};

export default function Page() {
  return (
    <PreviewPage>
      <Tabs defaultValue="chat" className="flex h-screen w-full flex-col gap-0">
        <TabsList className="m-3 w-fit">
          <TabsTrigger value="chat">Chat</TabsTrigger>
          <TabsTrigger value="studio">Studio</TabsTrigger>
          <TabsTrigger value="agents">Agents</TabsTrigger>
        </TabsList>
        <TabsContent value="chat" className="min-h-0 flex-1 p-3">
          {/* `transform` anchors the FAB's `fixed` chrome to this card. */}
          <div className="relative h-full overflow-hidden rounded-lg border bg-muted/20 [transform:translateZ(0)]">
            <AiChatFab brand="Acme" chat={mockChat} />
          </div>
        </TabsContent>
        <TabsContent value="studio" className="min-h-0 flex-1 overflow-auto">
          <AiStudioPage />
        </TabsContent>
        <TabsContent value="agents" className="min-h-0 flex-1 overflow-auto">
          <AiAgentsPage />
        </TabsContent>
      </Tabs>
    </PreviewPage>
  );
}
