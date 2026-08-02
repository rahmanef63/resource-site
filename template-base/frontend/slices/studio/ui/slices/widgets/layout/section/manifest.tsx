import type { WidgetConfig } from '@/frontend/slices/studio/ui/types';
import { SectionWidget } from './SectionWidget';
import { createCustomField, createInspectorFieldGroups, combineFields } from '@/frontend/slices/studio/ui/inspector/standardFields';
import { resolveWidgetIcon } from '@/frontend/slices/studio/ui/utils/iconUtils';
import React from 'react';

export const sectionManifest: WidgetConfig = {
  label: "Section",
  category: "Layout",
  description: "A flexible section container with routing capabilities.",
  icon: resolveWidgetIcon(undefined, 'Layout', 'section'),
  defaults: {
    name: "Section",
    path: "/", // Add path property for routing
    tag: "section",
    display: "block",
    direction: "row",
    justify: "start",
    align: "start",
    wrap: "nowrap",
    gap: "none",
    padding: "none",
    margin: "none",
    width: "auto",
    height: "auto",
    maxWidth: "none",
    background: "none",
    backgroundImage: "",
    backgroundSize: "cover",
    backgroundPosition: "center",
    backgroundRepeat: "no-repeat",
    border: false,
    borderColor: "gray-200",
    borderWidth: "1",
    borderStyle: "solid",
    rounded: "none",
    shadow: "none",
    position: "static",
    zIndex: "auto",
    overflow: "visible",
    opacity: "100",
    className: ""
  },
  render: (props, children) => <SectionWidget {...props}>{children}</SectionWidget>,
  autoConnect: {
    text: {
      type: 'text',
      props: { tag: 'p', content: 'Section content', className: 'text-muted-foreground' }
    },
    button: {
      type: 'button',
      props: { text: 'Action Button', variant: 'primary' }
    },
    image: {
      type: 'image',
      props: { src: 'https://picsum.photos/400/300', alt: 'Section image' }
    }
  },
  inspector: {
    fields: combineFields(
      [
        createCustomField({
          key: 'name',
          label: 'Section Name',
          type: 'text',
          placeholder: 'Section'
        }),
        createCustomField({
          key: 'path',
          label: 'Route Path',
          type: 'text',
          placeholder: '/'
        }),
        createCustomField({
          key: 'tag',
          label: 'HTML Tag',
          type: 'select',
          options: ['div', 'section', 'article', 'aside', 'header', 'footer', 'main', 'nav']
        }),
      ],
      createInspectorFieldGroups.layout()
    )
  }
};
