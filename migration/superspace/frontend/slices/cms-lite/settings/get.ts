// @ts-nocheck
import { api } from "encore.dev/api";
import db from "../db";

export interface Settings {
  id: number;
  brandName: string;
  defaultLocale: string;
  heroImage?: string;
  phone?: string;
  email?: string;
  instagram?: string;
  whatsapp?: string;
  logoUrl?: string;
  primaryColor?: string;
  secondaryColor?: string;
}

export const get = api<void, { settings: Settings | null }>(
  { expose: true, method: "GET", path: "/api/settings" },
  async () => {
    const row = await db.queryRow<Settings>`
      SELECT 
        id,
        brand_name as "brandName",
        default_locale as "defaultLocale",
        hero_image as "heroImage",
        phone,
        email,
        instagram,
        whatsapp,
        logo_url as "logoUrl",
        primary_color as "primaryColor",
        secondary_color as "secondaryColor"
      FROM settings
      LIMIT 1
    `;
    return { settings: row };
  }
);
