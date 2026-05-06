import { useState, useCallback } from "react";
import { ViewType } from "../types";

export function useWorkspaceNavigation(initialView: ViewType = "dashboard") {
  const [currentView, setCurrentView] = useState<ViewType>(initialView);

  const navigateTo = useCallback((view: ViewType) => {
    setCurrentView(view);
  }, []);

  const isActive = useCallback((view: ViewType) => {
    return currentView === view;
  }, [currentView]);

  return {
    currentView,
    navigateTo,
    isActive,
  };
}
