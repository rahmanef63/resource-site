"use client";

import { useState } from "react";
import Link from "next/link";
import { Package, FileText, Image, Activity, TrendingUp } from "lucide-react";
import { useQuery } from "convex/react";
import { api } from "@convex/_generated/api";
import { Loading } from "../../../shared/components/Loading";
import { SearchBar } from "../components/SearchBar";

type FilterType = "all" | "product" | "post" | "portfolio";
type FilterStatus = "all" | "published" | "draft";

export default function AdminDashboard() {
  const [searchQuery, setSearchQuery] = useState("");
  const [filterType, setFilterType] = useState<FilterType>("all");
  const [filterStatus, setFilterStatus] = useState<FilterStatus>("all");

  // Direct Convex queries — reactive, no useEffect/setState needed
  // These use requireAdmin(ctx) internally and don't need a workspaceId param
  const products  = useQuery(api.features.cmsLite.products.api.queries.listAllProducts,  {});
  const posts     = useQuery(api.features.cmsLite.posts.api.queries.listAllPosts,         {});
  const portfolio = useQuery(api.features.cmsLite.portfolio.api.queries.listAllPortfolio, {});

  const loading = products === undefined || posts === undefined || portfolio === undefined;

  if (loading) return <Loading />;

  // Derived stats — computed inline, no separate state
  const stats = {
    totalProducts:      products.products.length,
    totalPosts:         posts.posts.length,
    totalPortfolio:     portfolio.items.length,
    publishedProducts:  products.products.filter((p: any) => p.status === "published").length,
    publishedPosts:     posts.posts.filter((p: any) => p.status === "published").length,
    publishedPortfolio: portfolio.items.filter((p: any) => p.status === "published").length,
    draftProducts:      products.products.filter((p: any) => p.status === "draft").length,
    draftPosts:         posts.posts.filter((p: any) => p.status === "draft").length,
    draftPortfolio:     portfolio.items.filter((p: any) => p.status === "draft").length,
  };

  // Build combined recent list and apply filters inline
  const recent = [
    ...products.products.map((p: any) => ({
      id: p.id,
      title: p.titleEn || p.titleId || p.titleAr,
      type: "product" as const,
      status: p.status,
      sortKey: p.updatedAt || p.createdAt,
    })),
    ...posts.posts.map((p: any) => ({
      id: p.id,
      title: p.title,
      type: "post" as const,
      status: p.status,
      sortKey: p.updatedAt || p.createdAt,
    })),
    ...portfolio.items.map((p: any) => ({
      id: p.id,
      title: p.title,
      type: "portfolio" as const,
      status: p.status,
      sortKey: p.updatedAt || p.createdAt,
    })),
  ]
    .sort((a, b) => new Date(b.sortKey).getTime() - new Date(a.sortKey).getTime())
    .slice(0, 20);

  const filteredItems = recent.filter((item) => {
    if (searchQuery && !item.title.toLowerCase().includes(searchQuery.toLowerCase())) return false;
    if (filterType !== "all" && item.type !== filterType) return false;
    if (filterStatus !== "all" && item.status !== filterStatus) return false;
    return true;
  });

  const statCards = [
    {
      title: "Products",
      total: stats.totalProducts,
      published: stats.publishedProducts,
      draft: stats.draftProducts,
      icon: Package,
      link: "/admin/products",
      color: "bg-blue-500/10 text-blue-500",
    },
    {
      title: "Blog Posts",
      total: stats.totalPosts,
      published: stats.publishedPosts,
      draft: stats.draftPosts,
      icon: FileText,
      link: "/admin/posts",
      color: "bg-green-500/10 text-green-500",
    },
    {
      title: "Portfolio",
      total: stats.totalPortfolio,
      published: stats.publishedPortfolio,
      draft: stats.draftPortfolio,
      icon: Image,
      link: "/admin/portfolio",
      color: "bg-purple-500/10 text-purple-500",
    },
  ];

  return (
    <div>
      <div className="flex items-center gap-3 mb-8">
        <TrendingUp className="w-8 h-8" />
        <h1 className="text-3xl font-bold">Dashboard</h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {statCards.map((card) => {
          const Icon = card.icon;
          return (
            <Link
              key={card.link}
              href={card.link}
              className="border rounded-lg p-6 hover:shadow-lg transition-all hover:scale-[1.02]"
            >
              <div className="flex items-center gap-3 mb-4">
                <div className={`p-3 rounded-lg ${card.color}`}>
                  <Icon className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-semibold">{card.title}</h3>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-foreground/70">Total</span>
                  <span className="font-semibold">{card.total}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-foreground/70">Published</span>
                  <span className="font-semibold text-green-600">{card.published}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-foreground/70">Draft</span>
                  <span className="font-semibold text-yellow-600">{card.draft}</span>
                </div>
              </div>
            </Link>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="border rounded-lg p-6">
          <div className="flex items-center gap-3 mb-4">
            <Activity className="w-5 h-5" />
            <h2 className="text-xl font-semibold">Quick Stats</h2>
          </div>
          <div className="space-y-3">
            <div className="flex items-center justify-between py-2 border-b">
              <span className="text-foreground/70">Total Content Items</span>
              <span className="font-semibold">
                {stats.totalProducts + stats.totalPosts + stats.totalPortfolio}
              </span>
            </div>
            <div className="flex items-center justify-between py-2 border-b">
              <span className="text-foreground/70">Total Published</span>
              <span className="font-semibold text-green-600">
                {stats.publishedProducts + stats.publishedPosts + stats.publishedPortfolio}
              </span>
            </div>
            <div className="flex items-center justify-between py-2">
              <span className="text-foreground/70">Total Drafts</span>
              <span className="font-semibold text-yellow-600">
                {stats.draftProducts + stats.draftPosts + stats.draftPortfolio}
              </span>
            </div>
          </div>
        </div>

        <div className="border rounded-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <Activity className="w-5 h-5" />
              <h2 className="text-xl font-semibold">Recent Activity</h2>
            </div>
            <span className="text-sm text-foreground/60">{filteredItems.length} items</span>
          </div>

          <div className="space-y-3 mb-4">
            <SearchBar onSearch={setSearchQuery} placeholder="Search recent items..." />

            <div className="flex gap-2">
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value as FilterType)}
                className="px-3 py-2 border rounded-lg text-sm bg-background"
              >
                <option value="all">All Types</option>
                <option value="product">Products</option>
                <option value="post">Posts</option>
                <option value="portfolio">Portfolio</option>
              </select>

              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value as FilterStatus)}
                className="px-3 py-2 border rounded-lg text-sm bg-background"
              >
                <option value="all">All Status</option>
                <option value="published">Published</option>
                <option value="draft">Draft</option>
              </select>
            </div>
          </div>

          <div className="space-y-2 max-h-96 overflow-y-auto">
            {filteredItems.length === 0 ? (
              <p className="text-sm text-foreground/60 text-center py-4">No items found</p>
            ) : (
              filteredItems.map((item) => (
                <Link
                  key={`${item.type}-${item.id}`}
                  href={`/admin/${item.type === "post" ? "posts" : item.type === "product" ? "products" : "portfolio"}`}
                  className="block p-3 border rounded-lg hover:bg-muted/50 transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <p className="font-medium text-sm">{item.title}</p>
                      <div className="flex gap-2 mt-1">
                        <span
                          className={`text-xs px-2 py-0.5 rounded ${
                            item.type === "product"
                              ? "bg-blue-500/10 text-blue-500"
                              : item.type === "post"
                              ? "bg-green-500/10 text-green-500"
                              : "bg-purple-500/10 text-purple-500"
                          }`}
                        >
                          {item.type}
                        </span>
                        <span
                          className={`text-xs px-2 py-0.5 rounded ${
                            item.status === "published"
                              ? "bg-green-100 text-green-800"
                              : "bg-yellow-100 text-yellow-800"
                          }`}
                        >
                          {item.status}
                        </span>
                      </div>
                    </div>
                  </div>
                </Link>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
