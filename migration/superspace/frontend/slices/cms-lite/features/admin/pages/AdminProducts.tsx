import { useState, useRef } from "react";
import { useBackend, useQuery, api } from "../../../shared/hooks/useBackend";
import { useUnifiedWorkspaceContext } from "@/frontend/shared/foundation/provider/UnifiedWorkspaceContext";
import Image from "next/image";
import { Button } from "../../../shared/components/Button";
import { EmptyState } from "../../../shared/components/Loading";
import { ErrorState } from "../../../shared/components/ErrorState";
import { SkeletonTable } from "../../../shared/components/Skeleton";
import { ProductForm, ProductFormData } from "../components/products/ProductForm";
import { AdminList } from "../components/AdminList";
import ImportValidationModal from "../../../shared/components/ImportValidationModal";
import { Plus, Pencil, Trash2, Upload, FileJson } from "lucide-react";
import type { Product } from "../../../types/cms-types";
import ErrorBoundary from "../../../shared/components/ErrorBoundary";
import { useToast } from "@/hooks/use-toast";
import { logger } from "../../../shared/utils/logger";

export default function AdminProducts() {
  const backend = useBackend();
  const { toast } = useToast();
  const { workspaceId } = useUnifiedWorkspaceContext();
  
  // Use Convex query for real-time data
  const productsData = useQuery(api.features.cmsLite.products.api.queries.listAllProducts, {});
  const products = productsData?.products || [];
  const loading = productsData === undefined;
  
  const [error, setError] = useState<Error | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [importModalOpen, setImportModalOpen] = useState(false);
  const [importData, setImportData] = useState<any[]>([]);

  const handleCreate = () => {
    setEditingProduct(null);
    setIsFormOpen(true);
  };

  const handleEdit = (product: Product) => {
    setEditingProduct(product);
    setIsFormOpen(true);
  };

  const handleSave = async (data: ProductFormData) => {
    try {
      if (data.id) {
        await backend.products.update({
          id: data.id,
          slug: data.slug,
          titleId: data.titleId,
          titleEn: data.titleEn,
          titleAr: data.titleAr,
          descId: data.descId,
          descEn: data.descEn,
          descAr: data.descAr,
          price: data.price,
          currency: data.currency,
          paymentLink: data.paymentLink,
          coverImage: data.coverImage,
          status: data.status,
        });
        toast({ title: "Product updated successfully" });
      } else {
        await backend.products.create({
          slug: data.slug,
          titleId: data.titleId,
          titleEn: data.titleEn,
          titleAr: data.titleAr,
          descId: data.descId,
          descEn: data.descEn,
          descAr: data.descAr,
          price: data.price,
          currency: data.currency,
          paymentLink: data.paymentLink,
          coverImage: data.coverImage,
          status: data.status,
        });
        toast({ title: "Product created successfully" });
      }
      // Data will automatically refresh via Convex real-time query
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      console.error(err);
      if (message.includes("already exists")) {
        toast({
          title: "Duplicate slug",
          description: "This slug is already used. Please choose a different one.",
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
    if (!confirm("Are you sure you want to delete this product?")) return;

    logger.delete("product", "database/products table", id);
    try {
      await backend.products.delete({ id });
      logger.deleted("product", "database/products table");
      toast({ title: "Product deleted successfully" });
      // Data will automatically refresh via Convex real-time query
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      logger.error("menghapus", "product", err);
      toast({
        title: "Failed to delete",
        description: message || "An error occurred.",
        variant: "destructive",
      });
    }
  };

  const handleExportJSON = async () => {
    logger.export("products", "file JSON");
    try {
      const res = await backend.products.exportJSON({});
      const json = JSON.stringify(res.data, null, 2);
      const blob = new Blob([json], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      const fileName = `products-export-${new Date().toISOString().split("T")[0]}.json`;
      a.download = fileName;
      a.click();
      URL.revokeObjectURL(url);
      logger.exported("products", res.data.length);
      toast({ title: `Exported ${res.data.length} product(s) to JSON` });
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      logger.error("ekspor", "products", err);
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
          description: "The JSON file must contain an array of products.",
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
    if (!workspaceId) {
      toast({ title: "No active workspace", variant: "destructive" });
      return;
    }
    try {
      const res = await backend.products.importJSON({ workspaceId, data: selectedItems });
      toast({ title: `Imported ${res.imported} product(s) successfully` });
      setImportModalOpen(false);
      setImportData([]);
      // Data will automatically refresh via Convex real-time query
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      console.error(err);
      toast({
        title: "Import failed",
        description: message || "Failed to import products.",
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return (
      <div>
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">Products</h1>
        </div>
        <SkeletonTable rows={6} columns={4} />
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
        <h1 className="text-3xl font-bold">Products</h1>
        <div className="flex gap-2">
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
            Add Product
          </Button>
        </div>
      </div>
      {/* @dod:skip-primitive reason="cms-lite admin products JSON import is parsed client-side via FileReader for bulk-import preview; not a Convex storage upload" */}
      <input
        ref={fileInputRef}
        type="file"
        accept=".json"
        onChange={handleFileChange}
        className="hidden"
      />

      {products.length === 0 ? (
        <EmptyState
          title="No products yet"
          description="Create your first product to start selling"
          action={
            <Button onClick={handleCreate}>
              Create your first product
            </Button>
          }
        />
      ) : (
        <AdminList
          rows={products as any[]}
          columns={[
            {
              key: "titleEn",
              label: "Product",
              sortable: true,
              render: (product: any) => (
                <div className="flex items-center gap-3">
                  {product.coverImage && (
                    <Image
                      src={product.coverImage}
                      alt={product.titleEn || product.name}
                      width={48}
                      height={48}
                      className="w-12 h-12 rounded object-cover"
                      sizes="48px"
                    />
                  )}
                  <div>
                    <p className="font-medium">{product.titleEn || product.name}</p>
                    <p className="text-sm text-foreground/60">{product.slug}</p>
                  </div>
                </div>
              ),
            },
            {
              key: "price",
              label: "Price",
              sortable: true,
              render: (product: any) => `${product.currency || 'USD'} ${product.price}`,
            },
            {
              key: "status",
              label: "Status",
              sortable: true,
              render: (product: any) => (
                <span
                  className={`px-2 py-1 rounded text-xs ${
                    product.status === "published"
                      ? "bg-green-100 text-green-800"
                      : "bg-yellow-100 text-yellow-800"
                  }`}
                >
                  {product.status}
                </span>
              ),
            },
          ]}
          getRowId={(product: any) => product.id}
          rowActions={(product: any) => (
            <>
              <Button aria-label="Edit"
                size="sm"
                variant="ghost"
                onClick={() => handleEdit(product)}
              >
                <Pencil className="w-4 h-4" />
              </Button>
              <Button aria-label="Delete"
                size="sm"
                variant="ghost"
                onClick={() => handleDelete(product.id)}
              >
                <Trash2 className="w-4 h-4 text-red-600" />
              </Button>
            </>
          )}
        />
      )}

      <ProductForm
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        onSave={handleSave}
        product={editingProduct}
      />

      <ImportValidationModal
        isOpen={importModalOpen}
        onClose={() => {
          setImportModalOpen(false);
          setImportData([]);
        }}
        onConfirm={handleConfirmImport}
        items={importData}
        entityType="product"
      />
      </div>
    </ErrorBoundary>
  );
}
