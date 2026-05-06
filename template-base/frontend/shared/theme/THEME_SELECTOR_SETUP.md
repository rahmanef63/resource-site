## Theme Selector Integration Guide

This document explains **which files to copy** and **how to wire them up** to replicate the theme selector from this project into another Next.js (App Router) project.

---

## 1. Files to Copy

- **Core components**
  - `./components/layout/theme-selector.tsx`
  - `./components/layout/active-theme.tsx`
  - `./components/providers/theme-provider.tsx`

- **Theme data / utilities (optional, only if you need them)**
  - `./utils/theme-fonts.ts`
  - `./config/theme.ts` (if you also port the theme editor/tools that use it)
  - `./store/theme-preset-store.ts` (if you need theme presets)
  - `./hooks/themes.ts` (if you use the theme update hook)

- **Public assets**
  - `public/r/registry.json`

  This file contains the **registry themes** that `ThemeSelector` fetches at runtime.

- **Global styles (reference)**
  - `src/app/globals.css`

  You do **not** have to copy this whole file as‑is, but you must ensure your target project defines the same CSS custom properties (e.g. `--background`, `--foreground`, `--primary`, etc.) and maps them into your design system / Tailwind theme.

---

## 2. Required Dependencies

Your target project should have:

- **React 18+**
- **Next.js (App Router, e.g. 13.4+)**
- **`next-themes`** (for light/dark mode handling)
- **Tailwind CSS** (or equivalent utility classes) – the components here are styled with Tailwind classes.

Install if needed:

```bash
npm install next-themes
```

If you are not using Tailwind, you can still reuse the logic but will need to replace the className strings with your own styles.

---

## 3. Wiring in the Providers (Root Layout)

In your target project’s root layout (e.g. `src/app/layout.tsx`):

1. **Import the providers**:

   ```tsx
   import { ThemeProvider } from "@/components/providers/theme-provider";
   import { ActiveThemeProvider } from "@/components/layout/active-theme";
   ```

2. **Wrap your app body** with `ThemeProvider` (from `next-themes`) and `ActiveThemeProvider` (for the custom theme name + cookie):

   ```tsx
   export default function RootLayout({ children }: { children: React.ReactNode }) {
     const activeThemeValue = "default"; // or "modern-minimal", etc.
     const isScaled = false;             // set to true if using scaled variants

     return (
       <html lang="en" suppressHydrationWarning>
         <body
           className={[
             "bg-background font-sans antialiased",
             activeThemeValue ? `theme-${activeThemeValue}` : "",
             isScaled ? "theme-scaled" : "",
           ].join(" ")}
         >
           <ThemeProvider
             attribute="class"
             defaultTheme="system"
             enableSystem
             disableTransitionOnChange
             enableColorScheme
           >
             <ActiveThemeProvider initialTheme={activeThemeValue}>
               {children}
             </ActiveThemeProvider>
           </ThemeProvider>
         </body>
       </html>
     );
   }
   ```

3. Ensure that `globals.css` (or your main global stylesheet) is imported at the top of `layout.tsx`:

   ```tsx
   import "./globals.css";
   ```

---

## 4. Using the Theme Selector in Your UI

1. **Import** the selector where you want to render it (e.g. in a header component):

   ```tsx
   import { ThemeSelector } from "@/components/layout/theme-selector";
   ```

2. **Render** it inside your header or toolbar:

   ```tsx
   export function SiteHeader() {
     return (
       <header className="flex items-center justify-between px-4 py-2">
         {/* ...left side (logo, nav, etc.) */}
         <div className="flex items-center gap-2">
           {/* other controls */}
           <ThemeSelector />
         </div>
       </header>
     );
   }
   ```

The `ThemeSelector` component:

- Reads and writes the active theme via `useThemeConfig()` from `active-theme.tsx`.
- Fetches theme definitions from `/r/registry.json`.
- Applies CSS variables to `document.documentElement` for the chosen theme.

---

## 5. `registry.json` Format

The selector expects `public/r/registry.json` to have the following structure:

```json
{
  "items": [
    {
      "name": "modern-minimal",
      "title": "Modern Minimal",
      "cssVars": {
        "light": {
          "background": "oklch(1.00 0 0)",
          "foreground": "oklch(0.32 0 0)"
          // ...other CSS variable keys
        },
        "dark": {
          "background": "oklch(0.20 0 0)",
          "foreground": "oklch(0.92 0 0)"
          // ...other CSS variable keys
        }
      }
    }
  ]
}
```

- `name`: internal identifier used by `ThemeSelector` and `ActiveThemeProvider`.
- `title`: label shown in the dropdown.
- `cssVars.light` / `cssVars.dark`: maps of CSS variable names **without** the `--` prefix (e.g. `"background"`, `"primary"`) to color values.

You can copy the existing `registry.json` from this project and adjust colors or add/remove items as needed.

---

## 6. Global CSS Requirements

Your global CSS should:

- **Define the base CSS variables** used by the theme system:
  - `--background`, `--foreground`, `--card`, `--primary`, `--secondary`, `--muted`, `--accent`, `--border`, `--ring`, `--chart-1`–`--chart-5`, `--sidebar`, etc.
- Map those CSS variables into your design system / Tailwind `@theme` (if you are using Tailwind v4+ like this project).

You can use `src/app/globals.css` from this project as a reference for:

- How theme variables are mapped to Tailwind colors.
- How `body` is styled to use those variables.

If you already have a different global setup, just ensure:

- The variable names set by `ThemeSelector` (`--background`, `--primary`, etc.) are actually used in your styles.

---

## 7. UI Dependencies inside `ThemeSelector`

Inside `theme-selector.tsx` you will see imports like:

- `Label` from `@/components/ui/label`
- `Select`, `SelectItem`, etc. from `@/components/ui/select`

If your target project:

- Already uses **shadcn/ui** or a similar component set, you can keep these imports and ensure the paths match.
- If not, either:
  - Copy the corresponding `ui` components from this project, **or**
  - Replace the `<Select>` and `<Label>` usages with your own dropdown/label components while keeping the logic in `ThemeSelector` unchanged.

---

## 8. Cookie + Theme Classes

- `active-theme.tsx`:
  - Stores the active theme name in a cookie (`active_theme`).
  - Adds a `theme-<name>` class to `document.body` (and `theme-scaled` for scaled variants).
- `theme-selector.tsx`:
  - Applies the actual color variables to `document.documentElement`.

In most cases you do **not** need extra CSS for the `theme-*` classes unless your design wants to style layout based on them; they are mainly useful as hooks for additional theme-specific tweaks.

---

## 9. Quick Checklist for a Fresh Project

- **[ ]** Install `next-themes`.
- **[ ]** Copy:
  - `src/components/layout/theme-selector.tsx`
  - `src/components/layout/active-theme.tsx`
  - `src/components/providers/theme-provider.tsx`
  - `public/r/registry.json`
- **[ ]** Wire `ThemeProvider` and `ActiveThemeProvider` in `src/app/layout.tsx`.
- **[ ]** Import your `globals.css` in `layout.tsx`.
- **[ ]** Ensure your global CSS uses the theme CSS variables (`--background`, `--primary`, etc.).
- **[ ]** Add `<ThemeSelector />` to your header or toolbar.

Once these steps are done, your other project should have the same theme selector behavior as this one.


