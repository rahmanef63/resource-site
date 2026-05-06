const THEME_LABEL_OVERRIDES: Record<string, string> = {
  vercel: "Midnight System",
}

export function formatThemeLabel(themeName: string) {
  const normalizedTheme = themeName.trim().toLowerCase()
  const override = THEME_LABEL_OVERRIDES[normalizedTheme]

  if (override) {
    return override
  }

  return themeName
    .split("-")
    .map((segment) => segment.charAt(0).toUpperCase() + segment.slice(1))
    .join(" ")
}
