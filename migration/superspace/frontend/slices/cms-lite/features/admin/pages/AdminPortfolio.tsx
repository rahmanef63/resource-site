import { useState } from "react";
import { useBackend, useQuery, api } from "../../../shared/hooks/useBackend";
import Image from "next/image";
import { Button } from "../../../shared/components/Button";
import { EmptyState } from "../../../shared/components/Loading";
import { ErrorState } from "../../../shared/components/ErrorState";
import { SkeletonGrid } from "../../../shared/components/Skeleton";
import { PortfolioForm, PortfolioFormData } from "../components/portfolio/PortfolioForm";
import { Plus, Pencil, Trash2, Image as ImageIcon } from "lucide-react";
import type { PortfolioItem } from "../../../types/cms-types";
import ErrorBoundary from "../../../shared/components/ErrorBoundary";
import { useToast } from "@/hooks/use-toast";
import { logger } from "../../../shared/utils/logger";

export default function AdminPortfolio() {
  const backend = useBackend();
  const { toast } = useToast();
  
  // Use Convex query for real-time data
  const portfolioData = useQuery(api.features.cmsLite.portfolio.api.queries.listAllPortfolio, {});
  const items = portfolioData?.items || [];
  const loading = portfolioData === undefined;
  
  const [error, setError] = useState<Error | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<PortfolioItem | null>(null);

  const handleCreate = () => {
    setEditingItem(null);
    setIsFormOpen(true);
  };

  const handleEdit = (item: PortfolioItem) => {
    setEditingItem(item);
    setIsFormOpen(true);
  };

  const handleSave = async (data: PortfolioFormData) => {
    try {
      if (data.id) {
        await backend.portfolio.update({
          id: data.id,
          slug: data.slug,
          locale: data.locale,
          title: data.title,
          description: data.description,
          tags: data.tags,
          images: data.images,
          status: data.status,
        });
        toast({ title: "Portfolio updated successfully" });
      } else {
        await backend.portfolio.create({
          slug: data.slug,
          locale: data.locale,
          title: data.title,
          description: data.description,
          tags: data.tags,
          images: data.images,
          status: data.status,
        });
        toast({ title: "Portfolio created successfully" });
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

  const handleDelete = async (id: number) => {
    if (!confirm("Are you sure you want to delete this portfolio item?")) return;

    logger.delete("portfolio item", "database/portfolio table", id);
    try {
      await backend.portfolio.deletePortfolio({ id });
      logger.deleted("portfolio item", "database/portfolio table");
      toast({ title: "Portfolio deleted successfully" });
      // Data will automatically refresh via Convex real-time query
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      console.error(err);
      toast({
        title: "Failed to delete",
        description: message || "An error occurred.",
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return (
      <div>
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">Portfolio</h1>
        </div>
        <SkeletonGrid count={6} columns={3} />
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
        <h1 className="text-3xl font-bold">Portfolio</h1>
        <Button onClick={handleCreate}>
          <Plus className="w-4 h-4" />
          Add Portfolio Item
        </Button>
      </div>

      {items.length === 0 ? (
        <EmptyState
          title="No portfolio items yet"
          description="Showcase your photography work with beautiful image galleries"
          action={
            <Button onClick={handleCreate}>
              Create your first portfolio
            </Button>
          }
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {items.map((portfolioData) => {
            // portfolioData has structure: {item: {...}, images: [...]}
            const item = portfolioData.item;
            const images = portfolioData.images;
            
            return (
            <div key={item.id} className="border rounded-lg overflow-hidden group">
              <div className="aspect-video bg-muted relative overflow-hidden">
                {images[0] ? (
                  <Image
                    src={images[0].imageUrl}
                    alt={images[0].altText || item.title}
                    fill
                    className="object-cover"
                    sizes="(max-width: 768px) 100vw, 33vw"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <ImageIcon className="w-12 h-12 text-foreground/20" />
                  </div>
                )}
                <div className="absolute top-2 right-2 flex gap-1">
                  <span className="px-2 py-1 bg-black/70 text-white rounded text-xs">
                    {item.locale.toUpperCase()}
                  </span>
                  <span
                    className={`px-2 py-1 rounded text-xs ${
                      item.status === "published"
                        ? "bg-green-600 text-white"
                        : "bg-yellow-600 text-white"
                    }`}
                  >
                    {item.status}
                  </span>
                </div>
              </div>

              <div className="p-4">
                <h3 className="font-semibold mb-1">{item.title}</h3>
                <p className="text-sm text-foreground/60 mb-2">{item.slug}</p>
                <div className="flex items-center gap-2 text-sm text-foreground/60 mb-3">
                  <ImageIcon className="w-4 h-4" />
                  {images.length} image{images.length !== 1 ? "s" : ""}
                </div>

                {item.tags.length > 0 && (
                  <div className="flex gap-1 flex-wrap mb-3">
                    {item.tags.slice(0, 3).map((tag: string) => (
                      <span key={tag} className="px-2 py-0.5 bg-muted rounded text-xs">
                        {tag}
                      </span>
                    ))}
                    {item.tags.length > 3 && (
                      <span className="px-2 py-0.5 text-xs text-foreground/60">
                        +{item.tags.length - 3}
                      </span>
                    )}
                  </div>
                )}

                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="secondary"
                    onClick={() => handleEdit(portfolioData as any)}
                    className="flex-1"
                  >
                    <Pencil className="w-4 h-4" />
                    Edit
                  </Button>
                  <Button aria-label="Delete"
                    size="sm"
                    variant="danger"
                    onClick={() => handleDelete(item.id as any)}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </div>
            );
          })}
        </div>
      )}

      <PortfolioForm
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        onSave={handleSave}
        item={editingItem}
      />
      </div>
    </ErrorBoundary>
  );
}

