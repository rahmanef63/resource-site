export const sansSerifFonts = [
  { name: "Inter", value: "Inter" },
  { name: "Roboto", value: "Roboto" },
  { name: "Open Sans", value: "Open Sans" },
  { name: "Lato", value: "Lato" },
  { name: "Montserrat", value: "Montserrat" },
]

export const serifFonts = [
  { name: "Georgia", value: "Georgia" },
  { name: "Times New Roman", value: "Times New Roman" },
  { name: "Playfair Display", value: "Playfair Display" },
  { name: "Merriweather", value: "Merriweather" },
]

export const monoFonts = [
  { name: "JetBrains Mono", value: "JetBrains Mono" },
  { name: "Fira Code", value: "Fira Code" },
  { name: "Source Code Pro", value: "Source Code Pro" },
  { name: "Monaco", value: "Monaco" },
]

export function getAppliedThemeFont(fontType: string, fontValue: string) {
  const fontMap = {
    sans: sansSerifFonts,
    serif: serifFonts,
    mono: monoFonts,
  }
  
  const fonts = fontMap[fontType as keyof typeof fontMap] || sansSerifFonts
  return fonts.find(font => font.value === fontValue) || fonts[0]
}


