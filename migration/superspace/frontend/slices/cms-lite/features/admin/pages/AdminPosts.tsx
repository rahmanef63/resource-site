import { useState, useRef } from "react";
import { useBackend, useQuery, api } from "../../../shared/hooks/useBackend";
import Image from "next/image";
import { Button } from "../../../shared/components/Button";
import { EmptyState } from "../../../shared/components/Loading";
import { ErrorState } from "../../../shared/components/ErrorState";
import { SkeletonTable } from "../../../shared/components/Skeleton";
import { PostForm, PostFormData } from "../components/posts/PostForm";
import { AdminList, Column } from "../components/AdminList";
import ImportValidationModal from "../../../shared/components/ImportValidationModal";
import { useBulkSelection } from "../../../shared/hooks/useBulkSelection";
import { Plus, Pencil, Trash2, FileCheck, FileX, Trash, Download, History, Upload, FileJson } from "lucide-react";
import type { Post } from "../../../types/cms-types";
import ErrorBoundary from "../../../shared/components/ErrorBoundary";
import { useToast } from "@/hooks/use-toast";
import { exportToCSV } from "../../../shared/utils/exportCSV";
import { RevisionsDiff } from "../components/posts/RevisionsDiff";
import { logger } from "../../../shared/utils/logger";

export default function AdminPosts() {
  const backend = useBackend();
  const { toast } = useToast();
  
  // Use Convex query for real-time data
  const postsData = useQuery(api.features.cmsLite.posts.api.queries.listAllPosts, {});
  const posts = postsData?.posts || [];
  const loading = postsData === undefined;
  
  const [error, setError] = useState<Error | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingPost, setEditingPost] = useState<any>(null);
  const [isRevisionsOpen, setIsRevisionsOpen] = useState(false);
  const [revisions, setRevisions] = useState<any[]>([]);
  const [selectedPostId, setSelectedPostId] = useState<number | string | null>(null);
  const { selectedIds, isSelected, toggleSelection, selectAll, clearSelection, hasSelection, selectedCount } = useBulkSelection<any>();
  const [bulkActionLoading, setBulkActionLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [importModalOpen, setImportModalOpen] = useState(false);
  const [importData, setImportData] = useState<any[]>([]);

  const handleCreate = () => {
    setEditingPost(null);
    setIsFormOpen(true);
  };

  const handleEdit = (post: any) => {
    setEditingPost(post);
    setIsFormOpen(true);
  };

  const handleViewRevisions = async (post: any) => {
    try {
      const res = await backend.posts.getRevisions({ postId: post.id as any });
      setRevisions(res.revisions);
      setSelectedPostId(post.id as any);
      setIsRevisionsOpen(true);
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      console.error(err);
      toast({
        title: "Failed to load revisions",
        description: message || "An error occurred.",
        variant: "destructive",
      });
    }
  };

  const handleRestoreRevision = async (revisionId: number) => {
    if (!selectedPostId) return;

    try {
      await backend.posts.restoreRevision({ postId: selectedPostId, revisionId });
      toast({ title: "Revision restored successfully" });
      // Data will automatically refresh via Convex real-time query
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      console.error(err);
      toast({
        title: "Failed to restore revision",
        description: message || "An error occurred.",
        variant: "destructive",
      });
      throw err;
    }
  };

  const handleSave = async (data: PostFormData) => {
    try {
      if (data.id) {
        await backend.posts.update({
          id: data.id,
          slug: data.slug,
          locale: data.locale,
          title: data.title,
          excerpt: data.excerpt,
          body: data.body,
          coverImage: data.coverImage,
          publishedAt: data.publishedAt,
          status: data.status,
        });
        toast({ title: "Post updated successfully" });
      } else {
        await backend.posts.create({
          slug: data.slug,
          locale: data.locale,
          title: data.title,
          excerpt: data.excerpt,
          body: data.body,
          coverImage: data.coverImage,
          publishedAt: data.status === "published" && !data.publishedAt ? new Date() : data.publishedAt,
          status: data.status,
        });
        toast({ title: "Post created successfully" });
      }
      // Data will automatically refresh via Convex real-time query
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      console.error(err);
      if (message.includes("already exists")) {
        toast({
          title: "Duplicate slug",
          description: "This slug and language combination is already used. Please choose a different slug or language.",
          variant: "destructive",
        });
      } else {
        toast({
          title: "Failed to save",
          description: message || "An error occurred while saving.",
          variant: "destructive",
        });
      }
      throw err;
    }
  };

  const handleDelete = async (id: number | string) => {
    if (!confirm("Are you sure you want to delete this post?")) return;

    logger.delete("post", "database/posts table", id);
    try {
      await backend.posts.deletePost({ id: id as any });
      logger.deleted("post", "database/posts table");
      toast({ title: "Post deleted successfully" });
      // Data will automatically refresh via Convex real-time query
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      logger.error("menghapus", "post", err);
      toast({
        title: "Failed to delete",
        description: message || "An error occurred.",
        variant: "destructive",
      });
    }
  };

  const handleExportCSV = () => {
    const selectedPosts = posts.filter((p: any) => selectedIds.has(p.id));
    const dataToExport = selectedPosts.length > 0 ? selectedPosts : posts;

    exportToCSV(
      dataToExport as any,
      `posts-export-${new Date().toISOString().split("T")[0]}`,
      [
        { key: "id", label: "ID" },
        { key: "title", label: "Title" },
        { key: "slug", label: "Slug" },
        { key: "locale", label: "Language" },
        { key: "status", label: "Status" },
        { key: "excerpt", label: "Excerpt" },
        { key: "publishedAt", label: "Published Date" },
      ]
    );

    toast({ title: `Exported ${dataToExport.length} post(s) to CSV` });
  };

  const handleBulkAction = async (action: "publish" | "unpublish" | "delete") => {
    if (action === "delete" && !confirm(`Are you sure you want to delete ${selectedCount} post(s)?`)) {
      return;
    }

    setBulkActionLoading(true);
    try {
      await backend.posts.bulkUpdate({
        ids: Array.from(selectedIds),
        action,
      });
      toast({ title: `Posts ${action === "delete" ? "deleted" : action === "publish" ? "published" : "unpublished"} successfully` });
      clearSelection();
      // Data will automatically refresh via Convex real-time query
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      console.error(err);
      toast({
        title: `Failed to ${action}`,
        description: message || "An error occurred.",
        variant: "destructive",
      });
    } finally {
      setBulkActionLoading(false);
    }
  };

  const handleExportJSON = async () => {
    try {
      const ids = selectedIds.size > 0 ? Array.from(selectedIds) as number[] : undefined;
      const res = await backend.posts.exportJSON({ ids });
      const json = JSON.stringify(res.data, null, 2);
      const blob = new Blob([json], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `posts-export-${new Date().toISOString().split("T")[0]}.json`;
      a.click();
      URL.revokeObjectURL(url);
      toast({ title: `Exported ${res.data.length} post(s) to JSON` });
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      console.error(err);
      toast({
        title: "Export failed",
        description: message || "An error occurred.",
        variant: "destructive",
      });
    }
  };

  const handleImportJSON = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const text = await file.text();
      const data = JSON.parse(text);
      
      if (!Array.isArray(data)) {
        toast({
          title: "Invalid JSON format",
          description: "The JSON file must contain an array of posts.",
          variant: "destructive",
        });
        return;
      }

      setImportData(data);
      setImportModalOpen(true);
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      console.error(err);
      toast({
        title: "Import failed",
        description: message || "Failed to parse JSON file.",
        variant: "destructive",
      });
    } finally {
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const handleConfirmImport = async (selectedItems: any[]) => {
    try {
      const res = await backend.posts.importJSON({ data: selectedItems });
      toast({ title: `Imported ${res.imported} post(s) successfully` });
      setImportModalOpen(false);
      setImportData([]);
      // Data will automatically refresh via Convex real-time query
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      console.error(err);
      toast({
        title: "Import failed",
        description: message || "Failed to import posts.",
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return (
      <div>
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">Blog Posts</h1>
        </div>
        <SkeletonTable rows={8} columns={5} />
      </div>
    );
  }

  if (error) {
    return <ErrorState onRetry={() => setError(null)} />;
  }

  return (
    <ErrorBoundary>
      <div>
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold">Blog Posts</h1>
          {hasSelection && (
            <p className="text-sm text-foreground/60 mt-1">
              {selectedCount} post{selectedCount > 1 ? 's' : ''} selected
            </p>
          )}
        </div>
        <div className="flex gap-2">
          {hasSelection ? (
            <>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => handleBulkAction("publish")}
                isLoading={bulkActionLoading}
              >
                <FileCheck className="w-4 h-4" />
                Publish
              </Button>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => handleBulkAction("unpublish")}
                isLoading={bulkActionLoading}
              >
                <FileX className="w-4 h-4" />
                Unpublish
              </Button>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => handleBulkAction("delete")}
                isLoading={bulkActionLoading}
              >
                <Trash className="w-4 h-4 text-red-600" />
                Delete
              </Button>
              <Button
                size="sm"
                variant="ghost"
                onClick={handleExportCSV}
              >
                <Download className="w-4 h-4" />
                CSV
              </Button>
              <Button
                size="sm"
                variant="ghost"
                onClick={handleExportJSON}
              >
                <FileJson className="w-4 h-4" />
                JSON
              </Button>
              <Button size="sm" variant="secondary" onClick={clearSelection}>
                Clear
              </Button>
            </>
          ) : (
            <>
              <Button size="sm" variant="ghost" onClick={handleImportJSON}>
                <Upload className="w-4 h-4" />
                Import
              </Button>
              <Button size="sm" variant="ghost" onClick={handleExportJSON}>
                <FileJson className="w-4 h-4" />
                Export
              </Button>
              <Button onClick={handleCreate}>
                <Plus className="w-4 h-4" />
                Create Post
              </Button>
            </>
          )}
        </div>
      </div>
      {/* @dod:skip-primitive reason="cms-lite admin posts JSON import is parsed client-side via FileReader for bulk-import preview; not a Convex storage upload" */}
      <input
        ref={fileInputRef}
        type="file"
        accept=".json"
        onChange={handleFileChange}
        className="hidden"
      />

      {posts.length === 0 ? (
        <EmptyState
          title="No blog posts yet"
          description="Create posts in multiple languages (ID, EN, AR) to engage with your audience"
          action={
            <Button onClick={handleCreate}>
              Create your first post
            </Button>
          }
        />
      ) : (
        <AdminList
          rows={posts as any[]}
          columns={[
            {
              key: "title",
              label: "Post",
              sortable: true,
              render: (post: any) => (
                <div className="flex items-center gap-3">
                  {post.coverImage && (
                    <Image
                      src={post.coverImage}
                      alt={post.title}
                      width={48}
                      height={48}
                      className="w-12 h-12 rounded object-cover"
                      sizes="48px"
                    />
                  )}
                  <div>
                    <p className="font-medium">{post.title}</p>
                    <p className="text-sm text-foreground/60">{post.slug}</p>
                  </div>
                </div>
              ),
            },
            {
              key: "locale",
              label: "Language",
              sortable: true,
              render: (post: any) => (
                <span className="px-2 py-1 bg-muted rounded text-xs">
                  {post.locale?.toUpperCase() || 'EN'}
                </span>
              ),
            },
            {
              key: "status",
              label: "Status",
              sortable: true,
              render: (post: any) => (
                <span
                  className={`px-2 py-1 rounded text-xs ${
                    post.status === "published"
                      ? "bg-green-100 text-green-800"
                      : "bg-yellow-100 text-yellow-800"
                  }`}
                >
                  {post.status}
                </span>
              ),
            },
          ]}
          getRowId={(post: any) => post.id}
          selectable
          selectedIds={selectedIds}
          onToggleSelection={(id) => toggleSelection(id as any)}
          onSelectAll={() => selectAll(posts as any)}
          onClearSelection={clearSelection}
          hasSelection={hasSelection}
          rowActions={(post: any) => (
            <>
              <Button aria-label="Edit"
                size="sm"
                variant="ghost"
                onClick={() => handleEdit(post as any)}
              >
                <Pencil className="w-4 h-4" />
              </Button>
              <Button aria-label="History"
                size="sm"
                variant="ghost"
                onClick={() => handleViewRevisions(post as any)}
              >
                <History className="w-4 h-4" />
              </Button>
              <Button aria-label="Delete"
                size="sm"
                variant="ghost"
                onClick={() => handleDelete(post.id)}
              >
                <Trash2 className="w-4 h-4 text-red-600" />
              </Button>
            </>
          )}
        />
      )}

      <PostForm
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        onSave={handleSave}
        post={editingPost}
      />

      <RevisionsDiff
        isOpen={isRevisionsOpen}
        onClose={() => setIsRevisionsOpen(false)}
        revisions={revisions}
        onRestore={handleRestoreRevision}
      />

      <ImportValidationModal
        isOpen={importModalOpen}
        onClose={() => {
          setImportModalOpen(false);
          setImportData([]);
        }}
        onConfirm={handleConfirmImport}
        items={importData}
        entityType="post"
      />
      </div>
    </ErrorBoundary>
  );
}

