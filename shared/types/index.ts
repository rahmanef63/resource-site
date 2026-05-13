// shared/types/index.ts — canonical base types for slice extension.
// Slices should extend these via `extends`, Pick<>, Omit<>, or composition.
// Drop this file into your project's shared/types/ folder as a starting point.

// ─── ENTITY BASES ─────────────────────────────────────────────────────────

/** Every persisted entity has an id + timestamps. */
export interface BaseEntity {
  id: string
  createdAt: number
  updatedAt: number
}

/** Soft-delete pattern — flip deletedAt instead of hard removing. */
export interface SoftDeletable {
  deletedAt?: number
}

/** Workspace-isolated entity — every query MUST filter by workspaceId. */
export interface WorkspaceScoped {
  workspaceId: string
}

/** Owned-by-user entity — RBAC checks via userId match. */
export interface UserOwned {
  userId: string
}

/** Audit-trail-capable entity. */
export interface Auditable {
  lastEditedBy?: string
  lastEditedAt?: number
}

// ─── BRANDED PRIMITIVES ───────────────────────────────────────────────────
//
// Type-narrow IDs at boundaries. Stops you passing a userId where a
// workspaceId is expected — TypeScript will complain.

declare const __brand: unique symbol
export type Brand<T, B extends string> = T & { readonly [__brand]: B }

export type UserId = Brand<string, "UserId">
export type WorkspaceId = Brand<string, "WorkspaceId">
export type PageId = Brand<string, "PageId">

// ─── RESULT / EITHER ──────────────────────────────────────────────────────

export type Result<T, E = Error> =
  | { ok: true; value: T }
  | { ok: false; error: E }

export function ok<T>(value: T): Result<T, never> { return { ok: true, value } }
export function err<E>(error: E): Result<never, E> { return { ok: false, error } }

// ─── COMMON ENUMS ─────────────────────────────────────────────────────────

export enum EntityStatus {
  Active = "active",
  Archived = "archived",
  Deleted = "deleted",
}

export enum AuditAction {
  Created = "created",
  Updated = "updated",
  Deleted = "deleted",
  Restored = "restored",
}

export enum Role {
  Owner = "owner",
  Admin = "admin",
  Manager = "manager",
  Staff = "staff",
  Client = "client",
  Guest = "guest",
}

// ─── PAGINATION ───────────────────────────────────────────────────────────

export interface CursorPage<T> {
  items: T[]
  nextCursor: string | null
  hasMore: boolean
}

export interface OffsetPage<T> {
  items: T[]
  total: number
  offset: number
  limit: number
}
