import { useEffect, useRef, useCallback, useState } from 'react';

interface AutosaveOptions<T> {
  data: T;
  onSave: (data: T) => Promise<void> | void;
  delay?: number;
  enabled?: boolean;
  storageKey?: string;
}

interface AutosaveReturn {
  isSaving: boolean;
  lastSaved: Date | null;
  saveNow: () => Promise<void>;
  clearDraft: () => void;
}

export function useAutosave<T>({
  data,
  onSave,
  delay = 3000,
  enabled = true,
  storageKey,
}: AutosaveOptions<T>): AutosaveReturn {
  const [isSaving, setIsSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const previousDataRef = useRef<string | undefined>(undefined);

  const saveNow = useCallback(async () => {
    if (!enabled) return;

    setIsSaving(true);
    try {
      await onSave(data);
      setLastSaved(new Date());
      
      if (storageKey) {
        localStorage.setItem(storageKey, JSON.stringify(data));
      }
    } catch (error) {
      console.error('Autosave failed:', error);
      throw error;
    } finally {
      setIsSaving(false);
    }
  }, [data, onSave, enabled, storageKey]);

  const clearDraft = useCallback(() => {
    if (storageKey) {
      localStorage.removeItem(storageKey);
    }
    setLastSaved(null);
  }, [storageKey]);

  useEffect(() => {
    if (!enabled) return;

    const currentData = JSON.stringify(data);
    
    if (currentData === previousDataRef.current) {
      return;
    }

    previousDataRef.current = currentData;

    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    timeoutRef.current = setTimeout(() => {
      saveNow();
    }, delay);

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [data, delay, enabled, saveNow]);

  useEffect(() => {
    if (!storageKey) return;

    const savedDraft = localStorage.getItem(storageKey);
    if (savedDraft) {
      try {
        const parsed = JSON.parse(savedDraft);
        const savedTime = parsed._autosaveTimestamp;
        if (savedTime) {
          setLastSaved(new Date(savedTime));
        }
      } catch (error) {
        console.error('Failed to load draft:', error);
      }
    }
  }, [storageKey]);

  return {
    isSaving,
    lastSaved,
    saveNow,
    clearDraft,
  };
}

export function loadDraft<T>(storageKey: string): T | null {
  try {
    const saved = localStorage.getItem(storageKey);
    if (!saved) return null;
    
    const parsed = JSON.parse(saved);
    delete parsed._autosaveTimestamp;
    return parsed;
  } catch (error) {
    console.error('Failed to load draft:', error);
    return null;
  }
}

export function hasDraft(storageKey: string): boolean {
  return localStorage.getItem(storageKey) !== null;
}
