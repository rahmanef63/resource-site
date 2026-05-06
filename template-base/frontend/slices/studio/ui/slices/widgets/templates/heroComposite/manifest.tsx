import type { WidgetConfig } from '@/frontend/slices/studio/ui/types';
import { HeroCompositeWidget } from './HeroCompositeWidget';
import React from 'react';

export const heroCompositeManifest: WidgetConfig = {
  label: "Hero Composite",
  category: "Templates",
  description: "A hero section built from other primitive widgets.",
  icon: "GalleryVertical",
  defaults: {
    // Hero Section
    heroBackground: "gray-50",
    heroPadding: "xl",
    heroMaxWidth: "7xl",
    heroClassName: "",
    
    // Copywriting Section
    copywritingGap: "lg",
    copywritingAlign: "start",
    
    // Title
    titleContent: "Build faster with your Super Workspace",
    titleSize: "4xl",
    titleWeight: "bold",
    titleColor: "gray-900",
    
    // Subtitle
    subtitleContent: "Composable widgets, live JSON schema, and modern UI components for rapid development.",
    subtitleSize: "lg",
    subtitleColor: "gray-600",
    
    // CTA Button
    ctaText: "Open Dashboard",
    ctaVariant: "primary",
    ctaSize: "lg",
    ctaHref: "/dashboard",
    
    // Preview Section
    previewAlign: "center",
    
    // Image
    imageUrl: "https://picsum.photos/seed/hero/800/600",
    imageAlt: "Hero preview",
    imageRounded: "lg",
    imageClassName: "w-full h-auto shadow-lg"
  },
  render: (props) => <HeroCompositeWidget {...props} />,
  inspector: {
    fields: [
      // Hero Section
      {
        key: 'heroBackground',
        label: 'Hero Background',
        type: 'select',
        options: ['none', 'white', 'gray-50', 'gray-100', 'gray-200', 'black', 'transparent']
      },
      {
        key: 'heroPadding',
        label: 'Hero Padding',
        type: 'select',
        options: ['none', 'xs', 'sm', 'md', 'lg', 'xl', '2xl']
      },
      {
        key: 'heroMaxWidth',
        label: 'Hero Max Width',
        type: 'select',
        options: ['none', 'xs', 'sm', 'md', 'lg', 'xl', '2xl', '3xl', '4xl', '5xl', '6xl', '7xl', 'full']
      },
      
      // Copywriting Section
      {
        key: 'copywritingGap',
        label: 'Copywriting Gap',
        type: 'select',
        options: ['none', 'xs', 'sm', 'md', 'lg', 'xl', '2xl']
      },
      {
        key: 'copywritingAlign',
        label: 'Copywriting Align',
        type: 'select',
        options: ['start', 'center', 'end']
      },
      
      // Title
      {
        key: 'titleContent',
        label: 'Title Content',
        type: 'textarea',
        placeholder: 'Build faster with your Super Workspace'
      },
      {
        key: 'titleSize',
        label: 'Title Size',
        type: 'select',
        options: ['xs', 'sm', 'base', 'lg', 'xl', '2xl', '3xl', '4xl', '5xl', '6xl', '7xl', '8xl', '9xl']
      },
      {
        key: 'titleWeight',
        label: 'Title Weight',
        type: 'select',
        options: ['thin', 'extralight', 'light', 'normal', 'medium', 'semibold', 'bold', 'extrabold', 'black']
      },
      {
        key: 'titleColor',
        label: 'Title Color',
        type: 'select',
        options: ['inherit', 'current', 'transparent', 'black', 'white', 'gray-50', 'gray-100', 'gray-200', 'gray-300', 'gray-400', 'gray-500', 'gray-600', 'gray-700', 'gray-800', 'gray-900', 'red-500', 'blue-500', 'green-500', 'yellow-500', 'purple-500', 'pink-500', 'indigo-500']
      },
      
      // Subtitle
      {
        key: 'subtitleContent',
        label: 'Subtitle Content',
        type: 'textarea',
        placeholder: 'Composable widgets, live JSON schema, and modern UI components for rapid development.'
      },
      {
        key: 'subtitleSize',
        label: 'Subtitle Size',
        type: 'select',
        options: ['xs', 'sm', 'base', 'lg', 'xl', '2xl', '3xl', '4xl', '5xl', '6xl', '7xl', '8xl', '9xl']
      },
      {
        key: 'subtitleColor',
        label: 'Subtitle Color',
        type: 'select',
        options: ['inherit', 'current', 'transparent', 'black', 'white', 'gray-50', 'gray-100', 'gray-200', 'gray-300', 'gray-400', 'gray-500', 'gray-600', 'gray-700', 'gray-800', 'gray-900', 'red-500', 'blue-500', 'green-500', 'yellow-500', 'purple-500', 'pink-500', 'indigo-500']
      },
      
      // CTA Button
      {
        key: 'ctaText',
        label: 'CTA Text',
        type: 'text',
        placeholder: 'Open Dashboard'
      },
      {
        key: 'ctaVariant',
        label: 'CTA Variant',
        type: 'select',
        options: ['default', 'primary', 'secondary', 'destructive', 'outline', 'ghost', 'link']
      },
      {
        key: 'ctaSize',
        label: 'CTA Size',
        type: 'select',
        options: ['xs', 'sm', 'md', 'lg', 'xl']
      },
      {
        key: 'ctaHref',
        label: 'CTA Link',
        type: 'text',
        placeholder: '/dashboard'
      },
      
      // Preview Section
      {
        key: 'previewAlign',
        label: 'Preview Align',
        type: 'select',
        options: ['start', 'center', 'end']
      },
      
      // Image
      {
        key: 'imageUrl',
        label: 'Image URL',
        type: 'text',
        placeholder: 'https://picsum.photos/seed/hero/800/600'
      },
      {
        key: 'imageAlt',
        label: 'Image Alt Text',
        type: 'text',
        placeholder: 'Hero preview'
      },
      {
        key: 'imageRounded',
        label: 'Image Rounded',
        type: 'select',
        options: ['none', 'sm', 'md', 'lg', 'xl', '2xl', '3xl', 'full']
      },
      {
        key: 'imageClassName',
        label: 'Image CSS Classes',
        type: 'text',
        placeholder: 'w-full h-auto shadow-lg'
      },
      
      // Hero Section Classes
      {
        key: 'heroClassName',
        label: 'Hero CSS Classes',
        type: 'text',
        placeholder: 'Additional CSS classes'
      }
    ]
  }
};
