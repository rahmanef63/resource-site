/**
 * Wave N+3 — Bidirectional Sync Detection Layer (BSDL).
 *
 * Consumer-side manifest contract: every slice copy in a consumer repo
 * (CareerPack / notion / rahmanef / content / superspace / cescadesigns)
 * declares which kitab slug + version it adopted, what the consumer-local
 * version is, what sync direction is allowed, and how generalised the
 * consumer-local copy is.
 *
 * The kitab `rr scan-consumers` command reads these and surfaces what
 * needs UP-sync (`rr-send`) vs DOWN-sync (`rr update`).
 *
 * @module packages/cli/lib/consumer-manifest
 */

export type SyncDirection =
  | "bidirectional"
  | "down-only"
  | "up-only"
  | "frozen";

export type GeneralizationStatus =
  | "portable"
  | "needs-adapter"
  | "consumer-locked";

export type SyncDirectionVerdict =
  | "in-sync"
  | "up-needed"
  | "down-needed"
  | "diverged"
  | "consumer-only"
  | "kitab-only";

export interface ConsumerGeneralization {
  /**
   * Portable: the slice is fully generic and `rr-send` will accept it.
   * needs-adapter: requires a thin adapter to plug consumer-specific
   *   props/labels/routes — kitab can ingest if blockers are addressed.
   * consumer-locked: contains business-specific logic that cannot be
   *   generalised — UP-sync rejected; only DOWN-sync allowed.
   */
  status: GeneralizationStatus;
  /** ISO date — when the audit ran. */
  auditedAt: string;
  /** Human-readable reasons preventing portability. Empty when portable. */
  blockers: string[];
}

export interface ConsumerManifest {
  $schema?: string;
  /** Kebab-case slug — must match a kitab `slice.contract.ts` `id`. */
  kitabSlug: string;
  /** Semver of the kitab version this copy was last pulled from. */
  kitabVersion: string;
  /** Semver of the consumer-local divergence. Bump after each local edit. */
  consumerVersion: string;
  syncDirection: SyncDirection;
  generalization: ConsumerGeneralization;
  /** ISO timestamp of last successful `rr update --apply`. */
  lastPullAt: string | null;
  /** ISO timestamp of last successful `/rr-send`. */
  lastPushAt: string | null;
}

export interface SyncDiff {
  slug: string;
  /** Kitab contract version, or null if slice not in kitab. */
  kitabVersion: string | null;
  /** Consumer manifest version, or null if no manifest in consumer. */
  consumerVersion: string | null;
  direction: SyncDirectionVerdict;
  blockers: string[];
  generalization: GeneralizationStatus | null;
  /** Allowed sync directions per the manifest, narrowed by verdict. */
  allowedActions: ("rr-send" | "rr-update")[];
}

export interface WalkedSlice {
  /** Absolute path to the slice dir inside the consumer repo. */
  dir: string;
  /** Parsed manifest, or undefined if read failed. */
  manifest?: ConsumerManifest;
  /** Error message if manifest existed but failed validation. */
  error?: string;
}

export function validateConsumerManifest(m: unknown): string[];
export function readConsumerManifest(filepath: string): Promise<ConsumerManifest>;
export function writeConsumerManifest(
  filepath: string,
  m: ConsumerManifest,
): Promise<void>;
export function diffSlice(input: {
  slug: string;
  manifest: ConsumerManifest | null;
  kitabVersion: string | null;
}): SyncDiff;
export function walkConsumerSlices(consumerRoot: string): Promise<WalkedSlice[]>;
export function compareSemver(a: string, b: string): number;
