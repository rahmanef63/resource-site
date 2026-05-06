import type { WidgetConfig, InspectorField } from '@/frontend/slices/studio/ui/types';
import React from 'react';
import { Link2 } from 'lucide-react';

// SSOT: Link widget component
const LinkWidget: React.FC<{
    text: string;
    label?: string;
    href: string;
    target: string;
    variant: string;
    className: string;
    children?: React.ReactNode;
}> = ({ text, label, href, target, variant, className, children }) => {
    const variantStyles = {
        default: 'text-primary hover:underline',
        muted: 'text-muted-foreground hover:text-foreground',
        button: 'inline-flex items-center justify-center px-4 py-2 rounded-md bg-primary text-primary-foreground hover:bg-primary/90',
        ghost: 'hover:bg-muted px-2 py-1 rounded-md',
        underline: 'underline underline-offset-4 hover:text-primary',
    };

    return (
        <a
            href={href || '#'}
            target={target}
            rel={target === '_blank' ? 'noopener noreferrer' : undefined}
            className={`transition-colors ${variantStyles[variant as keyof typeof variantStyles] || variantStyles.default} ${className}`}
        >
            {React.Children.count(children) > 0 ? children : (label || text || 'Link')}
        </a>
    );
};

const linkInspectorConfig: InspectorField[] = [
    {
        key: 'text',
        label: 'Link Text',
        type: 'text',
        placeholder: 'Click here',
    },
    {
        key: 'href',
        label: 'URL',
        type: 'text',
        placeholder: 'https://example.com',
    },
    {
        key: 'target',
        label: 'Open In',
        type: 'select',
        options: ['_self', '_blank'],
    },
    {
        key: 'variant',
        label: 'Style',
        type: 'select',
        options: ['default', 'muted', 'button', 'ghost', 'underline'],
    },
];

export const linkManifest: WidgetConfig = {
    label: 'Link',
    category: 'Navigation',
    description: 'A hyperlink for navigation between pages.',
    icon: Link2,
    tags: ['navigation', 'anchor', 'href', 'link'],
    defaults: {
        text: 'Click here',
        label: '',
        href: '#',
        target: '_self',
        variant: 'default',
        className: '',
    },
    render: (props, children) => <LinkWidget {...(props as any)}>{children}</LinkWidget>,
    inspector: {
        fields: linkInspectorConfig,
    },
};
