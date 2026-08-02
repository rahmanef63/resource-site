/**
 * ThemeToggle Component
 * 
 * Animated theme switcher with framer-motion transitions.
 * Supports Light, Dark, and System/Auto modes.
 * 
 * @example
 * ```tsx
 * import { ThemeToggle } from "@/frontend/shared/theme"
 * 
 * <ThemeToggle />
 * <ThemeToggle size="sm" />
 * <ThemeToggle variant="minimal" />
 * ```
 */

"use client"

import React from "react"
import { motion } from "framer-motion"
import { Sun, Moon, Monitor } from "lucide-react"
import { useTheme } from "next-themes"
import { cn } from "@/lib/utils"

export interface ThemeToggleProps {
    /** Size variant */
    size?: "sm" | "default" | "lg"
    /** Visual variant */
    variant?: "default" | "minimal" | "pills"
    /** Show labels */
    showLabels?: boolean
    /** Additional className */
    className?: string
}

const themes = [
    { value: "light", label: "Light", icon: Sun },
    { value: "dark", label: "Dark", icon: Moon },
    { value: "system", label: "Auto", icon: Monitor },
] as const

export function ThemeToggle({
    size = "default",
    variant = "default",
    showLabels = true,
    className,
}: ThemeToggleProps) {
    const { theme, setTheme } = useTheme()
    const [mounted, setMounted] = React.useState(false)

    // Avoid hydration mismatch
    React.useEffect(() => {
        setMounted(true)
    }, [])

    if (!mounted) {
        return (
            <div className={cn(
                "flex items-center gap-1 p-1 rounded-lg bg-muted/50",
                size === "sm" && "p-0.5",
                size === "lg" && "p-1.5",
                className
            )}>
                {themes.map((t) => (
                    <div
                        key={t.value}
                        className={cn(
                            "flex-1 flex items-center justify-center gap-1.5 py-1.5 px-2 rounded-md",
                            size === "sm" && "py-1 px-1.5",
                            size === "lg" && "py-2 px-3",
                        )}
                    >
                        <t.icon className={cn(
                            "h-3.5 w-3.5",
                            size === "sm" && "h-3 w-3",
                            size === "lg" && "h-4 w-4",
                        )} />
                        {showLabels && (
                            <span className={cn(
                                "text-xs font-medium",
                                size === "lg" && "text-sm",
                            )}>
                                {t.label}
                            </span>
                        )}
                    </div>
                ))}
            </div>
        )
    }

    // Get current theme index for indicator position
    const currentIndex = themes.findIndex((t) => t.value === theme)
    const indicatorOffset = currentIndex >= 0 ? currentIndex : 2

    // Size classes
    const sizeClasses = {
        sm: {
            container: "p-0.5 gap-0.5",
            button: "py-1 px-1.5 gap-1",
            icon: "h-3 w-3",
            text: "text-[10px]",
        },
        default: {
            container: "p-1 gap-1",
            button: "py-1.5 px-2 gap-1.5",
            icon: "h-3.5 w-3.5",
            text: "text-xs",
        },
        lg: {
            container: "p-1.5 gap-1.5",
            button: "py-2 px-3 gap-2",
            icon: "h-4 w-4",
            text: "text-sm",
        },
    }

    const s = sizeClasses[size]

    if (variant === "minimal") {
        // Minimal: just icons, no background pill
        return (
            <div className={cn("flex items-center gap-1", className)}>
                {themes.map((t) => {
                    const Icon = t.icon
                    const isActive = theme === t.value

                    return (
                        <button
                            key={t.value}
                            onClick={() => setTheme(t.value)}
                            className={cn(
                                "p-1.5 rounded-md transition-colors",
                                isActive
                                    ? "bg-primary/10 text-primary"
                                    : "text-muted-foreground hover:text-foreground hover:bg-muted",
                            )}
                            title={t.label}
                        >
                            <motion.div
                                initial={false}
                                animate={{
                                    scale: isActive ? 1 : 0.9,
                                    rotate: t.value === "light" && !isActive ? -15 : t.value === "dark" && !isActive ? 15 : 0,
                                }}
                                transition={{ type: "spring", stiffness: 400, damping: 25 }}
                            >
                                <Icon className={s.icon} />
                            </motion.div>
                        </button>
                    )
                })}
            </div>
        )
    }

    // Default/Pills: full toggle with sliding indicator
    return (
        <div
            className={cn(
                "flex items-center rounded-lg bg-muted/50 relative",
                s.container,
                className
            )}
        >
            {/* Animated Background Indicator */}
            <motion.div
                className="absolute rounded-md bg-background shadow-sm"
                style={{
                    top: 4,
                    bottom: 4,
                    width: `calc(${100 / themes.length}% - 8px)`,
                }}
                initial={false}
                animate={{
                    x: `calc(${indicatorOffset * 100}% + ${indicatorOffset * 4}px + 4px)`,
                }}
                transition={{
                    type: "spring",
                    stiffness: 400,
                    damping: 30,
                }}
            />

            {/* Theme Buttons */}
            {themes.map((t) => {
                const Icon = t.icon
                const isActive = theme === t.value

                return (
                    <button
                        key={t.value}
                        onClick={() => setTheme(t.value)}
                        className={cn(
                            "relative flex-1 flex items-center justify-center rounded-md font-medium transition-colors z-10",
                            s.button,
                            isActive ? "text-foreground" : "text-muted-foreground hover:text-foreground"
                        )}
                    >
                        <motion.div
                            initial={false}
                            animate={{
                                scale: isActive ? 1 : 0.85,
                                rotate: t.value === "light" && !isActive ? -15 : t.value === "dark" && !isActive ? 15 : 0,
                            }}
                            transition={{ type: "spring", stiffness: 400, damping: 25 }}
                        >
                            <Icon className={s.icon} />
                        </motion.div>
                        {showLabels && <span className={s.text}>{t.label}</span>}
                    </button>
                )
            })}
        </div>
    )
}

export default ThemeToggle
