# i18n-switcher

Minimal client-side i18n. localStorage + cookie persist. Lazy dictionary loaders.

## Use
```tsx
// app/providers.tsx
<I18nProvider
  defaultLang="id"
  loaders={{
    id: () => import("./locales/id.json").then((m) => m.default),
    en: () => import("./locales/en.json").then((m) => m.default),
  }}
>
  {children}
</I18nProvider>

// any component
const t = useT();
<h1>{t("hero.title")}</h1>
<LanguageSwitcher locales={[{code:"id",label:"ID"},{code:"en",label:"EN"}]} />
```

## SSR
Cookie `lang` is set on switch — consumer can read it server-side and pre-load the matching dict.
