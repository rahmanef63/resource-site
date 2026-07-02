"use client";

/**
 * AI View - Main Feature Container
 * 
 * Uses the three-panel architecture:
 * - Left: AILeftPanel (Sessions list)
 * - Center: AICenterPanel (Chat conversation)
 * - Right: AIRightPanel (Session info)
 */

import { useState, useCallback } from "react";
import { useIsMobile } from "@/hooks/use-mobile";
import { MobileHeader } from "@/frontend/shared/ui/layout/header";
import { Sparkles } from "lucide-react";
import { FeatureThreeColumnLayout } from "@/frontend/shared/ui/layout/container";
import { useAIStore } from "./stores";
import { useInitializeAI, useAIActions } from "./hooks";
import { AILeftPanel, AICenterPanel, AIRightPanel } from "./panels";
import { AISessionInfoDrawer } from "./components/AISessionInfoDrawer";

export function AIView() {
  const isMobile = useIsMobile();

  // Initialize AI store with workspace context
  useInitializeAI();

  // Use store state and actions
  const selectedSessionId = useAIStore((s) => s.selectedSessionId);
  const selectedSession = useAIStore((s) => s.selectedSession);
  const knowledgeEnabled = useAIStore((s) => s.knowledgeEnabled);
  const { selectSession } = useAIActions();

  // Get setKnowledgeEnabled directly from store
  const handleKnowledgeToggle = useCallback((enabled: boolean) => {
    useAIStore.getState().setKnowledgeEnabled(enabled);
  }, []);

  // Panel collapse states
  const [leftPanelCollapsed, setLeftPanelCollapsed] = useState(false);
  const [rightPanelCollapsed, setRightPanelCollapsed] = useState(!selectedSessionId);
  // Mobile drawer state
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);

  const handleChatSelect = useCallback((chatId: string) => {
    selectSession(chatId as any);
    // Auto-expand right panel when selecting a session
    setRightPanelCollapsed(false);
  }, [selectSession]);

  const handleBack = useCallback(() => {
    if (selectedSessionId) {
      selectSession(null);
    }
  }, [selectedSessionId, selectSession]);

  const handleToggleRightPanel = useCallback(() => {
    setRightPanelCollapsed(prev => !prev);
  }, []);

  // ============================================================================
  // Mobile Layout
  // ============================================================================

  if (isMobile) {
    // On mobile, show either AI chat list or AI chat detail, not both
    if (selectedSessionId) {
      return (
        <div className="flex flex-col h-full bg-background">
          {/* No duplicate header - AICenterPanel has its own AIChatHeader */}
          <AICenterPanel
            chatId={selectedSessionId}
            onBack={handleBack}
            onToggleInfo={() => setMobileDrawerOpen(true)}
            isInfoOpen={mobileDrawerOpen}
          />

          {/* Mobile: Use Drawer for session info */}
          <AISessionInfoDrawer
            session={selectedSession as any}
            isOpen={mobileDrawerOpen}
            onClose={() => setMobileDrawerOpen(false)}
            onBack={() => setMobileDrawerOpen(false)}
            knowledgeEnabled={knowledgeEnabled}
            onKnowledgeToggle={handleKnowledgeToggle}
          />
        </div>
      );
    }

    return (
      <div className="flex flex-col h-full bg-background">
        <MobileHeader
          title="AI"
          icon={Sparkles}
          onBack={handleBack}
        />
        <AILeftPanel
          selectedSessionId={selectedSessionId}
          onSessionSelect={handleChatSelect}
        />
      </div>
    );
  }

  // ============================================================================
  // Desktop Layout - Three Column
  // ============================================================================

  return (
    <div className="flex h-full flex-col overflow-hidden">
      <FeatureThreeColumnLayout
        rightHidden={false}
        preset="feature"
        // Panel Components
        sidebarContent={
          <AILeftPanel
            selectedSessionId={selectedSessionId}
            onSessionSelect={handleChatSelect}
          />
        }
        mainContent={
          <AICenterPanel
            chatId={selectedSessionId ?? undefined}
            onBack={handleBack}
            onToggleInfo={handleToggleRightPanel}
            isInfoOpen={!rightPanelCollapsed}
          />
        }
        inspector={
          <AIRightPanel
            session={selectedSession}
            onClose={() => setRightPanelCollapsed(true)}
            knowledgeEnabled={knowledgeEnabled}
            onKnowledgeToggle={handleKnowledgeToggle}
          />
        }
        // Labels
        leftLabel="Sessions"
        centerLabel="AI Chat"
        rightLabel="Session Info"
        persistState={true}
        storageKey="ai-layout"
        collapseLeftAt={640}
        // Controlled left panel state
        leftCollapsed={leftPanelCollapsed}
        onLeftCollapsedChange={setLeftPanelCollapsed}
        // Controlled right panel state
        rightCollapsed={rightPanelCollapsed}
        onRightCollapsedChange={setRightPanelCollapsed}
      />
    </div>
  );
}
