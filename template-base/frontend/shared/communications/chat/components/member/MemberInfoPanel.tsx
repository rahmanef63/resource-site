"use client";

/**
 * Member Info Panel
 * 
 * Panel content component for the right column in ThreeColumnLayout.
 * Shows detailed information about a member/contact without Sheet/Drawer wrapper.
 * 
 * For mobile, use MemberInfoDrawer which wraps this in a Drawer.
 */

import { useState } from "react";
import { X, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import { MemberInfoContent } from "./MemberInfoContent";
import { NavigationItem } from "./NavigationItem";
import { MEMBER_INFO_SECTIONS, DEFAULT_MEMBER_INFO_SECTION } from "./constants";
import type {
  MemberInfoContact,
  MemberInfoSection,
  MemberInfoLoading,
  SharedMediaItem,
  SharedFileItem,
  SharedLinkItem,
  CommonGroup,
} from "./types";
import type { MemberProfile } from "@/frontend/shared/communications/chat/types/member";

export type MemberInfoPanelProps = {
  contact: MemberInfoContact | null;
  profile?: (MemberProfile & { presenceLabel?: string }) | null;
  loading?: MemberInfoLoading;
  sharedMedia?: SharedMediaItem[];
  sharedFiles?: SharedFileItem[];
  sharedLinks?: SharedLinkItem[];
  commonGroups?: CommonGroup[];
  onClose?: () => void;
  /** Member action callbacks */
  isFavorite?: boolean;
  isBlocked?: boolean;
  onAddToFavorites?: () => void;
  onRemoveFromFavorites?: () => void;
  onBlock?: () => void;
  onUnblock?: () => void;
  onReport?: () => void;
  onVideoCall?: () => void;
  onVoiceCall?: () => void;
  onInviteToWorkspace?: () => void;
  canInviteToWorkspace?: boolean;
  workspaceInviteLabel?: string;
  workspaceInviteHint?: string;
};

/**
 * MemberInfoPanel - Direct panel content for ThreeColumnLayout right panel
 * No Sheet/Drawer wrapper - used directly in the layout
 */
export function MemberInfoPanel({
  contact,
  profile,
  loading,
  sharedMedia,
  sharedFiles,
  sharedLinks,
  commonGroups,
  onClose,
  isFavorite,
  isBlocked,
  onAddToFavorites,
  onRemoveFromFavorites,
  onBlock,
  onUnblock,
  onReport,
  onVideoCall,
  onVoiceCall,
  onInviteToWorkspace,
  canInviteToWorkspace,
  workspaceInviteLabel,
  workspaceInviteHint,
}: MemberInfoPanelProps) {
  const [activeSection, setActiveSection] = useState<MemberInfoSection>(
    DEFAULT_MEMBER_INFO_SECTION
  );

  if (!contact) {
    return (
      <div className="flex flex-col h-full items-center justify-center p-6 text-center">
        <User className="h-10 w-10 text-muted-foreground/50 mb-3" />
        <p className="text-sm text-muted-foreground">
          Select a chat to view contact info
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex-shrink-0 border-b bg-muted/30">
        <div className="flex items-center justify-between px-4 py-3">
          <div className="flex items-center gap-2">
            <User className="h-4 w-4 text-primary" />
            <span className="font-medium text-sm">Contact Info</span>
          </div>
          {onClose && (
            <Button
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
          {MEMBER_INFO_SECTIONS.map((section) => (
            <NavigationItem
              key={section.id}
              id={section.id}
              icon={section.icon}
              label={section.label}
              isActive={activeSection === section.id}
              onClick={() => setActiveSection(section.id)}
              isMobile={false}
            />
          ))}
        </div>

        {/* Content area */}
        <ScrollArea className="flex-1">
          <MemberInfoContent
            activeSection={activeSection}
            contact={contact}
            profile={profile ?? undefined}
            isMobile={false}
            loading={loading}
            sharedMedia={sharedMedia}
            sharedFiles={sharedFiles}
            sharedLinks={sharedLinks}
            commonGroups={commonGroups}
            isFavorite={isFavorite}
            isBlocked={isBlocked}
            onAddToFavorites={onAddToFavorites}
            onRemoveFromFavorites={onRemoveFromFavorites}
            onBlock={onBlock}
            onUnblock={onUnblock}
            onReport={onReport}
            onVideoCall={onVideoCall}
            onVoiceCall={onVoiceCall}
            onInviteToWorkspace={onInviteToWorkspace}
            canInviteToWorkspace={canInviteToWorkspace}
            workspaceInviteLabel={workspaceInviteLabel}
            workspaceInviteHint={workspaceInviteHint}
          />
        </ScrollArea>
      </div>
    </div>
  );
}

export default MemberInfoPanel;
