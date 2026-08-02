"use client";

import * as React from "react";
import type { SettingsAdapter, SettingsValues } from "../lib/adapter";

export interface UseSettingsResult {
  /** Current values, or `null` until the initial `load()` resolves. */
  values: SettingsValues | null;
  /** True between mount and the first successful load. */
  loading: boolean;
  /** True while a `save()` is in flight. */
  saving: boolean;
  error: Error | null;
  /** Persist a partial patch; optimistically merges into local state. */
  save: (patch: Partial<SettingsValues>) => Promise<void>;
}

/** Wraps a {@link SettingsAdapter}: loads on mount, keeps local state,
 *  optimistically applies patches on save and rolls back on failure. */
export function useSettings(adapter: SettingsAdapter): UseSettingsResult {
  const [values, setValues] = React.useState<SettingsValues | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [saving, setSaving] = React.useState(false);
  const [error, setError] = React.useState<Error | null>(null);

  React.useEffect(() => {
    let active = true;
    setLoading(true);
    adapter
      .load()
      .then((v) => active && setValues(v))
      .catch((e) => active && setError(e as Error))
      .finally(() => active && setLoading(false));
    return () => {
      active = false;
    };
  }, [adapter]);

  const save = React.useCallback(
    async (patch: Partial<SettingsValues>) => {
      setSaving(true);
      setError(null);
      const prev = values;
      setValues((cur) =>
        cur
          ? {
              profile: { ...cur.profile, ...patch.profile },
              preferences: { ...cur.preferences, ...patch.preferences },
              notifications: { ...cur.notifications, ...patch.notifications },
            }
          : cur,
      );
      try {
        await adapter.save(patch);
      } catch (e) {
        setValues(prev); // rollback
        setError(e as Error);
        throw e;
      } finally {
        setSaving(false);
      }
    },
    [adapter, values],
  );

  return { values, loading, saving, error, save };
}
