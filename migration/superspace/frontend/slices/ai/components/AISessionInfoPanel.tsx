"use client";

/**
 * AI Session Info Panel
 * 
 * Panel content component for the right column in ThreeColumnLayout.
 * Shows detailed information about an AI session without Sheet/Drawer wrapper.
 * 
 * For mobile, use AISessionInfoDrawer which wraps this in a Drawer.
 */

import { useState } from "react";
import { X, Settings2, Download, Trash2, Brain, Clock, MessageSquare, Sparkles, BookOpen, Share2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { AISession } from "@/frontend/shared/communications/chat/types/ai";
import type { AISessionInfoSection } from "./AISessionInfoDrawer";

// ============================================================================
// Types
// ============================================================================

export interface AISessionInfoPanelProps {
  session: AISession | null;
  onClose?: () => void;
  // Actions
  onDelete?: () => void;
  onExport?: (format: "json" | "markdown" | "pdf") => void;
  onShare?: () => void;
  onUpdateTitle?: (title: string) => void;
  onKnowledgeToggle?: (enabled: boolean) => void;
  knowledgeEnabled?: boolean;
}

// ============================================================================
// Section Navigation Items
// ============================================================================

const AI_SESSION_SECTIONS = [
  { id: "overview" as const, icon: MessageSquare, label: "Overview" },
  { id: "settings" as const, icon: Settings2, label: "Settings" },
  { id: "knowledge" as const, icon: BookOpen, label: "Knowledge" },
  { id: "export" as const, icon: Download, label: "Export" },
];

// ============================================================================
// Section Components
// ============================================================================

function OverviewSection({ session }: { session: AISession }) {
  const messageCount = session.messages?.length ?? 0;
  const userMessages = session.messages?.filter(m => m.role === "user").length ?? 0;
  const aiMessages = session.messages?.filter(m => m.role === "assistant").length ?? 0;

  return (
    <div className="space-y-6 p-4">
      {/* Session Header */}
      <div className="text-center">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mb-4">
          <Sparkles className="h-8 w-8 text-primary" />
        </div>
        <h2 className="text-xl font-semibold">{session.title || "New Chat"}</h2>
        <p className="text-sm text-muted-foreground mt-1">
          Created {session.createdAt ? new Date(session.createdAt).toLocaleDateString() : "recently"}
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        <div className="text-center p-3 rounded-lg bg-muted">
          <p className="text-2xl font-semibold">{messageCount}</p>
          <p className="text-xs text-muted-foreground">Messages</p>
        </div>
        <div className="text-center p-3 rounded-lg bg-muted">
          <p className="text-2xl font-semibold">{userMessages}</p>
          <p className="text-xs text-muted-foreground">You</p>
        </div>
        <div className="text-center p-3 rounded-lg bg-muted">
          <p className="text-2xl font-semibold">{aiMessages}</p>
          <p className="text-xs text-muted-foreground">AI</p>
        </div>
      </div>

      {/* Model Info */}
      {(session.model || session.settings?.model) && (
        <div className="rounded-lg border border-border bg-muted/30 p-4">
          <h3 className="font-medium mb-2 flex items-center gap-2">
            <Brain className="h-4 w-4" />
            Model
          </h3>
          <Badge variant="secondary">{session.model || session.settings?.model}</Badge>
        </div>
      )}

      {/* Last Updated */}
      <div className="rounded-lg border border-border bg-muted/30 p-4">
        <h3 className="font-medium mb-2 flex items-center gap-2">
          <Clock className="h-4 w-4" />
          Last Updated
        </h3>
        <p className="text-sm text-muted-foreground">
          {session.updatedAt ? new Date(session.updatedAt).toLocaleString() : "Unknown"}
        </p>
      </div>
    </div>
  );
}

function SettingsSection({ session, onDelete }: { session: AISession; onDelete?: () => void }) {
  return (
    <div className="space-y-6 p-4">
      <div className="rounded-lg border border-border bg-muted/30 p-4">
        <h3 className="font-medium mb-4">Chat Settings</h3>
        
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm">Auto-generate titles</p>
              <p className="text-xs text-muted-foreground">Automatically name conversations</p>
            </div>
            <Switch defaultChecked />
          </div>

          <Separator />

          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm">Save to history</p>
              <p className="text-xs text-muted-foreground">Include in conversation history</p>
            </div>
            <Switch defaultChecked />
          </div>

          <Separator />

          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm">Allow regeneration</p>
              <p className="text-xs text-muted-foreground">Enable response branching</p>
            </div>
            <Switch defaultChecked />
          </div>
        </div>
      </div>

      {/* Danger Zone */}
      <div className="rounded-lg border border-destructive/50 bg-destructive/5 p-4">
        <h3 className="font-medium mb-4 text-destructive">Danger Zone</h3>
        <Button variant="destructive" size="sm" className="w-full" onClick={onDelete}>
          <Trash2 className="h-4 w-4 mr-2" />
          Delete Conversation
        </Button>
      </div>
    </div>
  );
}

function KnowledgeSection({ 
  knowledgeEnabled, 
  onKnowledgeToggle 
}: { 
  knowledgeEnabled?: boolean;
  onKnowledgeToggle?: (enabled: boolean) => void;
}) {
  return (
    <div className="space-y-6 p-4">
      <div className="rounded-lg border border-border bg-muted/30 p-4">
        <h3 className="font-medium mb-4 flex items-center gap-2">
          <BookOpen className="h-4 w-4" />
          Knowledge Context
        </h3>

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm">Enable Knowledge</p>
              <p className="text-xs text-muted-foreground">Use workspace documents as context</p>
            </div>
            <Switch 
              checked={knowledgeEnabled} 
              onCheckedChange={onKnowledgeToggle}
            />
          </div>

          <Separator />

          <div className="text-sm text-muted-foreground">
            <p>When enabled, AI will reference your workspace documents to provide more accurate and contextual responses.</p>
          </div>
        </div>
      </div>
    </div>
  );
}

function ExportSection({ 
  session,
  onExport,
  onShare,
}: { 
  session: AISession;
  onExport?: (format: "json" | "markdown" | "pdf") => void;
  onShare?: () => void;
}) {
  return (
    <div className="space-y-6 p-4">
      <div className="rounded-lg border border-border bg-muted/30 p-4">
        <h3 className="font-medium mb-4 flex items-center gap-2">
          <Download className="h-4 w-4" />
          Export Conversation
        </h3>

        <div className="space-y-2">
          <Button 
            variant="outline" 
            size="sm" 
            className="w-full justify-start"
            onClick={() => onExport?.("markdown")}
          >
            <Download className="h-4 w-4 mr-2" />
            Export as Markdown
          </Button>
          <Button 
            variant="outline" 
            size="sm" 
            className="w-full justify-start"
            onClick={() => onExport?.("json")}
          >
            <Download className="h-4 w-4 mr-2" />
            Export as JSON
          </Button>
          <Button 
            variant="outline" 
            size="sm" 
            className="w-full justify-start"
            onClick={() => onExport?.("pdf")}
          >
            <Download className="h-4 w-4 mr-2" />
            Export as PDF
          </Button>
        </div>
      </div>

      <div className="rounded-lg border border-border bg-muted/30 p-4">
        <h3 className="font-medium mb-4 flex items-center gap-2">
          <Share2 className="h-4 w-4" />
          Share
        </h3>

        <Button 
          variant="outline" 
          size="sm" 
          className="w-full"
          onClick={onShare}
        >
          <Share2 className="h-4 w-4 mr-2" />
          Share Conversation
        </Button>
      </div>
    </div>
  );
}

// ============================================================================
// Main Component
// ============================================================================

export function AISessionInfoPanel({
  session,
  onClose,
  onDelete,
  onExport,
  onShare,
  onKnowledgeToggle,
  knowledgeEnabled,
}: AISessionInfoPanelProps) {
  const [activeSection, setActiveSection] = useState<AISessionInfoSection>("overview");

  if (!session) {
    return (
      <div className="flex flex-col h-full items-center justify-center p-6 text-center">
        <Sparkles className="h-10 w-10 text-muted-foreground/50 mb-3" />
        <p className="text-sm text-muted-foreground">
          Select a session to view details
        </p>
      </div>
    );
  }

  const renderContent = () => {
    switch (activeSection) {
      case "overview":
        return <OverviewSection session={session} />;
      case "settings":
        return <SettingsSection session={session} onDelete={onDelete} />;
      case "knowledge":
        return (
          <KnowledgeSection 
            knowledgeEnabled={knowledgeEnabled}
            onKnowledgeToggle={onKnowledgeToggle}
          />
        );
      case "export":
        return (
          <ExportSection 
            session={session} 
            onExport={onExport}
            onShare={onShare}
          />
        );
      default:
        return <OverviewSection session={session} />;
    }
  };

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex-shrink-0 border-b bg-muted/30">
        <div className="flex items-center justify-between px-4 py-3">
          <div className="flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-primary" />
            <span className="font-medium text-sm">Session Info</span>
          </div>
          {onClose && (
            <Button aria-label="Close"
              variant="ghost"
              size="icon"
              onClick={onClose}
              className="h-7 w-7 text-muted-foreground hover:text-foreground"
            >
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>
      </div>

      {/* Content with sidebar navigation */}
      <div className="flex flex-1 overflow-hidden">
        {/* Navigation sidebar */}
        <div className="w-44 border-r border-border bg-muted/30 p-2 space-y-1">
          {AI_SESSION_SECTIONS.map((section) => {
            const Icon = section.icon;
            return (
              <button
                key={section.id}
                onClick={() => setActiveSection(section.id)}
                className={cn(
                  "flex w-full items-center gap-2 rounded-lg p-2.5 text-left transition-colors text-sm",
                  activeSection === section.id
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                )}
              >
                <Icon className="h-4 w-4 flex-shrink-0" />
                <span className="font-medium">{section.label}</span>
              </button>
            );
          })}
        </div>

        {/* Content area */}
        <ScrollArea className="flex-1">
          {renderContent()}
        </ScrollArea>
      </div>
    </div>
  );
}

export default AISessionInfoPanel;
