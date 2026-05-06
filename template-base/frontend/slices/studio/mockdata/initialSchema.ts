import type { Schema } from '../ui/types';

export const INITIAL_CMS_SCHEMA: Schema = {
  version: "0.4",
  root: ["section-1", "nav-group-1"],
  nodes: {
    "section-1": {
      type: "section",
      props: {
        path: "/",
        display: "block",
        padding: "6",
        className: "min-h-screen bg-muted"
      },
      children: ["hero-1", "section-2"]
    },
    "hero-1": {
      type: "hero",
      props: {
        title: "Welcome to Your CMS",
        subtitle: "Build beautiful pages with our visual editor",
        ctaText: "Get Started",
        ctaHref: "/dashboard",
        imageUrl: "https://picsum.photos/seed/hero/800/600",
        className: "rounded-3xl bg-gradient-to-br from-blue-50 to-white border border-blue-200"
      },
      children: []
    },
    "section-2": {
      type: "section",
      props: {
        name: "Features Section",
        display: "flex",
        direction: "column",
        gap: "lg",
        padding: "xl",
        background: "white",
        rounded: "lg",
        shadow: "sm",
        className: "mt-8"
      },
      children: ["text-1", "button-1"]
    },
    "text-1": {
      type: "text",
      props: {
        tag: "h2",
        content: "Powerful Features",
        size: "2xl",
        weight: "bold",
        color: "gray-900",
        align: "center"
      },
      children: []
    },
    "button-1": {
      type: "button",
      props: {
        text: "Learn More",
        variant: "primary",
        size: "lg",
        href: "/features",
        className: "mx-auto"
      },
      children: []
    },
    "nav-group-1": {
      type: "navGroup",
      props: {
        title: "Main Navigation",
        placement: "sidebar",
      },
      children: ["menu-main"]
    },
    "menu-main": {
      type: "navNode",
      props: {
        kind: "menu",
        label: "Main Menu",
      },
      children: ["item-builder", "item-automation", "item-database", "item-analytics", "item-settings"]
    },
    "item-builder": {
      type: "navNode",
      props: {
        kind: "item",
        label: "Builder",
        href: "/builder",
        icon: "Hammer",
      },
      children: []
    },
    "item-automation": {
      type: "navNode",
      props: {
        kind: "item",
        label: "Automation",
        href: "/automation",
        icon: "Workflow",
      },
      children: []
    },
    "item-database": {
      type: "navNode",
      props: {
        kind: "item",
        label: "Database",
        href: "/database",
        icon: "Database",
      },
      children: []
    },
    "item-analytics": {
      type: "navNode",
      props: {
        kind: "item",
        label: "Analytics",
        href: "/analytics",
        icon: "BarChart3",
      },
      children: []
    },
    "item-settings": {
      type: "navNode",
      props: {
        kind: "item",
        label: "Settings",
        href: "/settings",
        icon: "Settings",
      },
      children: []
    }
  }
};
