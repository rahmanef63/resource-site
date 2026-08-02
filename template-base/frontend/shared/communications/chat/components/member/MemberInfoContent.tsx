import { ScrollArea } from "@/components/ui/scroll-area";
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
import {
  OverviewSection,
  MediaSection,
  FilesSection,
  LinksSection,
  EventsSection,
  EncryptionSection,
  GroupsSection,
} from "./sections";
import { MEMBER_INFO_SECTIONS } from "./constants";

export type MemberInfoContentProps = {
  activeSection: MemberInfoSection;
  contact: MemberInfoContact;
  profile?: (MemberProfile & { presenceLabel?: string }) | null;
  isMobile: boolean;
  loading?: MemberInfoLoading;
  sharedMedia?: SharedMediaItem[];
  sharedFiles?: SharedFileItem[];
  sharedLinks?: SharedLinkItem[];
  commonGroups?: CommonGroup[];
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

export function MemberInfoContent({
  activeSection,
  contact,
  profile,
  isMobile,
  loading,
  sharedMedia,
  sharedFiles,
  sharedLinks,
  commonGroups,
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
}: MemberInfoContentProps) {
  const renderSection = () => {
    switch (activeSection) {
      case "overview":
        return (
          <OverviewSection 
            contact={contact} 
            profile={profile ?? undefined}
            isMobile={isMobile}
            isLoadingProfile={loading?.profile}
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
        );
      case "media":
        return <MediaSection isMobile={isMobile} items={sharedMedia} isLoading={loading?.sharedMedia} />;
      case "files":
        return <FilesSection isMobile={isMobile} files={sharedFiles} isLoading={loading?.sharedFiles} />;
      case "links":
        return <LinksSection isMobile={isMobile} links={sharedLinks} isLoading={loading?.sharedLinks} />;
      case "events":
        return <EventsSection isMobile={isMobile} />;
      case "encryption":
        return <EncryptionSection isMobile={isMobile} />;
      case "groups":
        return <GroupsSection isMobile={isMobile} groups={commonGroups} isLoading={loading?.commonGroups} />;
      default:
        return (
          <OverviewSection 
            contact={contact} 
            isMobile={isMobile}
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
        );
    }
  };

  const activeLabel =
    MEMBER_INFO_SECTIONS.find((s) => s.id === activeSection)?.label ??
    activeSection;

  return (
    <div className="flex flex-1 flex-col">
      <div className="border-b border-border bg-muted/30 p-3 md:p-4">
        <h3 className="text-lg font-semibold capitalize text-foreground md:text-xl">
          {activeLabel}
        </h3>
      </div>

      <ScrollArea className="flex-1">
        <div className={`bg-background ${isMobile ? "p-4" : "p-6"}`}>
          {renderSection()}
        </div>
      </ScrollArea>
    </div>
  );
}
