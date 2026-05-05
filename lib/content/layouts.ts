import type { PreviewView } from "@/lib/preview-presets";

export type LayoutEntry = {
  slug: string;
  title: string;
  category: "marketing" | "dashboard" | "cms" | "template" | "website-template";
  description: string;
  source: string;
  repoPath: string;
  primaryFile: string;
  exampleCode: string;
  agentRecipe: string;
  tags: string[];
  /** Folders to pull when scaffolding this template into a target project.
   *  Agent commands (degit / sparse-checkout) generated from these. */
  pullPaths?: string[];
  /** Selected files to surface in the Code tab tree (subset of pullPaths). */
  files?: string[];
  /** npm packages this template needs (extras beyond the base shadcn stack). */
  dependencies?: string[];
  /** Optional path to a live in-site demo (rendered in iframe on the detail page). */
  previewPath?: string;
  /** Optional second preview surface — admin/dashboard side of a full-app template. */
  adminPreviewPath?: string;
  /** When both preview paths exist, which surface opens first. Defaults to "public". */
  defaultSurface?: "public" | "admin";
  /** Initial preview viewport. Defaults to desktop. */
  defaultView?: PreviewView;
};

export const layouts: LayoutEntry[] = [
  {
    slug: "personal-brand-os",
    title: "Personal Brand OS",
    category: "website-template",
    description:
      "Full-app personal site — public landing (hero, blog, portfolio, services, resources, contact) + admin dashboard (posts, leads, chatbot, comments). Inspired by saudivisuals.com + cescadesigns. Fill-in-the-blank with lorem ipsum.",
    source: "saudivisuals.com + cescadesigns",
    repoPath: "app/preview/personal-brand-os",
    primaryFile: "app/preview/personal-brand-os/public/page.tsx",
    tags: ["template", "personal-brand", "blog", "portfolio", "admin", "saas"],
    previewPath: "/preview/personal-brand-os/public",
    adminPreviewPath: "/preview/personal-brand-os/admin",
    defaultSurface: "public",
    pullPaths: [
      "app/preview/personal-brand-os",
      "components/templates/personal-brand",
      "convex/templates/personal-brand-os",
    ],
    files: [
      "app/preview/personal-brand-os/robots.ts",
      "app/preview/personal-brand-os/sitemap.ts",
      "app/preview/personal-brand-os/opengraph-image.tsx",
      "app/preview/personal-brand-os/public/layout.tsx",
      "app/preview/personal-brand-os/public/page.tsx",
      "app/preview/personal-brand-os/public/blog/page.tsx",
      "app/preview/personal-brand-os/public/blog/[slug]/page.tsx",
      "app/preview/personal-brand-os/public/portfolio/page.tsx",
      "app/preview/personal-brand-os/public/portfolio/[slug]/page.tsx",
      "app/preview/personal-brand-os/public/services/page.tsx",
      "app/preview/personal-brand-os/public/resources/page.tsx",
      "app/preview/personal-brand-os/public/contact/page.tsx",
      "app/preview/personal-brand-os/public/about/page.tsx",
      "app/preview/personal-brand-os/admin/layout.tsx",
      "app/preview/personal-brand-os/admin/page.tsx",
      "app/preview/personal-brand-os/admin/posts/page.tsx",
      "app/preview/personal-brand-os/admin/posts/new/page.tsx",
      "app/preview/personal-brand-os/admin/posts/[id]/page.tsx",
      "app/preview/personal-brand-os/admin/portfolio/page.tsx",
      "app/preview/personal-brand-os/admin/portfolio/new/page.tsx",
      "app/preview/personal-brand-os/admin/portfolio/[id]/page.tsx",
      "app/preview/personal-brand-os/admin/services/page.tsx",
      "app/preview/personal-brand-os/admin/resources/page.tsx",
      "app/preview/personal-brand-os/admin/leads/page.tsx",
      "app/preview/personal-brand-os/admin/comments/page.tsx",
      "app/preview/personal-brand-os/admin/chatbot/page.tsx",
      "app/preview/personal-brand-os/admin/newsletter/page.tsx",
      "app/preview/personal-brand-os/admin/analytics/page.tsx",
      "app/preview/personal-brand-os/admin/settings/site/page.tsx",
      "app/preview/personal-brand-os/admin/settings/team/page.tsx",
      "app/preview/personal-brand-os/admin/settings/ai/page.tsx",
      "components/templates/personal-brand/shared/types.ts",
      "components/templates/personal-brand/shared/store.tsx",
      "components/templates/personal-brand/shared/seed.ts",
      "components/templates/personal-brand/shared/site-config.ts",
      "components/templates/personal-brand/shared/ui/site-nav.tsx",
      "components/templates/personal-brand/shared/ui/site-footer.tsx",
      "components/templates/personal-brand/shared/ui/chat-fab.tsx",
      "components/templates/personal-brand/shared/ui/section-head.tsx",
      "components/templates/personal-brand/slices/home/HomePage.tsx",
      "components/templates/personal-brand/slices/home/NewsletterBlock.tsx",
      "components/templates/personal-brand/slices/blog/BlogList.tsx",
      "components/templates/personal-brand/slices/blog/BlogDetail.tsx",
      "components/templates/personal-brand/slices/portfolio/PortfolioListPage.tsx",
      "components/templates/personal-brand/slices/portfolio/PortfolioDetailPage.tsx",
      "components/templates/personal-brand/slices/services/ServicesPage.tsx",
      "components/templates/personal-brand/slices/resources/ResourcesPage.tsx",
      "components/templates/personal-brand/slices/about/AboutPage.tsx",
      "components/templates/personal-brand/slices/contact/ContactPage.tsx",
      "components/templates/personal-brand/slices/admin/shell/admin-sidebar.tsx",
      "components/templates/personal-brand/slices/admin/shell/admin-topbar.tsx",
      "components/templates/personal-brand/slices/admin/dashboard/DashboardView.tsx",
      "components/templates/personal-brand/slices/admin/posts/PostsList.tsx",
      "components/templates/personal-brand/slices/admin/posts/PostEditor.tsx",
      "components/templates/personal-brand/slices/admin/portfolio/PortfolioListAdmin.tsx",
      "components/templates/personal-brand/slices/admin/portfolio/PortfolioEditor.tsx",
      "components/templates/personal-brand/slices/admin/services/ServicesAdminView.tsx",
      "components/templates/personal-brand/slices/admin/resources/ResourcesAdminView.tsx",
      "components/templates/personal-brand/slices/admin/leads/LeadsView.tsx",
      "components/templates/personal-brand/slices/admin/comments/CommentsView.tsx",
      "components/templates/personal-brand/slices/admin/chatbot/ChatbotAdminView.tsx",
      "components/templates/personal-brand/slices/admin/newsletter/NewsletterView.tsx",
      "components/templates/personal-brand/slices/admin/analytics/AnalyticsView.tsx",
      "components/templates/personal-brand/slices/admin/settings/SettingsView.tsx",
      "convex/templates/personal-brand-os/schema.ts",
      "convex/templates/personal-brand-os/posts.ts",
      "convex/templates/personal-brand-os/portfolio.ts",
      "convex/templates/personal-brand-os/services.ts",
      "convex/templates/personal-brand-os/resources.ts",
      "convex/templates/personal-brand-os/leads.ts",
      "convex/templates/personal-brand-os/comments.ts",
      "convex/templates/personal-brand-os/subscribers.ts",
      "convex/templates/personal-brand-os/chat.ts",
      "convex/templates/personal-brand-os/README.md",
    ],
    dependencies: [
      "next@^16",
      "react@^19",
      "react-dom@^19",
      "lucide-react",
      "@tabler/icons-react",
      "sonner",
      "next-themes",
      "tailwindcss@^4",
      "convex",
      "@convex-dev/auth",
      "@radix-ui/react-avatar",
      "@radix-ui/react-dialog",
      "@radix-ui/react-dropdown-menu",
      "@radix-ui/react-label",
      "@radix-ui/react-scroll-area",
      "@radix-ui/react-select",
      "@radix-ui/react-separator",
      "@radix-ui/react-slot",
      "@radix-ui/react-tabs",
    ],
    exampleCode: `// app/(public)/page.tsx — minimal compose
import { HeroSection } from "@/templates/personal-brand/sections/hero";
import { FeaturedPosts } from "@/templates/personal-brand/sections/featured-posts";
import { PortfolioStrip } from "@/templates/personal-brand/sections/portfolio";
import { ServicesBand } from "@/templates/personal-brand/sections/services";
import { TestimonialsGrid } from "@/templates/personal-brand/sections/testimonials";
import { NewsletterCTA } from "@/templates/personal-brand/sections/newsletter";
import { ContactBand } from "@/templates/personal-brand/sections/contact";

export default function HomePage() {
  return (
    <>
      <HeroSection />
      <FeaturedPosts />
      <PortfolioStrip />
      <ServicesBand />
      <TestimonialsGrid />
      <NewsletterCTA />
      <ContactBand />
    </>
  );
}`,
    agentRecipe:
      "Personal Brand OS = full-app template (public + admin). 1) Move app/preview/personal-brand-os/{robots,sitemap,opengraph-image}.* to app root. 2) Copy app/preview/personal-brand-os/public into app/(public)/, app/preview/personal-brand-os/admin into app/(admin)/. 3) Edit components/templates/personal-brand/shared/site-config.ts — set brandName, ownerName, baseUrl, twitter, email. 4) Wire convex/templates/personal-brand-os/* to convex/_generated and add @convex-dev/auth on admin routes. 5) Replace localStorage StoreProvider with Convex queries (schema mirrors localStorage shape).",
  },
  {
    slug: "agency-studio-os",
    title: "Agency Studio OS",
    category: "website-template",
    description:
      "Full-app B2B agency / studio site — public (home, services, work + project detail, about, contact) + admin (dashboard, projects pipeline, clients, services, leads, settings). Inspired by saudivisuals.com + cescadesigns.",
    source: "saudivisuals.com + cescadesigns",
    repoPath: "app/preview/agency-studio-os",
    primaryFile: "app/preview/agency-studio-os/public/page.tsx",
    tags: ["template", "agency", "studio", "portfolio", "b2b", "admin", "saas"],
    previewPath: "/preview/agency-studio-os/public",
    adminPreviewPath: "/preview/agency-studio-os/admin",
    defaultSurface: "public",
    pullPaths: [
      "app/preview/agency-studio-os",
      "components/templates/agency-studio",
      "convex/templates/agency-studio-os",
    ],
    files: [
      "app/preview/agency-studio-os/robots.ts",
      "app/preview/agency-studio-os/sitemap.ts",
      "app/preview/agency-studio-os/opengraph-image.tsx",
      "app/preview/agency-studio-os/public/layout.tsx",
      "app/preview/agency-studio-os/public/page.tsx",
      "app/preview/agency-studio-os/public/services/page.tsx",
      "app/preview/agency-studio-os/public/portfolio/page.tsx",
      "app/preview/agency-studio-os/public/portfolio/[slug]/page.tsx",
      "app/preview/agency-studio-os/public/about/page.tsx",
      "app/preview/agency-studio-os/public/contact/page.tsx",
      "app/preview/agency-studio-os/admin/layout.tsx",
      "app/preview/agency-studio-os/admin/page.tsx",
      "app/preview/agency-studio-os/admin/projects/page.tsx",
      "app/preview/agency-studio-os/admin/projects/new/page.tsx",
      "app/preview/agency-studio-os/admin/projects/[id]/page.tsx",
      "app/preview/agency-studio-os/admin/clients/page.tsx",
      "app/preview/agency-studio-os/admin/services/page.tsx",
      "app/preview/agency-studio-os/admin/leads/page.tsx",
      "app/preview/agency-studio-os/admin/settings/page.tsx",
      "components/templates/agency-studio/shared/types.ts",
      "components/templates/agency-studio/shared/store.tsx",
      "components/templates/agency-studio/shared/seed.ts",
      "components/templates/agency-studio/shared/site-config.ts",
      "components/templates/agency-studio/shared/ui/site-nav.tsx",
      "components/templates/agency-studio/shared/ui/site-footer.tsx",
      "components/templates/agency-studio/shared/ui/section-head.tsx",
      "components/templates/agency-studio/slices/home/HomePage.tsx",
      "components/templates/agency-studio/slices/services/ServicesPage.tsx",
      "components/templates/agency-studio/slices/portfolio/PortfolioListPage.tsx",
      "components/templates/agency-studio/slices/portfolio/PortfolioDetailPage.tsx",
      "components/templates/agency-studio/slices/about/AboutPage.tsx",
      "components/templates/agency-studio/slices/contact/ContactPage.tsx",
      "components/templates/agency-studio/slices/admin/shell/admin-sidebar.tsx",
      "components/templates/agency-studio/slices/admin/shell/admin-topbar.tsx",
      "components/templates/agency-studio/slices/admin/dashboard/DashboardView.tsx",
      "components/templates/agency-studio/slices/admin/projects/ProjectsList.tsx",
      "components/templates/agency-studio/slices/admin/projects/ProjectEditor.tsx",
      "components/templates/agency-studio/slices/admin/clients/ClientsList.tsx",
      "components/templates/agency-studio/slices/admin/services/ServicesAdminView.tsx",
      "components/templates/agency-studio/slices/admin/leads/LeadsView.tsx",
      "components/templates/agency-studio/slices/admin/settings/SettingsView.tsx",
      "convex/templates/agency-studio-os/schema.ts",
      "convex/templates/agency-studio-os/projects.ts",
      "convex/templates/agency-studio-os/clients.ts",
      "convex/templates/agency-studio-os/services.ts",
      "convex/templates/agency-studio-os/leads.ts",
      "convex/templates/agency-studio-os/README.md",
    ],
    dependencies: [
      "next@^16",
      "react@^19",
      "react-dom@^19",
      "lucide-react",
      "@tabler/icons-react",
      "sonner",
      "next-themes",
      "tailwindcss@^4",
      "convex",
      "@convex-dev/auth",
      "@radix-ui/react-avatar",
      "@radix-ui/react-dialog",
      "@radix-ui/react-label",
      "@radix-ui/react-separator",
      "@radix-ui/react-slot",
    ],
    exampleCode: `// app/(public)/page.tsx — minimal compose
import { HomePage } from "@/components/templates/agency-studio/slices/home/HomePage";

export default function Page() {
  return <HomePage />;
}`,
    agentRecipe:
      "Agency Studio OS = full-app B2B agency template (public + admin). 1) Move app/preview/agency-studio-os/{robots,sitemap,opengraph-image}.* to app root. 2) Copy public into app/(public)/, admin into app/(admin)/. 3) Edit components/templates/agency-studio/shared/site-config.ts — set studioName, brandName, baseUrl, twitter, email. 4) Wire convex/templates/agency-studio-os/* to convex/_generated and add @convex-dev/auth on admin routes. 5) Replace localStorage StoreProvider with Convex queries.",
  },
  {
    slug: "landing-hero-carousel",
    title: "Landing — Hero Carousel",
    category: "marketing",
    description:
      "Full-width image carousel hero with auto-fade + dot indicators. Originally CMS-driven via Convex. Best for visual brands.",
    source: "cescadesigns",
    repoPath: "cookbook/layouts/landing-hero-carousel",
    primaryFile: "src/HeroSection.tsx",
    tags: ["marketing", "carousel", "image", "cms"],
    previewPath: "/preview/landing-hero-carousel",
    exampleCode: `import { HeroSection } from "@/cookbook/landing-hero-carousel/HeroSection";

export default function HomePage() {
  return (
    <main>
      <HeroSection />
    </main>
  );
}`,
    agentRecipe:
      "Mount the HeroSection from cookbook/layouts/landing-hero-carousel as the hero of the marketing route group. Provide image array via props or wire to Convex api.heroImages.list.",
  },
  {
    slug: "landing-asymmetric-masonry",
    title: "Landing — Asymmetric Masonry",
    category: "marketing",
    description:
      "8-slot repeating asymmetric grid. Intersection-observer staggered scroll-reveal. Lifted from rahmanef.com portfolio.",
    source: "rahmanef.com",
    repoPath: "cookbook/layouts/landing-asymmetric-masonry",
    primaryFile: "src/PortfolioGrid.tsx",
    tags: ["marketing", "portfolio", "masonry", "scroll-reveal"],
    previewPath: "/preview/landing-asymmetric-masonry",
    exampleCode: `import { PortfolioGrid } from "@/cookbook/landing-asymmetric-masonry/PortfolioGrid";

export default function PortfolioPage() {
  return <PortfolioGrid items={items} />;
}`,
    agentRecipe:
      "Use PortfolioGrid for case-study or portfolio pages. Items array shape: { id, title, cover, href, category }. The 8-slot pattern repeats; supply at least 8 items for the layout to bloom.",
  },
  {
    slug: "landing-bento",
    title: "Landing — Bento Grid",
    category: "marketing",
    description:
      "Feature-grid marketing landing. Compose Card + Magnetic + KineticHeading. Modern SaaS feel.",
    source: "synthesized",
    repoPath: "cookbook/layouts/landing-bento",
    primaryFile: "README.md",
    tags: ["marketing", "bento", "features"],
    previewPath: "/preview/landing-bento",
    exampleCode: `<section className="grid grid-cols-3 gap-4">
  <Card className="col-span-2 row-span-2">Feature 1</Card>
  <Card>Feature 2</Card>
  <Card>Feature 3</Card>
  <Card className="col-span-2">Feature 4</Card>
  <Card>Feature 5</Card>
</section>`,
    agentRecipe:
      "Compose a 3-column CSS grid with explicit area assignments per feature. Mix Card sizes (1x1, 1x2, 2x1, 2x2) for visual rhythm.",
  },
  {
    slug: "landing-kinetic-text",
    title: "Landing — Kinetic Text",
    category: "marketing",
    description:
      "Brand-forward landing. Letter-stagger headings + magnetic CTAs + marquee strips. Motion-heavy.",
    source: "rahmanef.com",
    repoPath: "cookbook/layouts/landing-kinetic-text",
    primaryFile: "README.md",
    tags: ["marketing", "motion", "type"],
    previewPath: "/preview/landing-kinetic-text",
    exampleCode: `import { KineticHeading } from "@/components/motion/kinetic-heading";
import { Magnetic } from "@/components/motion/magnetic";
import { Marquee } from "@/components/motion/marquee";

<KineticHeading text="We build things" stagger={36} className="text-7xl font-serif" />
<Magnetic radius={120}>
  <button>Get in touch</button>
</Magnetic>
<Marquee speed={30}>brands…</Marquee>`,
    agentRecipe:
      "Use motion primitives marquee, kinetic-heading, magnetic from components/motion (already imported into the kitab from rahmanef.com). All respect prefers-reduced-motion automatically.",
  },
  {
    slug: "dashboard-three-column",
    title: "Dashboard — Three Column",
    category: "dashboard",
    description:
      "Kitab flagship. Left tree / main / right inspector. Resizable, collapsible, mobile drawer fallback. Used by Database, Tasks, Contacts.",
    source: "kitab-core",
    repoPath: "cookbook/layouts/dashboard-three-column",
    primaryFile:
      "template-base/frontend/shared/ui/layout/container/three-column/ThreeColumnLayout.tsx",
    tags: ["dashboard", "three-column", "resizable", "responsive"],
    previewPath: "/preview/dashboard-three-column",
    exampleCode: `"use client";
import { ThreeColumnLayout } from "@/frontend/shared/ui/layout/container/three-column/ThreeColumnLayout";

export default function FeaturePage() {
  return (
    <ThreeColumnLayout
      preset="database"
      left={<FeatureSidebar />}
      center={<MainContent />}
      right={<InspectorPanel />}
      leftWidth={280}
      rightWidth={400}
      spaceDistribution="right-priority"
      collapsibleLeft
      collapsibleRight
      persistCollapseState="feature-id"
    />
  );
}`,
    agentRecipe:
      "Mount inside app/dashboard/<slice>/page.tsx. Wrap with the kitab's <ThreeColumnLayout>. Slot in slice-specific sidebars and inspectors. Mobile auto-collapses to drawers.",
  },
  {
    slug: "dashboard-ide",
    title: "Dashboard — IDE",
    category: "dashboard",
    description:
      "Activity bar + tabs + editor + bottom panel. Editor-first apps (notion, code, doc tools).",
    source: "synthesized",
    repoPath: "cookbook/layouts/dashboard-ide",
    primaryFile: "README.md",
    tags: ["dashboard", "ide", "editor"],
    previewPath: "/preview/dashboard-ide",
    exampleCode: `<div className="grid h-screen grid-cols-[48px_1fr] grid-rows-[auto_1fr_200px]">
  <ActivityBar className="row-span-3" />
  <TabsBar className="border-b" />
  <main className="flex">
    <EditorArea className="flex-1" />
    <Inspector className="w-80 border-l" />
  </main>
  <Console className="border-t" />
</div>`,
    agentRecipe:
      "Compose grid: 48px activity bar + tabs row + editor/inspector flex row + bottom console. Wire activity bar items to dispatch into tabs/inspector store.",
  },
  {
    slug: "dashboard-mobile-dock",
    title: "Dashboard — Mobile Dock",
    category: "dashboard",
    description:
      "Mobile-first auth app. MobileTopBar + content + MobileDashboardDock bottom nav. Native-app feel on mobile, sidebar on desktop.",
    source: "kitab-core",
    repoPath: "cookbook/layouts/dashboard-mobile-dock",
    primaryFile:
      "template-base/frontend/shared/ui/layout/dashboard/MobileDashboardShell.tsx",
    tags: ["dashboard", "mobile", "pwa"],
    previewPath: "/preview/dashboard-mobile-dock",
    defaultView: "mobile",
    exampleCode: `// app/dashboard/layout.tsx
import { ResponsiveDashboardShell } from "@/frontend/shared/ui/layout/dashboard/ResponsiveDashboardShell";

export default function Layout({ children }: { children: React.ReactNode }) {
  return <ResponsiveDashboardShell>{children}</ResponsiveDashboardShell>;
}`,
    agentRecipe:
      "Use ResponsiveDashboardShell which branches desktop (sidebar) vs mobile (dock). Customize MobileDashboardDock items and MobileTopBar workspace switcher to your domain.",
  },
  {
    slug: "cms-public-storefront",
    title: "CMS — Public Storefront",
    category: "cms",
    description:
      "E-commerce / blog public storefront. Convex read-only. Cart context + currency selector + i18n.",
    source: "kitab-core cms-lite",
    repoPath: "cookbook/layouts/cms-public-storefront",
    primaryFile: "README.md",
    tags: ["cms", "ecommerce", "storefront"],
    previewPath: "/preview/cms-public-storefront",
    exampleCode: `// app/(cms)/layout.tsx
import { ConvexClientProvider } from "@/components/ConvexClientProvider";
import { LanguageProvider } from "@/components/LanguageContext";
import { CartContext } from "@/components/CartContext";

export default function Layout({ children }) {
  return (
    <ConvexClientProvider mode="public">
      <LanguageProvider>
        <CartContext>{children}</CartContext>
      </LanguageProvider>
    </ConvexClientProvider>
  );
}`,
    agentRecipe:
      "Port kitab-core slices/cms-lite/ into your project's app/(cms)/ route group. Fetch products/pages from Convex via api.cmsLite.* queries.",
  },
];

export function getLayout(slug: string) {
  return layouts.find((l) => l.slug === slug) ?? null;
}
