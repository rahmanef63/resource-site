import React, { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@convex/_generated/api";
import { api as apiUntyped } from "@/frontend/shared/foundation/utils/convex/any-api";
import { Id } from "@convex/_generated/dataModel";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { getInvitationNotificationMessage } from "@/frontend/shared/lib/invitations/display";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Bell,
  MessageSquare,
  UserPlus,
  FileText,
  X,
} from "lucide-react";
import { toast } from "sonner";

interface NotificationCenterProps {
  workspaceId: Id<"workspaces">;
}

export function NotificationCenter({ workspaceId }: NotificationCenterProps) {
  const [isOpen, setIsOpen] = useState(false);
  
  // Get notifications with proper error handling
  const notifications = useQuery(api.workspace.notifications.getUserNotifications, {
    workspaceId,
  }) || [];
  
  // Get invitations as notifications
  const invitations = useQuery(api.workspace.invitations.getUserInvitations, {
    type: "received",
    status: "pending"
  }) || [];
  
  // Get recent messages as notifications (simplified)
  const recentMessages = useQuery(apiUntyped["features/chat/messages"].getRecentMessages, {
    workspaceId,
    limit: 5
  }) || [];
  
  const markAsRead = useMutation(api.workspace.notifications.markAsRead);
  const markAllAsRead = useMutation(api.workspace.notifications.markAllAsRead);
  const deleteNotification = useMutation(api.workspace.notifications.deleteNotification);

  // Combine all notification sources
  const allNotifications = [
    ...notifications,
    ...invitations.map((inv: any) => ({
      _id: `inv_${inv._id}` as Id<"notifications">,
      title: "New Invitation",
      message: getInvitationNotificationMessage(inv),
      type: "invitation",
      isRead: false,
      _creationTime: inv._creationTime,
      actionUrl: "/invitations"
    })),
    ...recentMessages.slice(0, 3).map((msg: { _id: Id<"messages">; _creationTime: number; author?: { name?: string } | null }) => ({
      _id: `msg_${msg._id}` as Id<"notifications">,
      title: "New Message",
      message: `${msg.author?.name || "Someone"} sent a message`,
      type: "message",
      isRead: false,
      _creationTime: msg._creationTime,
      actionUrl: "/chat"
    }))
  ].sort((a, b) => b._creationTime - a._creationTime);

  const unreadCount = allNotifications.filter(n => !n.isRead).length;

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case "message":
        return <MessageSquare className="w-4 h-4 text-blue-500" />;
      case "invitation":
        return <UserPlus className="w-4 h-4 text-green-500" />;
      case "document":
        return <FileText className="w-4 h-4 text-purple-500" />;
      default:
        return <Bell className="w-4 h-4 text-gray-500" />;
    }
  };

  const handleNotificationClick = async (notification: any) => {
    if (!notification.isRead && notification.type !== "invitation" && notification.type !== "message") {
      try {
        await markAsRead({ notificationId: notification._id });
      } catch (error) {
        console.error("Failed to mark as read:", error);
      }
    }
    
    // Navigate based on notification type
    switch (notification.type) {
      case "message":
        window.location.hash = "#chat";
        break;
      case "invitation":
        window.location.hash = "#invitations";
        break;
      case "document":
        window.location.hash = "#documents";
        break;
    }
    
    setIsOpen(false);
  };

  const handleMarkAllAsRead = async () => {
    try {
      await markAllAsRead({ workspaceId });
      toast.success("All notifications marked as read");
    } catch (error) {
      toast.error("Failed to mark notifications as read");
    }
  };

  const handleDeleteNotification = async (notificationId: Id<"notifications">) => {
    try {
      await deleteNotification({ notificationId });
      toast.success("Notification deleted");
    } catch (error) {
      toast.error("Failed to delete notification");
    }
  };

  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="sm" className="relative">
          <Bell className="w-5 h-5" />
          {unreadCount > 0 && (
            <Badge 
              variant="destructive" 
              className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs"
            >
              {unreadCount > 99 ? "99+" : unreadCount}
            </Badge>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-80 max-h-96 overflow-y-auto">
        <div className="flex items-center justify-between p-3 border-b">
          <h3 className="font-semibold">Notifications</h3>
          {unreadCount > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleMarkAllAsRead}
              className="text-xs"
            >
              Mark all read
            </Button>
          )}
        </div>
        
        {allNotifications.length === 0 ? (
          <div className="p-6 text-center text-gray-500">
            <Bell className="w-8 h-8 mx-auto mb-2 opacity-50" />
            <p className="text-sm">No notifications yet</p>
          </div>
        ) : (
          allNotifications.map((notification) => (
            <div
              key={notification._id}
              className={`relative group ${
                !notification.isRead ? "bg-blue-50" : ""
              }`}
            >
              <DropdownMenuItem
                className="flex items-start gap-3 p-3 cursor-pointer"
                onClick={() => handleNotificationClick(notification)}
              >
                <div className="mt-0.5">
                  {getNotificationIcon(notification.type)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <p className="font-medium text-sm truncate">
                      {notification.title}
                    </p>
                    {!notification.isRead && (
                      <div className="w-2 h-2 bg-blue-500 rounded-full shrink-0" />
                    )}
                  </div>
                  <p className="text-xs text-gray-600 line-clamp-2">
                    {notification.message}
                  </p>
                  <p className="text-xs text-gray-400 mt-1">
                    {new Date(notification._creationTime).toLocaleDateString()}
                  </p>
                </div>
              </DropdownMenuItem>
              
              {notification.type !== "invitation" && notification.type !== "message" && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity p-1 h-6 w-6"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDeleteNotification(notification._id);
                  }}
                >
                  <X className="w-3 h-3" />
                </Button>
              )}
            </div>
          ))
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
