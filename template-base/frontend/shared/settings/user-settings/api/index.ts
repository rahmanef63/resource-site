import { useQuery, useMutation } from "convex/react";
import { api } from "@convex/_generated/api";
import { Id } from "@convex/_generated/dataModel";


// Users API hooks
export const useUsersApi = () => {
  // Queries
  const currentUser = useQuery(api.auth.auth.loggedInUser);
  // Note: getUserProfile function needs to be implemented in convex/users.ts
  
  // Mutations
  const updateProfile = useMutation(api.user.users.updateUserProfile);
  // Note: updatePrivacySettings function needs to be implemented in convex/users.ts

  return {
    // Data
    currentUser,
    
    // Actions
    updateProfile,
  };
};

// Individual hooks
export const useCurrentUser = () => useQuery(api.auth.auth.loggedInUser);
// Note: These functions need to be implemented in convex/users.ts
// export const useUserProfile = (userId?: Id<"users">) => 
//   useQuery(api.user.users.getUserProfile, userId ? { userId } : "skip");
// export const useSearchUsers = (query: string) => 
//   useQuery(api.user.users.searchUsers, query ? { query } : "skip");

export const useUpdateProfile = () => useMutation(api.user.users.updateUserProfile);
// export const useUpdatePrivacySettings = () => useMutation(api.user.users.updatePrivacySettings);
