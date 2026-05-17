import type { PreviewView } from "@/lib/preview-presets";

export type LayoutStatus = "stable" | "draft" | "coming-soon";

export type LayoutEntry = {
  slug: string;
  title: string;
  category: "marketing" | "dashboard" | "cms" | "template" | "website-template";
  /** Build-readiness signal. Defaults to "stable" when omitted. */
  status?: LayoutStatus;
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
  /** shadcn primitives this template imports from `@/components/ui/*`.
   *  CLI runs `npx shadcn add <list>` after pulling files so the template
   *  compiles cleanly without the user hand-installing each component. */
  shadcnComponents?: string[];
  /** Optional path to a live in-site demo (rendered in iframe on the detail page). */
  previewPath?: string;
  /** Optional second preview surface — admin/dashboard side of a full-app template. */
  adminPreviewPath?: string;
  /** When both preview paths exist, which surface opens first. Defaults to "public". */
  defaultSurface?: "public" | "admin";
  /** Initial preview viewport. Defaults to desktop. */
  defaultView?: PreviewView;
  /** Initial preview zoom (1.0 = real size). */
  defaultZoom?: number;
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
      "components/templates/_shared",
      "components/templates/personal-brand",
      "convex-templates/personal-brand-os",
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
      "components/templates/_shared/index.ts",
      "components/templates/_shared/types/common.ts",
      "components/templates/_shared/utils/index.ts",
      "components/templates/_shared/hooks/create-template-store.tsx",
      "components/templates/_shared/ui/section-head.tsx",
      "components/templates/_shared/ui/site-nav.tsx",
      "components/templates/_shared/ui/site-footer.tsx",
      "components/templates/_shared/ui/site-shell.tsx",
      "components/templates/_shared/ui/admin-sidebar.tsx",
      "components/templates/_shared/ui/admin-topbar.tsx",
      "components/templates/_shared/ui/admin-shell.tsx",
      "components/templates/_shared/ui/stat-card.tsx",
      "components/templates/personal-brand/shared/types.ts",
      "components/templates/personal-brand/shared/store.tsx",
      "components/templates/personal-brand/shared/seed.ts",
      "components/templates/personal-brand/shared/site-config.ts",
      "components/templates/personal-brand/shared/nav-config.ts",
      "components/templates/personal-brand/shared/ui/chat-fab.tsx",
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
      "app/preview/personal-brand-os/admin/admin-shell-client.tsx",
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
      "convex-templates/personal-brand-os/schema.ts",
      "convex-templates/personal-brand-os/posts.ts",
      "convex-templates/personal-brand-os/portfolio.ts",
      "convex-templates/personal-brand-os/services.ts",
      "convex-templates/personal-brand-os/resources.ts",
      "convex-templates/personal-brand-os/leads.ts",
      "convex-templates/personal-brand-os/comments.ts",
      "convex-templates/personal-brand-os/subscribers.ts",
      "convex-templates/personal-brand-os/chat.ts",
      "convex-templates/personal-brand-os/README.md",
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
      "@auth/core@^0.37.0",
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
    shadcnComponents: [
      "badge", "button", "card", "dialog", "input",
      "separator", "sheet", "tabs", "textarea",
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
      "Personal Brand OS = full-app template (public + admin). 1) Default `npx rr add personal-brand-os` runs `--at root`: routes promoted to app/(public)/ + app/admin/, and /preview/personal-brand-os/* path constants in nav-config/site-config/robots/sitemap auto-rewritten. (Pass `--at preview` only for sandbox demos that keep /preview/personal-brand-os/* URLs.) 2) Edit components/templates/personal-brand/shared/site-config.ts — set brandName, ownerName, baseUrl, twitter, email. 3) Wire convex-templates/personal-brand-os/* into your convex/features/personal-brand-os/ (kitab ships them outside `convex/` so the bundler doesn't try to compile scaffolds without _generated) and add @convex-dev/auth on admin routes. 4) Replace localStorage StoreProvider with Convex queries (schema mirrors localStorage shape).",
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
      "components/templates/_shared",
      "components/templates/agency-studio",
      "convex-templates/agency-studio-os",
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
      "components/templates/agency-studio/shared/nav-config.ts",
      "components/templates/agency-studio/slices/home/HomePage.tsx",
      "components/templates/agency-studio/slices/services/ServicesPage.tsx",
      "components/templates/agency-studio/slices/portfolio/PortfolioListPage.tsx",
      "components/templates/agency-studio/slices/portfolio/PortfolioDetailPage.tsx",
      "components/templates/agency-studio/slices/about/AboutPage.tsx",
      "components/templates/agency-studio/slices/contact/ContactPage.tsx",
      "app/preview/agency-studio-os/admin/admin-shell-client.tsx",
      "components/templates/agency-studio/slices/admin/dashboard/DashboardView.tsx",
      "components/templates/agency-studio/slices/admin/projects/ProjectsList.tsx",
      "components/templates/agency-studio/slices/admin/projects/ProjectEditor.tsx",
      "components/templates/agency-studio/slices/admin/clients/ClientsList.tsx",
      "components/templates/agency-studio/slices/admin/services/ServicesAdminView.tsx",
      "components/templates/agency-studio/slices/admin/leads/LeadsView.tsx",
      "components/templates/agency-studio/slices/admin/settings/SettingsView.tsx",
      "convex-templates/agency-studio-os/schema.ts",
      "convex-templates/agency-studio-os/projects.ts",
      "convex-templates/agency-studio-os/clients.ts",
      "convex-templates/agency-studio-os/services.ts",
      "convex-templates/agency-studio-os/leads.ts",
      "convex-templates/agency-studio-os/README.md",
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
      "@auth/core@^0.37.0",
      "@radix-ui/react-avatar",
      "@radix-ui/react-dialog",
      "@radix-ui/react-label",
      "@radix-ui/react-separator",
      "@radix-ui/react-slot",
    ],
    shadcnComponents: [
      "badge", "button", "card", "input", "label",
      "separator", "sheet", "textarea",
    ],
    exampleCode: `// app/(public)/page.tsx — minimal compose
import { HomePage } from "@/components/templates/agency-studio/slices/home/HomePage";

export default function Page() {
  return <HomePage />;
}`,
    agentRecipe:
      "Agency Studio OS = full-app B2B agency template (public + admin). 1) Move app/preview/agency-studio-os/{robots,sitemap,opengraph-image}.* to app root. 2) Copy public into app/(public)/, admin into app/(admin)/. 3) Edit components/templates/agency-studio/shared/site-config.ts — set studioName, brandName, baseUrl, twitter, email. 4) Wire convex-templates/agency-studio-os/* into your convex/ (kitab ships them outside `convex/` so the bundler doesn't try to compile scaffolds without _generated) and add @convex-dev/auth on admin routes. 5) Replace localStorage StoreProvider with Convex queries.",
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
  {
    slug: "saas-marketing-os",
    title: "SaaS Marketing OS",
    category: "website-template",
    status: "stable",
    description:
      "Public-only marketing site for a SaaS product — landing, pricing, features, blog, changelog, about, contact. MDX-driven blog + changelog. No admin (CMS via MDX files in repo).",
    source: "synthesized + mdx-blog feature",
    repoPath: "app/preview/saas-marketing-os",
    primaryFile: "app/preview/saas-marketing-os/public/page.tsx",
    tags: ["template", "saas", "marketing", "mdx", "blog", "changelog"],
    previewPath: "/preview/saas-marketing-os/public",
    defaultSurface: "public",
    pullPaths: [
      "app/preview/saas-marketing-os",
      "components/templates/_shared",
      "components/templates/saas-marketing",
    ],
    files: [
      "app/preview/saas-marketing-os/public/layout.tsx",
      "app/preview/saas-marketing-os/public/page.tsx",
      "app/preview/saas-marketing-os/public/pricing/page.tsx",
      "app/preview/saas-marketing-os/public/features/page.tsx",
      "app/preview/saas-marketing-os/public/blog/page.tsx",
      "app/preview/saas-marketing-os/public/blog/[slug]/page.tsx",
      "app/preview/saas-marketing-os/public/changelog/page.tsx",
      "app/preview/saas-marketing-os/public/about/page.tsx",
      "app/preview/saas-marketing-os/public/contact/page.tsx",
      "components/templates/saas-marketing/shared/site-config.ts",
      "components/templates/saas-marketing/shared/nav-config.ts",
      "components/templates/saas-marketing/shared/types.ts",
      "components/templates/saas-marketing/shared/store.tsx",
      "components/templates/saas-marketing/shared/seed.ts",
      "components/templates/saas-marketing/slices/home/HomePage.tsx",
      "components/templates/saas-marketing/slices/pricing/PricingPage.tsx",
      "components/templates/saas-marketing/slices/features/FeaturesPage.tsx",
      "components/templates/saas-marketing/slices/blog/BlogList.tsx",
      "components/templates/saas-marketing/slices/blog/BlogDetail.tsx",
      "components/templates/saas-marketing/slices/changelog/ChangelogPage.tsx",
      "components/templates/saas-marketing/slices/about/AboutPage.tsx",
      "components/templates/saas-marketing/slices/contact/ContactPage.tsx",
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
      "@radix-ui/react-label",
      "@radix-ui/react-separator",
      "@radix-ui/react-slot",
    ],
    shadcnComponents: [
      "badge", "button", "input", "label",
      "separator", "sheet", "textarea",
    ],
    exampleCode: `// app/(public)/page.tsx
import { HomePage } from "@/components/templates/saas-marketing/slices/home/HomePage";
export default function Page() { return <HomePage />; }`,
    agentRecipe:
      "SaaS Marketing OS = public-only marketing template. Blog + changelog use MDX (add the mdx-blog feature). Edit components/templates/saas-marketing/shared/site-config.ts to set product name, tagline, pricing tiers, contact email.",
  },
  {
    slug: "kreator-studio-os",
    title: "Kreator Studio OS",
    category: "website-template",
    description:
      "Multi-channel content planner + voice trainer + repurposing engine + carousel maker. Public newsletter site + admin (planner, voice, scripts, carousels, assets, performance, comments). Bahasa Indonesia, ID-first.",
    source: "synthesized",
    repoPath: "app/preview/kreator-studio-os",
    primaryFile: "app/preview/kreator-studio-os/public/page.tsx",
    tags: ["template", "creator", "newsletter", "content-planner", "voice-trainer", "indonesia"],
    previewPath: "/preview/kreator-studio-os/public",
    adminPreviewPath: "/preview/kreator-studio-os/admin",
    defaultSurface: "admin",
    pullPaths: [
      "app/preview/kreator-studio-os",
      "components/templates/_shared",
      "components/templates/kreator-studio",
    ],
    files: [
      "app/preview/kreator-studio-os/robots.ts",
      "app/preview/kreator-studio-os/sitemap.ts",
      "app/preview/kreator-studio-os/opengraph-image.tsx",
      "app/preview/kreator-studio-os/public/layout.tsx",
      "app/preview/kreator-studio-os/public/page.tsx",
      "app/preview/kreator-studio-os/public/posts/page.tsx",
      "app/preview/kreator-studio-os/public/about/page.tsx",
      "app/preview/kreator-studio-os/admin/layout.tsx",
      "app/preview/kreator-studio-os/admin/page.tsx",
      "app/preview/kreator-studio-os/admin/admin-shell-client.tsx",
      "app/preview/kreator-studio-os/admin/planner/page.tsx",
      "app/preview/kreator-studio-os/admin/voice/page.tsx",
      "app/preview/kreator-studio-os/admin/scripts/page.tsx",
      "app/preview/kreator-studio-os/admin/carousels/page.tsx",
      "app/preview/kreator-studio-os/admin/assets/page.tsx",
      "app/preview/kreator-studio-os/admin/performance/page.tsx",
      "app/preview/kreator-studio-os/admin/newsletter/page.tsx",
      "app/preview/kreator-studio-os/admin/comments/page.tsx",
      "app/preview/kreator-studio-os/admin/settings/page.tsx",
      "components/templates/kreator-studio/shared/site-config.ts",
      "components/templates/kreator-studio/shared/types.ts",
      "components/templates/kreator-studio/shared/seed.ts",
      "components/templates/kreator-studio/shared/nav-config.ts",
      "components/templates/kreator-studio/shared/store.tsx",
      "components/templates/kreator-studio/slices/home/HomePage.tsx",
      "components/templates/kreator-studio/slices/posts/PostsPage.tsx",
      "components/templates/kreator-studio/slices/about/AboutPage.tsx",
      "components/templates/kreator-studio/slices/admin/dashboard/DashboardView.tsx",
      "components/templates/kreator-studio/slices/admin/planner/PlannerView.tsx",
      "components/templates/kreator-studio/slices/admin/voice/VoiceView.tsx",
      "components/templates/kreator-studio/slices/admin/scripts/ScriptsView.tsx",
      "components/templates/kreator-studio/slices/admin/carousels/CarouselsView.tsx",
      "components/templates/kreator-studio/slices/admin/assets/AssetsView.tsx",
      "components/templates/kreator-studio/slices/admin/performance/PerformanceView.tsx",
      "components/templates/kreator-studio/slices/admin/newsletter/NewsletterView.tsx",
      "components/templates/kreator-studio/slices/admin/comments/CommentsView.tsx",
      "components/templates/kreator-studio/slices/admin/settings/SettingsView.tsx",
    ],
    dependencies: [
      "next@^16",
      "react@^19",
      "react-dom@^19",
      "lucide-react",
      "@tabler/icons-react",
      "tailwindcss@^4",
      "@radix-ui/react-label",
      "@radix-ui/react-separator",
      "@radix-ui/react-slot",
    ],
    shadcnComponents: [
      "badge", "button", "card", "input", "label",
      "separator", "sheet",
    ],
    exampleCode: `// app/preview/kreator-studio-os/public/page.tsx
import { HomePage } from "@/components/templates/kreator-studio/slices/home/HomePage";
export default function Page() { return <HomePage />; }`,
    agentRecipe:
      "Kreator Studio OS = full-app content-creator template (public newsletter + 9-tab admin). 1) Edit components/templates/kreator-studio/shared/site-config.ts (brandName, ownerName, baseUrl, twitter). 2) Replace localStorage StoreProvider with Convex queries (state shape mirrors localStorage). 3) Wire Resend for newsletter + Midtrans tip-jar on public CTA. 4) Voice/Scripts/Carousels admin views are scaffolds — wire to ai-router (mid tier for voice-train/voice-apply, nano for shortform script).",
  },
  {
    slug: "konsultan-os",
    title: "Konsultan OS",
    category: "website-template",
    description:
      "Consultancy workspace — public services landing + case studies + admin (CRM, proposals AI, kontrak ID-aware, projects, PajakAware billing, documents). Indonesian-tax aware (PPN/PPh).",
    source: "synthesized",
    repoPath: "app/preview/konsultan-os",
    primaryFile: "app/preview/konsultan-os/public/page.tsx",
    tags: ["template", "consultant", "crm", "proposals", "billing", "indonesia"],
    previewPath: "/preview/konsultan-os/public",
    adminPreviewPath: "/preview/konsultan-os/admin",
    defaultSurface: "admin",
    pullPaths: [
      "app/preview/konsultan-os",
      "components/templates/_shared",
      "components/templates/konsultan",
    ],
    files: [
      "app/preview/konsultan-os/robots.ts",
      "app/preview/konsultan-os/sitemap.ts",
      "app/preview/konsultan-os/opengraph-image.tsx",
      "app/preview/konsultan-os/public/layout.tsx",
      "app/preview/konsultan-os/public/page.tsx",
      "app/preview/konsultan-os/public/case-studies/page.tsx",
      "app/preview/konsultan-os/public/contact/page.tsx",
      "app/preview/konsultan-os/admin/layout.tsx",
      "app/preview/konsultan-os/admin/page.tsx",
      "app/preview/konsultan-os/admin/admin-shell-client.tsx",
      "app/preview/konsultan-os/admin/clients/page.tsx",
      "app/preview/konsultan-os/admin/proposals/page.tsx",
      "app/preview/konsultan-os/admin/contracts/page.tsx",
      "app/preview/konsultan-os/admin/projects/page.tsx",
      "app/preview/konsultan-os/admin/billing/page.tsx",
      "app/preview/konsultan-os/admin/documents/page.tsx",
      "app/preview/konsultan-os/admin/settings/page.tsx",
      "components/templates/konsultan/shared/site-config.ts",
      "components/templates/konsultan/shared/types.ts",
      "components/templates/konsultan/shared/seed.ts",
      "components/templates/konsultan/shared/nav-config.ts",
      "components/templates/konsultan/shared/store.tsx",
      "components/templates/konsultan/slices/home/HomePage.tsx",
      "components/templates/konsultan/slices/case-studies/CaseStudiesPage.tsx",
      "components/templates/konsultan/slices/contact/ContactPage.tsx",
      "components/templates/konsultan/slices/admin/dashboard/DashboardView.tsx",
      "components/templates/konsultan/slices/admin/clients/ClientsView.tsx",
      "components/templates/konsultan/slices/admin/proposals/ProposalsView.tsx",
      "components/templates/konsultan/slices/admin/contracts/ContractsView.tsx",
      "components/templates/konsultan/slices/admin/projects/ProjectsView.tsx",
      "components/templates/konsultan/slices/admin/billing/BillingView.tsx",
      "components/templates/konsultan/slices/admin/documents/DocumentsView.tsx",
      "components/templates/konsultan/slices/admin/settings/SettingsView.tsx",
    ],
    dependencies: [
      "next@^16",
      "react@^19",
      "react-dom@^19",
      "lucide-react",
      "@tabler/icons-react",
      "tailwindcss@^4",
      "@radix-ui/react-label",
      "@radix-ui/react-separator",
      "@radix-ui/react-slot",
    ],
    shadcnComponents: [
      "badge", "button", "card", "input", "label",
      "separator", "sheet", "textarea",
    ],
    exampleCode: `// app/preview/konsultan-os/public/page.tsx
import { HomePage } from "@/components/templates/konsultan/slices/home/HomePage";
export default function Page() { return <HomePage />; }`,
    agentRecipe:
      "Konsultan OS = full-app consultancy template (public services + 7-tab admin). 1) Edit components/templates/konsultan/shared/site-config.ts (brandName, ownerName, baseUrl). 2) Replace localStorage StoreProvider with Convex queries. 3) Add @convex-dev/auth + RBAC on /admin routes. 4) Wire Resend for proposal email + e-sign provider for contracts. 5) Billing view is PajakAware-ready — connect to Midtrans + Indonesian-tax calc on invoice generation.",
  },
  {
    slug: "wirausaha-os",
    title: "Wirausaha OS",
    category: "website-template",
    description:
      "Indonesian UKM operations hub — public storefront + 8-tab admin (multi-business registry, inventory, orders, customers/CRM, finance with AI laporan, staff). Bahasa Indonesia, mobile-first public.",
    source: "synthesized",
    repoPath: "app/preview/wirausaha-os",
    primaryFile: "app/preview/wirausaha-os/public/page.tsx",
    tags: ["template", "smb", "ukm", "multi-business", "midtrans", "qris", "indonesia"],
    previewPath: "/preview/wirausaha-os/public",
    adminPreviewPath: "/preview/wirausaha-os/admin",
    defaultSurface: "admin",
    pullPaths: [
      "app/preview/wirausaha-os",
      "components/templates/_shared",
      "components/templates/wirausaha",
    ],
    files: [
      "app/preview/wirausaha-os/robots.ts",
      "app/preview/wirausaha-os/sitemap.ts",
      "app/preview/wirausaha-os/opengraph-image.tsx",
      "app/preview/wirausaha-os/public/layout.tsx",
      "app/preview/wirausaha-os/public/page.tsx",
      "app/preview/wirausaha-os/public/services/page.tsx",
      "app/preview/wirausaha-os/public/contact/page.tsx",
      "app/preview/wirausaha-os/admin/layout.tsx",
      "app/preview/wirausaha-os/admin/page.tsx",
      "app/preview/wirausaha-os/admin/admin-shell-client.tsx",
      "app/preview/wirausaha-os/admin/businesses/page.tsx",
      "app/preview/wirausaha-os/admin/inventory/page.tsx",
      "app/preview/wirausaha-os/admin/orders/page.tsx",
      "app/preview/wirausaha-os/admin/customers/page.tsx",
      "app/preview/wirausaha-os/admin/finance/page.tsx",
      "app/preview/wirausaha-os/admin/staff/page.tsx",
      "app/preview/wirausaha-os/admin/settings/page.tsx",
      "components/templates/wirausaha/shared/site-config.ts",
      "components/templates/wirausaha/shared/types.ts",
      "components/templates/wirausaha/shared/seed.ts",
      "components/templates/wirausaha/shared/nav-config.ts",
      "components/templates/wirausaha/shared/store.tsx",
      "components/templates/wirausaha/slices/home/HomePage.tsx",
      "components/templates/wirausaha/slices/services/ServicesPage.tsx",
      "components/templates/wirausaha/slices/contact/ContactPage.tsx",
      "components/templates/wirausaha/slices/admin/dashboard/DashboardView.tsx",
      "components/templates/wirausaha/slices/admin/businesses/BusinessesView.tsx",
      "components/templates/wirausaha/slices/admin/inventory/InventoryView.tsx",
      "components/templates/wirausaha/slices/admin/orders/OrdersView.tsx",
      "components/templates/wirausaha/slices/admin/customers/CustomersView.tsx",
      "components/templates/wirausaha/slices/admin/finance/FinanceView.tsx",
      "components/templates/wirausaha/slices/admin/staff/StaffView.tsx",
      "components/templates/wirausaha/slices/admin/settings/SettingsView.tsx",
    ],
    dependencies: [
      "next@^16",
      "react@^19",
      "react-dom@^19",
      "lucide-react",
      "@tabler/icons-react",
      "tailwindcss@^4",
      "@radix-ui/react-label",
      "@radix-ui/react-separator",
      "@radix-ui/react-slot",
    ],
    shadcnComponents: [
      "badge", "button", "card", "input", "label",
      "separator", "sheet", "textarea",
    ],
    exampleCode: `// app/preview/wirausaha-os/public/page.tsx
import { HomePage } from "@/components/templates/wirausaha/slices/home/HomePage";
export default function Page() { return <HomePage />; }`,
    agentRecipe:
      "Wirausaha OS = full-app UKM template (mobile-first public storefront + 8-tab admin). 1) Edit components/templates/wirausaha/shared/site-config.ts. 2) Replace localStorage StoreProvider with Convex queries. 3) Wire Midtrans + QRIS for orders. 4) Add WhatsApp-bot for order confirmations. 5) Finance view scaffolds AI-laporan — connect to ai-router (mid tier) for narrative generation from monthly aggregates.",
  },
  {
    slug: "riset-kit",
    title: "Riset Kit",
    category: "website-template",
    description:
      "Research workspace — public knowledge-base reader + admin (document library, AI reader, literature review, citations, notes). Bahasa Indonesia academic-style, vector-search ready.",
    source: "synthesized",
    repoPath: "app/preview/riset-kit",
    primaryFile: "app/preview/riset-kit/public/page.tsx",
    tags: ["template", "research", "knowledge-base", "vector-search", "ai-reader", "indonesia"],
    previewPath: "/preview/riset-kit/public",
    adminPreviewPath: "/preview/riset-kit/admin",
    defaultSurface: "admin",
    pullPaths: [
      "app/preview/riset-kit",
      "components/templates/_shared",
      "components/templates/research",
    ],
    files: [
      "app/preview/riset-kit/robots.ts",
      "app/preview/riset-kit/sitemap.ts",
      "app/preview/riset-kit/opengraph-image.tsx",
      "app/preview/riset-kit/public/layout.tsx",
      "app/preview/riset-kit/public/page.tsx",
      "app/preview/riset-kit/public/library/page.tsx",
      "app/preview/riset-kit/public/about/page.tsx",
      "app/preview/riset-kit/admin/layout.tsx",
      "app/preview/riset-kit/admin/page.tsx",
      "app/preview/riset-kit/admin/admin-shell-client.tsx",
      "app/preview/riset-kit/admin/documents/page.tsx",
      "app/preview/riset-kit/admin/notes/page.tsx",
      "app/preview/riset-kit/admin/citations/page.tsx",
      "app/preview/riset-kit/admin/ai-reader/page.tsx",
      "app/preview/riset-kit/admin/lit-review/page.tsx",
      "app/preview/riset-kit/admin/settings/page.tsx",
      "components/templates/research/shared/site-config.ts",
      "components/templates/research/shared/types.ts",
      "components/templates/research/shared/seed.ts",
      "components/templates/research/shared/nav-config.ts",
      "components/templates/research/shared/store.tsx",
      "components/templates/research/slices/home/HomePage.tsx",
      "components/templates/research/slices/library/LibraryPage.tsx",
      "components/templates/research/slices/about/AboutPage.tsx",
      "components/templates/research/slices/admin/dashboard/DashboardView.tsx",
      "components/templates/research/slices/admin/documents/DocumentsView.tsx",
      "components/templates/research/slices/admin/notes/NotesView.tsx",
      "components/templates/research/slices/admin/citations/CitationsView.tsx",
      "components/templates/research/slices/admin/ai-reader/AiReaderView.tsx",
      "components/templates/research/slices/admin/lit-review/LitReviewView.tsx",
      "components/templates/research/slices/admin/settings/SettingsView.tsx",
    ],
    dependencies: [
      "next@^16",
      "react@^19",
      "react-dom@^19",
      "lucide-react",
      "@tabler/icons-react",
      "tailwindcss@^4",
      "@radix-ui/react-label",
      "@radix-ui/react-separator",
      "@radix-ui/react-slot",
    ],
    shadcnComponents: [
      "badge", "button", "card", "input", "label",
      "separator", "sheet",
    ],
    exampleCode: `// app/preview/riset-kit/public/page.tsx
import { HomePage } from "@/components/templates/research/slices/home/HomePage";
export default function Page() { return <HomePage />; }`,
    agentRecipe:
      "Riset Kit = full-app research template (public KB reader + 6-tab admin). 1) Edit components/templates/research/shared/site-config.ts. 2) Replace localStorage StoreProvider with Convex queries. 3) Add @convex-dev/auth on /admin (single owner suffices). 4) Document library expects pdf-extract + vector-search — wire convex-vector-search component. 5) AI Reader wires ai-router (mid tier) for QA over uploaded PDFs. 6) Lit-review matrix is a scaffold — wire AI summarizer per cell.",
  },

  // ───────────── HERO BLOCKS (5) ─────────────
  {
    slug: "hero-centered",
    title: "Hero — Centered",
    category: "marketing",
    description: "Single-column centered hero with eyebrow pill, headline, sub-copy, and dual CTA. Radial gradient backdrop.",
    source: "kitab",
    repoPath: "app/preview/hero-centered",
    primaryFile: "app/preview/hero-centered/page.tsx",
    tags: ["block", "hero", "centered", "marketing"],
    previewPath: "/preview/hero-centered",
    defaultView: "desktop",
    defaultZoom: 0.5,
    exampleCode: `<section className="mx-auto max-w-3xl text-center py-24">
  <span className="rounded-full border px-3 py-1 text-xs">New — v1.0</span>
  <h1 className="mt-6 text-6xl font-bold tracking-tight">Ship faster</h1>
  <p className="mt-6 text-lg text-muted-foreground">Copy proven slices.</p>
  <div className="mt-8 flex justify-center gap-3">
    <Button>Get started</Button>
    <Button variant="outline">Docs</Button>
  </div>
</section>`,
    agentRecipe: "Pure layout. Drop into landing pages where the product needs minimum framing. Replace the eyebrow pill with a status badge or release tag. Two CTAs is the sweet spot.",
  },
  {
    slug: "hero-split",
    title: "Hero — Split (Text + Visual)",
    category: "marketing",
    description: "Two-column hero: left copy + feature list + CTAs, right visual slot. 9-cell mock grid placeholder for product shot.",
    source: "kitab",
    repoPath: "app/preview/hero-split",
    primaryFile: "app/preview/hero-split/page.tsx",
    tags: ["block", "hero", "split", "marketing", "product"],
    previewPath: "/preview/hero-split",
    defaultView: "desktop",
    defaultZoom: 0.5,
    exampleCode: `<section className="grid lg:grid-cols-2 gap-12 py-16">
  <div>
    <h1 className="text-5xl font-bold">From idea to prod</h1>
    <ul className="mt-6 space-y-3">
      <li><ShieldCheck /> Audit-gated</li>
      <li><Boxes /> 26 portable slices</li>
    </ul>
  </div>
  <div className="rounded-2xl border bg-gradient-to-br">{visual}</div>
</section>`,
    agentRecipe: "Right column accepts any visual — screenshot, product mock, illustration, or live demo iframe. Feature list pairs Lucide icons with one-line value props.",
  },
  {
    slug: "hero-bento-bg",
    title: "Hero — Bento Background",
    category: "marketing",
    description: "Bento mini-grid behind a centered headline. Radial mask focuses the eye on the copy while the grid hints at features.",
    source: "kitab",
    repoPath: "app/preview/hero-bento-bg",
    primaryFile: "app/preview/hero-bento-bg/page.tsx",
    tags: ["block", "hero", "bento", "marketing", "decorative"],
    previewPath: "/preview/hero-bento-bg",
    defaultView: "desktop",
    defaultZoom: 0.5,
    exampleCode: `<main className="relative">
  <div className="absolute inset-0 -z-10 grid grid-cols-4 gap-3 p-6 [mask-image:radial-gradient(circle,black,transparent_75%)]">
    {TILES.map(t => <div className={t.span + ' rounded-2xl bg-gradient-to-br ' + t.g} />)}
  </div>
  <section className="text-center"><h1>The kitab for shipping</h1></section>
</main>`,
    agentRecipe: "Background tiles get a radial mask so the center stays readable. Use 6-8 tiles with asymmetric spans (col-span-2 row-span-2 for one, others 1x1). Lucide icon in each tile.",
  },
  {
    slug: "hero-video-loop",
    title: "Hero — Video Loop (dark)",
    category: "marketing",
    description: "Dark-mode hero with conic-gradient animated backdrop (stand-in for video). Play CTA, headline, dual CTA.",
    source: "kitab",
    repoPath: "app/preview/hero-video-loop",
    primaryFile: "app/preview/hero-video-loop/page.tsx",
    tags: ["block", "hero", "video", "marketing", "dark"],
    previewPath: "/preview/hero-video-loop",
    defaultView: "desktop",
    defaultZoom: 0.5,
    exampleCode: `<main className="relative bg-zinc-950 text-white">
  <video autoPlay muted loop className="absolute inset-0 -z-10 w-full h-full object-cover" />
  <section className="text-center py-24">
    <button className="rounded-full p-4 backdrop-blur"><Play /></button>
    <h1 className="text-7xl">Watch it move</h1>
  </section>
</main>`,
    agentRecipe: "Replace the conic-gradient backdrop with a muted <video autoplay loop>. Keep the dark theme — light text on motion only reads when the contrast is hard.",
  },
  {
    slug: "hero-animated-text",
    title: "Hero — Animated Text",
    category: "marketing",
    description: "Rotating word inside the headline cycles every 2s with gradient text + fade-slide transition. Lightweight, no extra deps.",
    source: "kitab",
    repoPath: "app/preview/hero-animated-text",
    primaryFile: "app/preview/hero-animated-text/page.tsx",
    tags: ["block", "hero", "motion", "marketing", "kinetic"],
    previewPath: "/preview/hero-animated-text",
    defaultView: "desktop",
    defaultZoom: 0.5,
    exampleCode: `const WORDS = ["faster", "smarter", "safer"];
const [i, setI] = useState(0);
useEffect(() => { const id = setInterval(() => setI(n => (n+1)%WORDS.length), 2000); return () => clearInterval(id); }, []);

<h1>Build <span className="bg-gradient-to-r from-violet-500 to-orange-500 bg-clip-text text-transparent">{WORDS[i]}</span> with the mesh</h1>`,
    agentRecipe: "Use absolute-positioned word slots with translate-y + opacity transitions. The invisible placeholder word keeps the bounding box stable.",
  },

  // ───────────── PRICING BLOCKS (5) ─────────────
  {
    slug: "pricing-three",
    title: "Pricing — Three Tier",
    category: "marketing",
    description: "Classic 3-tier card layout. Middle tier highlighted with Most Popular badge + soft shadow.",
    source: "kitab",
    repoPath: "app/preview/pricing-three",
    primaryFile: "app/preview/pricing-three/page.tsx",
    tags: ["block", "pricing", "marketing", "saas"],
    previewPath: "/preview/pricing-three",
    defaultView: "desktop",
    defaultZoom: 0.55,
    exampleCode: `<div className="grid md:grid-cols-3 gap-6">
  {TIERS.map(t => (
    <div className={t.featured ? "border-primary/50 bg-primary/[0.03]" : ""}>
      <h2>{t.name}</h2>
      <p className="text-4xl font-bold">\${t.price}</p>
      <ul>{t.features.map(f => <li><Check />{f}</li>)}</ul>
      <Button>{t.cta}</Button>
    </div>
  ))}
</div>`,
    agentRecipe: "Three is the magic number for SaaS pricing — fewer feels limited, more triggers analysis paralysis. Middle tier should be the one you actually want to sell.",
  },
  {
    slug: "pricing-four",
    title: "Pricing — Four Tier",
    category: "marketing",
    description: "Four-tier with Best Value badge on tier 3. Compact card chrome, 4-column grid that collapses gracefully.",
    source: "kitab",
    repoPath: "app/preview/pricing-four",
    primaryFile: "app/preview/pricing-four/page.tsx",
    tags: ["block", "pricing", "marketing", "saas"],
    previewPath: "/preview/pricing-four",
    defaultView: "desktop",
    defaultZoom: 0.55,
    exampleCode: `<div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
  {TIERS.map(t => (
    <div className="flex flex-col rounded-xl border p-6">
      <h2 className="uppercase text-xs">{t.name}</h2>
      <p className="text-3xl font-bold">\${t.price}</p>
      <ul className="grow">{t.features.map(f => <li>{f}</li>)}</ul>
      <Button>Get started</Button>
    </div>
  ))}
</div>`,
    agentRecipe: "Use when you genuinely have four distinct tiers (free / solo / team / enterprise). Don't pad to four — use the three-tier variant if the fourth is forced.",
  },
  {
    slug: "pricing-toggle",
    title: "Pricing — Monthly/Yearly Toggle",
    category: "marketing",
    description: "3-tier with a monthly/yearly pill toggle. Yearly price strikethroughs the monthly, -20% savings badge inside the toggle.",
    source: "kitab",
    repoPath: "app/preview/pricing-toggle",
    primaryFile: "app/preview/pricing-toggle/page.tsx",
    tags: ["block", "pricing", "marketing", "interactive"],
    previewPath: "/preview/pricing-toggle",
    defaultView: "desktop",
    defaultZoom: 0.55,
    exampleCode: `const [yearly, setYearly] = useState(true);
const price = yearly ? t.yearly : t.monthly;

<div className="inline-flex rounded-full border p-1">
  <button onClick={() => setYearly(false)}>Monthly</button>
  <button onClick={() => setYearly(true)}>Yearly <span>-20%</span></button>
</div>`,
    agentRecipe: "Default to yearly — that's the conversion-optimized choice. Show the monthly strikethrough so the savings feel real, not implied.",
  },
  {
    slug: "pricing-compare",
    title: "Pricing — Feature Comparison",
    category: "marketing",
    description: "Single comparison table: feature rows × plan columns. Check/Minus icons, header row with prices, sticky CTA row.",
    source: "kitab",
    repoPath: "app/preview/pricing-compare",
    primaryFile: "app/preview/pricing-compare/page.tsx",
    tags: ["block", "pricing", "marketing", "comparison", "table"],
    previewPath: "/preview/pricing-compare",
    defaultView: "desktop",
    defaultZoom: 0.6,
    exampleCode: `<div className="rounded-2xl border overflow-hidden">
  <div className="grid grid-cols-4 bg-muted/30 px-6 py-5">
    <div />
    {PLANS.map(p => <div className="text-center">{p}</div>)}
  </div>
  {ROWS.map(r => (
    <div className="grid grid-cols-4 px-6 py-3">
      <div>{r.feature}</div>
      {r.values.map(v => <div className="text-center">{typeof v === "boolean" ? (v ? <Check /> : <Minus />) : v}</div>)}
    </div>
  ))}
</div>`,
    agentRecipe: "Use for complex products where buyers actually compare. Mix boolean rows (Check/Minus) with string-value rows (\"1\", \"10\", \"Unlimited\") for clarity.",
  },
  {
    slug: "pricing-slider",
    title: "Pricing — Usage Slider",
    category: "marketing",
    description: "Range slider drives the price. Tier name and per-seat cost update live. Single-card layout, focus on the math.",
    source: "kitab",
    repoPath: "app/preview/pricing-slider",
    primaryFile: "app/preview/pricing-slider/page.tsx",
    tags: ["block", "pricing", "marketing", "interactive", "usage"],
    previewPath: "/preview/pricing-slider",
    defaultView: "tablet",
    defaultZoom: 0.8,
    exampleCode: `function priceFor(seats) {
  if (seats <= 1) return 0;
  if (seats <= 5) return seats * 9;
  return 5*9 + (seats-5) * 7;
}
const [seats, setSeats] = useState(5);
<input type="range" min={1} max={50} value={seats} onChange={e => setSeats(+e.target.value)} />
<p className="text-4xl">\${priceFor(seats)}/mo</p>`,
    agentRecipe: "Use for usage-based or seat-based products. Make the breakpoints transparent — buyers should be able to predict the next price without surprises.",
  },

  // ───────────── ACCORDION BLOCKS (5) ─────────────
  {
    slug: "accordion-faq",
    title: "Accordion — Classic FAQ",
    category: "marketing",
    description: "Single-open FAQ accordion. ChevronDown rotates, content reveals below. Clean, compact, perfect for support pages.",
    source: "kitab",
    repoPath: "app/preview/accordion-faq",
    primaryFile: "app/preview/accordion-faq/page.tsx",
    tags: ["block", "accordion", "faq", "marketing"],
    previewPath: "/preview/accordion-faq",
    defaultView: "tablet",
    defaultZoom: 0.85,
    exampleCode: `const [open, setOpen] = useState(0);

<div className="divide-y rounded-2xl border">
  {ITEMS.map((it, i) => (
    <div>
      <button onClick={() => setOpen(open === i ? -1 : i)}>
        {it.q} <ChevronDown className={open === i ? "rotate-180" : ""} />
      </button>
      {open === i && <div>{it.a}</div>}
    </div>
  ))}
</div>`,
    agentRecipe: "Single-open keeps the page short. Use when answers are independent. Switch to multi-open if buyers tend to scan multiple answers at once.",
  },
  {
    slug: "accordion-grouped",
    title: "Accordion — Grouped Sections",
    category: "marketing",
    description: "FAQ split into themed groups (Getting Started / Slices / Billing). Each group is its own card. Independent open state per item.",
    source: "kitab",
    repoPath: "app/preview/accordion-grouped",
    primaryFile: "app/preview/accordion-grouped/page.tsx",
    tags: ["block", "accordion", "faq", "marketing", "grouped"],
    previewPath: "/preview/accordion-grouped",
    defaultView: "tablet",
    defaultZoom: 0.8,
    exampleCode: `{GROUPS.map(g => (
  <section>
    <h2 className="text-xs uppercase">{g.title}</h2>
    <div className="rounded-2xl border">
      {g.items.map(it => <Item q={it.q} a={it.a} />)}
    </div>
  </section>
))}`,
    agentRecipe: "Use when the FAQ is long (>10 items) and questions cluster naturally. Each group's Item owns its open state for predictable UX.",
  },
  {
    slug: "accordion-sidebar",
    title: "Accordion — Sidebar Navigation",
    category: "marketing",
    description: "Docs-style: left nav switches sections, right pane shows the section's accordion. Two-axis navigation in one layout.",
    source: "kitab",
    repoPath: "app/preview/accordion-sidebar",
    primaryFile: "app/preview/accordion-sidebar/page.tsx",
    tags: ["block", "accordion", "docs", "sidebar", "navigation"],
    previewPath: "/preview/accordion-sidebar",
    defaultView: "desktop",
    defaultZoom: 0.65,
    exampleCode: `<section className="grid md:grid-cols-[220px_1fr] gap-8">
  <aside>{SECTIONS.map((s, i) => <button onClick={() => setSection(i)}>{s.title}</button>)}</aside>
  <div>
    <h1>{current.title}</h1>
    {current.items.map(it => <AccordionRow q={it.q} a={it.a} />)}
  </div>
</section>`,
    agentRecipe: "Use for help/docs pages with section breadth. Keep section count ≤ 5 — beyond that, the sidebar gets noisy. Reset accordion state on section change.",
  },
  {
    slug: "accordion-animated",
    title: "Accordion — Smooth Animated",
    category: "marketing",
    description: "Grid-row transition for true height animation, no janky calc. Each item is a rounded card with rotating plus → primary close icon.",
    source: "kitab",
    repoPath: "app/preview/accordion-animated",
    primaryFile: "app/preview/accordion-animated/page.tsx",
    tags: ["block", "accordion", "marketing", "motion"],
    previewPath: "/preview/accordion-animated",
    defaultView: "tablet",
    defaultZoom: 0.85,
    exampleCode: `<div style={{
  gridTemplateRows: open ? "1fr" : "0fr",
  transition: "grid-template-rows 280ms cubic-bezier(0.4,0,0.2,1)",
}} className="grid">
  <div className="overflow-hidden">
    <p>{a}</p>
  </div>
</div>`,
    agentRecipe: "The grid-template-rows trick lets CSS animate to-auto-height natively. No JS measurement, no jank. Pair with rounded card chrome for premium feel.",
  },
  {
    slug: "accordion-multi",
    title: "Accordion — Multi-open",
    category: "marketing",
    description: "All items can be open at once. Expand-all / Collapse-all toggle in header. Best for compare-style reading.",
    source: "kitab",
    repoPath: "app/preview/accordion-multi",
    primaryFile: "app/preview/accordion-multi/page.tsx",
    tags: ["block", "accordion", "marketing", "multi-open"],
    previewPath: "/preview/accordion-multi",
    defaultView: "tablet",
    defaultZoom: 0.85,
    exampleCode: `const [open, setOpen] = useState(new Set([0]));
const toggle = (i) => setOpen(s => {
  const next = new Set(s);
  next.has(i) ? next.delete(i) : next.add(i);
  return next;
});

<button onClick={() => setOpen(open.size === ITEMS.length ? new Set() : new Set(ITEMS.map((_,i)=>i)))}>
  {open.size === ITEMS.length ? "Collapse all" : "Expand all"}
</button>`,
    agentRecipe: "Use when answers reference each other or buyers want to keep multiple sections visible (changelogs, release notes, feature comparison FAQs).",
  },

  // ───────────── BLOG VIEW BLOCKS (5) ─────────────
  {
    slug: "blog-grid",
    title: "Blog — Card Grid",
    category: "cms",
    description: "3-column responsive card grid. Cover thumbnail (HSL gradient), title, excerpt, author·date·read meta. Default blog index shape.",
    source: "kitab",
    repoPath: "app/preview/blog-grid",
    primaryFile: "app/preview/blog-grid/page.tsx",
    tags: ["block", "blog", "cms", "grid"],
    previewPath: "/preview/blog-grid",
    defaultView: "desktop",
    defaultZoom: 0.55,
    exampleCode: `<div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
  {posts.map(p => (
    <article className="rounded-2xl border">
      <Thumb post={p} className="h-44 rounded-t-2xl" />
      <div className="p-5">
        <h2>{p.title}</h2>
        <p className="text-muted-foreground">{p.excerpt}</p>
        <div className="text-xs">{p.author}·{p.date}·{p.read}</div>
      </div>
    </article>
  ))}
</div>`,
    agentRecipe: "Default to 3 columns at lg. Use the Thumb helper for cover generation when posts don't ship an image yet — HSL gradient by post.hue keeps each card distinct.",
  },
  {
    slug: "blog-list",
    title: "Blog — Dense List",
    category: "cms",
    description: "Single-column scannable list. Thumbnail left, meta + title + excerpt right. High density, low scroll.",
    source: "kitab",
    repoPath: "app/preview/blog-list",
    primaryFile: "app/preview/blog-list/page.tsx",
    tags: ["block", "blog", "cms", "list"],
    previewPath: "/preview/blog-list",
    defaultView: "tablet",
    defaultZoom: 0.75,
    exampleCode: `<div className="divide-y">
  {posts.map(p => (
    <article className="flex gap-5 py-6">
      <Thumb post={p} className="size-24 shrink-0 rounded-xl" />
      <div className="flex-1">
        <div className="text-xs">{p.tag}·{p.date}·{p.read}</div>
        <h2>{p.title}</h2>
        <p className="line-clamp-2">{p.excerpt}</p>
      </div>
    </article>
  ))}
</div>`,
    agentRecipe: "Use for archives or category pages where the reader is hunting a specific post. Compact thumbnail keeps the line height tight.",
  },
  {
    slug: "blog-magazine",
    title: "Blog — Magazine Layout",
    category: "cms",
    description: "Editorial spread: large hero post (2/3 width) + secondary featured + tail of headlines. Issue-number header gives quarterly feel.",
    source: "kitab",
    repoPath: "app/preview/blog-magazine",
    primaryFile: "app/preview/blog-magazine/page.tsx",
    tags: ["block", "blog", "cms", "editorial", "magazine"],
    previewPath: "/preview/blog-magazine",
    defaultView: "desktop",
    defaultZoom: 0.55,
    exampleCode: `<div className="grid lg:grid-cols-3 gap-8">
  <article className="lg:col-span-2">
    <Thumb post={hero} className="h-96" />
    <h2 className="text-4xl">{hero.title}</h2>
  </article>
  <aside>
    <Thumb post={secondary} className="h-32" />
    <h3>{secondary.title}</h3>
    {tail.map(p => <article><h4>{p.title}</h4></article>)}
  </aside>
</div>`,
    agentRecipe: "Use for content-heavy publications. Hero post earns the visual real estate; the sidebar carries breadth. Mix typography sizes for editorial rhythm.",
  },
  {
    slug: "blog-masonry",
    title: "Blog — Masonry",
    category: "cms",
    description: "CSS columns-based masonry with varying card heights for organic rhythm. break-inside-avoid keeps each card intact.",
    source: "kitab",
    repoPath: "app/preview/blog-masonry",
    primaryFile: "app/preview/blog-masonry/page.tsx",
    tags: ["block", "blog", "cms", "masonry"],
    previewPath: "/preview/blog-masonry",
    defaultView: "desktop",
    defaultZoom: 0.55,
    exampleCode: `<div className="columns-1 sm:columns-2 lg:columns-3 gap-6">
  {posts.map((p, i) => (
    <article className="mb-6 break-inside-avoid rounded-2xl border">
      <Thumb post={p} className={HEIGHTS[i % HEIGHTS.length]} />
      <div className="p-5">{p.title}</div>
    </article>
  ))}
</div>`,
    agentRecipe: "CSS columns are the cheap masonry — no JS, no layout shift. Vary the thumbnail height via a HEIGHTS array (h-44 to h-80). DOM order ≠ visual order — design around it.",
  },
  {
    slug: "blog-featured",
    title: "Blog — Featured Hero + Tail",
    category: "cms",
    description: "Full-bleed cover hero on the first post, then a tight 2-column grid for the rest. Cinematic open, fast scroll for the tail.",
    source: "kitab",
    repoPath: "app/preview/blog-featured",
    primaryFile: "app/preview/blog-featured/page.tsx",
    tags: ["block", "blog", "cms", "featured", "hero"],
    previewPath: "/preview/blog-featured",
    defaultView: "desktop",
    defaultZoom: 0.55,
    exampleCode: `<section className="relative overflow-hidden">
  <Thumb post={hero} className="absolute inset-0" />
  <div className="absolute inset-0 bg-gradient-to-t from-background" />
  <div className="relative min-h-[420px] flex flex-col justify-end p-12">
    <h1 className="text-6xl">{hero.title}</h1>
  </div>
</section>
<section className="grid md:grid-cols-2 gap-5">
  {rest.map(p => <article>{p.title}</article>)}
</section>`,
    agentRecipe: "Use for marketing-driven content sites (newsletter, podcast, brand journal) where the lead story carries the visit. Tail grid keeps the index scrollable without losing the hero impact.",
  },
];

export function getLayout(slug: string) {
  return layouts.find((l) => l.slug === slug) ?? null;
}
