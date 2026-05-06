import type { CMSNode } from '../ui/types';
import { uid } from '../ui/lib/utils';

export const createSampleWidget = (type: string, position = { x: 150, y: 150 }): CMSNode => {
  const id = uid();
  
  const sampleProps: Record<string, any> = {
    container: {
      display: "flex",
      direction: "column",
      gap: "4",
      padding: "6",
      className: "bg-card rounded-lg border"
    },
    section: {
      name: "New Section",
      display: "flex",
      direction: "column",
      gap: "md",
      padding: "lg",
      background: "white",
      rounded: "lg"
    },
    text: {
      tag: "p",
      content: "Sample text content",
      size: "base",
      weight: "normal",
      color: "gray-900"
    },
    button: {
      text: "Click Me",
      variant: "primary",
      size: "md",
      href: "#"
    },
    card: {
      title: "Sample Card",
      description: "This is a sample card description",
      showImage: true,
      imageUrl: "https://picsum.photos/400/200"
    },
    image: {
      src: "https://picsum.photos/640/420",
      alt: "Sample image",
      rounded: true,
      className: "w-full h-auto"
    },
    hero: {
      title: "Sample Hero Section",
      subtitle: "This is a sample hero subtitle",
      ctaText: "Get Started",
      ctaHref: "/start",
      imageUrl: "https://picsum.photos/seed/sample/800/600"
    },
    heroComposite: {
      titleContent: "Composite Hero Title",
      subtitleContent: "This is a composite hero with multiple components",
      ctaText: "Learn More",
      ctaHref: "/learn",
      imageUrl: "https://picsum.photos/seed/composite/800/600"
    },
    navGroup: {
      title: "Navigation Group",
      type: "sidebar",
      background: "white",
      border: true
    },
    menu: {
      label: "Menu Item",
      type: "menuItem",
      href: "#",
      scope: "global",
      icon: "📄"
    },
    sidebar: {
      title: "Sidebar",
      position: "left",
      variant: "sidebar",
      background: "white",
      border: true
    },
    workspaceGroup: {
      title: "Workspace",
      type: "workspace",
      workspaceType: "business",
      businessKey: "Sample Business"
    },
    libraryGroup: {
      title: "Template Library",
      category: "all",
      allowCreate: true,
      allowEdit: true,
      showThumbnails: true
    }
  };

  return {
    id,
    type: "shadcnNode",
    position,
    data: {
      comp: type,
      props: sampleProps[type] || {}
    }
  };
};

export const SAMPLE_WIDGETS = {
  section: () => createSampleWidget('section'),
  text: () => createSampleWidget('text'),
  button: () => createSampleWidget('button'),
  card: () => createSampleWidget('card'),
  image: () => createSampleWidget('image'),
  hero: () => createSampleWidget('hero'),
  heroComposite: () => createSampleWidget('heroComposite'),
  navGroup: () => createSampleWidget('navGroup'),
  menu: () => createSampleWidget('menu'),
  sidebar: () => createSampleWidget('sidebar'),
  workspaceGroup: () => createSampleWidget('workspaceGroup'),
  libraryGroup: () => createSampleWidget('libraryGroup')
};
