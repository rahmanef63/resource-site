/**
 * Comments hook
 * Manage comment panel state
 */

"use client";

import { useState, useCallback } from "react";

export type CommentsState = {
  isOpen: boolean;
  entityId: string | null;
  entityType: string | null;
  title?: string;
};

export function useComments() {
  const [state, setState] = useState<CommentsState>({
    isOpen: false,
    entityId: null,
    entityType: null,
  });

  const openComments = useCallback(
    (entityId: string, entityType: string, title?: string) => {
      setState({
        isOpen: true,
        entityId,
        entityType,
        title,
      });
    },
    []
  );

  const closeComments = useCallback(() => {
    setState({
      isOpen: false,
      entityId: null,
      entityType: null,
    });
  }, []);

  const toggleComments = useCallback(
    (entityId: string, entityType: string, title?: string) => {
      if (state.isOpen && state.entityId === entityId) {
        closeComments();
      } else {
        openComments(entityId, entityType, title);
      }
    },
    [state.isOpen, state.entityId, openComments, closeComments]
  );

  return {
    ...state,
    openComments,
    closeComments,
    toggleComments,
  };
}
