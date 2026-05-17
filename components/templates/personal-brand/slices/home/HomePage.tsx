"use client";

import * as React from "react";
import { usePortfolio, usePublishedPosts, useServices } from "../../shared/store";
import { NewsletterBlock } from "./NewsletterBlock";
import { Hero } from "./Hero";
import {
  FeaturedPosts,
  PortfolioStrip,
  ServicesBand,
  StatsStrip,
  TestimonialsGrid,
} from "./HomeSections";

export function HomePage() {
  const posts = usePublishedPosts().slice(0, 3);
  const portfolio = usePortfolio().slice(0, 4);
  const services = useServices();

  return (
    <>
      <Hero />
      <StatsStrip />
      <FeaturedPosts posts={posts} />
      <PortfolioStrip items={portfolio} />
      <ServicesBand services={services} />
      <TestimonialsGrid />
      <NewsletterBlock />
    </>
  );
}
