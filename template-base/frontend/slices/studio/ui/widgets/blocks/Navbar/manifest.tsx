import type { WidgetConfig, WidgetNode } from '@/frontend/slices/studio/ui/types';
import { NavbarBlock } from '@/frontend/slices/studio/ui/widgets/blocks/Navbar';
import { createCustomField } from '@/frontend/slices/studio/ui/inspector/standardFields';
import { Navigation } from 'lucide-react';

export const navbarManifest: WidgetConfig = {
  label: "Navbar",
  category: "Blocks",
  description: "Responsive navigation bar with logo, links, and CTA.",
  icon: Navigation,
  defaults: {
    logoText: "Brand",
    links: [
      { label: "Home", href: "/" },
      { label: "About", href: "/about" },
      { label: "Contact", href: "/contact" },
    ],
    ctaLabel: "Get Started",
    ctaHref: "#",
    sticky: false,
    className: "",
  },
  render: (props) => <NavbarBlock {...(props as any)} />,
  inspector: {
    fields: [
      createCustomField({ key: 'logoText', label: 'Logo Text', type: 'text' }),
      createCustomField({ key: 'links', label: 'Nav Links (JSON)', type: 'json' }),
      createCustomField({ key: 'ctaLabel', label: 'CTA Label', type: 'text' }),
      createCustomField({ key: 'ctaHref', label: 'CTA Link', type: 'text' }),
      createCustomField({ key: 'sticky', label: 'Sticky Header', type: 'switch' }),
    ],
  },
  explode: (props): WidgetNode => {
    const logoText = props.logoText ?? 'Brand';
    const ctaLabel = props.ctaLabel ?? 'Get Started';
    const ctaHref = props.ctaHref ?? '#';
    const links: Array<{ label: string; href: string }> = Array.isArray(props.links)
      ? props.links
      : [{ label: 'Home', href: '/' }, { label: 'About', href: '/about' }];

    const linkNodes: WidgetNode[] = links.map((link) => ({
      type: 'link',
      props: { href: link.href, content: link.label, className: 'text-sm font-medium text-muted-foreground hover:text-foreground transition-colors' },
    }));

    return {
      type: 'div',
      props: {
        className: 'flex items-center justify-between px-6 py-3 border-b border-border bg-background w-full',
        tag: 'nav',
      },
      children: [
        // Logo
        {
          type: 'text',
          props: { content: logoText, className: 'text-lg font-bold text-foreground' },
        },
        // Nav links group
        {
          type: 'div',
          props: { className: 'flex items-center gap-6' },
          children: linkNodes,
        },
        // CTA button
        {
          type: 'button',
          props: { content: ctaLabel, href: ctaHref, className: 'px-4 py-2 rounded-md bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors' },
        },
      ],
    };
  },
};
