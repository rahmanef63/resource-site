import { v } from "convex/values";
import { internalMutation } from "../../../../_generated/server";

/**
 * Seed default CMS pages for a workspace
 * This creates the initial page structure with multi-language support
 */
export const seedDefaultPages = internalMutation({
  args: {
    workspaceId: v.string(),
    userId: v.string(),
  },
  handler: async (ctx, args) => {
    const { workspaceId, userId } = args;
    const now = Date.now();
    
    // Check if pages already exist
    const existing = await ctx.db
      .query("cms_lite_pages")
      .withIndex("by_workspace", (q) => q.eq("workspaceId", workspaceId))
      .first();
    
    if (existing) {
      return { message: "Pages already seeded for this workspace" };
    }
    
    // Default pages to create
    const defaultPages = [
      {
        slug: "home",
        locale: "en",
        pageType: "home" as const,
        title: "Home",
        description: "Welcome to our website",
        metaTitle: "Home - Welcome",
        metaDescription: "Welcome to our website built with CMS Lite",
        isPublished: true,
        displayOrder: 1,
      },
      {
        slug: "hello",
        locale: "en",
        pageType: "hello" as const,
        title: "Quick Links",
        description: "Access your favorite resources quickly",
        metaTitle: "Quick Links",
        metaDescription: "Quick access to important links and resources",
        isPublished: true,
        displayOrder: 2,
      },
      {
        slug: "halo",
        locale: "id",
        pageType: "hello" as const,
        title: "Tautan Cepat",
        description: "Akses sumber daya favorit Anda dengan cepat",
        metaTitle: "Tautan Cepat",
        metaDescription: "Akses cepat ke tautan dan sumber daya penting",
        isPublished: true,
        displayOrder: 3,
      },
      {
        slug: "مرحبا",
        locale: "ar",
        pageType: "hello" as const,
        title: "روابط سريعة",
        description: "الوصول إلى مواردك المفضلة بسرعة",
        metaTitle: "روابط سريعة",
        metaDescription: "وصول سريع إلى الروابط والموارد المهمة",
        isPublished: true,
        displayOrder: 4,
      },
      {
        slug: "привет",
        locale: "ru",
        pageType: "hello" as const,
        title: "Быстрые ссылки",
        description: "Быстрый доступ к вашим любимым ресурсам",
        metaTitle: "Быстрые ссылки",
        metaDescription: "Быстрый доступ к важным ссылкам и ресурсам",
        isPublished: true,
        displayOrder: 5,
      },
      {
        slug: "about",
        locale: "en",
        pageType: "about" as const,
        title: "About Us",
        description: "Learn more about our company",
        metaTitle: "About Us",
        metaDescription: "Learn more about our company and team",
        isPublished: true,
        displayOrder: 10,
      },
      {
        slug: "products",
        locale: "en",
        pageType: "products" as const,
        title: "Products",
        description: "Browse our product catalog",
        metaTitle: "Products - Catalog",
        metaDescription: "Browse our complete product catalog",
        isPublished: true,
        displayOrder: 20,
      },
      {
        slug: "blog",
        locale: "en",
        pageType: "blog" as const,
        title: "Blog",
        description: "Read our latest blog posts",
        metaTitle: "Blog - Latest Posts",
        metaDescription: "Read our latest blog posts and updates",
        isPublished: true,
        displayOrder: 30,
      },
      {
        slug: "portfolio",
        locale: "en",
        pageType: "portfolio" as const,
        title: "Portfolio",
        description: "View our portfolio of work",
        metaTitle: "Portfolio - Our Work",
        metaDescription: "View our portfolio and past projects",
        isPublished: true,
        displayOrder: 40,
      },
    ];
    
    // Insert all pages
    const pageIds = [];
    for (const pageData of defaultPages) {
      const pageId = await ctx.db.insert("cms_lite_pages", {
        ...pageData,
        workspaceId,
        createdAt: now,
        updatedAt: now,
        createdBy: userId,
        updatedBy: userId,
      });
      pageIds.push(pageId);
    }
    
    return { 
      message: `Successfully created ${pageIds.length} default pages`,
      pageIds,
    };
  },
});
