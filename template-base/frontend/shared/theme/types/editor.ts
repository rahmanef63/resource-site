/**
 * Theme Editor Types
 */

export interface ThemeEditorState {
    styles: {
        light: Record<string, string>
        dark: Record<string, string>
    }
    currentMode: "light" | "dark"
    hslAdjustments: {
        hueShift: number
        saturationScale: number
        lightnessScale: number
    }
}
