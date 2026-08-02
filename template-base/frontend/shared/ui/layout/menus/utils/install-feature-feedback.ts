export type FeatureInstallAuthState = {
  isAuthLoading: boolean;
  isSignedIn: boolean;
  isAuthenticated: boolean;
};

export type FeatureInstallFeedback = {
  title: string;
  description?: string;
};

export function getFeatureInstallPreflightFeedback(
  authState: FeatureInstallAuthState
): FeatureInstallFeedback | null {
  if (authState.isAuthLoading) {
    return {
      title: "Checking your sign-in status",
      description: "Please wait a moment, then try installing the feature again.",
    };
  }

  if (!authState.isSignedIn) {
    return {
      title: "You need to sign in first",
      description: "Sign in before installing features in a workspace.",
    };
  }

  if (!authState.isAuthenticated) {
    return {
      title: "Your sign-in is active, but the workspace session is not ready yet",
      description: "Wait a moment for Convex authentication to finish, then try again.",
    };
  }

  return null;
}

export function getFeatureInstallErrorFeedback(
  error: unknown
): FeatureInstallFeedback {
  const message =
    error instanceof Error ? error.message.toLowerCase() : String(error ?? "").toLowerCase();

  if (message.includes("not authenticated")) {
    return {
      title: "You need to sign in first",
      description: "Sign in before installing features in a workspace.",
    };
  }

  if (message.includes("not authorized")) {
    return {
      title: "You do not have access to this workspace",
      description: "Ask a workspace admin for access before installing features here.",
    };
  }

  if (message.includes("insufficient permissions")) {
    return {
      title: "You do not have permission to install features",
      description: "Ask a workspace admin to grant feature management access.",
    };
  }

  return {
    title: "Failed to install feature",
  };
}
