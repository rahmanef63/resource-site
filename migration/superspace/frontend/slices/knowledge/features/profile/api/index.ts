import { useQuery, useMutation } from "convex/react";
import { api } from "@/frontend/shared/foundation/utils/convex/any-api";

// Re-export user API hooks from user-settings
// These will continue to use the existing user backend

export const useCurrentUser = () => useQuery(api.auth.auth.loggedInUser);
export const useUpdateProfile = () => useMutation(api.user.users.updateUserProfile);
