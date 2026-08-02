"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

const shortcuts = [
  { keys: ["Ctrl", "K"], description: "Open command palette" },
  { keys: ["Ctrl", "N"], description: "New message" },
  { keys: ["Ctrl", "/"], description: "Search" },
  { keys: ["Ctrl", "Shift", "M"], description: "Toggle mute" },
  { keys: ["Ctrl", "B"], description: "Toggle sidebar" },
  { keys: ["Esc"], description: "Close dialog" },
  { keys: ["Ctrl", "Enter"], description: "Send message" },
  { keys: ["Ctrl", "."], description: "Toggle emoji picker" },
]

/**
 * Shortcuts Settings - Keyboard shortcuts reference
 */
export function ShortcutsSettings() {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Keyboard Shortcuts</CardTitle>
          <CardDescription>
            Quick reference for keyboard shortcuts
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {shortcuts.map((shortcut, index) => (
              <div
                key={index}
                className="flex items-center justify-between py-2 border-b last:border-0"
              >
                <span className="text-sm">{shortcut.description}</span>
                <div className="flex gap-1">
                  {shortcut.keys.map((key, keyIndex) => (
                    <kbd
                      key={keyIndex}
                      className="px-2 py-1 text-xs font-mono bg-muted rounded border"
                    >
                      {key}
                    </kbd>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Customize Shortcuts</CardTitle>
          <CardDescription>
            Personalize your keyboard shortcuts
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Custom keyboard shortcut configuration will be available in a future update. For now, you can use the default shortcuts listed above.
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
