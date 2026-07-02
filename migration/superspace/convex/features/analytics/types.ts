export const eventTypes = {
  PAGE_VIEW: "page_view",
  FEATURE_USED: "feature_used",
  ACTION_COMPLETED: "action_completed",
  ERROR: "error",
} as const;

export type EventType = typeof eventTypes[keyof typeof eventTypes] | string;

export interface AnalyticsEvent {
  eventType: EventType;
  eventName: string;
  properties?: Record<string, any>;
  userId?: string;
  sessionId?: string;
  workspaceId: string;
  timestamp: number;
  metadata?: {
    userAgent?: string;
    referrer?: string;
    path?: string;
  };
}
