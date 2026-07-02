// @ts-nocheck
import { api } from "encore.dev/api";
import db from "../db";

export interface ExportAllResponse {
  timestamp: string;
  data: {
    posts: any[];
    portfolio: any[];
    products: any[];
    services: any[];
    features: any[];
    quicklinks: any[];
    navigation: any[];
    users: any[];
    settings: any;
    landingPageContent: any;
  };
}

export const exportAll = api<void, ExportAllResponse>(
  { expose: true, method: "POST", path: "/settings/export-all" },
  async () => {
    const posts = await db.rawQueryAll<any>(`SELECT * FROM posts ORDER BY created_at DESC`);
    const portfolio = await db.rawQueryAll<any>(`SELECT * FROM portfolio_items ORDER BY created_at DESC`);
    const products = await db.rawQueryAll<any>(`SELECT * FROM products ORDER BY created_at DESC`);
    const services = await db.rawQueryAll<any>(`SELECT * FROM services ORDER BY display_order ASC`);
    const features = await db.rawQueryAll<any>(`SELECT * FROM features ORDER BY display_order ASC`);
    const quicklinks = await db.rawQueryAll<any>(`SELECT * FROM quicklinks ORDER BY display_order ASC`);
    const navigation = await db.rawQueryAll<any>(`SELECT * FROM navigation_items ORDER BY display_order ASC`);
    const users = await db.rawQueryAll<any>(`SELECT id, email, role, created_at, updated_at FROM users`);
    const settings = await db.queryRow<any>`SELECT * FROM settings LIMIT 1`;
    const landingPageContent = await db.queryRow<any>`SELECT * FROM landing_page_content LIMIT 1`;

    return {
      timestamp: new Date().toISOString(),
      data: {
        posts,
        portfolio,
        products,
        services,
        features,
        quicklinks,
        navigation,
        users,
        settings: settings || {},
        landingPageContent: landingPageContent || {},
      },
    };
  }
);
