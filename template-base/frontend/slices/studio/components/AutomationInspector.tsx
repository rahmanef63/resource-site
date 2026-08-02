/**
 * Automation Inspector
 * 
 * Custom inspector for automation nodes that renders
 * node-specific properties with sections, using
 * builder-style InspectorSection components.
 */

import React, { useCallback, useMemo } from 'react';
import { useSharedCanvas } from '@/frontend/shared/builder/canvas/core';
import { useCrossFeatureRegistry } from '@/frontend/shared/foundation';
import { Button, Input, Label, Switch } from '@/components/ui';
import {
    Settings,
    MoreHorizontal,
    ChevronDown,
    ChevronRight,
} from 'lucide-react';
import { cn } from '@/frontend/shared/foundation';
import type { InspectorField } from '@/frontend/shared/foundation';

interface AutomationInspectorProps {
    selectedNode?: any;
}

export const AutomationInspector: React.FC<AutomationInspectorProps> = ({
    selectedNode: propSelectedNode,
}) => {
    const { selectedNode: contextSelectedNode, setNodeProps } = useSharedCanvas();
    const { getComponent } = useCrossFeatureRegistry();

    const selectedNode = propSelectedNode || contextSelectedNode;

    const currentProps = useMemo(() => {
        if (!selectedNode) return {};
        return selectedNode.data.props || {};
    }, [selectedNode?.data.props, selectedNode?.id]);

    const setNestedProp = useCallback((key: string, value: any) => {
        if (!selectedNode) return;
        
        const newProps = { ...currentProps };
        const parts = key.split('.');
        
        if (parts.length === 1) {
            newProps[key] = value;
        } else {
            let current = newProps;
            for (let i = 0; i < parts.length - 1; i++) {
                if (!current[parts[i]]) current[parts[i]] = {};
                current = current[parts[i]];
            }
            current[parts[parts.length - 1]] = value;
        }
        
        setNodeProps(selectedNode.id, newProps);
    }, [selectedNode, currentProps, setNodeProps]);

    const getNestedProp = (obj: any, path: string) => {
        return path.split('.').reduce((acc, part) => acc && acc[part], obj);
    };

    if (!selectedNode) {
        return (
            <div className="h-full flex flex-col items-center justify-center p-6 text-center text-muted-foreground">
                <div className="w-12 h-12 rounded-lg bg-muted/50 flex items-center justify-center mb-3">
                    <Settings className="w-6 h-6 text-muted-foreground/50" />
                </div>
                <p className="text-sm">Select a node to edit its properties.</p>
            </div>
        );
    }

    const nodeType = selectedNode.data.type || selectedNode.data.comp;
    const config = getComponent(nodeType);
    const nodeLabel = config?.label || nodeType;

    // Get inspector configuration
    const inspectorConfig = config?.inspector;
    const fields = inspectorConfig?.fields || [];
    const sections = fields.length > 0
        ? [{ title: 'Properties', fields }]
        : [];

    // Add Retry Configuration Section if not present
    const hasRetryConfig = sections.some((s: any) =>
        s.title === 'Retry Policy' ||
        s.fields?.some((f: InspectorField) => f.key.startsWith('retryConfig.'))
    );
    const enhancedSections = hasRetryConfig ? sections : [
        ...sections,
        {
            title: 'Retry Policy',
            fields: [
                {
                    key: 'retryConfig.maxAttempts',
                    label: 'Max Attempts',
                    type: 'number',
                    defaultValue: 1,
                    description: 'Number of times to retry on failure'
                },
                {
                    key: 'retryConfig.backoffMs',
                    label: 'Backoff (ms)',
                    type: 'number',
                    defaultValue: 1000,
                    description: 'Wait time between retries'
                }
            ]
        }
    ];

    return (
        <div className="h-full flex flex-col overflow-hidden">
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-border">
                <div className="flex items-center gap-2">
                    <span className="text-primary">◇</span>
                    <span className="text-sm font-semibold">{nodeLabel}</span>
                </div>
                <div className="flex items-center gap-1">
                    <Button variant="ghost" size="icon" className="h-7 w-7">
                        <MoreHorizontal className="h-4 w-4" />
                    </Button>
                </div>
            </div>

            {/* Properties - Scrollable */}
            <div className="flex-1 overflow-y-auto">
                {/* Render Sections if available */}
                {enhancedSections.length > 0 ? (
                    enhancedSections.map((section: any, idx: number) => (
                        <InspectorSectionComponent
                            key={section.title || idx}
                            title={section.title}
                            defaultOpen={idx === 0 || section.title === 'Retry Policy'}
                        >
                            {section.fields?.map((field: InspectorField) => (
                                <FieldRenderer
                                    key={field.key}
                                    field={field}
                                    value={getNestedProp(currentProps, field.key) ?? field.defaultValue ?? ''}
                                    onChange={(v) => setNestedProp(field.key, v)}
                                />
                            ))}
                        </InspectorSectionComponent>
                    ))
                ) : fields.length > 0 ? (
                    // Fallback: render fields directly if no sections
                    <div className="p-4 space-y-4">
                        {fields.map((field: InspectorField) => (
                            <FieldRenderer
                                key={field.key}
                                field={field}
                                value={currentProps[field.key] ?? field.defaultValue ?? ''}
                                onChange={(v) => setNestedProp(field.key, v)}
                            />
                        ))}
                    </div>
                ) : (
                    <div className="p-4 text-sm text-muted-foreground">
                        No configurable properties for this node.
                    </div>
                )}
            </div>

            {/* Node Info Footer */}
            <div className="border-t border-border px-4 py-2 bg-muted/30">
                <div className="text-[10px] text-muted-foreground">
                    <span>ID: {selectedNode.id.slice(-8)}</span>
                    {config?.category && (
                        <span className="ml-2">• {config.category}</span>
                    )}
                </div>
            </div>
        </div>
    );
};

// ============================================================================
// Inspector Section Component (collapsible)
// ============================================================================

interface InspectorSectionComponentProps {
    title: string;
    defaultOpen?: boolean;
    children: React.ReactNode;
}

const InspectorSectionComponent: React.FC<InspectorSectionComponentProps> = ({
    title,
    defaultOpen = true,
    children,
}) => {
    const [isOpen, setIsOpen] = React.useState(defaultOpen);

    return (
        <div className="border-b border-border/50">
            <button
                type="button"
                onClick={() => setIsOpen(!isOpen)}
                className="w-full flex items-center gap-2 px-4 py-2.5 hover:bg-muted/50 transition-colors text-left"
            >
                {isOpen ? (
                    <ChevronDown className="h-3 w-3 text-muted-foreground shrink-0" />
                ) : (
                    <ChevronRight className="h-3 w-3 text-muted-foreground shrink-0" />
                )}
                <span className="text-sm font-medium text-foreground">{title}</span>
            </button>
            {isOpen && (
                <div className="px-4 pb-3 space-y-3">
                    {children}
                </div>
            )}
        </div>
    );
};

// ============================================================================
// Field Renderer Component
// ============================================================================

interface FieldRendererProps {
    field: InspectorField;
    value: any;
    onChange: (value: any) => void;
}

const FieldRenderer: React.FC<FieldRendererProps> = ({ field, value, onChange }) => {
    const renderField = () => {
        switch (field.type) {
            case 'text':
                return (
                    <div className={cn(
                        "flex items-center gap-1.5 px-2.5 py-1.5 rounded-md border border-border/50 bg-background",
                        "focus-within:ring-1 focus-within:ring-ring focus-within:border-ring"
                    )}>
                        <input
                            type="text"
                            value={value || ''}
                            onChange={(e) => onChange(e.target.value)}
                            placeholder={field.placeholder || ''}
                            className="w-full bg-transparent text-sm outline-none placeholder:text-muted-foreground/50"
                        />
                    </div>
                );

            case 'number':
                return (
                    <div className={cn(
                        "flex items-center gap-1.5 px-2.5 py-1.5 rounded-md border border-border/50 bg-background",
                        "focus-within:ring-1 focus-within:ring-ring"
                    )}>
                        <input
                            type="number"
                            value={value || ''}
                            onChange={(e) => onChange(e.target.value ? Number(e.target.value) : '')}
                            placeholder={field.placeholder || ''}
                            className="w-full bg-transparent text-sm outline-none placeholder:text-muted-foreground/50"
                        />
                    </div>
                );

            case 'textarea':
                return (
                    <textarea
                        value={value || ''}
                        onChange={(e) => onChange(e.target.value)}
                        placeholder={field.placeholder || ''}
                        className={cn(
                            "w-full min-h-[80px] px-3 py-2 text-sm rounded-md",
                            "border border-border/50 bg-background resize-y",
                            "focus:outline-none focus:ring-1 focus:ring-ring"
                        )}
                    />
                );

            case 'select':
                return (
                    <div className={cn(
                        "flex items-center gap-1.5 px-2.5 py-1.5 rounded-md border border-border/50 bg-background",
                        "focus-within:ring-1 focus-within:ring-ring"
                    )}>
                        <select
                            value={value || ''}
                            onChange={(e) => onChange(e.target.value)}
                            className="w-full bg-transparent text-sm text-foreground outline-none appearance-none cursor-pointer [&>option]:bg-background [&>option]:text-foreground"
                        >
                            <option value="" className="text-muted-foreground">Select...</option>
                            {field.options?.map((opt) => (
                                <option key={opt} value={opt} className="bg-background text-foreground">{opt}</option>
                            ))}
                        </select>
                        <ChevronDown className="h-3 w-3 text-muted-foreground shrink-0" />
                    </div>
                );

            case 'switch':
                return (
                    <div className="flex items-center justify-between py-1">
                        <span className="text-sm text-muted-foreground">
                            {value ? 'Enabled' : 'Disabled'}
                        </span>
                        <Switch
                            checked={!!value}
                            onCheckedChange={onChange}
                        />
                    </div>
                );

            default:
                return (
                    <div className={cn(
                        "flex items-center gap-1.5 px-2.5 py-1.5 rounded-md border border-border/50 bg-background",
                        "focus-within:ring-1 focus-within:ring-ring"
                    )}>
                        <input
                            type="text"
                            value={value || ''}
                            onChange={(e) => onChange(e.target.value)}
                            placeholder={field.placeholder || ''}
                            className="w-full bg-transparent text-sm outline-none placeholder:text-muted-foreground/50"
                        />
                    </div>
                );
        }
    };

    return (
        <div className="space-y-1.5">
            <div className="flex items-center gap-1">
                <Label className="text-xs font-medium">
                    {field.label}
                </Label>
                {field.required && <span className="text-destructive text-xs">*</span>}
            </div>
            {renderField()}
            {field.description && (
                <p className="text-[10px] text-muted-foreground">{field.description}</p>
            )}
        </div>
    );
};
