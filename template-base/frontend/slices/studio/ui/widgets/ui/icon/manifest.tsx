import type { WidgetConfig, InspectorField } from '@/frontend/slices/studio/ui/types';
import React from 'react';
import { LucideIcon, Image as ImageIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

interface IconWidgetProps {
  name?: string;
  size?: number | string;
  color?: string;
  fill?: boolean;
  weight?: number;
  grade?: number;
  variant?: 'outlined' | 'rounded' | 'sharp';
  
  // Dynamic Button/Boxed properties
  mode?: 'plain' | 'boxed' | 'ghost';
  bgColor?: string;
  rounded?: 'none' | 'sm' | 'md' | 'lg' | 'xl' | 'full';
  padding?: 'none' | 'xs' | 'sm' | 'md' | 'lg';
  cursor?: 'default' | 'pointer';
  
  className?: string;
  style?: React.CSSProperties;
}

/**
 * SSOT: Dynamic Symbol Widget
 * Merges the concepts of Icon and IconButton into a single flexible engine.
 * Supports Material Symbols with full variable font control and boxed/button modes.
 */
const IconWidget: React.FC<IconWidgetProps> = ({
  name = 'bolt',
  size = 24,
  color = 'currentColor',
  fill = false,
  weight = 400,
  grade = 0,
  variant = 'outlined',
  
  mode = 'plain',
  bgColor = '',
  rounded = 'md',
  padding = 'sm',
  cursor = 'default',
  
  className = '',
  style = {},
}) => {
  const fontVariationSettings = `'FILL' ${fill ? 1 : 0}, 'wght' ${weight}, 'GRAD' ${grade}, 'opsz' ${
    typeof size === 'number' ? size : 24
  }`;

  const variantClass = 
    variant === 'rounded' ? 'material-symbols-rounded' :
    variant === 'sharp' ? 'material-symbols-sharp' : 'material-symbols-outlined';

  // Base classes for the container
  const containerClasses = [
    'select-none inline-flex items-center justify-center transition-all',
    cursor === 'pointer' ? 'cursor-pointer active:scale-95 hover:opacity-80' : '',
    mode === 'boxed' ? 'border shadow-sm' : '',
    mode === 'ghost' ? 'hover:bg-accent hover:text-accent-foreground' : '',
    rounded !== 'none' ? `rounded-${rounded}` : '',
    padding === 'none' ? '' : 
    padding === 'xs' ? 'p-1' :
    padding === 'sm' ? 'p-2' :
    padding === 'md' ? 'p-3' : 'p-4',
    className
  ].filter(Boolean).join(' ');

  const containerStyle: React.CSSProperties = {
    backgroundColor: bgColor || (mode === 'boxed' ? 'var(--background)' : 'transparent'),
    borderColor: mode === 'boxed' ? 'var(--border)' : 'transparent',
    cursor,
    ...style
  };

  const iconStyle: React.CSSProperties = {
    fontSize: typeof size === 'number' ? `${size}px` : size,
    color: color === 'inherit' ? undefined : color,
    fontVariationSettings,
    lineHeight: 1,
    width: '1em',
    height: '1em',
  };

  if (mode === 'plain') {
    return (
      <span
        className={cn(
          variantClass,
          'select-none inline-block align-middle',
          cursor === 'pointer' ? 'cursor-pointer active:scale-95 hover:opacity-80 transition-all' : '',
          className,
        )}
        style={{ ...iconStyle, ...style }}
        aria-hidden="true"
      >
        {name}
      </span>
    );
  }

  return (
    <span className={containerClasses} style={containerStyle}>
      <span className={variantClass} style={iconStyle} aria-hidden="true">
        {name}
      </span>
    </span>
  );
};

const iconInspectorConfig: InspectorField[] = [
  {
    key: 'name',
    label: 'Symbol Name',
    type: 'text',
    placeholder: 'search, settings, person...',
  },
  {
    key: 'size',
    label: 'Size (px)',
    type: 'number',
  },
  {
    key: 'color',
    label: 'Icon Color',
    type: 'color',
  },
  {
    key: 'variant',
    label: 'Symbol Variant',
    type: 'select',
    options: ['outlined', 'rounded', 'sharp'],
  },
  {
    key: 'fill',
    label: 'Fill (Solid)',
    type: 'switch',
  },
  {
    key: 'mode',
    label: 'Display Mode',
    type: 'select',
    options: ['plain', 'boxed', 'ghost'],
  },
  {
    key: 'bgColor',
    label: 'Background Color',
    type: 'color',
  },
  {
    key: 'rounded',
    label: 'Corner Radius',
    type: 'select',
    options: ['none', 'sm', 'md', 'lg', 'xl', 'full'],
  },
  {
    key: 'padding',
    label: 'Padding',
    type: 'select',
    options: ['none', 'xs', 'sm', 'md', 'lg'],
  },
  {
    key: 'cursor',
    label: 'Interaction',
    type: 'select',
    options: ['default', 'pointer'],
  },
  {
    key: 'weight',
    label: 'Weight',
    type: 'select',
    options: ['100', '200', '300', '400', '500', '600', '700'],
  },
];

export const iconManifest: WidgetConfig = {
  label: 'Icon (Symbol)',
  category: 'UI',
  description: 'A dynamic Material Symbol with full variable font and interaction support.',
  icon: ImageIcon as LucideIcon,
  tags: ['ui', 'icon', 'symbol', 'graphic', 'button'],
  defaults: {
    name: 'bolt',
    size: 24,
    color: 'inherit',
    fill: false,
    weight: 400,
    grade: 0,
    variant: 'outlined',
    mode: 'plain',
    rounded: 'md',
    padding: 'none',
    cursor: 'default',
    className: '',
  },
  render: (props) => <IconWidget {...(props as any)} />,
  inspector: {
    fields: iconInspectorConfig,
  },
};
