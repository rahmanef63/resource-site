/**
 * Content Feature Types
 * Shared interfaces for Dashboard and Preview
 */

export interface ContentStats {
    totalItems: number
    published: number
    drafts: number
    scheduled: number
    views: number
}

export interface ContentItem {
    id: string
    title: string
    type: 'article' | 'page' | 'video' | 'image'
    author: string
    status: 'published' | 'draft' | 'scheduled' | 'archived'
    publishedAt?: string
    views: number
}

export interface ContentData {
    stats: ContentStats
    recentContent: ContentItem[]
}
