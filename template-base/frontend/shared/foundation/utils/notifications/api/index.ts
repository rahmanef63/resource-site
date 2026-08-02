import { useQuery, useMutation } from "convex/react";
import { api } from "@convex/_generated/api";
import { Id } from "@convex/_generated/dataModel";

// Notifications API hooks
export const useNotificationsApi = () => {
  // Queries - Note: These functions need workspaceId parameter
  // const notifications = useQuery(api.workspace.notifications.getUserNotifications, { workspaceId });
  // Note: getUnreadCount function needs to be implemented in convex/notifications.ts
  
  // Mutations
  const markAsRead = useMutation(api.workspace.notifications.markAsRead);
  const markAllAsRead = useMutation(api.workspace.notifications.markAllAsRead);
  const deleteNotification = useMutation(api.workspace.notifications.deleteNotification);

  return {
    // Data
    // notifications,
    // unreadCount,
    
    // Actions
    markAsRead,
    markAllAsRead,
    // deleteNotification,
  };
};

// Individual hooks - Note: These need proper implementation
// export const useNotifications = (workspaceId: Id<"workspaces">) => 
//   useQuery(api.workspace.notifications.getUserNotifications, { workspaceId });
// export const useUnreadNotificationsCount = () => useQuery(api.workspace.notifications.getUnreadCount);

export const useMarkNotificationAsRead = () => useMutation(api.workspace.notifications.markAsRead);
export const useMarkAllNotificationsAsRead = () => useMutation(api.workspace.notifications.markAllAsRead);
