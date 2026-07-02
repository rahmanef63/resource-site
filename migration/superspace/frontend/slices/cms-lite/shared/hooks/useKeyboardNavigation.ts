import { useEffect, useCallback, RefObject } from 'react';

export interface KeyboardNavigationOptions {
  enabled?: boolean;
  loop?: boolean;
  orientation?: 'horizontal' | 'vertical' | 'both';
  onEscape?: () => void;
  onEnter?: (index: number) => void;
}

export function useKeyboardNavigation(
  itemsRef: RefObject<HTMLElement[]>,
  options: KeyboardNavigationOptions = {}
) {
  const {
    enabled = true,
    loop = true,
    orientation = 'vertical',
    onEscape,
    onEnter,
  } = options;

  const focusItem = useCallback((index: number) => {
    const items = itemsRef.current;
    if (!items || !items[index]) return;
    items[index].focus();
  }, [itemsRef]);

  const handleKeyDown = useCallback(
    (event: KeyboardEvent) => {
      if (!enabled || !itemsRef.current) return;

      const items = itemsRef.current;
      const currentIndex = items.findIndex(item => item === document.activeElement);

      if (currentIndex === -1) return;

      const handleNavigation = (direction: 1 | -1) => {
        event.preventDefault();
        let nextIndex = currentIndex + direction;

        if (loop) {
          if (nextIndex < 0) nextIndex = items.length - 1;
          if (nextIndex >= items.length) nextIndex = 0;
        } else {
          nextIndex = Math.max(0, Math.min(items.length - 1, nextIndex));
        }

        focusItem(nextIndex);
      };

      switch (event.key) {
        case 'ArrowDown':
          if (orientation === 'vertical' || orientation === 'both') {
            handleNavigation(1);
          }
          break;
        case 'ArrowUp':
          if (orientation === 'vertical' || orientation === 'both') {
            handleNavigation(-1);
          }
          break;
        case 'ArrowRight':
          if (orientation === 'horizontal' || orientation === 'both') {
            handleNavigation(1);
          }
          break;
        case 'ArrowLeft':
          if (orientation === 'horizontal' || orientation === 'both') {
            handleNavigation(-1);
          }
          break;
        case 'Home':
          event.preventDefault();
          focusItem(0);
          break;
        case 'End':
          event.preventDefault();
          focusItem(items.length - 1);
          break;
        case 'Escape':
          if (onEscape) {
            event.preventDefault();
            onEscape();
          }
          break;
        case 'Enter':
        case ' ':
          if (onEnter) {
            event.preventDefault();
            onEnter(currentIndex);
          }
          break;
      }
    },
    [enabled, itemsRef, loop, orientation, focusItem, onEscape, onEnter]
  );

  useEffect(() => {
    if (!enabled) return;

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [enabled, handleKeyDown]);

  return { focusItem };
}

export function useFocusTrap(containerRef: RefObject<HTMLElement>, enabled = true) {
  useEffect(() => {
    if (!enabled || !containerRef.current) return;

    const container = containerRef.current;
    const focusableElements = container.querySelectorAll<HTMLElement>(
      'a[href], button:not([disabled]), textarea:not([disabled]), input:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])'
    );

    const firstElement = focusableElements[0];
    const lastElement = focusableElements[focusableElements.length - 1];

    const handleTabKey = (e: KeyboardEvent) => {
      if (e.key !== 'Tab') return;

      if (e.shiftKey) {
        if (document.activeElement === firstElement) {
          e.preventDefault();
          lastElement?.focus();
        }
      } else {
        if (document.activeElement === lastElement) {
          e.preventDefault();
          firstElement?.focus();
        }
      }
    };

    container.addEventListener('keydown', handleTabKey);
    firstElement?.focus();

    return () => {
      container.removeEventListener('keydown', handleTabKey);
    };
  }, [containerRef, enabled]);
}

export function useEscapeKey(callback: () => void, enabled = true) {
  useEffect(() => {
    if (!enabled) return;

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        callback();
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [callback, enabled]);
}

export function useAriaAnnounce() {
  const announce = useCallback((message: string, priority: 'polite' | 'assertive' = 'polite') => {
    const announcement = document.createElement('div');
    announcement.setAttribute('role', 'status');
    announcement.setAttribute('aria-live', priority);
    announcement.setAttribute('aria-atomic', 'true');
    announcement.className = 'sr-only';
    announcement.textContent = message;

    document.body.appendChild(announcement);

    setTimeout(() => {
      document.body.removeChild(announcement);
    }, 1000);
  }, []);

  return { announce };
}
