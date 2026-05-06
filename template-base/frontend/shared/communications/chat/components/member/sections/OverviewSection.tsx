import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { Video, Phone, Info, Edit3, Star, Ban, Flag, Mail, MapPin, Briefcase, UserPlus } from "lucide-react";
import { cn } from "@/lib/utils";
import type { MemberInfoContact } from "../types";
import type { MemberProfile } from "@/frontend/shared/communications/chat/types/member";

type OverviewSectionProps = {
  contact: MemberInfoContact;
  profile?: (MemberProfile & { presenceLabel?: string }) | null;
  isMobile: boolean;
  isLoadingProfile?: boolean;
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

const FALLBACK_ABOUT = "Hey there! I am using Chats.";

function getInitials(name: string) {
  return name
    .split(" ")
    .map((word) => word.charAt(0))
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

export function OverviewSection({
  contact,
  profile,
  isMobile,
  isLoadingProfile = false,
  isFavorite = false,
  isBlocked = false,
  onAddToFavorites,
  onRemoveFromFavorites,
  onBlock,
  onUnblock,
  onReport,
  onVideoCall,
  onVoiceCall,
  onInviteToWorkspace,
  canInviteToWorkspace = true,
  workspaceInviteLabel,
  workspaceInviteHint,
}: OverviewSectionProps) {
  const resolvedContact: MemberInfoContact = {
    ...contact,
    ...(profile ?? {}),
    presenceLabel: profile?.presenceLabel ?? contact.presenceLabel,
    about: profile?.about ?? contact.about,
    phoneNumber: profile?.phoneNumber ?? contact.phoneNumber,
    avatar: profile?.avatar ?? contact.avatar,
    email: profile?.email ?? contact.email,
    jobTitle: profile?.jobTitle ?? contact.jobTitle,
    location: profile?.location ?? contact.location,
  };
  const showInviteAction =
    onInviteToWorkspace !== undefined ||
    workspaceInviteHint !== undefined ||
    workspaceInviteLabel !== undefined;
  const resolvedInviteLabel = workspaceInviteLabel ?? "Invite to workspace";

  return (
    <div className="space-y-4 md:space-y-6">
      <div className="bg-muted/30 border border-border rounded-lg p-4 text-center md:p-6">
        <div className="relative inline-block">
          <Avatar
            className={cn(
              "mx-auto border-4 border-primary/20",
              isMobile ? "mb-3 h-24 w-24" : "mb-4 h-32 w-32"
            )}
          >
            <AvatarImage src={resolvedContact.avatar} alt={resolvedContact.name} />
            <AvatarFallback
              className={cn(
                "bg-primary text-primary-foreground font-semibold",
                isMobile ? "text-lg" : "text-2xl"
              )}
            >
              {getInitials(resolvedContact.name)}
            </AvatarFallback>
          </Avatar>

          <Button
            size="icon"
            className={cn(
              "absolute bottom-2 right-2 rounded-full bg-primary text-primary-foreground shadow-lg",
              isMobile ? "h-6 w-6" : "h-8 w-8"
            )}
          >
            <Edit3 className={isMobile ? "h-3 w-3" : "h-4 w-4"} />
          </Button>
        </div>

        <h2
          className={cn(
            "font-semibold text-foreground",
            isMobile ? "text-xl" : "text-2xl"
          )}
        >
          {resolvedContact.name}
        </h2>

        {resolvedContact.username && (
          <p className="text-muted-foreground">@{resolvedContact.username}</p>
        )}

        {(resolvedContact.presenceLabel || resolvedContact.lastSeen) && (
          <p className="text-xs text-muted-foreground mt-1">
            {resolvedContact.presenceLabel ?? `Last seen ${resolvedContact.lastSeen}`}
          </p>
        )}

        <div
          className={cn(
            "grid justify-center gap-3",
            isMobile
              ? "mt-4 grid-cols-1"
              : showInviteAction
                ? "mt-6 grid-cols-3"
                : "mt-6 grid-cols-2"
          )}
        >
          <Button
            variant="outline"
            size={isMobile ? "default" : "lg"}
            onClick={onVideoCall}
            disabled={!onVideoCall}
            className={cn(
              "border-border bg-background hover:bg-accent",
              isMobile ? "w-full" : "flex-1 max-w-40"
            )}
          >
            <Video className="mr-2 h-4 w-4 md:h-5 md:w-5" />
            Video
          </Button>
          <Button
            variant="outline"
            size={isMobile ? "default" : "lg"}
            onClick={onVoiceCall}
            disabled={!onVoiceCall}
            className={cn(
              "border-border bg-background hover:bg-accent",
              isMobile ? "w-full" : "flex-1 max-w-40"
            )}
          >
            <Phone className="mr-2 h-4 w-4 md:h-5 md:w-5" />
            Voice
          </Button>
          {showInviteAction && (
            <Button
              variant="outline"
              size={isMobile ? "default" : "lg"}
              onClick={onInviteToWorkspace}
              disabled={!onInviteToWorkspace || !canInviteToWorkspace}
              className={cn(
                "border-border bg-background hover:bg-accent",
                isMobile ? "w-full" : "w-full"
              )}
            >
              <UserPlus className="mr-2 h-4 w-4 md:h-5 md:w-5" />
              {resolvedInviteLabel}
            </Button>
          )}
        </div>
        {showInviteAction && workspaceInviteHint ? (
          <p className="mt-3 text-xs text-muted-foreground">
            {workspaceInviteHint}
          </p>
        ) : null}
      </div>

      <div className="space-y-4 md:space-y-6">
        <div className="rounded-lg border border-border bg-muted/30 p-4">
          <h3 className="mb-2 flex items-center gap-2 font-medium text-foreground">
            <Info className="h-4 w-4" />
            About
          </h3>
          <p className="text-muted-foreground">
            {isLoadingProfile ? "Loading contact details..." : resolvedContact.about ?? FALLBACK_ABOUT}
          </p>
        </div>

        <div className="rounded-lg border border-border bg-muted/30 p-4 space-y-3">
          <div className="flex items-start gap-2">
            <Phone className="h-4 w-4 text-muted-foreground mt-0.5" />
            <div>
              <p className="text-sm font-medium text-foreground">Phone</p>
              <p className="text-muted-foreground">{resolvedContact.phoneNumber ?? "Not shared"}</p>
            </div>
          </div>
          <div className="flex items-start gap-2">
            <Mail className="h-4 w-4 text-muted-foreground mt-0.5" />
            <div>
              <p className="text-sm font-medium text-foreground">Email</p>
              <p className="text-muted-foreground">{resolvedContact.email ?? "Not shared"}</p>
            </div>
          </div>
          <div className="flex items-start gap-2">
            <Briefcase className="h-4 w-4 text-muted-foreground mt-0.5" />
            <div>
              <p className="text-sm font-medium text-foreground">Role</p>
              <p className="text-muted-foreground">{resolvedContact.jobTitle ?? "Not set"}</p>
            </div>
          </div>
          <div className="flex items-start gap-2">
            <MapPin className="h-4 w-4 text-muted-foreground mt-0.5" />
            <div>
              <p className="text-sm font-medium text-foreground">Location</p>
              <p className="text-muted-foreground">{resolvedContact.location ?? "Not set"}</p>
            </div>
          </div>
        </div>

        <div className="rounded-lg border border-border bg-muted/30 p-4">
          <h3 className="mb-2 font-medium text-foreground">Privacy Settings</h3>
          <div className="space-y-4">
            <div>
              <p className="text-sm text-foreground">Disappearing messages</p>
              <p className="text-sm text-muted-foreground">Off</p>
            </div>

            <Separator className="bg-border" />

            <div>
              <p className="text-sm text-foreground">Advanced chat privacy</p>
              <p className="mb-3 text-xs text-muted-foreground">
                This setting can only be updated on your phone.
              </p>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Off</span>
                <Switch disabled />
              </div>
            </div>
          </div>
        </div>

        <div className="rounded-lg border border-border bg-muted/30 p-4">
          <h3 className="mb-4 font-medium text-foreground">Notifications</h3>
          <div className="space-y-4">
            <div>
              <p className="mb-2 text-sm text-foreground">Mute notifications</p>
              <Button
                variant="outline"
                size="sm"
                className="border-border text-muted-foreground"
              >
                Mute for 8 hours
              </Button>
            </div>

            <div>
              <p className="mb-2 text-sm text-foreground">Notification tone</p>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" className="border-border">
                  Preview
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="border-border text-muted-foreground"
                >
                  Default
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="space-y-3">
        <Button
          variant="outline"
          onClick={isFavorite ? onRemoveFromFavorites : onAddToFavorites}
          className={cn(
            "w-full justify-center border-border",
            isFavorite ? "text-yellow-500 hover:text-yellow-600" : "text-muted-foreground hover:text-foreground"
          )}
        >
          <Star className={cn("mr-2 h-4 w-4", isFavorite && "fill-current")} />
          {isFavorite ? "Remove from favorites" : "Add to favorites"}
        </Button>
        <div className={isMobile ? "flex flex-col gap-3" : "flex gap-3"}>
          <Button
            variant="outline"
            onClick={isBlocked ? onUnblock : onBlock}
            className={cn(
              "flex-1 justify-center border-border",
              isBlocked ? "text-green-500 hover:text-green-600" : "text-muted-foreground hover:text-foreground"
            )}
          >
            <Ban className="mr-2 h-4 w-4" />
            {isBlocked ? "Unblock" : "Block"}
          </Button>
          <Button 
            variant="destructive" 
            className="flex-1 justify-center"
            onClick={onReport}
          >
            <Flag className="mr-2 h-4 w-4" />
            Report contact
          </Button>
        </div>
      </div>
    </div>
  );
}
