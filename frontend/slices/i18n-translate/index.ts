// i18n-translate slice — Google Translate widget drop-in.
//
// Minimal usage:
//
//   import { GoogleTranslate } from "@/features/i18n-translate";
//   <GoogleTranslate />
//
// Project-scoped storage key + custom locale list:
//
//   <GoogleTranslate
//     storageKey="my-app-lang"
//     pageLanguage="id"
//     languages={[
//       { code: "id", label: "Bahasa Indonesia" },
//       { code: "en", label: "English" },
//     ]}
//   />
//
// See README.md for the CSP allowlist the widget needs and the full
// behavior matrix.

export { GoogleTranslate } from "./components/GoogleTranslate";
export { useGoogleTranslate } from "./hooks/useGoogleTranslate";
export { DEFAULT_LANGUAGES } from "./lib/defaults";
export type { Lang, GoogleTranslateProps } from "./lib/types";
