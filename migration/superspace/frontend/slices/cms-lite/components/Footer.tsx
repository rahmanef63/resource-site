"use client";

import { Instagram, Mail, Phone } from "lucide-react";
import { useLanguage } from "../contexts/LanguageContext";
import { useEffect, useState } from "react";
import { useBackend } from "../shared/hooks/useBackend";
import type { Settings } from "../types/cms-types";

type FooterSettings = Partial<Settings> & {
  email?: string;
  phone?: string;
  instagram?: string;
};

export default function Footer() {
  const { t } = useLanguage();
  const backend = useBackend();
  const [settings, setSettings] = useState<FooterSettings | null>(null);

  useEffect(() => {
    backend.settings
      .get()
      .then((res) => setSettings((res?.settings ?? null) as FooterSettings | null));
    // useBackend returns a new object each render; run only on mount here.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <footer className="bg-muted/50 border-t mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <h3 className="text-lg font-bold mb-4">{settings?.brandName || "Your Brand"}</h3>
            <p className="text-sm text-foreground/70">
              {t("tagline")}
            </p>
          </div>

          <div>
            <h4 className="font-semibold mb-4">{t("contact")}</h4>
            <div className="space-y-2 text-sm">
              {settings?.email && (
                <a href={`mailto:${settings.email}`} className="flex items-center gap-2 text-foreground/70 hover:text-foreground">
                  <Mail className="w-4 h-4" />
                  {settings.email}
                </a>
              )}
              {settings?.phone && (
                <a href={`tel:${settings.phone}`} className="flex items-center gap-2 text-foreground/70 hover:text-foreground">
                  <Phone className="w-4 h-4" />
                  {settings.phone}
                </a>
              )}
              {settings?.instagram && (
                <a href={`https://instagram.com/${settings.instagram.replace('@', '')}`} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-foreground/70 hover:text-foreground">
                  <Instagram className="w-4 h-4" />
                  {settings.instagram}
                </a>
              )}
            </div>
          </div>

          <div>
            <h4 className="font-semibold mb-4">{t("services")}</h4>
            <ul className="space-y-2 text-sm text-foreground/70">
              <li>Private Photoshoot</li>
              <li>Group & Travel</li>
              <li>Food & Beverages</li>
              <li>Based on Request</li>
            </ul>
          </div>
        </div>

        <div className="mt-8 pt-8 border-t text-center text-sm text-foreground/60">
          <p>&copy; {new Date().getFullYear()} {settings?.brandName || "Your Brand"}. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}


