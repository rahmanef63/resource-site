/**
 * Message bus for real-time chat events
 * @module shared/chat/lib/messageBus
 */

import type { MessageBusEvent } from "../types/events";

type EventHandler = (event: MessageBusEvent) => void;

/**
 * Simple event bus for chat system
 * Allows components to communicate without tight coupling
 */
export class MessageBus {
  private handlers: Map<string, Set<EventHandler>>;

  constructor() {
    this.handlers = new Map();
  }

  /**
   * Subscribe to events
   */
  on(eventType: MessageBusEvent["type"] | "*", handler: EventHandler): () => void {
    if (!this.handlers.has(eventType)) {
      this.handlers.set(eventType, new Set());
    }

    this.handlers.get(eventType)!.add(handler);

    // Return unsubscribe function
    return () => {
      this.off(eventType, handler);
    };
  }

  /**
   * Unsubscribe from events
   */
  off(eventType: MessageBusEvent["type"] | "*", handler: EventHandler): void {
    const handlers = this.handlers.get(eventType);
    if (handlers) {
      handlers.delete(handler);
    }
  }

  /**
   * Emit an event
   */
  emit(event: MessageBusEvent): void {
    // Call specific handlers
    const specificHandlers = this.handlers.get(event.type);
    if (specificHandlers) {
      specificHandlers.forEach((handler) => {
        try {
          handler(event);
        } catch (error) {
          console.error(`Error in event handler for ${event.type}:`, error);
        }
      });
    }

    // Call wildcard handlers
    const wildcardHandlers = this.handlers.get("*");
    if (wildcardHandlers) {
      wildcardHandlers.forEach((handler) => {
        try {
          handler(event);
        } catch (error) {
          console.error("Error in wildcard event handler:", error);
        }
      });
    }
  }

  /**
   * Clear all handlers
   */
  clear(): void {
    this.handlers.clear();
  }

  /**
   * Get handler count for debugging
   */
  getHandlerCount(eventType?: MessageBusEvent["type"] | "*"): number {
    if (eventType) {
      return this.handlers.get(eventType)?.size || 0;
    }
    let total = 0;
    this.handlers.forEach((handlers) => {
      total += handlers.size;
    });
    return total;
  }
}

/**
 * Global message bus instance
 */
export const globalMessageBus = new MessageBus();

/**
 * Create a scoped message bus for a specific room
 */
export function createRoomMessageBus(roomId: string): MessageBus {
  return new MessageBus();
}
