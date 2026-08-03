"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import type { SettingsAdapter } from "../lib/adapter";
import { SETTINGS_SECTIONS, type SettingsSectionId } from "../lib/nav";
import { useSettings } from "../hooks/useSettings";
import { ProfileSection } from "./sections/ProfileSection";
import { PreferencesSection } from "./sections/PreferencesSection";
import { NotificationsSection } from "./sections/NotificationsSection";
import { DangerZone } from "./sections/DangerZone";

export type { SettingsSectionId } from "../lib/nav";

export interface SettingsShellProps {
  adapter: SettingsAdapter;
  /** Controlled active section. Omit for internal state. */
  active?: SettingsSectionId;
  onNavigate?: (section: SettingsSectionId) => void;
  onDeleteAccount?: () => void | Promise<void>;
  className?: string;
  /**
   * Render the built-in section rail. Set `false` when the sections already
   * feed your app sidebar (see `settingsSectionsToNav`) — the shell then
   * renders the active panel only, so the user sees ONE navigation, not two.
   */
  nav?: boolean;
}

export function SettingsShell({
  adapter,
  active,
  onNavigate,
  onDeleteAccount,
  className,
  nav = true,
}: SettingsShellProps) {
  const [internal, setInternal] = React.useState<SettingsSectionId>("profile");
  const current = active ?? internal;
  const go = (s: SettingsSectionId) => (onNavigate ? onNavigate(s) : setInternal(s));

  const { values, loading, saving, save } = useSettings(adapter);

  const panel = loading || !values ? (
    <SectionSkeleton />
  ) : current === "profile" ? (
    <ProfileSection
      value={values.profile}
      saving={saving}
      onSave={(profile) => save({ profile })}
    />
  ) : current === "preferences" ? (
    <PreferencesSection
      value={values.preferences}
      saving={saving}
      onSave={(preferences) => save({ preferences })}
    />
  ) : current === "notifications" ? (
    <NotificationsSection
      value={values.notifications}
      saving={saving}
      onToggle={(patch) =>
        save({ notifications: { ...values.notifications, ...patch } })
      }
    />
  ) : (
    <DangerZone onDeleteAccount={onDeleteAccount} />
  );

  // Panel-only mode: the host shell already renders these sections as its nav.
  if (!nav) return <div className={cn("min-w-0", className)}>{panel}</div>;

  return (
    <div className={cn("flex flex-col gap-6 md:flex-row", className)}>
      <nav className="md:w-56 md:shrink-0">
        {/* Mobile: section picker */}
        <div className="md:hidden">
          <Select value={current} onValueChange={(v) => go(v as SettingsSectionId)}>
            <SelectTrigger className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {SETTINGS_SECTIONS.map((n) => (
                <SelectItem key={n.id} value={n.id}>
                  {n.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        {/* Desktop: ghost button list */}
        <div className="hidden flex-col gap-1 md:flex">
          {SETTINGS_SECTIONS.map((n) => {
            const Icon = n.icon;
            const isActive = current === n.id;
            return (
              <Button
                key={n.id}
                type="button"
                variant="ghost"
                onClick={() => go(n.id)}
                className={cn(
                  "justify-start gap-2",
                  isActive
                    ? "bg-accent font-medium text-accent-foreground"
                    : "text-muted-foreground",
                  n.id === "danger-zone" && "text-destructive hover:text-destructive",
                )}
              >
                <Icon className="size-4" />
                {n.label}
              </Button>
            );
          })}
        </div>
      </nav>

      <div className="min-w-0 flex-1">{panel}</div>
    </div>
  );
}

function SectionSkeleton() {
  return (
    <div className="space-y-4 rounded-lg border p-6">
      <Skeleton className="h-5 w-32" />
      <Skeleton className="h-4 w-64" />
      <Skeleton className="h-10 w-full" />
      <Skeleton className="h-10 w-full" />
    </div>
  );
}
