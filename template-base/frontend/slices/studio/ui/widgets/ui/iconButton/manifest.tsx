import type { WidgetConfig, InspectorField } from '@/frontend/slices/studio/ui/types';
import React from 'react';
import { MousePointer2 } from 'lucide-react';

// SSOT: Icon button styles
const ICON_BUTTON_SIZES = {
    sm: 'h-8 w-8',
    md: 'h-10 w-10',
    lg: 'h-12 w-12',
} as const;

const ICON_SIZES = {
    sm: 16,
    md: 20,
    lg: 24,
} as const;

const ICON_BUTTON_STYLES = {
    default: 'bg-primary text-primary-foreground hover:bg-primary/90',
    outline: 'border border-input hover:bg-accent hover:text-accent-foreground',
    ghost: 'hover:bg-accent hover:text-accent-foreground',
    destructive: 'bg-destructive text-destructive-foreground hover:bg-destructive/90',
    secondary: 'bg-secondary text-secondary-foreground hover:bg-secondary/80',
} as const;

// Icon Button Widget Component
const IconButtonWidget: React.FC<any> = ({
    icon = 'âš¡',
    size = 'md',
    variant = 'default',
    label = 'Action',
    disabled = false,
    className = ''
}) => {
    const sizeClass = ICON_BUTTON_SIZES[size as keyof typeof ICON_BUTTON_SIZES] || ICON_BUTTON_SIZES.md;
    const iconSize = ICON_SIZES[size as keyof typeof ICON_SIZES] || ICON_SIZES.md;
    const variantClass = ICON_BUTTON_STYLES[variant as keyof typeof ICON_BUTTON_STYLES] || ICON_BUTTON_STYLES.default;

    return (
        <button
            type="button"
            disabled={disabled}
            aria-label={label}
            title={label}
            className={`
                inline-flex items-center justify-center rounded-md
                transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring
                disabled:pointer-events-none disabled:opacity-50
                ${sizeClass} ${variantClass} ${className}
            `}
        >
            <span style={{ fontSize: iconSize }}>{icon || 'âš¡'}</span>
        </button>
    );
};

const iconButtonInspectorConfig: InspectorField[] = [
    {
        key: 'icon',
        label: 'Icon (emoji or text)',
        type: 'text',
        placeholder: 'âš¡',
    },
    {
        key: 'label',
        label: 'Aria Label',
        type: 'text',
        placeholder: 'Button description',
    },
    {
        key: 'size',
        label: 'Size',
        type: 'select',
        options: ['sm', 'md', 'lg'],
    },
    {
        key: 'variant',
        label: 'Style',
        type: 'select',
        options: ['default', 'outline', 'ghost', 'destructive', 'secondary'],
    },
    {
        key: 'disabled',
        label: 'Disabled',
        type: 'switch',
    },
];

export const iconButtonManifest: WidgetConfig = {
    label: 'Icon Button',
    category: 'Action',
    description: 'A compact button with just an icon, perfect for toolbars.',
    icon: MousePointer2,
    tags: ['action', 'button', 'icon', 'toolbar'],
    defaults: {
        icon: 'âš¡',
        size: 'md',
        variant: 'default',
        label: 'Action',
        disabled: false,
        className: '',
    },
    render: (props) => <IconButtonWidget {...(props as any)} />,
    inspector: {
        fields: iconButtonInspectorConfig,
    },
};

