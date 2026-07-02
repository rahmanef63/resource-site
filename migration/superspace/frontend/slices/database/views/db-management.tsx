"use client";

import { useMemo } from "react";
import type { Id } from "@convex/_generated/dataModel";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { FileText, Globe, Lock, TableProperties } from "lucide-react";
import {
  DocumentsBrowser,
  CreateDocumentDialog,
  TiptapCanvas,
  useDocumentsManager,
} from "@/frontend/shared/documents";

export interface DocumentsDbManagementViewProps {
  workspaceId: Id<"workspaces">;
  storageKey?: string;
}

export function DocumentsDbManagementView({ workspaceId, storageKey }: DocumentsDbManagementViewProps) {
  const manager = useDocumentsManager({ workspaceId });

  const selectedDocument = useMemo(
    () => manager.documents.find((doc) => doc._id === manager.state.selectedDocumentId),
    [manager.documents, manager.state.selectedDocumentId]
  );

  return (
    <div className="flex h-full bg-muted/20">
      <div className="flex-1 flex flex-col border-r bg-background">
        <div className="p-6 border-b">
          <div className="flex items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl font-semibold text-gray-900">Knowledge Base</h1>
              <p className="text-gray-600">
                Curate structured documents, track visibility, and surface insights at a glance.
              </p>
            </div>
            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              <Badge variant="secondary">{manager.stats.total} documents</Badge>
              <Badge className="bg-green-100 text-green-700 hover:bg-green-100">
                {manager.stats.publicCount} public
              </Badge>
              <Badge className="bg-gray-100 text-gray-700 hover:bg-gray-100">
                {manager.stats.privateCount} private
              </Badge>
            </div>
          </div>
        </div>

        <Tabs defaultValue="table" className="flex-1 flex flex-col">
          <div className="p-4 border-b bg-background">
            <TabsList className="flex w-full justify-evenly">
              <TabsTrigger value="table" className="flex items-center gap-2">
                <TableProperties className="w-4 h-4" /> Table
              </TabsTrigger>
              <TabsTrigger value="gallery" disabled>
                Gallery
              </TabsTrigger>
              <TabsTrigger value="timeline" disabled>
                Timeline
              </TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="table" className="flex-1 overflow-hidden">
            <DocumentsBrowser
              documents={manager.documents}
              filteredDocuments={manager.filteredDocuments}
              isLoading={manager.isLoading}
              onSelect={manager.selectDocument}
              onCreate={manager.openCreateDialog}
              selectedDocumentId={manager.state.selectedDocumentId}
              search={manager.search}
              onSearch={manager.setSearch}
              visibility={manager.visibility}
              onVisibilityChange={manager.setVisibility}
              stats={manager.stats}
              workspaceId={workspaceId}
            />
          </TabsContent>

          <TabsContent value="gallery" className="flex-1 flex flex-col items-center justify-center gap-4 text-muted-foreground">
            <div className="rounded-full bg-muted p-4">
              <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
            <div className="text-center">
              <p className="font-medium text-foreground">Gallery View</p>
              <p className="text-sm">View documents as visual cards</p>
            </div>
          </TabsContent>

          <TabsContent value="timeline" className="flex-1 flex flex-col items-center justify-center gap-4 text-muted-foreground">
            <div className="rounded-full bg-muted p-4">
              <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div className="text-center">
              <p className="font-medium text-foreground">Timeline View</p>
              <p className="text-sm">View documents chronologically</p>
            </div>
          </TabsContent>
        </Tabs>
      </div>

      <aside className="w-[340px] bg-white flex flex-col border-l">
        <div className="p-6 border-b">
          <h2 className="text-lg font-semibold text-gray-900">Inspector</h2>
          <p className="text-sm text-muted-foreground">
            Preview metadata and last activity for the selected document.
          </p>
        </div>

        {selectedDocument ? (
          <ScrollArea className="flex-1">
            <div className="p-6 space-y-6">
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <FileText className="w-4 h-4 text-blue-600" />
                  <h3 className="text-base font-semibold text-gray-900">
                    {selectedDocument.title}
                  </h3>
                </div>
                <p className="text-sm text-muted-foreground">
                  Created {new Date(selectedDocument._creationTime).toLocaleString()}
                </p>
                <Badge variant="outline" className="gap-1">
                  {selectedDocument.isPublic ? (
                    <>
                      <Globe className="w-3 h-3" /> Public
                    </>
                  ) : (
                    <>
                      <Lock className="w-3 h-3" /> Private
                    </>
                  )}
                </Badge>
              </div>

              <Separator />

              <Card>
                <CardContent className="p-0">
                  <TiptapCanvas
                    documentId={selectedDocument._id}
                    content={selectedDocument.content || ""}
                    editable={false}
                  />
                </CardContent>
              </Card>
            </div>
          </ScrollArea>
        ) : (
          <div className="flex-1 flex items-center justify-center text-gray-400 text-sm">
            Select a document to see its details.
          </div>
        )}
      </aside>
    </div>
  );
}
