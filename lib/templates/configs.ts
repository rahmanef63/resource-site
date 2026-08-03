import type { ConfigSchema, FeatureManifest, Selections } from "@/components/site/feature-context";

export type TemplateConfig = {
  slug: string;
  config: ConfigSchema;
  composePrompt: (slug: string, title: string, selections: Selections) => string;
  composePreviewSrc: (selections: Selections, basePath: string) => string;
  sourceRepoForSelection?: (selections: Selections) => FeatureManifest["sourceRepo"];
};

// helpers --------------------------------------------------------------

function paramsFromSelections(s: Selections, mapping: Record<string, "bool" | "string" | "csv">): string {
  const parts: string[] = [];
  for (const [k, kind] of Object.entries(mapping)) {
    const v = s[k];
    if (v == null) continue;
    if (kind === "bool" && v) parts.push(`${k}=1`);
    else if (kind === "string" && typeof v === "string" && v) parts.push(`${k}=${encodeURIComponent(v)}`);
    else if (kind === "csv" && Array.isArray(v) && v.length) parts.push(`${k}=${encodeURIComponent(v.join(","))}`);
  }
  return parts.length ? "?" + parts.join("&") : "";
}

const repoBase = (path: string) => `https://github.com/rahmanef63/resource-site/tree/main/${path}`;

// =====================================================================
// dashboard-mobile-dock (exemplar — kept)
// =====================================================================

const MOBILE_DOCK: TemplateConfig = {
  slug: "dashboard-mobile-dock",
  config: {
    groups: [
      {
        label: "Mobile bottom nav",
        fields: [
          {
            type: "radio", id: "variant", label: "Variant", default: "tabs",
            options: [
              { id: "tabs", label: "Tabs (compact)", desc: "4 items, labels, full-width" },
              { id: "dock", label: "Dock (taller)", desc: "Larger icons, native-app feel" },
              { id: "pill", label: "Pill (floating)", desc: "3 items in floating capsule" },
            ],
          },
          { type: "check", id: "aiBtn", label: "AI button (center FAB)", desc: "Floating Sparkles button above the dock" },
          {
            type: "multi", id: "more", label: "More-menu items", default: ["search", "files", "settings"],
            options: [
              { id: "search", label: "Search" },
              { id: "files", label: "Files" },
              { id: "settings", label: "Settings" },
            ],
          },
        ],
      },
      {
        label: "Header",
        fields: [
          { type: "check", id: "sidebarToggle", label: "Sidebar toggle on header (left)" },
          { type: "check", id: "tabsHeader", label: "Tabs strip in header" },
          {
            type: "radio", id: "rightNav", label: "Header right", default: "avatar",
            options: [
              { id: "avatar", label: "Avatar (popup menu)" },
              { id: "settings", label: "Settings icon" },
              { id: "none", label: "None" },
            ],
          },
        ],
      },
    ],
  },
  composePreviewSrc: (s, base) => base + paramsFromSelections(s, {
    variant: "string", aiBtn: "bool", sidebarToggle: "bool", tabsHeader: "bool", rightNav: "string", more: "csv",
  }),
  composePrompt: (slug, title, s) => `# Scaffold: ${title} (${slug})

Source: ${repoBase("cookbook/layouts/" + slug)}

## Variant
- Bottom nav: **${s.variant ?? "tabs"}**

## Header
- Sidebar toggle: ${s.sidebarToggle ? "YES" : "no"}
- Tabs strip:     ${s.tabsHeader ? "YES" : "no"}
- Right side:     ${s.rightNav ?? "avatar"}

## Mobile bottom nav
- Center AI FAB:  ${s.aiBtn ? "YES" : "no"}
- More items:     ${Array.isArray(s.more) ? (s.more as string[]).join(", ") : "(none)"}

## Files to copy
\`\`\`bash
npx rr add dashboard-shell        # the shell itself (rail + mobile dock)
cp -r ~/projects/resource-site/cookbook/layouts/${slug}/* slices/dashboard-shell/
\`\`\`

## Wire
1. Mount \`<DashboardShell brand nav actions={${s.rightNav ?? "avatar"} slot} />\` at \`app/dashboard/layout.tsx\` (import from \`@/features/dashboard-shell\`).
2. Define the nav ONCE — groups → items; flag \`dock: true\` on the ${s.variant ?? "tabs"} entries you want in the mobile bottom dock${s.aiBtn ? ", and pass the AI action as a dock item with `onSelect`" : ""}. The rail, the mobile sheet and the dock all read it.
${s.sidebarToggle ? "3. The topbar's SidebarTrigger is on by default; pass `topbar` to replace the whole header." : ""}
${s.aiBtn ? "4. Wire the AI dock item to <AIAgentConsole>." : ""}

Hard rules: shadcn primitives, @convex-dev/auth, no raw <button>.
`,
};

// =====================================================================
// dashboard-three-column
// =====================================================================

const THREE_COL: TemplateConfig = {
  slug: "dashboard-three-column",
  config: {
    groups: [
      {
        label: "Layout",
        fields: [
          {
            type: "radio", id: "variant", label: "Column setup", default: "3col-resizable",
            options: [
              { id: "2col-left", label: "2-col (left + center)", desc: "Sidebar + main, no inspector" },
              { id: "3col-fixed", label: "3-col fixed", desc: "Locked widths, no resize" },
              { id: "3col-resizable", label: "3-col resizable", desc: "Drag handles between panels" },
            ],
          },
          {
            type: "select", id: "leftWidth", label: "Sidebar width", default: "260",
            options: [
              { id: "200", label: "200px (slim)" },
              { id: "260", label: "260px (default)" },
              { id: "320", label: "320px (wide)" },
            ],
          },
          {
            type: "select", id: "rightWidth", label: "Inspector width", default: "360",
            options: [
              { id: "300", label: "300px" },
              { id: "360", label: "360px (default)" },
              { id: "440", label: "440px (wide)" },
            ],
          },
        ],
      },
      {
        label: "Behavior",
        fields: [
          { type: "check", id: "persist", label: "Persist collapse state to localStorage", default: true },
          { type: "check", id: "mobileDrawer", label: "Mobile drawer fallback (< 768px)", default: true },
          { type: "check", id: "aiFab", label: "AI floating action button" },
          { type: "check", id: "showCollapseBtns", label: "Show panel collapse buttons", default: true },
        ],
      },
      {
        label: "Right panel",
        fields: [
          {
            type: "radio", id: "rightTabs", label: "Right tabs", default: "inspector",
            options: [
              { id: "inspector", label: "Inspector only" },
              { id: "tabs", label: "Tabbed (Inspector / AI / Notifications)" },
              { id: "none", label: "No right panel" },
            ],
          },
        ],
      },
    ],
  },
  composePreviewSrc: (s, base) => base + paramsFromSelections(s, {
    variant: "string", leftWidth: "string", rightWidth: "string",
    persist: "bool", mobileDrawer: "bool", aiFab: "bool", showCollapseBtns: "bool", rightTabs: "string",
  }),
  composePrompt: (slug, title, s) => `# Scaffold: ${title} (${slug})

Source: ${repoBase("cookbook/layouts/" + slug)}

## Variant: ${s.variant ?? "3col-resizable"}
- Left width:  ${s.leftWidth ?? "260"}px
- Right width: ${s.rightWidth ?? "360"}px

## Behavior
- Persist collapse: ${s.persist ? "YES" : "no"}
- Mobile drawer:    ${s.mobileDrawer ? "YES" : "no"}
- AI FAB:           ${s.aiFab ? "YES" : "no"}
- Collapse buttons: ${s.showCollapseBtns ? "YES" : "no"}

## Right panel: ${s.rightTabs ?? "inspector"}

## Files
\`\`\`bash
cp -r ~/projects/resource-site/components/previews/three-column \\
      frontend/shared/ui/layout/container/three-column
\`\`\`

## Wire
\`\`\`tsx
<ThreeColumnLayoutAdvanced
  left={<Sidebar />}
  center={<MainContent />}
  ${s.rightTabs !== "none" ? "right={<Inspector />}" : ""}
  leftWidth={${s.leftWidth ?? 260}}
  rightWidth={${s.rightWidth ?? 360}}
  ${(s.variant ?? "").toString().includes("resizable") ? "resizable" : ""}
  ${s.showCollapseBtns ? "showCollapseButtons" : ""}
  ${s.persist ? `persistState\n  storageKey="my-feature"` : ""}
/>
\`\`\`
${s.aiFab ? "\nMount global <AIAgentFAB /> outside the layout." : ""}
`,
};

// =====================================================================
// landing-hero-carousel
// =====================================================================

const HERO_CAROUSEL: TemplateConfig = {
  slug: "landing-hero-carousel",
  config: {
    groups: [
      {
        label: "Animation",
        fields: [
          {
            type: "radio", id: "transition", label: "Transition", default: "fade",
            options: [
              { id: "fade", label: "Cross-fade", desc: "Opacity blend" },
              { id: "slide", label: "Slide", desc: "Horizontal translate" },
              { id: "kenburns", label: "Ken Burns", desc: "Slow zoom + pan" },
            ],
          },
          {
            type: "select", id: "interval", label: "Interval", default: "4000",
            options: [
              { id: "2000", label: "2 s (snappy)" },
              { id: "4000", label: "4 s (balanced)" },
              { id: "6000", label: "6 s (calm)" },
              { id: "0", label: "Off (manual only)" },
            ],
          },
        ],
      },
      {
        label: "Controls",
        fields: [
          { type: "check", id: "arrows", label: "Prev / Next arrows", default: true },
          { type: "check", id: "indicators", label: "Dot indicators", default: true },
          { type: "check", id: "overlay", label: "Center overlay text", default: true },
          { type: "check", id: "dim", label: "Dark gradient overlay", default: true },
        ],
      },
    ],
  },
  composePreviewSrc: (s, base) => base + paramsFromSelections(s, {
    transition: "string", interval: "string", arrows: "bool", indicators: "bool", overlay: "bool", dim: "bool",
  }),
  composePrompt: (slug, title, s) => `# Scaffold: ${title} (${slug})

Source: ${repoBase("components/previews/hero-carousel")}

## Animation
- Transition: ${s.transition ?? "fade"}
- Interval:   ${s.interval ?? "4000"}ms ${s.interval === "0" ? "(manual only)" : ""}

## Controls
- Arrows:     ${s.arrows ? "YES" : "no"}
- Indicators: ${s.indicators ? "YES" : "no"}
- Overlay:    ${s.overlay ? "YES" : "no"}
- Dim layer:  ${s.dim ? "YES" : "no"}

## Files
\`\`\`bash
cp -r ~/projects/resource-site/components/previews/hero-carousel components/hero-carousel
pnpm add next  # next/image required
\`\`\`

## Wire
\`\`\`tsx
<HeroCarousel
  images={IMAGES}
  intervalMs={${s.interval ?? 4000}}
  transition="${s.transition ?? "fade"}"
  ${s.arrows === false ? "showArrows={false}" : ""}
  ${s.indicators === false ? "showIndicators={false}" : ""}
  ${s.dim === false ? "dim={false}" : ""}
  ${s.overlay ? "overlay={<HeroCopy/>}" : ""}
/>
\`\`\`
`,
};

// =====================================================================
// landing-bento
// =====================================================================

const BENTO: TemplateConfig = {
  slug: "landing-bento",
  config: {
    groups: [
      {
        label: "Grid",
        fields: [
          {
            type: "radio", id: "variant", label: "Layout", default: "asym",
            options: [
              { id: "2x2", label: "2 × 2 (4 tiles)" },
              { id: "3x3", label: "3 × 3 (9 tiles)" },
              { id: "asym", label: "Asymmetric (mixed spans)" },
            ],
          },
          {
            type: "select", id: "tone", label: "Color tone", default: "rainbow",
            options: [
              { id: "rainbow", label: "Rainbow (every tile different hue)" },
              { id: "mono", label: "Mono (single brand hue)" },
              { id: "neutral", label: "Neutral (zinc only)" },
            ],
          },
        ],
      },
      {
        label: "Hover & feel",
        fields: [
          { type: "check", id: "gradient", label: "Gradient overlays", default: true },
          { type: "check", id: "lift", label: "Hover lift + shadow", default: true },
          { type: "check", id: "magnify", label: "Hover scale icon", default: false },
          { type: "check", id: "ctaRow", label: "Bottom CTA row", default: false },
        ],
      },
    ],
  },
  composePreviewSrc: (s, base) => base + paramsFromSelections(s, {
    variant: "string", tone: "string", gradient: "bool", lift: "bool", magnify: "bool", ctaRow: "bool",
  }),
  composePrompt: (slug, title, s) => `# Scaffold: ${title} (${slug})

Source: ${repoBase("app/preview/" + slug)}

## Grid
- Variant: ${s.variant ?? "asym"}
- Tone:    ${s.tone ?? "rainbow"}

## Hover
- Gradient:  ${s.gradient ? "YES" : "no"}
- Lift:      ${s.lift ? "YES" : "no"}
- Magnify:   ${s.magnify ? "YES" : "no"}
- CTA row:   ${s.ctaRow ? "YES" : "no"}

## Wire
\`\`\`tsx
<BentoGrid
  variant="${s.variant ?? "asym"}"
  tone="${s.tone ?? "rainbow"}"
  ${s.gradient === false ? "gradient={false}" : ""}
  ${s.lift === false ? "lift={false}" : ""}
  ${s.magnify ? "magnify" : ""}
  ${s.ctaRow ? "ctaRow={<CallToAction/>}" : ""}
/>
\`\`\`
`,
};

// =====================================================================
// dashboard-ide
// =====================================================================

const IDE: TemplateConfig = {
  slug: "dashboard-ide",
  config: {
    groups: [
      {
        label: "Theme & shell",
        fields: [
          {
            type: "radio", id: "theme", label: "Editor theme", default: "dark",
            options: [
              { id: "dark", label: "Dark (default)" },
              { id: "light", label: "Light" },
              { id: "sepia", label: "Sepia" },
            ],
          },
          {
            type: "radio", id: "panels", label: "Side panels", default: "bottom",
            options: [
              { id: "bottom", label: "Bottom only (terminal)" },
              { id: "right", label: "Right only (inspector)" },
              { id: "both", label: "Both" },
            ],
          },
        ],
      },
      {
        label: "Add-ons",
        fields: [
          { type: "check", id: "minimap", label: "Code minimap" },
          { type: "check", id: "breadcrumb", label: "Breadcrumb above editor", default: true },
          { type: "check", id: "statusBar", label: "Status bar (bottom)" },
          { type: "check", id: "problemsTab", label: "Problems tab in bottom panel", default: true },
          { type: "check", id: "runBtn", label: "Run button", default: true },
        ],
      },
    ],
  },
  composePreviewSrc: (s, base) => base + paramsFromSelections(s, {
    theme: "string", panels: "string", minimap: "bool", breadcrumb: "bool", statusBar: "bool", problemsTab: "bool", runBtn: "bool",
  }),
  composePrompt: (slug, title, s) => `# Scaffold: ${title} (${slug})

Source: ${repoBase("app/preview/" + slug)}

## Theme: ${s.theme ?? "dark"}
## Panels: ${s.panels ?? "bottom"}

## Add-ons
- Minimap:        ${s.minimap ? "YES" : "no"}
- Breadcrumb:     ${s.breadcrumb ? "YES" : "no"}
- Status bar:     ${s.statusBar ? "YES" : "no"}
- Problems tab:   ${s.problemsTab ? "YES" : "no"}
- Run button:     ${s.runBtn ? "YES" : "no"}

## Wire
\`\`\`tsx
<IdeShell
  theme="${s.theme ?? "dark"}"
  panels="${s.panels ?? "bottom"}"
  ${s.minimap ? "minimap" : ""}
  ${s.breadcrumb ? "breadcrumb" : ""}
  ${s.statusBar ? "statusBar" : ""}
  ${s.problemsTab ? "problemsTab" : ""}
  ${s.runBtn ? "runBtn" : ""}
/>
\`\`\`
`,
};

// =====================================================================
// landing-asymmetric-masonry
// =====================================================================

const MASONRY: TemplateConfig = {
  slug: "landing-asymmetric-masonry",
  config: {
    groups: [
      {
        label: "Grid",
        fields: [
          {
            type: "radio", id: "cols", label: "Columns", default: "4",
            options: [
              { id: "3", label: "3 columns" },
              { id: "4", label: "4 columns" },
              { id: "5", label: "5 columns" },
            ],
          },
          {
            type: "select", id: "rowHeight", label: "Row height", default: "140",
            options: [
              { id: "120", label: "120px (dense)" },
              { id: "140", label: "140px (default)" },
              { id: "180", label: "180px (airy)" },
            ],
          },
        ],
      },
      {
        label: "Interaction",
        fields: [
          { type: "check", id: "scrollReveal", label: "IntersectionObserver scroll-reveal", default: true },
          { type: "check", id: "hoverZoom", label: "Hover image zoom", default: true },
          { type: "check", id: "captionOnHover", label: "Caption on hover", default: true },
          { type: "check", id: "lightbox", label: "Click → lightbox" },
        ],
      },
    ],
  },
  composePreviewSrc: (s, base) => base + paramsFromSelections(s, {
    cols: "string", rowHeight: "string", scrollReveal: "bool", hoverZoom: "bool", captionOnHover: "bool", lightbox: "bool",
  }),
  composePrompt: (slug, title, s) => `# Scaffold: ${title} (${slug})

Source: ${repoBase("app/preview/" + slug)}

## Grid: ${s.cols ?? 4} cols × ${s.rowHeight ?? 140}px rows

## Interaction
- Scroll reveal:  ${s.scrollReveal ? "YES" : "no"}
- Hover zoom:     ${s.hoverZoom ? "YES" : "no"}
- Caption hover:  ${s.captionOnHover ? "YES" : "no"}
- Lightbox:       ${s.lightbox ? "YES (port lightbox primitive from rahmanef.com)" : "no"}

## Wire
\`\`\`tsx
<AsymmetricMasonry
  items={items}
  cols={${s.cols ?? 4}}
  rowHeight={${s.rowHeight ?? 140}}
  ${s.scrollReveal ? "scrollReveal" : ""}
  ${s.hoverZoom ? "hoverZoom" : ""}
  ${s.captionOnHover ? "captionOnHover" : ""}
  ${s.lightbox ? "onClick={(item) => openLightbox(item)}" : ""}
/>
\`\`\`
`,
};

// =====================================================================
// cms-public-storefront
// =====================================================================

const STOREFRONT: TemplateConfig = {
  slug: "cms-public-storefront",
  config: {
    groups: [
      {
        label: "Cart & currency",
        fields: [
          {
            type: "radio", id: "cart", label: "Cart UI", default: "badge",
            options: [
              { id: "badge", label: "Header badge (icon w/ count)" },
              { id: "drawer", label: "Slide-in drawer" },
              { id: "page", label: "Dedicated /cart page" },
            ],
          },
          {
            type: "radio", id: "currency", label: "Currency selector", default: "header",
            options: [
              { id: "header", label: "Header dropdown" },
              { id: "footer", label: "Footer link" },
              { id: "none", label: "Off (single currency)" },
            ],
          },
        ],
      },
      {
        label: "Layout",
        fields: [
          {
            type: "select", id: "cols", label: "Product grid", default: "3",
            options: [
              { id: "2", label: "2 columns (large)" },
              { id: "3", label: "3 columns (default)" },
              { id: "4", label: "4 columns (dense)" },
            ],
          },
          { type: "check", id: "tags", label: "Show product tags (Hot, New, Limited)", default: true },
          { type: "check", id: "search", label: "Search button in header", default: true },
          { type: "check", id: "i18n", label: "Language switcher (ID/EN/JA)" },
        ],
      },
    ],
  },
  composePreviewSrc: (s, base) => base + paramsFromSelections(s, {
    cart: "string", currency: "string", cols: "string", tags: "bool", search: "bool", i18n: "bool",
  }),
  composePrompt: (slug, title, s) => `# Scaffold: ${title} (${slug})

Source: ${repoBase("app/preview/" + slug)}

## Cart UI: ${s.cart ?? "badge"}
## Currency: ${s.currency ?? "header"}
## Grid: ${s.cols ?? 3} columns

## Add-ons
- Product tags:    ${s.tags ? "YES" : "no"}
- Search button:   ${s.search ? "YES" : "no"}
- Language switch: ${s.i18n ? "YES (i18n-switcher primitive)" : "no"}

## Wire
\`\`\`tsx
// app/(cms)/layout.tsx
<ConvexClientProvider mode="public">
  ${s.i18n ? "<LanguageProvider>" : ""}
    <CartContext mode="${s.cart ?? "badge"}">{children}</CartContext>
  ${s.i18n ? "</LanguageProvider>" : ""}
</ConvexClientProvider>
\`\`\`
${s.cart === "drawer" ? "\nUse <Sheet> from shadcn for the slide-in drawer." : ""}
${s.cart === "page" ? "\nAdd app/(cms)/cart/page.tsx with full CartView." : ""}
`,
};

// =====================================================================
// landing-kinetic-text
// =====================================================================

const KINETIC: TemplateConfig = {
  slug: "landing-kinetic-text",
  config: {
    groups: [
      {
        label: "Text & motion",
        fields: [
          {
            type: "radio", id: "stagger", label: "Letter stagger", default: "smooth",
            options: [
              { id: "smooth", label: "Smooth (36ms)" },
              { id: "snappy", label: "Snappy (18ms)" },
              { id: "off", label: "Off (no stagger)" },
            ],
          },
          {
            type: "radio", id: "font", label: "Headline font", default: "serif",
            options: [
              { id: "serif", label: "Serif (Playfair-style)" },
              { id: "sans", label: "Sans (Geist)" },
              { id: "mono", label: "Mono (Geist Mono)" },
            ],
          },
        ],
      },
      {
        label: "Add-ons",
        fields: [
          { type: "check", id: "magnetic", label: "Magnetic CTA button", default: true },
          { type: "check", id: "marquee", label: "Bottom marquee strip", default: true },
          { type: "check", id: "gradient", label: "Radial gradient bg blobs", default: true },
          { type: "check", id: "noise", label: "Grain noise overlay" },
        ],
      },
    ],
  },
  composePreviewSrc: (s, base) => base + paramsFromSelections(s, {
    stagger: "string", font: "string", magnetic: "bool", marquee: "bool", gradient: "bool", noise: "bool",
  }),
  composePrompt: (slug, title, s) => `# Scaffold: ${title} (${slug})

Source: ${repoBase("app/preview/" + slug)}

## Text
- Stagger: ${s.stagger ?? "smooth"}
- Font:    ${s.font ?? "serif"}

## Add-ons
- Magnetic CTA: ${s.magnetic ? "YES" : "no"}
- Marquee:      ${s.marquee ? "YES" : "no"}
- Gradient:     ${s.gradient ? "YES" : "no"}
- Grain:        ${s.noise ? "YES" : "no"}

## Files
- Motion primitives lifted from rahmanef.com (\`shared/ui/marquee\`, \`magnetic\`, \`kinetic-heading\`).

## Wire
\`\`\`tsx
<KineticHeading text="We build things" stagger={${s.stagger === "snappy" ? 18 : s.stagger === "off" ? 0 : 36}} font="${s.font ?? "serif"}" />
${s.magnetic ? "<Magnetic radius={120}><CTA /></Magnetic>" : "<CTA />"}
${s.marquee ? "<Marquee speed={30}>brands…</Marquee>" : ""}
${s.noise ? "<GrainOverlay opacity={0.04} />" : ""}
\`\`\`

All motion respects \`prefers-reduced-motion\`.
`,
};

// =====================================================================
// Registry
// =====================================================================

export const TEMPLATE_CONFIGS: Record<string, TemplateConfig> = {
  [MOBILE_DOCK.slug]: MOBILE_DOCK,
  [THREE_COL.slug]: THREE_COL,
  [HERO_CAROUSEL.slug]: HERO_CAROUSEL,
  [BENTO.slug]: BENTO,
  [IDE.slug]: IDE,
  [MASONRY.slug]: MASONRY,
  [STOREFRONT.slug]: STOREFRONT,
  [KINETIC.slug]: KINETIC,
};

export function getTemplateConfig(slug: string): TemplateConfig | null {
  return TEMPLATE_CONFIGS[slug] ?? null;
}

export const CONFIGURABLE_SLUGS = Object.keys(TEMPLATE_CONFIGS);
