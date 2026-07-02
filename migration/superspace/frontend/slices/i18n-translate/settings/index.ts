/**
 * i18n-translate settings — minimal. Pure-client library slice; the only
 * persisted state is the user's locale choice in localStorage.
 */

export const DEFAULT_I18N_TRANSLATE_SETTINGS = {
  pageLanguage: "id",
  storageKey: "google-translate-lang",
}

export type I18nTranslateSettingsSchema = typeof DEFAULT_I18N_TRANSLATE_SETTINGS

export function I18nTranslateSettings() {
  return null
}
