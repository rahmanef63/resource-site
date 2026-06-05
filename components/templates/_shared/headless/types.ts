// Contracts for the headless-OS surface (setup health / update / backup /
// onboarding). Components in this dir are PROPS-DRIVEN (R3): no convex/react
// import here — the standalone repo wires its own Convex hooks into these
// props (see README.md). rr previews can render them with mock props.

import type * as React from "react";

/** Result of the public `setup.status` query every template backend ships. */
export interface SetupStatus {
  ownerClaimed: boolean;
  seeded: boolean;
  onboarded?: boolean;
  signupOpen?: boolean;
  signupKeyRequired?: boolean;
  /** JWT auth keys present on the deployment? false = setup-auth.mjs could
   *  not write them (deploy key lacks WriteEnvironmentVariables). */
  authReady?: boolean;
}

/** `update.fetchUpstreamVersion` action result (raw version.json upstream). */
export interface UpstreamVersion {
  version?: string;
  core?: string;
  channel?: string;
}

/** `update.triggerDeploy` action result. */
export interface DeployResult {
  ok: boolean;
  /** "no-hook" when VERCEL_DEPLOY_HOOK_URL is not configured. */
  reason?: string;
}

/** `backup.exportAll` snapshot shape (content tables only, never auth). */
export interface BackupSnapshot {
  exportedAt: number;
  tables: Record<string, unknown[]>;
  [key: string]: unknown;
}

/** Site identity fields collected by the onboarding wizard. All optional —
 *  the backend `settings.upsert` patches only what is provided. */
export interface OnboardingFields {
  siteName: string;
  tagline: string;
  ownerName: string;
  contactEmail: string;
  brandColor: string;
  themeDefault: string;
  /** tweakcn preset name — the site-wide color preset ("" = template default). */
  themePreset: string;
  logoUrl: string;
  faviconUrl: string;
  analyticsId: string;
}

/** Image upload control injected into the wizard (Convex-coupled in the
 *  standalone repo — e.g. its `ImageField`). */
export type ImageFieldComponent = React.ComponentType<{
  label: string;
  onUploaded: (url: string) => void;
}>;
