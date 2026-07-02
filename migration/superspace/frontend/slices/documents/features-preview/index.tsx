/**
 * Documents Feature Preview
 * 
 * Uses the REAL DocumentsView layout structure with mock data
 * to show an authentic document management experience
 */

"use client"

import * as React from 'react'
import { FileText, Globe, Lock } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { defineFeaturePreview } from '@/frontend/shared/preview'
import type { FeaturePreviewProps } from '@/frontend/shared/preview'
import { DocumentsView } from '../components'
import type { DocumentRecord } from '../components'

// Mock Data Types
interface DocumentsMockData {
  documents: DocumentRecord[]
}

function DocumentsPreview({ mockData, compact }: FeaturePreviewProps) {
  const data = mockData.data as unknown as DocumentsMockData

  if (compact) {
    return (
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <FileText className="h-4 w-4 text-primary" />
            <span className="text-sm font-medium">Documents</span>
          </div>
          <Badge variant="secondary">{data.documents.length} docs</Badge>
        </div>
        {data.documents.slice(0, 3).map((doc) => (
          <div key={doc._id} className="flex items-center gap-2 p-2 bg-muted/50 rounded-md">
            <FileText className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm truncate flex-1">{doc.title}</span>
            {doc.isPublic ? (
              <Globe className="h-3 w-3 text-green-500" />
            ) : (
              <Lock className="h-3 w-3 text-muted-foreground" />
            )}
          </div>
        ))}
      </div>
    )
  }

  return (
    <div className="flex flex-col h-full border rounded-xl overflow-hidden bg-background document-preview-container">
      <DocumentsView
        workspaceId={null}
        mockData={data.documents}
      />
    </div>
  )
}

// Generate proper mock records
const now = Date.now();
const day = 24 * 60 * 60 * 1000;

const mockDocuments: DocumentRecord[] = [
  {
    _id: "doc-1" as any,
    title: 'Getting Started',
    isPublic: true,
    parentId: null,
    workspaceId: "ws-1" as any,
    createdBy: "user-1" as any,
    _creationTime: now - 30 * day,
    lastModified: now - 2 * 60 * 60 * 1000,
    author: { name: 'Alice Johnson' },
    tags: ['onboarding', 'guide'],
    content: 'Welcome to the documentation! This guide will help you get started with our platform.'
  },
  {
    _id: "doc-2" as any,
    title: 'API Documentation',
    isPublic: true,
    parentId: null,
    workspaceId: "ws-1" as any,
    createdBy: "user-2" as any,
    _creationTime: now - 20 * day,
    lastModified: now - day,
    author: { name: 'Bob Smith' },
    tags: ['api', 'technical'],
    content: 'This section contains the complete API reference for our platform.'
  },
  {
    _id: "doc-3" as any,
    title: 'Authentication',
    isPublic: true,
    parentId: "doc-2" as any,
    workspaceId: "ws-1" as any,
    createdBy: "user-2" as any,
    _creationTime: now - 19 * day,
    lastModified: now - 3 * day,
    author: { name: 'Bob Smith' },
    tags: ['api', 'auth'],
  },
  {
    _id: "doc-4" as any,
    title: 'Users API',
    isPublic: true,
    parentId: "doc-2" as any,
    workspaceId: "ws-1" as any,
    createdBy: "user-2" as any,
    _creationTime: now - 18 * day,
    lastModified: now - 7 * day,
    author: { name: 'Bob Smith' },
    tags: ['api', 'users'],
  },
  {
    _id: "doc-5" as any,
    title: 'Internal Notes',
    isPublic: false,
    parentId: null,
    workspaceId: "ws-1" as any,
    createdBy: "user-3" as any,
    _creationTime: now - 5 * day,
    lastModified: now - 60 * 60 * 1000,
    author: { name: 'Charlie Brown' },
    tags: ['internal', 'notes'],
    content: 'These are private notes for the team...'
  },
  {
    _id: "doc-6" as any,
    title: 'Product Roadmap',
    isPublic: false,
    parentId: null,
    workspaceId: "ws-1" as any,
    createdBy: "user-4" as any,
    _creationTime: now - 15 * day,
    lastModified: now - 5 * 60 * 60 * 1000,
    author: { name: 'Diana Ross' },
    tags: ['roadmap', 'planning'],
  },
  {
    _id: "doc-7" as any,
    title: 'Changelog',
    isPublic: true,
    parentId: null,
    workspaceId: "ws-1" as any,
    createdBy: "user-5" as any,
    _creationTime: now - 60 * day,
    lastModified: now,
    author: { name: 'Eve Wilson' },
    tags: ['changelog', 'updates'],
  },
];

// Register the preview
export default defineFeaturePreview({
  featureId: 'documents',
  name: 'Documents',
  description: 'Rich document editor with tree navigation',
  component: DocumentsPreview,
  category: 'productivity',
  tags: ['documents', 'editor', 'notes', 'writing', 'wiki'],
  mockDataSets: [
    {
      id: 'default',
      name: 'Documentation',
      description: 'Sample documentation structure',
      data: {
        documents: mockDocuments
      },
    },
  ],
})
