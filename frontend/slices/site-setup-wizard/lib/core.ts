export const ONBOARDING_STEPS = ["Identitas", "Branding", "Konten", "Selesai"] as const;

export interface OnboardingFields {
  siteName: string;
  tagline: string;
  ownerName: string;
  contactEmail: string;
  brandColor: string;
  themeDefault: string;
  themePreset: string;
  logoUrl: string;
  faviconUrl: string;
  analyticsId: string;
}

export interface PresetOption {
  name: string;
  label?: string;
  group?: string;
  swatches?: string[];
}

export type OnboardingSavePayload = Partial<OnboardingFields> & { markOnboarded: true };

export type OnboardingSnapshot = {
  step: number;
  fields: OnboardingFields;
  justSeeded: boolean;
};

export type OnboardingStore = {
  subscribe: (listener: () => void) => () => void;
  getSnapshot: () => OnboardingSnapshot;
  setField: (key: keyof OnboardingFields, value: string) => void;
  goto: (step: number) => void;
  next: () => void;
  prev: () => void;
  markSeeded: () => void;
};

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function createOnboardingFields(defaultBrandColor = "#c4583a"): OnboardingFields {
  return {
    siteName: "",
    tagline: "",
    ownerName: "",
    contactEmail: "",
    brandColor: defaultBrandColor,
    themeDefault: "system",
    themePreset: "",
    logoUrl: "",
    faviconUrl: "",
    analyticsId: "",
  };
}

export function isValidOptionalEmail(value: string): boolean {
  return value.length === 0 || EMAIL_RE.test(value);
}

export function normalizePresetOptions(
  options: ReadonlyArray<string | PresetOption> | undefined,
): PresetOption[] {
  if (!options) return [];
  return options.map((option) => (typeof option === "string" ? { name: option } : option));
}

export function groupPresetOptions(options: PresetOption[]): Array<{ group: string; items: PresetOption[] }> {
  const order: string[] = [];
  const grouped = new Map<string, PresetOption[]>();
  for (const option of options) {
    const group = option.group ?? "";
    if (!grouped.has(group)) {
      grouped.set(group, []);
      order.push(group);
    }
    grouped.get(group)!.push(option);
  }
  return order.map((group) => ({ group, items: grouped.get(group)! }));
}

export function buildOnboardingSavePayload(fields: OnboardingFields): OnboardingSavePayload {
  return {
    siteName: fields.siteName || undefined,
    tagline: fields.tagline || undefined,
    ownerName: fields.ownerName || undefined,
    contactEmail: fields.contactEmail || undefined,
    brandColor: fields.brandColor || undefined,
    themeDefault: fields.themeDefault || undefined,
    themePreset: fields.themePreset || undefined,
    logoUrl: fields.logoUrl || undefined,
    faviconUrl: fields.faviconUrl || undefined,
    analyticsId: fields.analyticsId || undefined,
    markOnboarded: true,
  };
}

export function createOnboardingStore(defaultBrandColor = "#c4583a"): OnboardingStore {
  let snapshot: OnboardingSnapshot = {
    step: 0,
    fields: createOnboardingFields(defaultBrandColor),
    justSeeded: false,
  };
  const listeners = new Set<() => void>();

  const emit = (next: OnboardingSnapshot) => {
    snapshot = next;
    for (const listener of listeners) listener();
  };
  const clampStep = (step: number) => Math.max(0, Math.min(ONBOARDING_STEPS.length - 1, Math.round(step)));

  return {
    subscribe(listener) {
      listeners.add(listener);
      return () => listeners.delete(listener);
    },
    getSnapshot: () => snapshot,
    setField(key, value) {
      emit({ ...snapshot, fields: { ...snapshot.fields, [key]: value } });
    },
    goto(step) {
      emit({ ...snapshot, step: clampStep(step) });
    },
    next() {
      emit({ ...snapshot, step: clampStep(snapshot.step + 1) });
    },
    prev() {
      emit({ ...snapshot, step: clampStep(snapshot.step - 1) });
    },
    markSeeded() {
      emit({ ...snapshot, justSeeded: true });
    },
  };
}
