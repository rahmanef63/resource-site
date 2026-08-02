"use client";

import { useState } from "react";
import { ArrowLeft, X } from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerDescription,
} from "@/components/ui/drawer";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useIsMobile } from "@/hooks/use-mobile";
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

export type MemberInfoDrawerProps = {
  contact: MemberInfoContact | null;
  profile?: (MemberProfile & { presenceLabel?: string }) | null;
  loading?: MemberInfoLoading;
  sharedMedia?: SharedMediaItem[];
  sharedFiles?: SharedFileItem[];
  sharedLinks?: SharedLinkItem[];
  commonGroups?: CommonGroup[];
  isOpen: boolean;
  onClose: () => void;
  onBack?: () => void;
  /** Which side to open the drawer from */
  side?: "left" | "right";
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
 * MemberInfoDrawer - Replaces the modal with a Sheet (desktop) or Drawer (mobile)
 * Consistent with AI feature's pattern for detail views
 */
export function MemberInfoDrawer({
  contact,
  profile,
  loading,
  sharedMedia,
  sharedFiles,
  sharedLinks,
  commonGroups,
  isOpen,
  onClose,
  onBack,
  side = "right",
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
}: MemberInfoDrawerProps) {
  const [activeSection, setActiveSection] = useState<MemberInfoSection>(
    DEFAULT_MEMBER_INFO_SECTION
  );
  const isMobile = useIsMobile();

  if (!contact) return null;

  // Header with back button
  const HeaderContent = (
    <div className="flex items-center justify-between w-full">
      <div className="flex items-center gap-2">
        {onBack && (
          <Button
            variant="ghost"
            size="icon"
            onClick={onBack}
            className="h-8 w-8 text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
        )}
        <span className="text-base font-semibold">Member Info</span>
      </div>
      <Button
        variant="ghost"
        size="icon"
        onClick={onClose}
        className="h-8 w-8 text-muted-foreground hover:text-foreground"
      >
        <X className="h-4 w-4" />
      </Button>
    </div>
  );

  // Navigation sidebar
  const NavigationSidebar = (
    <div className="w-48 border-r border-border bg-muted/30 p-2 space-y-1">
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
  );

  // Content area
  const ContentArea = (
    <ScrollArea className="flex-1">
      <MemberInfoContent
        activeSection={activeSection}
        contact={contact}
        profile={profile ?? undefined}
        isMobile={isMobile}
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
  );

  // Mobile: Use Drawer (slides from bottom or right)
  if (isMobile) {
    return (
      <Drawer open={isOpen} onOpenChange={(open) => !open && onClose()}>
        <DrawerContent className="h-[92vh] max-h-[92vh]">
          <DrawerHeader className="border-b border-border px-4 py-3">
            <DrawerTitle className="sr-only">{contact.name} Info</DrawerTitle>
            <DrawerDescription className="sr-only">
              Review contact details, shared items, and workspace actions for {contact.name}.
            </DrawerDescription>
            {HeaderContent}
          </DrawerHeader>

          <div className="flex flex-col flex-1 overflow-hidden">
            {/* Mobile: Section tabs as horizontal scroll */}
            <div className="flex gap-1 p-2 border-b border-border overflow-x-auto scrollbar-hide">
              {MEMBER_INFO_SECTIONS.map((section) => {
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

            {ContentArea}
          </div>
        </DrawerContent>
      </Drawer>
    );
  }

  // Desktop: Use Sheet (slides from side)
  return (
    <Sheet open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <SheetContent
        side={side}
        className="w-full max-w-3xl p-0 flex flex-col xl:max-w-4xl"
      >
        <SheetHeader className="border-b border-border px-4 py-3">
          <SheetTitle className="sr-only">{contact.name} Info</SheetTitle>
          <SheetDescription className="sr-only">
            Review contact details, shared items, and workspace actions for {contact.name}.
          </SheetDescription>
          {HeaderContent}
        </SheetHeader>

        <div className="flex flex-1 overflow-hidden">
          {NavigationSidebar}
          {ContentArea}
        </div>
      </SheetContent>
    </Sheet>
  );
}
