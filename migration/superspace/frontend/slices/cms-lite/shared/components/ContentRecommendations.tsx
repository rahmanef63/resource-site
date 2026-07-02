"use client";

import { useState, useEffect } from "react";
import { useBackend } from "../hooks/useBackend";
import { ArrowRight } from "lucide-react";
import { LazyImage } from "./LazyImage";
import { Loading } from "./Loading";

interface Recommendation {
  type: "post" | "portfolio";
  id: string;
  title: string;
  excerpt: string;
  url: string;
  imageUrl?: string;
}

interface ContentRecommendationsProps {
  contentId: string;
  contentType: "post" | "portfolio";
  locale: string;
}

export default function ContentRecommendations({ contentId, contentType, locale }: ContentRecommendationsProps) {
  const backend = useBackend();
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadRecommendations();
  }, [contentId, contentType, locale]);

  const loadRecommendations = async () => {
    try {
      setLoading(true);
      const res = await backend.ai.recommend({ contentId, contentType, locale });
      setRecommendations(res.recommendations);
    } catch (err) {
      console.error("Failed to load recommendations:", err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="py-8">
        <Loading />
      </div>
    );
  }

  if (recommendations.length === 0) {
    return null;
  }

  return (
    <div className="py-12 border-t">
      <h2 className="text-2xl font-bold mb-6">Related Content</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {recommendations.map((item) => (
          <a
            key={item.id}
            href={item.url}
            className="group block bg-white dark:bg-gray-800 rounded-lg border overflow-hidden hover:shadow-lg transition-shadow"
          >
            {item.imageUrl && (
              <div className="aspect-video overflow-hidden">
                <LazyImage
                  src={item.imageUrl}
                  alt={item.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
              </div>
            )}
            <div className="p-4">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-xs px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded">
                  {item.type === "post" ? "Blog" : "Portfolio"}
                </span>
              </div>
              <h3 className="font-semibold mb-2 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                {item.title}
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2 mb-3">
                {item.excerpt}
              </p>
              <div className="flex items-center text-sm font-medium text-blue-600 dark:text-blue-400">
                Read more
                <ArrowRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
              </div>
            </div>
          </a>
        ))}
      </div>
    </div>
  );
}


