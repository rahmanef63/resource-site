/**
 * Registry Event Emitter
 * Emits events for registry changes (useful for hot reload, UI updates, etc.)
 */

import type {
  IRegistryEventEmitter,
  RegistryEvent,
  RegistryEventType,
  RegistryEventListener,
} from "../../types"

export class RegistryEventEmitter implements IRegistryEventEmitter {
  private listeners = new Map<RegistryEventType, Set<RegistryEventListener>>()

  /**
   * Register event listener
   */
  on(eventType: RegistryEventType, listener: RegistryEventListener): void {
    if (!this.listeners.has(eventType)) {
      this.listeners.set(eventType, new Set())
    }
    this.listeners.get(eventType)!.add(listener)
  }

  /**
   * Unregister event listener
   */
  off(eventType: RegistryEventType, listener: RegistryEventListener): void {
    const listeners = this.listeners.get(eventType)
    if (listeners) {
      listeners.delete(listener)
      if (listeners.size === 0) {
        this.listeners.delete(eventType)
      }
    }
  }

  /**
   * Register one-time listener
   */
  once(eventType: RegistryEventType, listener: RegistryEventListener): void {
    const onceListener: RegistryEventListener = (event) => {
      listener(event)
      this.off(eventType, onceListener)
    }
    this.on(eventType, onceListener)
  }

  /**
   * Emit event to all listeners
   */
  emit(event: RegistryEvent): void {
    const listeners = this.listeners.get(event.type)
    if (listeners) {
      listeners.forEach((listener) => {
        try {
          listener(event)
        } catch (error) {
          console.error(`Error in registry event listener:`, error)
        }
      })
    }

    // Also emit to "all" listeners
    const allListeners = this.listeners.get("*" as RegistryEventType)
    if (allListeners) {
      allListeners.forEach((listener) => {
        try {
          listener(event)
        } catch (error) {
          console.error(`Error in registry event listener:`, error)
        }
      })
    }
  }

  /**
   * Remove all listeners
   */
  removeAllListeners(eventType?: RegistryEventType): void {
    if (eventType) {
      this.listeners.delete(eventType)
    } else {
      this.listeners.clear()
    }
  }

  /**
   * Get listener count
   */
  listenerCount(eventType: RegistryEventType): number {
    return this.listeners.get(eventType)?.size || 0
  }

  /**
   * Get all event types with listeners
   */
  eventNames(): RegistryEventType[] {
    return Array.from(this.listeners.keys())
  }
}

// ============================================================================
// Helper Functions
// ============================================================================

export function createRegistryEvent(
  type: RegistryEventType,
  data?: any
): RegistryEvent {
  return {
    type,
    timestamp: Date.now(),
    data,
  }
}

export function createRegisterEvent(
  id: string,
  nodeType: string,
  data?: any
): RegistryEvent {
  return {
    type: "register",
    id,
    nodeType: nodeType as any,
    timestamp: Date.now(),
    data,
  }
}

export function createUnregisterEvent(
  id: string,
  nodeType: string,
  data?: any
): RegistryEvent {
  return {
    type: "unregister",
    id,
    nodeType: nodeType as any,
    timestamp: Date.now(),
    data,
  }
}

export function createUpdateEvent(
  id: string,
  nodeType: string,
  data?: any
): RegistryEvent {
  return {
    type: "update",
    id,
    nodeType: nodeType as any,
    timestamp: Date.now(),
    data,
  }
}
