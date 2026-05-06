/**
 * Templates Gallery
 * 
 * UI component to browse and import workflow templates.
 * Supports both click-to-import and drag-and-drop.
 */

import React, { useState } from 'react';
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Button, Card, Input } from '@/components/ui';
import {
    Webhook,
    Clock,
    Bot,
    MessageSquare,
    Database,
    Search,
    ChevronRight,
    Sparkles,
    GripVertical,
    Calendar,
    Plug,
    Users,
    CheckSquare,
} from 'lucide-react';
import { cn } from '@/frontend/shared/foundation';
import { useDnD } from '@/frontend/shared/builder/canvas/core/DnDProvider';
// import { workflowTemplates, type WorkflowTemplate } from '../workflow/templates'; // Deprecated static templates

interface TemplatesGalleryProps {
    onImport: (template: any) => void;
}

// Match actual template categories from types.ts
const categoryIcons: Record<string, React.ElementType> = {
    calendar: Calendar,
    crm: Users,
    tasks: CheckSquare,
    communications: MessageSquare,
    data: Database,
    integration: Plug,
    ai: Bot,
};

const categoryColors: Record<string, string> = {
    calendar: 'text-blue-500 bg-blue-500/10',
    crm: 'text-green-500 bg-green-500/10',
    tasks: 'text-purple-500 bg-purple-500/10',
    communications: 'text-orange-500 bg-orange-500/10',
    data: 'text-cyan-500 bg-cyan-500/10',
    integration: 'text-pink-500 bg-pink-500/10',
    ai: 'text-yellow-500 bg-yellow-500/10',
};

export const TemplatesGallery: React.FC<TemplatesGalleryProps> = ({ onImport }) => {
    const [search, setSearch] = useState('');
    const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
    const [, setDnDType] = useDnD();

    // Fetch templates from backend
    const templates = useQuery(api.features.studio.templates.listTemplates, {
        category: selectedCategory || undefined
    }) || [];

    const categories = ['calendar', 'data', 'integration', 'ai', 'crm', 'tasks', 'communications'];

    const filteredTemplates = templates.filter((t: any) => {
        const matchesSearch = search === '' ||
            t.name.toLowerCase().includes(search.toLowerCase()) ||
            t.description.toLowerCase().includes(search.toLowerCase());
            // t.tags.some(tag => tag.toLowerCase().includes(search.toLowerCase())); // Tags might not be on backend template yet

        return matchesSearch;
    });

    const handleDragStart = (event: React.DragEvent, template: any) => {
        // Set DnD context
        setDnDType(`template:${template._id}`);

        // Set drag data
        event.dataTransfer.setData('text/plain', `template:${template._id}`);
        event.dataTransfer.setData('application/json', JSON.stringify({
            type: 'template',
            templateId: template._id,
            template: template,
        }));
        event.dataTransfer.effectAllowed = 'copy';
    };

    return (
        <div className="h-full flex flex-col">
            {/* Header */}
            <div className="p-3 border-b border-border space-y-3">
                <div className="flex items-center gap-2">
                    <Sparkles className="h-4 w-4 text-primary" />
                    <span className="text-sm font-semibold">Templates</span>
                </div>
                <div className="relative">
                    <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        placeholder="Search templates..."
                        className="pl-8 h-8"
                    />
                </div>
            </div>

            {/* Category Filters */}
            <div className="px-3 py-2 flex gap-1.5 flex-wrap border-b border-border">
                <Button
                    variant={selectedCategory === null ? 'default' : 'ghost'}
                    size="sm"
                    className="h-7 text-xs"
                    onClick={() => setSelectedCategory(null)}
                >
                    All
                </Button>
                {categories.map(cat => {
                    const Icon = categoryIcons[cat];
                    return (
                        <Button
                            key={cat}
                            variant={selectedCategory === cat ? 'default' : 'ghost'}
                            size="sm"
                            className="h-7 text-xs"
                            onClick={() => setSelectedCategory(cat)}
                        >
                            <Icon className="h-3 w-3 mr-1" />
                            {cat.charAt(0).toUpperCase() + cat.slice(1)}
                        </Button>
                    );
                })}
            </div>

            {/* Templates List */}
            <div className="flex-1 overflow-y-auto p-3 space-y-2">
                {filteredTemplates.length === 0 ? (
                    <div className="text-sm text-muted-foreground text-center py-8">
                        No templates found
                    </div>
                ) : (
                    filteredTemplates.map(template => {
                        const Icon = categoryIcons[template.category] || Database;
                        const colorClass = categoryColors[template.category] || 'text-gray-500 bg-gray-500/10';
                        const tags = Array.isArray((template as any).tags) ? (template as any).tags : [];
                        const nodeCount =
                            Array.isArray((template as any).nodes)
                                ? (template as any).nodes.length
                                : Array.isArray((template as any).definition?.nodes)
                                    ? (template as any).definition.nodes.length
                                    : 0;

                        return (
                            <Card
                                key={String(template._id)}
                                draggable
                                onDragStart={(e) => handleDragStart(e, template)}
                                className={cn(
                                    "p-3 cursor-grab active:cursor-grabbing transition-all group",
                                    "hover:border-primary hover:shadow-sm",
                                    "hover:-translate-y-0.5 active:scale-[0.98]"
                                )}
                                onClick={() => onImport(template)}
                            >
                                <div className="flex items-start gap-3">
                                    {/* Drag Handle */}
                                    <div className="flex flex-col items-center gap-1 pt-1">
                                        <div className={cn("p-2 rounded-md", colorClass)}>
                                            <Icon className="h-4 w-4" />
                                        </div>
                                        <GripVertical className="h-3 w-3 text-muted-foreground opacity-0 group-hover:opacity-100 transition" />
                                    </div>

                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center justify-between">
                                            <h4 className="text-sm font-medium truncate">{template.name}</h4>
                                            <ChevronRight className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition" />
                                        </div>
                                        <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">
                                            {template.description}
                                        </p>
                                        <div className="flex gap-1.5 mt-2 flex-wrap">
                                            {tags.slice(0, 3).map((tag: string) => (
                                                <span
                                                    key={tag}
                                                    className="px-1.5 py-0.5 bg-muted text-[10px] rounded"
                                                >
                                                    {tag}
                                                </span>
                                            ))}
                                            <span className="text-[10px] text-muted-foreground">
                                                {nodeCount} nodes
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </Card>
                        );
                    })
                )}
            </div>

            {/* Help text */}
            <div className="px-3 py-2 border-t border-border bg-muted/30">
                <p className="text-[10px] text-muted-foreground text-center">
                    Click to import or drag onto canvas
                </p>
            </div>
        </div>
    );
};
