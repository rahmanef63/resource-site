"use client";

import Link from "next/link";
import Image from "next/image";
import { useLanguage } from "../contexts/LanguageContext";
import { useTheme } from "../contexts/ThemeContext";
import { Menu, X, Globe, Sun, Moon } from "lucide-react";
import { useState, useEffect } from "react";
import { useBackend } from "../shared/hooks/useBackend";
import CartDropdown from "./CartDropdown";
import CurrencySelector from "./CurrencySelector";

interface NavigationItem {
  id: number;
  labelId: string;
  labelEn: string;
  labelAr: string;
  path: string;
  isExternal: boolean;
  displayOrder: number;
}

export default function Navbar() {
  const { locale, setLocale } = useLanguage();
  const { theme, toggleTheme } = useTheme();
  const backend = useBackend();
  const [isOpen, setIsOpen] = useState(false);
  const [showLangMenu, setShowLangMenu] = useState(false);
  const [navItems, setNavItems] = useState<NavigationItem[]>([]);
  const [settings, setSettings] = useState<any>(null);

  useEffect(() => {
    backend.navigation.list()
      .then((res: any) => setNavItems(res.items))
      .catch(console.error);
    backend.settings.get()
      .then((res: any) => setSettings(res.settings))
      .catch(console.error);
  }, [backend]);

  const getLabel = (item: NavigationItem) => {
    return locale === "id" ? item.labelId : locale === "en" ? item.labelEn : item.labelAr;
  };

  return (
    <nav className="border-b sticky top-0 z-50 backdrop-blur-sm bg-background/95">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <Link href="/" className="flex items-center gap-2">
            {settings?.logoUrl ? (
              <Image
                src={settings.logoUrl}
                alt={settings.brandName || "Logo"}
                width={128}
                height={32}
                className="h-8 w-auto"
                sizes="128px"
              />
            ) : (
              <span className="text-2xl font-bold text-foreground">{settings?.brandName || "Your Brand"}</span>
            )}
          </Link>

          <div className="hidden md:flex items-center gap-6">
            {navItems.map((item) => (
              item.isExternal ? (
                <a
                  key={item.id}
                  href={item.path}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-foreground/80 hover:text-foreground transition-colors"
                >
                  {getLabel(item)}
                </a>
              ) : (
                <Link
                  key={item.id}
                  href={item.path}
                  className="text-foreground/80 hover:text-foreground transition-colors"
                >
                  {getLabel(item)}
                </Link>
              )
            ))}

            <CartDropdown />

            <CurrencySelector />
            
            <button
              onClick={toggleTheme}
              className="p-2 hover:bg-muted rounded-lg transition-colors"
              aria-label="Toggle theme"
            >
              {theme === "dark" ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </button>
            
            <div className="relative">
              <button
                onClick={() => setShowLangMenu(!showLangMenu)}
                className="flex items-center gap-2 text-foreground/80 hover:text-foreground transition-colors"
              >
                <Globe className="w-4 h-4" />
                {locale.toUpperCase()}
              </button>
              {showLangMenu && (
                <div className="absolute right-0 mt-2 w-32 bg-background border rounded-lg shadow-lg py-1">
                  {(["id", "en", "ar"] as const).map((lang) => (
                    <button
                      key={lang}
                      onClick={() => {
                        setLocale(lang);
                        setShowLangMenu(false);
                      }}
                      className="block w-full text-left px-4 py-2 text-sm hover:bg-muted"
                    >
                      {lang === "id" ? "🇮🇩 Indonesia" : lang === "en" ? "🇬🇧 English" : "🇸🇦 العربية"}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          <button aria-label="Close"
            onClick={() => setIsOpen(!isOpen)}
            className="md:hidden text-foreground"
          >
            {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {isOpen && (
          <div className="md:hidden py-4 space-y-3">
            {navItems.map((item) => (
              item.isExternal ? (
                <a
                  key={item.id}
                  href={item.path}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => setIsOpen(false)}
                  className="block text-foreground/80 hover:text-foreground transition-colors"
                >
                  {getLabel(item)}
                </a>
              ) : (
                <Link
                  key={item.id}
                  href={item.path}
                  onClick={() => setIsOpen(false)}
                  className="block text-foreground/80 hover:text-foreground transition-colors"
                >
                  {getLabel(item)}
                </Link>
              )
            ))}
            <div className="flex gap-2 pt-2">
              {(["id", "en", "ar"] as const).map((lang) => (
                <button
                  key={lang}
                  onClick={() => {
                    setLocale(lang);
                    setIsOpen(false);
                  }}
                  className={`px-3 py-1 rounded ${
                    locale === lang ? "bg-primary text-primary-foreground" : "bg-muted"
                  }`}
                >
                  {lang.toUpperCase()}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}
