"use client";

import { useEffect, useState } from "react";
import { useAction } from "convex/react";
import { api } from "@/convex/_generated/api";

/**
 * Auto-initializes the current user as an admin if they don't have an admin record
 * This runs once on mount for authenticated users
 */
export function AdminUserInitializer() {
  const [initialized, setInitialized] = useState(false);
  const initializeAdmin = useAction(api.auth.api.actions.initializeSelfAsAdmin);

  useEffect(() => {
    if (initialized) return;

    const initialize = async () => {
      try {
        const result = await initializeAdmin();
        setInitialized(true);
      } catch (error) {
        console.error("[AdminUserInitializer] Failed to initialize admin user:", error);
        // Only try once, even if it fails
        setInitialized(true);
      }
    };

    initialize();
  }, [initialized, initializeAdmin]);

  return null; // This component doesn't render anything
}
