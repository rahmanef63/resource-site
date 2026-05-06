"use client"

import * as React from "react"
import { Globe, Check, ChevronDown, Languages, Search } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { cn } from "@/lib/utils"

export interface Language {
  code: string
  name: string
  nativeName: string
  flag?: string
}

export interface LanguageSelectorProps {
  languages?: Language[]
  currentLanguage?: string
  onLanguageChange?: (code: string) => void
  variant?: "dropdown" | "combobox" | "grid"
  className?: string
}

const defaultLanguages: Language[] = [
  { code: "en", name: "English", nativeName: "English", flag: "🇺🇸" },
  { code: "id", name: "Indonesian", nativeName: "Bahasa Indonesia", flag: "🇮🇩" },
  { code: "es", name: "Spanish", nativeName: "Español", flag: "🇪🇸" },
  { code: "fr", name: "French", nativeName: "Français", flag: "🇫🇷" },
  { code: "de", name: "German", nativeName: "Deutsch", flag: "🇩🇪" },
  { code: "ja", name: "Japanese", nativeName: "日本語", flag: "🇯🇵" },
  { code: "ko", name: "Korean", nativeName: "한국어", flag: "🇰🇷" },
  { code: "zh", name: "Chinese", nativeName: "中文", flag: "🇨🇳" },
  { code: "ar", name: "Arabic", nativeName: "العربية", flag: "🇸🇦" },
  { code: "pt", name: "Portuguese", nativeName: "Português", flag: "🇧🇷" },
]

/**
 * Language Selector Dropdown
 */
export function LanguageDropdown({
  languages = defaultLanguages,
  currentLanguage = "en",
  onLanguageChange,
  className,
}: LanguageSelectorProps) {
  const current = languages.find((l) => l.code === currentLanguage)

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className={className}>
          <Globe className="h-5 w-5" />
          <span className="sr-only">Select language</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48">
        <DropdownMenuLabel>Select Language</DropdownMenuLabel>
        <DropdownMenuSeparator />
        {languages.map((language) => (
          <DropdownMenuItem
            key={language.code}
            onClick={() => onLanguageChange?.(language.code)}
            className="flex items-center justify-between"
          >
            <span className="flex items-center gap-2">
              {language.flag && <span>{language.flag}</span>}
              {language.nativeName}
            </span>
            {currentLanguage === language.code && (
              <Check className="h-4 w-4" />
            )}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

/**
 * Language Selector Combobox (with search)
 */
export function LanguageCombobox({
  languages = defaultLanguages,
  currentLanguage = "en",
  onLanguageChange,
  className,
}: LanguageSelectorProps) {
  const [open, setOpen] = React.useState(false)
  const current = languages.find((l) => l.code === currentLanguage)

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className={cn("w-[200px] justify-between", className)}
        >
          <span className="flex items-center gap-2">
            {current?.flag && <span>{current.flag}</span>}
            {current?.nativeName || "Select language"}
          </span>
          <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[200px] p-0">
        <Command>
          <CommandInput placeholder="Search language..." />
          <CommandList>
            <CommandEmpty>No language found.</CommandEmpty>
            <CommandGroup>
              {languages.map((language) => (
                <CommandItem
                  key={language.code}
                  value={`${language.name} ${language.nativeName}`}
                  onSelect={() => {
                    onLanguageChange?.(language.code)
                    setOpen(false)
                  }}
                >
                  <span className="flex items-center gap-2">
                    {language.flag && <span>{language.flag}</span>}
                    {language.nativeName}
                  </span>
                  {currentLanguage === language.code && (
                    <Check className="ml-auto h-4 w-4" />
                  )}
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  )
}

/**
 * Language Grid Selector (for Settings page)
 */
export function LanguageGrid({
  languages = defaultLanguages,
  currentLanguage = "en",
  onLanguageChange,
  className,
}: LanguageSelectorProps) {
  return (
    <div className={cn("grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4", className)}>
      {languages.map((language) => (
        <button
          key={language.code}
          onClick={() => onLanguageChange?.(language.code)}
          className={cn(
            "flex flex-col items-center gap-2 rounded-lg border-2 p-4 transition-all hover:border-primary/50",
            currentLanguage === language.code
              ? "border-primary bg-primary/5"
              : "border-transparent bg-muted/50"
          )}
        >
          {language.flag && (
            <span className="text-2xl">{language.flag}</span>
          )}
          <span className="font-medium text-sm">{language.nativeName}</span>
          <span className="text-xs text-muted-foreground">{language.name}</span>
        </button>
      ))}
    </div>
  )
}

/**
 * Language Settings Card
 */
export function LanguageSettingsCard({
  languages = defaultLanguages,
  currentLanguage = "en",
  onLanguageChange,
  className,
}: LanguageSelectorProps) {
  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Languages className="h-5 w-5" />
          Language
        </CardTitle>
        <CardDescription>
          Choose your preferred language for the interface
        </CardDescription>
      </CardHeader>
      <CardContent>
        <LanguageGrid
          languages={languages}
          currentLanguage={currentLanguage}
          onLanguageChange={onLanguageChange}
        />
      </CardContent>
    </Card>
  )
}

/**
 * Main Language Selector Component
 */
export function LanguageSelector({
  variant = "dropdown",
  ...props
}: LanguageSelectorProps) {
  switch (variant) {
    case "combobox":
      return <LanguageCombobox {...props} />
    case "grid":
      return <LanguageGrid {...props} />
    case "dropdown":
    default:
      return <LanguageDropdown {...props} />
  }
}
