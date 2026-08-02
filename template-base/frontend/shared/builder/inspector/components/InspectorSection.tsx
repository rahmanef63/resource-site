import React, { useState } from 'react';
import { ChevronDown, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';

interface InspectorSectionProps {
    title: string;
    icon?: React.ReactNode | React.ComponentType<{ className?: string }>;
    defaultOpen?: boolean;
    children: React.ReactNode;
    className?: string;
    id?: string;
    /** Optional badge count shown in the header */
    badge?: number | string;
    /** Optional hint text shown when section is collapsed */
    hint?: string;
}

/**
 * Collapsible section for the inspector panel
 * Matches professional UI reference design
 */
export function InspectorSection({
    title,
    icon,
    defaultOpen = true,
    children,
    className,
    badge,
    hint,
}: InspectorSectionProps) {
    const [isOpen, setIsOpen] = useState(defaultOpen);

    // Render icon - handles both ReactNode and ComponentType
    const renderIcon = () => {
        if (!icon) return null;

        // Check if it's a component (function, class, or forwardRef)
        // forwardRef components have $$typeof property and render function
        if (typeof icon === 'function' || (typeof icon === 'object' && icon !== null && 'render' in icon)) {
            const IconComponent = icon as React.ComponentType<{ className?: string }>;
            return <IconComponent className="h-3.5 w-3.5" />;
        }

        // Otherwise it's a ReactNode, render directly
        return icon;
    };

    return (
        <div className={cn('border-b border-border/50', className)}>
            {/* Section Header */}
            <button
                type="button"
                onClick={() => setIsOpen(!isOpen)}
                className="w-full flex items-center gap-2 px-4 py-2.5 hover:bg-muted/40 active:bg-muted/60 transition-colors text-left group"
            >
                <ChevronDown
                    className={cn(
                        'h-3 w-3 text-muted-foreground shrink-0 transition-transform duration-200',
                        !isOpen && '-rotate-90'
                    )}
                />
                {icon && <span className="text-muted-foreground">{renderIcon()}</span>}
                <span className="text-sm font-medium text-foreground flex-1">{title}</span>
                {/* Badge */}
                {badge !== undefined && (
                    <span className="text-[9px] bg-muted px-1.5 py-0.5 rounded text-muted-foreground font-mono">
                        {badge}
                    </span>
                )}
                {/* Collapsed hint */}
                {!isOpen && hint && (
                    <span className="text-[10px] text-muted-foreground/50 truncate max-w-[80px]">{hint}</span>
                )}
            </button>

            {/* Section Content — animated */}
            {isOpen && (
                <div className="px-4 pb-3 space-y-3 animate-in fade-in-0 slide-in-from-top-1 duration-150">
                    {children}
                </div>
            )}
        </div>
    );
}

/**
 * Subsection with colored label (like "Margin", "Padding")
 */
interface InspectorSubsectionProps {
    label: string;
    color?: 'blue' | 'orange' | 'green' | 'purple' | 'default';
    children: React.ReactNode;
}

const LABEL_COLORS = {
    blue: 'text-blue-500',
    orange: 'text-orange-500',
    green: 'text-green-500',
    purple: 'text-purple-500',
    default: 'text-muted-foreground',
};

export function InspectorSubsection({ label, color = 'default', children }: InspectorSubsectionProps) {
    return (
        <div className="space-y-2">
            <span className={cn('text-xs font-medium', LABEL_COLORS[color])}>
                {label}
            </span>
            {children}
        </div>
    );
}

/**
 * Two-column row for related inputs
 */
interface InspectorRowProps {
    children: React.ReactNode;
    className?: string;
}

export function InspectorRow({ children, className }: InspectorRowProps) {
    return (
        <div className={cn('grid grid-cols-2 gap-2', className)}>
            {children}
        </div>
    );
}

/**
 * Four-column row for margin/padding (top, right, bottom, left)
 */
export function InspectorFourRow({ children, className }: InspectorRowProps) {
    return (
        <div className={cn('grid grid-cols-4 gap-1.5', className)}>
            {children}
        </div>
    );
}

/**
 * Input with icon prefix
 */
interface InspectorInputProps {
    icon?: React.ReactNode;
    value: string | number;
    onChange: (value: string) => void;
    placeholder?: string;
    type?: 'text' | 'number';
    className?: string;
}

export function InspectorInput({
    icon,
    value,
    onChange,
    placeholder,
    type = 'text',
    className,
}: InspectorInputProps) {
    return (
        <div className={cn(
            'flex items-center gap-1.5 px-2.5 py-1.5 rounded-md border border-border/50 bg-background',
            'focus-within:ring-1 focus-within:ring-ring focus-within:border-ring',
            className
        )}>
            {icon && <span className="text-muted-foreground shrink-0">{icon}</span>}
            <input
                type={type}
                value={value}
                onChange={(e) => onChange(e.target.value)}
                placeholder={placeholder}
                className="w-full bg-transparent text-sm outline-none placeholder:text-muted-foreground/50"
            />
        </div>
    );
}

/**
 * Select dropdown matching the reference design
 */
interface InspectorSelectProps {
    icon?: React.ReactNode;
    value: string;
    onChange: (value: string) => void;
    options: Array<{ value: string; label: string }> | string[];
    placeholder?: string;
    className?: string;
}

export function InspectorSelect({
    icon,
    value,
    onChange,
    options,
    placeholder,
    className,
}: InspectorSelectProps) {
    return (
        <div className={cn(
            'flex items-center gap-1.5 px-2.5 py-1.5 rounded-md border border-border/50 bg-background',
            'focus-within:ring-1 focus-within:ring-ring',
            className
        )}>
            {icon && <span className="text-muted-foreground shrink-0">{icon}</span>}
            <select
                value={value}
                onChange={(e) => onChange(e.target.value)}
                className="w-full bg-transparent text-sm outline-none appearance-none cursor-pointer"
            >
                {placeholder && <option value="">{placeholder}</option>}
                {options.map((opt) => {
                    const optValue = typeof opt === 'string' ? opt : opt.value;
                    const optLabel = typeof opt === 'string' ? opt : opt.label;
                    return (
                        <option key={optValue} value={optValue}>
                            {optLabel}
                        </option>
                    );
                })}
            </select>
            <ChevronDown className="h-3 w-3 text-muted-foreground shrink-0" />
        </div>
    );
}

/**
 * Button group for toggling options (alignment, decoration, etc.)
 */
interface InspectorButtonGroupProps {
    options: Array<{
        value: string;
        icon: React.ReactNode;
        label?: string;
    }>;
    value: string;
    onChange: (value: string) => void;
    allowEmpty?: boolean;
    className?: string;
}

export function InspectorButtonGroup({
    options,
    value,
    onChange,
    allowEmpty = true,
    className,
}: InspectorButtonGroupProps) {
    return (
        <div className={cn('flex border border-border/50 rounded-md overflow-hidden', className)}>
            {options.map((opt, idx) => (
                <button
                    key={opt.value}
                    type="button"
                    onClick={() => {
                        if (value === opt.value && allowEmpty) {
                            onChange('');
                        } else {
                            onChange(opt.value);
                        }
                    }}
                    className={cn(
                        'flex-1 flex items-center justify-center p-2 hover:bg-muted/50 transition-colors',
                        idx > 0 && 'border-l border-border/50',
                        value === opt.value && 'bg-muted text-foreground',
                        value !== opt.value && 'text-muted-foreground'
                    )}
                    title={opt.label}
                >
                    {opt.icon}
                </button>
            ))}
        </div>
    );
}

/**
 * Color picker matching reference design
 */
interface InspectorColorPickerProps {
    value: string;
    onChange: (value: string) => void;
    label?: string;
}

export function InspectorColorPicker({ value, onChange, label }: InspectorColorPickerProps) {
    return (
        <div className="flex items-center gap-2 px-2.5 py-1.5 rounded-md border border-border/50 bg-background">
            <div
                className="w-4 h-4 rounded border border-border/50 shrink-0"
                style={{ backgroundColor: value || '#000000' }}
            />
            <input
                type="color"
                value={value || '#000000'}
                onChange={(e) => onChange(e.target.value)}
                className="sr-only"
                id={`color-${label}`}
            />
            <label
                htmlFor={`color-${label}`}
                className="flex-1 text-sm cursor-pointer truncate"
            >
                {label || value || 'Default'}
            </label>
            <ChevronDown className="h-3 w-3 text-muted-foreground shrink-0" />
        </div>
    );
}
