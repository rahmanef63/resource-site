"use client";

import { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useUnifiedWorkspaceContext } from "@/frontend/shared/foundation/provider/UnifiedWorkspaceContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Plus, Pencil, Trash2, Eye, EyeOff } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function PagesManager() {
  const { toast } = useToast();
  const { workspaceId } = useUnifiedWorkspaceContext();
  const [isCreating, setIsCreating] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  
  // Form state
  const [formData, setFormData] = useState({
    slug: "",
    locale: "en",
    pageType: "custom" as any,
    title: "",
    description: "",
    metaTitle: "",
    metaDescription: "",
    isPublished: false,
    displayOrder: 0,
  });
  
  // Queries
  const pagesData = useQuery(api.features.cmsLite.pages.api.queries.listPages, {});
  const pages = pagesData?.pages ?? [];
  
  // Mutations
  const createPage = useMutation(api.features.cmsLite.pages.api.mutations.createPage);
  const updatePage = useMutation(api.features.cmsLite.pages.api.mutations.updatePage);
  const deletePage = useMutation(api.features.cmsLite.pages.api.mutations.deletePage);
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!workspaceId) {
      toast({ title: "Error", description: "No active workspace", variant: "destructive" });
      return;
    }
    try {
      if (editingId) {
        await updatePage({
          workspaceId: workspaceId,
          pageId: editingId as any,
          ...formData,
        });
        toast({
          title: "Success",
          description: "Page updated successfully",
        });
        setEditingId(null);
      } else {
        await createPage({ workspaceId: workspaceId, ...formData });
        toast({
          title: "Success",
          description: "Page created successfully",
        });
        setIsCreating(false);
      }
      
      // Reset form
      setFormData({
        slug: "",
        locale: "en",
        pageType: "custom",
        title: "",
        description: "",
        metaTitle: "",
        metaDescription: "",
        isPublished: false,
        displayOrder: 0,
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      toast({
        title: "Error",
        description: message,
        variant: "destructive",
      });
    }
  };

  const handleEdit = (page: any) => {
    setFormData({
      slug: page.slug,
      locale: page.locale,
      pageType: page.pageType,
      title: page.title,
      description: page.description ?? "",
      metaTitle: page.metaTitle ?? "",
      metaDescription: page.metaDescription ?? "",
      isPublished: page.isPublished,
      displayOrder: page.displayOrder ?? 0,
    });
    setEditingId(page._id);
    setIsCreating(true);
  };
  
  const handleDelete = async (pageId: string) => {
    if (!confirm("Are you sure you want to delete this page?")) return;
    if (!workspaceId) {
      toast({ title: "Error", description: "No active workspace", variant: "destructive" });
      return;
    }
    try {
      await deletePage({ workspaceId: workspaceId, pageId: pageId as any });
      toast({
        title: "Success",
        description: "Page deleted successfully",
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      toast({
        title: "Error",
        description: message,
        variant: "destructive",
      });
    }
  };
  
  const pageTypes = [
    { value: "home", label: "Home Page" },
    { value: "about", label: "About Page" },
    { value: "products", label: "Products Page" },
    { value: "product-detail", label: "Product Detail" },
    { value: "blog", label: "Blog Page" },
    { value: "blog-post", label: "Blog Post" },
    { value: "portfolio", label: "Portfolio Page" },
    { value: "hello", label: "Hello/Quick Links" },
    { value: "custom", label: "Custom Page" },
  ];
  
  const locales = [
    { value: "en", label: "English" },
    { value: "id", label: "Indonesian" },
    { value: "ar", label: "Arabic" },
    { value: "ru", label: "Russian" },
    { value: "es", label: "Spanish" },
    { value: "fr", label: "French" },
    { value: "de", label: "German" },
    { value: "zh", label: "Chinese" },
    { value: "ja", label: "Japanese" },
    { value: "ko", label: "Korean" },
  ];
  
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold">Pages Manager</h2>
          <p className="text-foreground/60">
            Create and manage pages with multi-language support
          </p>
        </div>
        <Button
          onClick={() => {
            setIsCreating(!isCreating);
            if (isCreating) {
              setEditingId(null);
              setFormData({
                slug: "",
                locale: "en",
                pageType: "custom",
                title: "",
                description: "",
                metaTitle: "",
                metaDescription: "",
                isPublished: false,
                displayOrder: 0,
              });
            }
          }}
        >
          <Plus className="w-4 h-4 mr-2" />
          {isCreating ? "Cancel" : "New Page"}
        </Button>
      </div>
      
      {isCreating && (
        <Card>
          <CardHeader>
            <CardTitle>{editingId ? "Edit Page" : "Create New Page"}</CardTitle>
            <CardDescription>
              Add pages in any language (English, Arabic, Russian, etc.)
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="slug">Slug (URL) *</Label>
                  <Input
                    id="slug"
                    value={formData.slug}
                    onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                    placeholder="hello, مرحبا, привет, halo"
                    required
                  />
                  <p className="text-sm text-foreground/60 mt-1">
                    Can be in any language
                  </p>
                </div>
                
                <div>
                  <Label htmlFor="locale">Language</Label>
                  <Select
                    value={formData.locale}
                    onValueChange={(value) => setFormData({ ...formData, locale: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {locales.map((locale) => (
                        <SelectItem key={locale.value} value={locale.value}>
                          {locale.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="pageType">Page Type *</Label>
                  <Select
                    value={formData.pageType}
                    onValueChange={(value) => setFormData({ ...formData, pageType: value as any })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {pageTypes.map((type) => (
                        <SelectItem key={type.value} value={type.value}>
                          {type.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <Label htmlFor="displayOrder">Display Order</Label>
                  <Input
                    id="displayOrder"
                    type="number"
                    value={formData.displayOrder}
                    onChange={(e) => setFormData({ ...formData, displayOrder: parseInt(e.target.value) || 0 })}
                  />
                </div>
              </div>
              
              <div>
                <Label htmlFor="title">Title *</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  required
                />
              </div>
              
              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={3}
                />
              </div>
              
              <div>
                <Label htmlFor="metaTitle">Meta Title (SEO)</Label>
                <Input
                  id="metaTitle"
                  value={formData.metaTitle}
                  onChange={(e) => setFormData({ ...formData, metaTitle: e.target.value })}
                />
              </div>
              
              <div>
                <Label htmlFor="metaDescription">Meta Description (SEO)</Label>
                <Textarea
                  id="metaDescription"
                  value={formData.metaDescription}
                  onChange={(e) => setFormData({ ...formData, metaDescription: e.target.value })}
                  rows={2}
                />
              </div>
              
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="isPublished"
                  checked={formData.isPublished}
                  onChange={(e) => setFormData({ ...formData, isPublished: e.target.checked })}
                  className="w-4 h-4"
                />
                <Label htmlFor="isPublished">Published (visible to public)</Label>
              </div>
              
              <div className="flex gap-2">
                <Button type="submit">
                  {editingId ? "Update Page" : "Create Page"}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setIsCreating(false);
                    setEditingId(null);
                  }}
                >
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}
      
      <Card>
        <CardHeader>
          <CardTitle>All Pages ({pages.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Slug</TableHead>
                <TableHead>Title</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Locale</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Order</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {pages.map((page: any) => (
                <TableRow key={page._id}>
                  <TableCell>
                    <code className="text-sm bg-muted px-2 py-1 rounded">
                      /{page.slug}
                    </code>
                  </TableCell>
                  <TableCell className="font-medium">{page.title}</TableCell>
                  <TableCell>
                    <Badge variant="outline">{page.pageType}</Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant="secondary">{page.locale}</Badge>
                  </TableCell>
                  <TableCell>
                    {page.isPublished ? (
                      <Badge className="bg-green-500">
                        <Eye className="w-3 h-3 mr-1" />
                        Published
                      </Badge>
                    ) : (
                      <Badge variant="secondary">
                        <EyeOff className="w-3 h-3 mr-1" />
                        Draft
                      </Badge>
                    )}
                  </TableCell>
                  <TableCell>{page.displayOrder ?? "-"}</TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Button aria-label="Edit"
                        size="sm"
                        variant="ghost"
                        onClick={() => handleEdit(page)}
                      >
                        <Pencil className="w-4 h-4" />
                      </Button>
                      <Button aria-label="Delete"
                        size="sm"
                        variant="ghost"
                        onClick={() => handleDelete(page._id)}
                      >
                        <Trash2 className="w-4 h-4 text-destructive" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
              {pages.length === 0 && (
                <TableRow>
                  <TableCell colSpan={7} className="text-center text-foreground/60 py-8">
                    No pages yet. Create your first page!
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
