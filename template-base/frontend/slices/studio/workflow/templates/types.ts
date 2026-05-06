/**
 * Template Types
 * 
 * Shared types for workflow templates
 */

export interface TemplateNode {
    id: string;
    position: { x: number; y: number };
    data: {
        type: string;
        category?: string;
        props?: Record<string, any>;
    };
}

export interface TemplateEdge {
    id: string;
    source: string;
    target: string;
}

export type TemplateCategory =
    | 'calendar'
    | 'crm'
    | 'tasks'
    | 'communications'
    | 'data'
    | 'integration'
    | 'ai';

export interface WorkflowTemplate {
    id: string;
    name: string;
    description: string;
    category: TemplateCategory;
    tags: string[];
    nodes: TemplateNode[];
    edges: TemplateEdge[];
}
