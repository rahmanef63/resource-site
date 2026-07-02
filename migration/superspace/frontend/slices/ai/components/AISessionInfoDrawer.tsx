"use client";

/**
 * AI Session Info Drawer
 * 
 * Shows detailed information about an AI session:
 * - Session metadata (title, icon, created date)
 * - Knowledge context settings
 * - Model/provider settings used
 * - Message statistics
 * - Export options
 */

import { useState } from "react";
import { ArrowLeft, X, Settings2, FileText, Download, Trash2, Share2, Brain, Clock, MessageSquare, Sparkles, BookOpen } from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { useIsMobile } from "@/hooks/use-mobile";
import { cn } from "@/lib/utils";
import type { AISession } from "@/frontend/shared/communications/chat/types/ai";

// ============================================================================
// Types
// ============================================================================

export type AISessionInfoSection = "overview" | "settings" | "knowledge" | "export";

export interface AISessionInfoDrawerProps {
  session: AISession | null;
  isOpen: boolean;
  onClose: () => void;
  onBack?: () => void;
  side?: "left" | "right";
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

function SettingsSection({ session }: { session: AISession }) {
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
        <Button variant="destructive" size="sm" className="w-full">
          <Trash2 className="h-4 w-4 mr-2" />
          Delete Conversation
        </Button>
      </div>
    </div>
  );
}

function KnowledgeSection({ 
  session, 
  knowledgeEnabled, 
  onKnowledgeToggle 
}: { 
  session: AISession; 
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
              <p className="text-xs text-muted-foreground">Use workspace knowledge in responses</p>
            </div>
            <Switch 
              checked={knowledgeEnabled} 
              onCheckedChange={onKnowledgeToggle}
            />
          </div>

          {knowledgeEnabled && (
            <>
              <Separator />
              <div>
                <p className="text-sm mb-2">Active Sources</p>
                <div className="flex flex-wrap gap-2">
                  <Badge variant="outline">Documents</Badge>
                  <Badge variant="outline">Notes</Badge>
                  <Badge variant="outline">Tasks</Badge>
                </div>
              </div>
            </>
          )}
        </div>
      </div>

      <div className="rounded-lg border border-border bg-muted/30 p-4">
        <h3 className="font-medium mb-2">Context Window</h3>
        <p className="text-sm text-muted-foreground mb-4">
          Manage how much context is sent with each message
        </p>
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span>Messages included</span>
            <span className="text-muted-foreground">Last 10</span>
          </div>
          <div className="flex justify-between text-sm">
            <span>Token estimate</span>
            <span className="text-muted-foreground">~4,000</span>
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
            className="w-full justify-start"
            onClick={() => onExport?.("markdown")}
          >
            <FileText className="h-4 w-4 mr-2" />
            Export as Markdown
          </Button>
          <Button 
            variant="outline" 
            className="w-full justify-start"
            onClick={() => onExport?.("json")}
          >
            <FileText className="h-4 w-4 mr-2" />
            Export as JSON
          </Button>
          <Button 
            variant="outline" 
            className="w-full justify-start"
            onClick={() => onExport?.("pdf")}
          >
            <FileText className="h-4 w-4 mr-2" />
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
          className="w-full"
          onClick={onShare}
        >
          <Share2 className="h-4 w-4 mr-2" />
          Create Share Link
        </Button>
        <p className="text-xs text-muted-foreground mt-2 text-center">
          Anyone with the link can view this conversation
        </p>
      </div>
    </div>
  );
}

// ============================================================================
// Main Component
// ============================================================================

export function AISessionInfoDrawer({
  session,
  isOpen,
  onClose,
  onBack,
  side = "right",
  onDelete,
  onExport,
  onShare,
  onUpdateTitle,
  onKnowledgeToggle,
  knowledgeEnabled,
}: AISessionInfoDrawerProps) {
  const [activeSection, setActiveSection] = useState<AISessionInfoSection>("overview");
  const isMobile = useIsMobile();

  if (!session) return null;

  // Header with back button
  const HeaderContent = (
    <div className="flex items-center justify-between w-full">
      <div className="flex items-center gap-2">
        {onBack && (
          <Button aria-label="Back"
            variant="ghost"
            size="icon"
            onClick={onBack}
            className="h-8 w-8 text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
        )}
        <span className="text-base font-semibold">Session Info</span>
      </div>
      <Button aria-label="Close"
        variant="ghost"
        size="icon"
        onClick={onClose}
        className="h-8 w-8 text-muted-foreground hover:text-foreground"
      >
        <X className="h-4 w-4" />
      </Button>
    </div>
  );

  // Content renderer
  const renderContent = () => {
    switch (activeSection) {
      case "overview":
        return <OverviewSection session={session} />;
      case "settings":
        return <SettingsSection session={session} />;
      case "knowledge":
        return (
          <KnowledgeSection 
            session={session} 
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

  // Mobile: Use Drawer
  if (isMobile) {
    return (
      <Drawer open={isOpen} onOpenChange={(open) => !open && onClose()}>
        <DrawerContent className="h-[90vh]">
          <DrawerHeader className="border-b border-border px-4 py-3">
            <DrawerTitle className="sr-only">{session.title || "Session"} Info</DrawerTitle>
            {HeaderContent}
          </DrawerHeader>

          <div className="flex flex-col flex-1 overflow-hidden">
            {/* Mobile: Section tabs as horizontal scroll */}
            <div className="flex gap-1 p-2 border-b border-border overflow-x-auto scrollbar-hide">
              {AI_SESSION_SECTIONS.map((section) => {
                const Icon = section.icon;
                return (
                  <button
                    key={section.id}
                    onClick={() => setActiveSection(section.id)}
                    className={cn(
                      "flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-colors",
                      activeSection === section.id
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                    )}
                  >
                    <Icon className="h-3 w-3" />
                    {section.label}
                  </button>
                );
              })}
            </div>

            <ScrollArea className="flex-1">
              {renderContent()}
            </ScrollArea>
          </div>
        </DrawerContent>
      </Drawer>
    );
  }

  // Desktop: Use Sheet
  return (
    <Sheet open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <SheetContent
        side={side}
        className="w-full max-w-md p-0 flex flex-col"
      >
        <SheetHeader className="border-b border-border px-4 py-3">
          <SheetTitle className="sr-only">{session.title || "Session"} Info</SheetTitle>
          {HeaderContent}
        </SheetHeader>

        <div className="flex flex-1 overflow-hidden">
          {/* Navigation sidebar */}
          <div className="w-48 border-r border-border bg-muted/30 p-2 space-y-1">
            {AI_SESSION_SECTIONS.map((section) => {
              const Icon = section.icon;
              return (
                <button
                  key={section.id}
                  onClick={() => setActiveSection(section.id)}
                  className={cn(
                    "flex w-full items-center gap-3 rounded-lg p-3 text-left transition-colors",
                    activeSection === section.id
                      ? "bg-primary text-primary-foreground"
                      : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                  )}
                >
                  <Icon className="h-5 w-5 flex-shrink-0" />
                  <span className="font-medium">{section.label}</span>
                </button>
              );
            })}
          </div>

          <ScrollArea className="flex-1">
            {renderContent()}
          </ScrollArea>
        </div>
      </SheetContent>
    </Sheet>
  );
}

export default AISessionInfoDrawer;
