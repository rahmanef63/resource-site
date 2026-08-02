import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Phone,
  Video,
  MessageCircle,
  User,
  Clock,
  Shield,
  Star,
} from "lucide-react";
import type { MemberProfile } from "../../types/member";

export type MemberDetailViewProps = {
  contact: MemberProfile;
  onCall?: () => void;
  onVideoCall?: () => void;
  onMessage?: () => void;
};

export function MemberDetailView({
  contact,
  onCall,
  onVideoCall,
  onMessage,
}: MemberDetailViewProps) {
  return (
    <div className="flex h-full flex-col bg-background">
      <div className="border-b border-border p-6 text-center">
        <Avatar className="mx-auto mb-4 h-24 w-24">
          <AvatarImage src={contact.avatar} alt={contact.name} />
          <AvatarFallback className="text-2xl">
            {contact.name.charAt(0).toUpperCase()}
          </AvatarFallback>
        </Avatar>

        <h1 className="mb-1 text-2xl font-semibold text-foreground">
          {contact.name}
        </h1>

        <p className="mb-2 text-muted-foreground">{contact.phoneNumber}</p>

        {contact.isOnline ? (
          <Badge variant="secondary" className="mb-4">
            <span className="mr-2 h-2 w-2 rounded-full bg-green-500" />
            Online
          </Badge>
        ) : (
          <p className="mb-4 text-sm text-muted-foreground">
            Last seen {contact.lastSeen ?? "recently"}
          </p>
        )}

        <div className="flex justify-center gap-3">
          <Button size="icon" variant="outline" onClick={onCall}>
            <Phone className="h-4 w-4" />
          </Button>
          <Button size="icon" variant="outline" onClick={onVideoCall}>
            <Video className="h-4 w-4" />
          </Button>
          <Button size="icon" variant="outline" onClick={onMessage}>
            <MessageCircle className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <div className="flex-1 space-y-6 p-6">
        {contact.about && (
          <div>
            <h3 className="mb-2 flex items-center gap-2 font-medium text-foreground">
              <User className="h-4 w-4" />
              About
            </h3>
            <p className="text-muted-foreground">{contact.about}</p>
          </div>
        )}

        {contact.username && (
          <div>
            <h3 className="mb-2 font-medium text-foreground">Username</h3>
            <p className="text-muted-foreground">@{contact.username}</p>
          </div>
        )}

        <div>
          <h3 className="mb-2 flex items-center gap-2 font-medium text-foreground">
            <Shield className="h-4 w-4" />
            Security
          </h3>
          <p className="text-sm text-muted-foreground">
            Messages and calls are end-to-end encrypted.
          </p>
        </div>

        <div>
          <h3 className="mb-2 flex items-center gap-2 font-medium text-foreground">
            <Clock className="h-4 w-4" />
            Member Info
          </h3>
          <p className="text-sm text-muted-foreground">
            Added to contacts automatically.
          </p>
        </div>

        <div>
          <h3 className="mb-2 flex items-center gap-2 font-medium text-foreground">
            <Star className="h-4 w-4" />
            Favorites
          </h3>
          <p className="text-sm text-muted-foreground">
            Tap the star icon to manage favorite contacts.
          </p>
        </div>
      </div>
    </div>
  );
}
