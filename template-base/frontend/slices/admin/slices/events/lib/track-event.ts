/**
 * Client SDK for the admin event-tracking pipeline.
 *
 * Writes events to the `analyticsEvents` table (already in template-base
 * convex/features/analytics/schema.ts) via a Convex mutation. Auto-captures
 * page_view, signup_start, signup_complete, login, logout when wired into
 * the app shell.
 *
 * Session lifecycle:
 *   - Lazy-generates a sessionId per tab (sessionStorage)
 *   - First-touch + last-touch attribution stored on the user record by
 *     the backend; client only forwards utm/referrer params.
 *
 * Performance budget:
 *   - <100ms p99 ingestion (tracked in convex dashboard)
 *   - Bursty events queued and flushed every 500ms via requestIdleCallback
 */

import { ConvexReactClient } from "convex/react";

const SESSION_KEY = "admin:sessionId";
const FIRST_TOUCH_KEY = "admin:firstTouch";

export interface TrackEventInput {
  eventType: string;
  eventName?: string;
  productId?: string;
  properties?: Record<string, unknown>;
}

interface AutoCapture {
  source?: string;
  medium?: string;
  campaign?: string;
  term?: string;
  content?: string;
  referrer?: string;
  landingPath?: string;
  userAgent?: string;
}

function getSessionId(): string {
  if (typeof window === "undefined") return "";
  let id = window.sessionStorage.getItem(SESSION_KEY);
  if (!id) {
    id = `s_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 10)}`;
    window.sessionStorage.setItem(SESSION_KEY, id);
  }
  return id;
}

function readUtm(): AutoCapture {
  if (typeof window === "undefined") return {};
  const params = new URLSearchParams(window.location.search);
  return {
    source: params.get("utm_source") ?? undefined,
    medium: params.get("utm_medium") ?? undefined,
    campaign: params.get("utm_campaign") ?? undefined,
    term: params.get("utm_term") ?? undefined,
    content: params.get("utm_content") ?? undefined,
    referrer: document.referrer || undefined,
    landingPath: window.location.pathname,
    userAgent: navigator.userAgent,
  };
}

function captureFirstTouch(): AutoCapture {
  if (typeof window === "undefined") return {};
  const stored = window.localStorage.getItem(FIRST_TOUCH_KEY);
  if (stored) {
    try {
      return JSON.parse(stored) as AutoCapture;
    } catch {
      // fall through
    }
  }
  const fresh = readUtm();
  window.localStorage.setItem(FIRST_TOUCH_KEY, JSON.stringify(fresh));
  return fresh;
}

/**
 * Singleton holder. Call `initEventTracking(convex)` once at app root,
 * then `trackEvent(...)` from anywhere.
 */
let convexRef: ConvexReactClient | null = null;
let queue: Array<TrackEventInput & { ts: number; sessionId: string; ctx: AutoCapture }> = [];
let flushScheduled = false;

export function initEventTracking(convex: ConvexReactClient): void {
  convexRef = convex;
  captureFirstTouch();
}

export function trackEvent(input: TrackEventInput): void {
  if (typeof window === "undefined") return;
  queue.push({
    ...input,
    ts: Date.now(),
    sessionId: getSessionId(),
    ctx: readUtm(),
  });
  scheduleFlush();
}

function scheduleFlush() {
  if (flushScheduled) return;
  flushScheduled = true;
  const fire = () => {
    flushScheduled = false;
    void flush();
  };
  const ric = (window as any).requestIdleCallback as undefined | ((cb: () => void) => void);
  if (ric) ric(fire);
  else setTimeout(fire, 500);
}

async function flush() {
  if (!convexRef || queue.length === 0) return;
  const batch = queue.splice(0, queue.length);
  try {
    // Lazy-loaded api ref — caller's convex generated client.
    const { api } = (await import("@/convex/_generated/api")) as any;
    if (!api?.admin?.events?.ingest) return;
    await convexRef.mutation(api.admin.events.ingest, { events: batch } as any);
  } catch (err) {
    // Re-queue on failure (cap to avoid unbounded memory).
    if (queue.length < 500) queue.unshift(...batch);
    console.warn("[admin/events] flush failed", err);
  }
}

// ──────────────────────────────────────────────────────────────────
// Auto-capture helpers — wire these in the app shell.
// ──────────────────────────────────────────────────────────────────

export function trackPageView(path: string, properties?: Record<string, unknown>): void {
  trackEvent({ eventType: "page_view", properties: { path, ...properties } });
}

export function trackSignupStart(method: string): void {
  trackEvent({ eventType: "signup_start", properties: { method } });
}

export function trackSignupComplete(userId: string, method: string): void {
  trackEvent({ eventType: "signup_complete", properties: { userId, method } });
}

export function trackLogin(userId: string, method: string): void {
  trackEvent({ eventType: "login", properties: { userId, method } });
}

export function trackLogout(userId: string): void {
  trackEvent({ eventType: "logout", properties: { userId } });
}
