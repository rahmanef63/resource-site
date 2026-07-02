// @ts-nocheck
import { api } from "encore.dev/api";
import db from "../db";
import { Settings } from "./get";
import { checkIsAdmin } from "../auth/check_admin_helper";

interface UpdateSettingsRequest {
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

export const update = api<UpdateSettingsRequest, { settings: Settings }>(
  { expose: true, method: "POST", path: "/api/settings", auth: true },
  async (req) => {
    await checkIsAdmin();
    const existing = await db.queryRow`SELECT id FROM settings LIMIT 1`;
    
    if (existing) {
      await db.exec`
        UPDATE settings SET
          brand_name = ${req.brandName},
          default_locale = ${req.defaultLocale},
          hero_image = ${req.heroImage || null},
          phone = ${req.phone || null},
          email = ${req.email || null},
          instagram = ${req.instagram || null},
          whatsapp = ${req.whatsapp || null},
          logo_url = ${req.logoUrl || null},
          primary_color = ${req.primaryColor || null},
          secondary_color = ${req.secondaryColor || null},
          updated_at = NOW()
        WHERE id = ${existing.id}
      `;
    } else {
      await db.exec`
        INSERT INTO settings (brand_name, default_locale, hero_image, phone, email, instagram, whatsapp, logo_url, primary_color, secondary_color)
        VALUES (${req.brandName}, ${req.defaultLocale}, ${req.heroImage || null}, ${req.phone || null}, ${req.email || null}, ${req.instagram || null}, ${req.whatsapp || null}, ${req.logoUrl || null}, ${req.primaryColor || null}, ${req.secondaryColor || null})
      `;
    }

    const updated = await db.queryRow<Settings>`
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

    return { settings: updated! };
  }
);
