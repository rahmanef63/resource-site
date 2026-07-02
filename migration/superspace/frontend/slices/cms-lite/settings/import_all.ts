// @ts-nocheck
import { api } from "encore.dev/api";
import db from "../db";

export interface ImportAllRequest {
  data: {
    posts?: any[];
    portfolio?: any[];
    products?: any[];
    services?: any[];
    features?: any[];
    quicklinks?: any[];
    navigation?: any[];
    users?: any[];
    settings?: any;
    landingPageContent?: any;
  };
}

export interface ImportAllResponse {
  success: boolean;
  imported: {
    posts: number;
    portfolio: number;
    products: number;
    services: number;
    features: number;
    quicklinks: number;
    navigation: number;
    users: number;
    settings: boolean;
    landingPageContent: boolean;
  };
}

export const importAll = api<ImportAllRequest, ImportAllResponse>(
  { expose: true, method: "POST", path: "/settings/import-all" },
  async ({ data }) => {
    const imported = {
      posts: 0,
      portfolio: 0,
      products: 0,
      services: 0,
      features: 0,
      quicklinks: 0,
      navigation: 0,
      users: 0,
      settings: false,
      landingPageContent: false,
    };

    if (data.posts) {
      for (const item of data.posts) {
        try {
          await db.exec`
            INSERT INTO posts (
              slug, locale, title, excerpt, content, featured_image, 
              author, status, tags, meta_title, meta_description,
              published_at, created_at, updated_at
            ) VALUES (
              ${item.slug || `imported-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`},
              ${item.locale || "en"},
              ${item.title || "Untitled"},
              ${item.excerpt || ""},
              ${item.content || ""},
              ${item.featured_image || ""},
              ${item.author || "Admin"},
              ${item.status || "draft"},
              ${item.tags || []},
              ${item.meta_title || item.title || ""},
              ${item.meta_description || item.excerpt || ""},
              ${item.published_at || null},
              NOW(),
              NOW()
            )
          `;
          imported.posts++;
        } catch (err) {
          console.error("Failed to import post:", err);
        }
      }
    }

    if (data.portfolio) {
      for (const item of data.portfolio) {
        try {
          await db.exec`
            INSERT INTO portfolio_items (
              slug, locale, title, description, images, tags, 
              client, project_date, status, created_at, updated_at
            ) VALUES (
              ${item.slug || `imported-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`},
              ${item.locale || "en"},
              ${item.title || "Untitled"},
              ${item.description || ""},
              ${item.images || []},
              ${item.tags || []},
              ${item.client || ""},
              ${item.project_date || null},
              ${item.status || "draft"},
              NOW(),
              NOW()
            )
          `;
          imported.portfolio++;
        } catch (err) {
          console.error("Failed to import portfolio:", err);
        }
      }
    }

    if (data.products) {
      for (const item of data.products) {
        try {
          await db.exec`
            INSERT INTO products (
              slug, title_id, title_en, title_ar, description_id, description_en, description_ar,
              price, currency, images, tags, stock, status, created_at, updated_at
            ) VALUES (
              ${item.slug || `imported-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`},
              ${item.title_id || item.titleId || ""},
              ${item.title_en || item.titleEn || ""},
              ${item.title_ar || item.titleAr || ""},
              ${item.description_id || item.descriptionId || item.descId || ""},
              ${item.description_en || item.descriptionEn || item.descEn || ""},
              ${item.description_ar || item.descriptionAr || item.descAr || ""},
              ${item.price || 0},
              ${item.currency || "USD"},
              ${item.images || []},
              ${item.tags || []},
              ${item.stock !== undefined ? item.stock : 0},
              ${item.status || "draft"},
              NOW(),
              NOW()
            )
          `;
          imported.products++;
        } catch (err) {
          console.error("Failed to import product:", err);
        }
      }
    }

    if (data.services) {
      for (const item of data.services) {
        try {
          await db.exec`
            INSERT INTO services (
              slug, label_id, label_en, label_ar, display_order, active
            ) VALUES (
              ${item.slug || `imported-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`},
              ${item.label_id || item.labelId || ""},
              ${item.label_en || item.labelEn || ""},
              ${item.label_ar || item.labelAr || ""},
              ${item.display_order !== undefined ? item.display_order : 0},
              ${item.active !== undefined ? item.active : true}
            )
          `;
          imported.services++;
        } catch (err) {
          console.error("Failed to import service:", err);
        }
      }
    }

    if (data.features) {
      for (const item of data.features) {
        try {
          await db.exec`
            INSERT INTO features (
              icon, title, description, locale, display_order, active, service_id
            ) VALUES (
              ${item.icon || "Star"},
              ${item.title || ""},
              ${item.description || ""},
              ${item.locale || "en"},
              ${item.display_order !== undefined ? item.display_order : 0},
              ${item.active !== undefined ? item.active : true},
              ${item.service_id || null}
            )
          `;
          imported.features++;
        } catch (err) {
          console.error("Failed to import feature:", err);
        }
      }
    }

    if (data.quicklinks) {
      for (const item of data.quicklinks) {
        try {
          await db.exec`
            INSERT INTO quicklinks (
              title, url, display_order, active, icon
            ) VALUES (
              ${item.title || ""},
              ${item.url || ""},
              ${item.display_order !== undefined ? item.display_order : 0},
              ${item.active !== undefined ? item.active : true},
              ${item.icon || null}
            )
          `;
          imported.quicklinks++;
        } catch (err) {
          console.error("Failed to import quicklink:", err);
        }
      }
    }

    if (data.navigation) {
      for (const item of data.navigation) {
        try {
          await db.exec`
            INSERT INTO navigation_items (
              label_id, label_en, label_ar, url, display_order, active
            ) VALUES (
              ${item.label_id || item.labelId || ""},
              ${item.label_en || item.labelEn || ""},
              ${item.label_ar || item.labelAr || ""},
              ${item.url || ""},
              ${item.display_order !== undefined ? item.display_order : 0},
              ${item.active !== undefined ? item.active : true}
            )
          `;
          imported.navigation++;
        } catch (err) {
          console.error("Failed to import navigation:", err);
        }
      }
    }

    if (data.users) {
      for (const item of data.users) {
        try {
          if (!item.password_hash) {
            console.warn("Skipping user without password_hash:", item.email || item.username);
            continue;
          }
          await db.exec`
            INSERT INTO users (
              email, password_hash, role, created_at, updated_at
            ) VALUES (
              ${item.email || item.username || `user-${Date.now()}@imported.local`},
              ${item.password_hash},
              ${item.role || "editor"},
              ${item.created_at || new Date()},
              ${item.updated_at || new Date()}
            )
          `;
          imported.users++;
        } catch (err) {
          console.error("Failed to import user:", err);
        }
      }
    }

    if (data.settings) {
      try {
        await db.exec`
          UPDATE settings SET
            brand_name = ${data.settings.brand_name || data.settings.brandName},
            default_locale = ${data.settings.default_locale || data.settings.defaultLocale},
            hero_image = ${data.settings.hero_image || data.settings.heroImage || ""},
            phone = ${data.settings.phone || ""},
            email = ${data.settings.email || ""},
            instagram = ${data.settings.instagram || ""},
            whatsapp = ${data.settings.whatsapp || ""},
            logo_url = ${data.settings.logo_url || data.settings.logoUrl || ""},
            primary_color = ${data.settings.primary_color || data.settings.primaryColor || "#3b82f6"},
            secondary_color = ${data.settings.secondary_color || data.settings.secondaryColor || "#8b5cf6"}
          WHERE id = 1
        `;
        imported.settings = true;
      } catch (err) {
        console.error("Failed to import settings:", err);
      }
    }

    if (data.landingPageContent) {
      try {
        await db.exec`
          UPDATE landing_page_content SET
            hero_title_id = ${data.landingPageContent.hero_title_id || ""},
            hero_title_en = ${data.landingPageContent.hero_title_en || ""},
            hero_title_ar = ${data.landingPageContent.hero_title_ar || ""},
            hero_subtitle_id = ${data.landingPageContent.hero_subtitle_id || ""},
            hero_subtitle_en = ${data.landingPageContent.hero_subtitle_en || ""},
            hero_subtitle_ar = ${data.landingPageContent.hero_subtitle_ar || ""}
          WHERE id = 1
        `;
        imported.landingPageContent = true;
      } catch (err) {
        console.error("Failed to import landing page content:", err);
      }
    }

    return { success: true, imported };
  }
);
