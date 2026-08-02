import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function uid(prefix = "id") {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return `${prefix}_${crypto.randomUUID()}`
  }
  const random = Math.random().toString(36).slice(2, 10)
  const timestamp = Date.now().toString(36)
  return `${prefix}_${timestamp}${random}`
}

export function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max)
}

/** Safely extract a human message from any thrown value. */
export function errorMessage(e: unknown, fallback = "Something went wrong"): string {
  if (e instanceof Error) return e.message
  if (typeof e === "string") return e
  if (e && typeof e === "object" && "message" in e) {
    const m = (e as { message?: unknown }).message
    if (typeof m === "string") return m
  }
  return fallback
}
