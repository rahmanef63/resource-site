import type { WidgetConfig } from '@/frontend/slices/studio/ui/types';
import { CardWidget } from './CardWidget';
import React from 'react';

export const cardManifest: WidgetConfig = {
  label: "Card",
  category: "Content",
  description: "A versatile content card with dynamic data binding.",
  icon: "Square",
  defaults: { 
    title: "Card title", 
    description: "Card description", 
    imageUrl: "",
    titleRef: "", // binds to text node
    descRef: "", // binds to text node
    imageRef: "", // binds to image node
    className: ""
  },
  render: (p, children, helpers) => {
    const titleText = helpers?.getText?.(p.titleRef) || p.title;
    const descText = helpers?.getText?.(p.descRef) || p.description;
    const img = helpers?.getImage?.(p.imageRef) || (p.imageUrl ? { src: p.imageUrl, alt: "" } : null);
    return (
      <CardWidget {...p} title={titleText} description={descText} showImage={!!img} imageUrl={img?.src}>
        {children}
      </CardWidget>
    );
  },
  autoConnect: {
    title: {
      type: 'text',
      props: { tag: 'h3', content: 'Card title', className: 'font-semibold' }
    },
    description: {
      type: 'text',
      props: { tag: 'p', content: 'Card description', className: 'text-muted-foreground' }
    },
    image: {
      type: 'image',
      props: { src: 'https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&w=400&q=80', alt: 'Card image' }
    }
  },
  inspector: {
    fields: [
      {
        key: 'title',
        label: 'Title (fallback)',
        type: 'text',
        placeholder: 'Card title'
      },
      {
        key: 'description',
        label: 'Description (fallback)',
        type: 'text',
        placeholder: 'Card description'
      },
      {
        key: 'imageUrl',
        label: 'Image URL (fallback)',
        type: 'text',
        placeholder: 'https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&w=400&q=80'
      },
      {
        key: 'className',
        label: 'CSS Classes',
        type: 'text'
      }
    ]
  }
};
