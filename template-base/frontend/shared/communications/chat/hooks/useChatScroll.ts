/**
 * Auto-scroll hook for chat
 * @module shared/chat/hooks/useChatScroll
 */

import { useEffect, useRef, useState, useCallback } from "react";
import { CHAT_CONSTANTS } from "../constants/chat";

export type UseChatScrollOptions = {
  enabled?: boolean;
  threshold?: number;
  smooth?: boolean;
};

export type UseChatScrollReturn = {
  scrollRef: React.RefObject<HTMLDivElement | null>;
  isAtBottom: boolean;
  scrollToBottom: (smooth?: boolean) => void;
  scrollToMessage: (messageId: string, smooth?: boolean) => void;
};

/**
 * Hook for managing chat scroll behavior
 * Auto-scrolls to bottom on new messages if user is near bottom
 */
export function useChatScroll(
  options: UseChatScrollOptions = {}
): UseChatScrollReturn {
  const {
    enabled = true,
    threshold = CHAT_CONSTANTS.SCROLL_THRESHOLD_PX,
    smooth = true,
  } = options;

  const scrollRef = useRef<HTMLDivElement>(null);
  const [isAtBottom, setIsAtBottom] = useState(true);
  const lastScrollTop = useRef(0);

  /**
   * Check if scrolled to bottom
   */
  const checkIsAtBottom = useCallback(() => {
    const element = scrollRef.current;
    if (!element) return false;

    const { scrollTop, scrollHeight, clientHeight } = element;
    const distanceFromBottom = scrollHeight - scrollTop - clientHeight;
    return distanceFromBottom <= threshold;
  }, [threshold]);

  /**
   * Scroll to bottom
   */
  const scrollToBottom = useCallback(
    (smoothScroll = smooth) => {
      const element = scrollRef.current;
      if (!element) return;

      element.scrollTo({
        top: element.scrollHeight,
        behavior: smoothScroll ? "smooth" : "auto",
      });

      setIsAtBottom(true);
    },
    [smooth]
  );

  /**
   * Scroll to specific message
   */
  const scrollToMessage = useCallback(
    (messageId: string, smoothScroll = smooth) => {
      const element = scrollRef.current;
      if (!element) return;

      const messageElement = element.querySelector(
        `[data-message-id="${messageId}"]`
      );
      if (!messageElement) return;

      messageElement.scrollIntoView({
        behavior: smoothScroll ? "smooth" : "auto",
        block: "center",
      });
    },
    [smooth]
  );

  /**
   * Handle scroll events
   */
  useEffect(() => {
    const element = scrollRef.current;
    if (!element || !enabled) return;

    const handleScroll = () => {
      const currentScrollTop = element.scrollTop;
      const wasAtBottom = isAtBottom;
      const nowAtBottom = checkIsAtBottom();

      setIsAtBottom(nowAtBottom);

      // Store scroll position
      lastScrollTop.current = currentScrollTop;
    };

    element.addEventListener("scroll", handleScroll, { passive: true });

    return () => {
      element.removeEventListener("scroll", handleScroll);
    };
  }, [enabled, isAtBottom, checkIsAtBottom]);

  /**
   * Auto-scroll on new content if at bottom
   */
  useEffect(() => {
    const element = scrollRef.current;
    if (!element || !enabled) return;

    const observer = new MutationObserver(() => {
      if (isAtBottom) {
        scrollToBottom(false); // Don't animate auto-scroll
      }
    });

    observer.observe(element, {
      childList: true,
      subtree: true,
    });

    return () => {
      observer.disconnect();
    };
  }, [enabled, isAtBottom, scrollToBottom]);

  return {
    scrollRef,
    isAtBottom,
    scrollToBottom,
    scrollToMessage,
  };
}
